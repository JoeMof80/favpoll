import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  shortTopicLabel,
  suggestClosingDate,
  registerForOccasionType,
  DEFAULT_OCCASION_TYPE,
  type Register,
} from "@/lib/registers"

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

  it("closes 14 days from today for celebrating_one with no occasion type", () => {
    expect(suggestClosingDate("celebrating_one")).toBe("2025-06-15T23:59")
  })

  it("closes 30 days from today for remembering (longest register default)", () => {
    expect(suggestClosingDate("remembering")).toBe("2025-07-01T23:59")
  })

  it("closes 21 days for cause register", () => {
    expect(suggestClosingDate("cause")).toBe("2025-06-22T23:59")
  })

  it("defaults to 14 days for an unknown register", () => {
    expect(suggestClosingDate("unknown_register")).toBe("2025-06-15T23:59")
  })

  it("occasion_type Tribute overrides remembering default (30 → 21)", () => {
    expect(suggestClosingDate("remembering", "Tribute")).toBe(
      "2025-06-22T23:59"
    )
  })

  it("occasion_type Retirement overrides celebrating_one default (14 → 21)", () => {
    expect(suggestClosingDate("celebrating_one", "Retirement")).toBe(
      "2025-06-22T23:59"
    )
  })

  it("occasion_type Anniversary overrides celebrating_many default (14 → 21)", () => {
    expect(suggestClosingDate("celebrating_many", "Anniversary")).toBe(
      "2025-06-22T23:59"
    )
  })

  it("occasion_type Birthday has no override — uses register default (14)", () => {
    expect(suggestClosingDate("celebrating_one", "Birthday")).toBe(
      "2025-06-15T23:59"
    )
  })

  it("closes n days before eventDate when event is far enough in future", () => {
    // celebrating_one = 14 days before event; event 2025-09-01 → close 2025-08-18
    expect(suggestClosingDate("celebrating_one", null, "2025-09-01")).toBe(
      "2025-08-18T23:59"
    )
  })

  it("falls back to today + n days when eventDate - n is in the past", () => {
    // celebrating_one = 14 days; event tomorrow (2025-06-02) → target past → fallback
    expect(suggestClosingDate("celebrating_one", null, "2025-06-02")).toBe(
      "2025-06-15T23:59"
    )
  })

  it("returns a string in YYYY-MM-DDTHH:MM format", () => {
    const result = suggestClosingDate("celebrating_many")
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })

  it("always ends in T23:59", () => {
    const result = suggestClosingDate(
      "celebrating_one",
      "Retirement",
      "2025-12-01"
    )
    expect(result).toMatch(/T23:59$/)
  })
})

describe("registerForOccasionType", () => {
  it("returns neutral for null", () => {
    expect(registerForOccasionType(null)).toBe("neutral")
  })

  it("returns neutral for empty string", () => {
    expect(registerForOccasionType("")).toBe("neutral")
  })

  it("returns neutral for unknown free-text", () => {
    expect(registerForOccasionType("Some random event")).toBe("neutral")
  })

  it("maps Birthday → celebrating_one", () => {
    expect(registerForOccasionType("Birthday")).toBe("celebrating_one")
  })

  it("maps Memorial → remembering", () => {
    expect(registerForOccasionType("Memorial")).toBe("remembering")
  })

  it("maps Wedding → celebrating_many", () => {
    expect(registerForOccasionType("Wedding")).toBe("celebrating_many")
  })

  it("maps Fundraiser → cause", () => {
    expect(registerForOccasionType("Fundraiser")).toBe("cause")
  })

  it("round-trips every DEFAULT_OCCASION_TYPE back to its register", () => {
    const registers: Register[] = [
      "remembering",
      "celebrating_one",
      "celebrating_many",
      "cause",
    ]
    for (const reg of registers) {
      const defaultType = DEFAULT_OCCASION_TYPE[reg]!
      expect(registerForOccasionType(defaultType)).toBe(reg)
    }
  })

  it("neutral DEFAULT_OCCASION_TYPE is null", () => {
    expect(DEFAULT_OCCASION_TYPE.neutral).toBeNull()
  })
})
