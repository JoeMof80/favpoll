/**
 * scripts/complete-subsets.ts
 * ---------------------------------------------------------------------------
 * The SUBSET COMPLETION pass (founder, 2026-09-28: "I need an extra
 * curry"). For every proposed subset, the model reads the parent's full
 * list and the subset's members (lib/subset-completion.ts) and answers:
 *   MISSING   — members the parent already lists but the subset left out:
 *               written as join rows (the admin still sees every chip
 *               before Approve).
 *   ADDITIONS — items the parent lacks that the subset wants: NEVER
 *               written. Reported for the catalogue's judgement, because a
 *               subset never justifies an item (favpoll-topic-rules §1).
 * Approved subsets are only reported, never changed.
 *
 * Run from apps/web:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/complete-subsets.ts
 *     --topic="Takeaway"   one parent only
 *     --subset="Curry"     one subset only
 *     --dry-run            report, write nothing
 *     --report=<path>      also write the additions report as markdown
 * ---------------------------------------------------------------------------
 */
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { completeSubset } from "../apps/web/lib/subset-completion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string) =>
  args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? null;
const DRY = flag("dry-run");
const ONLY_TOPIC = opt("topic");
const ONLY_SUBSET = opt("subset");
const REPORT = opt("report");

type Fav = {
  id: string;
  label: string;
  is_canonical: boolean;
  review_status: string | null;
};

async function main() {
  let q = supabase
    .from("topic_subsets")
    .select(
      "id, title, status, topics!inner(title, favourites(id, label, is_canonical, review_status)), topic_subset_items(favourite_id)",
    )
    .in("status", ["proposed", "approved"])
    .order("title");
  if (ONLY_TOPIC) q = q.eq("topics.title", ONLY_TOPIC);
  if (ONLY_SUBSET) q = q.eq("title", ONLY_SUBSET);
  const { data: subsets, error } = await q;
  if (error) throw new Error(error.message);

  const report: string[] = [];
  let added = 0;
  for (const s of subsets ?? []) {
    const topic = (Array.isArray(s.topics) ? s.topics[0] : s.topics) as {
      title: string;
      favourites: Fav[] | null;
    };
    const eligible = (topic.favourites ?? []).filter(
      (f) => f.is_canonical && f.review_status !== "rejected",
    );
    const byId = new Map(eligible.map((f) => [f.id, f.label]));
    const memberIds = new Set(
      (s.topic_subset_items ?? []).map((i) => i.favourite_id),
    );
    const members = [...memberIds]
      .map((id) => byId.get(id))
      .filter((l): l is string => Boolean(l));
    const { missing, additions } = await completeSubset({
      parentTitle: topic.title,
      parentItems: eligible.map((f) => f.label),
      subsetTitle: s.title,
      members,
    });
    const head = `${topic.title} › ${s.title} (${members.length})`;
    if (missing.length === 0 && additions.length === 0) {
      console.log(`  – ${head}: complete`);
      continue;
    }
    if (missing.length > 0) {
      const canWrite = s.status === "proposed" && !DRY;
      console.log(
        `  ${canWrite ? "+" : "?"} ${head} missing from the list: ${missing.join(", ")}${
          s.status === "approved" ? " (approved — not changed)" : ""
        }`,
      );
      if (canWrite) {
        const byLabel = new Map(eligible.map((f) => [f.label, f.id]));
        const rows = missing
          .map((l) => byLabel.get(l))
          .filter((id): id is string => Boolean(id) && !memberIds.has(id!))
          .map((favourite_id) => ({ subset_id: s.id, favourite_id }));
        if (rows.length > 0) {
          const { error: iErr } = await supabase
            .from("topic_subset_items")
            .insert(rows);
          if (iErr) console.error(`  ✗ ${head}: ${iErr.message}`);
          else added += rows.length;
        }
      }
    }
    if (additions.length > 0) {
      console.log(`    the list lacks: ${additions.join(", ")}`);
      report.push(
        `- **${topic.title} › ${s.title}** (${members.length + missing.length}): ${additions.join(", ")}`,
      );
    }
  }
  console.log(
    `${(subsets ?? []).length} subsets checked, ${added} members ${DRY ? "would be " : ""}added, ${report.length} with suggested additions`,
  );
  if (REPORT) {
    writeFileSync(
      REPORT,
      `# Items the catalogue lacks, by subset (${new Date().toISOString().slice(0, 10)})\n\nSuggestions only: each must earn its place on the parent by the topic rules.\n\n${report.join("\n")}\n`,
    );
    console.log(`report: ${REPORT}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
