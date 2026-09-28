/**
 * scripts/copy-subsets.ts
 * ---------------------------------------------------------------------------
 * Copies APPROVED subsets from one database to another by name — parent
 * topic title, subset title, member labels — because ids differ between
 * staging and production (favpoll-topic-rules §1). The admin's review on
 * staging is the review; the copy lands approved, source kept. A subset
 * already present on the target (same parent, same title) gains any
 * members it lacks and is otherwise left alone. Members whose label the
 * target topic does not have are reported and skipped: the seed must
 * carry the item first (a subset never justifies an item).
 *
 * Run from apps/web, TARGET in the env file, SOURCE in two extra vars:
 *   SOURCE_SUPABASE_URL=… SOURCE_SUPABASE_SERVICE_ROLE_KEY=… \
 *   pnpm exec tsx --env-file=../../.env.production-web ../../scripts/copy-subsets.ts
 *     --dry-run   report, write nothing
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";

const DRY = process.argv.includes("--dry-run");
const source = createClient(
  process.env.SOURCE_SUPABASE_URL!,
  process.env.SOURCE_SUPABASE_SERVICE_ROLE_KEY!,
);
const target = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type SourceSubset = {
  title: string;
  source: string;
  reason: string | null;
  is_active: boolean;
  topics: { title: string } | { title: string }[] | null;
  topic_subset_items: { favourites: { label: string } | null }[] | null;
};
const one = <T>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

async function main() {
  console.log(
    `${process.env.SOURCE_SUPABASE_URL!.slice(8, 28)} → ${process.env.NEXT_PUBLIC_SUPABASE_URL!.slice(8, 28)}${DRY ? " (dry run)" : ""}`,
  );
  const { data: subsets, error } = await source
    .from("topic_subsets")
    .select(
      "title, source, reason, is_active, topics(title), topic_subset_items(favourites(label))",
    )
    .eq("status", "approved")
    .order("title");
  if (error) throw new Error(error.message);

  const { data: targetTopics, error: tErr } = await target
    .from("topics")
    .select("id, title, favourites(id, label)")
    .eq("is_active", true)
    .is("created_by", null);
  if (tErr) throw new Error(tErr.message);
  const byTitle = new Map(
    (targetTopics ?? []).map((t) => [
      t.title.toLowerCase(),
      {
        id: t.id as string,
        favs: new Map(
          ((t.favourites ?? []) as { id: string; label: string }[]).map((f) => [
            f.label.toLowerCase(),
            f.id,
          ]),
        ),
      },
    ]),
  );

  let created = 0;
  let extended = 0;
  let skipped = 0;
  const missing: string[] = [];
  for (const s of (subsets ?? []) as SourceSubset[]) {
    const parentTitle = one(s.topics)?.title ?? "";
    const parent = byTitle.get(parentTitle.toLowerCase());
    if (!parent) {
      console.log(
        `  ✗ ${parentTitle} › ${s.title}: no such topic on the target`,
      );
      skipped++;
      continue;
    }
    const labels = (s.topic_subset_items ?? [])
      .map((i) => i.favourites?.label)
      .filter((l): l is string => Boolean(l));
    const ids: string[] = [];
    for (const l of labels) {
      const id = parent.favs.get(l.toLowerCase());
      if (id) ids.push(id);
      else missing.push(`${parentTitle} › ${s.title}: ${l}`);
    }
    if (ids.length < 6) {
      console.log(
        `  ✗ ${parentTitle} › ${s.title}: only ${ids.length} members on the target's list`,
      );
      skipped++;
      continue;
    }

    const { data: existing } = await target
      .from("topic_subsets")
      .select("id, topic_subset_items(favourite_id)")
      .eq("topic_id", parent.id)
      .eq("title", s.title)
      .maybeSingle();

    if (DRY) {
      console.log(
        `  ${existing ? "would extend" : "would create"} ${parentTitle} › ${s.title} (${ids.length})`,
      );
      continue;
    }

    let subsetId = existing?.id as string | undefined;
    const have = new Set(
      ((existing?.topic_subset_items ?? []) as { favourite_id: string }[]).map(
        (i) => i.favourite_id,
      ),
    );
    if (!subsetId) {
      const { data: row, error: iErr } = await target
        .from("topic_subsets")
        .insert({
          topic_id: parent.id,
          title: s.title,
          status: "approved",
          source: s.source,
          reason: s.reason,
          is_active: s.is_active,
          reviewed_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (iErr || !row) {
        console.log(`  ✗ ${parentTitle} › ${s.title}: ${iErr?.message}`);
        skipped++;
        continue;
      }
      subsetId = row.id as string;
      created++;
    }
    const toAdd = ids.filter((id) => !have.has(id));
    if (toAdd.length > 0) {
      const { error: mErr } = await target
        .from("topic_subset_items")
        .insert(
          toAdd.map((favourite_id) => ({ subset_id: subsetId, favourite_id })),
        );
      if (mErr)
        console.log(`  ✗ ${parentTitle} › ${s.title} members: ${mErr.message}`);
      else if (existing) extended++;
    }
    console.log(
      `  ${existing ? "extended" : "created"} ${parentTitle} › ${s.title} (${ids.length}${toAdd.length && existing ? `, +${toAdd.length}` : ""})`,
    );
  }
  console.log(
    `${created} created, ${extended} extended, ${skipped} skipped, ${missing.length} members not on the target's list`,
  );
  if (missing.length) console.log("  " + missing.join("\n  "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
