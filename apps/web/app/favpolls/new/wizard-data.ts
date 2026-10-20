// WHY THIS IS NOT A SERVER ACTION (#1109, 2026-10-20).
//
// It carried "use server" and so Next published it as an endpoint, but it
// takes no arguments, is imported only by two server components
// (app/favpolls/new/page.tsx and app/favpolls/[id]/manage/page.tsx), and
// both of those call auth() for themselves. The directive was therefore
// the one UNAUTHENTICATED way to ask for the whole active catalogue —
// every charity with its register website and email overlaid, every
// topic, every subset — in one request.
//
// There was nothing to validate: an action with no parameters has no
// input, so the schema treatment this file was listed for does not apply
// to it. Removing the directive is the fix instead, and it is the same
// judgement as insertSubsetMembers in app/favpolls/new/actions.ts: when a
// thing is not an action, stop publishing it as one. A plain async
// function is what both callers wanted.

import { createAdminClient } from "@/lib/supabase/admin"
import { mirrorContactAndPurpose } from "@/lib/register-mirror"
import type {
  Category,
  Charity,
  Favourite,
  Topic,
  TopicWithMeta,
} from "@favpoll/types"

export async function getWizardData(): Promise<{
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
  suggestedTopicIds: Record<string, string[]>
}> {
  const supabase = createAdminClient()
  const [
    { data: charities },
    { data: topicsAll },
    { data: categories },
    { data: charityTopicsRows },
    { data: subsetsAll },
  ] = await Promise.all([
    supabase.from("charities").select("*").eq("is_active", true).order("name"),
    supabase
      .from("topics")
      .select("*, favourites(*), topic_categories(category_id)")
      .eq("is_active", true)
      // A homemade topic promoted to a subset leaves the picker (ruling
      // 8) but stays active for the favpoll that made it.
      .eq("is_listed", true)
      .order("title"),
    supabase.from("categories").select("*").order("label"),
    supabase.from("charity_topics").select("charity_id, topic_id"),
    // SUBSETS (favpoll-topic-rules §1, ruling 3): approved, listed, flat
    // in the picker beside their parent with an "of Animal" marker.
    supabase
      .from("topic_subsets")
      .select("id, topic_id, title, topic_subset_items(favourite_id)")
      .eq("status", "approved")
      .eq("is_active", true)
      .order("title"),
  ])

  // THE SITE ADDRESS COMES FROM THE MIRROR (step 4 of the charity-profiles
  // note), not from the copy on `charities` that step 5 drops. The picker
  // shows it on every catalogue row, so it is overlaid here rather than
  // read per row: one query for the whole shelf.
  const register = await mirrorContactAndPurpose(
    (charities ?? []).map((c) => (c as Charity).registered_number)
  )
  const charitiesWithSite: Charity[] = ((charities ?? []) as Charity[]).map(
    (c) => {
      const row = register.get((c.registered_number ?? "").replace(/\D/g, ""))
      return row
        ? { ...c, registered_website: row.website, registered_email: row.email }
        : c
    }
  )

  const parentTopics: TopicWithMeta[] = (topicsAll ?? []).map((t) => ({
    ...(t as Topic),
    favourites: (t.favourites ?? []) as Favourite[],
    category_ids: (t.topic_categories ?? []).map(
      (tc: { category_id: string }) => tc.category_id
    ),
  }))
  const byId = new Map(parentTopics.map((t) => [t.id, t]))
  // A subset is a picker entry of its own: the parent's openness,
  // categories and placeholders; its own name and members.
  const subsetTopics: TopicWithMeta[] = (subsetsAll ?? []).flatMap((s) => {
    const parent = byId.get(s.topic_id)
    if (!parent) return []
    const memberIds = new Set(
      (s.topic_subset_items ?? []).map(
        (i: { favourite_id: string }) => i.favourite_id
      )
    )
    return [
      {
        ...parent,
        id: s.id,
        title: s.title,
        favourites: parent.favourites.filter((f) => memberIds.has(f.id)),
        subset_of: { topic_id: parent.id, title: parent.title },
      },
    ]
  })
  const topics = [...parentTopics, ...subsetTopics].sort((a, b) =>
    a.title.localeCompare(b.title)
  )

  const suggestedTopicIds: Record<string, string[]> = {}
  // The charity's own confirmed PERFECT TOPIC leads its suggestions
  // (2026-09-26); the admin's hand-picked list follows.
  for (const c of (charities ?? []) as Charity[]) {
    if (!c.perfect_topic_id) continue
    // A perfect SUBSET leads (its picker entry, id = the subset's), the
    // whole topic behind it (favpoll-topic-rules §1, step 4).
    suggestedTopicIds[c.id] = c.perfect_subset_id
      ? [c.perfect_subset_id, c.perfect_topic_id]
      : [c.perfect_topic_id]
  }
  for (const row of charityTopicsRows ?? []) {
    const { charity_id, topic_id } = row as {
      charity_id: string
      topic_id: string
    }
    if (!suggestedTopicIds[charity_id]) suggestedTopicIds[charity_id] = []
    if (!suggestedTopicIds[charity_id].includes(topic_id))
      suggestedTopicIds[charity_id].push(topic_id)
  }

  return {
    charities: charitiesWithSite,
    topics,
    categories: (categories ?? []) as Category[],
    suggestedTopicIds,
  }
}
