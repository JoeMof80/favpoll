import { createAdminClient } from "@/lib/supabase/admin"
import { RankingsClient } from "./record-client"
import type { Category, Topic, Favourite } from "@favpoll/types"

type TopicWithItems = Topic & {
  favourites: Favourite[]
  category_ids: string[]
  subsets: { id: string; title: string }[]
}

export default async function RankingsPage() {
  const supabase = createAdminClient()

  const [{ data: categories }, { data: topics }] = await Promise.all([
    supabase.from("categories").select("*").order("label"),
    supabase
      .from("topics")
      .select(
        "*, favourites(*), topic_categories(category_id), topic_subsets(id, title, status, is_active)"
      )
      .order("title"),
  ])

  const rankedTopics: TopicWithItems[] = (topics ?? []).map((topic) => ({
    ...(topic as Topic),
    favourites: [...((topic.favourites ?? []) as Favourite[])].sort(
      (a, b) => b.all_time_pledged - a.all_time_pledged
    ),
    category_ids: (topic.topic_categories ?? []).map(
      (tc: { category_id: string }) => tc.category_id
    ),
    // Each approved subset has a record of its own (favpoll-topic-rules
    // §1, ruling 4), reached from the parent's card.
    subsets: (
      (topic.topic_subsets ?? []) as {
        id: string
        title: string
        status: string
        is_active: boolean
      }[]
    )
      .filter((s) => s.status === "approved" && s.is_active)
      .map((s) => ({ id: s.id, title: s.title }))
      .sort((a, b) => a.title.localeCompare(b.title)),
  }))

  return (
    <RankingsClient
      categories={(categories ?? []) as Category[]}
      topics={rankedTopics}
    />
  )
}
