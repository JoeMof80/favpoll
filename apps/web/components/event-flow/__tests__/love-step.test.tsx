import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

import { LoveStep } from "@/components/event-flow/love-step"
import type { Category, TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "@/components/event-form-v2/schema"

const makeTopic = (
  id: string,
  title: string,
  items: { id: string; label: string; display_order?: number | null }[],
  is_finite = false
): TopicWithMeta =>
  ({
    id,
    title,
    is_active: true,
    is_finite,
    topic_items: items.map((i) => ({
      id: i.id,
      label: i.label,
      topic_id: id,
      is_canonical: true,
      source: "seed" as const,
      display_order: i.display_order ?? null,
      markets: ["en-GB"],
      all_time_pledged: 0,
      all_time_count: 0,
      event_count: 0,
      total_pledge_count: 0,
      created_at: null,
    })),
    category_ids: [],
    placeholders: {},
  }) as unknown as TopicWithMeta

const TOPICS: TopicWithMeta[] = [
  makeTopic(
    "t-colour",
    "Colour",
    [
      { id: "i-red", label: "Red", display_order: 1 },
      { id: "i-blue", label: "Blue", display_order: 2 },
    ],
    true
  ),
  makeTopic(
    "t-biscuit",
    "Biscuit",
    [
      { id: "i-digestive", label: "Digestive" },
      { id: "i-hob", label: "Hobnob" },
    ],
    false
  ),
]
const CATEGORIES: Category[] = [{ id: "cat1", label: "Food" } as Category]

const EMPTY_VALUE: EventFormValues["topics"] = []

function select(id: string, title: string): EventFormValues["topics"] {
  return [
    {
      topicId: id,
      title,
      isCustom: false,
      items: [],
      customLabels: [],
    },
  ]
}

describe("LoveStep — items panel", () => {
  it("shows no items panel when nothing is selected", () => {
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByTestId("items-panel")).not.toBeInTheDocument()
  })

  it("shows items panel when a canonical topic is selected", () => {
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={select("t-colour", "Colour")}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByTestId("items-panel")).toBeInTheDocument()
    expect(screen.getByText("What people vote on")).toBeInTheDocument()
  })

  it("renders the selected topic's items as chips", () => {
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={select("t-colour", "Colour")}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText("Red")).toBeInTheDocument()
    expect(screen.getByText("Blue")).toBeInTheDocument()
  })

  it("shows finite topic without 'guests can add' hint", () => {
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={select("t-colour", "Colour")}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByText(/guests can add/i)).not.toBeInTheDocument()
  })

  it("shows 'Guests can add their own' hint for infinite topics", () => {
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={select("t-biscuit", "Biscuit")}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText("Guests can add their own")).toBeInTheDocument()
  })

  it("does not show items panel for a custom (new) topic", () => {
    const customValue: EventFormValues["topics"] = [
      {
        topicId: "",
        title: "My Custom Topic",
        isCustom: true,
        items: [],
        customLabels: [],
      },
    ]
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={customValue}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByTestId("items-panel")).not.toBeInTheDocument()
  })

  it("sorts items by display_order then alphabetically", () => {
    const topicWithMixedOrder = makeTopic(
      "t-mixed",
      "Mixed",
      [
        { id: "i-z", label: "Zebra", display_order: null },
        { id: "i-a", label: "Apple", display_order: null },
        { id: "i-first", label: "First", display_order: 1 },
      ],
      true
    )

    render(
      <LoveStep
        topics={[...TOPICS, topicWithMixedOrder]}
        categories={CATEGORIES}
        value={select("t-mixed", "Mixed")}
        onChange={vi.fn()}
      />
    )

    const panel = screen.getByTestId("items-panel")
    const chips = Array.from(
      panel.querySelectorAll('[class*="Chip"], button, [role="button"]')
    )
    const labels = chips.map((el) => el.textContent)
    // "First" (order=1) should come before "Apple" and "Zebra" (both null, alphabetical)
    const firstIdx = labels.findIndex((l) => l?.includes("First"))
    const appleIdx = labels.findIndex((l) => l?.includes("Apple"))
    const zebraIdx = labels.findIndex((l) => l?.includes("Zebra"))
    expect(firstIdx).toBeLessThan(appleIdx)
    expect(appleIdx).toBeLessThan(zebraIdx)
  })
})
