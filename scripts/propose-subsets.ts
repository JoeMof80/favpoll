/**
 * scripts/propose-subsets.ts
 * ---------------------------------------------------------------------------
 * The SUBSET scan (favpoll-topic-rules §1, build step 2): for every
 * catalogue topic, the model proposes the subsets ordinary people already
 * ask for (lib/subset-proposals.ts), and each is written as a PROPOSED
 * `topic_subsets` row with its items joined to the parent's favourites.
 * An admin approves or rejects on /subsets; nothing reaches the picker
 * until approved.
 *
 * Run from apps/web, after migration 20260928120000:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/propose-subsets.ts
 *     --topic="Animal"   one topic only
 *     --all              topics that already have subsets too
 *     --dry-run          propose and print, write nothing
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";
import {
  proposeSubsets,
  SUBSET_MIN_ITEMS,
} from "../apps/web/lib/subset-proposals";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string) =>
  args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? null;
const ALL = flag("all");
const DRY = flag("dry-run");
const ONLY = opt("topic");
// A topic needs room for a corner: fewer items than this and there is
// nothing to cut.
const MIN_TOPIC_ITEMS = 10;

async function main() {
  let q = supabase
    .from("topics")
    .select(
      "id, title, is_finite, favourites(id, label, is_canonical, review_status), topic_subsets(id)",
    )
    .eq("is_active", true)
    .is("created_by", null) // the catalogue, never a homemade topic
    .order("title");
  if (ONLY) q = q.eq("title", ONLY);
  const { data: topics, error } = await q;
  if (error) throw new Error(error.message);

  let proposed = 0;
  let scanned = 0;
  for (const t of topics ?? []) {
    const has = (t.topic_subsets ?? []).length > 0;
    if (has && !ALL) continue;
    const eligible = (t.favourites ?? []).filter(
      (f) => f.is_canonical && f.review_status !== "rejected",
    );
    if (eligible.length < MIN_TOPIC_ITEMS) continue;
    scanned++;
    const subsets = await proposeSubsets({
      title: t.title,
      isFinite: !!t.is_finite,
      items: eligible.map((f) => f.label),
    });
    if (subsets.length === 0) {
      console.log(`  – ${t.title}: none`);
      continue;
    }
    const byLabel = new Map(eligible.map((f) => [f.label, f.id]));
    for (const s of subsets) {
      console.log(
        `  ${DRY ? "would propose" : "proposed"} ${t.title} › ${s.title} (${s.items.length}): ${s.items.join(", ")} — ${s.reason}`,
      );
      if (DRY) continue;
      const { data: row, error: sErr } = await supabase
        .from("topic_subsets")
        .upsert(
          {
            topic_id: t.id,
            title: s.title,
            status: "proposed",
            source: "scan",
            reason: s.reason || null,
          },
          { onConflict: "topic_id,title", ignoreDuplicates: true },
        )
        .select("id")
        .maybeSingle();
      if (sErr) {
        console.error(`  ✗ ${t.title} › ${s.title}: ${sErr.message}`);
        continue;
      }
      if (!row) continue; // already there (a re-run): leave the admin's copy alone
      const ids = s.items
        .map((l) => byLabel.get(l))
        .filter((id): id is string => Boolean(id));
      if (ids.length >= SUBSET_MIN_ITEMS) {
        const { error: iErr } = await supabase
          .from("topic_subset_items")
          .insert(
            ids.map((favourite_id) => ({ subset_id: row.id, favourite_id })),
          );
        if (iErr)
          console.error(`  ✗ ${t.title} › ${s.title} items: ${iErr.message}`);
      }
      proposed++;
    }
  }
  console.log(
    `${scanned} topics scanned, ${proposed} subsets ${DRY ? "would be " : ""}proposed`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
