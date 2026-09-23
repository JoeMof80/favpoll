/**
 * scripts/backfill-charity-purpose.ts
 * ---------------------------------------------------------------------------
 * Fills charities.activities / charities.classification from the Charity
 * Commission register for every charity that has a registered number and no
 * activities yet. New charities capture this at insert (2026-09-23); this is
 * for the rows that predate it.
 *
 * Idempotent: only touches rows where activities IS NULL. Never overwrites a
 * hand-written `description` — that is a different column.
 *
 * Run (from apps/web, so the Commission client resolves):
 *   pnpm exec tsx --env-file=.env.local ../../scripts/backfill-charity-purpose.ts
 * Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and
 * CHARITY_COMMISSION_API_KEY in the env file.
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
  console.log(`Backfilling charity purpose on ${ref}…\n`);

  const { data: rows, error } = await supabase
    .from("charities")
    .select("id, name, registered_number")
    .not("registered_number", "is", null)
    .is("activities", null);
  if (error) throw new Error(error.message);

  let filled = 0;
  let empty = 0;
  for (const c of rows ?? []) {
    const purpose = await fetchRegisterPurpose(c.registered_number!);
    if (!purpose.activities && !purpose.classification) {
      console.log(`  –  ${c.name}: register has no purpose data`);
      empty++;
      continue;
    }
    const { error: upErr } = await supabase
      .from("charities")
      .update({
        activities: purpose.activities,
        classification: purpose.classification,
      })
      .eq("id", c.id);
    if (upErr) {
      console.error(`  ✗  ${c.name}: ${upErr.message}`);
      continue;
    }
    const what = purpose.classification?.what.join(" | ") ?? "—";
    console.log(`  ✓  ${c.name}  [What: ${what}]`);
    filled++;
  }
  console.log(
    `\nDone — ${filled} filled, ${empty} with no register data, ${(rows ?? []).length} considered.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
