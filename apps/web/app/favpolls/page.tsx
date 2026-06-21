import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { FavpollListCard } from "@/components/favpoll-list-card"
import { FavpollListCardEmpty } from "@/components/favpoll-list-card-empty"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import type { CardResultItem } from "@/components/favpoll-list-card/use-favpoll-list-card-pledge"
import { cn } from "@/lib/utils"
import { OCCASION_TYPES_BY_REGISTER, type Register } from "@/lib/registers"

export const metadata = {
  title: "Favpolls — favpoll",
  description:
    "Real charitable polls happening right now. Pledge your favourites and honour the people behind them.",
}

const FAVPOLL_SELECT = `
  id,
  subject,
  cause_label,
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
  const showClosed = params.state === "closed"

  const supabase = createAdminClient()
  const { userId } = await auth()

  // Build favpoll query
  let favpollsQuery = supabase
    .from("favpolls")
    .select(FAVPOLL_SELECT)
    .eq("is_private", false)
    .eq("is_listed", true)

  if (showClosed) {
    favpollsQuery = favpollsQuery.not("closed_at", "is", null)
  } else {
    favpollsQuery = favpollsQuery.is("closed_at", null)
  }
  if (activeRegister) {
    const reg = activeRegister as Register
    const types = OCCASION_TYPES_BY_REGISTER[reg] ?? []
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
    .limit(24)

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
      const reg = activeRegister as Register
      const types = OCCASION_TYPES_BY_REGISTER[reg] ?? []
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

  // For authenticated users, pre-fetch pledge results for live favpolls
  const pledgedResultsByPollId = new Map<string, CardResultItem[]>()

  if (userId && !showClosed && !showingExemplars) {
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

      if (pledgedPollIds.length > 0) {
        const pledgeIds = (pledges ?? []).map((p) => p.id)
        const { data: allocations } = await supabase
          .from("pledge_allocations")
          .select("pledge_id, favourite_id, amount")
          .in("pledge_id", pledgeIds)

        const pledgeToPoll = new Map(
          (pledges ?? []).map((p) => [p.id, p.favpoll_poll_id as string])
        )

        const byPoll = new Map<string, Map<string, number>>()
        for (const row of allocations ?? []) {
          const pollId = pledgeToPoll.get(row.pledge_id)
          if (!pollId) continue
          if (!byPoll.has(pollId)) byPoll.set(pollId, new Map())
          const totals = byPoll.get(pollId)!
          totals.set(
            row.favourite_id,
            (totals.get(row.favourite_id) ?? 0) + (row.amount ?? 0)
          )
        }

        const pollItemLabels = new Map<string, Map<string, string>>()
        for (const fp of displayFavpolls) {
          const rawPoll = fp.favpoll_polls
          if (!rawPoll) continue
          const labelMap = new Map<string, string>()
          const isFinite = rawPoll.topics?.is_finite ?? false
          const items = isFinite
            ? (rawPoll.topics?.favourites ?? [])
            : (rawPoll.favpoll_poll_favourites ?? [])
                .map((epf) => epf.favourites)
                .filter(Boolean)
          for (const item of items) {
            labelMap.set(item.id, item.label)
          }
          pollItemLabels.set(rawPoll.id, labelMap)
        }

        for (const pollId of pledgedPollIds) {
          const totals = byPoll.get(pollId) ?? new Map<string, number>()
          const labelMap =
            pollItemLabels.get(pollId) ?? new Map<string, string>()
          const merged = [...labelMap.entries()].map(([id, label]) => ({
            label,
            total: totals.get(id) ?? 0,
          }))
          const sorted = merged.sort(
            (a, b) => b.total - a.total || a.label.localeCompare(b.label)
          )
          const max = sorted[0]?.total ?? 0
          pledgedResultsByPollId.set(
            pollId,
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

  const filterLabel = activeOccasionType ?? activeRegister ?? null

  return (
    <main className="bg-muted">
      <div className="mx-auto max-w-330 px-6 py-12">
        {/* State filter tabs */}
        <div className="mb-8 flex items-center gap-3">
          <Link
            href={
              activeRegister
                ? `/favpolls?register=${activeRegister}${activeOccasionType ? `&occasion_type=${encodeURIComponent(activeOccasionType)}` : ""}`
                : "/favpolls"
            }
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              !showClosed
                ? "bg-foreground text-background"
                : "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/15"
            )}
          >
            Live
          </Link>
          <Link
            href={`/favpolls?state=closed${activeRegister ? `&register=${activeRegister}` : ""}${activeOccasionType ? `&occasion_type=${encodeURIComponent(activeOccasionType)}` : ""}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              showClosed
                ? "bg-foreground text-background"
                : "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/15"
            )}
          >
            Closed
          </Link>
          {filterLabel && (
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-[#EEEDFE] px-3 py-1.5 text-sm font-medium text-[#534AB7]">
                {filterLabel}
              </span>
              <Link
                href={`/favpolls${showClosed ? "?state=closed" : ""}`}
                className="text-sm text-muted-foreground hover:text-foreground"
                aria-label="Clear filter"
              >
                ×
              </Link>
            </div>
          )}
        </div>

        {showingExemplars && (
          <SectionEyebrow variant="muted" className="mb-6">
            No live favpolls yet for this occasion — here are some examples to
            inspire you.
          </SectionEyebrow>
        )}

        {displayFavpolls.length === 0 ? (
          <FavpollListCardEmpty />
        ) : (
          <ul
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            role="list"
          >
            {displayFavpolls.map((fp) => {
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
              const initialResults = poll
                ? pledgedResultsByPollId.get(poll.id)
                : undefined
              return (
                <FavpollListCard
                  key={fp.id}
                  favpoll={{ ...fp, poll }}
                  clerkUserId={userId}
                  initialResults={initialResults}
                />
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
