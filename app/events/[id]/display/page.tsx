import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { DisplayScreen } from "@/components/display-screen"
import type { TopicItem } from "@/types"

type Props = {
  params: Promise<{ id: string }>
}

export default async function DisplayPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from("events")
    .select("*, protagonists!events_protagonist_id_fkey(*), event_charities(charities(name))")
    .eq("id", id)
    .single()

  if (!event) notFound()

  const { data: rawPolls } = await supabase
    .from("event_polls")
    .select("*, topics(id, title)")
    .eq("event_id", id)
    .order("created_at")

  const polls = rawPolls ?? []
  const pollIds = polls.map((p) => p.id)

  // Fetch items for each poll's topic
  const topicIds = [...new Set(polls.map((p) => p.topic_id).filter(Boolean))]
  const { data: allItems } = await supabase
    .from("topic_items")
    .select("*")
    .in("topic_id", topicIds)

  const itemsByTopic: Record<string, TopicItem[]> = {}
  for (const item of allItems ?? []) {
    ;(itemsByTopic[item.topic_id] ??= []).push(item as TopicItem)
  }

  // Total raised
  const { data: pledges } = await supabase
    .from("pledges")
    .select("total_amount")
    .in("event_poll_id", pollIds)
    .is("withdrawn_at", null)

  const initialTotalRaised = (pledges ?? []).reduce(
    (s, p) => s + p.total_amount,
    0
  )

  const charityName =
    (event.event_charities as { charities: { name: string } }[])?.[0]
      ?.charities?.name ?? null

  const displayPolls = polls.map((poll) => ({
    id: poll.id,
    personal_framing: poll.personal_framing ?? null,
    personal_reveal: poll.personal_reveal ?? null,
    topic: {
      id: poll.topics?.id ?? poll.topic_id,
      title: poll.topics?.title ?? "",
    },
    items: itemsByTopic[poll.topic_id ?? ""] ?? [],
  }))

  // Derive base URL for QR code
  const headersList = await headers()
  const host = headersList.get("host") ?? ""
  const proto = headersList.get("x-forwarded-proto") ?? "https"
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`

  return (
    <DisplayScreen
      eventId={id}
      protagonistName={event.protagonists.name}
      dateLabel={event.protagonists.date_label ?? null}
      occasionLabel={event.occasion_label ?? null}
      description={event.description ?? null}
      occasion={event.occasion}
      charityName={charityName}
      polls={displayPolls}
      initialTotalRaised={initialTotalRaised}
      pollIds={pollIds}
      eventUrl={`${baseUrl}/events/${id}`}
    />
  )
}
