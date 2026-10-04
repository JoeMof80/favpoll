/**
 * scripts/backfill-charity-image.ts
 * ---------------------------------------------------------------------------
 * Reads a charity's own og:image (or failing that, its favicon) from its
 * homepage and writes it to the PROFILE — image_url, image_source,
 * image_fetched_at (decision 2 of
 * references/charity-profiles-2026-09-27.md).
 *
 * The image is for PRIVATE surfaces only: the page the charity itself is
 * shown at onboarding, and the admin preview. `image_source` is stored
 * beside it so a scraped image is never mistaken for a given one, and a
 * given logo DROPS it rather than sitting beside it.
 *
 * NO MODEL, so no spend and no cap: this is a fetch and a content-type
 * check. One page per charity, and nothing crawled beyond the image URL
 * the page names.
 *
 * Run from apps/web:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/backfill-charity-image.ts
 *     --wave             outreach candidates instead of account charities
 *     --income=<pounds>  the wave's income floor (default 100000)
 *     --limit=<n>        stop after n charities (default 50 for a wave)
 *     --all              re-read charities that already have an image
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";
import { findCharityImage } from "../apps/web/lib/charity-image";

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
const INCOME_FLOOR = Number(opt("income") ?? 100000);
const LIMIT = Number(opt("limit") ?? (WAVE ? 50 : 0)) || 0;

const KEYABLE = /^([0-9]{6,10}(-[0-9]+)?|SC[0-9]{3,6}|NIC[0-9]{3,6})$/;

type Target = { registeredNumber: string; website: string | null };

async function waveTargets(): Promise<Target[]> {
  const { data, error } = await supabase.rpc("charity_outreach_candidates", {
    p_income_floor: INCOME_FLOOR,
    p_limit: LIMIT > 0 ? LIMIT * 5 : 500,
  });
  if (error) throw new Error(`candidates: ${error.message}`);
  return ((data ?? []) as { registered_number: string; website: string }[]).map(
    (r) => ({ registeredNumber: r.registered_number, website: r.website }),
  );
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
    .filter((n) => KEYABLE.test(n));
  if (numbers.length === 0) return [];
  // The site address comes from the mirror, like every other register word.
  const digits = numbers.filter((n) => /^[0-9]+$/.test(n)).map(Number);
  const { data: rows } = await supabase
    .from("register_charities")
    .select("registered_number, website")
    .in("registered_number", digits);
  const site = new Map(
    (
      (rows ?? []) as { registered_number: number; website: string | null }[]
    ).map((r) => [String(r.registered_number), r.website]),
  );
  return numbers.map((n) => ({
    registeredNumber: n,
    website: site.get(n) ?? null,
  }));
}

async function main() {
  let targets = WAVE ? await waveTargets() : await accountTargets();
  targets = targets.filter((t) => t.website);

  if (!ALL && targets.length > 0) {
    // A charity that already has an image is left alone — including one
    // whose logo the charity GAVE us, which must never be overwritten by
    // a scrape.
    const { data: have } = await supabase
      .from("charity_profiles")
      .select("registered_number, image_url")
      .in(
        "registered_number",
        targets.map((t) => t.registeredNumber),
      )
      .not("image_url", "is", null);
    const held = new Set(
      (have ?? []).map((p) => p.registered_number as string),
    );
    targets = targets.filter((t) => !held.has(t.registeredNumber));
  }
  if (LIMIT > 0) targets = targets.slice(0, LIMIT);
  console.log(
    `${targets.length} ${WAVE ? "candidates" : "account charities"} with a site to read`,
  );

  let found = 0;
  for (const target of targets) {
    const image = await findCharityImage(target.website);
    const { error } = await supabase.from("charity_profiles").upsert(
      {
        registered_number: target.registeredNumber,
        image_url: image?.url ?? null,
        image_source: image?.source ?? null,
        image_fetched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "registered_number" },
    );
    if (error) {
      console.error(`  ✗ ${target.registeredNumber}: ${error.message}`);
      continue;
    }
    if (image) {
      found++;
      console.log(
        `  ✓ ${target.registeredNumber}: ${image.source} — ${image.url}`,
      );
    } else {
      console.log(
        `  – ${target.registeredNumber}: nothing on ${target.website}`,
      );
    }
  }
  console.log(`${found} of ${targets.length} had an image`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
