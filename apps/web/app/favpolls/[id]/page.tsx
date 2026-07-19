import { notFound, redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { deriveRankHistory } from "@/lib/rank-history"
import { overlayStandings, pollStandings } from "@/lib/poll-standings"
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

export default async function FavpollPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()

  const supabase = createAdminClient()

  const { data: favpoll } = await supabase
    .from("favpolls")
    .select(
      "*, protagonists!favpolls_protagonist_id_fkey(*), favpoll_charities(charities(*))"
    )
    .eq("id", id)
    .single()

  if (!favpoll) notFound()

  if (favpoll.is_private && !userId) {
    redirect(`/sign-in?redirect_url=/favpolls/${id}`)
  }

  const isOrganiser = userId === favpoll.created_by

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

    // The bars on a poll page show THIS poll's pledges (they must sum to
    // the favpoll's raised figure) — not the favourites table's all-time
    // record, which lives on /record. overlayStandings swaps each item's
    // all_time_* fields for the poll's own sums/counts before sorting.
    const standings = await pollStandings(supabase, rawPoll.id as string)

    let items: Favourite[] = []

    if (topic?.is_finite) {
      const { data: finiteItemsData } = await supabase
        .from("favourites")
        .select("*")
        .eq("topic_id", topicId)
      items = overlayStandings(
        (finiteItemsData ?? []) as Favourite[],
        standings
      ).sort((a, b) => {
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

      const allItems = overlayStandings(
        ((epiData ?? []) as unknown as EpiRow[]).map((epi) => ({
          ...epi.favourites,
          favpoll_poll_item_id: epi.id,
          is_hidden: epi.is_hidden,
          is_guest_added: epi.is_guest_added,
        })),
        standings
      ).sort((a, b) => {
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

  // Guest wall: names resolve server-side (guest display_name, or
  // users.display_name for signed-in pledgers); anonymous → null →
  // rendered as "Someone". Amounts never appear on the wall.
  const { data: wallRows } = await supabase
    .from("pledges")
    .select(
      `id, display_name, is_anonymous, clerk_user_id, created_at,
       pledge_allocations ( favourites ( label ) )`
    )
    .eq("favpoll_poll_id", pollWithItems?.id ?? "")
    .is("withdrawn_at", null)
    .order("created_at", { ascending: false })
    .limit(24)

  const wallClerkIds = [
    ...new Set(
      (wallRows ?? [])
        .map((r) => r.clerk_user_id)
        .filter((v): v is string => !!v)
    ),
  ]
  const { data: wallUsers } = wallClerkIds.length
    ? await supabase
        .from("users")
        .select("id, display_name")
        .in("id", wallClerkIds)
    : { data: [] }
  const wallUserNames = Object.fromEntries(
    (wallUsers ?? []).map((u) => [u.id, u.display_name])
  )

  const typedFavpoll = favpoll as FavpollWithDetails
  const isClosed =
    !!favpoll.closed_at || new Date(favpoll.closes_at) < new Date()

  // Entitlement: viewer may see real reveal + real per-favourite amounts
  const entitled = !!hasPledged || isClosed || isOrganiser

  // Safe to send even when un-entitled: whether a reveal exists, without its
  // content — the lock pill must not promise a reveal on favpolls without one.
  const hasReveal = !!pollWithItems?.personal_reveal

  // Gate sensitive data server-side for un-entitled viewers of open polls
  if (!entitled && pollWithItems) {
    pollWithItems = {
      ...pollWithItems,
      personal_reveal: null,
      topics: {
        ...pollWithItems.topics,
        favourites: pollWithItems.topics.favourites.map((f) => ({
          ...f,
          all_time_pledged: 0,
          all_time_count: 0,
        })),
      },
    }
  }

  // Wall entries: anonymous pledges show no name; un-entitled viewers
  // of open polls must not see which favourites were backed (the same
  // standings gate applied to per-favourite amounts above).
  const wallEntries = (wallRows ?? []).map((r) => ({
    id: r.id,
    name: r.is_anonymous
      ? null
      : r.clerk_user_id
        ? (wallUserNames[r.clerk_user_id] ?? null)
        : (r.display_name ?? null),
    labels: entitled
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r.pledge_allocations ?? [])
          .map((a: any) => a.favourites?.label)
          .filter((l: unknown): l is string => typeof l === "string")
      : [],
    created_at: r.created_at,
  }))

  // Bump chart ("the story of the poll"): rank-over-time, closed
  // favpolls only (open polls gate standings behind the reveal lock; a
  // live chart would leak them). Ordinal only — no amounts. Its own
  // unbounded, chronological query (the wall query is capped at 24 and
  // reverse-ordered). Gated on a minimum pledge count so sparse polls
  // don't show sparse charts.
  const RANK_HISTORY_MIN_PLEDGES = 8
  let rankHistory: ReturnType<typeof deriveRankHistory> | null = null
  if (isClosed && pollWithItems) {
    const { data: historyRows } = await supabase
      .from("pledges")
      .select(
        `created_at,
         pledge_allocations ( amount, favourite_id, favourites ( label ) )`
      )
      .eq("favpoll_poll_id", pollWithItems.id)
      .is("withdrawn_at", null)
      .order("created_at", { ascending: true })

    if ((historyRows?.length ?? 0) >= RANK_HISTORY_MIN_PLEDGES) {
      const labels: Record<string, string> = {}
      const events = (historyRows ?? []).map((r) => ({
        createdAt: r.created_at,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        allocations: ((r.pledge_allocations ?? []) as any[]).map((a) => {
          labels[a.favourite_id] = a.favourites?.label ?? a.favourite_id
          return { favouriteId: a.favourite_id, amount: a.amount ?? 0 }
        }),
      }))
      rankHistory = deriveRankHistory(events, labels)
    }
  }

  // Hide poll with unvetted custom topic from non-organisers
  const visiblePoll =
    isOrganiser || pollWithItems?.topics.is_active !== false
      ? pollWithItems
      : null

  return (
    <>
      <FavpollSubheader
        favpollId={id}
        isOrganiser={isOrganiser}
        isClosed={isClosed}
      />
      <FavpollContent
        favpoll={typedFavpoll}
        pollWithItems={visiblePoll}
        pot={pot ?? null}
        userPotAllocation={userPotAllocation}
        totalRaised={totalRaised}
        isClosed={isClosed}
        wallEntries={wallEntries}
        rankHistory={rankHistory}
        clerkUserId={userId}
        isOrganiser={isOrganiser}
        entitled={entitled}
        hasReveal={hasReveal}
      />
    </>
  )
}
