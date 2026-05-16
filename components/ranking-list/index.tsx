"use client"

import type { TopicItem } from "@/types"
import { useRankingItems } from "./use-ranking-items"
import { formatAmount } from "./utils"

type Props = {
  initialItems: TopicItem[]
  eventPollId: string
  topicId: string
  useAllTime?: boolean
  rankingView?: "amount" | "count"
}

export function RankingList({
  initialItems,
  topicId,
  rankingView = "amount",
}: Props) {
  const { items, announcement, maxValue } = useRankingItems(
    initialItems,
    topicId,
    rankingView
  )

  return (
    <div>
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </span>
      <ol aria-label="Rankings" className="space-y-3">
        {items.map((item) => {
          const value =
            rankingView === "amount" ? item.all_time_pledged : item.all_time_count
          const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0
          const valueLabel =
            rankingView === "amount"
              ? formatAmount(item.all_time_pledged)
              : `${item.all_time_count} pledge${item.all_time_count !== 1 ? "s" : ""}`

          return (
            <li
              key={item.id}
              style={{ order: item.rank }}
              aria-label={`${item.label}, ranked ${item.rank}, ${valueLabel}`}
            >
              <div className="flex justify-between text-sm">
                <span className="truncate pr-3 text-foreground">
                  {item.label}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {valueLabel}
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="presentation"
              >
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${barWidth}%` }}
                  aria-hidden="true"
                />
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
