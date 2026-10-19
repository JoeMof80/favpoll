import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import type { Phase } from "../scenes"

// ── Framer-motion stub ────────────────────────────────────────────────────────
// Animations don't run in jsdom; render children as plain divs and
// unwrap AnimatePresence so conditional children appear immediately.
vi.mock("framer-motion", () => {
  const div = ({
    children,
    animate: _a,
    initial: _i,
    exit: _e,
    transition: _t,
    style,
    className,
    "aria-hidden": ariaHidden,
    ...rest
  }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any) => (
    <div style={style} className={className} aria-hidden={ariaHidden} {...rest}>
      {children}
    </div>
  )
  return {
    motion: { div, p: div, span: div },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    useReducedMotion: () => true,
  }
})

// ── Sub-component stubs ───────────────────────────────────────────────────────
vi.mock("@/components/favpoll-card/poll-note", () => ({
  PollNote: ({ personalNote }: { personalNote: string }) => (
    <blockquote data-testid="poll-reveal">{personalNote}</blockquote>
  ),
}))

vi.mock("@/components/favpoll-hero-avatar", () => ({
  ProtagonistAvatar: () => <div data-testid="protagonist-avatar" />,
}))

// Stubs expose selectedIds.length via data-selected-count so we can assert
// the selection reaches the rows (charity-idiom picker, 2026-09-16).
vi.mock("@/components/pledge-dialog/step-pick-favourites", () => ({
  PickerHeader: ({ topicTitle }: { topicTitle: string }) => (
    <div data-testid="picker-header">Pick your favourite {topicTitle}</div>
  ),
  PickerPills: ({ selectedIds }: { selectedIds: string[] }) => (
    <div
      data-testid="picker-items"
      data-selected-count={String(selectedIds.length)}
    />
  ),
}))

vi.mock("@/components/pledge-dialog/step-amount", () => ({
  StepAmount: () => <div data-testid="step-amount" />,
  StepAmountHeader: () => <div data-testid="step-amount-header" />,
}))

import { DemoCard } from "../demo-card"
import { LandingHero } from "@/components/landing/hero"
import {
  RotatingRegisterHero,
  DWELL_MS,
} from "@/components/landing/rotating-register-hero"
import { getHeroRegister } from "@/lib/hero-register-store"
import { SCENES } from "../scenes"
import { DECOY_WIDTHS } from "@/lib/decoys"

// ── Fixtures ──────────────────────────────────────────────────────────────────

// Page-copy verbatim — the universal lock CTA (2026-08-02)
// (the normalised reveal-lock pill; see components/reveal-lock.tsx).
const LOCK_CARD_COPY = "Pledge your favourite"

const scene = SCENES[0] // Belinda · Colour · Marie Curie
const charity = scene.charities[0]
const realWidths = scene.results.slice(0, 5).map((r) => r.widthPercent)

function renderCard(
  phase: Phase,
  barWidths = DECOY_WIDTHS,
  prefersReducedMotion = false
) {
  return render(
    <DemoCard
      scene={scene}
      phase={phase}
      barWidths={barWidths}
      prefersReducedMotion={prefersReducedMotion}
    />
  )
}

// ── Locked phases ─────────────────────────────────────────────────────────────

const LOCKED_PHASES: Phase[] = [
  "arriving",
  "trigger-hover",
  "triggering",
  "picking",
  "selected",
  "next-hover",
  "next-pressed",
  "pledge-panel",
  "amount-picked",
  "pledge-hover",
  "pledging",
  "confirmed",
]

