import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { FavpollListCard } from "@/components/favpoll-list-card"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import type { CardResultItem } from "@/components/favpoll-list-card/use-favpoll-list-card-pledge"
import { withLiveTotals } from "@/lib/live-totals"
import { isMessageReveal, isQuoteReveal } from "@/lib/mechanic-steps"
import { pollSetStandings } from "@/lib/poll-standings"
import { NewFavpollFab } from "@/components/new-favpoll-fab"
import { FavpollsListClient } from "./favpolls-list-client"
import type { PublicStatusFilter } from "./list-utils"

export const metadata = {
  title: "All favpolls — favpoll",
  description:
    "Real charitable polls happening right now. Pledge your favourites and honour the people behind them.",
}

// The kind rail — the hero demo's four kinds, filtered at CATEGORY level
// (founder call 2026-07-22). Doctrine: "Fundraiser is a Type, not a Who" —
// a marathon runner keeps their protagonist; only Cause is faceless. No
// pill for the neutral register (organiser fallback; lives under All).
type Kind = "memorial" | "celebration" | "fundraiser" | "cause"
const KIND_RAIL: { value: Kind | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "memorial", label: "Memorial" },
  { value: "celebration", label: "Celebration" },
  { value: "fundraiser", label: "Fundraiser" },
  { value: "cause", label: "Cause" },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- builder pass-through
function applyKindFilter<Q extends { eq: any; neq: any }>(
  query: Q,
  kind: Kind
): Q {
  if (kind === "cause") return query.eq("subject", "cause")
  if (kind === "fundraiser")
    return query.eq("category", "fundraiser").neq("subject", "cause")
  return query.eq("category", kind)
}

const FAVPOLL_SELECT = `
  id,
  subject,
  cause_label,
  category,
  opening_line,
  description,
  closes_at,
  closed_at,
  created_at,
  occasion_type,
  total_raised,
  is_exemplar,
  photo_url,
  protagonist:protagonists ( name, photo_url, about ),
  charities:favpoll_charities (
    charity:charities ( id, name, logo_url, registered_number )
  ),
  favpoll_polls (
    id,
    topic_id,
    personal_reveal,
    topics (
      title,
      is_finite,
      favourites ( id, label )
    ),
    favpoll_poll_favourites (
      favourites ( id, label )
    )
  )
`

type RawFavourite = { id: string; label: string }
type RawEpf = { favourites: RawFavourite }
type RawPoll = {
  id: string
  topic_id: string | null
  /** Server-side only — reduced to content-free flags before the client. */
  personal_reveal: string | null
  topics: {
    title: string
    is_finite: boolean
    favourites: RawFavourite[]
  } | null
  favpoll_poll_favourites: RawEpf[]
}
type RawFavpoll = {
  id: string
  subject: string
  cause_label: string | null
  category: string | null
  opening_line: string
  description: string | null
  closes_at: string
  closed_at: string | null
  created_at: string
  occasion_type: string | null
  total_raised: number
  is_exemplar: boolean
  photo_url: string | null
  protagonist: {
    name: string
    photo_url: string | null
    about: string | null
  } | null
  charities: { charity: import("@favpoll/types").Charity }[]
  favpoll_polls: RawPoll | null
}

