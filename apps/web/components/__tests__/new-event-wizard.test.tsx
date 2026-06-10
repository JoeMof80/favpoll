import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

import { NewEventWizard } from "@/components/new-event-wizard"
import type { Category, Charity, TopicWithMeta } from "@favpoll/types"

const MOCK_DATA = {
  charities: [
    { id: "c1", name: "Charity One", is_active: true } as unknown as Charity,
    { id: "c2", name: "Charity Two", is_active: true } as unknown as Charity,
  ],
  topics: [
    {
      id: "t1",
      title: "Colour",
      is_active: true,
      is_finite: true,
      topic_items: [
        {
          id: "i1",
          label: "Red",
          topic_id: "t1",
          is_canonical: true,
          source: "seed" as const,
          display_order: 1,
          markets: ["en-GB"],
          all_time_pledged: 0,
          all_time_count: 0,
          event_count: 0,
          total_pledge_count: 0,
          created_at: null,
        },
        {
          id: "i2",
          label: "Blue",
          topic_id: "t1",
          is_canonical: true,
          source: "seed" as const,
          display_order: 2,
          markets: ["en-GB"],
          all_time_pledged: 0,
          all_time_count: 0,
          event_count: 0,
          total_pledge_count: 0,
          created_at: null,
        },
      ],
      category_ids: [],
      placeholders: {},
    } as unknown as TopicWithMeta,
  ],
  categories: [{ id: "cat1", label: "Nature" } as Category],
}

describe("NewEventWizard page component", () => {
  it("renders the step 1 title", () => {
    render(<NewEventWizard data={MOCK_DATA} />)
    expect(screen.getByText("Choose the occasion")).toBeInTheDocument()
  })

  it("renders the step indicator showing step 1 of 3", () => {
    render(<NewEventWizard data={MOCK_DATA} />)
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument()
  })

  it("renders step dots with correct aria roles", () => {
    render(<NewEventWizard data={MOCK_DATA} />)
    const dots = screen.getAllByRole("listitem")
    expect(dots).toHaveLength(3)
    expect(dots[0]).toHaveAttribute("aria-current", "step")
    expect(dots[1]).not.toHaveAttribute("aria-current")
  })

  it("Next button is disabled when no category is selected on step 1", () => {
    render(<NewEventWizard data={MOCK_DATA} />)
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()
  })

  it("advances to step 2 after selecting a category", () => {
    render(<NewEventWizard data={MOCK_DATA} />)
    fireEvent.click(screen.getByRole("button", { name: "Celebration" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByText("Choose a favpoll")).toBeInTheDocument()
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument()
  })

  it("redirects to /events/new/details when wizard is completed", () => {
    render(<NewEventWizard data={MOCK_DATA} />)

    // Step 1: pick a category
    fireEvent.click(screen.getByRole("button", { name: "Celebration" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    // Step 2: pick a topic (Colour chip)
    fireEvent.click(screen.getByRole("button", { name: "Colour" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    // Step 3: pick a charity
    fireEvent.click(screen.getByRole("button", { name: "Charity One" }))
    fireEvent.click(screen.getByRole("button", { name: "Set up my event" }))

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/events/new/details")
    )
  })
})
