import { createAdminClient } from "@/lib/supabase/admin"
import { RankingsClient } from "./rankings-client"
import type { Category, Topic, Favourite } from "@favpoll/types"

type TopicWithItems = Topic & {
  favourites: Favourite[]
  category_ids: string[]
}

export default async function RankingsPage() {
  const supabase = createAdminClient()

  const [{ data: categories }, { data: topics }] = await Promise.all([
    supabase.from("categories").select("*").order("label"),
    supabase
      .from("topics")
      .select("*, favourites(*), topic_categories(category_id)")
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
  }))

  const totalPledged = rankedTopics
    .flatMap((t) => t.favourites)
    .reduce((sum, i) => sum + i.all_time_pledged, 0)

  return (
    <RankingsClient
      categories={(categories ?? []) as Category[]}
      topics={rankedTopics}
      totalPledged={totalPledged}
    />
  )
}
