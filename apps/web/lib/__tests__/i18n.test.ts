import { describe, it, expect } from "vitest"
import {
  formatCount,
  formatCurrency,
  formatPounds,
  formatPoundsCompact,
  formatPoundsExact,
  MARKET_DEFAULTS,
  t,
} from "@/lib/i18n"

describe("formatCurrency", () => {
  it("formats whole pounds with no decimal places", () => {
    expect(formatCurrency(75000)).toBe("£750")
  })

  it("formats pence amounts with up to 2 decimal places", () => {
    expect(formatCurrency(1050)).toBe("£10.50")
  })

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("£0")
  })

  it("formats thousands with comma separator", () => {
    expect(formatCurrency(150000)).toBe("£1,500")
  })

  it("uses en-US / USD when market defaults passed", () => {
    expect(formatCurrency(1000, MARKET_DEFAULTS["en-US"])).toBe("$10")
  })

  it("uses en-GB / GBP by default", () => {
    expect(formatCurrency(1000)).toBe("£10")
  })
})

describe("formatPounds", () => {
  it("drops decimals on whole amounts", () => {
    expect(formatPounds(1300)).toBe("£1,300")
  })

  it("pads pence to two decimals when present", () => {
    expect(formatPounds(12.5)).toBe("£12.50")
    expect(formatPounds(12.55)).toBe("£12.55")
  })

  it("formats zero", () => {
    expect(formatPounds(0)).toBe("£0")
  })
})

describe("formatPoundsExact", () => {
  it("always shows two decimals", () => {
    expect(formatPoundsExact(12)).toBe("£12.00")
    expect(formatPoundsExact(12.5)).toBe("£12.50")
  })
})

describe("formatPoundsCompact", () => {
  it("shows a dash for zero", () => {
    expect(formatPoundsCompact(0)).toBe("—")
  })

  it("compacts from a thousand", () => {
    // ICU versions disagree on the suffix case ("£1.3K" locally, "£1.3k"
    // on CI's Node) — assert the shape, not the case
    expect(formatPoundsCompact(1250)).toMatch(/^£1\.3[kK]$/)
  })

  it("shows whole pounds below a thousand", () => {
    expect(formatPoundsCompact(999)).toBe("£999")
  })
})

describe("formatCount", () => {
  it("groups thousands", () => {
    expect(formatCount(1234)).toBe("1,234")
  })
})

describe("MARKET_DEFAULTS", () => {
  it("en-GB uses GBP and en-GB locale", () => {
    expect(MARKET_DEFAULTS["en-GB"]).toEqual({
      locale: "en-GB",
      currency: "GBP",
    })
  })

  it("en-US uses USD and en-US locale", () => {
    expect(MARKET_DEFAULTS["en-US"]).toEqual({
      locale: "en-US",
      currency: "USD",
    })
  })
})

describe("t", () => {
  it("returns the universal, register-agnostic landing headline", () => {
    expect(t("landing.headline")).toBe(
      "Pick your favourite. Give what it's worth. See where it stands."
    )
  })

  it("returns the CTA caption", () => {
    expect(t("landing.cta.caption")).toBe(
      "Free to create · 100% goes to charity"
    )
  })

  // The hero's short caption — the closing CTA keeps the full one, where the
  // 100% is doing work the hero's stat row already does.
  it("returns the hero's short CTA caption", () => {
    expect(t("landing.cta.free")).toBe("Free to create")
  })

  it("returns the brand subheader", () => {
    expect(t("landing.subheader")).toBe(
      "Expressions of joy, for charitable causes, in the name of those we love."
    )
  })

  it("returns the primary CTA", () => {
    expect(t("landing.cta.primary")).toBe("Create a favpoll")
  })
})
