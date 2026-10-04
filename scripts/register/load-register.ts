/**
 * scripts/register/load-register.ts
 * ---------------------------------------------------------------------------
 * Loads the Charity Commission's bulk extract into register_charities, the
 * register mirror (migration 20260927150000). Main charities only (linked
 * charities, the subsidiaries, are skipped); Registered and Removed both
 * kept, so a verification can see a removal.
 *
 * Run from apps/web:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/register/load-register.ts
 *     --download            fetch the four zips into --dir first (default:
 *                           use what is already in --dir)
 *     --dir=<path>          where the extracts live (default: ./register-extract)
 *     --dry-run             parse and count, write nothing
 *     --registered-only     skip Removed charities
 *     --skip=<n>            resume: skip the first n main charities (the
 *                           count a failed run last printed as written)
 *
 * A batch that hits the statement timeout (the GIN indexes flush their
 * pending lists mid-load on production) is halved and retried, down to
 * single rows, so one slow flush never ends the run.
 *
 * Every load ends with THE REMOVAL CHECK (check-removals.ts): removal is
 * not staleness, so an account charity that has left the register is
 * reported now rather than on next touch — money points at those
 * accounts. The load itself never fails over it.
 *
 * The extracts are half a gigabyte each, so they are streamed, never
 * JSON.parsed whole: three passes build lookups (classification, areas,
 * objects) and the fourth walks the charity file and upserts in batches.
 * Re-running upserts, so a refresh is the same command.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";
import { checkRemovals, reportRemovals } from "./check-removals";
import { createReadStream, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/StreamArray";

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string, d: string) =>
  args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d;

const DIR = resolve(opt("dir", "register-extract"));
const DRY = flag("dry-run");
const REGISTERED_ONLY = flag("registered-only");
const BATCH = 500;
const SKIP = parseInt(opt("skip", "0"), 10) || 0;

const FILES = [
  "charity",
  "charity_classification",
  "charity_governing_document",
  "charity_area_of_operation",
] as const;
const BASE =
  "https://ccewuksprdoneregsadata1.blob.core.windows.net/data/json/publicextract";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function download() {
  mkdirSync(DIR, { recursive: true });
  for (const f of FILES) {
    const zip = join(DIR, `publicextract.${f}.zip`);
    console.log(`  ↓ ${f}`);
    const res = await fetch(`${BASE}.${f}.zip`);
    if (!res.ok) throw new Error(`${f}: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await import("node:fs/promises").then((fs) => fs.writeFile(zip, buf));
    execFileSync("unzip", ["-oq", zip, "-d", DIR]);
  }
}

/** Walk one extract's JSON array, an object at a time. */
async function each<T>(
  name: (typeof FILES)[number],
  fn: (row: T) => void | Promise<void>,
): Promise<number> {
  const path = join(DIR, `publicextract.${name}.json`);
  if (!existsSync(path)) throw new Error(`missing ${path} (use --download)`);
  let n = 0;
  await new Promise<void>((resolveDone, reject) => {
    const pipeline = chain([
      createReadStream(path),
      parser(),
      streamArray(),
      // an async fn holds the stream until it resolves (stream-chain
      // awaits promises), so the upserts run one at a time
      async (data: { value: T }) => {
        await fn(data.value);
        n++;
        if (n % 100000 === 0) process.stderr.write(`    ${name}: ${n}\n`);
        return null;
      },
    ]);
    // Consume the chain's output, or the stream never flows and the
    // process exits 0 with nothing done.
    pipeline.on("data", () => {});
    pipeline.on("end", resolveDone);
    pipeline.on("error", reject);
  });
  return n;
}

type Row = Record<string, unknown>;
const date = (v: unknown) =>
  typeof v === "string" && v ? v.slice(0, 10) : null;
const str = (v: unknown) =>
  typeof v === "string" && v.trim() ? v.trim() : null;
const int = (v: unknown) => (typeof v === "number" ? Math.round(v) : null);
const bool = (v: unknown) => (typeof v === "boolean" ? v : null);

