import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { OrganizerRow } from "../index"
import type { OrganizerFavpoll } from "../utils"

vi.mock("@/app/favpolls/[id]/actions", () => ({
  setFavpollListed: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/components/branded-qr", () => ({
  BrandedQR: ({
    value,
    "aria-label": label,
  }: {
    value: string
    "aria-label": string
  }) => (
    <img
      src={`qr:${value}`}
      alt={label}
      data-testid="qr-svg"
      data-qr-value={value}
    />
  ),
}))

Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
})

const NOW = new Date("2026-06-21T12:00:00Z")

function makeFavpoll(
  overrides: Partial<OrganizerFavpoll> = {}
): OrganizerFavpoll {
  const farFuture = new Date(Date.now() + 30 * 86400000).toISOString()
  return {
    id: "fp-1",
    live_slug: "slug-fp-1",
    goal_amount: null,
    opening_line: "In memory of",
    closes_at: farFuture,
    closed_at: null,
    occasion_type: "Memorial",
    category: "memorial",
    grouping: "individual",
    subject: "someone",
    cause_label: null,
    total_raised: 15000,
    is_listed: true,
    created_at: new Date(NOW.getTime() - 86400000).toISOString(),
    protagonist: { name: "Belinda Johnson" },
    charities: [
      {
        charity: {
          id: "c1",
          name: "Age UK",
          logo_url: null,
          registered_number: "1128267",
          description: null,
          created_at: "",
        },
      },
    ],
    poll: { id: "p1", topic: { title: "Colour" } },
    pot: { total_deposited: 50, total_allocated: 10 },
    ...overrides,
  }
}

function expand() {
  fireEvent.click(screen.getByTestId("row-toggle"))
}

