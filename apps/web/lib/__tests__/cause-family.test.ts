import { describe, it, expect, vi, beforeEach } from "vitest"

const mockCreate = vi.hoisted(() => vi.fn())
// A class, not an arrow function: the SDK is constructed with `new`, and
// Vitest calls the mock with `new` too — an arrow impl "is not a constructor".
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: mockCreate }
  },
}))

import { suggestCauseFamily } from "@/lib/cause-family"

const reply = (text: string) => ({
  content: [{ type: "text", text }],
})

beforeEach(() => {
  mockCreate.mockReset()
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key")
})

describe("suggestCauseFamily", () => {
  it("returns the family the model names", async () => {
    mockCreate.mockResolvedValue(reply("homelessness\n"))
    const family = await suggestCauseFamily({
      name: "Shelter",
      activities:
        "Shelter helps millions of people struggling with bad housing and homelessness.",
      classification: { what: ["Accommodation/housing"], who: [], how: [] },
    })
    expect(family).toBe("homelessness")
    const prompt = mockCreate.mock.calls[0][0].messages[0].content as string
    expect(prompt).toContain("bad housing and homelessness")
    expect(prompt).toContain("answer none")
  })

  it("maps 'none' and anything off-list to null", async () => {
    mockCreate.mockResolvedValueOnce(reply("none"))
    expect(
      await suggestCauseFamily({
        name: "MAC Bevan Charitable Trust",
        activities: "Offers grants to small non-profit organisations.",
        classification: {
          what: ["General Charitable Purposes"],
          who: [],
          how: [],
        },
      })
    ).toBeNull()
    mockCreate.mockResolvedValueOnce(reply("Probably animals, I think."))
    expect(
      await suggestCauseFamily({
        name: "X",
        activities: "y",
        classification: null,
      })
    ).toBeNull()
  })

  it("never guesses from a name alone", async () => {
    expect(
      await suggestCauseFamily({
        name: "Rescue Kitties",
        activities: null,
        classification: null,
      })
    ).toBeNull()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("returns null, not a throw, when the model call fails", async () => {
    mockCreate.mockRejectedValue(new Error("boom"))
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(
      await suggestCauseFamily({
        name: "Mind",
        activities: "Mental health support.",
        classification: null,
      })
    ).toBeNull()
    spy.mockRestore()
  })
})
