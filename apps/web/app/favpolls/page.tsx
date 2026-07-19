import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { FavpollListCard } from "@/components/favpoll-list-card"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import type { CardResultItem } from "@/components/favpoll-list-card/use-favpoll-list-card-pledge"
import { OCCASION_TYPES_BY_REGISTER, type Register } from "@/lib/registers"
import { NewFavpollFab } from "@/components/new-favpoll-fab"
import { FavpollsListClient } from "./favpolls-list-client"
import type { PublicStatusFilter } from "./list-utils"

export const metadata = {
  title: "Favpolls — favpoll",
  description:
    "Real charitable polls happening right now. Pledge your favourites and honour the people behind them.",
}

// The visitor-facing occasion rail: fundraisers live under "cause" in the
// register model; "celebrating" spans both celebrating registers.
const REGISTER_RAIL: { value: string | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "remembering", label: "In memory" },
  { value: "celebrating", label: "Celebrating" },
  { value: "cause", label: "For a cause" },
  { value: "neutral", label: "Open" },
]

const FAVPOLL_SELECT = `
  id,
  subject,
  cause_label,
  category,
  opening_line,
  description,
  closes_at,
  closed_at,
  occasion_type,
  total_raised,
  is_exemplar,
  protagonist:protagonists ( name ),
  charities:favpoll_charities (
    charity:charities ( id, name, logo_url, registered_number )
  ),
  favpoll_polls (
    id,
    topic_id,
    topics (
      title,
      is_finite,
      favourites ( id, label, all_time_pledged )
    ),
    favpoll_poll_favourites (
      favourites ( id, label, all_time_pledged )
    )
  )
`

type RawFavourite = { id: string; label: string; all_time_pledged?: number }
type RawEpf = { favourites: RawFavourite }
type RawPoll = {
  id: string
  topic_id: string | null
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
  occasion_type: string | null
  total_raised: number
  is_exemplar: boolean
  protagonist: { name: string } | null
  charities: { charity: import("@favpoll/types").Charity }[]
  favpoll_polls: RawPoll | null
}

export default async function FavpollsPage({
  searchParams,
}: {
  searchParams: Promise<{
    register?: string
    occasion_type?: string
    state?: string
  }>
}) {
  const params = await searchParams
  const activeRegister = params.register ?? null
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

  if (activeRegister) {
    const reg = activeRegister as Register | "celebrating"
    // The rail's "Celebrating" chip spans both celebrating registers
    const types =
      reg === "celebrating"
        ? [
            ...OCCASION_TYPES_BY_REGISTER.celebrating_one,
            ...OCCASION_TYPES_BY_REGISTER.celebrating_many,
          ]
        : (OCCASION_TYPES_BY_REGISTER[reg] ?? [])
    if (reg === "neutral") {
      const allNonNeutral = (
        Object.entries(OCCASION_TYPES_BY_REGISTER) as [Register, string[]][]
      )
        .filter(([r]) => r !== "neutral")
        .flatMap(([, t]) => t)
      favpollsQuery = favpollsQuery.or(
        `occasion_type.is.null,occasion_type.not.in.(${allNonNeutral.join(",")})`
      )
    } else if (types.length > 0) {
      favpollsQuery = favpollsQuery.in("occasion_type", types)
    }
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
  const hasFilter = !!(activeRegister || activeOccasionType)
  let fallbackExemplars: RawFavpoll[] | null = null

  if (hasFilter && (favpolls?.length ?? 0) === 0) {
    let exemplarQuery = supabase
      .from("favpolls")
      .select(FAVPOLL_SELECT)
      .eq("is_private", false)
      .eq("is_listed", true)
      .eq("is_exemplar", true)
      .not("closed_at", "is", null)

    if (activeRegister) {
      const reg = activeRegister as Register | "celebrating"
      const types =
        reg === "celebrating"
          ? [
              ...OCCASION_TYPES_BY_REGISTER.celebrating_one,
              ...OCCASION_TYPES_BY_REGISTER.celebrating_many,
            ]
          : (OCCASION_TYPES_BY_REGISTER[reg] ?? [])
      if (reg === "neutral") {
        const allNonNeutral = (
          Object.entries(OCCASION_TYPES_BY_REGISTER) as [Register, string[]][]
        )
          .filter(([r]) => r !== "neutral")
          .flatMap(([, t]) => t)
        exemplarQuery = exemplarQuery.or(
          `occasion_type.is.null,occasion_type.not.in.(${allNonNeutral.join(",")})`
        )
      } else if (types.length > 0) {
        exemplarQuery = exemplarQuery.in("occasion_type", types)
      }
    }

    exemplarQuery = exemplarQuery
      .order("created_at", { ascending: false })
      .limit(8)

    const { data: exemplars } = await exemplarQuery
    if ((exemplars?.length ?? 0) > 0) {
      fallbackExemplars = exemplars as unknown as RawFavpoll[]
    }
  }

  const displayFavpolls =
    fallbackExemplars ?? ((favpolls ?? []) as unknown as RawFavpoll[])
  const showingExemplars = !!fallbackExemplars

  // For authenticated users, pre-fetch unlocked results for polls they've
  // pledged on. The user's pledges decide entitlement only; the standings
  // themselves are each item's all_time_pledged — the record's number, the
  // same source the poll page's RankingList displays ("reveal its
  // standing"), NOT a per-poll pledge aggregation.
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

      const pledgedPollIds = (pledges ?? []).map(
        (p) => p.favpoll_poll_id as string
      )

      for (const fp of displayFavpolls) {
        const rawPoll = fp.favpoll_polls
        if (!rawPoll || !pledgedPollIds.includes(rawPoll.id)) continue
        const isFinite = rawPoll.topics?.is_finite ?? false
        const items = isFinite
          ? (rawPoll.topics?.favourites ?? [])
          : (rawPoll.favpoll_poll_favourites ?? [])
              .map((epf) => epf.favourites)
              .filter(Boolean)
        const sorted = [...items].sort(
          (a, b) =>
            (b.all_time_pledged ?? 0) - (a.all_time_pledged ?? 0) ||
            a.label.localeCompare(b.label)
        )
        const max = sorted[0]?.all_time_pledged ?? 0
        pledgedResultsByPollId.set(
          rawPoll.id,
          sorted.map((item) => ({
            label: item.label,
            amountPence: Math.round((item.all_time_pledged ?? 0) * 100),
            widthPercent:
              max > 0
                ? Math.round(((item.all_time_pledged ?? 0) / max) * 100)
                : 0,
          }))
        )
      }
    }
  }

  // Normalise once for the client list (and the exemplar shelf)
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
    return { ...fp, poll }
  })

  // Register rail — the record's category rail, for occasions. Link-driven
  // so the server keeps doing the filtering and the exemplar fallback.
  const rail = (
    <div
      className="mx-auto flex max-w-330 scrollbar-none gap-1 overflow-x-auto px-4 py-2"
      aria-label="Filter by occasion"
    >
      {REGISTER_RAIL.map(({ value, label }) => {
        const selected = activeRegister === value
        return (
          <Link
            key={label}
            href={value ? `/favpolls?register=${value}` : "/favpolls"}
            aria-current={selected ? "page" : undefined}
            className={
              selected
                ? "inline-flex h-6 shrink-0 items-center rounded-full border border-primary bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
                : "inline-flex h-6 shrink-0 items-center rounded-full border border-border bg-muted px-3 py-1 text-sm font-normal text-muted-foreground transition-all hover:border-border-strong hover:text-primary"
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
        <div className="sticky top-14 z-30 border-b border-border bg-background">
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
