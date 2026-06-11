import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  ordinal,
  formatEventDate,
  getEventHeadline,
  charityNames,
  formatAmount,
  formatRelativeDate,
} from "@/lib/display"

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
  it("returns the correct prefix for Birthday occasion_type", () => {
    const result = getEventHeadline({
      register: "celebrating_one",
      occasionType: "Birthday",
      name: "Alice",
    })
    expect(result).toEqual({
      prefix: "Happy birthday",
      name: "Alice",
      suffix: "",
    })
  })

  it("returns the correct prefix for Memorial occasion_type", () => {
    const result = getEventHeadline({
      register: "remembering",
      occasionType: "Memorial",
      name: "Bob",
    })
    expect(result.prefix).toBe("In memory of")
  })

  it("returns the correct prefix for Wedding occasion_type", () => {
    const result = getEventHeadline({
      register: "celebrating_many",
      occasionType: "Wedding",
      name: "Emma & James",
    })
    expect(result.prefix).toBe("Congratulations to")
  })

  it("falls back to register prefix when occasionType is null", () => {
    const result = getEventHeadline({
      register: "neutral",
      occasionType: null,
      name: "Carol",
    })
    expect(result.prefix).toBe("Honouring")
  })

  it("falls back to 'Honouring' for unknown register with no occasionType", () => {
    const result = getEventHeadline({
      register: "unknown_register",
      occasionType: null,
      name: "Carol",
    })
    expect(result.prefix).toBe("Honouring")
  })

  it("openingLine overrides prefix lookup", () => {
    const result = getEventHeadline({
      register: "celebrating_one",
      occasionType: "Birthday",
      name: "Dave",
      openingLine: "Custom prefix",
    })
    expect(result.prefix).toBe("Custom prefix")
  })

  it("returns empty string suffix when dateLabel is omitted", () => {
    const result = getEventHeadline({
      register: "celebrating_one",
      occasionType: "Birthday",
      name: "Eve",
    })
    expect(result.suffix).toBe("")
  })

  it("returns empty string suffix when dateLabel is null", () => {
    const result = getEventHeadline({
      register: "celebrating_one",
      occasionType: "Birthday",
      name: "Eve",
      dateLabel: null,
    })
    expect(result.suffix).toBe("")
  })

  it("returns dateLabel as suffix when provided", () => {
    const result = getEventHeadline({
      register: "remembering",
      occasionType: "Memorial",
      name: "Fred",
      dateLabel: "1940 – 2024",
    })
    expect(result.suffix).toBe("1940 – 2024")
  })

  it("passes name through unchanged", () => {
    const result = getEventHeadline({
      register: "neutral",
      occasionType: null,
      name: "Grace & Henry",
    })
    expect(result.name).toBe("Grace & Henry")
  })
})

describe("charityNames", () => {
  it("returns empty string for empty array", () => {
    expect(charityNames([])).toBe("")
  })

  it("returns single name", () => {
    expect(charityNames([{ charity: { name: "Age UK" } }])).toBe("Age UK")
  })

  it("joins two names with &", () => {
    expect(
      charityNames([
        { charity: { name: "Age UK" } },
        { charity: { name: "Macmillan" } },
      ])
    ).toBe("Age UK & Macmillan")
  })

  it("joins three names with commas and &", () => {
    expect(
      charityNames([
        { charity: { name: "Age UK" } },
        { charity: { name: "Macmillan" } },
        { charity: { name: "RNLI" } },
      ])
    ).toBe("Age UK, Macmillan & RNLI")
  })
})

describe("formatAmount", () => {
  it("formats zero as £0", () => {
    expect(formatAmount(0)).toBe("£0")
  })

  it("formats a whole number without pence", () => {
    expect(formatAmount(750)).toBe("£750")
  })

  it("formats thousands with comma separator", () => {
    expect(formatAmount(1500)).toBe("£1,500")
  })

  it("rounds to nearest pound", () => {
    expect(formatAmount(99.7)).toBe("£100")
  })
})

describe("ordinal — locale parameter", () => {
  it("defaults to en-GB behaviour", () => {
    expect(ordinal(1)).toBe("1st")
    expect(ordinal(11)).toBe("11th")
    expect(ordinal(21)).toBe("21st")
  })

  it("accepts an explicit locale", () => {
    // en-US ordinals are identical to en-GB
    expect(ordinal(1, "en-US")).toBe("1st")
    expect(ordinal(2, "en-US")).toBe("2nd")
    expect(ordinal(3, "en-US")).toBe("3rd")
    expect(ordinal(4, "en-US")).toBe("4th")
  })
})

describe("formatEventDate — locale parameter", () => {
  it("defaults to en-GB output", () => {
    expect(formatEventDate("2025-06-15")).toBe("15th June 2025")
  })

  it("accepts an explicit locale matching en-GB output", () => {
    expect(formatEventDate("2025-06-15", "en-GB")).toBe("15th June 2025")
  })
})

