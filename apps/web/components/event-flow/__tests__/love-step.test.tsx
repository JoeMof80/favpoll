import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, within } from "@testing-library/react"

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

function customTopic(
  title: string,
  customLabels: string[] = []
): EventFormValues["topics"] {
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
    const firstIdx = labels.findIndex((l) => l?.includes("First"))
    const appleIdx = labels.findIndex((l) => l?.includes("Apple"))
    const zebraIdx = labels.findIndex((l) => l?.includes("Zebra"))
    expect(firstIdx).toBeLessThan(appleIdx)
    expect(appleIdx).toBeLessThan(zebraIdx)
  })
})

describe("LoveStep — suggested topics", () => {
  const SUGGESTED = [makeTopic("t-colour", "Colour", [], true)]

  it("shows suggested section heading when suggestedTopics is non-empty", () => {
    render(
      <LoveStep
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
      <LoveStep
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
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByText(/Suggested for/)).not.toBeInTheDocument()
  })

  it("hides suggested section when search is active", () => {
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={vi.fn()}
        suggestedTopics={SUGGESTED}
        primaryCharityName="Dogs Trust"
      />
    )
    const input = screen.getByPlaceholderText("Search topics…")
    fireEvent.change(input, { target: { value: "col" } })
    expect(
      screen.queryByText("Suggested for Dogs Trust")
    ).not.toBeInTheDocument()
  })

  it("selecting a suggested topic calls onChange with the topic", () => {
    const onChange = vi.fn()
    render(
      <LoveStep
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

describe("LoveStep — create topic option", () => {
  it("shows create chip when search matches nothing", () => {
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={vi.fn()}
      />
    )
    fireEvent.change(screen.getByPlaceholderText("Search topics…"), {
      target: { value: "Xyz" },
    })
    expect(screen.getByTestId("create-topic-chip")).toBeInTheDocument()
  })

  it("shows create chip alongside matching chips when search partially matches an existing topic", () => {
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={vi.fn()}
      />
    )
    fireEvent.change(screen.getByPlaceholderText("Search topics…"), {
      target: { value: "Col" },
    })
    expect(screen.getByText("Colour")).toBeInTheDocument()
    expect(screen.getByTestId("create-topic-chip")).toBeInTheDocument()
  })

  it("hides create chip when search is an exact match (case-insensitive)", () => {
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={vi.fn()}
      />
    )
    fireEvent.change(screen.getByPlaceholderText("Search topics…"), {
      target: { value: "colour" },
    })
    expect(screen.getByText("Colour")).toBeInTheDocument()
    expect(screen.queryByTestId("create-topic-chip")).not.toBeInTheDocument()
  })

  it("calls onChange with a new custom topic when create chip is clicked", () => {
    const onChange = vi.fn()
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={EMPTY_VALUE}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByPlaceholderText("Search topics…"), {
      target: { value: "Memories" },
    })
    fireEvent.click(screen.getByTestId("create-topic-chip"))
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ title: "Memories", isCustom: true }),
    ])
  })
})

describe("LoveStep — custom topic editable items panel", () => {
  it("shows items panel for a custom (new) topic", () => {
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={customTopic("My Topic")}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByTestId("items-panel")).toBeInTheDocument()
    expect(
      screen.getByText("What people can pledge against")
    ).toBeInTheDocument()
  })

  it("shows validation message when fewer than 2 items", () => {
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={customTopic("My Topic", ["One item"])}
        onChange={vi.fn()}
      />
    )
    expect(
      screen.getByText("Add at least two options people can pledge against")
    ).toBeInTheDocument()
  })

  it("hides validation message when 2 or more items exist", () => {
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={customTopic("My Topic", ["Item A", "Item B"])}
        onChange={vi.fn()}
      />
    )
    expect(
      screen.queryByText("Add at least two options people can pledge against")
    ).not.toBeInTheDocument()
  })

  it("calls onChange with new label when item is added", () => {
    const onChange = vi.fn()
    const initial = customTopic("My Topic", [])
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={initial}
        onChange={onChange}
      />
    )

    // Open the ItemAddField overlay
    const trigger = screen.getByRole("button", { name: /add my topic items/i })
    fireEvent.click(trigger)

    // Type in the overlay input and press Enter
    const input = screen.getByPlaceholderText(/add my topic items/i)
    fireEvent.change(input, { target: { value: "Football" } })
    fireEvent.keyDown(input, { key: "Enter" })

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ customLabels: ["Football"] }),
    ])
  })

  it("calls onChange with label removed when item is removed", () => {
    const onChange = vi.fn()
    const initial = customTopic("My Topic", ["Football", "Tennis"])
    render(
      <LoveStep
        topics={TOPICS}
        categories={CATEGORIES}
        value={initial}
        onChange={onChange}
      />
    )

    // Open the ItemAddField overlay
    const trigger = screen.getByRole("button", { name: /add my topic items/i })
    fireEvent.click(trigger)

    // Click the remove button for "Football"
    const removeBtn = screen.getByRole("button", { name: /remove football/i })
    fireEvent.click(removeBtn)

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ customLabels: ["Tennis"] }),
    ])
  })
})
