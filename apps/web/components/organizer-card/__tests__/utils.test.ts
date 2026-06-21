import { describe, it, expect } from "vitest"
import {
  isFavpollClosed,
  daysRemaining,
  filterAndSort,
  WARNING_THRESHOLD_DAYS,
  type OrganizerCardFavpoll,
} from "../utils"

const NOW = new Date("2026-06-21T12:00:00Z")

function makeFavpoll(
  overrides: Partial<OrganizerCardFavpoll> = {}
): OrganizerCardFavpoll {
  return {
    id: "fp-1",
    opening_line: "In memory of",
    closes_at: new Date(NOW.getTime() + 14 * 86400000).toISOString(), // 14 days from now
    closed_at: null,
    occasion_type: "Memorial",
    category: "memorial",
    grouping: "individual",
    subject: "someone",
    cause_label: null,
    total_raised: 100,
    is_listed: true,
    created_at: new Date(NOW.getTime() - 86400000).toISOString(),
    protagonist: { name: "Belinda Johnson" },
    charities: [
      {
        charity: {
          id: "c1",
          name: "Age UK",
          logo_url: null,
          registered_number: null,
          description: null,
          created_at: "",
        },
      },
    ],
    poll: { id: "p1", topic: { title: "Colour" } },
    pot: { total_deposited: 50, total_allocated: 10 },
    ...overrides,
  }
}

describe("isFavpollClosed", () => {
  it("returns false for a favpoll with a future closes_at and no closed_at", () => {
    const fp = makeFavpoll()
    expect(isFavpollClosed(fp, NOW)).toBe(false)
  })

  it("returns true when closed_at is set", () => {
    const fp = makeFavpoll({ closed_at: "2026-06-20T00:00:00Z" })
    expect(isFavpollClosed(fp, NOW)).toBe(true)
  })

  it("returns true when closes_at is in the past", () => {
    const fp = makeFavpoll({
      closes_at: new Date(NOW.getTime() - 86400000).toISOString(),
    })
    expect(isFavpollClosed(fp, NOW)).toBe(true)
  })
})

describe("daysRemaining", () => {
  it("returns the ceiling of days until closes_at", () => {
    const closesAt = new Date(NOW.getTime() + 7 * 86400000).toISOString()
    expect(daysRemaining(closesAt, NOW)).toBe(7)
  })

  it("returns a negative value for past closes_at", () => {
    const closesAt = new Date(NOW.getTime() - 86400000).toISOString()
    expect(daysRemaining(closesAt, NOW)).toBeLessThan(0)
  })
})

describe("WARNING_THRESHOLD_DAYS", () => {
  it("is 7", () => {
    expect(WARNING_THRESHOLD_DAYS).toBe(7)
  })

  it("warning applies when days remaining equals threshold", () => {
    const closesAt = new Date(NOW.getTime() + 7 * 86400000).toISOString()
    const days = daysRemaining(closesAt, NOW)
    expect(days <= WARNING_THRESHOLD_DAYS).toBe(true)
  })

  it("warning does not apply at threshold + 1 day", () => {
    const closesAt = new Date(NOW.getTime() + 8 * 86400000).toISOString()
    const days = daysRemaining(closesAt, NOW)
    expect(days <= WARNING_THRESHOLD_DAYS).toBe(false)
  })
})

describe("filterAndSort", () => {
  const active = makeFavpoll({
    id: "a",
    closes_at: new Date(NOW.getTime() + 10 * 86400000).toISOString(),
    total_raised: 200,
    created_at: new Date(NOW.getTime() - 1 * 86400000).toISOString(),
  })
  const closing = makeFavpoll({
    id: "b",
    closes_at: new Date(NOW.getTime() + 3 * 86400000).toISOString(),
    total_raised: 50,
    created_at: new Date(NOW.getTime() - 2 * 86400000).toISOString(),
  })
  const closed = makeFavpoll({
    id: "c",
    closed_at: "2026-06-01T00:00:00Z",
    closes_at: new Date(NOW.getTime() - 86400000).toISOString(),
    total_raised: 500,
    created_at: new Date(NOW.getTime() - 20 * 86400000).toISOString(),
  })

  it("status=all returns all favpolls", () => {
    const result = filterAndSort(
      [active, closing, closed],
      "all",
      "recently_created",
      NOW
    )
    expect(result).toHaveLength(3)
  })

  it("status=active filters out closed favpolls", () => {
    const result = filterAndSort(
      [active, closing, closed],
      "active",
      "recently_created",
      NOW
    )
    expect(result.map((f) => f.id)).toEqual(expect.arrayContaining(["a", "b"]))
    expect(result.map((f) => f.id)).not.toContain("c")
  })

  it("status=closed shows only closed favpolls", () => {
    const result = filterAndSort(
      [active, closing, closed],
      "closed",
      "recently_created",
      NOW
    )
    expect(result.map((f) => f.id)).toEqual(["c"])
  })

  it("sort=closing_soonest orders by closes_at ascending", () => {
    const result = filterAndSort(
      [active, closing],
      "active",
      "closing_soonest",
      NOW
    )
    expect(result[0].id).toBe("b")
    expect(result[1].id).toBe("a")
  })

  it("sort=highest_raised orders by total_raised descending", () => {
    const result = filterAndSort(
      [active, closing, closed],
      "all",
      "highest_raised",
      NOW
    )
    expect(result[0].id).toBe("c")
    expect(result[1].id).toBe("a")
    expect(result[2].id).toBe("b")
  })

  it("sort=recently_created preserves input order", () => {
    const result = filterAndSort(
      [active, closing, closed],
      "all",
      "recently_created",
      NOW
    )
    expect(result.map((f) => f.id)).toEqual(["a", "b", "c"])
  })

  it("returns empty array when no favpolls match filter", () => {
    const result = filterAndSort(
      [active, closing],
      "closed",
      "recently_created",
      NOW
    )
    expect(result).toHaveLength(0)
  })
})
