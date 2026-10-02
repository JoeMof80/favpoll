import { describe, it, expect, vi } from "vitest"

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: vi.fn() }
  },
}))
import { applyEnactedChoice, GENERIC_OUTCOME } from "@/lib/story-engine"
import type { StoryEdges } from "@/lib/pairing-table"

const reunionSong: StoryEdges = {
  e1: {
    text: "Song happens at a reunion.",
    star: true,
    enacted: "the top ten are the playlist for the night",
  },
  e2: null,
  e3: null,
  count: 1,
}
const birthdayBiscuit: StoryEdges = {
  e1: { text: "Biscuit at a birthday, two hops.", star: false },
  e2: null,
  e3: null,
  count: 1,
}

describe("applyEnactedChoice — the Generate switch over the pairing row", () => {
  it("unset: the row decides, untouched", () => {
    expect(applyEnactedChoice(reunionSong, undefined)).toBe(reunionSong)
    expect(applyEnactedChoice(birthdayBiscuit, undefined)).toBe(birthdayBiscuit)
  })

  it("off: an enacted row becomes a reveal, the row itself unmutated", () => {
    const out = applyEnactedChoice(reunionSong, false)
    expect(out.e1?.enacted).toBeUndefined()
    expect(out.e1?.text).toBe(reunionSong.e1!.text)
    expect(reunionSong.e1?.enacted).toBe(
      "the top ten are the playlist for the night"
    )
  })

  it("on: a row with no sentence gets the generic outcome, in one of the two shapes", () => {
    const out = applyEnactedChoice(birthdayBiscuit, true)
    expect(out.e1?.enacted).toBe(GENERIC_OUTCOME)
    expect(GENERIC_OUTCOME).toMatch(/^the top \w+ are /)
    expect(out.e1?.text).toBe(birthdayBiscuit.e1!.text)
  })

  it("on: a row with its own sentence keeps it", () => {
    expect(applyEnactedChoice(reunionSong, true)).toBe(reunionSong)
  })

  it("on with no occasion edge at all: an edge is made for the outcome", () => {
    const none: StoryEdges = { e1: null, e2: null, e3: null, count: 0 }
    const out = applyEnactedChoice(none, true)
    expect(out.e1?.enacted).toBe(GENERIC_OUTCOME)
    expect(out.e1?.star).toBe(true)
  })
})
