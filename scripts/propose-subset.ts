/**
 * scripts/propose-subset.ts
 * ---------------------------------------------------------------------------
 * One SUBSET proposed by hand (favpoll-topic-rules §1): when the scan's
 * model gets the facts wrong (Harry Kane at Manchester United) or misses
 * a corner a long list plainly has (nine clubs on Footballer), an admin
 * writes the proposal from the list directly. It still lands as PROPOSED
 * and goes through Approve on /subsets — ruling 2 holds.
 *
 * Run from apps/web:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/propose-subset.ts \
 *     --topic="Footballer" --title="Liverpool player" \
 *     --items="Ian Rush, Robbie Fowler, John Barnes" \
 *     --reason="Liverpool supporters ask for their favourite Liverpool player."
 * Labels must be on the parent's list, verbatim (case-insensitive);
 * anything else is reported and skipped. A title already proposed for
 * that topic is left alone.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const args = process.argv.slice(2);
const opt = (n: string) =>
  args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? null;

async function main() {
  const topicTitle = opt("topic");
  const title = opt("title")?.trim();
  const labels = (opt("items") ?? "")
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
  const reason = opt("reason")?.trim() || null;
  if (!topicTitle || !title || labels.length === 0)
    throw new Error("--topic, --title and --items are all required");

  const { data: topic, error: tErr } = await supabase
    .from("topics")
    .select("id, title, favourites(id, label, is_canonical, review_status)")
    .eq("title", topicTitle)
    .eq("is_active", true)
    .maybeSingle();
  if (tErr) throw new Error(tErr.message);
  if (!topic) throw new Error(`no active topic titled "${topicTitle}"`);

  const byKey = new Map(
    (topic.favourites ?? [])
      .filter((f) => f.is_canonical && f.review_status !== "rejected")
      .map((f) => [f.label.toLowerCase(), f]),
  );
  const ids: string[] = [];
  for (const l of labels) {
    const f = byKey.get(l.toLowerCase());
    if (!f) console.log(`  ✗ not on ${topic.title}'s list: ${l}`);
    else if (!ids.includes(f.id)) ids.push(f.id);
  }

  const { data: row, error: sErr } = await supabase
    .from("topic_subsets")
    .upsert(
      {
        topic_id: topic.id,
        title,
        status: "proposed",
        source: "admin",
        reason,
      },
      { onConflict: "topic_id,title", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();
  if (sErr) throw new Error(sErr.message);
  if (!row) {
    console.log(`  – ${topic.title} › ${title}: already there, left alone`);
    return;
  }
  if (ids.length > 0) {
    const { error: iErr } = await supabase
      .from("topic_subset_items")
      .insert(ids.map((favourite_id) => ({ subset_id: row.id, favourite_id })));
    if (iErr) throw new Error(iErr.message);
  }
  console.log(`  proposed ${topic.title} › ${title} (${ids.length} items)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
