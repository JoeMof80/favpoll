import { notFound } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchAllRows } from "@/lib/supabase/paginate"
import type { Topic, Favourite } from "@favpoll/types"
import { TopicRankings } from "./topic-rankings"
import { PageLayout } from "@/components/page-layout"
import { TopicChartCard } from "@/components/topic-chart-card"
import {
  deriveRankHistory,
  bucketEventsByWeek,
  type PledgeEvent,
} from "@/lib/rank-history"
import { isEstablishedRecord } from "@/lib/record"
import { subsetStanding } from "@/lib/subset-record"
import { formatCount, formatPoundsCompact } from "@/lib/i18n"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ subset?: string }>
}

export default async function TopicPage({ params, searchParams }: Props) {
  const { id } = await params
  const { subset: subsetParam } = await searchParams
  const supabase = createAdminClient()

  const { data: topic } = await supabase
    .from("topics")
    .select(
      "*, favourites(*), topic_subsets(id, title, status, is_active, topic_subset_items(favourite_id))"
    )
    .eq("id", id)
    .single()

  if (!topic) notFound()

  // The parent's whole-list record: the favourite rows' all-time totals
  // (favpoll-topic-rules §1, ruling 4 — subset picks never flow up).
  const parentItems: Favourite[] = [
    ...((topic.favourites ?? []) as Favourite[]),
  ].sort((a, b) => b.all_time_pledged - a.all_time_pledged)

  type RawSubset = {
    id: string
    title: string
    status: string
    is_active: boolean
    topic_subset_items: { favourite_id: string }[] | null
  }
  const subsets = ((topic.topic_subsets ?? []) as RawSubset[])
    .filter((s) => s.status === "approved" && s.is_active)
    .map((s) => ({
      id: s.id,
      title: s.title,
      memberIds: (s.topic_subset_items ?? []).map((i) => i.favourite_id),
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
  const selectedSubset = subsetParam
    ? (subsets.find((s) => s.id === subsetParam) ?? null)
    : null

  // A SUBSET'S record: its own favpolls' picks plus its members' picks
  // from the parent's whole-list favpolls (down, never up).
  let items: Favourite[] = parentItems
  if (selectedSubset) {
    const { data: scoped } = await supabase
      .from("topic_subset_totals")
      .select("favourite_id, all_time_pledged, all_time_count")
      .eq("subset_id", selectedSubset.id)
    items = subsetStanding(
      parentItems,
      selectedSubset.memberIds,
      (scoped ?? []) as {
        favourite_id: string
        all_time_pledged: number
        all_time_count: number
      }[]
    )
  }

  const typedTopic = topic as Topic
  const shownTitle = selectedSubset?.title ?? typedTopic.title
  const hasActivity = items.some((i) => i.all_time_pledged > 0)

  // All-time bump chart: how this topic's favourites moved across every
  // favpoll, bucketed by week. Established topics only (same threshold as
  // /record) so a sparse topic doesn't show a sparse chart. Ordinal —
  // amounts never enter the chart.
  // The chart is the parent's whole-list history: subset polls' picks
  // are excluded, and a selected subset shows no chart.
  let topicHistory: ReturnType<typeof deriveRankHistory> | null = null
  let bucketDates: string[] = []
  if (!selectedSubset && isEstablishedRecord(items)) {
    // Paginated — an established topic's allocations exceed the silent
    // 1,000-row cap (lib/supabase/paginate)
    const allocRows = await fetchAllRows<Record<string, unknown>>((from, to) =>
      supabase
        .from("pledge_allocations")
        .select(
          `amount, favourite_id,
             favourites!inner ( label, topic_id ),
             pledges!inner ( created_at, withdrawn_at, favpoll_polls!inner ( subset_id ) )`
        )
        .eq("favourites.topic_id", id)
        .is("pledges.withdrawn_at", null)
        .is("pledges.favpoll_polls.subset_id", null)
        .range(from, to)
    )

    const labels: Record<string, string> = {}
    const events: PledgeEvent[] = (allocRows as never[]).map((r) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = r as any
      labels[row.favourite_id] = row.favourites?.label ?? row.favourite_id
      return {
        createdAt: row.pledges.created_at,
        allocations: [
          { favouriteId: row.favourite_id, amount: row.amount ?? 0 },
        ],
      }
    })
    const bucketed = bucketEventsByWeek(events)
    if (bucketed.buckets.length >= 2) {
      topicHistory = deriveRankHistory(bucketed.buckets, labels)
      bucketDates = bucketed.bucketDates
    }
  }
  const totalPledged = items.reduce((s, i) => s + i.all_time_pledged, 0)
  const totalVotes = items.reduce((s, i) => s + i.all_time_count, 0)
  const topItem = items[0]

  const left = (
    <Suspense fallback={null}>
      <TopicRankings
        items={items}
        topicTitle={shownTitle}
        parentTitle={selectedSubset ? typedTopic.title : null}
        subsets={subsets.map((s) => ({ id: s.id, title: s.title }))}
        selectedSubsetId={selectedSubset?.id ?? null}
        hasColourSwatch={typedTopic.title.toLowerCase().includes("colour")}
      />
    </Suspense>
  )

  const right = (
    <>
      {hasActivity && (
        <div className="space-y-4 rounded-lg border border-border bg-card px-5 py-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            All-time
          </p>
          <div className="space-y-3">
            {topItem && (
              <div>
                <p className="text-xs text-muted-foreground">Leading</p>
                <div className="mt-0.5 flex items-center gap-2">
                  {typedTopic.title.toLowerCase().includes("colour") && (
                    <span
                      className="h-3 w-3 shrink-0 rounded-full border border-border/50"
                      style={{
                        backgroundColor: topItem.label.toLowerCase(),
                      }}
                      aria-hidden="true"
                    />
                  )}
                  <p className="text-sm font-medium text-foreground">
                    {topItem.label}
                  </p>
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Total raised</p>
              <p className="mt-0.5 text-sm font-medium text-primary">
                {formatPoundsCompact(totalPledged)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total pledges</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {formatCount(totalVotes)}
              </p>
            </div>
          </div>
        </div>
      )}

      {topicHistory && (
        <TopicChartCard
          history={topicHistory}
          bucketDates={bucketDates}
          topicTitle={typedTopic.title}
        />
      )}

      <div className="rounded-lg border border-border bg-card px-5 py-5">
        <p className="text-sm font-medium text-foreground">
          Use this topic in a favpoll
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Ask your guests what their favourite{" "}
          {typedTopic.title.toLowerCase().replace("favourite ", "")} is — and
          turn their pledges into funds for a charity you care about.
        </p>
        <Button asChild className="mt-4">
          <Link href={`/favpolls/new?topic=${id}`}>Create a favpoll</Link>
        </Button>
      </div>
    </>
  )

  return <PageLayout left={left} right={right} />
}
