/**
 * scripts/rename-saying-to-proverb.ts
 * ---------------------------------------------------------------------------
 * SAYING → PROVERB (founder, 2026-10-02). The topic's description promised
 * "the phrase they always reached for" — a personal thing nobody can pick
 * off a list — while every item on it was a proverb everyone knows. That
 * mismatch is why "favourite saying" read as awkward twice (it came off
 * the memorial row on 25 Sept and the leaving-do row the same week).
 * Proverb names the list the catalogue actually holds.
 *
 * The seed owns the title, the description, the placeholders and the item
 * list (scripts/seed.ts); it inserts but never renames or deletes, so this
 * does the two things it cannot:
 *   · rename the topic row, and its "British saying" subset with it
 *   · delete the items that are sayings rather than proverbs, and only
 *     where no guest has ever picked one (a pledged item is the record's,
 *     never ours to remove)
 *
 * Run from apps/web, BEFORE the seed (which then inserts the additions):
 *   pnpm exec tsx --env-file=.env.local ../../scripts/rename-saying-to-proverb.ts --dry-run
 *   pnpm exec tsx --env-file=.env.local ../../scripts/rename-saying-to-proverb.ts
 *   pnpm exec tsx --env-file=../../.env.production-web ../../scripts/rename-saying-to-proverb.ts
 *
 * Idempotent: a database already renamed reports and changes nothing.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const DRY = process.argv.includes("--dry-run");

/** Sayings, mottos and modern coinages — not proverbs. */
const TRIM = [
  "Better out than in",
  "It'll be grand",
  "Just say yes",
  "Mustn't grumble",
  "One foot in front of the other",
  "Onwards and upwards",
  "Strong opinions, loosely held",
  "There's no such thing as a daft question",
];

async function main() {
  const { data: topic } = await supabase
    .from("topics")
    .select("id, title")
    .in("title", ["Saying", "Proverb"])
    .maybeSingle();
  if (!topic) {
    console.log("No Saying or Proverb topic here — nothing to do.");
    return;
  }

  if (topic.title === "Saying") {
    if (DRY) {
      console.log('  → rename topic "Saying" to "Proverb"');
    } else {
      const { error } = await supabase
        .from("topics")
        .update({
          title: "Proverb",
          description: "The one they always came back to",
        })
        .eq("id", topic.id);
      if (error) throw new Error(error.message);
      console.log('  ✓ topic renamed to "Proverb"');
    }
  } else {
    console.log("  = topic is already Proverb");
  }

  const { data: subset } = await supabase
    .from("topic_subsets")
    .select("id")
    .eq("topic_id", topic.id)
    .eq("title", "British saying")
    .maybeSingle();
  if (subset) {
    if (DRY) {
      console.log('  → rename subset "British saying" to "British proverb"');
    } else {
      await supabase
        .from("topic_subsets")
        .update({ title: "British proverb" })
        .eq("id", subset.id);
      console.log('  ✓ subset renamed to "British proverb"');
    }
  }

  for (const label of TRIM) {
    const { data: item } = await supabase
      .from("favourites")
      .select("id, label, all_time_count")
      .eq("topic_id", topic.id)
      .eq("label", label)
      .maybeSingle();
    if (!item) continue;
    if ((item.all_time_count ?? 0) > 0) {
      console.warn(
        `  ✗ "${label}": ${item.all_time_count} pledge(s) on it — left alone, the record keeps what guests picked`,
      );
      continue;
    }
    // A pick inside a live poll counts too, whatever the all-time total says.
    const { count } = await supabase
      .from("pledge_allocations")
      .select("id", { count: "exact", head: true })
      .eq("favourite_id", item.id);
    if (count) {
      console.warn(`  ✗ "${label}": ${count} allocation(s) — left alone`);
      continue;
    }
    if (DRY) {
      console.log(`  → delete "${label}"`);
      continue;
    }
    await supabase
      .from("favpoll_poll_favourites")
      .delete()
      .eq("favourite_id", item.id);
    await supabase
      .from("topic_subset_items")
      .delete()
      .eq("favourite_id", item.id);
    const { error } = await supabase
      .from("favourites")
      .delete()
      .eq("id", item.id);
    if (error) console.warn(`  ✗ "${label}": ${error.message}`);
    else console.log(`  ✓ deleted "${label}"`);
  }

  console.log(DRY ? "--dry-run: nothing written." : "Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
