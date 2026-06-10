import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { NewEventWizard } from "@/components/new-event-wizard"
import type {
  Category,
  Charity,
  Topic,
  TopicItem,
  TopicWithMeta,
} from "@favpoll/types"

export default async function NewEventPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in?redirect_url=/events/new")

  const supabase = createAdminClient()
  const [{ data: charities }, { data: topicsAll }, { data: categories }] =
    await Promise.all([
      supabase
        .from("charities")
        .select("*")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("topics")
        .select("*, topic_items(*), topic_categories(category_id)")
        .eq("is_active", true)
        .order("title"),
      supabase.from("categories").select("*").order("label"),
    ])

  const topics: TopicWithMeta[] = (topicsAll ?? []).map((t) => ({
    ...(t as Topic),
    topic_items: (t.topic_items ?? []) as TopicItem[],
    category_ids: (t.topic_categories ?? []).map(
      (tc: { category_id: string }) => tc.category_id
    ),
  }))

  return (
    <NewEventWizard
      data={{
        charities: (charities ?? []) as Charity[],
        topics,
        categories: (categories ?? []) as Category[],
      }}
    />
  )
}
