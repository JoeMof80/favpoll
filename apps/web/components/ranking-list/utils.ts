import type { TopicItem } from "@favpoll/types"

export type RankedItem = TopicItem & { rank: number; prevRank: number | null }

export function rankItems(
  items: TopicItem[],
  view: "amount" | "count" = "amount"
): RankedItem[] {
  const sorted = [...items].sort((a, b) => {
    const diff =
      view === "amount"
        ? b.all_time_pledged - a.all_time_pledged
        : b.all_time_count - a.all_time_count
    if (diff !== 0) return diff
    return a.label.localeCompare(b.label)
  })
  return sorted.map((item, i) => ({ ...item, rank: i + 1, prevRank: null }))
}

export function formatAmount(amount: number): string {
  if (amount === 0) return "£0"
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
