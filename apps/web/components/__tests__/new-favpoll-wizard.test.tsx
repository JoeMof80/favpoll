import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))
vi.mock("@/app/favpolls/new/actions", () => ({
  createFavpoll: vi.fn().mockResolvedValue({ favpollId: "f1" }),
  uploadPersonPhoto: vi.fn(),
}))
vi.mock("@/lib/actions/generate-draft", () => ({
  safeGenerateDraft: vi.fn(),
}))
vi.mock("@/app/favpolls/[id]/edit/actions", () => ({
  updateFavpoll: vi.fn(),
}))
// SeedFundModal's chain reaches lib/email (Resend constructed at module
// scope) — CI has no key, and the modal is irrelevant to these tests.
vi.mock("@/components/favpoll-form/seed-fund-modal", () => ({
  SeedFundModal: () => null,
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
    expect(dots).toHaveLength(6)
    expect(dots[0]).toHaveAttribute("aria-current", "step")
    expect(dots[0]).toHaveAttribute("aria-label", "Step 1 of 6: Event")
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

  // The heading is back (founder, 2026-08-25) — it anchors the panel the
  // organiser is working in. What must not come back is the DOUBLE
  // QUESTION: the rail line orients, the guidance asks. If this ever
  // reverts to a heading-only assertion it proves nothing, because the
  // step name changes.
  // The guidance line under the heading retired with the extended wizard
  // (founder, prototype round 13: "they feel glib") — the heading and the
  // fields say it all.
  it("renders the step heading with no guidance question", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    expect(screen.getByRole("heading", { name: "Event" })).toBeInTheDocument()
    expect(
      screen.queryByText("What kind of favpoll is this?")
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Who or what is this favpoll for/i)
    ).not.toBeInTheDocument()
  })

  it("does not render who options on step 1 (moved to the Generate control)", () => {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    for (const name of ["He", "She", "They", "Pair", "Group"]) {
      expect(screen.queryByRole("radio", { name })).not.toBeInTheDocument()
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Step order: Event → Charity → Topic
// ─────────────────────────────────────────────────────────────────────────────

describe("NewFavpollWizard — step order is Event → Charity → Topic", () => {
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
    // Event
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
// No details handoff — the wizard continues into Info and publishes itself
// ─────────────────────────────────────────────────────────────────────────────

describe("NewFavpollWizard — the wizard continues past Topic", () => {
  function reachInfo() {
    render(<NewFavpollWizard data={MOCK_DATA} />)
    fireEvent.click(screen.getByRole("radio", { name: "Celebration" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    fireEvent.click(screen.getByRole("button", { name: "Pick a charity" }))
    fireEvent.click(screen.getByRole("button", { name: "Charity One" }))
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    fireEvent.click(screen.getByRole("button", { name: "Pick a topic" }))
    fireEvent.click(screen.getByRole("button", { name: "Colour" }))
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
  }

  it("Topic leads to Info — no /favpolls/new/details redirect", () => {
    mockPush.mockClear()
    reachInfo()
    expect(screen.getByRole("heading", { name: "Header" })).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("Header gates on the name; Story and Settings follow; Publish is the last button", () => {
    reachInfo()
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()
    fireEvent.change(
      screen.getByPlaceholderText(/Poppy Chen|Name or nickname/),
      {
        target: { value: "Poppy" },
      }
    )
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByRole("heading", { name: "Story" })).toBeInTheDocument()
    fireEvent.change(
      screen.getByPlaceholderText(/Sixteen on Saturday|tease the topic/),
      { target: { value: "About text." } }
    )
    fireEvent.click(screen.getByRole("button", { name: "Next" }))
    expect(
      screen.getByRole("heading", { name: "Settings" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Publish" })).toBeInTheDocument()
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

  it("the topic step stands on its heading alone", () => {
    reachTopicStep()
    expect(screen.getByRole("heading", { name: "Topic" })).toBeInTheDocument()
  })
})
