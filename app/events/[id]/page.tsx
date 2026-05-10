import { notFound, redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { EventContent } from "@/components/event-content"
import type {
  EventWithDetails,
  EventPollWithItems,
  PotAllocation,
  Topic,
  TopicItem,
} from "@/types"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()

  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from("events")
    .select("*, persons(*), charities(*)")
    .eq("id", id)
    .single()

  if (!event) notFound()

  if (event.is_private && !userId) {
    redirect(`/sign-in?redirect_url=/events/${id}`)
  }

  const { data: rawPolls } = await supabase
    .from("event_polls")
    .select("*")
    .eq("event_id", id)
    .order("created_at")

  const polls = rawPolls ?? []

  let pollsWithItems: EventPollWithItems[] = []

  if (polls.length > 0) {
    const topicIds = [...new Set(polls.map((p) => p.topic_id as string))]

    const { data: topicsData } = await supabase.from("topics").select("*").in("id", topicIds)
    const topicsById = Object.fromEntries((topicsData ?? []).map((t) => [t.id, t as Topic]))

    const finiteTopicIds = topicIds.filter((id) => topicsById[id]?.is_finite)
    const infiniteTopicIds = topicIds.filter((id) => !topicsById[id]?.is_finite)
    const infinitePollIds = polls
      .filter((p) => infiniteTopicIds.includes(p.topic_id as string))
      .map((p) => p.id)

    const finiteItemsPromise =
      finiteTopicIds.length > 0
        ? supabase.from("topic_items").select("*").in("topic_id", finiteTopicIds)
        : Promise.resolve({ data: null })

    const epiPromise =
      infinitePollIds.length > 0
        ? supabase
            .from("event_poll_items")
            .select("id, event_poll_id, topic_item_id, topic_items(*)")
            .in("event_poll_id", infinitePollIds)
        : Promise.resolve({ data: null })

    const [{ data: finiteItemsData }, { data: epiData }] = await Promise.all([
      finiteItemsPromise,
      epiPromise,
    ])

    const finiteItemsByTopicId: Record<string, TopicItem[]> = {}
    for (const item of (finiteItemsData ?? []) as TopicItem[]) {
      ;(finiteItemsByTopicId[item.topic_id] ??= []).push(item)
    }

    type EpiRow = { id: string; event_poll_id: string; topic_item_id: string; topic_items: TopicItem }
    const epiByPollId: Record<string, EpiRow[]> = {}
    for (const epi of (epiData ?? []) as unknown as EpiRow[]) {
      ;(epiByPollId[epi.event_poll_id] ??= []).push(epi)
    }

    pollsWithItems = polls.map((poll) => {
      const topic = topicsById[poll.topic_id] as Topic
      let items: TopicItem[]

      if (topic?.is_finite) {
        items = (finiteItemsByTopicId[poll.topic_id] ?? []).sort(
          (a, b) => b.all_time_pledged - a.all_time_pledged,
        )
      } else {
        items = (epiByPollId[poll.id] ?? [])
          .map((epi) => ({ ...epi.topic_items, event_poll_item_id: epi.id }))
          .sort((a, b) => b.all_time_pledged - a.all_time_pledged)
      }

      return { ...poll, topics: { ...topic, topic_items: items } }
    }) as EventPollWithItems[]
  }

  const { data: pot } = await supabase
    .from("event_pots")
    .select("*")
    .eq("event_id", id)
    .maybeSingle()

  let userPotAllocation: PotAllocation | null = null
  if (pot && userId) {
    const { data } = await supabase
      .from("pot_allocations")
      .select("*")
      .eq("pot_id", pot.id)
      .eq("allocated_to", userId)
      .maybeSingle()
    userPotAllocation = data
  }

  const existingPledgesByPollId: string[] = []
  if (userId && pollsWithItems.length > 0) {
    const { data: userPledges } = await supabase
      .from("pledges")
      .select("event_poll_id")
      .in(
        "event_poll_id",
        pollsWithItems.map((p) => p.id)
      )
      .eq("clerk_user_id", userId)
      .is("withdrawn_at", null)

    userPledges?.forEach((p) => existingPledgesByPollId.push(p.event_poll_id))
  }

  const { data: totalData } = await supabase
    .from("pledges")
    .select("total_amount")
    .in(
      "event_poll_id",
      pollsWithItems.length > 0 ? pollsWithItems.map((p) => p.id) : [""]
    )
    .is("withdrawn_at", null)

  const totalRaised = (totalData ?? []).reduce(
    (sum, p) => sum + (p.total_amount ?? 0),
    0
  )

  const typedEvent = event as EventWithDetails
  const isClosed = new Date(event.closes_at) < new Date()

  return (
    <main className="mx-auto max-w-330 px-4 pt-8 pb-16">
      <EventContent
        event={typedEvent}
        pollsWithItems={pollsWithItems}
        pot={pot ?? null}
        userPotAllocation={userPotAllocation}
        existingPledgesByPollId={existingPledgesByPollId}
        totalRaised={totalRaised}
        isClosed={isClosed}
        clerkUserId={userId}
      />
    </main>
  )
}
