/**
 * scripts/approve-ticked-subsets.ts
 * ---------------------------------------------------------------------------
 * The subsets the founder TICKED in the revisit (sections A and B of
 * references/subsets-pairing-revisit-2026-10-01.md, ticked 2 Oct 2026)
 * that the September scan review had rejected. A pairing row cannot name
 * a subset no poll can carry, so these had to be approved before their
 * rows could land — the tick is the later decision and it wins.
 *
 * Run from apps/web:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/approve-ticked-subsets.ts --dry-run
 *   pnpm exec tsx --env-file=.env.local ../../scripts/approve-ticked-subsets.ts
 *
 * Approves exactly these titles and nothing else; a subset already
 * approved is reported and left alone; one under the six-item floor is
 * refused, as the admin's own Approve refuses it.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const DRY = process.argv.includes("--dry-run");
const MIN_ITEMS = 6;

/** [parent topic, subset] — the pair, because "Sunday roast" is a subset
 *  of three different topics and only those three are meant. */
const TICKED: [topic: string, subset: string][] = [
  ["Cheese", "Cheese board"],
  ["Carol", "Christmas carol"],
  ["Christmas film", "Christmas classic"],
  ["Christmas film", "Family Christmas film"],
  ["Christmas song", "Christmas number one"],
  ["Comfort food", "Sunday roast"],
  ["Vegetable", "Sunday roast"],
  ["Sauce or condiment", "Sunday roast"],
  ["Children's book", "Picture book"],
  ["Proverb", "British proverb"],
  ["Seaside town", "Bucket and spade beach"],
  ["Seaside town", "Fishing village"],
  ["Proverb", "Life advice"],
  ["Smell", "Comfort smell"],
  ["Tree", "Fruit tree"],
  ["Pudding", "British pudding"],
  ["Cartoon", "Childhood favourite"],
  ["Flower", "Scented flower"],
  ["Flower", "Spring flower"],
  ["Vegetable", "Leafy green"],
  ["Vegetable", "Salad vegetable"],
  ["Dog breed", "Terrier"],
  ["Insect", "Garden insect"],
  ["Castle", "Seaside castle"],
  ["Hymn", "Sunday service"],
  ["Radio station", "BBC station"],
];

async function main() {
  let approved = 0,
    already = 0,
    skipped = 0;
  for (const [topicTitle, subsetTitle] of TICKED) {
    const { data: topic } = await supabase
      .from("topics")
      .select("id")
      .eq("title", topicTitle)
      .maybeSingle();
    if (!topic) {
      console.warn(`  ✗ ${topicTitle} › ${subsetTitle}: no such topic here`);
      skipped++;
      continue;
    }
    const { data: subset } = await supabase
      .from("topic_subsets")
      .select("id, status, topic_subset_items(favourite_id)")
      .eq("topic_id", topic.id)
      .eq("title", subsetTitle)
      .maybeSingle();
    if (!subset) {
      console.warn(`  ✗ ${topicTitle} › ${subsetTitle}: no such subset here`);
      skipped++;
      continue;
    }
    if (subset.status === "approved") {
      console.log(`  = ${topicTitle} › ${subsetTitle} (already approved)`);
      already++;
      continue;
    }
    const n = (subset.topic_subset_items ?? []).length;
    if (n < MIN_ITEMS) {
      console.warn(
        `  ✗ ${topicTitle} › ${subsetTitle}: ${n} items, under the floor of ${MIN_ITEMS}`,
      );
      skipped++;
      continue;
    }
    if (DRY) {
      console.log(`  → ${topicTitle} › ${subsetTitle} (${n} items)`);
      approved++;
      continue;
    }
    const { error } = await supabase
      .from("topic_subsets")
      .update({
        status: "approved",
        is_active: true,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", subset.id);
    if (error) {
      console.warn(`  ✗ ${topicTitle} › ${subsetTitle}: ${error.message}`);
      skipped++;
      continue;
    }
    console.log(`  ✓ ${topicTitle} › ${subsetTitle} (${n} items)`);
    approved++;
  }
  console.log(
    DRY
      ? `--dry-run: ${approved} would be approved, ${already} already, ${skipped} skipped.`
      : `${approved} approved, ${already} already, ${skipped} skipped.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