describe("DemoCard — locked phases", () => {
  it.each(LOCKED_PHASES)(
    "shows the lock card with correct copy in '%s' phase",
    (phase) => {
      renderCard(phase)
      expect(screen.getByText(LOCK_CARD_COPY)).toBeInTheDocument()
    }
  )

  it("the note and standings are skeletons, aria-hidden, when locked (#911 parity, 2026-10-15)", () => {
    const { container } = renderCard("arriving")
    const note = screen.getByTestId("note-skeleton")
    const standings = screen.getByTestId("standings-skeleton")
    expect(note.closest("[aria-hidden='true']")).not.toBeNull()
    expect(standings.closest("[aria-hidden='true']")).not.toBeNull()
    // No blurred decoy anywhere — the product stopped drawing one.
    expect(container.querySelector(".blur-xs")).toBeNull()
  })

  it("the phone frame draws no skeletons when locked — the lock card alone (founder, 2026-10-16)", () => {
    render(
      <DemoCard
        scene={scene}
        phase="arriving"
        barWidths={DECOY_WIDTHS}
        prefersReducedMotion={false}
        device="phone"
      />
    )
    expect(screen.queryByTestId("note-skeleton")).toBeNull()
    expect(screen.queryByTestId("standings-skeleton")).toBeNull()
    expect(screen.getByText(LOCK_CARD_COPY)).toBeInTheDocument()
  })

  it("About text is present via reserve copy in a locked phase", () => {
    renderCard("arriving")
    // The reserve <p> always carries the full About text (the typed copy starts
    // as NBSP). getByText traverses textContent regardless of aria-hidden.
    const aboutEls = screen.getAllByText(scene.protagonist!.about, {
      exact: false,
    })
    expect(aboutEls.length).toBeGreaterThanOrEqual(1)
  })
})

// ── Unlocked phases ───────────────────────────────────────────────────────────

const UNLOCKED_PHASES: Phase[] = ["clearing", "results", "note"]

describe("DemoCard — unlocked phases", () => {
  it.each(UNLOCKED_PHASES)("lock card is absent in '%s' phase", (phase) => {
    renderCard(phase, realWidths)
    expect(screen.queryByText(LOCK_CARD_COPY)).toBeNull()
  })

  it("no blur-xs present when unlocked", () => {
    const { container } = renderCard("note", realWidths)
    expect(container.querySelector(".blur-xs")).toBeNull()
  })

  it.each(UNLOCKED_PHASES)(
    "reveal text accessible via reserve copy in '%s' phase",
    (phase) => {
      renderCard(phase, realWidths)
      // Two PollNote nodes render when unlocked: an invisible reserve (full
      // text, always present) and a typed copy (fills via setInterval — starts
      // as NBSP in synchronous tests). The reserve is first in DOM order.
      const reveals = screen.getAllByTestId("poll-reveal")
      expect(reveals.length).toBeGreaterThanOrEqual(2)
      expect(reveals[0]).toHaveTextContent(scene.poll.personal_note)
    }
  )
})

// ── Topic pill (merged header + pledge trigger) ───────────────────────────────

describe("DemoCard — topic pill", () => {
  it("renders 'Favourite {topic}' in every phase", () => {
    for (const phase of [...LOCKED_PHASES, ...UNLOCKED_PHASES]) {
      const { unmount } = renderCard(phase)
      // Two lines since the eyebrow split (2026-09-01): the quiet
      // "Favourite" above the topic word at full size.
      expect(screen.getByText("Favourite", { exact: true })).toBeInTheDocument()
      expect(
        screen.getByText(scene.poll.topic.title, { exact: true })
      ).toBeInTheDocument()
      unmount()
    }
  })

  it("renders the topic as a header ribbon, not a button (2026-08-02)", () => {
    for (const phase of [...LOCKED_PHASES, ...UNLOCKED_PHASES]) {
      const { unmount } = renderCard(phase)
      const label = screen.getByText(scene.poll.topic.title, { exact: true })
      expect(label.closest("button")).toBeNull()
      unmount()
    }
  })
})

// ── Decoy vs real bar widths ──────────────────────────────────────────────────

