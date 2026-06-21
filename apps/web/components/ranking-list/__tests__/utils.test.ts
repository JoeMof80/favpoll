import { describe, it, expect } from "vitest"
import { rankItems, formatAmount } from "@/components/ranking-list/utils"
import type { Favourite } from "@favpoll/types"

function makeItem(id: string, pledged: number, count: number): Favourite {
  return {
    id,
    topic_id: "t1",
    label: id,
    all_time_pledged: pledged,
    all_time_count: count,
    is_canonical: true,
    source: "seed",
    markets: ["en-GB"],
    favpoll_count: 0,
    total_pledge_count: 0,
    created_at: "2024-01-01T00:00:00Z",
  }
}

describe("rankItems", () => {
  const items = [
    makeItem("low", 10, 1),
    makeItem("high", 100, 5),
    makeItem("mid", 50, 3),
  ]

  it("sorts by all_time_pledged descending by default", () => {
    const result = rankItems(items)
    expect(result[0].id).toBe("high")
    expect(result[1].id).toBe("mid")
    expect(result[2].id).toBe("low")
  })

  it("assigns rank starting at 1", () => {
    const result = rankItems(items)
    expect(result[0].rank).toBe(1)
    expect(result[1].rank).toBe(2)
    expect(result[2].rank).toBe(3)
  })

  it("sets prevRank to null for all items on initial call", () => {
    const result = rankItems(items)
    expect(result.every((r) => r.prevRank === null)).toBe(true)
  })

  it("sorts by all_time_count descending when view is 'count'", () => {
    const result = rankItems(items, "count")
    expect(result[0].id).toBe("high") // count 5
    expect(result[1].id).toBe("mid") // count 3
    expect(result[2].id).toBe("low") // count 1
  })

  it("does not mutate the original array", () => {
    const original = items.map((i) => i.id)
    rankItems(items)
    expect(items.map((i) => i.id)).toEqual(original)
  })

  it("handles a single item", () => {
    const result = rankItems([makeItem("only", 5, 2)])
    expect(result).toHaveLength(1)
    expect(result[0].rank).toBe(1)
    expect(result[0].prevRank).toBe(null)
  })

  it("handles an empty array", () => {
    expect(rankItems([])).toEqual([])
  })

  it("preserves all Favourite fields in the result", () => {
    const result = rankItems(items)
    expect(result[0].label).toBe("high")
    expect(result[0].is_canonical).toBe(true)
  })
})

describe("formatAmount", () => {
  it("returns '£0' for zero", () => {
    expect(formatAmount(0)).toBe("£0")
  })

  it("formats £1", () => {
    expect(formatAmount(1)).toBe("£1")
  })

  it("formats £999 without pence", () => {
    expect(formatAmount(999)).toBe("£999")
  })

  it("formats £150", () => {
    expect(formatAmount(150)).toBe("£150")
  })

  it("formats £1000 in compact notation", () => {
    // Node/jsdom: maximumFractionDigits:1 always shows one decimal → £1.0K
    expect(formatAmount(1000)).toBe("£1.0K")
  })

  it("formats £1500 in compact notation with one decimal", () => {
    expect(formatAmount(1500)).toBe("£1.5K")
  })

  it("formats £10000 in compact notation", () => {
    expect(formatAmount(10000)).toBe("£10.0K")
  })

  it("formats £1000000 in compact notation", () => {
    expect(formatAmount(1000000)).toBe("£1.0M")
  })
})
