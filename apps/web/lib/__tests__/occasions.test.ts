import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { shortTopicLabel, suggestClosingDate } from "@/lib/occasions"

describe("shortTopicLabel", () => {
  it("strips leading 'favourite ' (lowercase)", () => {
    expect(shortTopicLabel("favourite colour")).toBe("Colour")
  })

  it("strips leading 'Favourite ' (capitalised)", () => {
    expect(shortTopicLabel("Favourite Film")).toBe("Film")
  })

  it("strips leading 'FAVOURITE ' (uppercase)", () => {
    expect(shortTopicLabel("FAVOURITE Season")).toBe("Season")
  })

  it("capitalises the first letter of a plain label", () => {
    expect(shortTopicLabel("season")).toBe("Season")
    expect(shortTopicLabel("song")).toBe("Song")
  })

  it("leaves a label that already starts with a capital unchanged", () => {
    expect(shortTopicLabel("Biscuit")).toBe("Biscuit")
  })

  it("does not strip 'favourite' mid-string", () => {
    expect(shortTopicLabel("all-time favourite")).toBe("All-time favourite")
  })
})

describe("suggestClosingDate", () => {
  // Freeze to noon UTC on a Sunday — safe from day-boundary issues in all timezones
  const FROZEN = new Date("2025-06-01T12:00:00Z")

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FROZEN)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("closes CLOSING_DEFAULTS[occasion] days from today when no eventDate", () => {
    // birthday = 14 days → 2025-06-15
    expect(suggestClosingDate("birthday")).toBe("2025-06-15T23:59")
  })

  it("closes 30 days from today for memorial (longest default)", () => {
    expect(suggestClosingDate("memorial")).toBe("2025-07-01T23:59")
  })

  it("defaults to 14 days for an unknown occasion", () => {
    expect(suggestClosingDate("unknown_occasion")).toBe("2025-06-15T23:59")
  })

  it("closes n days before eventDate when event is far enough in future", () => {
    // birthday = 14 days before event; event 2025-09-01 → close 2025-08-18
    expect(suggestClosingDate("birthday", "2025-09-01")).toBe(
      "2025-08-18T23:59"
    )
  })

  it("falls back to today + n days when eventDate - n is in the past", () => {
    // birthday = 14 days; event tomorrow (2025-06-02) → target = 2025-05-19 (past) → fallback
    expect(suggestClosingDate("birthday", "2025-06-02")).toBe(
      "2025-06-15T23:59"
    )
  })

  it("does NOT fall back when eventDate - n equals today at noon (target > midnight today)", () => {
    // birthday = 14 days; event 2025-06-15T12:00 - 14 days = 2025-06-01T12:00
    // today midnight is 2025-06-01T00:00 — noon > midnight, so condition fails → no fallback
    expect(suggestClosingDate("birthday", "2025-06-15")).toBe(
      "2025-06-01T23:59"
    )
  })

  it("falls back when eventDate - n is strictly before today midnight", () => {
    // birthday = 14 days; event 2025-06-14T12:00 - 14 days = 2025-05-31T12:00 < midnight June 1 → fallback
    expect(suggestClosingDate("birthday", "2025-06-14")).toBe(
      "2025-06-15T23:59"
    )
  })

  it("returns a string in YYYY-MM-DDTHH:MM format", () => {
    const result = suggestClosingDate("wedding")
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })

  it("always ends in T23:59", () => {
    const result = suggestClosingDate("retirement", "2025-12-01")
    expect(result).toMatch(/T23:59$/)
  })
})