describe("getEventHeadline — all known occasion_types", () => {
  it.each([
    ["Tribute", "remembering", "In honour of"],
    ["Celebration of life", "remembering", "Celebrating the life of"],
    ["Pet memorial", "remembering", "In memory of"],
    ["Retirement", "celebrating_one", "Celebrating the retirement of"],
    ["Engagement", "celebrating_many", "Congratulations to"],
    ["Anniversary", "celebrating_many", "Happy anniversary"],
    ["Leaving do", "celebrating_one", "Farewell"],
    ["Graduation", "celebrating_one", "Congratulations to"],
    ["Christening", "celebrating_one", "Welcome"],
    ["Achievement", "celebrating_one", "Well done"],
    ["Recovery", "celebrating_one", "Wishing a speedy recovery to"],
    ["Award", "celebrating_one", "Congratulations to"],
    ["Promotion", "celebrating_one", "Congratulations to"],
    ["Baby shower", "celebrating_one", "Celebrating"],
    ["New baby", "celebrating_one", "Welcome"],
    ["Bar or bat mitzvah", "celebrating_one", "Mazel tov to"],
    ["New job", "celebrating_one", "Congratulations to"],
    ["Exam success", "celebrating_one", "Congratulations to"],
    ["New home", "celebrating_one", "Congratulations to"],
    ["Citizenship", "celebrating_one", "Congratulations to"],
    ["Coming out", "celebrating_one", "Celebrating"],
    ["Divorce party", "celebrating_one", "Celebrating"],
    ["Just because", "celebrating_one", "Honouring"],
    ["Renewal of vows", "celebrating_many", "Congratulations to"],
    ["Reunion", "celebrating_many", "Celebrating"],
    ["Team celebration", "celebrating_many", "Celebrating"],
    ["Family gathering", "celebrating_many", "Celebrating"],
    ["Fundraiser", "cause", "In support of"],
    ["Sponsored event", "cause", "In support of"],
    ["Charity night", "cause", "In support of"],
    ["In memoriam appeal", "cause", "In memory of"],
  ])(
    'occasion_type "%s" returns prefix "%s"',
    (occasionType, register, expectedPrefix) => {
      expect(
        getEventHeadline({ register, occasionType, name: "Test" }).prefix
      ).toBe(expectedPrefix)
    }
  )
})

describe("getEventHeadline — register fallbacks (no occasion_type, default subject='someone')", () => {
  it.each([
    ["remembering", "In memory of"],
    ["celebrating_one", "Celebrating"],
    ["celebrating_many", "Celebrating"],
    ["cause", "Honouring"],
    ["neutral", "Honouring"],
  ])('register "%s" falls back to "%s"', (register, expectedPrefix) => {
    expect(
      getEventHeadline({ register, occasionType: null, name: "Test" }).prefix
    ).toBe(expectedPrefix)
  })
})

describe("getEventHeadline — subject matrix", () => {
  it("fundraiser + subject=someone → 'Honouring'", () => {
    expect(
      getEventHeadline({
        register: "cause",
        occasionType: null,
        name: "Joan",
        subject: "someone",
      }).prefix
    ).toBe("Honouring")
  })

  it("fundraiser + subject=cause → 'In support of'", () => {
    expect(
      getEventHeadline({
        register: "cause",
        occasionType: null,
        name: "Ocean Trust",
        subject: "cause",
      }).prefix
    ).toBe("In support of")
  })

  it("memorial + subject=someone → 'In memory of'", () => {
    expect(
      getEventHeadline({
        register: "remembering",
        occasionType: null,
        name: "Bob",
        subject: "someone",
      }).prefix
    ).toBe("In memory of")
  })

  it("memorial + subject=cause → 'In memory of'", () => {
    expect(
      getEventHeadline({
        register: "remembering",
        occasionType: null,
        name: "The Shelter Fund",
        subject: "cause",
      }).prefix
    ).toBe("In memory of")
  })

  it("celebration + subject=someone → 'Celebrating'", () => {
    expect(
      getEventHeadline({
        register: "celebrating_one",
        occasionType: null,
        name: "Alice",
        subject: "someone",
      }).prefix
    ).toBe("Celebrating")
  })

  it("celebration + subject=cause → 'Celebrating'", () => {
    expect(
      getEventHeadline({
        register: "celebrating_one",
        occasionType: null,
        name: "The Arts Fund",
        subject: "cause",
      }).prefix
    ).toBe("Celebrating")
  })

  it("neutral + subject=cause → 'Honouring'", () => {
    expect(
      getEventHeadline({
        register: "neutral",
        occasionType: null,
        name: "The Green Initiative",
        subject: "cause",
      }).prefix
    ).toBe("Honouring")
  })

  it("cause label is passed through as the name", () => {
    const result = getEventHeadline({
      register: "cause",
      occasionType: null,
      name: "Ocean Trust",
      subject: "cause",
    })
    expect(result.name).toBe("Ocean Trust")
  })
})

describe("formatRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2027-06-15T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns 'soon' for past dates", () => {
    expect(formatRelativeDate("2027-06-14T12:00:00Z")).toBe("soon")
  })

  it("returns 'today' for a date earlier the same day (diff rounds to 0)", () => {
    // now = noon; date = 6am same day → diff = -0.25 days → Math.ceil = 0
    expect(formatRelativeDate("2027-06-15T06:00:00Z")).toBe("today")
  })

  it("returns 'tomorrow' for next day", () => {
    expect(formatRelativeDate("2027-06-16T12:00:00Z")).toBe("tomorrow")
  })

  it("returns 'in N days' for 2–6 days ahead", () => {
    expect(formatRelativeDate("2027-06-19T12:00:00Z")).toBe("in 4 days")
  })

  it("returns 'next week' for 7–13 days ahead", () => {
    expect(formatRelativeDate("2027-06-22T12:00:00Z")).toBe("next week")
  })

  it("returns ordinal day + month for 14+ days ahead", () => {
    expect(formatRelativeDate("2027-07-10T12:00:00Z")).toBe("10th July")
  })
})
