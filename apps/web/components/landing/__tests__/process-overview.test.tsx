import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ProcessOverview } from "../process-overview"
import { t } from "@/lib/i18n"

// ONE BRANCH OF MEDIA RENDERS (2026-08-17). The section used to emit both the
// pinned desktop column and the mobile still, letting CSS hide one — so these
// tests had to scope past the duplicates. It now picks in JS, because mounting
// both put the desktop column's whole weight on phones. jsdom's matchMedia
// reports no match, so an unmocked render is the MOBILE branch.
function stubViewport(matches: boolean) {
  vi.stubGlobal("matchMedia", (media: string) => ({
    matches,
    media,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

afterEach(() => vi.unstubAllGlobals())

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

// Keep the real module: it also exports the width the still is RENDERED at,
// which the section reads to size the box around it. A bare stub made that
// undefined and the display box collapsed — the same trap phone-frame's mock
// hit above.
vi.mock("@/components/landing/display-still", async () => {
  const actual = await vi.importActual<
    typeof import("@/components/landing/display-still")
  >("@/components/landing/display-still")
  return {
    ...actual,
    DisplayStill: () => <div data-testid="display-still" />,
  }
})

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
  it("numbers all seven beats of the arc", () => {
    render(<ProcessOverview />)

    // Every beat is numbered since the 2026-08-09 rewrite. That rewrite's
    // reasoning was that all six were things a GUEST does; the keepsake beat
    // added 2026-08-17 is the organiser's, and the numbering survived it
    // because the section now frames the whole arc rather than one actor —
    // paper → phone → room → paper.
    const labels = [
      t("landing.how.card.label"),
      t("landing.how.arrive.label"),
      t("landing.how.pick.label"),
      t("landing.how.pledge.label"),
      t("landing.how.reveal.label"),
      t("landing.how.room.label"),
      t("landing.how.keepsake.label"),
    ]
    labels.forEach((label, i) => {
      expect(screen.getByText(`${i + 1}. ${label}`)).toBeInTheDocument()
    })
  })

  it("frames each beat as the object it actually is", () => {
    render(<ProcessOverview />)

    // Four phone beats — the guest arc, and only the guest arc.
    expect(screen.getAllByTestId("phone-frame")).toHaveLength(4)
    expect(
      screen.getAllByTestId("demo-card").map((el) => el.dataset.phase)
    ).toEqual(["arriving", "selected", "amount-picked", "reveal"])

    // The card is paper at wallet size; the display hangs in a TV, not a
    // browser window and not a phone.
    expect(screen.getByTestId("pack-card").dataset.scale).toBe("l7418")
    expect(screen.getByTestId("tv-frame")).toContainElement(
      screen.getByTestId("display-still")
    )
  })

  it("gives every beat its own medium on mobile, not one still at the end", () => {
    // The whole point of the 2026-08-17 mobile fix: a phone used to get six
    // texts and a single trailing phone frame, so the two ends of the arc —
    // the printed card a guest scans and the display in the room — were
    // desktop-only. Each beat's medium now sits under its own text.
    render(<ProcessOverview />)
    expect(screen.getByTestId("pack-card")).toBeInTheDocument()
    expect(screen.getByTestId("tv-frame")).toBeInTheDocument()
    expect(screen.getAllByTestId("demo-card")).toHaveLength(4)
  })

  it("pins the six media in the sticky column on desktop", () => {
    // And renders them ONLY there: both branches mounting is what this
    // replaced, and a silent regression to that doubles what a phone loads.
    stubViewport(true)
    const { container } = render(<ProcessOverview />)
    const column = within(container.querySelector(".sticky")!.parentElement!)

    expect(column.getAllByTestId("phone-frame")).toHaveLength(4)
    expect(column.getByTestId("pack-card")).toBeInTheDocument()
    expect(column.getByTestId("tv-frame")).toBeInTheDocument()
    // Nothing outside the pinned column.
    expect(screen.getAllByTestId("demo-card")).toHaveLength(4)
  })

  it("offers a full-size view of the PHONE beats only, on mobile", async () => {
    // Founder, 2026-08-18. The phone is the one medium a viewer genuinely
    // helps: its screen is 390 wide, so a 390px viewport shows it at ~1:1,
    // where the thumbnail's copy sits at 7.3px. Making it legible IN PLACE
    // was tried and cost 243px per beat across four beats — "broken but also
    // ridiculous". A tap costs nothing.
    //
    // The card is already life-size and the two documents are 1120+ wide, so
    // a viewer would open them at the size they already are. They stay inert,
    // and that is asserted rather than assumed: a trigger on all seven would
    // be four buttons that do nothing useful.
    render(<ProcessOverview />)

    const triggers = screen.getAllByRole("button", {
      name: /see this screen full size/i,
    })
    expect(triggers).toHaveLength(4)

    // The name has to carry the beat, not just "enlarge" — four identical
    // buttons in a list is what a screen reader would otherwise announce.
    expect(triggers[0]).toHaveAccessibleName(
      new RegExp(t("landing.how.arrive.label"), "i")
    )
  })

  it("opens the viewer on the beat that was tapped", async () => {
    const user = userEvent.setup()
    render(<ProcessOverview />)

    // The third phone beat, so a passing test cannot be the first one by
    // accident — the viewer takes a beat as a prop and could easily always
    // render the same one.
    const triggers = screen.getAllByRole("button", {
      name: /see this screen full size/i,
    })
    await user.click(triggers[2])

    const dialog = await screen.findByRole("dialog")
    // Its own words travel with it: a reader who taps in from step 4 should
    // not have to close the viewer to know which step they are looking at.
    expect(
      within(dialog).getByText(t("landing.how.pledge.label"))
    ).toBeInTheDocument()
    expect(within(dialog).getByTestId("demo-card").dataset.phase).toBe(
      "amount-picked"
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
