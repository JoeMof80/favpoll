import type { Favourite } from "@favpoll/types"

// How a pledge splits across the guest's selected favourites: equal shares,
// with the rounding remainder going to the first selection. Rehomed from the
// retired PledgePanel component — the pledge card and pledge dialog both
// compute their allocations here.

export type Allocation = {
  favouriteId: string
  percentage: number
}

function computeAllocations(
  selectedIds: string[],
  allItems: Favourite[]
): Allocation[] {
  if (selectedIds.length === 0) {
    return allItems.map((item) => ({ favouriteId: item.id, percentage: 0 }))
  }
  const equal = Math.floor(100 / selectedIds.length)
  const remainder = 100 - equal * selectedIds.length
  return allItems.map((item) => {
    const idx = selectedIds.indexOf(item.id)
    if (idx === -1) return { favouriteId: item.id, percentage: 0 }
    return {
      favouriteId: item.id,
      percentage: idx === 0 ? equal + remainder : equal,
    }
  })
}

export function computePledgeAllocations(
  selectedIds: string[],
  allItems: Favourite[],
  amount: number
) {
  return computeAllocations(selectedIds, allItems)
    .filter((a) => a.percentage > 0)
    .map((a) => ({
      favouriteId: a.favouriteId,
      amount: Math.round(((amount * a.percentage) / 100) * 100) / 100,
    }))
}
