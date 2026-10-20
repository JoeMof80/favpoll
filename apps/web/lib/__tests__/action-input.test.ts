import { describe, it, expect, vi, beforeEach } from "vitest"
import { z } from "zod"
import { parseInput } from "@/lib/action-input"

// The helper logs the whole issue list so a refusal is diagnosable from
// the server log; the person only ever sees the first sentence.
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
})

const schema = z.object({
  id: z.string().min(1, "Missing the favpoll."),
  amount: z.number().positive("That amount isn't a number we can take."),
  note: z.string().nullable().optional(),
})

describe("parseInput", () => {
  it("returns the parsed value when the shape holds", () => {
    expect(parseInput(schema, { id: "a", amount: 5 }, "test")).toEqual({
      id: "a",
      amount: 5,
    })
  })

  it("throws the failing field's own sentence", () => {
    expect(() => parseInput(schema, { id: "", amount: 5 }, "test")).toThrow(
      "Missing the favpoll."
    )
  })

  it("throws the FIRST sentence when several fields fail", () => {
    expect(() => parseInput(schema, { id: "", amount: -1 }, "test")).toThrow(
      "Missing the favpoll."
    )
  })

  it("logs every failure under the action's name", () => {
    expect(() =>
      parseInput(schema, { id: "", amount: -1 }, "doThing")
    ).toThrow()
    expect(console.error).toHaveBeenCalledWith(
      "[doThing] rejected its input:",
      [
        "id: Missing the favpoll.",
        "amount: That amount isn't a number we can take.",
      ]
    )
  })

  it("names the field in the log even for a nested path", () => {
    const nested = z.object({
      picks: z.array(z.object({ amount: z.number() })),
    })
    expect(() =>
      parseInput(nested, { picks: [{ amount: "lots" }] }, "doThing")
    ).toThrow()
    expect(console.error).toHaveBeenCalledWith(
      "[doThing] rejected its input:",
      [expect.stringContaining("picks.0.amount")]
    )
  })

  it("refuses a value that is not an object at all", () => {
    expect(() => parseInput(schema, null, "test")).toThrow()
    expect(() => parseInput(schema, "nope", "test")).toThrow()
  })

  it("falls back to a readable sentence when zod gives no message", () => {
    // A schema whose only failure carries an empty message — the person
    // still gets a sentence rather than an empty error.
    const blank = z.string().refine(() => false, { message: "" })
    expect(() => parseInput(blank, "x", "test")).toThrow(
      "Something about that request didn't look right."
    )
  })

  it("strips unknown keys rather than refusing them: a client left over\n     from before a deploy sends extra fields, and the card is already charged", () => {
    expect(
      parseInput(schema, { id: "a", amount: 5, leftover: "x" }, "test")
    ).toEqual({ id: "a", amount: 5 })
  })
})
