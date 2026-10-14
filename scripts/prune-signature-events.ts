/**
 * scripts/prune-signature-events.ts
 * ---------------------------------------------------------------------------
 * The reader now refuses events a supporter could not raise money at
 * (couldFundraiseAt, apps/web/lib/charity-events.ts). That filter runs at READ
 * time, so events already stored keep whatever the earlier runs accepted.
 *
 * This applies the same function to the stored arrays. Deliberately NOT a
 * re-read: re-reading costs model spend, takes the sites as they are today
 * rather than as they were, and would change rows the filter has no quarrel
 * with. Pruning is deterministic, free, and uses the one definition of the
 * rule rather than a copy of it.
 *
 * Production before this ran (2026-10-15): 82 events across 22 charities, of
 * which 9 are not fundraising — five Diabetes UK support-group entries,
 * Hospice UK's National Conference, MSF's Scientific Days and a Global Health
 * course. Every half marathon, sponsored walk, bake sale and carol concert
 * stays, including the 59 that map to no topic, because a half marathon has
 * no favourite to pick and that is the honest answer rather than a failure.
 *
 * A charity left with NO events keeps its website_read_at: "we looked and
 * found nothing you could fundraise at" is a different fact from "we never
 * looked", and the admin surfaces distinguish them (#1031).
 *
 * Run from apps/web:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/prune-signature-events.ts
 *   pnpm exec tsx --env-file=../../.env.production-web ../../scripts/prune-signature-events.ts
 *
 * Idempotent. --dry-run lists what it would drop.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";
import {
  couldFundraiseAt,
  type SignatureEvent,
} from "../apps/web/lib/charity-events";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const DRY = process.argv.includes("--dry-run");

async function main() {
  const { data, error } = await supabase
    .from("charity_profiles")
    .select("registered_number, signature_events")
    .not("signature_events", "is", null);
  if (error) throw new Error(error.message);

  let profiles = 0;
  let dropped = 0;
  let kept = 0;

  for (const p of data ?? []) {
    const events = (p.signature_events ?? []) as SignatureEvent[];
    if (events.length === 0) continue;
    const keep = events.filter((e) => couldFundraiseAt(e));
    kept += keep.length;
    if (keep.length === events.length) continue;

    const lost = events.filter((e) => !couldFundraiseAt(e));
    dropped += lost.length;
    profiles++;
    console.log(
      `  ${p.registered_number}: ${events.length} → ${keep.length}` +
        (keep.length === 0 ? "  (none left)" : ""),
    );
    for (const e of lost) console.log(`      drop  ${e.name} — ${e.kind}`);

    if (DRY) continue;
    const { error: upErr } = await supabase
      .from("charity_profiles")
      .update({ signature_events: keep })
      .eq("registered_number", p.registered_number);
    if (upErr) throw new Error(upErr.message);
  }

  console.log(
    `\n${DRY ? "would drop" : "dropped"} ${dropped} event${
      dropped === 1 ? "" : "s"
    } across ${profiles} profile${profiles === 1 ? "" : "s"}; ${kept} kept.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
