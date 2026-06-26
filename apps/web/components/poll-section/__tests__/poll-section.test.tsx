import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { FavpollPollWithItems, Favourite } from "@favpoll/types"

// Stub Supabase-dependent components
vi.mock("@/components/ranking-list", () => ({
  RankingList: () => <ol aria-label="Rankings" />,
}))
vi.mock("@/components/poll-section/use-poll-section", () => ({
  usePollSection: () => ({
    rankingView: "amount",
    setRankingView: vi.fn(),
    view: "results",
  }),
}))

import { PollSection } from "@/components/poll-section"

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ITEMS: Favourite[] = [
  {
    id: "f1",
    topic_id: "t1",
    label: "Purple",
    all_time_pledged: 0,
    all_time_count: 0,
    is_canonical: true,
    source: "seed",
    markets: ["en-GB"],
    favpoll_count: 1,
    total_pledge_count: 0,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "f2",
    topic_id: "t1",
    label: "Blue",
    all_time_pledged: 0,
    all_time_count: 0,
    is_canonical: true,
    source: "seed",
    markets: ["en-GB"],
    favpoll_count: 1,
    total_pledge_count: 0,
    created_at: "2024-01-01T00:00:00Z",
  },
]

const BASE_POLL: FavpollPollWithItems = {
  id: "poll-1",
  favpoll_id: "fp-1",
  topic_id: "t1",
  personal_reveal: null,
  created_at: "2024-01-01T00:00:00Z",
  topics: {
    id: "t1",
    title: "Colour",
    description: null,
    is_finite: true,
    is_active: true,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    favourites: ITEMS,
  },
}

const BASE_PROPS = {
  poll: BASE_POLL,
  clerkUserId: null,
  isClosed: false,
  hasPledged: false,
  protagonistName: "Yusuf",
  isCause: false,
  isOrganiser: false,
  favpollId: "fp-1",
  entitled: false,
  personalReveal: null,
  initialItems: ITEMS,
}

// ─── Overlay copy ─────────────────────────────────────────────────────────────

describe("PollSection — unlock overlay copy", () => {
  it("shows the protagonist first name in the accessible label for a person favpoll", () => {
    render(
      <PollSection
        {...BASE_PROPS}
        protagonistName="Yusuf"
        isCause={false}
        onOpenPledgeDialog={vi.fn()}
      />
    )

    // Accessible name comes from aria-label (name-based); visible text inside the card is generic
    expect(
      screen.getByRole("button", {
        name: /Pledge to reveal Yusuf's favourite/i,
      })
    ).toBeInTheDocument()
  })

  it("shows the no-name fallback for a cause favpoll", () => {
    render(
      <PollSection
        {...BASE_PROPS}
        protagonistName="Protecting our seas"
        isCause={true}
        onOpenPledgeDialog={vi.fn()}
      />
    )

    // Accessible name is the generic fallback; cause label must not appear
    expect(
      screen.getByRole("button", { name: /Pledge to see the reveal/i })
    ).toBeInTheDocument()
    expect(screen.queryByText(/Protecting/)).not.toBeInTheDocument()
  })

  it("does not render the overlay when no onOpenPledgeDialog is provided", () => {
    render(
      <PollSection {...BASE_PROPS} protagonistName="Yusuf" isCause={false} />
    )

    expect(
      screen.queryByRole("button", { name: /Pledge to/i })
    ).not.toBeInTheDocument()
  })
})

// ─── Overlay interaction ──────────────────────────────────────────────────────

describe("PollSection — unlock overlay interaction", () => {
  it("calls onOpenPledgeDialog when the blurred region is clicked", async () => {
    const onOpen = vi.fn()
    render(
      <PollSection
        {...BASE_PROPS}
        protagonistName="Yusuf"
        isCause={false}
        onOpenPledgeDialog={onOpen}
      />
    )

    await userEvent.click(
      screen.getByRole("button", {
        name: /Pledge to reveal Yusuf's favourite/i,
      })
    )

    expect(onOpen).toHaveBeenCalledOnce()
  })

  it("is keyboard-focusable and has an accessible name", () => {
    render(
      <PollSection
        {...BASE_PROPS}
        protagonistName="Belinda"
        isCause={false}
        onOpenPledgeDialog={vi.fn()}
      />
    )

    const btn = screen.getByRole("button", {
      name: /Pledge to reveal Belinda's favourite/i,
    })
    expect(btn).toBeInTheDocument()
    // Button elements are natively keyboard-operable; no tabIndex=-1 should be set
    expect(btn).not.toHaveAttribute("tabindex", "-1")
  })

  it("hides the overlay once entitled (no blur, no overlay button)", () => {
    render(
      <PollSection
        {...BASE_PROPS}
        protagonistName="Yusuf"
        isCause={false}
        entitled={true}
        personalReveal="His was purple."
        onOpenPledgeDialog={vi.fn()}
      />
    )

    expect(
      screen.queryByRole("button", { name: /Pledge to reveal/i })
    ).not.toBeInTheDocument()
  })
})

// ─── Decoy accessibility ──────────────────────────────────────────────────────

describe("PollSection — decoy region accessibility", () => {
  it("decoy containers are aria-hidden so screen readers skip them", () => {
    const { container } = render(
      <PollSection
        {...BASE_PROPS}
        protagonistName="Yusuf"
        isCause={false}
        onOpenPledgeDialog={vi.fn()}
      />
    )

    // Both the blurred reveal and blurred bars are aria-hidden + pointer-events-none
    const decoys = container.querySelectorAll(
      '[aria-hidden="true"].pointer-events-none'
    )
    expect(decoys.length).toBeGreaterThan(0)
  })
})
