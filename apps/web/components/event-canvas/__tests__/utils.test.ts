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
      reveal: "",
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

})
