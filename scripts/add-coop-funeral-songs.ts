/**
 * scripts/add-coop-funeral-songs.ts
 * ---------------------------------------------------------------------------
 * Co-op Funeralcare has published the songs played at its funerals since
 * 2002 — roughly 93,000 services a year — and that chart is both the way
 * into the funeral-director channel and the proof that a funeral song
 * passes the favourite test. On 2026-10-13 the Funeral song subset held 3
 * of their top 10; adding the four that were already in the catalogue took
 * it to 7. These are the last three, and they were missing from the PARENT
 * Song list, so they had to be created before they could be members.
 *
 *   The Best — Tina Turner
 *   We'll Meet Again — Vera Lynn
 *   You Raise Me Up — Westlife
 *
 * The attributions follow the chart as Co-op publishes it: "You Raise Me
 * Up" is the Westlife recording (UK number one, 2005), not Josh Groban's.
 *
 * They are also in scripts/seed.ts, so a fresh database gets them; this
 * script is what carries them to databases that already exist. Run on
 * each, from apps/web:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/add-coop-funeral-songs.ts
 *   pnpm exec tsx --env-file=../../.env.production-web ../../scripts/add-coop-funeral-songs.ts
 *
 * Idempotent: it creates what is absent, joins what is not joined, and
 * removes nothing. --dry-run says what it would do.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const DRY = process.argv.includes("--dry-run");

const SONGS = [
  "The Best — Tina Turner",
  "We'll Meet Again — Vera Lynn",
  "You Raise Me Up — Westlife",
];

async function main() {
  const { data: topic } = await supabase
    .from("topics")
    .select("id")
    .eq("title", "Song")
    .maybeSingle();
  if (!topic) {
    console.log("No Song topic here — nothing to do.");
    return;
  }

  const { data: favs } = await supabase
    .from("favourites")
    .select("id, label")
    .eq("topic_id", topic.id);
  const byLabel = new Map(
    (favs ?? []).map((f) => [f.label.toLowerCase(), f.id]),
  );

  // The same row shape seed.ts writes, so a later seed run is a no-op
  // rather than a duplicate: it filters on the lower-cased label.
  const missing = SONGS.filter((l) => !byLabel.has(l.toLowerCase()));
  if (missing.length > 0 && !DRY) {
    const { data: created, error } = await supabase
      .from("favourites")
      .insert(
        missing.map((label) => ({
          topic_id: topic.id,
          label,
          is_canonical: true,
          source: "seed",
          markets: ["en-GB"],
        })),
      )
      .select("id, label");
    if (error) throw new Error(error.message);
    for (const f of created ?? []) byLabel.set(f.label.toLowerCase(), f.id);
  }
  console.log(
    DRY
      ? `→ would add ${missing.length} of 3 to the Song list`
      : `Song: ${missing.length} added (${favs?.length ?? 0} → ${
          (favs?.length ?? 0) + missing.length
        } items)`,
  );

  const { data: subset } = await supabase
    .from("topic_subsets")
    .select("id, status, topic_subset_items(favourite_id)")
    .eq("topic_id", topic.id)
    .eq("title", "Funeral song")
    .maybeSingle();
  if (!subset) {
    console.log("No Funeral song subset here — the items are enough.");
    return;
  }

  const have = new Set(
    (subset.topic_subset_items ?? []).map((i) => i.favourite_id),
  );
  const rows: { subset_id: string; favourite_id: string }[] = [];
  // A dry run has created nothing, so a song that is missing from the list
  // has no id to join by. Counting it anyway is the whole point: a dry run
  // that said "nothing to add" before adding three would be a lie.
  let wouldJoin = 0;
  for (const label of SONGS) {
    const id = byLabel.get(label.toLowerCase());
    if (!id) {
      if (DRY) wouldJoin++;
      continue;
    }
    if (have.has(id)) continue;
    if (DRY) wouldJoin++;
    else rows.push({ subset_id: subset.id, favourite_id: id });
  }

  if (DRY) {
    console.log(
      wouldJoin === 0
        ? `Funeral song: ${have.size} members, nothing to add.`
        : `→ would add ${wouldJoin} members to Funeral song (${have.size} → ${
            have.size + wouldJoin
          })`,
    );
    return;
  }
  if (rows.length === 0) {
    console.log(`Funeral song: ${have.size} members, nothing to add.`);
    return;
  }
  const { error } = await supabase.from("topic_subset_items").insert(rows);
  if (error) throw new Error(error.message);
  console.log(
    `Funeral song: ${have.size} → ${have.size + rows.length} members`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
