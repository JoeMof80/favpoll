import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import type { Favourite } from "@favpoll/types"

import { useRankingItems } from "@/components/ranking-list/use-ranking-items"

function makeItem(id: string, pledged: number, count: number): Favourite {
  return {
    id,
    topic_id: "topic-1",
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

const initialItems: Favourite[] = [
  makeItem("red", 30, 3),
  makeItem("blue", 50, 5),
  makeItem("green", 10, 1),
]

describe("useRankingItems — initial state", () => {
  it("ranks items by amount descending on first render", () => {
    const { result } = renderHook(() => useRankingItems(initialItems, "amount"))
    const ids = result.current.items.map((i) => i.id)
    expect(ids).toEqual(["blue", "red", "green"])
  })

  it("assigns rank 1, 2, 3 in descending order", () => {
    const { result } = renderHook(() => useRankingItems(initialItems, "amount"))
    expect(result.current.items[0].rank).toBe(1)
    expect(result.current.items[2].rank).toBe(3)
  })

  it("sets prevRank equal to rank after mount effects run", () => {
    // The seed effect and rankingView effect both fire on mount (in order).
    // The seed effect populates prevRanksRef, then the rankingView effect
    // sets prevRank = prevRanksRef.get(id), so prevRank === rank after mount.
    const { result } = renderHook(() => useRankingItems(initialItems, "amount"))
    expect(result.current.items.every((i) => i.prevRank === i.rank)).toBe(true)
  })

  it("sets announcement to the sort description after mount", () => {
    // The rankingView effect fires on mount, setting the initial sort announcement.
    const { result } = renderHook(() => useRankingItems(initialItems, "amount"))
    expect(result.current.announcement).toBe("Sorted by amount pledged")
  })

  it("computes maxValue from the highest all_time_pledged", () => {
    const { result } = renderHook(() => useRankingItems(initialItems, "amount"))
    expect(result.current.maxValue).toBe(50) // blue has 50
  })

  it("computes maxValue from all_time_count when rankingView is 'count'", () => {
    const { result } = renderHook(() => useRankingItems(initialItems, "count"))
    expect(result.current.maxValue).toBe(5) // blue has count 5
  })

  it("returns maxValue of at least 1 when all items have 0 values", () => {
    const zeroes = [makeItem("a", 0, 0), makeItem("b", 0, 0)]
    const { result } = renderHook(() => useRankingItems(zeroes, "amount"))
    expect(result.current.maxValue).toBe(1)
  })
})

describe("useRankingItems — rankingView change", () => {
  it("re-sorts items when rankingView switches to 'count'", () => {
    const { result, rerender } = renderHook(
      ({ view }: { view: "amount" | "count" }) =>
        useRankingItems(initialItems, view),
      { initialProps: { view: "amount" as "amount" | "count" } }
    )

    act(() => {
      rerender({ view: "count" as const })
    })

    // blue (count 5) should still be #1, green (count 1) should be #3
    const ids = result.current.items.map((i) => i.id)
    expect(ids[0]).toBe("blue")
    expect(ids[2]).toBe("green")
  })

  it("sets an announcement when rankingView changes", () => {
    const { result, rerender } = renderHook(
      ({ view }: { view: "amount" | "count" }) =>
        useRankingItems(initialItems, view),
      { initialProps: { view: "amount" as "amount" | "count" } }
    )

    act(() => {
      rerender({ view: "count" as const })
    })

    expect(result.current.announcement).toBe("Sorted by number of pledges")
  })

  it("sets the correct announcement when switching back to 'amount'", () => {
    const { result, rerender } = renderHook(
      ({ view }: { view: "amount" | "count" }) =>
        useRankingItems(initialItems, view),
      { initialProps: { view: "count" as "amount" | "count" } }
    )
    act(() => {
      rerender({ view: "amount" as const })
    })
    expect(result.current.announcement).toBe("Sorted by amount pledged")
  })
})

// Fresh initialItems are how live surfaces update (router.refresh() streams
// re-fetched server data) — realtime postgres_changes never reach the anon
// browser, so there is deliberately no subscription to test.
describe("useRankingItems — fresh server data", () => {
  it("re-ranks when fresh initialItems change the leading value", () => {
    const { result, rerender } = renderHook(
      ({ items }: { items: Favourite[] }) => useRankingItems(items, "amount"),
      { initialProps: { items: initialItems } }
    )

    // Initially: blue(50) > red(30) > green(10)
    expect(result.current.items[0].id).toBe("blue")

    // green shoots up to 100 in the refreshed server data
    act(() => {
      rerender({
        items: [
          makeItem("red", 30, 3),
          makeItem("blue", 50, 5),
          makeItem("green", 100, 10),
        ],
      })
    })

    expect(result.current.items[0].id).toBe("green")
    expect(result.current.items[0].rank).toBe(1)
  })

  it("generates a rank-change announcement when an item moves", () => {
    const { result, rerender } = renderHook(
      ({ items }: { items: Favourite[] }) => useRankingItems(items, "amount"),
      { initialProps: { items: initialItems } }
    )

    // green (rank 3) jumps above blue (rank 1)
    act(() => {
      rerender({
        items: [
          makeItem("red", 30, 3),
          makeItem("blue", 50, 5),
          makeItem("green", 100, 10),
        ],
      })
    })

    expect(result.current.announcement).toMatch(/green moved up to position 1/)
  })

  it("does not add a rank-movement announcement when order is unchanged", () => {
    const { result, rerender } = renderHook(
      ({ items }: { items: Favourite[] }) => useRankingItems(items, "amount"),
      { initialProps: { items: initialItems } }
    )

    // Record the announcement before the update (the sort announcement from mount)
    const announcementBefore = result.current.announcement

    // blue is already rank 1; its value grows but the order doesn't change
    act(() => {
      rerender({
        items: [
          makeItem("red", 30, 3),
          makeItem("blue", 55, 5),
          makeItem("green", 10, 1),
        ],
      })
    })

    expect(result.current.announcement).toBe(announcementBefore)
    expect(result.current.announcement).not.toMatch(/moved/)
  })
})