describe("DemoCard — bar widths", () => {
  it("renders no ranking bars when locked — a skeleton row per favourite instead", () => {
    const { container } = renderCard("arriving", DECOY_WIDTHS)
    expect(
      container.querySelector('ol[aria-label="Current rankings"]')
    ).toBeNull()
    expect(screen.getByTestId("standings-skeleton").children).toHaveLength(
      scene.results.length
    )
  })

  it("renders bars at real widths when unlocked", () => {
    const { container } = renderCard("note", realWidths)
    const barFills = container.querySelectorAll(
      'ol[aria-label="Current rankings"] [role="presentation"] > div'
    )
    expect(barFills[0]).toHaveStyle({ width: `${realWidths[0]}%` })
    expect(barFills[1]).toHaveStyle({ width: `${realWidths[1]}%` })
  })
})

// ── Dialog mimics ─────────────────────────────────────────────────────────────

describe("DemoCard — pledge goal", () => {
  const fundraiser = SCENES.find((s) => s.kind === "fundraiser")!

  it("the fundraiser scene shows its goal under the total, and the bar (2026-08-30)", () => {
    render(
      <DemoCard
        scene={fundraiser}
        phase="arriving"
        barWidths={DECOY_WIDTHS}
        prefersReducedMotion
      />
    )
    expect(screen.getByText("£810")).toBeInTheDocument()
    expect(screen.getByText("of the £1,000 goal")).toBeInTheDocument()
    const bar = screen.getByRole("progressbar", {
      name: "Progress towards the pledge goal",
    })
    expect(bar).toHaveAttribute("aria-valuemax", "1000")
    expect(bar).toHaveAttribute("aria-valuenow", "810")
    // Short of the goal on purpose: the reveal's "If we reach the goal" is
    // a live condition, and the bar stays brand-coloured rather than green.
    expect(bar.firstElementChild).toHaveClass("bg-primary")
  })

  it("scenes without a goal show no bar and no caption", () => {
    renderCard("arriving")
    expect(screen.queryByRole("progressbar")).toBeNull()
    expect(screen.queryByText(/goal/)).toBeNull()
  })
})

describe("DemoCard — dialog mimics", () => {
  it("shows picker header and items in picking phase", () => {
    renderCard("picking")
    expect(screen.getByTestId("picker-header")).toBeInTheDocument()
    expect(screen.getByTestId("picker-items")).toBeInTheDocument()
  })

  it("picker header includes topic title", () => {
    renderCard("picking")
    expect(screen.getByTestId("picker-header")).toHaveTextContent(
      scene.poll.topic.title
    )
  })

  it("picker rows receive the selection in selected phase (row highlights)", () => {
    renderCard("selected")
    // One favourite selected → selectedIds passed to PickerPills has length 1
    expect(screen.getByTestId("picker-items")).toHaveAttribute(
      "data-selected-count",
      "1"
    )
  })

  it("the picker primary is Next throughout — dimmed while browsing, live once selected (2026-10-19: 'Give without picking' was noise in the demo)", () => {
    const { unmount: u1 } = renderCard("picking")
    const browsing = screen.getAllByRole("button", {
      name: /^Next$/,
      hidden: true,
    })
    expect(browsing.length).toBeGreaterThan(0)
    expect(browsing[browsing.length - 1].className).toMatch(/opacity-50/)
    expect(
      screen.queryByRole("button", {
        name: /^Give without picking$/,
        hidden: true,
      })
    ).toBeNull()
    u1()

    const { unmount: u2 } = renderCard("selected")
    const nextSelected = screen.getAllByRole("button", {
      name: /^Next$/,
      hidden: true,
    })
    expect(nextSelected[nextSelected.length - 1]).toHaveAttribute(
      "data-variant",
      "default"
    )
    u2()
  })

  it("shows amount step in pledge-panel phase", () => {
    renderCard("pledge-panel")
    // Two step-amount nodes exist (one in the hidden height measurer); the
    // live one is last in document order.
    const steps = screen.getAllByTestId("step-amount")
    expect(steps[steps.length - 1]).toBeInTheDocument()
  })

  it("the amount step's footer is the Back/Next twins (no arrows, #887/#889)", () => {
    renderCard("pledge-panel")
    const nexts = screen.getAllByRole("button", {
      name: /^Next$/,
      hidden: true,
    })
    expect(nexts.length).toBeGreaterThan(0)
    expect(
      screen.getAllByRole("button", { name: /^Back$/, hidden: true }).length
    ).toBeGreaterThan(0)
    expect(
      screen.queryByRole("button", { name: /Next →/, hidden: true })
    ).toBeNull()
  })

  it("the confirmation is a receipt: status, the favourite's chip under the topic, the charity row", () => {
    renderCard("confirmed")
    expect(screen.getByText("Pledge confirmed")).toBeInTheDocument()
    expect(
      screen.getAllByText(
        scene.poll.topic.favourites[scene.selectedIndex].label
      ).length
    ).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByText(`Your favourite ${scene.poll.topic.title.toLowerCase()}`)
    ).toBeInTheDocument()
  })

  it("picker not shown in amount phases", () => {
    renderCard("pledge-panel")
    expect(screen.queryByTestId("picker-header")).toBeNull()
  })
})

