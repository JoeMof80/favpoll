import { describe, it, expect } from "vitest"
import { topicInProse } from "../topic-prose"

describe("topicInProse", () => {
  it("lowercases plain words and keeps acronyms and digits", () => {
    expect(topicInProse("Bird of prey")).toBe("bird of prey")
    expect(topicInProse("ASMR sound")).toBe("ASMR sound")
    expect(topicInProse("TV theme tune")).toBe("TV theme tune")
    expect(topicInProse("F1 driver")).toBe("F1 driver")
    expect(topicInProse("Children's book")).toBe("children's book")
    expect(topicInProse("Farm animal")).toBe("farm animal")
  })
})
