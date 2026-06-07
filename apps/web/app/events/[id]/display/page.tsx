import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { DisplayScreen } from "@/components/display-screen"
import type { TopicItem } from "@favpoll/types"

type Props = {
  params: Promise<{ id: string }>
}

export default async function DisplayPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from("events")
    .select(
      "*, protagonists!events_protagonist_id_fkey(*), event_charities(charities(name))"
    )
    .eq("id", id)
    .single()

  if (!event) notFound()

  const { data: rawPoll } = await supabase
    .from("event_polls")
    .select("*, topics(id, title)")
    .eq("event_id", id)
    .maybeSingle()

  const pollId = rawPoll?.id ?? null

  const { data: allItems } = rawPoll?.topic_id
    ? await supabase
        .from("topic_items")
        .select("*")
        .eq("topic_id", rawPoll.topic_id)
    : { data: null }

  // Total raised
  const { data: pledges } = await supabase
    .from("pledges")
    .select("total_amount")
    .eq("event_poll_id", pollId ?? "")
    .is("withdrawn_at", null)

  const initialTotalRaised = (pledges ?? []).reduce(
    (s, p) => s + p.total_amount,
    0
  )

  const charityName =
    (event.event_charities as { charities: { name: string } }[])?.[0]?.charities
      ?.name ?? null

  const displayPoll = rawPoll
    ? {
        id: rawPoll.id,
        personal_reveal: rawPoll.personal_reveal ?? null,
        topic: {
          id:
            (rawPoll.topics as { id: string; title: string } | null)?.id ??
            rawPoll.topic_id,
          title:
            (rawPoll.topics as { id: string; title: string } | null)?.title ??
            "",
        },
        items: (allItems ?? []) as TopicItem[],
      }
    : null

  // Derive base URL for QR code
  const headersList = await headers()
  const host = headersList.get("host") ?? ""
  const proto = headersList.get("x-forwarded-proto") ?? "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`

  return (
    <DisplayScreen
      eventId={id}
      protagonistName={event.protagonists.name}
      dateLabel={event.protagonists.context ?? null}
      openingLine={event.opening_line ?? null}
      description={event.description ?? null}
      occasionType={event.occasion_type ?? null}
      charityName={charityName}
      poll={displayPoll}
      initialTotalRaised={initialTotalRaised}
      pollId={pollId}
      eventUrl={`${baseUrl}/events/${id}`}
    />
  )
}
