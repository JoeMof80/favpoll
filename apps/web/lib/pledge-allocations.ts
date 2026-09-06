import type { Favourite } from "@favpoll/types"

// How a pledge splits across the guest's selected favourites: penny-even.
// Shares differ by at most 1p — the remainder pennies go one each to the
// earliest selections. (The first cut worked in whole PERCENTAGE points,
// so £2 across three favourites read £0.68/£0.66/£0.66 — the founder
// caught it on the split list, 2026-09-06.) The sum always equals the
// input amount exactly; output order follows allItems.

export function computePledgeAllocations(
  selectedIds: string[],
  allItems: Favourite[],
  amount: number
) {
  if (selectedIds.length === 0) return []
  const totalPence = Math.round(amount * 100)
  const base = Math.floor(totalPence / selectedIds.length)
  let spare = totalPence - base * selectedIds.length
  // A penny each to the earliest selections
  const pence = new Map<string, number>()
  for (const id of selectedIds) {
    pence.set(id, base + (spare > 0 ? 1 : 0))
    if (spare > 0) spare--
  }
  return allItems
    .filter((item) => pence.has(item.id))
    .map((item) => ({
      favouriteId: item.id,
      amount: (pence.get(item.id) ?? 0) / 100,
    }))
}