describe("OrganizerRow", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("collapsed row", () => {
    it("renders identity: opening line, name, topic", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expect(screen.getByText("In memory of")).toBeInTheDocument()
      expect(screen.getByText("Belinda Johnson")).toBeInTheDocument()
      expect(screen.getByText(/Colour/)).toBeInTheDocument()
    })

    it("renders countdown text", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expect(screen.getByTestId("countdown-active")).toBeInTheDocument()
      expect(screen.getByTestId("countdown-active")).toHaveTextContent("days")
    })

    it("starts collapsed: no QR, no listed switch", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expect(screen.queryByTestId("qr-svg")).not.toBeInTheDocument()
      expect(screen.queryByRole("switch")).not.toBeInTheDocument()
      expect(screen.getByTestId("row-toggle")).toHaveAttribute(
        "aria-expanded",
        "false"
      )
    })

    it("shows the Unlisted chip only when unlisted", () => {
      const { unmount } = render(
        <OrganizerRow favpoll={makeFavpoll({ is_listed: false })} />
      )
      expect(screen.getByText("Unlisted")).toBeInTheDocument()
      unmount()
      render(<OrganizerRow favpoll={makeFavpoll({ is_listed: true })} />)
      expect(screen.queryByText("Unlisted")).not.toBeInTheDocument()
    })

    it("copies the guest URL from the collapsed row", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      fireEvent.click(screen.getByTestId("copy-guest-button"))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("/favpolls/fp-1")
      )
    })

    it("is not dimmed when active", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expect(screen.getByTestId("organizer-row")).not.toHaveClass("opacity-70")
    })
  })

  describe("expansion", () => {
    it("expands on toggle: QR, listed switch, charity appear", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      expect(screen.getByTestId("row-toggle")).toHaveAttribute(
        "aria-expanded",
        "true"
      )
      expect(screen.getByTestId("qr-svg")).toBeInTheDocument()
      expect(screen.getByRole("switch")).toBeInTheDocument()
      expect(screen.getByText("Age UK")).toBeInTheDocument()
    })

    it("collapses again on a second toggle", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      expand()
      expect(screen.queryByTestId("qr-svg")).not.toBeInTheDocument()
    })

    it("QR encodes the guest-facing favpoll URL", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      const qr = screen.getByTestId("qr-svg")
      expect(qr.getAttribute("data-qr-value")).toContain("/favpolls/fp-1")
    })

    it("copies the live display URL", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      fireEvent.click(screen.getByTestId("copy-display-button"))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("/live/slug-fp-1")
      )
    })

    it("links to print pack, edit and view", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      expect(screen.getByRole("link", { name: /Print pack/i })).toHaveAttribute(
        "href",
        "/favpolls/fp-1/pack"
      )
      expect(screen.getByRole("link", { name: /Edit/i })).toHaveAttribute(
        "href",
        "/favpolls/fp-1/edit"
      )
      expect(screen.getByRole("link", { name: /View/i })).toHaveAttribute(
        "href",
        "/favpolls/fp-1"
      )
    })

    it("shows the shared fund line when the pot has deposits", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      expect(screen.getByText(/Shared fund:/)).toBeInTheDocument()
    })

    it("hides the shared fund line when the pot is empty", () => {
      render(
        <OrganizerRow
          favpoll={makeFavpoll({
            pot: { total_deposited: 0, total_allocated: 0 },
          })}
        />
      )
      expand()
      expect(screen.queryByText(/Shared fund:/)).not.toBeInTheDocument()
    })
  })

  describe("closed favpoll", () => {
    const closed = makeFavpoll({
      closed_at: "2026-06-01T00:00:00Z",
      closes_at: new Date(Date.now() - 86400000).toISOString(),
    })

    it("renders Closed in the countdown element", () => {
      render(<OrganizerRow favpoll={closed} />)
      expect(screen.getByTestId("countdown-closed")).toHaveTextContent("Closed")
      expect(screen.queryByTestId("countdown-active")).not.toBeInTheDocument()
    })

    it("applies opacity-70 to the row", () => {
      render(<OrganizerRow favpoll={closed} />)
      expect(screen.getByTestId("organizer-row")).toHaveClass("opacity-70")
    })
  })

  describe("warning-threshold countdown", () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(NOW)
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it("applies amber colour when days remaining equals threshold (7)", () => {
      const fp = makeFavpoll({
        closes_at: new Date(NOW.getTime() + 7 * 86400000).toISOString(),
      })
      render(<OrganizerRow favpoll={fp} />)
      expect(screen.getByTestId("countdown-active")).toHaveClass(
        "text-amber-600"
      )
    })

    it("does not apply amber colour at threshold + 1 day (8 days)", () => {
      const fp = makeFavpoll({
        closes_at: new Date(NOW.getTime() + 8 * 86400000).toISOString(),
      })
      render(<OrganizerRow favpoll={fp} />)
      expect(screen.getByTestId("countdown-active")).not.toHaveClass(
        "text-amber-600"
      )
    })
  })

  describe("Listed/Unlisted switch", () => {
    it("toggles listed state and calls setFavpollListed when switched", async () => {
      const { setFavpollListed } = await import("@/app/favpolls/[id]/actions")
      render(<OrganizerRow favpoll={makeFavpoll({ is_listed: true })} />)
      expand()
      fireEvent.click(screen.getByRole("switch"))
      await waitFor(() => {
        expect(setFavpollListed).toHaveBeenCalledWith("fp-1", false)
      })
    })

    it("reverts optimistic state if setFavpollListed throws", async () => {
      const { setFavpollListed } = await import("@/app/favpolls/[id]/actions")
      vi.mocked(setFavpollListed).mockRejectedValueOnce(
        new Error("network error")
      )
      render(<OrganizerRow favpoll={makeFavpoll({ is_listed: true })} />)
      expand()
      fireEvent.click(screen.getByRole("switch"))
      await waitFor(() => {
        expect(screen.getByText("Listed")).toBeInTheDocument()
      })
    })
  })

  describe("edge cases", () => {
    it("renders without charity block when charities is empty", () => {
      render(<OrganizerRow favpoll={makeFavpoll({ charities: [] })} />)
      expand()
      expect(screen.getByTestId("organizer-row")).toBeInTheDocument()
      expect(screen.queryByText("Age UK")).not.toBeInTheDocument()
    })

    it("renders without topic when poll is null", () => {
      render(<OrganizerRow favpoll={makeFavpoll({ poll: null })} />)
      expect(screen.getByTestId("organizer-row")).toBeInTheDocument()
      expect(screen.queryByText(/Colour/)).not.toBeInTheDocument()
    })

    it("uses cause_label as the name for cause favpolls", () => {
      render(
        <OrganizerRow
          favpoll={makeFavpoll({
            subject: "cause",
            protagonist: null,
            cause_label: "The Village Green",
          })}
        />
      )
      expect(screen.getByText("The Village Green")).toBeInTheDocument()
    })
  })

  describe("pledge goal", () => {
    it("shows the goal progress when a goal is set", () => {
      render(
        <OrganizerRow
          favpoll={makeFavpoll({ total_raised: 250, goal_amount: 1000 })}
        />
      )
      expand()
      expect(
        screen.getByRole("progressbar", {
          name: /Progress towards the pledge goal/i,
        })
      ).toBeInTheDocument()
      expect(screen.getByText(/raised of the .*1,000 goal/)).toBeInTheDocument()
    })

    it("shows no goal row when goal_amount is null", () => {
      render(<OrganizerRow favpoll={makeFavpoll({ goal_amount: null })} />)
      expand()
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    })
  })
})
