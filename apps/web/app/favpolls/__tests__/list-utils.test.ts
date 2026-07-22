import { describe, it, expect } from "vitest"
import { filterAndSortPublic, groupPublic, isLiveFavpoll } from "../list-utils"

const NOW = new Date("2026-07-16T12:00:00Z")

function makeFavpoll(overrides: Record<string, unknown> = {}) {
  return {
    id: "a",
    closes_at: new Date(NOW.getTime() + 14 * 86400000).toISOString(),
    closed_at: null,
    total_raised: 100,
    cause_label: null,
    opening_line: "In memory of",
    protagonist: { name: "Belinda Johnson" },
    charities: [{ charity: { name: "Marie Curie" } }],
    poll: { topic: { title: "Colour" } },
    ...overrides,
  }
}

const live = makeFavpoll({ id: "live", total_raised: 100 })
const closingSoon = makeFavpoll({
  id: "soon",
  closes_at: new Date(NOW.getTime() + 86400000).toISOString(),
  total_raised: 50,
})
const closed = makeFavpoll({
  id: "closed",
  closes_at: new Date(NOW.getTime() - 86400000).toISOString(),
  closed_at: new Date(NOW.getTime() - 86400000).toISOString(),
  total_raised: 900,
})
// Past closes_at but the cron hasn't stamped closed_at yet — not live
const expired = makeFavpoll({
  id: "expired",
  closes_at: new Date(NOW.getTime() - 3600000).toISOString(),
  closed_at: null,
})

describe("isLiveFavpoll", () => {
  it("is live before closes_at with no closed_at", () => {
    expect(isLiveFavpoll(live, NOW)).toBe(true)
  })
  it("is not live once closed_at is set", () => {
    expect(isLiveFavpoll(closed, NOW)).toBe(false)
  })
  it("is not live past closes_at even before the cron closes it", () => {
    expect(isLiveFavpoll(expired, NOW)).toBe(false)
  })
})

describe("filterAndSortPublic", () => {
  const all = [live, closingSoon, closed, expired]

  it("status=live keeps only genuinely live favpolls", () => {
    const result = filterAndSortPublic(all, "live", "recently_created", "", NOW)
    expect(result.map((f) => f.id).sort()).toEqual(["live", "soon"])
  })

  it("status=closed includes cron-pending expired favpolls", () => {
    const result = filterAndSortPublic(
      all,
      "closed",
      "recently_created",
      "",
      NOW
    )
    expect(result.map((f) => f.id).sort()).toEqual(["closed", "expired"])
  })

  it("status=all returns everything", () => {
    expect(
      filterAndSortPublic(all, "all", "recently_created", "", NOW)
    ).toHaveLength(4)
  })

  it("query matches charity names", () => {
    const other = makeFavpoll({
      id: "other",
      charities: [{ charity: { name: "Mind" } }],
    })
    const result = filterAndSortPublic(
      [live, other],
      "all",
      "recently_created",
      "marie",
      NOW
    )
    expect(result.map((f) => f.id)).toEqual(["live"])
  })

  it("query matches topic and protagonist", () => {
    expect(
      filterAndSortPublic([live], "all", "recently_created", "colour", NOW)
    ).toHaveLength(1)
    expect(
      filterAndSortPublic([live], "all", "recently_created", "belinda", NOW)
    ).toHaveLength(1)
    expect(
      filterAndSortPublic([live], "all", "recently_created", "zzz", NOW)
    ).toHaveLength(0)
  })

  it("sort=closing_soonest orders by closes_at ascending", () => {
    const result = filterAndSortPublic(
      [live, closingSoon],
      "live",
      "closing_soonest",
      "",
      NOW
    )
    expect(result.map((f) => f.id)).toEqual(["soon", "live"])
  })

  it("sort=highest_raised orders by total_raised descending", () => {
    const result = filterAndSortPublic(all, "all", "highest_raised", "", NOW)
    expect(result[0].id).toBe("closed")
  })

  it("sort=recently_created preserves input order", () => {
    const result = filterAndSortPublic(all, "all", "recently_created", "", NOW)
    expect(result.map((f) => f.id)).toEqual([
      "live",
      "soon",
      "closed",
      "expired",
    ])
  })
})

describe("groupPublic", () => {
  const NOW = new Date("2026-07-22T12:00:00Z")
  const fp = (over: Record<string, unknown>) => ({
    closes_at: "2026-08-30T12:00:00Z",
    closed_at: null,
    created_at: "2026-07-01T12:00:00Z",
    total_raised: 0,
    opening_line: "",
    protagonist: null,
    charities: [],
    poll: null,
    ...over,
  })

  it("returns one unlabelled group for highest_raised", () => {
    const groups = groupPublic([fp({}), fp({})], "highest_raised", NOW)
    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBeNull()
    expect(groups[0].items).toHaveLength(2)
  })

  it("buckets closing_soonest into today / this week / later, closed LAST", () => {
    const today = fp({ closes_at: "2026-07-22T20:00:00Z" })
    const week = fp({ closes_at: "2026-07-26T12:00:00Z" })
    const later = fp({ closes_at: "2026-09-01T12:00:00Z" })
    const closedOld = fp({
      closes_at: "2026-07-01T12:00:00Z",
      closed_at: "2026-07-01T12:00:00Z",
    })
    const closedNew = fp({
      closes_at: "2026-07-20T12:00:00Z",
      closed_at: "2026-07-20T12:00:00Z",
    })
    // ascending closes_at order, as filterAndSortPublic produces
    const groups = groupPublic(
      [closedOld, closedNew, today, week, later],
      "closing_soonest",
      NOW
    )
    expect(groups.map((g) => g.label)).toEqual([
      "Closing today",
      "Closing this week",
      "Closing later",
      "Closed",
    ])
    // most recently closed leads the archive
    expect(groups[3].items[0]).toBe(closedNew)
  })

  it("buckets recently_created by age", () => {
    const thisWeek = fp({ created_at: "2026-07-20T12:00:00Z" })
    const thisMonth = fp({ created_at: "2026-07-01T12:00:00Z" })
    const earlier = fp({ created_at: "2026-05-01T12:00:00Z" })
    const groups = groupPublic(
      [thisWeek, thisMonth, earlier],
      "recently_created",
      NOW
    )
    expect(groups.map((g) => g.label)).toEqual([
      "New this week",
      "This month",
      "Earlier",
    ])
  })

  it("returns a single unlabelled group when empty", () => {
    expect(groupPublic([], "closing_soonest", NOW)).toEqual([
      { label: null, items: [] },
    ])
  })
})
