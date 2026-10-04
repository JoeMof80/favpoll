/**
 * scripts/backfill-signature-events.ts
 * ---------------------------------------------------------------------------
 * Reads a charity's own website for the fundraising events it already runs
 * and writes them to the PROFILE (charity_profiles.signature_events +
 * website_read_at). Step 2 of references/charity-profiles-2026-09-27.md:
 * a reading of a site is a derivation, never an agreement, so it belongs on
 * the profile and can exist for a charity with no account.
 *
 * The site address comes from the MIRROR, like the rest of the register's
 * words — the copies on `charities` are dropped in step 5.
 *
 * Two audiences, as with the perfect topic: account charities by default,
 * outreach candidates with --wave (the eligibility filter already requires
 * a website, which is most of why it exists — no site means nothing to
 * read and a thin profile).
 *
 * Run from apps/web:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/backfill-signature-events.ts
 *     --wave[=<label>]   candidates instead of accounts
 *     --income=<pounds>  the wave's income floor (default 100000)
 *     --limit=<n>        stop after n charities (default 50 for a wave)
 *     --all              re-read sites already read
 *
 * EXTRACTION, so it runs on the cheap model (decision 4: the saving lives
 * on the summarising work either side of the perfect-topic judgement), and
 * it pays into the same cap.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";
import { profileKey } from "../packages/types";
import { suggestSignatureEvents } from "../apps/web/lib/charity-events";
import { OCCASION_TYPES_BY_REGISTER } from "../apps/web/lib/registers";
import {
  forgetSpendCache,
  spendAvailable,
  spendSummary,
} from "../apps/web/lib/model-spend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const args = process.argv.slice(2);
const flag = (n: string) => args.some((a) => a === `--${n}`);
const opt = (n: string) =>
  args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? null;

const ALL = flag("all");
const WAVE = flag("wave") || opt("wave") !== null;
const WAVE_LABEL = opt("wave");
const INCOME_FLOOR = Number(opt("income") ?? 100000);
const LIMIT = Number(opt("limit") ?? (WAVE ? 50 : 0)) || 0;

type Target = { registeredNumber: string; readAt: string | null };

async function waveTargets(): Promise<Target[]> {
  // A cushion over the limit, because the rows still needing work are
  // filtered here and not in SQL: the function answers "who is eligible",
  // not "who is unfinished". Unlimited is 12,893 rows and more than the
  // API will serialise inside its statement timeout.
  const { data, error } = await supabase.rpc("charity_outreach_candidates", {
    p_income_floor: INCOME_FLOOR,
    p_limit: LIMIT > 0 ? LIMIT * 5 : 500,
  });
  if (error) throw new Error(`candidates: ${error.message}`);
  return (
    (data ?? []) as {
      registered_number: string;
      website_read_at: string | null;
    }[]
  ).map((r) => ({
    registeredNumber: r.registered_number,
    readAt: r.website_read_at,
  }));
}

async function accountTargets(): Promise<Target[]> {
  const { data, error } = await supabase
    .from("charities")
    .select("registered_number")
    .eq("is_active", true)
    .not("registered_number", "is", null)
    .order("name");
  if (error) throw new Error(error.message);
  const numbers = (data ?? [])
    .map((c) => String(c.registered_number).trim().toUpperCase())
    .filter((n) => profileKey(n) !== null);
  if (numbers.length === 0) return [];
  const { data: profiles } = await supabase
    .from("charity_profiles")
    .select("registered_number, website_read_at")
    .in("registered_number", numbers);
  const readAt = new Map(
    (profiles ?? []).map((p) => [
      p.registered_number as string,
      (p.website_read_at as string | null) ?? null,
    ]),
  );
  return numbers.map((n) => ({
    registeredNumber: n,
    readAt: readAt.get(n) ?? null,
  }));
}

type MirrorRow = {
  registered_number: number;
  name: string;
  website: string | null;
  activities: string | null;
};

async function mirrorRows(numbers: string[]): Promise<Map<string, MirrorRow>> {
  const digits = numbers.filter((n) => /^[0-9]+$/.test(n)).map(Number);
  const byNumber = new Map<string, MirrorRow>();
  for (let i = 0; i < digits.length; i += 500) {
    const { data, error } = await supabase
      .from("register_charities")
      .select("registered_number, name, website, activities")
      .in("registered_number", digits.slice(i, i + 500));
    if (error) throw new Error(`mirror: ${error.message}`);
    for (const row of (data ?? []) as MirrorRow[]) {
      byNumber.set(String(row.registered_number), row);
    }
  }
  return byNumber;
}

async function main() {
  const budget = await spendSummary();
  console.log(
    `spend this month: $${budget.spentUsd.toFixed(2)} of $${budget.capUsd.toFixed(2)} (model-spend cap)`,
  );
  if (budget.remainingUsd <= 0) {
    console.log("the cap is reached — no sites will be read");
    return;
  }

  const { data: topics } = await supabase
    .from("topics")
    .select("title")
    .eq("is_active", true);
  const topicTitles = (topics ?? []).map((t) => t.title as string);
  const occasionTypes = [
    ...new Set(Object.values(OCCASION_TYPES_BY_REGISTER).flat()),
  ];

  let targets = WAVE ? await waveTargets() : await accountTargets();
  if (!ALL) targets = targets.filter((t) => !t.readAt);
  if (LIMIT > 0) targets = targets.slice(0, LIMIT);
  console.log(
    `${targets.length} ${WAVE ? "candidates" : "account charities"} with a site to read`,
  );
  if (targets.length === 0) return;

  const mirror = await mirrorRows(targets.map((t) => t.registeredNumber));

  let n = 0;
  for (const target of targets) {
    if (!(await spendAvailable())) {
      console.log("  … the spend cap is reached — stopping here");
      break;
    }
    const row = mirror.get(target.registeredNumber);
    if (!row?.website) {
      console.log(`  – ${row?.name ?? target.registeredNumber}: no site`);
      continue;
    }
    const events = await suggestSignatureEvents({
      name: row.name,
      website: row.website,
      activities: row.activities,
      occasionTypes,
      topicTitles,
      registeredNumber: target.registeredNumber,
      wave: WAVE_LABEL,
    });
    forgetSpendCache();
    const { error: uErr } = await supabase.from("charity_profiles").upsert(
      {
        registered_number: target.registeredNumber,
        signature_events: events.length ? events : null,
        website_read_at: new Date().toISOString(),
        status: "drafted",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "registered_number" },
    );
    if (uErr) console.error(`  ✗ ${row.name}: ${uErr.message}`);
    else {
      n++;
      console.log(
        `  ${events.length ? "✓" : "–"} ${row.name}: ${
          events.length
            ? events
                .map(
                  (e) =>
                    `${e.name} (${e.kind}${e.when ? `, ${e.when}` : ""}${e.occasionType ? ` → ${e.occasionType}` : ""}${e.topic ? ` · ${e.topic}` : ""})`,
                )
                .join("; ")
            : "nothing on the site"
        }`,
      );
    }
  }
  const after = await spendSummary();
  console.log(
    `${n} read · spend now $${after.spentUsd.toFixed(2)} of $${after.capUsd.toFixed(2)}${WAVE_LABEL ? ` · wave "${WAVE_LABEL}"` : ""}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
