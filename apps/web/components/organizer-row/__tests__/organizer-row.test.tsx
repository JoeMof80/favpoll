import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { OrganizerRow } from "../index"
import type { OrganizerFavpoll } from "../utils"

vi.mock("@/app/favpolls/[id]/actions", () => ({
  setFavpollListed: vi.fn().mockResolvedValue(undefined),
  deleteFavpoll: vi.fn().mockResolvedValue(undefined),
}))

const mockRefresh = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
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
    short_code: "a1b2c3d4e5f6",
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
    pledge_count: 3,
    has_reveal: true,
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

    it("shows the charity in the triad line", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expect(screen.getByText(/Age UK/)).toBeInTheDocument()
    })

    it("appends a +n suffix when there are multiple charities", () => {
      const fp = makeFavpoll()
      const second = {
        charity: { ...fp.charities[0].charity, id: "c2", name: "Mind" },
      }
      render(
        <OrganizerRow
          favpoll={makeFavpoll({ charities: [...fp.charities, second] })}
        />
      )
      expect(screen.getByText(/Age UK \+1/)).toBeInTheDocument()
    })

    it("the name links to the favpoll page without toggling expansion", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      const link = screen.getByTestId("row-link")
      expect(link).toHaveAttribute("href", "/favpolls/fp-1")
      fireEvent.click(link)
      expect(screen.queryByTestId("qr-code")).not.toBeInTheDocument()
    })

    it("clicking the header background expands the row", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      fireEvent.click(screen.getByTestId("row-header"))
      expect(screen.getByTestId("qr-code")).toBeInTheDocument()
    })

    it("has no copy button in the collapsed header", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expect(screen.queryByTestId("copy-guest-button")).not.toBeInTheDocument()
    })

    it("is not dimmed when active", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expect(screen.getByTestId("organizer-row")).not.toHaveClass("opacity-70")
    })
  })

  describe("expansion", () => {
    it("expands on toggle: QR and listed switch appear", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      expect(screen.getByTestId("row-toggle")).toHaveAttribute(
        "aria-expanded",
        "true"
      )
      expect(screen.getByTestId("qr-svg")).toBeInTheDocument()
      expect(screen.getByRole("switch")).toBeInTheDocument()
    })

    it("offers a second guest-link copy inside the share zone", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      fireEvent.click(screen.getByTestId("copy-guest-url-button"))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("/favpolls/fp-1")
      )
    })

    it("collapses again on a second toggle", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      expand()
      expect(screen.queryByTestId("qr-svg")).not.toBeInTheDocument()
    })

    // QR-ONLY short link (2026-08-06). The QR encodes /p/<code> because
    // /favpolls/<uuid> is 65 chars — a 49x49 code whose modules fall under the
    // printable floor at card size — while the link the organiser COPIES stays
    // long, so a random code never becomes a favpoll's public face. Both halves
    // are asserted here: the split is the point, and either half drifting
    // silently would undo it.
    it("QR encodes the SHORT link, not the guest URL", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      const value = screen.getByTestId("qr-svg").getAttribute("data-qr-value")
      expect(value).toContain("/p/a1b2c3d4e5f6")
      expect(value).not.toContain("/favpolls/fp-1")
    })

    it("the copied guest link stays the long form", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      fireEvent.click(screen.getByTestId("copy-guest-url-button"))
      const copied = vi
        .mocked(navigator.clipboard.writeText)
        .mock.calls.at(-1)?.[0]
      expect(copied).toContain("/favpolls/fp-1")
      expect(copied).not.toContain("/p/a1b2c3d4e5f6")
    })

    it("copies the live display URL", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      fireEvent.click(screen.getByTestId("copy-display-button"))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("/live/slug-fp-1")
      )
    })

    it("renders clickable favpoll, edit and live link paths + print pack", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      expect(screen.getByTestId("favpoll-link")).toHaveAttribute(
        "href",
        expect.stringContaining("/favpolls/fp-1")
      )
      expect(screen.getByTestId("live-favpoll-link")).toHaveAttribute(
        "href",
        expect.stringContaining("/live/slug-fp-1")
      )
      expect(screen.getByTestId("edit-favpoll-link")).toHaveAttribute(
        "href",
        "/favpolls/fp-1/edit"
      )
      expect(screen.getByRole("link", { name: /Print pack/i })).toHaveAttribute(
        "href",
        "/favpolls/fp-1/pack"
      )
    })

    it("row headers are plain text, not links", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      for (const header of ["favpoll", "Edit favpoll", "Live favpoll"]) {
        expect(screen.getByText(header).closest("a")).toBeNull()
      }
    })

    it("copies the edit URL", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      fireEvent.click(screen.getByTestId("copy-edit-button"))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("/favpolls/fp-1/edit")
      )
    })

    it("shows closing date, pledge count and reveal status", () => {
      // A date RELATIVE to now, not a fixed one. This was pinned to
      // 2026-08-12, so from the 13th the favpoll was closed, the row said
      // "Closed", and the test failed for good — a time bomb that had nothing
      // to do with whatever change happened to be in flight when it went off.
      const closesAt = new Date(Date.now() + 45 * 86400000)
      const closesLabel = closesAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      const fp = makeFavpoll({
        closes_at: closesAt.toISOString(),
        pledge_count: 12,
        has_reveal: true,
      })
      render(<OrganizerRow favpoll={fp} />)
      expand()
      expect(screen.getByText("Closes")).toBeInTheDocument()
      expect(screen.getByText(closesLabel)).toBeInTheDocument()
      expect(screen.getByText("Pledges")).toBeInTheDocument()
      expect(screen.getByText("12")).toBeInTheDocument()
      expect(screen.getByText("Written")).toBeInTheDocument()
    })

    it("reports a missing reveal", () => {
      render(<OrganizerRow favpoll={makeFavpoll({ has_reveal: false })} />)
      expand()
      expect(screen.getByText("None")).toBeInTheDocument()
    })

    it("shows the shared fund line when the pot has deposits", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />)
      expand()
      expect(screen.getByText("Shared fund")).toBeInTheDocument()
      expect(screen.getByText(/deposited/)).toBeInTheDocument()
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
      expect(screen.queryByText("Shared fund")).not.toBeInTheDocument()
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
    it("renders without a charity anywhere when charities is empty", () => {
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

  describe("delete", () => {
    const deletable = () =>
      makeFavpoll({
        pledge_count: 0,
        pot: { total_deposited: 0, total_allocated: 0 },
      })

    it("is disabled with an explanation when the favpoll has pledges", () => {
      render(<OrganizerRow favpoll={makeFavpoll()} />) // pledge_count: 3
      expand()
      expect(screen.getByTestId("delete-favpoll-button")).toBeDisabled()
      expect(
        screen.getByText(/Favpolls with pledges can't be deleted/)
      ).toBeInTheDocument()
    })

    it("is disabled when the shared fund has deposits even with no pledges", () => {
      render(
        <OrganizerRow
          favpoll={makeFavpoll({
            pledge_count: 0,
            pot: { total_deposited: 50, total_allocated: 0 },
          })}
        />
      )
      expand()
      expect(screen.getByTestId("delete-favpoll-button")).toBeDisabled()
    })

    it("confirms, calls deleteFavpoll, and refreshes", async () => {
      const { deleteFavpoll } = await import("@/app/favpolls/[id]/actions")
      vi.spyOn(window, "confirm").mockReturnValue(true)
      render(<OrganizerRow favpoll={deletable()} />)
      expand()
      fireEvent.click(screen.getByTestId("delete-favpoll-button"))
      await waitFor(() => expect(deleteFavpoll).toHaveBeenCalledWith("fp-1"))
      await waitFor(() => expect(mockRefresh).toHaveBeenCalled())
    })

    it("does nothing when the confirm is declined", async () => {
      const { deleteFavpoll } = await import("@/app/favpolls/[id]/actions")
      vi.mocked(deleteFavpoll).mockClear()
      vi.spyOn(window, "confirm").mockReturnValue(false)
      render(<OrganizerRow favpoll={deletable()} />)
      expand()
      fireEvent.click(screen.getByTestId("delete-favpoll-button"))
      expect(deleteFavpoll).not.toHaveBeenCalled()
    })
  })
})
