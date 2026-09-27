import { describe, it, expect, vi, beforeEach } from "vitest"

const mockCreate = vi.fn()
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: mockCreate }
  },
}))

import { suggestPerfectTopic, catalogueForSuggestion } from "../perfect-topic"

const TOPICS = catalogueForSuggestion([
  {
    id: "animal",
    title: "Animal",
    is_finite: false,
    favourites: [
      { label: "Lion", is_canonical: true },
      { label: "Cow", is_canonical: true },
      { label: "Pig", is_canonical: true },
      { label: "Sheep", is_canonical: true },
      { label: "Goat", is_canonical: true },
      { label: "Donkey", is_canonical: false },
    ],
  },
  { id: "river", title: "River", is_finite: false, favourites: [] },
])

function answer(json: object) {
  mockCreate.mockResolvedValueOnce({
    content: [{ type: "text", text: JSON.stringify(json) }],
  })
}

const INPUT = {
  name: "Hackney City Farm",
  activities: "A working farm in the city.",
  objects: null,
  causeFamily: "animals" as const,
  grantMaking: false,
  topics: TOPICS,
}

describe("suggestPerfectTopic", () => {
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "test"
    mockCreate.mockReset()
  })

  it("a lens keeps only labels that are on the topic's list, and never the whole list", async () => {
    answer({
      existing: "Animal",
      existing_reason: "Your animals are the point.",
      lens_items: ["Cow", "Pig", "Sheep", "Goat", "Donkey", "Unicorn"],
    })
    const s = await suggestPerfectTopic(INPUT)
    expect(s?.topicId).toBe("animal")
    expect(s?.items).toEqual(["Cow", "Pig", "Sheep", "Goat", "Donkey"])
  })

  it("fewer than three lens items means the whole list", async () => {
    answer({
      existing: "Animal",
      existing_reason: "Yours.",
      lens_items: ["Cow", "Pig"],
    })
    expect((await suggestPerfectTopic(INPUT))?.items).toEqual([])
  })

  it("a proposed new topic is a suggestion of none, with the proposal in the reason", async () => {
    answer({
      existing: null,
      new_topic: "Canal",
      new_items: ["Grand Union", "Kennet and Avon"],
      new_reason: "no waterway topic exists",
    })
    const s = await suggestPerfectTopic(INPUT)
    expect(s?.topicId).toBeNull()
    expect(s?.reason).toContain('Proposed new topic "Canal"')
  })

  it("strips em dashes from the reason", async () => {
    answer({
      existing: "River",
      existing_reason: "Rivers — and streams — are yours.",
    })
    expect((await suggestPerfectTopic(INPUT))?.reason).toBe(
      "Rivers, and streams, are yours."
    )
  })
})
