import { describe, it, expect } from "vitest"
import {
  buildMechanicSteps,
  isQuoteReveal,
  mechanicFooter,
  isMessageReveal,
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

describe("isMessageReveal", () => {
  const HATS = [
    "Beret",
    "Bowler",
    "Deerstalker",
    "Fez",
    "Sombrero",
    "Stetson",
    "Top hat",
    "Viking helmet",
  ]

  it("calls a reveal that names no option a message", () => {
    expect(
      isMessageReveal(
        "Thank you, all of you. I'll see you at the finish, whatever I end up in.",
        HATS
      )
    ).toBe(true)
  })

  it("does not call the house pattern a message", () => {
    // The favourite leads: "Purple. She wore it..."
    expect(
      isMessageReveal("Purple. She wore it to every important occasion.", [
        "Purple",
        "Blue",
      ])
    ).toBe(false)
  })

  it("finds a favourite anywhere in the opening sentence, not just at the start", () => {
    // The wedding's shape — the option lands at the END of sentence one.
    expect(
      isMessageReveal(
        "Ours will hopefully be Chengdu. We're planning to visit the pandas on our honeymoon.",
        ["Italy", "Chengdu", "Japan"]
      )
    ).toBe(false)
  })

  it("ignores an option mentioned only after the opening sentence", () => {
    // Testing the whole reveal would misread this as a favourite disclosure.
    expect(
      isMessageReveal(
        "Thank you, all of you. Even whoever nominated the Viking helmet.",
        HATS
      )
    ).toBe(true)
  })

  it("is case- and substring-tolerant", () => {
    expect(isMessageReveal("the FEZ, obviously.", HATS)).toBe(false)
  })

  it("fails towards today when there is nothing to decide with", () => {
    expect(isMessageReveal(null, HATS)).toBe(false)
    expect(isMessageReveal("   ", HATS)).toBe(false)
    expect(isMessageReveal("A message with no list to check.", [])).toBe(false)
    expect(isMessageReveal("A message with no list to check.", null)).toBe(
      false
    )
  })
})

describe("buildMechanicSteps — message reveals", () => {
  const base = {
    topicTitle: "Hat",
    charityLine: "British Heart Foundation",
    isCause: false,
    hasReveal: true,
  }

  it("promises a message rather than a favourite", () => {
    const steps = buildMechanicSteps({
      ...base,
      firstName: "Marcus",
      revealIsMessage: true,
    })
    expect(steps[2]).toBe(
      "Marcus's message will be revealed along with the standings"
    )
  })

  it("falls back to an unnamed message with no protagonist", () => {
    const steps = buildMechanicSteps({
      ...base,
      firstName: null,
      revealIsMessage: true,
    })
    expect(steps[2]).toBe("A message will be revealed along with the standings")
  })

  it("beats both isCause and revealIsQuote", () => {
    const steps = buildMechanicSteps({
      ...base,
      firstName: "Marcus",
      isCause: true,
      revealIsQuote: true,
      revealIsMessage: true,
    })
    expect(steps[2]).toBe(
      "Marcus's message will be revealed along with the standings"
    )
  })

  it("leaves favourite reveals exactly as they were", () => {
    const steps = buildMechanicSteps({
      ...base,
      firstName: "Belinda",
      revealIsMessage: false,
    })
    expect(steps[2]).toBe(
      "Belinda's favourite will be revealed along with the standings"
    )
  })
})
