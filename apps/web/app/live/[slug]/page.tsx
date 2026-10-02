import { RegisterScope } from "@/components/register-scope"
import { paletteForRegister } from "@/lib/register-palette"
import { picksSuspended } from "@/lib/picks-suspended"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchAllRows } from "@/lib/supabase/paginate"
import { overlayStandings, pollStandings } from "@/lib/poll-standings"
import { fetchPollItems } from "@/lib/poll-items"
import { pollTitle } from "@/lib/poll-title"
import { RoomShell } from "@/components/room-shell"
import { deriveRegister } from "@/lib/registers"
import type {
  Favourite,
  FavpollCategory,
  FavpollGrouping,
  FavpollPollWithItems,
  FavpollWithDetails,
  Topic,
} from "@favpoll/types"

// THE LIVE DISPLAY — the screen in the room (a TV, a projector), at an
// unguessable slug so the chrome's way back to manage stays the
// presenter's. Since 2026-09-30 it is the favpoll page's own sheet in
// the room presentation (components/room-shell), loaded with the same
// service-role reads the page makes: nobody is signed in on a projector,
// and the standings, the book and the totals are what the room watches.

type Props = {
  params: Promise<{ slug: string }>
}

export default async function LiveDisplayPage({ params }: Props) {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: favpoll } = await supabase
    .from("favpolls")
    .select(
      "*, protagonists!favpolls_protagonist_id_fkey(*), favpoll_charities(charities(*))"
    )
    .eq("live_slug", slug)
    .single()

  if (!favpoll) notFound()
  const id: string = favpoll.id

  const { data: rawPoll } = await supabase
    .from("favpoll_polls")
    .select("*, topics(*), topic_subsets(title)")
    .eq("favpoll_id", id)
    .maybeSingle()
  const pollId = rawPoll?.id ?? null
  const topicRow = (rawPoll?.topics ?? null) as Topic | null

  const [
    allItems,
    pledges,
    { data: wallRows },
    standings,
    { data: organiserUser },
  ] = await Promise.all([
    rawPoll?.topic_id && pollId
      ? fetchPollItems(supabase, {
          pollId,
          topicId: rawPoll.topic_id,
          isFinite: topicRow?.is_finite ?? false,
          subsetId: (rawPoll as { subset_id?: string | null }).subset_id,
        })
      : Promise.resolve([] as Favourite[]),
    pollId
      ? fetchAllRows<{ total_amount: number }>((from, to) =>
          supabase
            .from("pledges")
            .select("total_amount")
            .eq("favpoll_poll_id", pollId)
            .is("withdrawn_at", null)
            .range(from, to)
        )
      : Promise.resolve([]),
    pollId
      ? supabase
          .from("pledges")
          .select(
            `id, display_name, is_anonymous, clerk_user_id, created_at,
               total_amount, guest_book_display, pot_allocation_id, message,
               pledge_allocations ( favourites ( label ) )`
          )
          .eq("favpoll_poll_id", pollId)
          .is("withdrawn_at", null)
          .order("created_at", { ascending: false })
          .limit(24)
      : Promise.resolve({ data: [] }),
    pollId ? pollStandings(supabase, pollId) : Promise.resolve(null),
    favpoll.created_by
      ? supabase
          .from("users")
          .select("display_name, avatar_url")
          .eq("id", favpoll.created_by)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const totalRaised = pledges.reduce((s, p) => s + p.total_amount, 0)

  const organiser = organiserUser
    ? {
        name: organiserUser.display_name ?? "Organiser",
        avatarUrl: organiserUser.avatar_url ?? null,
      }
    : null

  // Resolve clerk display names for signed-in pledgers
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

  // The room reads the book as the entitled guest does: labels always,
  // amounts only where the organiser shows them and the guest let it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const showAmounts = (favpoll as any).show_guest_amounts === true
  const wallEntries = (wallRows ?? []).map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalAmount: number = (r as any).total_amount ?? 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const display: string = (r as any).guest_book_display ?? "pick"
    const guestHidAmount = display === "none"
    const labels = (
      (r.pledge_allocations ?? []) as unknown as {
        favourites: { label: string } | null
      }[]
    )
      .map((a) => a.favourites?.label)
      .filter((l): l is string => typeof l === "string")
    return {
      id: r.id,
      name: r.is_anonymous
        ? null
        : r.clerk_user_id
          ? (wallUserNames[r.clerk_user_id] ?? null)
          : (r.display_name ?? null),
      labels,
      amount: showAmounts && !guestHidAmount ? totalAmount : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: ((r as any).message as string) || null,
      created_at: r.created_at,
    }
  })

  // THE ROOM'S STANDINGS (founder, 2026-10-01): the pledged favourites,
  // best first, as the entitled guest sees them — and then the rest at
  // ZERO, in catalogue order, as the invitation: on a projector an
  // unpledged favourite is true information ("nobody has picked Tokyo
  // yet"), where a grey skeleton would read as a screen still loading.
  // A finite topic shows its whole set; an open topic's catalogue can
  // run to hundreds, so it shows the first ROOM_ZERO_ROWS. Hidden items
  // stay hidden. The rows vanish naturally as pledges arrive.
  const overlaid = (
    standings ? overlayStandings(allItems, standings) : allItems
  ).filter((item) => !item.is_hidden)
  const pledged = overlaid
    .filter((item) => item.all_time_count > 0)
    .sort((a, b) => {
      if (b.all_time_pledged !== a.all_time_pledged)
        return b.all_time_pledged - a.all_time_pledged
      return a.label.localeCompare(b.label)
    })
  const unpledged = overlaid
    .filter((item) => item.all_time_count === 0)
    .sort((a, b) => {
      const da = a.display_order ?? null
      const db = b.display_order ?? null
      if (da !== null && db !== null && da !== db) return da - db
      if (da !== null && db === null) return -1
      if (da === null && db !== null) return 1
      return a.label.localeCompare(b.label)
    })
  const ROOM_ZERO_ROWS = 8
  const items = [
    ...pledged,
    ...(topicRow?.is_finite ? unpledged : unpledged.slice(0, ROOM_ZERO_ROWS)),
  ]

  const pollWithItems: FavpollPollWithItems | null =
    rawPoll && topicRow
      ? ({
          ...rawPoll,
          topics: {
            ...topicRow,
            // A subset's title stands in for the topic's (lib/poll-title).
            title: pollTitle(rawPoll) ?? topicRow.title,
            favourites: items,
          },
        } as FavpollPollWithItems)
      : null

  const headersList = await headers()
  const host = headersList.get("host") ?? ""
  const proto = headersList.get("x-forwarded-proto") ?? "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`

  const register = deriveRegister(
    (favpoll.category ?? null) as FavpollCategory | null,
    (favpoll.grouping ?? "individual") as FavpollGrouping,
    favpoll.subject
  )
  // The presence dial's default: a memorial turns the volume down.
  const defaultVariant = register === "remembering" ? "tribute" : "fundraiser"

  const isClosed =
    !!favpoll.closed_at || new Date(favpoll.closes_at) < new Date()

  return (
    <RegisterScope palette={paletteForRegister(register)}>
      <RoomShell
        favpoll={favpoll as FavpollWithDetails}
        pollWithItems={pollWithItems}
        totalRaised={totalRaised}
        wallEntries={wallEntries}
        organiser={organiser}
        isClosed={isClosed}
        picksSuspended={picksSuspended(favpoll)}
        // The chrome's menu navigates HERE — to the manage hub, the room
        // the presenter came from (founder, 2026-09-03) — while the QR
        // target stays the guest short form. See app/p/[code]/page.tsx.
        manageUrl={`${baseUrl}/favpolls/${id}/manage`}
        qrUrl={`${baseUrl}/p/${favpoll.short_code}`}
        defaultVariant={defaultVariant}
      />
    </RegisterScope>
  )
}
