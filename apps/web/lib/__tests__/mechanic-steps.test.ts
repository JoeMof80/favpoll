import { describe, it, expect } from "vitest"
import {
  buildMechanicSteps,
  isQuoteReveal,
  mechanicFooter,
} from "../mechanic-steps"

describe("buildMechanicSteps", () => {
  it("builds the person steps with charity and first name", () => {
    expect(
      buildMechanicSteps({
        topicTitle: "Seaside town",
        charityLine: "Samaritans",
        firstName: "Clive",
        isCause: false,
        hasReveal: true,
      })
    ).toEqual([
      "Pick your favourite seaside town",
      "Pledge what it's worth — all money will go to Samaritans",
      "Clive's favourite will be revealed along with the standings",
    ])
  })

  it("speaks as 'our pick' for causes", () => {
    const steps = buildMechanicSteps({
      topicTitle: "Colour",
      charityLine: null,
      firstName: null,
      isCause: true,
      hasReveal: true,
    })
    expect(steps[1]).toContain("all money will go to charity")
    expect(steps[2]).toBe("Our pick will be revealed along with the standings")
  })

  it("promises only the standings when no reveal exists", () => {
    const steps = buildMechanicSteps({
      topicTitle: "Colour",
      charityLine: "Oxfam",
      firstName: "Joan",
      isCause: false,
      hasReveal: false,
    })
    expect(steps[2]).toBe("The standings will be revealed")
  })

  it("promises their own words when the reveal is a quote", () => {
    const steps = buildMechanicSteps({
      topicTitle: "Colour",
      charityLine: "Oxfam",
      firstName: "Joan",
      isCause: false,
      hasReveal: true,
      revealIsQuote: true,
    })
    expect(steps[2]).toBe(
      "Joan's favourite will be revealed in their own words, along with the standings"
    )
  })

  it("detects quote reveals by their opening mark only", () => {
    expect(isQuoteReveal('"Labradors are the only honest dogs."')).toBe(true)
    expect(isQuoteReveal("\u201CAlways the sea.\u201D")).toBe(true)
    expect(isQuoteReveal("  'Bude, every time.'")).toBe(true)
    expect(isQuoteReveal("He always said Bude, every time.")).toBe(false)
    expect(isQuoteReveal(null)).toBe(false)
    expect(isQuoteReveal(undefined)).toBe(false)
  })

  it("footer routes the favourite-less guest to the shared fund", () => {
    expect(mechanicFooter("Seaside town")).toBe(
      "Don't have a favourite seaside town? That's okay — you can still give to the shared fund."
    )
  })
})
