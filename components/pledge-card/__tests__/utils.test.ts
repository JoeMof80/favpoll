import { describe, it, expect } from "vitest"
import { formatCharityLabel } from "@/components/pledge-card/utils"

describe("formatCharityLabel", () => {
  it("returns 'charity' for an empty array", () => {
    expect(formatCharityLabel([])).toBe("charity")
  })

  it("returns the name directly for a single charity", () => {
    expect(formatCharityLabel(["Cancer Research UK"])).toBe("Cancer Research UK")
  })

  it("joins two charities with ' & '", () => {
    expect(formatCharityLabel(["Oxfam", "RNLI"])).toBe("Oxfam & RNLI")
  })

  it("joins three charities with Oxford-style comma and '&'", () => {
    expect(formatCharityLabel(["Oxfam", "RNLI", "Mind"])).toBe("Oxfam, RNLI & Mind")
  })

  it("handles charity names with special characters", () => {
    expect(formatCharityLabel(["St. John's Ambulance"])).toBe("St. John's Ambulance")
  })
})
