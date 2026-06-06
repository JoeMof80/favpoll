import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { EventCard } from "@/components/event-card"
import { EventCardEmpty } from "@/components/event-card-empty"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import type { CardResultItem } from "@/components/event-card/use-event-card-pledge"

export const metadata = {
  title: "Live events — favpoll",
  description:
    "Real charitable polls happening right now. Pledge your favourites and honour the people behind them.",
}

export default async function LiveEventsPage() {
  const supabase = createAdminClient()
  const { userId } = await auth()

  const { data: events } = await supabase
    .from("events")
    .select(
      `
      id,
      opening_line,
      description,
      closes_at,
      register,
      occasion_type,
      total_raised,
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
    )
    .eq("is_private", false)
    .is("closed_at", null)
    .order("created_at", { ascending: false })
    .limit(24)

  // For authenticated users, find which polls they've already pledged to
  // and pre-fetch results for those polls so returning visitors see results immediately
  const pledgedResultsByPollId = new Map<string, CardResultItem[]>()

  if (userId) {
    const pollIds = ((events ?? []) as unknown as RawEvent[])
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
        // Fetch pledge_allocations for all pledges in one query, grouped by poll
        const pledgeIds = (pledges ?? []).map((p) => p.id)
        const { data: allocations } = await supabase
          .from("pledge_allocations")
          .select("pledge_id, topic_item_id, amount")
          .in("pledge_id", pledgeIds)

        // Map pledge_id → event_poll_id for grouping
        const pledgeToPoll = new Map(
          (pledges ?? []).map((p) => [p.id, p.event_poll_id as string])
        )

        // Aggregate pledge totals by poll → topic_item_id
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

        // Build a label map for every poll item from the already-fetched event data
        const pollItemLabels = new Map<string, Map<string, string>>()
        for (const ev of (events ?? []) as unknown as RawEvent[]) {
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

        // Merge: all poll items with totals (0 for unpledged items)
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
    register: string
    occasion_type: string | null
    total_raised: number
    protagonist: { name: string }
    charities: { charity: import("@favpoll/types").Charity }[]
    event_polls: RawPoll | null
  }

  return (
    <main className="bg-muted">
      <div className="mx-auto max-w-330 px-6 py-12">
        {events?.length === 0 ? (
          <EventCardEmpty />
        ) : (
          <ul
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            role="list"
          >
            {((events ?? []) as unknown as RawEvent[]).map((ev) => {
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
