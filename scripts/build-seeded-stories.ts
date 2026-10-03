/**
 * scripts/build-seeded-stories.ts
 * ---------------------------------------------------------------------------
 * Dumps the seeded exemplar cohort as JSON for the "Stories seeded from the
 * pairing table" artifact: the card a guest sees, the About and the note, and
 * the three edges RECOMPUTED from the live table (lib/pairing-table) rather
 * than remembered, so the page cannot drift from the rules.
 *
 * Run from apps/web:
 *   pnpm exec tsx --env-file=.env.local ../../scripts/build-seeded-stories.ts > /tmp/stories.json
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";
import { storyEdges } from "../apps/web/lib/story-engine";
import { deriveRegister } from "../apps/web/lib/registers";
import type { CauseFamily } from "../packages/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const { data, error } = await supabase
    .from("favpolls")
    .select(
      `id, subject, grouping, category, occasion_type, opening_line, cause_label,
       description, closed_at, closes_at, photo_url,
       protagonists!favpolls_protagonist_id_fkey ( name, context, about, photo_url, pronoun ),
       favpoll_polls ( personal_note, subset_id, topics ( title, favourites ( id ) ), topic_subsets ( title, topic_subset_items ( favourite_id ) ) ),
       favpoll_charities ( charities ( name, description, activities, cause_family ) )`,
    )
    .eq("created_by", "user_seed_story");
  if (error) throw new Error(error.message);

  const out = (data ?? []).map((f: any) => {
    const poll = f.favpoll_polls;
    const charity = f.favpoll_charities?.[0]?.charities ?? null;
    const subset = poll?.topic_subsets ?? null;
    const parentTitle = poll?.topics?.title ?? "";
    const cardTopic = subset?.title ?? parentTitle;
    const isCause = f.subject === "cause";
    const register = deriveRegister(f.category, f.grouping, f.subject);
    const edges = storyEdges({
      register,
      subject: isCause ? "cause" : "someone",
      occasionType: f.occasion_type,
      topicTitle: cardTopic,
      parentTopicTitle: subset ? parentTitle : null,
      itemLabels: [],
      charity: charity
        ? {
            name: charity.name,
            description: charity.description,
            activities: charity.activities,
            causeFamily: charity.cause_family as CauseFamily | null,
          }
        : { name: "", description: null, activities: null, causeFamily: null },
    } as any);
    const items = subset
      ? (subset.topic_subset_items ?? []).length
      : (poll?.topics?.favourites ?? []).length;
    return {
      id: f.id,
      register,
      occasion: f.occasion_type,
      openingLine: f.opening_line,
      name: isCause ? (f.cause_label ?? "") : (f.protagonists?.name ?? ""),
      context: isCause ? null : (f.protagonists?.context ?? null),
      about: isCause ? (f.description ?? "") : (f.protagonists?.about ?? ""),
      note: poll?.personal_note ?? "",
      topic: cardTopic,
      parentTopic: subset ? parentTitle : null,
      charity: charity?.name ?? "",
      items,
      photo: isCause
        ? (f.photo_url ?? null)
        : (f.protagonists?.photo_url ?? null),
      open: !f.closed_at && new Date(f.closes_at) > new Date(),
      edges: {
        count: edges.count,
        e1: edges.e1 ?? null,
        e2: edges.e2 ?? null,
        e3: edges.e3 ?? null,
      },
    };
  });
  out.sort((a, b) => a.name.localeCompare(b.name));
  process.stdout.write(JSON.stringify(out, null, 1));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
