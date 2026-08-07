import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

// The QR renders through a DOM-drawing library behind a dynamic import, and
// none of these assertions are about the code itself.
vi.mock("@/components/branded-qr", () => ({
  BrandedQR: () => <div data-testid="branded-qr" />,
}))

import { DisplayScreen } from "../index"
import type { Favourite } from "@favpoll/types"

function favourite(label: string, pledged: number, i: number): Favourite {
  return {
    id: `item-${i}`,
    topic_id: "topic-1",
    label,
    all_time_pledged: pledged,
    all_time_count: 1,
    is_canonical: true,
    source: "seed",
    markets: ["en-GB"],
    favpoll_count: 1,
    total_pledge_count: 1,
    created_at: "2024-01-01T00:00:00Z",
  }
}

const POLL = {
  id: "poll-1",
  personal_reveal: null,
  topic: { id: "topic-1", title: "Hot drink" },
  items: [favourite("Tea", 240, 0), favourite("Coffee", 205, 1)],
}

const BASE = {
  protagonistName: "Walking for St Luke's",
  dateLabel: null,
  openingLine: null,
  occasionType: "Cause",
  charityName: "St Luke's (Cheshire) Hospice",
  poll: POLL,
  initialTotalRaised: 445,
  favpollUrl: "https://favpoll.com/favpolls/abc",
  qrUrl: "https://favpoll.com/p/abc123",
}

describe("DisplayScreen — the fundraiser banner's money column", () => {
  // Both goalAmount and closesAt are OPTIONAL, and the column used to render
  // only when one of them was set. A favpoll with neither projected an empty
  // half-banner with the QR alone beside it, and the total survived only as a
  // charity row — on the one variant whose whole purpose is to make the money
  // the heading.
  it("shows the total when there is neither a goal nor a close date", () => {
    render(<DisplayScreen {...BASE} />)

    // Scoped to the heading block: the same figure also appears in the
    // charity row, which is exactly what the column was leaving it to.
    const heading = screen.getByText("Raised so far").parentElement!
    expect(heading).toHaveTextContent("£445")
  })

  it("still prefers the goal when there is one", () => {
    render(<DisplayScreen {...BASE} goalAmount={1000} />)

    expect(screen.getByText("Pledge goal")).toBeInTheDocument()
    expect(screen.getByText("of £1,000")).toBeInTheDocument()
    expect(screen.queryByText("Raised so far")).not.toBeInTheDocument()
  })
})

describe("DisplayScreen — live={false}", () => {
  // The QR moves into the gutters from 1600px, positioned `fixed`. Inside a
  // scaled frame `fixed` resolves against the transformed ancestor, so those
  // codes land across the content — and the in-banner code hides itself at
  // the same breakpoint, so the still lost its only working QR exactly when
  // it gained two broken ones.
  it("keeps exactly one QR and drops the presenter chrome", () => {
    const { rerender } = render(<DisplayScreen {...BASE} live={false} />)
    expect(screen.getAllByTestId("branded-qr")).toHaveLength(1)

    rerender(<DisplayScreen {...BASE} live />)
    expect(screen.getAllByTestId("branded-qr").length).toBeGreaterThan(1)
  })

  // The projector type ramp is vw-relative, so it must not reach a still —
  // that renders at a fixed 900px inside the visitor's viewport, where
  // vw-scaled type would burst the layout. Shared components read these with
  // today's sizes as the fallback, so absence means "unchanged".
  it("applies the room type ramp only when live", () => {
    const { container, rerender } = render(<DisplayScreen {...BASE} live />)
    const liveRoot = container.firstElementChild as HTMLElement
    expect(liveRoot.style.getPropertyValue("--display-rank")).toContain("vw")
    expect(liveRoot.style.getPropertyValue("--display-figure")).toContain("vw")

    rerender(<DisplayScreen {...BASE} live={false} />)
    const stillRoot = container.firstElementChild as HTMLElement
    expect(stillRoot.style.getPropertyValue("--display-rank")).toBe("")
    expect(stillRoot.style.getPropertyValue("--display-figure")).toBe("")
  })
})
