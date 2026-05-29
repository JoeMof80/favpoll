import { notFound, redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { EventContent } from "@/components/event-content"
import { EventSubheader } from "@/components/event-subheader"
import type {
  EventWithDetails,
  EventPollWithItems,
  PotAllocation,
  Topic,
  TopicItem,
} from "@favpoll/types"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()

  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from("events")
    .select(
      "*, protagonists!events_protagonist_id_fkey(*), event_charities(charities(*))"
    )
    .eq("id", id)
    .single()

  if (!event) notFound()

  if (event.is_private && !userId) {
    redirect(`/sign-in?redirect_url=/events/${id}`)
  }

  const isOrganiser = userId === event.created_by

  const { data: rawPoll } = await supabase
    .from("event_polls")
    .select("*")
    .eq("event_id", id)
    .maybeSingle()

  let pollWithItems: EventPollWithItems | null = null

  if (rawPoll) {
    const topicId = rawPoll.topic_id as string

    const { data: topicData } = await supabase
      .from("topics")
      .select("*")
      .eq("id", topicId)
      .single()

    const topic = topicData as Topic | null

    let items: TopicItem[] = []

    if (topic?.is_finite) {
      const { data: finiteItemsData } = await supabase
        .from("topic_items")
        .select("*")
        .eq("topic_id", topicId)
      items = ((finiteItemsData ?? []) as TopicItem[]).sort((a, b) => {
        const diff = b.all_time_pledged - a.all_time_pledged
        if (diff !== 0) return diff
        const da = a.display_order ?? null
        const db = b.display_order ?? null
        if (da !== null && db !== null) return da - db
        if (da !== null) return -1
        if (db !== null) return 1
        return a.label.localeCompare(b.label)
      })
    } else {
      type EpiRow = {
        id: string
        event_poll_id: string
        topic_item_id: string
        is_hidden: boolean
        is_guest_added: boolean
        topic_items: TopicItem
      }
      const { data: epiData } = await supabase
        .from("event_poll_items")
        .select(
          "id, event_poll_id, topic_item_id, is_hidden, is_guest_added, topic_items(*)"
        )
        .eq("event_poll_id", rawPoll.id)
        .order("label", { referencedTable: "topic_items", ascending: true })

      const allItems = ((epiData ?? []) as unknown as EpiRow[])
        .map((epi) => ({
          ...epi.topic_items,
          event_poll_item_id: epi.id,
          is_hidden: epi.is_hidden,
          is_guest_added: epi.is_guest_added,
        }))
        .sort((a, b) => {
          if (b.all_time_pledged !== a.all_time_pledged)
            return b.all_time_pledged - a.all_time_pledged
          return a.label.localeCompare(b.label)
        })

      // Organiser sees all items (including hidden); guests see only visible ones
      items = isOrganiser
        ? allItems
        : allItems.filter((item) => !item.is_hidden)
    }

    pollWithItems = {
      ...rawPoll,
      topics: { ...(topic as Topic), topic_items: items },
    } as EventPollWithItems
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

  const hasPledged =
    userId && pollWithItems
      ? await supabase
          .from("pledges")
          .select("id")
          .eq("event_poll_id", pollWithItems.id)
          .eq("clerk_user_id", userId)
          .is("withdrawn_at", null)
          .limit(1)
          .then(({ data }) => (data?.length ?? 0) > 0)
      : false

  const { data: totalData } = await supabase
    .from("pledges")
    .select("total_amount")
    .eq("event_poll_id", pollWithItems?.id ?? "")
    .is("withdrawn_at", null)

  const totalRaised = (totalData ?? []).reduce(
    (sum, p) => sum + (p.total_amount ?? 0),
    0
  )

  const typedEvent = event as EventWithDetails
  const isClosed = !!event.closed_at || new Date(event.closes_at) < new Date()

  // Hide poll with unvetted custom topic from non-organisers
  const visiblePoll =
    isOrganiser || pollWithItems?.topics.is_active !== false
      ? pollWithItems
      : null

  return (
    <div className="bg-primary/5">
      <EventSubheader
        eventId={id}
        isOrganiser={isOrganiser}
        isClosed={isClosed}
      />
      <main
        className={`mx-auto min-h-[calc(100vh-3.5rem)] max-w-5xl bg-background p-16 drop-shadow-lg ${isOrganiser ? "pb-28" : "pb-16"}`}
      >
        <EventContent
          event={typedEvent}
          pollWithItems={visiblePoll}
          pot={pot ?? null}
          userPotAllocation={userPotAllocation}
          hasPledged={!!hasPledged}
          totalRaised={totalRaised}
          isClosed={isClosed}
          clerkUserId={userId}
          isOrganiser={isOrganiser}
        />
      </main>
    </div>
  )
}
