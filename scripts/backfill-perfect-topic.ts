/**
 * scripts/backfill-perfect-topic.ts
 * ---------------------------------------------------------------------------
 * Suggests a PERFECT TOPIC for every active charity that has none yet
 * (lib/perfect-topic.ts): the model reads the register's objects and
 * activities against the live catalogue and writes
 * charities.perfect_topic_suggested_id + perfect_topic_reason. It never
 * touches perfect_topic_id — that is the admin's confirmation.
 *
 * Run from apps/web, after migration 20260926120000:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/backfill-perfect-topic.ts
 *   --all re-suggests for charities that already have a suggestion.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";
import type { CauseFamily } from "../packages/types";
import {
  catalogueForSuggestion,
  suggestPerfectTopic,
} from "../apps/web/lib/perfect-topic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const ALL = process.argv.includes("--all");

async function main() {
  const { data: topics, error: tErr } = await supabase
    .from("topics")
    .select(
      "id, title, is_finite, favourites(label, is_canonical), topic_subsets(id, title, status, is_active, topic_subset_items(favourites(label)))",
    )
    .eq("is_active", true);
  if (tErr) throw new Error(tErr.message);
  const catalogue = catalogueForSuggestion(topics ?? []);

  let q = supabase
    .from("charities")
    .select(
      "id, name, activities, objects, cause_family, grant_making, areas, perfect_topic_id, perfect_topic_suggested_id, perfect_topic_reason",
    )
    .eq("is_active", true)
    .order("name");
  if (!ALL)
    q = q
      .is("perfect_topic_suggested_id", null)
      .is("perfect_topic_reason", null);
  const { data: charities, error } = await q;
  if (error) throw new Error(error.message);

  let n = 0;
  for (const c of charities ?? []) {
    if (c.perfect_topic_id) continue; // confirmed: nothing to suggest
    const s = await suggestPerfectTopic({
      name: c.name,
      activities: c.activities,
      objects: c.objects,
      causeFamily: (c.cause_family as CauseFamily | null) ?? null,
      grantMaking: c.grant_making ?? null,
      areas: c.areas as { area: string; type: string }[] | null,
      topics: catalogue,
    });
    if (!s) {
      console.log(`  – ${c.name}: nothing to say`);
      continue;
    }
    const { error: uErr } = await supabase
      .from("charities")
      .update({
        perfect_topic_suggested_id: s.topicId,
        perfect_subset_suggested_id: s.subsetId,
        perfect_topic_reason: s.reason,
        perfect_topic_items: s.items.length ? s.items : null,
      })
      .eq("id", c.id);
    if (uErr) console.error(`  ✗ ${c.name}: ${uErr.message}`);
    else {
      n++;
      const topic = catalogue.find((t) => t.id === s.topicId);
      const subset = topic?.subsets?.find((x) => x.id === s.subsetId)?.title;
      console.log(
        `  ✓ ${c.name}: ${topic?.title ?? "none"}${subset ? ` › ${subset}` : ""}${s.items.length ? ` [${s.items.join(", ")}]` : ""} — ${s.reason}`,
      );
    }
  }
  console.log(`${n} suggested`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
