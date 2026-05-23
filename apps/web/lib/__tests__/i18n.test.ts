import { describe, it, expect } from "vitest"
import { formatCurrency, MARKET_DEFAULTS, t } from "@/lib/i18n"

describe("formatCurrency", () => {
  it("formats whole pounds with no decimal places", () => {
    expect(formatCurrency(75000)).toBe("£750")
  })

  it("formats pence amounts with up to 2 decimal places", () => {
    expect(formatCurrency(1050)).toBe("£10.5")
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

describe("MARKET_DEFAULTS", () => {
  it("en-GB uses GBP and en-GB locale", () => {
    expect(MARKET_DEFAULTS["en-GB"]).toEqual({ locale: "en-GB", currency: "GBP" })
  })

  it("en-US uses USD and en-US locale", () => {
    expect(MARKET_DEFAULTS["en-US"]).toEqual({ locale: "en-US", currency: "USD" })
  })
})

describe("t", () => {
  it("returns the correct string for a known key", () => {
    expect(t("landing.headline")).toBe("Introducing a new way to honour them.")
  })

  it("returns the brand subheader", () => {
    expect(t("landing.subheader")).toBe(
      "Expressions of joy, for charitable causes, in the name of those we love."
    )
  })

  it("returns the primary CTA", () => {
    expect(t("landing.cta.primary")).toBe("Create an event")
  })
})
