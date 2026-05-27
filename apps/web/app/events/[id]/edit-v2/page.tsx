import { notFound, redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { EventFormV2 } from "@/components/event-form-v2"
import type {
  Category,
  Charity,
  Topic,
  TopicItem,
  TopicWithMeta,
} from "@favpoll/types"
import type { EventFormValues } from "@/components/event-form-v2/schema"

type Props = { params: Promise<{ id: string }> }

export default async function EditEventV2Page({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect(`/sign-in?redirect_url=/events/${id}/edit-v2`)

  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from("events")
    .select(
      "*, protagonists!events_protagonist_id_fkey(*), event_charities(charity_id)"
    )
    .eq("id", id)
    .single()

  if (!event) notFound()
  if (event.created_by !== userId) redirect(`/events/${id}`)

  const [
    { data: rawPoll },
    { data: charities },
    { data: topicsAll },
    { data: categories },
    { data: pot },
  ] = await Promise.all([
    supabase.from("event_polls").select("*").eq("event_id", id).maybeSingle(),
    supabase.from("charities").select("*").eq("is_active", true).order("name"),
    supabase
      .from("topics")
      .select("*, topic_items(*), topic_categories(category_id)")
      .order("title"),
    supabase.from("categories").select("*").order("label"),
    supabase.from("event_pots").select("*").eq("event_id", id).maybeSingle(),
  ])

  const enrichedTopics: TopicWithMeta[] = (topicsAll ?? []).map((t) => ({
    ...(t as Topic),
    topic_items: (t.topic_items ?? []) as TopicItem[],
    category_ids: (t.topic_categories ?? []).map(
      (tc: { category_id: string }) => tc.category_id
    ),
  }))

  // Build the pre-selected topic for the form
  let preselectedTopics: EventFormValues["topics"] = []
  if (rawPoll?.topic_id) {
    const topic = enrichedTopics.find((t) => t.id === rawPoll.topic_id)
    if (topic) {
      preselectedTopics = [
        {
          topicId: topic.id,
          title: topic.title,
          isCustom: false,
          items: topic.topic_items.map((i) => ({ id: i.id, label: i.label })),
          customLabels: [],
        },
      ]
    }
  }

  const defaultValues: Partial<EventFormValues> = {
    occasion: event.occasion ?? "",
    name: event.protagonists.name ?? "",
    context: event.protagonists.context ?? "",
    openingLine: event.opening_line ?? "",
    about: event.protagonists.about ?? "",
    photoUrl: event.protagonists.photo_url ?? undefined,
    closesAt: new Date(event.closes_at),
    charities: (event.event_charities ?? []).map(
      (ec: { charity_id: string }) => ec.charity_id
    ),
    sharedFund: pot?.total_deposited ?? 0,
    isPrivate: event.is_private ?? false,
    reveal: rawPoll?.personal_reveal ?? "",
    topics: preselectedTopics,
  }

  return (
    <EventFormV2
      mode="edit"
      charities={(charities ?? []) as Charity[]}
      topics={enrichedTopics}
      categories={(categories ?? []) as Category[]}
      eventId={id}
      protagonistId={event.protagonist_id}
      existingPollId={rawPoll?.id}
      defaultValues={defaultValues}
    />
  )
}