async function main() {
  if (flag("download")) await download();

  // Pass 1–3: lookups by organisation_number, main charities only.
  const classification = new Map<
    number,
    { what: string[]; who: string[]; how: string[] }
  >();
  const nCls = await each<Row>("charity_classification", (r) => {
    if (r.linked_charity_number !== 0) return;
    const on = r.organisation_number as number;
    const c = classification.get(on) ?? { what: [], who: [], how: [] };
    const key = (r.classification_type as string).toLowerCase() as
      | "what"
      | "who"
      | "how";
    if (c[key] && typeof r.classification_description === "string")
      c[key].push(r.classification_description);
    classification.set(on, c);
  });
  console.log(
    `  classification: ${nCls} rows → ${classification.size} charities`,
  );

  const areas = new Map<number, { type: string; description: string }[]>();
  const nAreas = await each<Row>("charity_area_of_operation", (r) => {
    if (r.linked_charity_number !== 0) return;
    const on = r.organisation_number as number;
    const list = areas.get(on) ?? [];
    if (list.length < 40)
      list.push({
        type: String(r.geographic_area_type ?? ""),
        description: String(r.geographic_area_description ?? ""),
      });
    areas.set(on, list);
  });
  console.log(`  areas: ${nAreas} rows → ${areas.size} charities`);

  const objects = new Map<
    number,
    { objects: string | null; benefit: string | null }
  >();
  const nObj = await each<Row>("charity_governing_document", (r) => {
    if (r.linked_charity_number !== 0) return;
    objects.set(r.organisation_number as number, {
      objects: str(r.charitable_objects),
      benefit: str(r.area_of_benefit),
    });
  });
  console.log(`  objects: ${nObj} rows → ${objects.size} charities`);

  // Pass 4: the charities themselves, upserted in batches.
  const extractDate = { value: null as string | null };
  let batch: Row[] = [];
  let seen = 0;
  let kept = 0;
  let written = 0;
  const upsert = async (rows: Row[]): Promise<void> => {
    const { error } = await supabase
      .from("register_charities")
      .upsert(rows, { onConflict: "registered_number" });
    if (!error) return;
    // 57014: statement timeout. Halve and retry; a single row that still
    // times out is a real fault.
    if (error.code === "57014" && rows.length > 1) {
      const mid = Math.ceil(rows.length / 2);
      await new Promise((r) => setTimeout(r, 1000));
      await upsert(rows.slice(0, mid));
      await upsert(rows.slice(mid));
      return;
    }
    throw new Error(`upsert: ${error.message}`);
  };
  const flush = async () => {
    if (batch.length === 0) return;
    if (!DRY) await upsert(batch);
    written += batch.length;
    batch = [];
    if (written % 10000 < BATCH) console.log(`  … ${written} written`);
  };
  await each<Row>("charity", async (r) => {
    seen++;
    if (r.linked_charity_number !== 0) return;
    const status = String(r.charity_registration_status ?? "");
    if (REGISTERED_ONLY && status !== "Registered") return;
    const on = r.organisation_number as number;
    extractDate.value ??= date(r.date_of_extract);
    const o = objects.get(on);
    const address = [1, 2, 3, 4, 5]
      .map((i) => str(r[`charity_contact_address${i}`]))
      .filter(Boolean)
      .join(", ");
    kept++;
    if (kept <= SKIP) return; // already written by the run being resumed
    batch.push({
      registered_number: r.registered_charity_number,
      organisation_number: on,
      name: String(r.charity_name ?? "").trim(),
      status,
      charity_type: str(r.charity_type),
      registered_on: date(r.date_of_registration),
      removed_on: date(r.date_of_removal),
      is_cio: bool(r.charity_is_cio),
      company_number: str(r.charity_company_registration_number),
      latest_income: int(r.latest_income),
      latest_expenditure: int(r.latest_expenditure),
      financial_year_end: date(r.latest_acc_fin_period_end_date),
      address: address || null,
      postcode: str(r.charity_contact_postcode),
      phone: str(r.charity_contact_phone),
      email: str(r.charity_contact_email),
      website: str(r.charity_contact_web),
      activities: str(r.charity_activities),
      objects: o?.objects ?? null,
      area_of_benefit: o?.benefit ?? null,
      classification: classification.get(on) ?? null,
      areas: areas.get(on) ?? null,
      gift_aid: bool(r.charity_gift_aid),
      has_land: bool(r.charity_has_land),
      extract_date: extractDate.value ?? new Date().toISOString().slice(0, 10),
    });
    if (batch.length >= BATCH) await flush();
  });
  await flush();
  console.log(
    `${DRY ? "would write" : "wrote"} ${written} of ${kept} main charities (${seen} rows in the extract, dated ${extractDate.value})`,
  );
  if (!DRY) {
    // The narrow search copy (migration 20260927170000) follows the table.
    const { error } = await supabase.rpc("refresh_register_search");
    if (error?.code === "57014") {
      // A full refresh outruns the API's statement timeout (production,
      // 2026-09-27). The rows are in; the view is the one step left.
      console.log(
        "the search view refresh timed out — run this in the SQL editor:\n" +
          "  REFRESH MATERIALIZED VIEW register_search_rows;",
      );
    } else if (error) {
      throw new Error(`refresh_register_search: ${error.message}`);
    } else {
      console.log("refreshed register_search_rows");
    }

    // THE REMOVAL CHECK — the standing of every account charity against
    // the register we have just refreshed. Printed, never fatal: the load
    // succeeded, and what it found is a human's call.
    reportRemovals(await checkRemovals(supabase));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
