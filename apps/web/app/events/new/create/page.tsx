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

export default async function CreateEventPage({ searchParams }: Props) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const params = await searchParams
  const occasionType = params.occasionType ?? ""
  if (!occasionType) redirect("/events/new/honour")

  const topicId = params.topicId ?? ""
  const topicIsCustom = params.topicIsCustom === "true"
  const topicTitle = params.topicTitle ?? ""
  const isPlural = params.isPlural === "true"
  const charityIds = params.charityIds
    ? params.charityIds.split(",").filter(Boolean)
    : []

  if (!topicId && !topicIsCustom) {
    redirect(
      "/events/new/love?" +
        new URLSearchParams({ occasionType, isPlural: String(isPlural) })
    )
  }
  if (charityIds.length === 0) {
    const loveParams = new URLSearchParams({
      occasionType,
      isPlural: String(isPlural),
    })
    if (topicIsCustom) {
      loveParams.set("topicIsCustom", "true")
      loveParams.set("topicTitle", topicTitle)
    } else {
      loveParams.set("topicId", topicId)
      loveParams.set("topicTitle", topicTitle)
    }
    redirect("/events/new/charity?" + loveParams)
  }

  const supabase = createAdminClient()
  const [{ data: charities }, { data: topics }, { data: categories }] =
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

  const enrichedTopics: TopicWithMeta[] = (topics ?? []).map((t) => ({
    ...(t as Topic),
    topic_items: (t.topic_items ?? []) as TopicItem[],
    category_ids: (t.topic_categories ?? []).map(
      (tc: { category_id: string }) => tc.category_id
    ),
  }))

  // Reconstruct topic defaultValue
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
  const closingStr = suggestClosingDate(register, occasionType || null)
  const closesAt = new Date(closingStr)

  const defaultValues: Partial<EventFormValues> = {
    occasionType,
    register,
    isPlural,
    topics: defaultTopics,
    charities: charityIds,
    closesAt,
  }

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
