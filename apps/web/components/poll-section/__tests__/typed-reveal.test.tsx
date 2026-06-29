import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, act } from "@testing-library/react"

vi.mock("@/components/favpoll-card/poll-reveal", () => ({
  PollReveal: ({
    personalReveal,
    role,
    "aria-live": ariaLive,
  }: {
    personalReveal: string
    role?: string
    "aria-live"?: string
  }) => (
    <blockquote data-testid="poll-reveal" role={role} aria-live={ariaLive}>
      {personalReveal}
    </blockquote>
  ),
}))

import { TypedReveal } from "../typed-reveal"

const FULL_TEXT =
  "Belinda said: My favourite colour was purple. I wore it to every occasion that mattered."
const FIRST_NAME = "Belinda"

function mockMatchMedia(prefersReduced: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({ matches: prefersReduced }),
  })
}

describe("TypedReveal — active=false (non-animated path)", () => {
  beforeEach(() => mockMatchMedia(false))

  it("renders the full text immediately via PollReveal", () => {
    render(
      <TypedReveal
        text={FULL_TEXT}
        active={false}
        protagonistFirstName={FIRST_NAME}
      />
    )
    expect(screen.getByTestId("poll-reveal")).toHaveTextContent(FULL_TEXT)
  })

  it("PollReveal carries role=status and aria-live=polite", () => {
    render(
      <TypedReveal
        text={FULL_TEXT}
        active={false}
        protagonistFirstName={FIRST_NAME}
      />
    )
    const el = screen.getByTestId("poll-reveal")
    expect(el).toHaveAttribute("role", "status")
    expect(el).toHaveAttribute("aria-live", "polite")
  })

  it("no aria-hidden typing copy is present", () => {
    const { container } = render(
      <TypedReveal
        text={FULL_TEXT}
        active={false}
        protagonistFirstName={FIRST_NAME}
      />
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })
})

describe("TypedReveal — active=true (animated path)", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockMatchMedia(false)
  })
  afterEach(() => vi.useRealTimers())

  it("starts with an empty typed copy (not the full text)", () => {
    const { container } = render(
      <TypedReveal
        text={FULL_TEXT}
        active={true}
        protagonistFirstName={FIRST_NAME}
      />
    )
    const typed = container.querySelector('[aria-hidden="true"]')
    // NBSP / space placeholder — definitely not the full reveal
    expect(typed?.textContent).not.toBe(FULL_TEXT)
  })

  it("exposes the full text to AT via sr-only immediately", () => {
    const { container } = render(
      <TypedReveal
        text={FULL_TEXT}
        active={true}
        protagonistFirstName={FIRST_NAME}
      />
    )
    const srEl = container.querySelector(".sr-only")
    expect(srEl).toHaveTextContent(FULL_TEXT)
    expect(srEl).toHaveAttribute("role", "status")
    expect(srEl).toHaveAttribute("aria-live", "polite")
  })

  it("types characters progressively as time advances", () => {
    const { container } = render(
      <TypedReveal
        text={FULL_TEXT}
        active={true}
        protagonistFirstName={FIRST_NAME}
      />
    )
    act(() => vi.advanceTimersByTime(300))
    const typed = container.querySelector('[aria-hidden="true"]')
    // Some characters but not all
    expect(typed?.textContent?.length).toBeGreaterThan(1)
    expect(typed?.textContent).not.toBe(FULL_TEXT)
  })

  it("completes the full text once all timers run", () => {
    const { container } = render(
      <TypedReveal
        text={FULL_TEXT}
        active={true}
        protagonistFirstName={FIRST_NAME}
      />
    )
    act(() => vi.runAllTimers())
    const typed = container.querySelector('[aria-hidden="true"]')
    expect(typed).toHaveTextContent(FULL_TEXT)
  })

  it("does not re-type when re-rendered with the same text", () => {
    const { container, rerender } = render(
      <TypedReveal
        text={FULL_TEXT}
        active={true}
        protagonistFirstName={FIRST_NAME}
      />
    )
    act(() => vi.runAllTimers())
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(
      FULL_TEXT
    )

    // Simulate a re-render triggered by e.g. RankingList realtime update
    rerender(
      <TypedReveal
        text={FULL_TEXT}
        active={true}
        protagonistFirstName={FIRST_NAME}
      />
    )
    // Text must remain full — the effect deps [text, shouldType] are unchanged,
    // so the interval must not have restarted.
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(
      FULL_TEXT
    )
  })

  it("the typed copy is aria-hidden (AT does not read each keystroke)", () => {
    const { container } = render(
      <TypedReveal
        text={FULL_TEXT}
        active={true}
        protagonistFirstName={FIRST_NAME}
      />
    )
    const typed = container.querySelector('[aria-hidden="true"]')
    expect(typed).not.toBeNull()
  })
})

describe("TypedReveal — reduced motion", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockMatchMedia(true) // prefers-reduced-motion: reduce
  })
  afterEach(() => vi.useRealTimers())

  it("renders full text immediately via PollReveal even when active=true", () => {
    render(
      <TypedReveal
        text={FULL_TEXT}
        active={true}
        protagonistFirstName={FIRST_NAME}
      />
    )
    expect(screen.getByTestId("poll-reveal")).toHaveTextContent(FULL_TEXT)
  })

  it("no aria-hidden typing copy present under reduced motion", () => {
    const { container } = render(
      <TypedReveal
        text={FULL_TEXT}
        active={true}
        protagonistFirstName={FIRST_NAME}
      />
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it("timers are never started (no interval side-effects)", () => {
    const setInterval = vi.spyOn(window, "setInterval")
    render(
      <TypedReveal
        text={FULL_TEXT}
        active={true}
        protagonistFirstName={FIRST_NAME}
      />
    )
    act(() => vi.runAllTimers())
    expect(setInterval).not.toHaveBeenCalled()
    setInterval.mockRestore()
  })
})
