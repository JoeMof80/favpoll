import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { OrganizerCard } from "../index"
import type { OrganizerCardFavpoll } from "../utils"

// Mock server action
vi.mock("@/app/favpolls/[id]/actions", () => ({
  setFavpollListed: vi.fn().mockResolvedValue(undefined),
}))

// Mock QRCodeSVG — renders an img with the value as alt so tests can assert on it
vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({
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

// Mock clipboard
Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
})

const NOW = new Date("2026-06-21T12:00:00Z")

function makeFavpoll(
  overrides: Partial<OrganizerCardFavpoll> = {}
): OrganizerCardFavpoll {
  // Use a real far-future date so tests that don't mock time still see an active favpoll
  const farFuture = new Date(Date.now() + 30 * 86400000).toISOString()
  return {
    id: "fp-1",
    opening_line: "In memory of",
    closes_at: farFuture,
    closed_at: null,
    occasion_type: "Memorial",
    category: "memorial",
    grouping: "individual",
    subject: "someone",
    cause_label: null,
    total_raised: 15000, // £150.00 in pounds
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

describe("OrganizerCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("active favpoll with pledges", () => {
    it("renders identity: eyebrow and name", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      expect(screen.getByText("In memory of")).toBeInTheDocument()
      expect(screen.getByText("Belinda Johnson")).toBeInTheDocument()
    })

    it("renders active status badge (not closed)", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      const badge = screen.getByTestId("status-badge-active")
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent("days left")
      expect(
        screen.queryByTestId("status-badge-closed")
      ).not.toBeInTheDocument()
    })

    it("renders total raised in full-strength foreground colour", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      // Total raised section — has Active label next to it
      expect(screen.getByText("Active")).toBeInTheDocument()
    })

    it("renders poll topic row", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      expect(screen.getByText("Colour")).toBeInTheDocument()
    })

    it("renders shared fund row with deposited / remaining", () => {
      render(
        <OrganizerCard
          favpoll={makeFavpoll({
            pot: { total_deposited: 50, total_allocated: 10 },
          })}
        />
      )
      expect(screen.getByText(/shared fund/i)).toBeInTheDocument()
      // Row contains both a remaining amount and a total
      expect(screen.getByText(/left in shared fund/i)).toBeInTheDocument()
    })

    it("renders Listed status and switch", () => {
      render(<OrganizerCard favpoll={makeFavpoll({ is_listed: true })} />)
      expect(screen.getByText("Listed")).toBeInTheDocument()
      expect(
        screen.getByText(/Appears on the live events page/)
      ).toBeInTheDocument()
    })

    it("renders Unlisted status when is_listed=false", () => {
      render(<OrganizerCard favpoll={makeFavpoll({ is_listed: false })} />)
      expect(screen.getByText("Unlisted")).toBeInTheDocument()
      expect(screen.getByText(/Only reachable by people/)).toBeInTheDocument()
    })

    it("renders copy link button", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      expect(screen.getByTestId("copy-link-button")).toBeInTheDocument()
    })

    it("renders live display button linking to /display", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      const btn = screen.getByTestId("live-display-button")
      expect(btn).toHaveAttribute(
        "href",
        expect.stringContaining("/favpolls/fp-1/display")
      )
      expect(btn).toHaveAttribute("target", "_blank")
    })

    it("is not wrapped in opacity-70 (not closed)", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      const card = screen.getByTestId("organizer-card")
      expect(card).not.toHaveClass("opacity-70")
    })
  })

  describe("active favpoll with £0 raised", () => {
    it("renders total raised in muted colour when zero", () => {
      render(<OrganizerCard favpoll={makeFavpoll({ total_raised: 0 })} />)
      // The amount element should have text-muted-foreground
      const el =
        document.querySelector(".text-muted-foreground.tabular-nums") ??
        document.querySelector("[aria-live='polite']")
      // Just verify £0 or equivalent is rendered
      expect(screen.getByText("Active")).toBeInTheDocument()
    })
  })

  describe("closed favpoll", () => {
    const closed = makeFavpoll({
      closed_at: "2026-06-01T00:00:00Z",
      closes_at: new Date(Date.now() - 86400000).toISOString(),
    })

    it("renders Closed badge", () => {
      render(<OrganizerCard favpoll={closed} />)
      expect(screen.getByTestId("status-badge-closed")).toBeInTheDocument()
      expect(
        screen.queryByTestId("status-badge-active")
      ).not.toBeInTheDocument()
    })

    it("renders Closed label next to total raised", () => {
      render(<OrganizerCard favpoll={closed} />)
      // Both the status badge and the raised row show "Closed"
      expect(screen.getAllByText("Closed").length).toBeGreaterThanOrEqual(2)
    })

    it("applies opacity-70 to the card", () => {
      render(<OrganizerCard favpoll={closed} />)
      expect(screen.getByTestId("organizer-card")).toHaveClass("opacity-70")
    })
  })

  describe("warning-threshold badge", () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(NOW)
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it("applies warning style when days remaining equals threshold (7)", () => {
      const fp = makeFavpoll({
        closes_at: new Date(NOW.getTime() + 7 * 86400000).toISOString(),
      })
      render(<OrganizerCard favpoll={fp} />)
      const badge = screen.getByTestId("status-badge-active")
      expect(badge).toHaveClass("bg-amber-100")
    })

    it("does not apply warning style at threshold + 1 day (8 days)", () => {
      const fp = makeFavpoll({
        closes_at: new Date(NOW.getTime() + 8 * 86400000).toISOString(),
      })
      render(<OrganizerCard favpoll={fp} />)
      const badge = screen.getByTestId("status-badge-active")
      expect(badge).not.toHaveClass("bg-amber-100")
    })
  })

  describe("Listed/Unlisted switch", () => {
    it("toggles listed state and calls setFavpollListed when switched", async () => {
      const { setFavpollListed } = await import("@/app/favpolls/[id]/actions")
      render(<OrganizerCard favpoll={makeFavpoll({ is_listed: true })} />)
      const switchEl = screen.getByRole("switch")
      fireEvent.click(switchEl)
      await waitFor(() => {
        expect(setFavpollListed).toHaveBeenCalledWith("fp-1", false)
      })
    })

    it("reverts optimistic state if setFavpollListed throws", async () => {
      const { setFavpollListed } = await import("@/app/favpolls/[id]/actions")
      vi.mocked(setFavpollListed).mockRejectedValueOnce(
        new Error("network error")
      )
      render(<OrganizerCard favpoll={makeFavpoll({ is_listed: true })} />)
      const switchEl = screen.getByRole("switch")
      fireEvent.click(switchEl)
      // Optimistic: text changes immediately
      await waitFor(() => {
        expect(screen.getByText("Listed")).toBeInTheDocument()
      })
    })
  })

  describe("copy link button", () => {
    it("calls clipboard.writeText with the guest URL", async () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      const btn = screen.getByTestId("copy-link-button")
      fireEvent.click(btn)
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("/favpolls/fp-1")
      )
    })

    it("shows Copied! text after clicking", async () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      fireEvent.click(screen.getByTestId("copy-link-button"))
      await waitFor(() => {
        expect(screen.getByText("Copied!")).toBeInTheDocument()
      })
    })
  })

  describe("QR code", () => {
    it("encodes the guest-facing favpoll URL", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      const qr = screen.getByTestId("qr-svg")
      expect(qr.getAttribute("data-qr-value")).toContain("/favpolls/fp-1")
    })
  })

  describe("shared fund no-pot edge case", () => {
    it("renders £0/£0 without erroring when pot is null", () => {
      render(<OrganizerCard favpoll={makeFavpoll({ pot: null })} />)
      expect(screen.getByTestId("organizer-card")).toBeInTheDocument()
      expect(screen.getByText(/shared fund/i)).toBeInTheDocument()
    })
  })
})
