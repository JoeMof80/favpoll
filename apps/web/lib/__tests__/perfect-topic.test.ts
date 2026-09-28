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
    topic_subsets: [
      {
        id: "farm",
        title: "Farm animal",
        status: "approved",
        is_active: true,
        topic_subset_items: [
          { favourites: { label: "Cow" } },
          { favourites: { label: "Pig" } },
          { favourites: { label: "Sheep" } },
          { favourites: { label: "Goat" } },
        ],
      },
      { id: "old", title: "Delisted", status: "approved", is_active: false },
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

  it("a subset keeps only labels that are on the topic's list, and never the whole list", async () => {
    answer({
      existing: "Animal",
      existing_reason: "Your animals are the point.",
      subset_items: ["Cow", "Pig", "Sheep", "Goat", "Donkey", "Unicorn"],
    })
    const s = await suggestPerfectTopic(INPUT)
    expect(s?.topicId).toBe("animal")
    expect(s?.items).toEqual(["Cow", "Pig", "Sheep", "Goat", "Donkey"])
  })

  it("names an existing approved subset instead of inventing a list", async () => {
    answer({
      existing: "Animal",
      existing_reason: "Your animals are the point.",
      subset: "farm animal",
      subset_items: ["Cow", "Pig", "Sheep", "Goat"],
    })
    const s = await suggestPerfectTopic(INPUT)
    expect(s?.topicId).toBe("animal")
    expect(s?.subsetId).toBe("farm")
    expect(s?.items).toEqual([])
  })

  it("a delisted or unknown subset name is ignored", async () => {
    answer({
      existing: "Animal",
      existing_reason: "Yours.",
      subset: "Delisted",
    })
    expect((await suggestPerfectTopic(INPUT))?.subsetId).toBeNull()
  })

  it("fewer than three subset items means the whole list", async () => {
    answer({
      existing: "Animal",
      existing_reason: "Yours.",
      subset_items: ["Cow", "Pig"],
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
