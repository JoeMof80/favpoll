import { describe, expect, it } from "vitest"
import {
  HERO_NAME_STEP_DOWN_AT,
  heroNameMobileSizeClass,
  heroNameSizeClass,
} from "../display"

describe("heroNameSizeClass", () => {
  it("keeps the founder's standard size for names that fit a phone beside an avatar", () => {
    expect(heroNameSizeClass("Donald")).toBe("text-3xl sm:text-4xl")
    expect(heroNameSizeClass("Belinda Hartley")).toBe("text-3xl sm:text-4xl")
  })

  it("steps down one size on phones for names that would wrap (St Mark's Hospice, measured 2026-08-31)", () => {
    expect("St Mark's Hospice".length).toBeGreaterThanOrEqual(
      HERO_NAME_STEP_DOWN_AT
    )
    expect(heroNameSizeClass("St Mark's Hospice")).toBe("text-2xl sm:text-3xl")
    expect(heroNameMobileSizeClass("Ending homelessness in the UK")).toBe(
      "text-2xl"
    )
  })

  it("ignores surrounding whitespace", () => {
    expect(heroNameMobileSizeClass("  Donald  ")).toBe("text-3xl")
  })
})
