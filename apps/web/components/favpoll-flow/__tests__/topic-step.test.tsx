import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, within } from "@testing-library/react"

import { TopicStep } from "@/components/favpoll-flow/topic-step"
import type { Category, TopicWithMeta } from "@favpoll/types"
import type { FavpollFormValues } from "@/components/favpoll-form/schema"

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
    favourites: items.map((i) => ({
      id: i.id,
      label: i.label,
      topic_id: id,
      is_canonical: true,
      source: "seed" as const,
      display_order: i.display_order ?? null,
      markets: ["en-GB"],
      all_time_pledged: 0,
      all_time_count: 0,
      favpoll_count: 0,
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

const EMPTY_VALUE: FavpollFormValues["topics"] = []

function select(id: string, title: string): FavpollFormValues["topics"] {
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

function customTopic(
  title: string,
  customLabels: string[] = []
): FavpollFormValues["topics"] {
  return [
    {
      topicId: "",
      title,
      isCustom: true,
      items: [],
      customLabels,
    },
  ]
}

describe("TopicStep — the hint is retired (option E, 2026-09-16)", () => {
  // Adding a topic is the CARD's act now ("+ Add your own topic" opens a
  // dedicated overlay); the picker is pure select, so the old "type it
  // and click Add" instruction must NOT render.
  it("shows no add-your-own hint", () => {
    render(
      <TopicStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={vi.fn()}
        search=""
        onSearchChange={vi.fn()}
      />
    )
    expect(screen.queryByText(/is your topic missing\?/i)).toBeNull()
  })
})
describe("TopicStep — suggested topics", () => {
  const SUGGESTED = [makeTopic("t-colour", "Colour", [], true)]

  it("shows suggested section heading when suggestedTopics is non-empty", () => {
    render(
      <TopicStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={vi.fn()}
        suggestedTopics={SUGGESTED}
        primaryCharityName="Dogs Trust"
      />
    )
    expect(screen.getByText("Suggested for Dogs Trust")).toBeInTheDocument()
  })

  it("does not show suggested section when suggestedTopics is empty", () => {
    render(
      <TopicStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={vi.fn()}
        suggestedTopics={[]}
        primaryCharityName="Dogs Trust"
      />
    )
    expect(screen.queryByText(/Suggested for/)).not.toBeInTheDocument()
  })

  it("does not show suggested section when suggestedTopics is undefined", () => {
    render(
      <TopicStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByText(/Suggested for/)).not.toBeInTheDocument()
  })

  it("keeps suggested section visible when search is active (pinned)", () => {
    // The wizard owns the search box (the component's own field was dead
    // code, removed 2026-09-17) — an active search arrives as a prop.
    render(
      <TopicStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={vi.fn()}
        suggestedTopics={SUGGESTED}
        primaryCharityName="Dogs Trust"
        search="col"
        onSearchChange={vi.fn()}
      />
    )
    expect(screen.getByText("Suggested for Dogs Trust")).toBeInTheDocument()
  })

  it("selecting a suggested topic calls onChange with the topic", () => {
    const onChange = vi.fn()
    render(
      <TopicStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={onChange}
        suggestedTopics={SUGGESTED}
        primaryCharityName="Dogs Trust"
      />
    )
    const heading = screen.getByText("Suggested for Dogs Trust")
    const section = heading.closest("div")!
    const chip = within(section).getByText("Colour")
    fireEvent.click(chip)
    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ topicId: "t-colour" })])
    )
  })
})

describe("TopicStep — finite / infinite filters", () => {
  it("Finite filter shows only finite topics", () => {
    render(
      <TopicStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Finite" }))
    expect(screen.getByText("Colour")).toBeInTheDocument()
    expect(screen.queryByText("Biscuit")).not.toBeInTheDocument()
  })

  it("Infinite filter shows only infinite topics", () => {
    render(
      <TopicStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Infinite" }))
    expect(screen.getByText("Biscuit")).toBeInTheDocument()
    expect(screen.queryByText("Colour")).not.toBeInTheDocument()
  })

  it("All filter resets type filter", () => {
    render(
      <TopicStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Finite" }))
    fireEvent.click(screen.getByRole("button", { name: "All" }))
    expect(screen.getByText("Colour")).toBeInTheDocument()
    expect(screen.getByText("Biscuit")).toBeInTheDocument()
  })
})
