import { describe, it, expect } from "vitest"
import { isOutcomeSentence, normaliseOutcome } from "@/lib/favpoll-fields"

describe("the enacted shape's sentence — two shapes only", () => {
  it.each([
    "the winner is the joint on the table",
    "The winner is the game that comes out after lunch",
    "the top five are the board on the night",
    "The top 10 are the playlist for the night",
    "the top ten are the set list",
  ])("accepts %j", (s) => {
    expect(isOutcomeSentence(s)).toBe(true)
  })

  it.each([
    "we will play the winner",
    "the winners go on the board",
    "the top are the playlist",
    "the winner is",
    "",
  ])("refuses %j", (s) => {
    expect(isOutcomeSentence(s)).toBe(false)
  })

  it("normalises: trims, drops the trailing full stop, blank is null", () => {
    expect(normaliseOutcome("  the winner is the roast.  ")).toBe(
      "the winner is the roast"
    )
    expect(normaliseOutcome("   ")).toBeNull()
    expect(normaliseOutcome(null)).toBeNull()
  })
})
