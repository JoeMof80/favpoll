import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
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
    motion: { div },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  }
})

// ── Sub-component stubs ───────────────────────────────────────────────────────
vi.mock("@/components/favpoll-card/poll-reveal", () => ({
  PollReveal: ({ personalReveal }: { personalReveal: string }) => (
    <blockquote data-testid="poll-reveal">{personalReveal}</blockquote>
  ),
}))

vi.mock("@/components/favpoll-hero-avatar", () => ({
  ProtagonistAvatar: () => <div data-testid="protagonist-avatar" />,
}))

// Stubs expose draftIds.length via data-draft-count so we can assert the
// "no chip in search bar" invariant without the real Chip implementation.
vi.mock("@/components/pledge-dialog/step-pick-favourites", () => ({
  PickerHeader: ({
    topicTitle,
    draftIds,
  }: {
    topicTitle: string
    draftIds: string[]
  }) => (
    <div data-testid="picker-header" data-draft-count={String(draftIds.length)}>
      Choose your favourite {topicTitle}
    </div>
  ),
  PickerItems: ({ draftIds }: { draftIds: string[] }) => (
    <div
      data-testid="picker-items"
      data-draft-count={String(draftIds.length)}
    />
  ),
}))

vi.mock("@/components/pledge-dialog/step-amount", () => ({
  StepAmount: () => <div data-testid="step-amount" />,
}))

import { DemoCard } from "../demo-card"
import { HeroDemoPanel } from "../index"
import { SCENES } from "../scenes"

// ── Fixtures ──────────────────────────────────────────────────────────────────

// Page-copy verbatim — keep in sync with LOCK_CARD_COPY in demo-card.tsx.
const LOCK_CARD_COPY =
  "Pledge to see the reveal — and how the pledges are landing."

const DECOY_WIDTHS = [85, 62, 48, 33, 19]

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

  it("the reveal is blurred and aria-hidden when locked", () => {
    const { container } = renderCard("arriving")
    const blurred = container.querySelector(".blur-xs")
    expect(blurred).toBeInTheDocument()
    expect(blurred).toHaveAttribute("aria-hidden", "true")
  })

  it("About text is present via reserve copy in a locked phase", () => {
    renderCard("arriving")
    // The reserve <p> always carries the full About text (the typed copy starts
    // as NBSP). getByText traverses textContent regardless of aria-hidden.
    const aboutEls = screen.getAllByText(scene.protagonist.about, {
      exact: false,
    })
    expect(aboutEls.length).toBeGreaterThanOrEqual(1)
  })
})

// ── Unlocked phases ───────────────────────────────────────────────────────────

const UNLOCKED_PHASES: Phase[] = ["clearing", "results", "reveal"]

describe("DemoCard — unlocked phases", () => {
  it.each(UNLOCKED_PHASES)("lock card is absent in '%s' phase", (phase) => {
    renderCard(phase, realWidths)
    expect(screen.queryByText(LOCK_CARD_COPY)).toBeNull()
  })

  it("no blur-xs present when unlocked", () => {
    const { container } = renderCard("reveal", realWidths)
    expect(container.querySelector(".blur-xs")).toBeNull()
  })

  it.each(UNLOCKED_PHASES)(
    "reveal text accessible via reserve copy in '%s' phase",
    (phase) => {
      renderCard(phase, realWidths)
      // Two PollReveal nodes render when unlocked: an invisible reserve (full
      // text, always present) and a typed copy (fills via setInterval — starts
      // as NBSP in synchronous tests). The reserve is first in DOM order.
      const reveals = screen.getAllByTestId("poll-reveal")
      expect(reveals.length).toBeGreaterThanOrEqual(2)
      expect(reveals[0]).toHaveTextContent(scene.poll.personal_reveal)
    }
  )
})

// ── Topic pill (merged header + pledge trigger) ───────────────────────────────

describe("DemoCard — topic pill", () => {
  it("renders 'Favourite {topic}' in every phase", () => {
    for (const phase of [...LOCKED_PHASES, ...UNLOCKED_PHASES]) {
      const { unmount } = renderCard(phase)
      expect(
        screen.getByText(`Favourite ${scene.poll.topic.title}`)
      ).toBeInTheDocument()
      unmount()
    }
  })

  it("uses default variant (bg-primary) throughout — never secondary", () => {
    for (const phase of [...LOCKED_PHASES, ...UNLOCKED_PHASES]) {
      const { unmount } = renderCard(phase)
      const pill = screen
        .getByText(`Favourite ${scene.poll.topic.title}`)
        .closest("button")
      expect(pill).toHaveAttribute("data-variant", "default")
      unmount()
    }
  })

  it("shows hover ring on trigger-hover phase", () => {
    renderCard("trigger-hover")
    const pill = screen
      .getByText(`Favourite ${scene.poll.topic.title}`)
      .closest("button")
    expect(pill?.className).toMatch(/ring-2/)
  })

  it("shows press scale on triggering phase", () => {
    renderCard("triggering")
    const pill = screen
      .getByText(`Favourite ${scene.poll.topic.title}`)
      .closest("button")
    expect(pill?.className).toMatch(/scale-\[0\.98\]/)
  })
})

