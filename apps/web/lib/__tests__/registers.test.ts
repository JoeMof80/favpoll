import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  shortTopicLabel,
  suggestClosingDate,
  registerForOccasionType,
  deriveRegister,
  getExampleName,
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

describe("deriveRegister", () => {
  it("returns neutral for null category", () => {
    expect(deriveRegister(null, "individual")).toBe("neutral")
  })

  it("memorial → remembering regardless of grouping", () => {
    expect(deriveRegister("memorial", "individual")).toBe("remembering")
    expect(deriveRegister("memorial", "couple")).toBe("remembering")
    expect(deriveRegister("memorial", "group")).toBe("remembering")
  })

  it("fundraiser → cause regardless of grouping", () => {
    expect(deriveRegister("fundraiser", "individual")).toBe("cause")
    expect(deriveRegister("fundraiser", "couple")).toBe("cause")
  })

  it("celebration + individual → celebrating_one", () => {
    expect(deriveRegister("celebration", "individual")).toBe("celebrating_one")
  })

  it("celebration + couple → celebrating_many", () => {
    expect(deriveRegister("celebration", "couple")).toBe("celebrating_many")
  })

  it("celebration + group → celebrating_many", () => {
    expect(deriveRegister("celebration", "group")).toBe("celebrating_many")
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

  it("closes 14 days from today for celebration", () => {
    expect(suggestClosingDate("celebration")).toBe("2025-06-15T23:59")
  })

  it("closes 30 days from today for memorial", () => {
    expect(suggestClosingDate("memorial")).toBe("2025-07-01T23:59")
  })

  it("closes 14 days from today for fundraiser", () => {
    expect(suggestClosingDate("fundraiser")).toBe("2025-06-15T23:59")
  })

  it("closes 14 days for null category", () => {
    expect(suggestClosingDate(null)).toBe("2025-06-15T23:59")
  })

  it("closes n days before eventDate when event is far enough in future", () => {
    // celebration = 14 days before event; event 2025-09-01 → close 2025-08-18
    expect(suggestClosingDate("celebration", "2025-09-01")).toBe(
      "2025-08-18T23:59"
    )
  })

  it("falls back to today + n days when eventDate - n is in the past", () => {
    // celebration = 14 days; event tomorrow (2025-06-02) → target past → fallback
    expect(suggestClosingDate("celebration", "2025-06-02")).toBe(
      "2025-06-15T23:59"
    )
  })

  it("returns a string in YYYY-MM-DDTHH:MM format", () => {
    const result = suggestClosingDate("celebration")
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })

  it("always ends in T23:59", () => {
    expect(suggestClosingDate("memorial", "2025-12-01")).toMatch(/T23:59$/)
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
})

describe("getExampleName", () => {
  it("returns empty string for null topicTitle", () => {
    expect(getExampleName(null, "she", "individual", "celebrating_one")).toBe(
      ""
    )
  })

  it("returns a stable she-name for celebrating_one + pronouns:she", () => {
    const name = getExampleName(
      "Colour",
      "she",
      "individual",
      "celebrating_one"
    )
    expect([
      "Gretchen",
      "Elizabeth",
      "Joan",
      "Sylvia",
      "Penny",
      "Vera",
    ]).toContain(name)
    // Stable: same inputs produce the same output
    expect(
      getExampleName("Colour", "she", "individual", "celebrating_one")
    ).toBe(name)
  })

  it("returns a stable he-name for celebrating_one + pronouns:he", () => {
    const name = getExampleName("Colour", "he", "individual", "celebrating_one")
    expect([
      "Arthur",
      "George",
      "Frank",
      "Raymond",
      "Donald",
      "Stanley",
    ]).toContain(name)
  })

  it("returns a pair name for celebrating_many + grouping:couple", () => {
    const name = getExampleName("Colour", "they", "couple", "celebrating_many")
    expect([
      "Joan & Arthur",
      "Gretchen & George",
      "Sylvia & Frank",
      "Elizabeth & Raymond",
    ]).toContain(name)
  })

  it("returns a set name for celebrating_many + grouping:group", () => {
    const name = getExampleName("Colour", "they", "group", "celebrating_many")
    expect([
      "The Wednesday Walkers",
      "Class of 2015",
      "The Old Faithfuls",
      "The Thursday Club",
      "The Sunday League",
      "The Allotment Committee",
    ]).toContain(name)
  })

  it("defaults to pair for celebrating_many with grouping:individual", () => {
    const name = getExampleName(
      "Colour",
      "they",
      "individual",
      "celebrating_many"
    )
    expect([
      "Joan & Arthur",
      "Gretchen & George",
      "Sylvia & Frank",
      "Elizabeth & Raymond",
    ]).toContain(name)
  })

  it("returns a cause name for cause register", () => {
    const name = getExampleName("Colour", undefined, "individual", "cause")
    expect([
      "The Sunshine Appeal",
      "Helping Hands Fund",
      "The Riverside Appeal",
    ]).toContain(name)
  })

  it("returns a non-empty string for neutral register", () => {
    const name = getExampleName("Colour", undefined, "individual", "neutral")
    expect(name.length).toBeGreaterThan(0)
  })

  it("falls back to she when pronouns is undefined in remembering register", () => {
    const name = getExampleName(
      "Colour",
      undefined,
      "individual",
      "remembering"
    )
    expect([
      "Gretchen",
      "Elizabeth",
      "Joan",
      "Sylvia",
      "Penny",
      "Vera",
    ]).toContain(name)
  })
})
