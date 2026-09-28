import { describe, it, expect } from "vitest"
import { pollTitle } from "../poll-title"

describe("pollTitle (favpoll-topic-rules §1, ruling 4)", () => {
  it("prefers the subset's name over the parent's", () => {
    expect(
      pollTitle({
        topics: { title: "Animal" },
        topic_subsets: { title: "Farm animal" },
      })
    ).toBe("Farm animal")
  })

  it("falls back to the parent when there is no subset", () => {
    expect(pollTitle({ topics: { title: "Animal" } })).toBe("Animal")
    expect(
      pollTitle({ topics: { title: "Animal" }, topic_subsets: null })
    ).toBe("Animal")
  })

  it("accepts PostgREST's array shape for either join", () => {
    expect(
      pollTitle({
        topics: [{ title: "Animal" }],
        topic_subsets: [{ title: "Farm animal" }],
      })
    ).toBe("Farm animal")
    expect(pollTitle({ topics: [], topic_subsets: [] })).toBeNull()
    expect(pollTitle({})).toBeNull()
  })
})
