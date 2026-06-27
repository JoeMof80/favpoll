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

vi.mock("@/components/pledge-dialog/step-pick-favourites", () => ({
  PickerHeader: ({ topicTitle }: { topicTitle: string }) => (
    <div data-testid="picker-header">Choose your favourite {topicTitle}</div>
  ),
  PickerItems: () => <div data-testid="picker-items" />,
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

const scene = SCENES[0] // Belinda · Colour
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

  it("the reveal+results wrapper is blurred and aria-hidden when locked", () => {
    const { container } = renderCard("arriving")
    const blurred = container.querySelector(".blur-xs")
    expect(blurred).toBeInTheDocument()
    expect(blurred).toHaveAttribute("aria-hidden", "true")
  })
})

// ── Unlocked phases ───────────────────────────────────────────────────────────

const UNLOCKED_PHASES: Phase[] = ["clearing", "results", "reveal"]

describe("DemoCard — unlocked phases", () => {
  it.each(UNLOCKED_PHASES)("lock card is absent in '%s' phase", (phase) => {
    renderCard(phase, realWidths)
    expect(screen.queryByText(LOCK_CARD_COPY)).not.toBeInTheDocument()
  })

  it("wrapper has no blur-xs and no aria-hidden when unlocked", () => {
    const { container } = renderCard("reveal", realWidths)
    expect(container.querySelector(".blur-xs")).not.toBeInTheDocument()
  })

  it.each(UNLOCKED_PHASES)(
    "real reveal text is visible in '%s' phase",
    (phase) => {
      renderCard(phase, realWidths)
      expect(screen.getByTestId("poll-reveal")).toHaveTextContent(
        scene.poll.personal_reveal
      )
    }
  )
})

// ── Topic pill (merged header + trigger) ──────────────────────────────────────

describe("DemoCard — topic pill", () => {
  it("renders 'FAVOURITE {topic}' in every phase", () => {
    for (const phase of [...LOCKED_PHASES, ...UNLOCKED_PHASES]) {
      const { unmount } = renderCard(phase)
      expect(
        screen.getByText(`Favourite ${scene.poll.topic.title}`)
      ).toBeInTheDocument()
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

  // shows amount step in pledge-panel phase
  it("shows amount step in pledge-panel phase", () => {
    renderCard("pledge-panel")
    // Two step-amount nodes exist (one in the hidden height measurer); the
    // visible one is the last in document order.
    const steps = screen.getAllByTestId("step-amount")
    expect(steps[steps.length - 1]).toBeInTheDocument()
  })

  // has opacity-50 (no amount) in pledge-panel phase
  it("Pledge button has opacity-50 (no amount) in pledge-panel phase", () => {
    renderCard("pledge-panel")
    const pledgeBtns = screen.getAllByRole("button", {
      name: /^Pledge$/,
      hidden: true,
    })
    const liveBtn = pledgeBtns[pledgeBtns.length - 1]
    expect(liveBtn.classList.contains("opacity-50")).toBe(true)
  })

  // lacks opacity-50 (amount picked) in amount-picked phase
  it("Pledge button lacks opacity-50 (amount picked) in amount-picked phase", () => {
    renderCard("amount-picked")
    const pledgeBtns = screen.getAllByRole("button", {
      name: /^Pledge$/,
      hidden: true,
    })
    const liveBtn = pledgeBtns[pledgeBtns.length - 1]
    expect(liveBtn.classList.contains("opacity-50")).toBe(false)
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
    expect(screen.queryByTestId("picker-header")).not.toBeInTheDocument()
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
    expect(screen.queryByText(LOCK_CARD_COPY)).not.toBeInTheDocument()
    expect(container.querySelector(".blur-xs")).not.toBeInTheDocument()
  })

  it("shows the real reveal text in the resolved state", () => {
    render(<HeroDemoPanel />)
    expect(screen.getByTestId("poll-reveal")).toHaveTextContent(
      SCENES[0].poll.personal_reveal
    )
  })
})
