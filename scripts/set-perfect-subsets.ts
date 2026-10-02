/**
 * scripts/set-perfect-subsets.ts
 * ---------------------------------------------------------------------------
 * CONFIRMS a charity's PERFECT TOPIC and its PERFECT SUBSET (favpoll-
 * topic-rules §1, step 4) for the charities where a subset is plainly
 * narrower than the topic and still the whole of what they do: the
 * lifeboats and the British coast, mountain rescue and British mountains.
 *
 * The suggester (scripts/backfill-perfect-topic.ts) already proposed the
 * TOPIC for each of these; it proposed no subset, so the sharpening is
 * the founder's, taken from section B of the subsets revisit (1 October,
 * ticked 2 October). This script is that confirmation written down: the
 * same write the admin's outreach queue makes (setPerfectTopic), with the
 * mapping reviewable in the diff instead of clicked through a queue.
 *
 * What a confirmed perfect subset does:
 *   · the wizard's charity-first flow suggests the SUBSET first, the
 *     parent topic behind it (app/favpolls/new/wizard-data.ts)
 *   · the Story engine reads it as a starred charity→topic edge, and the
 *     subset on the card counts as the charity's own (lib/pairing-table.ts)
 *   · the exemplar seed carries the subset and lists only its members
 *
 * Run from apps/web:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/set-perfect-subsets.ts --dry-run
 *   pnpm exec tsx --env-file=.env.local ../../scripts/set-perfect-subsets.ts
 *   pnpm exec tsx --env-file=../../.env.production-web ../../scripts/set-perfect-subsets.ts
 *
 * Safety: the subset must be APPROVED and belong to the topic (a trigger
 * enforces the second). A charity whose perfect topic is already
 * confirmed to a DIFFERENT topic is reported and skipped unless --force.
 * Re-running changes nothing. Nothing here writes a suggestion.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const DRY = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

/** charity name → [perfect topic, perfect subset or null]. Section B of
 *  references/subsets-pairing-revisit-2026-10-01.md, ticked 2 Oct 2026.
 *  Deliberately absent: the charities whose whole list is already right
 *  (Dogs Trust and Battersea rehome every breed; the RSPCA's remit runs
 *  from pets to farm animals to wildlife, so Pet alone would narrow it
 *  wrongly; WWF is every animal), and the ones the suggester declined
 *  because their cause is a condition (Guide Dogs, RNIB, BHF). */
const PERFECT: [charity: string, topic: string, subset: string | null][] = [
  ["RNLI", "Beach", "British beach"],
  ["Mountain Rescue England and Wales", "Mountain or peak", "British mountain"],
  ["Surfers Against Sewage", "Beach", "Surfing beach"],
  ["WaterAid", "River", "World river"],
  ["Blue Cross", "Animal", "Pet"],
  // The Big Garden Birdwatch is the RSPB's own, and it is garden birds.
  ["RSPB", "Bird", "Garden bird"],
  // Guide Dogs breed and train their own dogs — the pairing table has
  // always called Dog breed theirs, and the subset names the working
  // half of the list (section B's gap, closed 2026-10-02 when Working
  // dog breed was approved). The suggester had declined them because
  // their cause reads as a condition; the table's reading wins, on the
  // founder's word.
  ["Guide Dogs", "Dog breed", "Working dog breed"],
  // No subset: the whole list is the charity's own.
  ["Cats Protection", "Cat breed", null],
];

/** "No topic of its own" — the confirmation AND the suggestion go, so
 *  the charity leaves the Perfect topics queue decided. Age UK was
 *  confirmed to Proverb on 2026-10-02 and cleared the same day: the
 *  perfect-topic rules name "a saying for an older-people charity" as
 *  the exact thing that is not a charity's own topic. */
const CLEAR: string[] = ["Age UK"];

