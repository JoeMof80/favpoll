import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

// Stub framer-motion — animations don't run in jsdom but the components still
// render, so we just need passthrough elements to assert on the DOM.
vi.mock("framer-motion", () => {
  const div = ({
    children,
    animate: _a,
    initial: _i,
    exit: _e,
    transition: _t,
    style,
    className,
    ...rest
  }: any) => (
    <div style={style} className={className} {...rest}>
      {children}
    </div>
  )
  return {
    motion: { div },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useScroll: () => ({ scrollY: { get: () => 0, on: () => () => {} } }),
    useTransform: (_: any, __: any, values: any) => values?.[0] ?? 0,
  }
})

import { HeroDemoPanel } from "../index"
import { DemoCard } from "../demo-card"
import { SCENES } from "../scenes"

// window.matchMedia is stubbed in tests/setup.ts to return matches: false
// (i.e. does NOT prefer reduced motion). Override it where needed.
function mockReducedMotion(enabled: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: enabled && query.includes("reduce"),
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

// ─── DemoCard in reveal state ──────────────────────────────────────────────

describe("DemoCard — reveal phase", () => {
  const scene = SCENES[0]
  const barWidths = scene.results.map((r) => r.widthPercent)

  it("renders the protagonist's personal reveal text", () => {
    render(
      <DemoCard
        scene={scene}
        phase="reveal"
        barWidths={barWidths}
        prefersReducedMotion={false}
        showOptions={false}
        showPledgePanel={false}
        showToast={false}
        showResults={true}
        showReveal={true}
      />
    )
    expect(screen.getByText(scene.poll.personal_reveal)).toBeInTheDocument()
  })

  it("renders ranking bars for each result entry", () => {
    render(
      <DemoCard
        scene={scene}
        phase="reveal"
        barWidths={barWidths}
        prefersReducedMotion={false}
        showOptions={false}
        showPledgePanel={false}
        showToast={false}
        showResults={true}
        showReveal={true}
      />
    )
    for (const result of scene.results) {
      expect(screen.getByText(result.label)).toBeInTheDocument()
    }
  })
})

// ─── DemoCard in results-only phase (before reveal) ───────────────────────

describe("DemoCard — results phase (before personal reveal)", () => {
  const scene = SCENES[0]
  const barWidths = scene.results.map((r) => r.widthPercent)

  it("renders ranking bars", () => {
    render(
      <DemoCard
        scene={scene}
        phase="results"
        barWidths={barWidths}
        prefersReducedMotion={false}
        showOptions={false}
        showPledgePanel={false}
        showToast={false}
        showResults={true}
        showReveal={false}
      />
    )
    expect(screen.getByText(scene.results[0].label)).toBeInTheDocument()
  })

  it("does not render the personal reveal text yet", () => {
    render(
      <DemoCard
        scene={scene}
        phase="results"
        barWidths={barWidths}
        prefersReducedMotion={false}
        showOptions={false}
        showPledgePanel={false}
        showToast={false}
        showResults={true}
        showReveal={false}
      />
    )
    expect(
      screen.queryByText(scene.poll.personal_reveal)
    ).not.toBeInTheDocument()
  })
})

// ─── HeroDemoPanel initial state ───────────────────────────────────────────

describe("HeroDemoPanel — initial render", () => {
  beforeEach(() => mockReducedMotion(false))

  it("shows the personal reveal on first paint without waiting for the loop", () => {
    render(<HeroDemoPanel />)
    // The first scene's reveal must be immediately visible — no timer needed.
    expect(screen.getByText(SCENES[0].poll.personal_reveal)).toBeInTheDocument()
  })

  it("shows ranking bar labels on first paint", () => {
    render(<HeroDemoPanel />)
    expect(screen.getByText(SCENES[0].results[0].label)).toBeInTheDocument()
  })

  it("does not show the options (chip) grid on first paint", () => {
    render(<HeroDemoPanel />)
    // "Gold" appears in the colour chip list but not in the results — so its
    // presence would indicate the chip grid is rendered (it shouldn't be).
    const goldChip = SCENES[0].poll.topic.favourites.find(
      (f) => f.label === "Gold"
    )
    expect(goldChip).toBeDefined()
    expect(screen.queryByText("Gold")).not.toBeInTheDocument()
  })
})

// ─── HeroDemoPanel with prefers-reduced-motion ────────────────────────────

describe("HeroDemoPanel — prefers-reduced-motion", () => {
  beforeEach(() => mockReducedMotion(true))

  it("renders the reveal in a static state", () => {
    render(<HeroDemoPanel />)
    expect(screen.getByText(SCENES[0].poll.personal_reveal)).toBeInTheDocument()
  })

  it("does not schedule any timeouts (loop does not run)", () => {
    vi.useFakeTimers()
    render(<HeroDemoPanel />)
    // With reduced motion the useEffect returns early, so no state changes fire.
    // Advancing time should not change what is rendered.
    vi.advanceTimersByTime(30000)
    expect(screen.getByText(SCENES[0].poll.personal_reveal)).toBeInTheDocument()
    vi.useRealTimers()
  })
})

// ─── No Supabase dependency ────────────────────────────────────────────────

describe("HeroDemoPanel — data source", () => {
  it("renders successfully without any Supabase client being available", async () => {
    // If the component attempted a DB fetch, it would throw because no client
    // is configured in the test environment. A clean render is proof enough.
    expect(() => render(<HeroDemoPanel />)).not.toThrow()
  })
})
