"use client"

import { formatAmount } from "@/components/ranking-list/utils"
import { RankingBar } from "@/components/ui/ranking-bar"
import type { Favourite } from "@favpoll/types"

const BRAND = "#534AB7"

type Props = {
  item: Favourite & { rank: number }
  isColorTopic: boolean
  maxPledged: number
  isFirst: boolean
  style?: React.CSSProperties
}

export function DisplayRankingRow({
  item,
  isColorTopic,
  maxPledged,
  isFirst,
  style,
}: Props) {
  const barWidth =
    maxPledged > 0 ? (item.all_time_pledged / maxPledged) * 100 : 0
  const amountStr = formatAmount(item.all_time_pledged)

  return (
    <li
      aria-label={`${item.label}, rank ${item.rank}, ${amountStr}`}
      className="absolute w-full transition-transform duration-500 ease-in-out"
      style={style}
    >
      <RankingBar
        label={item.label}
        amount={amountStr}
        widthPercent={barWidth}
        barStyle={{ background: isFirst ? BRAND : "#AFA9EC" }}
        labelSuffix={
          isColorTopic ? (
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full border border-black/10"
              style={{ backgroundColor: item.label.toLowerCase() }}
              aria-hidden="true"
            />
          ) : undefined
        }
      />
    </li>
  )
}
