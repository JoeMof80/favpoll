import { describe, it, expect } from "vitest"
import { getShapePrompt } from "@/lib/shape-prompts"

describe("getShapePrompt — about", () => {
  it.each([
    [
      "remembering",
      "Tell guests who they were — warm and specific. What were they like, what did they care about?",
    ],
    [
      "celebrating_one",
      "Tell guests who they are — warm and specific. What are they like, what do they care about?",
    ],
    [
      "celebrating_many",
      "Tell guests who they are — warm and specific. What are they like together?",
    ],
    [
      "cause",
      "Tell guests what this is for — the cause, why it matters, who it helps.",
    ],
    ["neutral", "Tell guests who or what this favpoll is for."],
  ])('register "%s" returns correct about prompt', (register, expected) => {
    expect(getShapePrompt(register, "colour", "about")).toBe(expected)
  })

  it("falls back to neutral for unknown register", () => {
    expect(getShapePrompt("unknown", "colour", "about")).toBe(
      "Tell guests who or what this favpoll is for."
    )
  })
})

describe("getShapePrompt — reveal", () => {
  it("replaces {t} with the topic title for remembering", () => {
    expect(getShapePrompt("remembering", "colour", "reveal")).toBe(
      "Reveal what their favourite colour was, and what made it theirs — the detail only they'd pick."
    )
  })

  it("replaces {t} with the topic title for celebrating_one", () => {
    expect(getShapePrompt("celebrating_one", "song", "reveal")).toBe(
      "Reveal what their favourite song is, and what makes it theirs — the detail only they'd pick."
    )
  })

  it("replaces {t} with the topic title for celebrating_many", () => {
    expect(getShapePrompt("celebrating_many", "film", "reveal")).toBe(
      "Reveal what their favourite film is, and what makes it theirs."
    )
  })

  it("replaces {t} for cause register", () => {
    expect(getShapePrompt("cause", "book", "reveal")).toBe(
      "Reveal a favourite book to start guests off — yours, or one that fits the cause."
    )
  })

  it("uses 'thing' when topicTitleLower is empty", () => {
    expect(getShapePrompt("celebrating_one", "", "reveal")).toBe(
      "Reveal what their favourite thing is, and what makes it theirs — the detail only they'd pick."
    )
  })

  it("falls back to neutral for unknown register", () => {
    expect(getShapePrompt("unknown", "biscuit", "reveal")).toBe(
      "Reveal the favourite biscuit and what makes it special."
    )
  })
})
