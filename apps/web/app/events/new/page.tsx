import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { EventFormV2 } from "@/components/event-form-v2"
import { registerForOccasionType, suggestClosingDate } from "@/lib/registers"
import type {
  Category,
  Charity,
  Topic,
  TopicItem,
  TopicWithMeta,
} from "@favpoll/types"
import type { EventFormValues } from "@/components/event-form-v2/schema"

type Props = { searchParams: Promise<Record<string, string>> }

export default async function NewEventPage({ searchParams }: Props) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in?redirect_url=/events/new")

  const params = await searchParams
  const occasionType = params.occasionType ?? ""
  const isPlural = params.isPlural === "true"
  const topicId = params.topicId ?? ""
  const topicIsCustom = params.topicIsCustom === "true"
  const topicTitle = params.topicTitle ?? ""
  const charityIds = params.charityIds
    ? params.charityIds.split(",").filter(Boolean)
    : []

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

  const enrichedTopics: TopicWithMeta[] = (topicsAll ?? []).map((t) => ({
    ...(t as Topic),
    topic_items: (t.topic_items ?? []) as TopicItem[],
    category_ids: (t.topic_categories ?? []).map(
      (tc: { category_id: string }) => tc.category_id
    ),
  }))

  let defaultTopics: EventFormValues["topics"] = []
  if (topicIsCustom && topicTitle) {
    defaultTopics = [
      {
        topicId: "",
        title: topicTitle,
        isCustom: true,
        items: [],
        customLabels: [],
      },
    ]
  } else if (topicId) {
    const t = enrichedTopics.find((t) => t.id === topicId)
    if (t) {
      defaultTopics = [
        {
          topicId: t.id,
          title: t.title,
          isCustom: false,
          items: t.topic_items.map((i) => ({ id: i.id, label: i.label })),
          customLabels: [],
        },
      ]
    }
  }

  const register = registerForOccasionType(occasionType || null)

  const defaultValues: Partial<EventFormValues> = occasionType
    ? {
        occasionType,
        register,
        isPlural,
        isListed: register !== "remembering",
        topics: defaultTopics,
        charities: charityIds,
        closesAt: new Date(suggestClosingDate(register, occasionType)),
      }
    : {}

  return (
    <EventFormV2
      mode="create"
      charities={(charities ?? []) as Charity[]}
      topics={enrichedTopics}
      categories={(categories ?? []) as Category[]}
      defaultValues={defaultValues}
    />
  )
}
