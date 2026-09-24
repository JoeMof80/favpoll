/**
 * scripts/backfill-cause-family.ts
 * ---------------------------------------------------------------------------
 * Fills charities.cause_family for the charities that predate the column
 * (references/favpoll-pairing-table §2, 2026-09-24).
 *
 * Two paths, deliberately different:
 *   - The SEEDED charities get their family from the founder-approved table
 *     below, written as CONFIRMED (cause_family). No model involved.
 *   - Every other charity with register `activities` gets a model
 *     SUGGESTION (cause_family_suggested) for an admin to confirm in the
 *     outreach queue. Never written as confirmed.
 *
 * Idempotent: skips rows that already have the relevant value.
 *
 * Run from apps/web (needs the Anthropic SDK and key):
 *   pnpm exec tsx --env-file=.env.local ../../scripts/backfill-cause-family.ts
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";
import type { CauseFamily } from "../packages/types";
import { suggestCauseFamily } from "../apps/web/lib/cause-family";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// references/favpoll-pairing-table-2026-09-23.md §2 — founder-approved.
const CONFIRMED: Record<string, CauseFamily> = {
  "Dogs Trust": "animals",
  RSPCA: "animals",
  WWF: "animals",
  NSPCC: "children",
  Barnardos: "children",
  "Children's Society": "children",
  "Save the Children": "children",
  "Age UK": "older_people",
  "Marie Curie": "end_of_life",
  "Hospice UK": "end_of_life",
  "St Richard's Hospice": "end_of_life",
  "Macmillan Cancer Support": "end_of_life",
  "Alzheimer's Society": "end_of_life",
  "Cancer Research UK": "health_condition",
  "British Heart Foundation": "health_condition",
  "Stroke Association": "health_condition",
  "Diabetes UK": "health_condition",
  RNIB: "health_condition",
  Scope: "health_condition",
  Mind: "mental_health",
  Samaritans: "mental_health",
  Shelter: "homelessness",
  Crisis: "homelessness",
  "St Mungo's": "homelessness",
  "Trussell Trust": "food_poverty",
  "National Trust": "environment_heritage",
  RNLI: "sea_rescue",
  Oxfam: "international",
  "Médecins Sans Frontières": "international",
  "Comic Relief": "entertainment",
};

async function main() {
  const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(
    /https:\/\/([a-z0-9]+)\./,
  )?.[1];
  console.log(`Backfilling cause family on ${ref}…\n`);

  const { data: rows, error } = await supabase
    .from("charities")
    .select(
      "id, name, activities, classification, cause_family, cause_family_suggested",
    );
  if (error) throw new Error(error.message);

  let confirmed = 0;
  let suggested = 0;
  let none = 0;
  for (const c of rows ?? []) {
    const known = CONFIRMED[c.name];
    if (known) {
      if (c.cause_family === known) continue;
      const { error: e } = await supabase
        .from("charities")
        .update({ cause_family: known })
        .eq("id", c.id);
      if (e) console.error(`  ✗  ${c.name}: ${e.message}`);
      else {
        console.log(`  ✓  ${c.name.padEnd(30)} confirmed  ${known}`);
        confirmed++;
      }
      continue;
    }
    if (c.cause_family_suggested || c.cause_family) continue;
    const guess = await suggestCauseFamily({
      name: c.name,
      activities: c.activities,
      classification: c.classification,
    });
    if (!guess) {
      console.log(`  –  ${c.name.padEnd(30)} no cause of its own (or nothing to go on)`);
      none++;
      continue;
    }
    const { error: e } = await supabase
      .from("charities")
      .update({ cause_family_suggested: guess })
      .eq("id", c.id);
    if (e) console.error(`  ✗  ${c.name}: ${e.message}`);
    else {
      console.log(`  ?  ${c.name.padEnd(30)} suggested  ${guess}  (confirm in the outreach queue)`);
      suggested++;
    }
  }
  console.log(
    `\nDone — ${confirmed} confirmed from the table, ${suggested} suggested, ${none} with none.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