// ── Decoy vs real bar widths ──────────────────────────────────────────────────

describe("DemoCard — bar widths", () => {
  it("renders bars at decoy widths when locked", () => {
    const { container } = renderCard("arriving", DECOY_WIDTHS)
    const barFills = container.querySelectorAll(
      'ol[aria-label="Current rankings"] [role="presentation"] > div'
    )
    expect(barFills[0]).toHaveStyle({ width: "85%" })
    expect(barFills[1]).toHaveStyle({ width: "62%" })
  })

  it("renders bars at real widths when unlocked", () => {
    const { container } = renderCard("reveal", realWidths)
    const barFills = container.querySelectorAll(
      'ol[aria-label="Current rankings"] [role="presentation"] > div'
    )
    expect(barFills[0]).toHaveStyle({ width: `${realWidths[0]}%` })
    expect(barFills[1]).toHaveStyle({ width: `${realWidths[1]}%` })
  })
})

// ── Dialog mimics ─────────────────────────────────────────────────────────────

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

  it("picker header receives empty draftIds in all picker phases (no chip in search bar)", () => {
    const pickerPhases: Phase[] = [
      "picking",
      "selected",
      "next-hover",
      "next-pressed",
    ]
    for (const phase of pickerPhases) {
      const { unmount } = renderCard(phase)
      expect(screen.getByTestId("picker-header")).toHaveAttribute(
        "data-draft-count",
        "0"
      )
      unmount()
    }
  })

  it("picker items receive real draftIds in selected phase (grid highlights)", () => {
    renderCard("selected")
    // One favourite selected → draftIds passed to PickerItems has length 1
    expect(screen.getByTestId("picker-items")).toHaveAttribute(
      "data-draft-count",
      "1"
    )
  })

  it("Next uses secondary variant while browsing (picking), default once selected", () => {
    const { unmount: u1 } = renderCard("picking")
    const nextBrowsing = screen.getAllByRole("button", {
      name: /^Next/,
      hidden: true,
    })
    expect(nextBrowsing[nextBrowsing.length - 1]).toHaveAttribute(
      "data-variant",
      "secondary"
    )
    u1()

    const { unmount: u2 } = renderCard("selected")
    const nextSelected = screen.getAllByRole("button", {
      name: /^Next/,
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

  it("Pledge uses secondary variant (no amount chosen) in pledge-panel phase", () => {
    renderCard("pledge-panel")
    const pledgeBtns = screen.getAllByRole("button", {
      name: /^Pledge$/,
      hidden: true,
    })
    const liveBtn = pledgeBtns[pledgeBtns.length - 1]
    expect(liveBtn).toHaveAttribute("data-variant", "secondary")
  })

  it("Pledge uses default variant (amount picked, Pledge enabled) in amount-picked phase", () => {
    renderCard("amount-picked")
    const pledgeBtns = screen.getAllByRole("button", {
      name: /^Pledge$/,
      hidden: true,
    })
    const liveBtn = pledgeBtns[pledgeBtns.length - 1]
    expect(liveBtn).toHaveAttribute("data-variant", "default")
  })

  it("shows confirmation tick and amount in confirmed phase", () => {
    renderCard("confirmed")
    expect(screen.getByText("Pledge confirmed")).toBeInTheDocument()
    expect(
      screen.getByText(`${scene.pledgeAmount} for ${scene.charities[0].name}`)
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
    renderCard("reveal", realWidths)
    expect(screen.getByText(charity.name)).toBeInTheDocument()
  })

  it("renders the charity registration number", () => {
    renderCard("reveal", realWidths)
    expect(
      screen.getByText(`Charity no. ${charity.registered_number}`)
    ).toBeInTheDocument()
  })

  it("renders the GBP-formatted total raised", () => {
    renderCard("reveal", realWidths)
    // scene.total = "£1,005" → raisedNum = 1005 → GBP.format(1005) = "£1,005"
    expect(screen.getByText(scene.total)).toBeInTheDocument()
  })
})

// ── Reduced motion ────────────────────────────────────────────────────────────

describe("HeroDemoPanel — reduced motion", () => {
  beforeEach(() => {
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

  it("renders the resolved reveal state — no lock card, no blur", () => {
    const { container } = render(<HeroDemoPanel />)
    // Phase stays at 'reveal' — the loop never fires.
    expect(screen.queryByText(LOCK_CARD_COPY)).toBeNull()
    expect(container.querySelector(".blur-xs")).toBeNull()
  })

  it("shows the real reveal text in the resolved state", () => {
    render(<HeroDemoPanel />)
    // With prefersReducedMotion=true, useTyped returns full text immediately,
    // so both the reserve and typed PollReveal nodes carry the full text.
    const reveals = screen.getAllByTestId("poll-reveal")
    expect(reveals.length).toBeGreaterThanOrEqual(1)
    expect(reveals[0]).toHaveTextContent(SCENES[0].poll.personal_reveal)
  })
})
