"use client"

import { useState } from "react"
import { TrendingUp } from "lucide-react"
import type { RankHistory } from "@/lib/rank-history"
import { BumpChart } from "@/components/bump-chart"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"

// Right-column teaser for the topic's all-time bump chart. The full chart
// needs width the narrow column can't give, so the card shows a lines-only
// preview and opens the labelled, dated chart in an overlay on click.
export function TopicChartCard({
  history,
  bucketDates,
  topicTitle,
}: {
  history: RankHistory
  bucketDates: string[]
  topicTitle: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`See how ${topicTitle} rankings have moved over time`}
        className="w-full rounded-lg border border-border bg-card px-5 py-5 text-left transition-colors hover:border-primary/30 hover:bg-secondary/20 focus:ring-2 focus:ring-ring focus:outline-none"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Over time
          </p>
          <TrendingUp
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 h-20 overflow-hidden">
          <BumpChart history={history} compact />
        </div>
        <p className="mt-3 text-sm font-medium text-primary">
          See the full story →
        </p>
      </button>

      <ResponsiveOverlay
        open={open}
        onOpenChange={setOpen}
        title={`${topicTitle} over time`}
        dialogClassName="sm:max-w-2xl"
      >
        <div className="px-5 pt-1 pb-4">
          <BumpChart
            history={history}
            title=""
            caption="Positions only — how each favourite has ranked across every favpoll."
            axisLabels={bucketDates}
          />
        </div>
      </ResponsiveOverlay>
    </>
  )
}
