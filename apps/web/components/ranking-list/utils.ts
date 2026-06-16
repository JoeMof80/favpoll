import type { Favourite } from "@favpoll/types"

export type RankedItem = Favourite & { rank: number; prevRank: number | null }

export function rankItems(
  items: Favourite[],
  view: "amount" | "count" = "amount"
): RankedItem[] {
  const sorted = [...items].sort((a, b) => {
    const diff =
      view === "amount"
        ? b.all_time_pledged - a.all_time_pledged
        : b.all_time_count - a.all_time_count
    if (diff !== 0) return diff
    // Tiebreak: display_order asc nulls last, then alphabetical
    const da = a.display_order ?? null
    const db = b.display_order ?? null
    if (da !== null && db !== null) return da - db
    if (da !== null) return -1
    if (db !== null) return 1
    return a.label.localeCompare(b.label)
  })
  return sorted.map((item, i) => ({ ...item, rank: i + 1, prevRank: null }))
}

export function formatAmount(amount: number): string {
  if (amount === 0) return "£0"
  if (amount >= 1_000_000) return `£${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `£${(amount / 1_000).toFixed(1)}K`
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
  }).format(amount)
}
