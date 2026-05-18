import { describe, it, expect } from "vitest"
import { newPoll } from "@/components/event-canvas/utils"

describe("newPoll", () => {
  it("returns an object with the expected shape", () => {
    const poll = newPoll("topic-1")
    expect(poll).toMatchObject({
      topicId: "topic-1",
      topicIsCustom: false,
      customTopicTitle: "",
      customTopicItems: [],
      framing: "",
      reveal: "",
      prioritizedItemIds: [],
      prioritizedCustomLabels: [],
      curatedCustomLabels: [],
    })
  })

  it("sets pickingTopic to false when a topicId is provided", () => {
    expect(newPoll("topic-1").pickingTopic).toBe(false)
  })

  it("sets pickingTopic to true when no topicId is provided", () => {
    expect(newPoll().pickingTopic).toBe(true)
  })

  it("sets pickingTopic to true when topicId is empty string", () => {
    expect(newPoll("").pickingTopic).toBe(true)
  })

  it("generates a non-empty string key", () => {
    const poll = newPoll("topic-1")
    expect(typeof poll.key).toBe("string")
    expect(poll.key.length).toBeGreaterThan(0)
  })

  it("generates a unique key each call", () => {
    const keys = Array.from({ length: 20 }, () => newPoll().key)
    const unique = new Set(keys)
    expect(unique.size).toBe(20)
  })
})