// ── Footer (CharityRow mirror) ────────────────────────────────────────────────

describe("DemoCard — footer", () => {
  it("renders the charity name", () => {
    // Test in unlocked phase so the footer is not aria-hidden.
    renderCard("note", realWidths)
    expect(screen.getByText(charity.name)).toBeInTheDocument()
  })

  it("renders the charity registration number", () => {
    renderCard("note", realWidths)
    expect(
      screen.getByText(`Charity no. ${charity.registered_number}`)
    ).toBeInTheDocument()
  })

  it("renders the GBP-formatted total raised", () => {
    renderCard("note", realWidths)
    // scene.total = "£1,005" → raisedNum = 1005 → GBP.format(1005) = "£1,005"
    expect(screen.getByText(scene.total)).toBeInTheDocument()
  })
})

// ── Reduced motion ────────────────────────────────────────────────────────────

describe("LandingHero — reduced motion", () => {
  beforeEach(() => {
    // Pin the demo's random opening scene to scene 0 (Belinda) — these
    // tests assert start-scene content before jumping.
    vi.spyOn(Math, "random").mockReturnValue(0)
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("reduce"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders the resolved reveal state — no lock card, no blur", () => {
    const { container } = render(<LandingHero liveCount={6} totalLive={0} />)
    // Phase stays at 'reveal' — the loop never fires.
    expect(screen.queryByText(LOCK_CARD_COPY)).toBeNull()
    expect(container.querySelector(".blur-xs")).toBeNull()
  })

  it("shows the real reveal text in the resolved state", () => {
    render(<LandingHero liveCount={6} totalLive={0} />)
    // With prefersReducedMotion=true, useTyped returns full text immediately,
    // so both the reserve and typed PollNote nodes carry the full text.
    const reveals = screen.getAllByTestId("poll-reveal")
    expect(reveals.length).toBeGreaterThanOrEqual(1)
    expect(reveals[0]).toHaveTextContent(SCENES[0].poll.personal_note)
  })

  // Derived from the scene, not a copy string: this test hardcoded "For young
  // minds" and broke the moment the cause example changed charity (2026-08-06).
  // What is worth asserting is the BEHAVIOUR — the chip jumps to the cause
  // scene — not which words that scene happens to carry this month.
  it("jumps the demo to the cause scene when the 'Cause' chip is clicked", () => {
    const cause = SCENES.find((s) => s.kind === "cause")
    // heading is optional on the scene type, but a faceless cause has no
    // protagonist to headline with — so if this is ever missing the scene is
    // broken, and the test should say so rather than silently pass on undefined.
    const heading = cause?.heading
    expect(heading).toBeTruthy()
    render(<LandingHero liveCount={6} totalLive={0} />)
    // Starts on the first scene (Belinda / remembering), not the cause scene.
    expect(screen.queryByRole("heading", { name: heading! })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Cause" }))
    // By ROLE: a cause's heading is usually its charity's name too (St Luke's
    // Cheshire Hospice, in support of St Luke's Cheshire Hospice), so the
    // text appears twice.
    expect(screen.getByRole("heading", { name: heading! })).toBeInTheDocument()
  })

  it("jumps the demo to the fundraiser scene when 'Fundraiser' is clicked", () => {
    render(<LandingHero liveCount={6} totalLive={0} />)
    fireEvent.click(screen.getByRole("button", { name: "Fundraiser" }))
    expect(screen.getByText("Marcus Bell")).toBeInTheDocument()
  })
})

// ── Cause (faceless, no protagonist) vs fundraiser (a person's challenge) ──────

describe("DemoCard — cause (faceless) vs fundraiser (has a runner)", () => {
  const causeScene = SCENES.find((s) => s.kind === "cause")!
  const fundraiserScene = SCENES.find((s) => s.kind === "fundraiser")!

  function renderScene(s: (typeof SCENES)[number], phase: Phase) {
    return render(
      <DemoCard
        scene={s}
        phase={phase}
        barWidths={DECOY_WIDTHS}
        prefersReducedMotion={false}
      />
    )
  }

  it("cause is faceless — renders its heading and no protagonist avatar", () => {
    renderScene(causeScene, "arriving")
    expect(
      screen.getByRole("heading", { name: causeScene.heading! })
    ).toBeInTheDocument()
    // No avatar unless the cause has its own photo (scene.photo_url) — the
    // scene ships null until Biscuit's photo lands.
    if (!causeScene.photo_url) {
      expect(screen.queryByTestId("protagonist-avatar")).toBeNull()
    }
  })

  it("cause shows the universal lock label", () => {
    renderScene(causeScene, "arriving")
    expect(screen.getByText("Pledge your favourite")).toBeInTheDocument()
  })

  it("shows the cause reveal text when unlocked", () => {
    renderScene(causeScene, "note")
    const reveals = screen.getAllByTestId("poll-reveal")
    expect(reveals[0]).toHaveTextContent(causeScene.poll.personal_note)
  })

  it("fundraiser keeps its protagonist — avatar shown, universal lock label", () => {
    renderScene(fundraiserScene, "arriving")
    expect(screen.getByTestId("protagonist-avatar")).toBeInTheDocument()
    expect(screen.getByText("Pledge your favourite")).toBeInTheDocument()
  })
})

describe("LandingHero — compact (the register pages)", () => {
  // The founder's call of 2026-10-15: with home carrying the full-screen
  // poster, a register page's band takes its height from its content and
  // the phone holds the md scale, so how-it-works reaches the fold.
  it("drops the viewport floor and holds the phone at the small step", () => {
    const { container } = render(
      <LandingHero sceneKind="memorial" still compact hideStats />
    )
    const band = container.querySelector("section")
    expect(band?.className).not.toContain("min-h-[calc(100vh-3.5rem)]")
    expect(container.querySelector(".h-\\[451px\\]")).not.toBeNull()
    expect(container.querySelector(".lg\\:h-\\[608px\\]")).toBeNull()
  })

  it("keeps the viewport floor and the full phone ramp without it", () => {
    const { container } = render(
      <LandingHero sceneKind="memorial" still hideStats />
    )
    expect(container.querySelector("section")?.className).toContain(
      "min-h-[calc(100vh-3.5rem)]"
    )
    expect(container.querySelector(".lg\\:h-\\[608px\\]")).not.toBeNull()
  })
})

// ── RotatingRegisterHero ──────────────────────────────────────────────────────
// The home hero since 2026-10-15: the three register heroes, unchanged, in
// one grid cell, crossfaded. These pin the contract, not the look: every
// slide is laid out, exactly one is live, back/next move it by hand and
// restart the dwell, and the rotation never starts under reduced motion.
describe("RotatingRegisterHero", () => {
  const slides = () =>
    Array.from(
      document.querySelectorAll<HTMLElement>('[aria-roledescription="slide"]')
    )
  const live = () =>
    slides().filter((s) => s.getAttribute("aria-hidden") !== "true")

  function stubMotion(reduced: boolean) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: reduced && query.includes("reduce"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  }

  beforeEach(() => {
    vi.useFakeTimers()
    stubMotion(false)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("lays out all three register heroes and keeps exactly one live", () => {
    render(<RotatingRegisterHero />)
    const all = slides()
    expect(all).toHaveLength(3)
    expect(all.map((s) => s.dataset.register)).toEqual([
      "memorial",
      "celebration",
      "fundraiser",
    ])
    // Each slide carries its register's own headline, as the register page does.
    // The headline is two spans, so match the eyebrow and the register's
    // own second sentence rather than the line across the span break.
    expect(all[0].textContent).toContain("Honour them")
    expect(all[0].textContent).toContain("in their memory.")
    expect(all[1].textContent).toContain("Celebrate them")
    expect(all[1].textContent).toContain("in their name.")
    expect(all[2].textContent).toContain("For your cause")
    expect(all[2].textContent).toContain("in support of the cause.")
    expect(live().map((s) => s.dataset.register)).toEqual(["memorial"])
    expect(all[0].hasAttribute("inert")).toBe(false)
    expect(all[1].hasAttribute("inert")).toBe(true)
  })

  it("advances on its own after the dwell", () => {
    render(<RotatingRegisterHero />)
    act(() => {
      vi.advanceTimersByTime(DWELL_MS)
    })
    expect(live().map((s) => s.dataset.register)).toEqual(["celebration"])
    act(() => {
      vi.advanceTimersByTime(DWELL_MS * 2)
    })
    // Wraps: fundraiser, then back to memorial.
    expect(live().map((s) => s.dataset.register)).toEqual(["memorial"])
  })

  it("next and back move it by hand, wrapping both ways", () => {
    render(<RotatingRegisterHero />)
    fireEvent.click(
      screen.getByRole("button", { name: "Previous kind of favpoll" })
    )
    expect(live().map((s) => s.dataset.register)).toEqual(["fundraiser"])
    fireEvent.click(
      screen.getByRole("button", { name: "Next kind of favpoll" })
    )
    fireEvent.click(
      screen.getByRole("button", { name: "Next kind of favpoll" })
    )
    expect(live().map((s) => s.dataset.register)).toEqual(["celebration"])
  })

  it("a manual move restarts the dwell from that slide, and the rotation goes on", () => {
    render(<RotatingRegisterHero />)
    act(() => {
      vi.advanceTimersByTime(DWELL_MS - 1000)
    })
    fireEvent.click(
      screen.getByRole("button", { name: "Next kind of favpoll" })
    )
    expect(live().map((s) => s.dataset.register)).toEqual(["celebration"])
    // The old tick (1s away) must not fire; the new slide gets its full dwell.
    act(() => {
      vi.advanceTimersByTime(DWELL_MS - 1000)
    })
    expect(live().map((s) => s.dataset.register)).toEqual(["celebration"])
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(live().map((s) => s.dataset.register)).toEqual(["fundraiser"])
  })

  it("publishes the register on show to the header, and withdraws it on unmount", () => {
    const { unmount } = render(<RotatingRegisterHero />)
    // jsdom has no IntersectionObserver: the hero counts as in view.
    expect(getHeroRegister()).toBe("memorial")
    fireEvent.click(
      screen.getByRole("button", { name: "Next kind of favpoll" })
    )
    expect(getHeroRegister()).toBe("celebration")
    unmount()
    expect(getHeroRegister()).toBeUndefined()
  })

  it("never starts under prefers-reduced-motion", () => {
    stubMotion(true)
    render(<RotatingRegisterHero />)
    act(() => {
      vi.advanceTimersByTime(DWELL_MS * 3)
    })
    expect(live().map((s) => s.dataset.register)).toEqual(["memorial"])
  })
})
