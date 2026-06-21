import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { OrganizerCard } from "../index"
import type { OrganizerCardFavpoll } from "../utils"

vi.mock("@/app/favpolls/[id]/actions", () => ({
  setFavpollListed: vi.fn().mockResolvedValue(undefined),
}))

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

Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
})

const NOW = new Date("2026-06-21T12:00:00Z")

function makeFavpoll(
  overrides: Partial<OrganizerCardFavpoll> = {}
): OrganizerCardFavpoll {
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

describe("OrganizerCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("active favpoll", () => {
    it("renders identity: eyebrow and name", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      expect(screen.getByText("In memory of")).toBeInTheDocument()
      expect(screen.getByText("Belinda Johnson")).toBeInTheDocument()
    })

    it("renders topic row with countdown text", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      expect(screen.getByText("Colour")).toBeInTheDocument()
      expect(screen.getByTestId("countdown-active")).toBeInTheDocument()
      expect(screen.getByTestId("countdown-active")).toHaveTextContent("days")
    })

    it("renders Listed status and description", () => {
      render(<OrganizerCard favpoll={makeFavpoll({ is_listed: true })} />)
      expect(screen.getByText("Listed")).toBeInTheDocument()
      expect(
        screen.getByText(/Appears on the live favpolls page/)
      ).toBeInTheDocument()
    })

    it("renders Unlisted status when is_listed=false", () => {
      render(<OrganizerCard favpoll={makeFavpoll({ is_listed: false })} />)
      expect(screen.getByText("Unlisted")).toBeInTheDocument()
      expect(screen.getByText(/Only reachable by people/)).toBeInTheDocument()
    })

    it("renders charity name in footer", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      expect(screen.getByText("Age UK")).toBeInTheDocument()
    })

    it("renders copy-guest-button and copy-display-button", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      expect(screen.getByTestId("copy-guest-button")).toBeInTheDocument()
      expect(screen.getByTestId("copy-display-button")).toBeInTheDocument()
    })

    it("is not wrapped in opacity-70 (not closed)", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      expect(screen.getByTestId("organizer-card")).not.toHaveClass("opacity-70")
    })
  })

  describe("closed favpoll", () => {
    const closed = makeFavpoll({
      closed_at: "2026-06-01T00:00:00Z",
      closes_at: new Date(Date.now() - 86400000).toISOString(),
    })

    it("renders Closed in the countdown element", () => {
      render(<OrganizerCard favpoll={closed} />)
      expect(screen.getByTestId("countdown-closed")).toBeInTheDocument()
      expect(screen.getByTestId("countdown-closed")).toHaveTextContent("Closed")
    })

    it("does not render countdown-active", () => {
      render(<OrganizerCard favpoll={closed} />)
      expect(screen.queryByTestId("countdown-active")).not.toBeInTheDocument()
    })

    it("applies opacity-70 to the card", () => {
      render(<OrganizerCard favpoll={closed} />)
      expect(screen.getByTestId("organizer-card")).toHaveClass("opacity-70")
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
      render(<OrganizerCard favpoll={fp} />)
      expect(screen.getByTestId("countdown-active")).toHaveClass(
        "text-amber-600"
      )
    })

    it("does not apply amber colour at threshold + 1 day (8 days)", () => {
      const fp = makeFavpoll({
        closes_at: new Date(NOW.getTime() + 8 * 86400000).toISOString(),
      })
      render(<OrganizerCard favpoll={fp} />)
      expect(screen.getByTestId("countdown-active")).not.toHaveClass(
        "text-amber-600"
      )
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
      await waitFor(() => {
        expect(screen.getByText("Listed")).toBeInTheDocument()
      })
    })
  })

  describe("copy guest link", () => {
    it("calls clipboard.writeText with the guest URL", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      fireEvent.click(screen.getByTestId("copy-guest-button"))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("/favpolls/fp-1")
      )
    })

    it("shows Check icon after clicking (clipboard called)", async () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      fireEvent.click(screen.getByTestId("copy-guest-button"))
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      })
    })
  })

  describe("copy display link", () => {
    it("calls clipboard.writeText with the display URL", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      fireEvent.click(screen.getByTestId("copy-display-button"))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("/favpolls/fp-1/display")
      )
    })
  })

  describe("QR code", () => {
    it("encodes the guest-facing favpoll URL", () => {
      render(<OrganizerCard favpoll={makeFavpoll()} />)
      const qr = screen.getByTestId("qr-svg")
      expect(qr.getAttribute("data-qr-value")).toContain("/favpolls/fp-1")
    })
  })

  describe("no-charity edge case", () => {
    it("renders without charity footer when charities is empty", () => {
      render(<OrganizerCard favpoll={makeFavpoll({ charities: [] })} />)
      expect(screen.getByTestId("organizer-card")).toBeInTheDocument()
      expect(screen.queryByText("Age UK")).not.toBeInTheDocument()
    })
  })

  describe("no-poll edge case", () => {
    it("renders without topic row when poll is null", () => {
      render(<OrganizerCard favpoll={makeFavpoll({ poll: null })} />)
      expect(screen.getByTestId("organizer-card")).toBeInTheDocument()
      expect(screen.queryByText("Colour")).not.toBeInTheDocument()
    })
  })
})
