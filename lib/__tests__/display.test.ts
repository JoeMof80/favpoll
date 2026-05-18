import { describe, it, expect } from "vitest"
import { ordinal, formatEventDate, getEventHeadline } from "@/lib/display"

describe("ordinal", () => {
  it.each([
    [1, "1st"],
    [2, "2nd"],
    [3, "3rd"],
    [4, "4th"],
    [5, "5th"],
    [10, "10th"],
    [11, "11th"],
    [12, "12th"],
    [13, "13th"],
    [20, "20th"],
    [21, "21st"],
    [22, "22nd"],
    [23, "23rd"],
    [100, "100th"],
    [101, "101st"],
    [111, "111th"],
    [121, "121st"],
  ])("ordinal(%i) → %s", (n, expected) => {
    expect(ordinal(n)).toBe(expected)
  })
})

describe("formatEventDate", () => {
  it("formats a date string to ordinal day month year", () => {
    // T12:00:00 is appended internally — won't cross day boundaries in any timezone
    expect(formatEventDate("2025-06-15")).toBe("15th June 2025")
  })

  it("handles 1st of a month", () => {
    expect(formatEventDate("2025-03-01")).toBe("1st March 2025")
  })

  it("handles 2nd of a month", () => {
    expect(formatEventDate("2025-03-02")).toBe("2nd March 2025")
  })

  it("handles 3rd of a month", () => {
    expect(formatEventDate("2025-03-03")).toBe("3rd March 2025")
  })

  it("handles 11th — th not st", () => {
    expect(formatEventDate("2025-01-11")).toBe("11th January 2025")
  })

  it("handles 21st", () => {
    expect(formatEventDate("2025-01-21")).toBe("21st January 2025")
  })

  it("accepts a Date object", () => {
    // noon UTC avoids any timezone day-shift
    const date = new Date("2024-12-25T12:00:00Z")
    const result = formatEventDate(date)
    expect(result).toMatch(/25th December 2024/)
  })
})

describe("getEventHeadline", () => {
  it("returns the correct prefix for birthday", () => {
    const result = getEventHeadline({ occasion: "birthday", name: "Alice" })
    expect(result).toEqual({ prefix: "Happy birthday", name: "Alice", suffix: "" })
  })

  it("returns the correct prefix for memorial", () => {
    const result = getEventHeadline({ occasion: "memorial", name: "Bob" })
    expect(result.prefix).toBe("In memory of")
  })

  it("returns the correct prefix for wedding", () => {
    const result = getEventHeadline({ occasion: "wedding", name: "Emma & James" })
    expect(result.prefix).toBe("Congratulations to")
  })

  it("falls back to 'Honouring' for unknown occasion", () => {
    const result = getEventHeadline({ occasion: "unknown_type", name: "Carol" })
    expect(result.prefix).toBe("Honouring")
  })

  it("occasionLabel overrides PREFIXES lookup", () => {
    const result = getEventHeadline({
      occasion: "birthday",
      name: "Dave",
      occasionLabel: "Custom prefix",
    })
    expect(result.prefix).toBe("Custom prefix")
  })

  it("returns empty string suffix when dateLabel is omitted", () => {
    const result = getEventHeadline({ occasion: "birthday", name: "Eve" })
    expect(result.suffix).toBe("")
  })

  it("returns empty string suffix when dateLabel is null", () => {
    const result = getEventHeadline({ occasion: "birthday", name: "Eve", dateLabel: null })
    expect(result.suffix).toBe("")
  })

  it("returns dateLabel as suffix when provided", () => {
    const result = getEventHeadline({
      occasion: "memorial",
      name: "Fred",
      dateLabel: "1940 – 2024",
    })
    expect(result.suffix).toBe("1940 – 2024")
  })

  it("passes name through unchanged", () => {
    const result = getEventHeadline({ occasion: "other", name: "Grace & Henry" })
    expect(result.name).toBe("Grace & Henry")
  })
})
