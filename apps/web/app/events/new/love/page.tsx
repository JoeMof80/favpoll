import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Category, Topic, TopicItem, TopicWithMeta } from "@favpoll/types"
import { LoveFlowPage } from "./love-flow-page"

type Props = { searchParams: Promise<Record<string, string>> }

export default async function LovePage({ searchParams }: Props) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const params = await searchParams
  const occasionType = params.occasionType ?? ""
  if (!occasionType) redirect("/events/new/honour")

  const supabase = createAdminClient()
  const [{ data: topics }, { data: categories }] = await Promise.all([
    supabase
      .from("topics")
      .select("*, topic_items(*), topic_categories(category_id)")
      .eq("is_active", true)
      .order("title"),
    supabase.from("categories").select("*").order("label"),
  ])

  const enrichedTopics: TopicWithMeta[] = (topics ?? []).map((t) => ({
    ...(t as Topic),
    topic_items: (t.topic_items ?? []) as TopicItem[],
    category_ids: (t.topic_categories ?? []).map(
      (tc: { category_id: string }) => tc.category_id
    ),
  }))

  return (
    <LoveFlowPage
      topics={enrichedTopics}
      categories={(categories ?? []) as Category[]}
      initialParams={{
        occasionType,
        isPlural: params.isPlural === "true",
        topicId: params.topicId ?? "",
        topicIsCustom: params.topicIsCustom === "true",
        topicTitle: params.topicTitle ?? "",
      }}
    />
  )
}
