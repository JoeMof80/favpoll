/**
 * scripts/rebuild-british-proverb.ts
 * ---------------------------------------------------------------------------
 * The Citizenship row's subset (revisit section A, ticked 2 Oct 2026)
 * could not survive the Saying → Proverb trim: its Britishness lived in
 * the idioms that went ("Mustn't grumble", "It'll be grand"), leaving
 * four members and a floor of six, so the copy to production refused it.
 *
 * Rather than drop a ticked row, the catalogue gained six proper British
 * proverbs (seed.ts) and this rebuilds the subset's membership from the
 * ones that are both British AND proverbs. Run AFTER the seed, on each
 * database:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/rebuild-british-proverb.ts
 *   pnpm exec tsx --env-file=../../.env.production-web ../../scripts/rebuild-british-proverb.ts
 *
 * Idempotent: it adds what is missing and removes nothing a guest picked.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const DRY = process.argv.includes("--dry-run");

const MEMBERS = [
  "An Englishman's home is his castle",
  "Many a mickle makes a muckle",
  "Ne'er cast a clout till May is out",
  "Rain before seven, fine before eleven",
  "Red sky at night, shepherd's delight",
  "There's nowt so queer as folk",
  "Worse things happen at sea",
  "Make do and mend",
  "Least said, soonest mended",
  "Mustn't grumble",
  "It'll be grand",
];

async function main() {
  const { data: topic } = await supabase
    .from("topics")
    .select("id")
    .eq("title", "Proverb")
    .maybeSingle();
  if (!topic) {
    console.log("No Proverb topic here — nothing to do.");
    return;
  }
  const { data: subset } = await supabase
    .from("topic_subsets")
    .select("id, status, topic_subset_items(favourite_id)")
    .eq("topic_id", topic.id)
    .eq("title", "British proverb")
    .maybeSingle();
  if (!subset) {
    console.log("No British proverb subset here — the copy will create it.");
    return;
  }
  const { data: favs } = await supabase
    .from("favourites")
    .select("id, label")
    .eq("topic_id", topic.id);
  const byLabel = new Map(
    (favs ?? []).map((f) => [f.label.toLowerCase(), f.id]),
  );
  const have = new Set(
    (subset.topic_subset_items ?? []).map((i) => i.favourite_id),
  );
  const rows: { subset_id: string; favourite_id: string }[] = [];
  for (const label of MEMBERS) {
    const id = byLabel.get(label.toLowerCase());
    // A label the trim removed here simply is not a member here.
    if (!id || have.has(id)) continue;
    rows.push({ subset_id: subset.id, favourite_id: id });
  }
  if (rows.length === 0) {
    console.log(`British proverb: ${have.size} members, nothing to add.`);
  } else if (DRY) {
    console.log(`→ would add ${rows.length} members`);
  } else {
    const { error } = await supabase.from("topic_subset_items").insert(rows);
    if (error) throw new Error(error.message);
    console.log(
      `British proverb: ${have.size} → ${have.size + rows.length} members`,
    );
  }
  if (!DRY && subset.status !== "approved") {
    await supabase
      .from("topic_subsets")
      .update({ status: "approved", is_active: true })
      .eq("id", subset.id);
    console.log("British proverb: approved");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
