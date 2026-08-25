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
    expect(dots[0]).toHaveAttribute("aria-label", "Step 1 of 3: Type")
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

  // The rail (desktop) and the progress strip (mobile) both name all three
  // steps, so a per-step heading printed the current one a second time on the
  // same screen — under a second, differently-worded question. The guidance
  // stays; the heading does not (founder, 2026-08-25).
  it("does not repeat the step name as a heading", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    expect(
      screen.queryByRole("heading", { name: "Type" })
    ).not.toBeInTheDocument()
    // The guidance the chips answer is still there.
    expect(
      screen.getByText("What kind of favpoll is this?")
    ).toBeInTheDocument()
  })

  it("does not render who options on step 1 (moved to the Generate control)", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    for (const name of ["He", "She", "They", "Pair", "Group"]) {
      expect(screen.queryByRole("radio", { name })).not.toBeInTheDocument()
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Step order: Type → Charity → Topic
// ─────────────────────────────────────────────────────────────────────────────

describe("NewFavpollWizard — step order is Type → Charity → Topic", () => {
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

  it("step 3 is Topic (shows 'Pick a topic')", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    // Type
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

    // Step 1: Type
    fireEvent.click(screen.getByRole("radio", { name: "Celebration" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    // Step 2: Charity
    fireEvent.click(screen.getByRole("button", { name: "Pick a charity" }))
    fireEvent.click(screen.getByRole("button", { name: "Charity One" }))
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))

    // Step 3: Topic
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

describe("NewFavpollWizard — Cause has left the wizard", () => {
  // Cause answers WHO (no one), the three chips answer WHAT KIND — they
  // were never alternatives, which is why a marathon runner is a person
  // AND a fundraiser. Cause now lives on the who axis in the form's
  // Generate control (founder, 2026-08-25).
  it("offers no Cause option on step 1", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    expect(
      screen.queryByRole("radio", { name: "Cause" })
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole("radio")).toHaveLength(3)
  })

  // The gate used to pass on `subject === "cause"` with no category. There
  // is no such escape now: the step has exactly one question.
  it("requires a type before Next enables", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()
    fireEvent.click(screen.getByRole("radio", { name: "Fundraiser" }))
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled()
  })

  it("never asks for a cause label", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    expect(
      screen.queryByLabelText("What are you raising for?")
    ).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// One set of copy — the wizard no longer knows the subject
// ─────────────────────────────────────────────────────────────────────────────

describe("NewFavpollWizard — subject-neutral copy", () => {
  function reachTopicStep() {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    fireEvent.click(screen.getByRole("radio", { name: "Celebration" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    fireEvent.click(screen.getByRole("button", { name: "Pick a charity" }))
    fireEvent.click(screen.getByRole("button", { name: "Charity One" }))
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
  }

  // Both halves of the old branch assumed something the wizard can no
  // longer know. "What did they love?" addresses a cause organiser as if
  // there were a person; "suits your cause" addresses a widow as if there
  // were not.
  it("assumes neither a person nor a cause on the topic step", () => {
    reachTopicStep()
    expect(screen.queryByText(/What did they love/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/suits your cause/i)).not.toBeInTheDocument()
  })

  it("still guides the topic step", () => {
    reachTopicStep()
    expect(
      screen.getAllByText(/let guests pledge on their favourite/i)[0]
    ).toBeInTheDocument()
  })
})
