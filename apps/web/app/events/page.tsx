import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { EventCard } from "@/components/event-card"
import { EventCardEmpty } from "@/components/event-card-empty"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import type { CardResultItem } from "@/components/event-card/use-event-card-pledge"
import { cn } from "@/lib/utils"
import { OCCASION_TYPES_BY_REGISTER, type Register } from "@/lib/registers"

export const metadata = {
  title: "Events — favpoll",
  description:
    "Real charitable polls happening right now. Pledge your favourites and honour the people behind them.",
}

const EVENT_SELECT = `
  id,
  opening_line,
  description,
  closes_at,
  closed_at,
  occasion_type,
  total_raised,
  is_exemplar,
  protagonist:protagonists ( name ),
  charities:event_charities (
    charity:charities ( id, name, logo_url, registered_number )
  ),
  event_polls (
    id,
    topic_id,
    topics (
      title,
      is_finite,
      topic_items ( id, label )
    ),
    event_poll_items (
      topic_items ( id, label )
    )
  )
`

type RawTopicItem = { id: string; label: string }
type RawEpi = { topic_items: RawTopicItem }
type RawPoll = {
  id: string
  topic_id: string | null
  topics: {
    title: string
    is_finite: boolean
    topic_items: RawTopicItem[]
  } | null
  event_poll_items: RawEpi[]
}
type RawEvent = {
  id: string
  opening_line: string
  description: string | null
  closes_at: string
  closed_at: string | null
  occasion_type: string | null
  total_raised: number
  is_exemplar: boolean
  protagonist: { name: string }
  charities: { charity: import("@favpoll/types").Charity }[]
  event_polls: RawPoll | null
}

export default async function EventsPage({
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

  // Build event query
  let eventsQuery = supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("is_private", false)
    .eq("is_listed", true)

  if (showClosed) {
    eventsQuery = eventsQuery.not("closed_at", "is", null)
  } else {
    eventsQuery = eventsQuery.is("closed_at", null)
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
      eventsQuery = eventsQuery.or(
        `occasion_type.is.null,occasion_type.not.in.(${allNonNeutral.join(",")})`
      )
    } else if (types.length > 0) {
      eventsQuery = eventsQuery.in("occasion_type", types)
    }
  }
  if (activeOccasionType) {
    eventsQuery = eventsQuery.eq("occasion_type", activeOccasionType)
  }

  eventsQuery = eventsQuery.order("created_at", { ascending: false }).limit(24)

  const { data: events } = await eventsQuery

  // Exemplar fallback: if a register/occasion_type filter returns no results,
  // show exemplar events for that filter so the shelf is never empty.
  const hasFilter = !!(activeRegister || activeOccasionType)
  let fallbackExemplars: RawEvent[] | null = null

  if (hasFilter && (events?.length ?? 0) === 0) {
    let exemplarQuery = supabase
      .from("events")
      .select(EVENT_SELECT)
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
      fallbackExemplars = exemplars as unknown as RawEvent[]
    }
  }

  const displayEvents =
    fallbackExemplars ?? ((events ?? []) as unknown as RawEvent[])
  const showingExemplars = !!fallbackExemplars

  // For authenticated users, pre-fetch pledge results for live events
  const pledgedResultsByPollId = new Map<string, CardResultItem[]>()

  if (userId && !showClosed && !showingExemplars) {
    const pollIds = displayEvents
      .map((ev) => (ev.event_polls as RawPoll | null)?.id)
      .filter((id): id is string => Boolean(id))

    if (pollIds.length > 0) {
      const { data: pledges } = await supabase
        .from("pledges")
        .select("id, event_poll_id")
        .eq("clerk_user_id", userId)
        .in("event_poll_id", pollIds)

      const pledgedPollIds = (pledges ?? []).map(
        (p) => p.event_poll_id as string
      )

      if (pledgedPollIds.length > 0) {
        const pledgeIds = (pledges ?? []).map((p) => p.id)
        const { data: allocations } = await supabase
          .from("pledge_allocations")
          .select("pledge_id, topic_item_id, amount")
          .in("pledge_id", pledgeIds)

        const pledgeToPoll = new Map(
          (pledges ?? []).map((p) => [p.id, p.event_poll_id as string])
        )

        const byPoll = new Map<string, Map<string, number>>()
        for (const row of allocations ?? []) {
          const pollId = pledgeToPoll.get(row.pledge_id)
          if (!pollId) continue
          if (!byPoll.has(pollId)) byPoll.set(pollId, new Map())
          const totals = byPoll.get(pollId)!
          totals.set(
            row.topic_item_id,
            (totals.get(row.topic_item_id) ?? 0) + (row.amount ?? 0)
          )
        }

        const pollItemLabels = new Map<string, Map<string, string>>()
        for (const ev of displayEvents) {
          const rawPoll = ev.event_polls
          if (!rawPoll) continue
          const labelMap = new Map<string, string>()
          const isFinite = rawPoll.topics?.is_finite ?? false
          const items = isFinite
            ? (rawPoll.topics?.topic_items ?? [])
            : (rawPoll.event_poll_items ?? [])
                .map((epi) => epi.topic_items)
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
                ? `/events?register=${activeRegister}${activeOccasionType ? `&occasion_type=${encodeURIComponent(activeOccasionType)}` : ""}`
                : "/events"
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
            href={`/events?state=closed${activeRegister ? `&register=${activeRegister}` : ""}${activeOccasionType ? `&occasion_type=${encodeURIComponent(activeOccasionType)}` : ""}`}
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
                href={`/events${showClosed ? "?state=closed" : ""}`}
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
            No live events yet for this occasion — here are some examples to
            inspire you.
          </SectionEyebrow>
        )}

        {displayEvents.length === 0 ? (
          <EventCardEmpty />
        ) : (
          <ul
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            role="list"
          >
            {displayEvents.map((ev) => {
              const rawPoll = ev.event_polls ?? null
              let poll: {
                id: string
                topic_id: string | null
                topic: { title: string; topic_items: RawTopicItem[] } | null
              } | null = null
              if (rawPoll) {
                const isFinite = rawPoll.topics?.is_finite ?? false
                const topicItems = isFinite
                  ? (rawPoll.topics?.topic_items ?? [])
                  : (rawPoll.event_poll_items ?? [])
                      .map((epi) => epi.topic_items)
                      .filter(Boolean)
                poll = {
                  id: rawPoll.id,
                  topic_id: rawPoll.topic_id,
                  topic: rawPoll.topics
                    ? { title: rawPoll.topics.title, topic_items: topicItems }
                    : null,
                }
              }
              const initialResults = poll
                ? pledgedResultsByPollId.get(poll.id)
                : undefined
              return (
                <EventCard
                  key={ev.id}
                  event={{ ...ev, poll }}
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
