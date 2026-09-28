"use server"

import { createAdminClient } from "@/lib/supabase/admin"
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
    charities: (charities ?? []) as Charity[],
    topics,
    categories: (categories ?? []) as Category[],
    suggestedTopicIds,
  }
}