export default async function FavpollsPage({
  searchParams,
}: {
  searchParams: Promise<{
    kind?: string
    register?: string
    occasion_type?: string
    state?: string
  }>
}) {
  const params = await searchParams
  const REGISTER_TO_KIND: Record<string, Kind> = {
    remembering: "memorial",
    celebrating: "celebration",
    cause: "cause",
  }
  const activeKind: Kind | null =
    (params.kind as Kind | undefined) ??
    (params.register ? (REGISTER_TO_KIND[params.register] ?? null) : null)
  const activeOccasionType = params.occasion_type ?? null
  // Status filtering is client-side now (the segmented control); the URL
  // param only seeds the initial segment so old ?state=closed links keep
  // working.
  const initialStatus: PublicStatusFilter =
    params.state === "closed" ? "closed" : "live"

  const supabase = createAdminClient()
  const { userId } = await auth()

  // Build favpoll query — live and closed together; the client filters
  let favpollsQuery = supabase
    .from("favpolls")
    .select(FAVPOLL_SELECT)
    .eq("is_private", false)
    .eq("is_listed", true)

  if (activeKind) {
    favpollsQuery = applyKindFilter(favpollsQuery, activeKind)
  }
  if (activeOccasionType) {
    favpollsQuery = favpollsQuery.eq("occasion_type", activeOccasionType)
  }

  favpollsQuery = favpollsQuery
    .order("created_at", { ascending: false })
    .limit(60)

  const { data: favpolls } = await favpollsQuery

  // Exemplar fallback: if a register/occasion_type filter returns no results,
  // show exemplar favpolls for that filter so the shelf is never empty.
  const hasFilter = !!(activeKind || activeOccasionType)
  let fallbackExemplars: RawFavpoll[] | null = null

  if (hasFilter && (favpolls?.length ?? 0) === 0) {
    let exemplarQuery = supabase
      .from("favpolls")
      .select(FAVPOLL_SELECT)
      .eq("is_private", false)
      .eq("is_listed", true)
      .eq("is_exemplar", true)
      .not("closed_at", "is", null)

    if (activeKind) {
      exemplarQuery = applyKindFilter(exemplarQuery, activeKind)
    }

    exemplarQuery = exemplarQuery
      .order("created_at", { ascending: false })
      .limit(8)

    const { data: exemplars } = await exemplarQuery
    if ((exemplars?.length ?? 0) > 0) {
      fallbackExemplars = exemplars as unknown as RawFavpoll[]
    }
  }

  // Live favpolls carry a settlement total_raised of 0 until close — overlay
  // the real sums (see lib/live-totals) so the cards' raised figures are live.
  const displayFavpolls = await withLiveTotals(
    supabase,
    fallbackExemplars ?? ((favpolls ?? []) as unknown as RawFavpoll[])
  )
  const showingExemplars = !!fallbackExemplars

  // For authenticated users, pre-fetch unlocked results for polls they've
  // pledged on. The user's pledges decide entitlement; the standings are
  // THIS poll's pledge sums (lib/poll-standings) — the bars must agree
  // with the card's raised figure. The all-time record lives on /record.
  const pledgedResultsByPollId = new Map<string, CardResultItem[]>()

  if (userId && !showingExemplars) {
    const pollIds = displayFavpolls
      .map((fp) => (fp.favpoll_polls as RawPoll | null)?.id)
      .filter((id): id is string => Boolean(id))

    if (pollIds.length > 0) {
      const { data: pledges } = await supabase
        .from("pledges")
        .select("id, favpoll_poll_id")
        .eq("clerk_user_id", userId)
        .in("favpoll_poll_id", pollIds)

      const pledgedPollIds = [
        ...new Set((pledges ?? []).map((p) => p.favpoll_poll_id as string)),
      ]

      if (pledgedPollIds.length > 0) {
        const standingsByPoll = await pollSetStandings(supabase, pledgedPollIds)

        for (const fp of displayFavpolls) {
          const rawPoll = fp.favpoll_polls
          if (!rawPoll || !pledgedPollIds.includes(rawPoll.id)) continue
          const isFinite = rawPoll.topics?.is_finite ?? false
          const items = isFinite
            ? (rawPoll.topics?.favourites ?? [])
            : (rawPoll.favpoll_poll_favourites ?? [])
                .map((epf) => epf.favourites)
                .filter(Boolean)
          const totals =
            standingsByPoll.get(rawPoll.id)?.totals ?? new Map<string, number>()
          const merged = items.map((item) => ({
            label: item.label,
            total: totals.get(item.id) ?? 0,
          }))
          const sorted = merged.sort(
            (a, b) => b.total - a.total || a.label.localeCompare(b.label)
          )
          const max = sorted[0]?.total ?? 0
          pledgedResultsByPollId.set(
            rawPoll.id,
            sorted.map((item) => ({
              label: item.label,
              amountPence: Math.round(item.total * 100),
              widthPercent: max > 0 ? Math.round((item.total / max) * 100) : 0,
            }))
          )
        }
      }
    }
  }

  // Normalise once for the client list (and the exemplar shelf).
  // personal_reveal NEVER crosses to the client from here — it reduces to
  // the same content-free flags the favpoll page ships un-entitled viewers
  // (hasReveal + how the lock card may speak about it), and favpoll_polls
  // is stripped from the spread.
  const cardFavpolls = displayFavpolls.map((fp) => {
    const rawPoll = fp.favpoll_polls ?? null
    let poll: {
      id: string
      topic_id: string | null
      topic: {
        title: string
        is_finite: boolean
        favourites: RawFavourite[]
      } | null
    } | null = null
    if (rawPoll) {
      const isFinite = rawPoll.topics?.is_finite ?? false
      const favourites = isFinite
        ? (rawPoll.topics?.favourites ?? [])
        : (rawPoll.favpoll_poll_favourites ?? [])
            .map((epf) => epf.favourites)
            .filter(Boolean)
      poll = {
        id: rawPoll.id,
        topic_id: rawPoll.topic_id,
        topic: rawPoll.topics
          ? {
              title: rawPoll.topics.title,
              is_finite: isFinite,
              favourites,
            }
          : null,
      }
    }
    const reveal = rawPoll?.personal_reveal ?? null
    const labels = (poll?.topic?.favourites ?? []).map((f) => f.label)
    const { favpoll_polls: _stripped, ...rest } = fp
    return {
      ...rest,
      poll,
      hasReveal: !!reveal?.trim(),
      revealIsQuote: isQuoteReveal(reveal),
      revealIsMessage: isMessageReveal(reveal, labels),
    }
  })

  // Register rail — the record's category rail, for occasions. Link-driven
  // so the server keeps doing the filtering and the exemplar fallback.
  const rail = (
    <div
      className="mx-auto flex max-w-330 scrollbar-none gap-1 overflow-x-auto px-4 pt-1.5 pb-3"
      aria-label="Filter by occasion"
    >
      <span className="hidden shrink-0 self-center text-[11px] font-medium tracking-widest text-muted-foreground uppercase md:inline">
        Filters
      </span>
      {KIND_RAIL.map(({ value, label }) => {
        const selected = activeKind === value
        return (
          <Link
            key={label}
            href={value ? `/favpolls?kind=${value}` : "/favpolls"}
            aria-current={selected ? "page" : undefined}
            className={
              selected
                ? "inline-flex h-6 shrink-0 items-center rounded-full border border-primary bg-primary/5 px-3 py-1 text-sm font-medium text-primary"
                : "inline-flex h-6 shrink-0 items-center rounded-full border border-border bg-background px-3 py-1 text-sm font-normal text-muted-foreground transition-all hover:border-border-strong hover:text-primary"
            }
          >
            {label}
          </Link>
        )
      })}
    </div>
  )

  return (
    <main className="min-h-screen bg-muted">
      {showingExemplars && (
        <div className="sticky top-14 z-30 border-b border-border bg-muted">
          {rail}
        </div>
      )}

      <div
        className={
          showingExemplars ? "mx-auto max-w-330 px-4 pt-8 pb-16" : undefined
        }
      >
        {activeOccasionType && (
          <div className="mb-6 flex items-center gap-1.5">
            <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
              {activeOccasionType}
            </span>
            <Link
              href="/favpolls"
              className="text-sm text-muted-foreground hover:text-foreground"
              aria-label="Clear filter"
            >
              ×
            </Link>
          </div>
        )}

        {showingExemplars ? (
          <>
            <SectionEyebrow variant="muted" className="mb-6">
              No open favpolls yet for this occasion — here are some examples to
              inspire you.
            </SectionEyebrow>
            <ul
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              role="list"
            >
              {cardFavpolls.map((fp) => (
                <FavpollListCard
                  key={fp.id}
                  favpoll={fp}
                  clerkUserId={userId}
                />
              ))}
            </ul>
          </>
        ) : (
          <FavpollsListClient
            rail={rail}
            favpolls={cardFavpolls}
            clerkUserId={userId}
            initialResultsByPollId={Object.fromEntries(pledgedResultsByPollId)}
            initialStatus={initialStatus}
          />
        )}
      </div>
      <NewFavpollFab />
    </main>
  )
}
