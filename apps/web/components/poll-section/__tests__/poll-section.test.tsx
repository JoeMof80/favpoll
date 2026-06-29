import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
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

// ─── TypedReveal integration ──────────────────────────────────────────────────

const REVEAL_TEXT =
  "Yusuf said: My favourite colour was blue. I wore it to every occasion that mattered."

describe("PollSection — reveal on first in-session unlock (pledgeJustConfirmed=true)", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    })
  })
  afterEach(() => vi.useRealTimers())

  it("renders an aria-hidden typed copy (not the full text yet) when pledgeJustConfirmed", () => {
    const { container } = render(
      <PollSection
        {...BASE_PROPS}
        entitled={true}
        personalReveal={REVEAL_TEXT}
        pledgeJustConfirmed={true}
        protagonistName="Yusuf"
        isCause={false}
        onOpenPledgeDialog={vi.fn()}
      />
    )
    // Animated path: typing copy is aria-hidden
    const typed = container.querySelector('[aria-hidden="true"]')
    expect(typed).not.toBeNull()
    // Has not yet typed the full text
    expect(typed?.textContent).not.toBe(REVEAL_TEXT)
  })

  it("exposes full reveal to AT via sr-only immediately on unlock", () => {
    const { container } = render(
      <PollSection
        {...BASE_PROPS}
        entitled={true}
        personalReveal={REVEAL_TEXT}
        pledgeJustConfirmed={true}
        protagonistName="Yusuf"
        isCause={false}
        onOpenPledgeDialog={vi.fn()}
      />
    )
    const srEl = container.querySelector(".sr-only")
    expect(srEl).toHaveTextContent(REVEAL_TEXT)
    expect(srEl).toHaveAttribute("role", "status")
    expect(srEl).toHaveAttribute("aria-live", "polite")
  })

  it("types the full reveal after the interval completes", () => {
    const { container } = render(
      <PollSection
        {...BASE_PROPS}
        entitled={true}
        personalReveal={REVEAL_TEXT}
        pledgeJustConfirmed={true}
        protagonistName="Yusuf"
        isCause={false}
        onOpenPledgeDialog={vi.fn()}
      />
    )
    act(() => vi.runAllTimers())
    const typed = container.querySelector('[aria-hidden="true"]')
    expect(typed).toHaveTextContent(REVEAL_TEXT)
  })
})

describe("PollSection — reveal for returning pledger (pledgeJustConfirmed=false)", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    })
  })

  it("renders full reveal immediately with no aria-hidden typing copy", () => {
    const { container } = render(
      <PollSection
        {...BASE_PROPS}
        entitled={true}
        personalReveal={REVEAL_TEXT}
        pledgeJustConfirmed={false}
        protagonistName="Yusuf"
        isCause={false}
        onOpenPledgeDialog={vi.fn()}
      />
    )
    // No animated path — PollReveal renders directly
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
    // Full text is in the document
    expect(screen.getByText(REVEAL_TEXT)).toBeInTheDocument()
  })
})

describe("PollSection — gating: real reveal absent when not entitled", () => {
  it("the real personal_reveal string is not present in the pre-pledge DOM", () => {
    render(
      <PollSection
        {...BASE_PROPS}
        entitled={false}
        personalReveal={null}
        protagonistName="Yusuf"
        isCause={false}
        onOpenPledgeDialog={vi.fn()}
      />
    )
    expect(screen.queryByText(REVEAL_TEXT)).toBeNull()
  })
})
