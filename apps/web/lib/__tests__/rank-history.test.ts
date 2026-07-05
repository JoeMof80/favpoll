import { describe, it, expect } from "vitest"
import { deriveRankHistory, type PledgeEvent } from "../rank-history"

const labels = { a: "Blue", b: "Purple", c: "Green" }

function ev(createdAt: string, allocs: [string, number][]): PledgeEvent {
  return {
    createdAt,
    allocations: allocs.map(([favouriteId, amount]) => ({
      favouriteId,
      amount,
    })),
  }
}

describe("deriveRankHistory", () => {
  it("returns empty history for no events", () => {
    const h = deriveRankHistory([], labels)
    expect(h.steps).toBe(0)
    expect(h.series).toEqual([])
    expect(h.leadChanges).toEqual([])
  })

  it("tracks a favourite climbing from last to first", () => {
    // Blue leads early; Purple overtakes by the end.
    const h = deriveRankHistory(
      [
        ev("2026-01-01T10:00:00Z", [["a", 10]]), // Blue 1
        ev("2026-01-01T10:01:00Z", [["b", 5]]), // Blue 1, Purple 2
        ev("2026-01-01T10:02:00Z", [["b", 20]]), // Purple 1, Blue 2
      ],
      labels
    )
    expect(h.steps).toBe(3)
    // Purple's line begins when it first receives a pledge (step 1).
    const purple = h.series.find((s) => s.favouriteId === "b")!
    expect(purple.points.map((p) => p.rank)).toEqual([2, 1])
    expect(purple.points[0].step).toBe(1)
    const blue = h.series.find((s) => s.favouriteId === "a")!
    expect(blue.points.map((p) => p.rank)).toEqual([1, 1, 2])
  })

  it("sorts events by time regardless of input order", () => {
    const h = deriveRankHistory(
      [
        ev("2026-01-01T10:02:00Z", [["b", 20]]),
        ev("2026-01-01T10:00:00Z", [["a", 10]]),
      ],
      labels
    )
    // After time-sort: Blue 10 first, then Purple 20 → Purple leads at end
    expect(h.series[0].favouriteId).toBe("b")
  })

  it("records lead changes with labels", () => {
    const h = deriveRankHistory(
      [
        ev("2026-01-01T10:00:00Z", [["a", 10]]),
        ev("2026-01-01T10:01:00Z", [["b", 20]]),
      ],
      labels
    )
    expect(h.leadChanges).toEqual([
      { step: 0, favouriteId: "a", label: "Blue" },
      { step: 1, favouriteId: "b", label: "Purple" },
    ])
  })

  it("applies dense ranking for ties (equal totals share a rank)", () => {
    const h = deriveRankHistory(
      [
        ev("2026-01-01T10:00:00Z", [["a", 10]]),
        ev("2026-01-01T10:01:00Z", [["b", 10]]), // tie at 10
        ev("2026-01-01T10:02:00Z", [["c", 5]]),
      ],
      labels
    )
    const last = (fav: string) =>
      h.series.find((s) => s.favouriteId === fav)!.points.at(-1)!.rank
    expect(last("a")).toBe(1) // tie → both rank 1
    expect(last("b")).toBe(1)
    expect(last("c")).toBe(3) // dense: next rank skips 2
  })

  it("only includes favourites that received a pledge", () => {
    const h = deriveRankHistory(
      [ev("2026-01-01T10:00:00Z", [["a", 10]])],
      labels
    )
    expect(h.series.map((s) => s.favouriteId)).toEqual(["a"])
  })
})
