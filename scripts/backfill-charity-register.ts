/**
 * scripts/backfill-charity-register.ts
 * ---------------------------------------------------------------------------
 * Fills charities.objects / areas / grant_making from the Charity
 * Commission register for every charity with a registered number and no
 * objects yet (2026-09-25). New charities capture these at insert.
 * Idempotent: only touches rows where objects IS NULL. Never overwrites
 * activities, classification or a hand-written description.
 * Run (from apps/web, so the Commission client resolves):
 *   pnpm exec tsx --env-file=.env.local ../../scripts/backfill-charity-register.ts
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";
import { fetchRegisterPurpose } from "../apps/web/lib/charity-commission";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(
    /https:\/\/([a-z0-9]+)\./,
  )?.[1];
  console.log(
    `Backfilling register objects, areas and grant flag on ${ref}…\n`,
  );
  const { data: rows, error } = await supabase
    .from("charities")
    .select("id, name, registered_number")
    .not("registered_number", "is", null)
    .is("objects", null);
  if (error) throw new Error(error.message);
  let filled = 0;
  for (const c of rows ?? []) {
    const p = await fetchRegisterPurpose(c.registered_number!);
    if (!p.objects && !p.areas && p.grantMaking === null) {
      console.log(`  –  ${c.name}: nothing on the register`);
      continue;
    }
    const { error: upErr } = await supabase
      .from("charities")
      .update({
        objects: p.objects,
        areas: p.areas,
        grant_making: p.grantMaking,
      })
      .eq("id", c.id);
    if (upErr) {
      console.error(`  ✗  ${c.name}: ${upErr.message}`);
      continue;
    }
    const where = p.areas
      ? p.areas.some((a) => /throughout/i.test(a.area))
        ? "national"
        : p.areas
            .map((a) => a.area)
            .slice(0, 3)
            .join(", ")
      : "—";
    console.log(
      `  ✓  ${c.name}  [${where}${p.grantMaking ? " · grant-maker" : ""}]`,
    );
    filled++;
  }
  console.log(`\nDone — ${filled} filled of ${(rows ?? []).length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
