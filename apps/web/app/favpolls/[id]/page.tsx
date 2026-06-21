import { notFound, redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { FavpollContent } from "@/components/favpoll-content"
import { FavpollSubheader } from "@/components/favpoll-subheader"
import type {
  FavpollWithDetails,
  FavpollPollWithItems,
  PotAllocation,
  Topic,
  Favourite,
} from "@favpoll/types"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()

  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from("favpolls")
    .select(
      "*, protagonists!favpolls_protagonist_id_fkey(*), favpoll_charities(charities(*))"
    )
    .eq("id", id)
    .single()

  if (!event) notFound()

  if (event.is_private && !userId) {
    redirect(`/sign-in?redirect_url=/favpolls/${id}`)
  }

  const isOrganiser = userId === event.created_by

  const { data: rawPoll } = await supabase
    .from("favpoll_polls")
    .select("*")
    .eq("favpoll_id", id)
    .maybeSingle()

  let pollWithItems: FavpollPollWithItems | null = null

  if (rawPoll) {
    const topicId = rawPoll.topic_id as string

    const { data: topicData } = await supabase
      .from("topics")
      .select("*")
      .eq("id", topicId)
      .single()

    const topic = topicData as Topic | null

    let items: Favourite[] = []

    if (topic?.is_finite) {
      const { data: finiteItemsData } = await supabase
        .from("favourites")
        .select("*")
        .eq("topic_id", topicId)
      items = ((finiteItemsData ?? []) as Favourite[]).sort((a, b) => {
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
        favpoll_poll_id: string
        favourite_id: string
        is_hidden: boolean
        is_guest_added: boolean
        favourites: Favourite
      }
      const { data: epiData } = await supabase
        .from("favpoll_poll_favourites")
        .select(
          "id, favpoll_poll_id, favourite_id, is_hidden, is_guest_added, favourites(*)"
        )
        .eq("favpoll_poll_id", rawPoll.id)
        .order("label", { referencedTable: "favourites", ascending: true })

      const allItems = ((epiData ?? []) as unknown as EpiRow[])
        .map((epi) => ({
          ...epi.favourites,
          favpoll_poll_item_id: epi.id,
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
      topics: { ...(topic as Topic), favourites: items },
    } as FavpollPollWithItems
  }

  const { data: pot } = await supabase
    .from("favpoll_pots")
    .select("*")
    .eq("favpoll_id", id)
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
          .eq("favpoll_poll_id", pollWithItems.id)
          .eq("clerk_user_id", userId)
          .is("withdrawn_at", null)
          .limit(1)
          .then(({ data }) => (data?.length ?? 0) > 0)
      : false

  const { data: totalData } = await supabase
    .from("pledges")
    .select("total_amount")
    .eq("favpoll_poll_id", pollWithItems?.id ?? "")
    .is("withdrawn_at", null)

  const totalRaised = (totalData ?? []).reduce(
    (sum, p) => sum + (p.total_amount ?? 0),
    0
  )

  const typedEvent = event as FavpollWithDetails
  const isClosed = !!event.closed_at || new Date(event.closes_at) < new Date()

  // Hide poll with unvetted custom topic from non-organisers
  const visiblePoll =
    isOrganiser || pollWithItems?.topics.is_active !== false
      ? pollWithItems
      : null

  return (
    <>
      <FavpollSubheader
        eventId={id}
        isOrganiser={isOrganiser}
        isClosed={isClosed}
      />
      <FavpollContent
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
    </>
  )
}
