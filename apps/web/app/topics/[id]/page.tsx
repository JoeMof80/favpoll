import { notFound } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Topic, Favourite } from "@favpoll/types"
import { TopicRankings } from "./topic-rankings"
import { PageLayout } from "@/components/page-layout"

type Props = {
  params: Promise<{ id: string }>
}

function formatAmount(amount: number): string {
  if (amount === 0) return "—"
  if (amount >= 1000) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount)
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
  }).format(amount)
}

export default async function TopicPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: topic } = await supabase
    .from("topics")
    .select("*, favourites(*)")
    .eq("id", id)
    .single()

  if (!topic) notFound()

  const items: Favourite[] = [
    ...((topic.favourites ?? []) as Favourite[]),
  ].sort((a, b) => b.all_time_pledged - a.all_time_pledged)

  const typedTopic = topic as Topic
  const hasActivity = items.some((i) => i.all_time_pledged > 0)
  const totalPledged = items.reduce((s, i) => s + i.all_time_pledged, 0)
  const totalVotes = items.reduce((s, i) => s + i.all_time_count, 0)
  const topItem = items[0]

  const left = (
    <Suspense fallback={null}>
      <TopicRankings
        items={items}
        topicTitle={typedTopic.title}
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
                {formatAmount(totalPledged)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total pledges</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {totalVotes.toLocaleString("en-GB")}
              </p>
            </div>
          </div>
        </div>
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