async function main() {
  let set = 0;
  let skipped = 0;
  for (const [name, topicTitle, subsetTitle] of PERFECT) {
    const { data: charity } = await supabase
      .from("charities")
      .select("id, name, perfect_topic_id, perfect_subset_id")
      .eq("name", name)
      .maybeSingle();
    if (!charity) {
      console.warn(`  ✗ ${name}: no such charity here`);
      skipped++;
      continue;
    }
    const { data: topic } = await supabase
      .from("topics")
      .select("id")
      .eq("title", topicTitle)
      .maybeSingle();
    const { data: subset } = subsetTitle
      ? await supabase
          .from("topic_subsets")
          .select("id, status, topic_id")
          .eq("title", subsetTitle)
          .maybeSingle()
      : { data: null };
    if (!topic || (subsetTitle && !subset)) {
      console.warn(
        `  ✗ ${name}: missing ${!topic ? `topic "${topicTitle}"` : `subset "${subsetTitle}"`}`,
      );
      skipped++;
      continue;
    }
    if (subset && subset.status !== "approved") {
      console.warn(
        `  ✗ ${name}: subset "${subsetTitle}" is ${subset.status} — approve it on /subsets first`,
      );
      skipped++;
      continue;
    }
    if (subset && subset.topic_id !== topic.id) {
      console.warn(
        `  ✗ ${name}: "${subsetTitle}" is not a subset of "${topicTitle}"`,
      );
      skipped++;
      continue;
    }
    if (
      charity.perfect_topic_id &&
      charity.perfect_topic_id !== topic.id &&
      !FORCE
    ) {
      console.warn(
        `  ✗ ${name}: already confirmed to another topic — pass --force to change it`,
      );
      skipped++;
      continue;
    }
    const label = subsetTitle ? `${topicTitle} / ${subsetTitle}` : topicTitle;
    if (
      charity.perfect_topic_id === topic.id &&
      charity.perfect_subset_id === (subset?.id ?? null)
    ) {
      console.log(`  = ${name}: ${label} (already set)`);
      continue;
    }
    if (DRY) {
      console.log(`  → ${name}: ${label}`);
      set++;
      continue;
    }
    const { error } = await supabase
      .from("charities")
      .update({
        perfect_topic_id: topic.id,
        perfect_subset_id: subset?.id ?? null,
        // The suggestion follows the confirmation, so the Perfect topics
        // queue does not offer a decided charity again.
        perfect_topic_suggested_id: topic.id,
        perfect_subset_suggested_id: subset?.id ?? null,
      })
      .eq("id", charity.id);
    if (error) {
      console.warn(`  ✗ ${name}: ${error.message}`);
      skipped++;
      continue;
    }
    console.log(`  ✓ ${name}: ${label}`);
    set++;
  }

  for (const name of CLEAR) {
    const { data: charity } = await supabase
      .from("charities")
      .select("id, name, perfect_topic_id, perfect_topic_suggested_id")
      .eq("name", name)
      .maybeSingle();
    if (!charity) {
      console.warn(`  ✗ ${name}: no such charity here`);
      skipped++;
      continue;
    }
    if (!charity.perfect_topic_id && !charity.perfect_topic_suggested_id) {
      console.log(`  = ${name}: already has no topic of its own`);
      continue;
    }
    if (DRY) {
      console.log(`  → ${name}: clear (no topic of its own)`);
      set++;
      continue;
    }
    const { error } = await supabase
      .from("charities")
      .update({
        perfect_topic_id: null,
        perfect_subset_id: null,
        perfect_topic_suggested_id: null,
        perfect_subset_suggested_id: null,
      })
      .eq("id", charity.id);
    if (error) {
      console.warn(`  ✗ ${name}: ${error.message}`);
      skipped++;
      continue;
    }
    console.log(`  ✓ ${name}: cleared — no topic of its own`);
    set++;
  }
  console.log(
    DRY
      ? `--dry-run: ${set} would be set, ${skipped} skipped. Nothing written.`
      : `${set} set, ${skipped} skipped.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
