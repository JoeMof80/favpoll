import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

import { NewFavpollWizard } from "@/components/new-favpoll-wizard"
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
      favourites: [
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
          favpoll_count: 0,
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
          favpoll_count: 0,
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

// ─────────────────────────────────────────────────────────────────────────────
// Basic rendering and structure
// ─────────────────────────────────────────────────────────────────────────────

describe("NewFavpollWizard — structure", () => {
  it("renders step dots with correct aria roles", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    const dots = screen.getAllByRole("listitem")
    expect(dots).toHaveLength(3)
    expect(dots[0]).toHaveAttribute("aria-current", "step")
    expect(dots[0]).toHaveAttribute("aria-label", "Step 1 of 3: Honour")
    expect(dots[1]).not.toHaveAttribute("aria-current")
  })

  it("Next button is disabled when no category is selected on step 1", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Step order: Honour → Charity → Love
// ─────────────────────────────────────────────────────────────────────────────

describe("NewFavpollWizard — step order is Honour → Charity → Love", () => {
  it("step 2 is Charity (shows 'Choose a charity')", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    fireEvent.click(screen.getByRole("radio", { name: "Celebration" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(
      screen.getByRole("button", { name: "Pick a charity" })
    ).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")[1]).toHaveAttribute(
      "aria-current",
      "step"
    )
  })

  it("step 3 is Love (shows 'Choose a topic')", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    // Honour
    fireEvent.click(screen.getByRole("radio", { name: "Celebration" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    // Charity: open sheet, pick, Done
    fireEvent.click(screen.getByRole("button", { name: "Pick a charity" }))
    fireEvent.click(screen.getByRole("button", { name: "Charity One" }))
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(
      screen.getByRole("button", { name: "Pick a topic" })
    ).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")[2]).toHaveAttribute(
      "aria-current",
      "step"
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Full redirect (person favpoll)
// ─────────────────────────────────────────────────────────────────────────────

describe("NewFavpollWizard — redirect", () => {
  it("redirects to /favpolls/new/details when wizard is completed (person)", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)

    // Step 1: Honour
    fireEvent.click(screen.getByRole("radio", { name: "Celebration" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    // Step 2: Charity
    fireEvent.click(screen.getByRole("button", { name: "Pick a charity" }))
    fireEvent.click(screen.getByRole("button", { name: "Charity One" }))
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    // Step 3: Love
    fireEvent.click(screen.getByRole("button", { name: "Pick a topic" }))
    fireEvent.click(screen.getByRole("button", { name: "Colour" }))

    fireEvent.click(screen.getByRole("button", { name: "Set up my favpoll" }))

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/favpolls/new/details")
    )
  })

  it("redirect URL contains subject=someone for a person favpoll", () => {
    mockPush.mockClear()
    render(<NewFavpollWizard data={MOCK_DATA} />)

    fireEvent.click(screen.getByRole("radio", { name: "Celebration" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    fireEvent.click(screen.getByRole("button", { name: "Pick a charity" }))
    fireEvent.click(screen.getByRole("button", { name: "Charity One" }))
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    fireEvent.click(screen.getByRole("button", { name: "Pick a topic" }))
    fireEvent.click(screen.getByRole("button", { name: "Colour" }))
    fireEvent.click(screen.getByRole("button", { name: "Set up my favpoll" }))

    const url: string = mockPush.mock.calls[0][0]
    expect(url).toContain("subject=someone")
    expect(url).toContain("grouping=individual")
    expect(url).not.toContain("causeLabel")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// GUARDRAIL — cause label capture + causeLabel handoff param
// ─────────────────────────────────────────────────────────────────────────────

describe("NewFavpollWizard — cause guardrail", () => {
  it("Next is disabled on step 1 when subject=cause and causeLabel is empty", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    // Select cause and a category
    fireEvent.click(screen.getByRole("radio", { name: "A cause" }))
    fireEvent.click(screen.getByRole("radio", { name: "Fundraiser" }))
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()
  })

  it("Next is enabled on step 1 when subject=cause and causeLabel is non-empty", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    fireEvent.click(screen.getByRole("radio", { name: "A cause" }))
    fireEvent.click(screen.getByRole("radio", { name: "Fundraiser" }))
    fireEvent.change(screen.getByLabelText("What are you raising for?"), {
      target: { value: "40 years of Shelter" },
    })
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled()
  })

  it("redirect URL contains encoded causeLabel for a cause favpoll", () => {
    mockPush.mockClear()
    render(<NewFavpollWizard data={MOCK_DATA} />)

    // Step 1: Honour — cause
    fireEvent.click(screen.getByRole("radio", { name: "A cause" }))
    fireEvent.click(screen.getByRole("radio", { name: "Fundraiser" }))
    fireEvent.change(screen.getByLabelText("What are you raising for?"), {
      target: { value: "Ocean Trust" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    // Step 2: Charity
    fireEvent.click(screen.getByRole("button", { name: "Pick a charity" }))
    fireEvent.click(screen.getByRole("button", { name: "Charity One" }))
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    // Step 3: Love
    fireEvent.click(screen.getByRole("button", { name: "Pick a topic" }))
    fireEvent.click(screen.getByRole("button", { name: "Colour" }))
    fireEvent.click(screen.getByRole("button", { name: "Set up my favpoll" }))

    const url: string = mockPush.mock.calls[0][0]
    expect(url).toContain("causeLabel=Ocean+Trust")
    expect(url).toContain("subject=cause")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Subject-aware Love copy
// ─────────────────────────────────────────────────────────────────────────────

describe("NewFavpollWizard — Love step copy by subject", () => {
  function reachLoveStep(subject: "person" | "cause", causeLabel?: string) {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    if (subject === "cause") {
      fireEvent.click(screen.getByRole("radio", { name: "A cause" }))
      fireEvent.click(screen.getByRole("radio", { name: "Fundraiser" }))
      fireEvent.change(screen.getByLabelText("What are you raising for?"), {
        target: { value: causeLabel ?? "Test Cause" },
      })
    } else {
      fireEvent.click(screen.getByRole("radio", { name: "Celebration" }))
    }
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    fireEvent.click(screen.getByRole("button", { name: "Pick a charity" }))
    fireEvent.click(screen.getByRole("button", { name: "Charity One" }))
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
  }

  it("shows person-specific guidance on the Love step", () => {
    reachLoveStep("person")
    expect(screen.getAllByText(/What did they love/i)[0]).toBeInTheDocument()
  })

  it("shows cause-specific guidance on the Love step", () => {
    reachLoveStep("cause")
    expect(screen.getAllByText(/suits your cause/i)[0]).toBeInTheDocument()
  })

  it("does not show cause copy for a person favpoll on the Love step", () => {
    reachLoveStep("person")
    expect(screen.queryByText(/suits your cause/i)).not.toBeInTheDocument()
  })
})
