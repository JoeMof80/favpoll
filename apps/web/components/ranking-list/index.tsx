"use client"

import type { Favourite } from "@favpoll/types"
import { useRankingItems } from "./use-ranking-items"
import { formatAmount } from "./utils"
import { RankingBar } from "@/components/ui/ranking-bar"
import { HideToggle } from "./hide-toggle"

type Props = {
  initialItems: Favourite[]
  favpollPollId: string
  topicId: string
  useAllTime?: boolean
  rankingView?: "amount" | "count"
  isOrganiser?: boolean
}

export function RankingList({
  initialItems,
  topicId,
  rankingView = "amount",
  isOrganiser = false,
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
            rankingView === "amount"
              ? item.all_time_pledged
              : item.all_time_count
          const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0
          const valueLabel =
            rankingView === "amount"
              ? formatAmount(item.all_time_pledged)
              : `${item.all_time_count} pledge${item.all_time_count !== 1 ? "s" : ""}`

          const isHidden = item.is_hidden ?? false
          const showToggle =
            isOrganiser && !!item.is_guest_added && !!item.favpoll_poll_item_id

          const labelSuffix = showToggle ? (
            <>
              {isHidden && (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  Hidden
                </span>
              )}
              <HideToggle
                isHidden={isHidden}
                favouriteId={item.favpoll_poll_item_id!}
              />
            </>
          ) : undefined

          return (
            <li
              key={item.id}
              style={{ order: item.rank }}
              aria-label={`${item.label}, ranked ${item.rank}, ${valueLabel}${isHidden ? ", hidden from guests" : ""}`}
              className={isHidden ? "opacity-40" : undefined}
            >
              <RankingBar
                label={item.label}
                amount={valueLabel}
                widthPercent={barWidth}
                barClassName="transition-all duration-700 ease-out"
                labelSuffix={labelSuffix}
              />
            </li>
          )
        })}
      </ol>
    </div>
  )
}
