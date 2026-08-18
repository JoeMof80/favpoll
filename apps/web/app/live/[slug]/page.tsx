import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchAllRows } from "@/lib/supabase/paginate"
import { overlayStandings, pollStandings } from "@/lib/poll-standings"
import { fetchPollItems } from "@/lib/poll-items"
import { DisplayScreen } from "@/components/display-screen"
import { deriveRegister } from "@/lib/registers"
import type {
  Favourite,
  FavpollCategory,
  FavpollGrouping,
} from "@favpoll/types"

type Props = {
  params: Promise<{ slug: string }>
}

// Capability-URL surface: the slug is unguessable (uuid), handed out by the
// organiser. The page shows full standings + the reveal to the room, so
// possession of the link IS the authorisation.
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
    .select("*, topics(id, title, is_finite)")
    .eq("favpoll_id", id)
    .maybeSingle()

  const pollId = rawPoll?.id ?? null

  // One round trip for everything keyed on the poll id. Each branch gates
  // on pollId — no poll, no query (eq("") is an invalid uuid PostgREST
  // rejects, which fetchAllRows turns into a crash).
  const [allItems, pledges, { data: wallRows }, standings] = await Promise.all([
    // The display's list is THIS poll's items (lib/poll-items): the topic's
    // closed set for finite topics, the curated visible epf rows for infinite
    // ones. Previously this read the whole topic canon — an infinite-topic
    // display showed every canonical item instead of the poll's list.
    rawPoll?.topic_id && pollId
      ? fetchPollItems(supabase, {
          pollId,
          topicId: rawPoll.topic_id,
          isFinite:
            (rawPoll.topics as { is_finite?: boolean } | null)?.is_finite ??
            false,
        })
      : Promise.resolve([] as Favourite[]),
    // Total raised — paginated (the telethon figure is money; the silent
    // 1,000-row cap would under-report a big room)
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
    // Initial wall (kept live client-side via the wall endpoint). The
    // display is a public, organiser-sanctioned surface: backed-labels are
    // shown; anonymity still holds (anonymous → "Someone").
    pollId
      ? supabase
          .from("pledges")
          .select(
            `id, display_name, is_anonymous, clerk_user_id, created_at,
             pledge_allocations ( favourites ( label ) )`
          )
          .eq("favpoll_poll_id", pollId)
          .is("withdrawn_at", null)
          .order("created_at", { ascending: false })
          .limit(24)
      : Promise.resolve({ data: [] }),
    pollId ? pollStandings(supabase, pollId) : Promise.resolve(null),
  ])

  const initialTotalRaised = pledges.reduce((s, p) => s + p.total_amount, 0)

  const charityRows = (
    (favpoll.favpoll_charities ?? []) as {
      charities: import("@favpoll/types").Charity
    }[]
  ).map((ec) => ec.charities)
  const charityName = charityRows[0]?.name ?? null

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
  const initialWallEntries = (wallRows ?? []).map((r) => ({
    id: r.id,
    name: r.is_anonymous
      ? null
      : r.clerk_user_id
        ? (wallUserNames[r.clerk_user_id] ?? null)
        : (r.display_name ?? null),
    labels: (
      (r.pledge_allocations ?? []) as unknown as {
        favourites: { label: string } | null
      }[]
    )
      .map((a) => a.favourites?.label)
      .filter((l): l is string => typeof l === "string"),
    created_at: r.created_at,
  }))

  // The display's bars show THIS poll's pledges — they must sum to the
  // telethon total above them (see lib/poll-standings). The interval
  // router.refresh() re-runs this overlay, keeping the room live.
  const items = standings ? overlayStandings(allItems, standings) : allItems

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
        items,
      }
    : null

  // Derive base URL for QR code
  const headersList = await headers()
  const host = headersList.get("host") ?? ""
  const proto = headersList.get("x-forwarded-proto") ?? "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`

  // The presence dial's starting position: memorials open in the quiet
  // tribute variant, everything else in fundraiser. The presenter can
  // override live from the display's menu.
  const register = deriveRegister(
    (favpoll.category ?? null) as FavpollCategory | null,
    (favpoll.grouping ?? "individual") as FavpollGrouping,
    favpoll.subject
  )
  const defaultVariant = register === "remembering" ? "tribute" : "fundraiser"

  // Cause favpolls have no protagonist row — the cause label is the name.
  const isCause = favpoll.subject === "cause"
  const displayName = isCause
    ? (favpoll.cause_label ?? "")
    : (favpoll.protagonists?.name ?? "")

  return (
    <DisplayScreen
      protagonistName={displayName}
      dateLabel={isCause ? null : (favpoll.protagonists?.context ?? null)}
      openingLine={favpoll.opening_line ?? null}
      occasionType={favpoll.occasion_type ?? null}
      charityName={charityName}
      goalAmount={favpoll.goal_amount ?? null}
      poll={displayPoll}
      initialTotalRaised={initialTotalRaised}
      favpollUrl={`${baseUrl}/favpolls/${id}`}
      // QR target is the short form; favpollUrl stays long because the chrome
      // navigates to it. See app/p/[code]/page.tsx.
      qrUrl={`${baseUrl}/p/${favpoll.short_code}`}
      initialWallEntries={initialWallEntries}
      charities={charityRows}
      closesAt={favpoll.closed_at ? null : (favpoll.closes_at ?? null)}
      isClosed={!!favpoll.closed_at || new Date(favpoll.closes_at) < new Date()}
      defaultVariant={defaultVariant}
      favpollId={id}
      avatar={
        isCause
          ? null
          : {
              name: displayName,
              photoUrl: favpoll.protagonists?.photo_url ?? null,
            }
      }
    />
  )
}
