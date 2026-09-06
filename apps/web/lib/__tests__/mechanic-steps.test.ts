import { describe, it, expect } from "vitest"
import {
  buildMechanicSteps,
  isQuoteReveal,
  mechanicFooter,
  isMessageReveal,
} from "../mechanic-steps"

describe("buildMechanicSteps", () => {
  // Step 3 stopped referencing the reveal (founder, 2026-09-01): five
  // variants tried to explain a thing with multiple purposes. One
  // universal promise now — the labels still speak about the reveal.
  it("builds the three steps", () => {
    expect(
      buildMechanicSteps({
        topicTitle: "Seaside town",
        charityLine: "Samaritans",
      })
    ).toEqual([
      "Pick your favourite seaside town",
      "Pledge what it's worth — all money will go to Samaritans",
      "The standings will be revealed",
    ])
  })

  it("falls back to 'charity' without a charity line", () => {
    const steps = buildMechanicSteps({
      topicTitle: "Colour",
      charityLine: null,
    })
    expect(steps[1]).toContain("all money will go to charity")
    expect(steps[2]).toBe("The standings will be revealed")
  })

  it("detects quote reveals by their opening mark only", () => {
    expect(isQuoteReveal('"Labradors are the only honest dogs."')).toBe(true)
    expect(isQuoteReveal("\u201CAlways the sea.\u201D")).toBe(true)
    expect(isQuoteReveal("  'Bude, every time.'")).toBe(true)
    expect(isQuoteReveal("He always said Bude, every time.")).toBe(false)
    expect(isQuoteReveal(null)).toBe(false)
    expect(isQuoteReveal(undefined)).toBe(false)
  })

  it("footer routes the favourite-less guest to the shared pot", () => {
    expect(mechanicFooter("Seaside town")).toBe(
      "Don't have a favourite seaside town? That's okay — you can still give to the shared pot."
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
