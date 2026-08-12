import { describe, it, expect, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import { ProcessOverview } from "../process-overview"
import { t } from "@/lib/i18n"

// The media are stubbed down to markers: this asserts which FRAME wraps which
// beat, not what any of them renders internally. Labels come from i18n rather
// than literals — a test that hardcodes copy fails the next time the copy is
// edited and teaches nothing (the "For young minds" break, #536).

vi.mock("@/components/hero-demo-panel/demo-card", () => ({
  DemoCard: ({ phase }: { phase: string }) => (
    <div data-testid="demo-card" data-phase={phase} />
  ),
}))

// Keep the real module: it also exports the safe-area constant the phone
// beats pass to DemoCard, and a bare stub silently made that undefined.
vi.mock("@/components/hero-demo-panel/phone-frame", async () => {
  const actual = await vi.importActual<
    typeof import("@/components/hero-demo-panel/phone-frame")
  >("@/components/hero-demo-panel/phone-frame")
  return {
    ...actual,
    PhoneFrame: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="phone-frame">{children}</div>
    ),
  }
})

vi.mock("@/components/hero-demo-panel/tv-frame", () => ({
  TvFrame: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tv-frame">{children}</div>
  ),
}))

vi.mock("@/components/landing/display-still", () => ({
  DisplayStill: () => <div data-testid="display-still" />,
}))

vi.mock("@/components/print-pack/pack-card", async () => {
  const actual = await vi.importActual<
    typeof import("@/components/print-pack/pack-card")
  >("@/components/print-pack/pack-card")
  return {
    ...actual,
    PackCard: ({ scale }: { scale: string }) => (
      <div data-testid="pack-card" data-scale={scale} />
    ),
  }
})

describe("ProcessOverview", () => {
  it("numbers all six beats of the journey", () => {
    render(<ProcessOverview />)

    // Every beat is numbered since the 2026-08-09 rewrite: the section is one
    // GUEST journey, and a guest both scans the card and watches the screen.
    // Before that the two ends were treated as the organiser's and left
    // unnumbered.
    const labels = [
      t("landing.how.card.label"),
      t("landing.how.arrive.label"),
      t("landing.how.pick.label"),
      t("landing.how.pledge.label"),
      t("landing.how.reveal.label"),
      t("landing.how.room.label"),
    ]
    labels.forEach((label, i) => {
      expect(screen.getByText(`${i + 1}. ${label}`)).toBeInTheDocument()
    })
  })

  it("frames each beat as the object it actually is", () => {
    const { container } = render(<ProcessOverview />)

    // Scoped to the PINNED column: jsdom applies no media queries, so the
    // mobile-only still renders here too and would inflate the counts.
    const column = within(container.querySelector(".sticky")!.parentElement!)

    // Four phone beats — the guest arc, and only the guest arc.
    expect(column.getAllByTestId("phone-frame")).toHaveLength(4)
    expect(
      column.getAllByTestId("demo-card").map((el) => el.dataset.phase)
    ).toEqual(["arriving", "selected", "amount-picked", "reveal"])

    // The card is paper at wallet size; the display hangs in a TV, not a
    // browser window and not a phone.
    expect(screen.getByTestId("pack-card").dataset.scale).toBe("l7418")
    expect(screen.getByTestId("tv-frame")).toContainElement(
      screen.getByTestId("display-still")
    )
  })

  it("scopes the wallet card to .paper so dark mode cannot blank it", () => {
    // The card forces bg-white; without .paper pinning the light token values
    // a dark-mode visitor gets white ink on it — the failure #535 fixed on the
    // print pack, which this still would otherwise reintroduce on the homepage.
    render(<ProcessOverview />)
    const card = screen.getByTestId("pack-card")
    expect(card.closest(".paper")).not.toBeNull()
  })
})
