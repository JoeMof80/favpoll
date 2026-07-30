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

  it("Next button is disabled when no category or who is selected on step 1", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()
  })

  it("Next button is enabled once a category is selected — who moved to the Generate control", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    fireEvent.click(screen.getByRole("radio", { name: "Celebration" }))
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled()
  })

  it("does not render who options on step 1 (moved to the Generate control)", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    for (const name of ["He", "She", "They", "Pair", "Group"]) {
      expect(screen.queryByRole("radio", { name })).not.toBeInTheDocument()
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Step order: Honour → Charity → Love
// ─────────────────────────────────────────────────────────────────────────────

describe("NewFavpollWizard — step order is Honour → Charity → Love", () => {
  it("step 2 is Charity (shows 'Pick a charity')", () => {
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

  it("step 3 is Love (shows 'Pick a topic')", () => {
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

  it("redirect URL contains subject=someone and no pronoun for a person favpoll", () => {
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
    expect(url).not.toContain("pronoun")
    expect(url).not.toContain("causeLabel")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// GUARDRAIL — cause: category auto-set to fundraiser, no causeLabel capture
// ─────────────────────────────────────────────────────────────────────────────

describe("NewFavpollWizard — cause guardrail", () => {
  it("Next is enabled as soon as A cause is selected — a cause needs no type", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    fireEvent.click(screen.getByRole("radio", { name: "Cause" }))
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled()
  })

  it("shows no type selection for a cause — the plumbing category is not a chip choice", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    fireEvent.click(screen.getByRole("radio", { name: "Cause" }))
    const fundraiser = screen.getByRole("radio", { name: "Fundraiser" })
    expect(fundraiser).toBeEnabled()
    expect(fundraiser).toHaveAttribute("aria-checked", "false")
  })

  it("clicking a type chip while A cause is selected hops paths and re-gates Next", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    fireEvent.click(screen.getByRole("radio", { name: "Cause" }))
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled()
    fireEvent.click(screen.getByRole("radio", { name: "Memorial" }))
    // Cause deselects, the type is kept — and a type alone now satisfies
    // the step (who moved to the Generate control).
    expect(screen.getByRole("radio", { name: "Cause" })).toHaveAttribute(
      "aria-checked",
      "false"
    )
    expect(screen.getByRole("radio", { name: "Memorial" })).toHaveAttribute(
      "aria-checked",
      "true"
    )
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled()
  })

  it("wizard does not show a cause label input on step 1", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    fireEvent.click(screen.getByRole("radio", { name: "Cause" }))
    expect(
      screen.queryByLabelText("What are you raising for?")
    ).not.toBeInTheDocument()
  })

  it("redirect URL contains subject=cause and no pronoun for a cause favpoll", () => {
    mockPush.mockClear()
    render(<NewFavpollWizard data={MOCK_DATA} />)

    // Step 1: Honour — cause (category auto-set to fundraiser)
    fireEvent.click(screen.getByRole("radio", { name: "Cause" }))
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
    expect(url).toContain("subject=cause")
    expect(url).not.toContain("category=")
    expect(url).not.toContain("pronoun=")
    expect(url).not.toContain("causeLabel")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Subject-aware Love copy
// ─────────────────────────────────────────────────────────────────────────────

describe("NewFavpollWizard — Love step copy by subject", () => {
  function reachLoveStep(subject: "person" | "cause") {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    if (subject === "cause") {
      fireEvent.click(screen.getByRole("radio", { name: "Cause" }))
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
