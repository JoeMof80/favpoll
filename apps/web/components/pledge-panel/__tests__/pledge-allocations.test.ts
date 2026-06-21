import { describe, it, expect } from "vitest"
import { computePledgeAllocations } from "@/components/pledge-panel"
import type { Favourite } from "@favpoll/types"

function makeItem(id: string): Favourite {
  return {
    id,
    topic_id: "t1",
    label: id,
    all_time_pledged: 0,
    all_time_count: 0,
    is_canonical: true,
    source: "seed",
    markets: ["en-GB"],
    favpoll_count: 0,
    total_pledge_count: 0,
    created_at: "2024-01-01T00:00:00Z",
  }
}

const items = [makeItem("a"), makeItem("b"), makeItem("c")]

describe("computePledgeAllocations", () => {
  it("returns empty array when no items are selected", () => {
    expect(computePledgeAllocations([], items, 10)).toEqual([])
  })

  it("allocates 100% to a single selected item", () => {
    const result = computePledgeAllocations(["a"], items, 10)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ favouriteId: "a", amount: 10 })
  })

  it("allocates 100% to a single item regardless of pool size", () => {
    const result = computePledgeAllocations(["b"], items, 50)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ favouriteId: "b", amount: 50 })
  })

  it("splits 50/50 across two selected items", () => {
    const result = computePledgeAllocations(["a", "b"], items, 10)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ favouriteId: "a", amount: 5 })
    expect(result[1]).toEqual({ favouriteId: "b", amount: 5 })
  })

  it("splits £10 three ways with remainder on first item", () => {
    // floor(100/3)=33, remainder=1 → idx 0 gets 34%, idx 1&2 get 33%
    // 34% of £10 = £3.40, 33% of £10 = £3.30
    const result = computePledgeAllocations(["a", "b", "c"], items, 10)
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ favouriteId: "a", amount: 3.4 })
    expect(result[1]).toEqual({ favouriteId: "b", amount: 3.3 })
    expect(result[2]).toEqual({ favouriteId: "c", amount: 3.3 })
  })

  it("total of all allocations equals the input amount (3-way split, £10)", () => {
    const result = computePledgeAllocations(["a", "b", "c"], items, 10)
    const total = result.reduce((sum, r) => sum + r.amount, 0)
    expect(total).toBeCloseTo(10, 10)
  })

  it("handles £1 split three ways (penny-level rounding)", () => {
    // 34% of £1 = £0.34, 33% of £1 = £0.33
    const result = computePledgeAllocations(["a", "b", "c"], items, 1)
    expect(result[0]).toEqual({ favouriteId: "a", amount: 0.34 })
    expect(result[1]).toEqual({ favouriteId: "b", amount: 0.33 })
    expect(result[2]).toEqual({ favouriteId: "c", amount: 0.33 })
  })

  it("excludes unselected items from the output", () => {
    const result = computePledgeAllocations(["b"], items, 20)
    const ids = result.map((r) => r.favouriteId)
    expect(ids).not.toContain("a")
    expect(ids).not.toContain("c")
  })

  it("output order follows allItems order, not selectedIds order", () => {
    // allItems = [a, b, c]; selectedIds = ["c", "a"] — output follows allItems sequence
    const result = computePledgeAllocations(["c", "a"], items, 10)
    expect(result[0].favouriteId).toBe("a")
    expect(result[1].favouriteId).toBe("c")
  })

  it("remainder percentage goes to the item at selectedIds index 0 (3-way split)", () => {
    // selectedIds = ["c", "b", "a"]: idx 0 = "c" gets the extra percentage point
    const result = computePledgeAllocations(["c", "b", "a"], items, 10)
    const a = result.find((r) => r.favouriteId === "a")!
    const b = result.find((r) => r.favouriteId === "b")!
    const c = result.find((r) => r.favouriteId === "c")!
    expect(c.amount).toBe(3.4) // c is selectedIds[0] → gets remainder (34%)
    expect(b.amount).toBe(3.3)
    expect(a.amount).toBe(3.3)
  })

  it("works correctly when allItems contains only the selected item", () => {
    const single = [makeItem("x")]
    const result = computePledgeAllocations(["x"], single, 25)
    expect(result).toEqual([{ favouriteId: "x", amount: 25 }])
  })
})
