import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { EventFormV2 } from "@/components/event-form-v2"
import type { Category, Charity, Topic, TopicItem, TopicWithMeta } from "@favpoll/types"

export default async function NewEventV2Page() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = createAdminClient()

  const [{ data: charities }, { data: topics }, { data: categories }] =
    await Promise.all([
      supabase.from("charities").select("*").eq("is_active", true).order("name"),
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
      (tc: { category_id: string }) => tc.category_id,
    ),
  }))

  return (
    <EventFormV2
      mode="create"
      charities={(charities ?? []) as Charity[]}
      topics={enrichedTopics}
      categories={(categories ?? []) as Category[]}
    />
  )
}
