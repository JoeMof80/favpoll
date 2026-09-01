import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import type { CardResultItem } from "@/components/favpoll-list-card/use-favpoll-list-card-pledge"

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

vi.mock("@/components/pledge-dialog", () => ({
  PledgeDialog: ({ onPledgeSuccess }: { onPledgeSuccess: () => void }) => (
    <button onClick={onPledgeSuccess}>Pledge favourites</button>
  ),
}))

vi.mock("@/components/favpoll-card/favpoll-header", () => ({
  FavpollHeader: () => <div />,
}))

vi.mock(
  "@/components/favpoll-list-card/favpoll-list-card-charity-carousel",
  () => ({
    FavpollListCardCharityCarousel: () => <div />,
  })
)

import { FavpollListCard } from "@/components/favpoll-list-card"

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ITEMS = [
  { id: "f1", label: "Purple" },
  { id: "f2", label: "Blue" },
  { id: "f3", label: "Red" },
]

const BASE = {
  id: "fp-1",
  occasion_type: null,
  opening_line: "Celebrating",
  description: null,
  closes_at: "2099-01-01T00:00:00Z",
  closed_at: null,
  total_raised: 0,
  protagonist: { name: "Yusuf" },
  charities: [],
  poll: {
    id: "poll-1",
    topic_id: "t1",
    topic: { title: "Colour", is_finite: true, favourites: ITEMS },
  },
}

const REAL_RESULTS: CardResultItem[] = [
  { label: "Blue", amountPence: 1000, widthPercent: 100 },
  { label: "Purple", amountPence: 500, widthPercent: 50 },
]

// ─── Un-pledged live card ─────────────────────────────────────────────────────

describe("FavpollListCard — un-pledged live card", () => {
  it("renders the decoy wrapper (aria-hidden, blur-xs)", () => {
    const { container } = render(<FavpollListCard favpoll={BASE} />)
    const decoy = container.querySelector('[data-testid="list-card-decoy"]')
    expect(decoy).toBeTruthy()
    expect(decoy).toHaveAttribute("aria-hidden", "true")
    expect(decoy?.className).toContain("blur-xs")
  })

  it("shows lock hint copy", () => {
    render(<FavpollListCard favpoll={BASE} />)
    // Once since flip v3 (2026-09-01): only the mechanic face's lock-card
    // bar says it — the story face signals the journey with step dots and
    // "How to pledge" instead.
    expect(screen.getByText("Pledge your favourite")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /^pledge$/i })
    ).toBeInTheDocument()
  })

  it("all decoy amounts are '—'", () => {
    const { container } = render(<FavpollListCard favpoll={BASE} />)
    const decoy = container.querySelector('[data-testid="list-card-decoy"]')!
    const amounts = decoy.querySelectorAll(".tabular-nums")
    expect(amounts.length).toBeGreaterThan(0)
    amounts.forEach((el) => expect(el.textContent).toBe("—"))
  })

  it("decoy labels are topic items sorted alphabetically", () => {
    const { container } = render(<FavpollListCard favpoll={BASE} />)
    const decoy = container.querySelector('[data-testid="list-card-decoy"]')!
    const labels = Array.from(decoy.querySelectorAll(".truncate")).map(
      (el) => el.textContent
    )
    // ITEMS: Purple, Blue, Red → alphabetical: Blue, Purple, Red (the
    // mechanic face's decoy — the story face carries no strip since v3).
    expect(labels).toEqual(["Blue", "Purple", "Red"])
  })

  it("no real currency string in decoy", () => {
    render(<FavpollListCard favpoll={BASE} />)
    expect(screen.queryByText(/£/)).toBeNull()
  })

  it("pledge pill is present and accessible", () => {
    render(<FavpollListCard favpoll={BASE} />)
    expect(
      screen.getByRole("button", { name: "Pledge favourites" })
    ).toBeInTheDocument()
  })
})

// ─── Pledged card ─────────────────────────────────────────────────────────────

describe("FavpollListCard — pledged card", () => {
  it("renders real results with no decoy", () => {
    render(<FavpollListCard favpoll={BASE} initialResults={REAL_RESULTS} />)
    expect(screen.queryByTestId("list-card-decoy")).toBeNull()
    expect(screen.queryByText("Pledge your favourite")).toBeNull()
    // formatCurrency(1000) → £10
    expect(screen.getByText("£10")).toBeInTheDocument()
  })
})

// ─── Closed card ─────────────────────────────────────────────────────────────

describe("FavpollListCard — closed card", () => {
  it("no decoy when closed_at is set (entitled via isClosed)", () => {
    const closed = { ...BASE, closed_at: "2024-01-01T00:00:00Z" }
    render(<FavpollListCard favpoll={closed} />)
    expect(screen.queryByTestId("list-card-decoy")).toBeNull()
    expect(screen.queryByText("Pledge your favourite")).toBeNull()
  })
})

// ─── Value + urgency row ──────────────────────────────────────────────────────

describe("FavpollListCard — value row", () => {
  it("marks a pledged card with the primary border", () => {
    const { container } = render(
      <FavpollListCard
        favpoll={BASE}
        initialResults={[
          { label: "Blue", amountPence: 2000, widthPercent: 100 },
        ]}
      />
    )
    expect(container.querySelector('[class*="border-primary"]')).not.toBeNull()
  })

  it("plain border without a pledge", () => {
    const { container } = render(<FavpollListCard favpoll={BASE} />)
    expect(container.querySelector('[class*="border-primary"]')).toBeNull()
  })

  // The raised figure stays off the card (2026-07-22 founder call: it
  // duplicated the charity footer on single-charity cards). The countdown
  // half of that pin was superseded 2026-09-01: the flip card's story face
  // carries a ClosingLabel, the summary card's own vitals idiom.
  it("no raised figure; the story face carries the closing label", () => {
    render(<FavpollListCard favpoll={{ ...BASE, total_raised: 90 }} />)
    expect(screen.queryByText("£90 raised")).not.toBeInTheDocument()
    expect(screen.getByText(/\d+ days/)).toBeInTheDocument()
  })
})

// ─── Accessibility ────────────────────────────────────────────────────────────

describe("FavpollListCard — accessibility", () => {
  it("decoy and lock hint are aria-hidden; pledge pill is the labelled trigger", () => {
    const { container } = render(<FavpollListCard favpoll={BASE} />)

    // Decoy and its overlay are both aria-hidden
    const ariaHiddenNodes = container.querySelectorAll('[aria-hidden="true"]')
    const decoy = container.querySelector('[data-testid="list-card-decoy"]')
    expect(decoy).toBeTruthy()
    // Decoy itself is aria-hidden
    expect(decoy).toHaveAttribute("aria-hidden", "true")
    // At least 2 aria-hidden nodes (decoy + lock hint overlay)
    expect(ariaHiddenNodes.length).toBeGreaterThanOrEqual(2)

    // The pledge pill is the only interactive element and has an accessible name
    expect(
      screen.getByRole("button", { name: "Pledge favourites" })
    ).toBeInTheDocument()
  })
})
