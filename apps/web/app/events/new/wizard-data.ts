"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import type {
  Category,
  Charity,
  Topic,
  TopicItem,
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
  ] = await Promise.all([
    supabase.from("charities").select("*").eq("is_active", true).order("name"),
    supabase
      .from("topics")
      .select("*, topic_items(*), topic_categories(category_id)")
      .eq("is_active", true)
      .order("title"),
    supabase.from("categories").select("*").order("label"),
    supabase.from("charity_topics").select("charity_id, topic_id"),
  ])

  const topics: TopicWithMeta[] = (topicsAll ?? []).map((t) => ({
    ...(t as Topic),
    topic_items: (t.topic_items ?? []) as TopicItem[],
    category_ids: (t.topic_categories ?? []).map(
      (tc: { category_id: string }) => tc.category_id
    ),
  }))

  const suggestedTopicIds: Record<string, string[]> = {}
  for (const row of charityTopicsRows ?? []) {
    const { charity_id, topic_id } = row as {
      charity_id: string
      topic_id: string
    }
    if (!suggestedTopicIds[charity_id]) suggestedTopicIds[charity_id] = []
    suggestedTopicIds[charity_id].push(topic_id)
  }

  return {
    charities: (charities ?? []) as Charity[],
    topics,
    categories: (categories ?? []) as Category[],
    suggestedTopicIds,
  }
}
