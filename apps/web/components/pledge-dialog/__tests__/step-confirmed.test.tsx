import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, act, fireEvent } from "@testing-library/react"
import { StepConfirmed, CEREMONY_MS } from "../step-confirmed"

// THE CEREMONY'S THREE PROMISES (2026-10-22). StepConfirmed is the terminal
// view of the pledge sheet and takes no part in the step machine, so nothing
// else enforces its timing. Three things it owes the reader:
//
//   the note sits at the optical centre, which the invisible head mirror is
//     the only thing holding;
//   nobody is held behind their own pledge — any tap or key ends it;
//   an untouched screen ends on its own.
//
// The fourth test is the regression guard. The caller re-renders while the
// note types (the page is unlocking behind the sheet), so a fresh `onDone`
// arrives mid-flight. Held in a dep array instead of a ref, that restarted
// the clock on every render and the sheet never left — the same shape as the
// climb's latched flag in ranking-list/__tests__/climb.test.tsx.

const props = {
  note: "Cornflower blue. She kept a pot of them on the windowsill.",
  protagonistFirstName: "Belinda",
  topicTitle: "Colour",
}

describe("StepConfirmed", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it("centres the note by mirroring the head, and shows the topic", () => {
    const { container } = render(<StepConfirmed {...props} onDone={vi.fn()} />)

    // Two heads: the real one at the top and an invisible copy closing the
    // sheet. Without the mirror the middle band centres against the height
    // left under the head, which drops the note by a head's height. Delete
    // the mirror and this fails.
    expect(container.textContent).toContain("Pledge confirmed")
    // :scope > — the mirror is a BAND of the sheet. TypedNote renders its own
    // invisible height reserve deeper in the tree, and a loose selector finds
    // that one instead and passes while the mirror is gone.
    const mirror = container.firstElementChild?.querySelector(
      ":scope > .invisible"
    )
    expect(mirror?.textContent).toContain("Pledge confirmed")

    // The topic in PollHeading's two-line grammar, not an eyebrow.
    expect(container.textContent).toContain("Favourite")
    expect(container.textContent).toContain("Colour")
  })

  it("ends on its own after the hold, and not before", () => {
    const onDone = vi.fn()
    render(<StepConfirmed {...props} onDone={onDone} />)

    act(() => void vi.advanceTimersByTime(CEREMONY_MS - 1))
    expect(onDone).not.toHaveBeenCalled()

    act(() => void vi.advanceTimersByTime(1))
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it("ends on a tap anywhere, without waiting out the hold", () => {
    const onDone = vi.fn()
    const { container } = render(<StepConfirmed {...props} onDone={onDone} />)

    act(() => void vi.advanceTimersByTime(200))
    fireEvent.click(container.firstChild as HTMLElement)

    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it("ends on any key", () => {
    const onDone = vi.fn()
    render(<StepConfirmed {...props} onDone={onDone} />)

    act(() => void vi.advanceTimersByTime(200))
    fireEvent.keyDown(window, { key: "a" })

    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it("does not restart the clock when onDone changes mid-flight", () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<StepConfirmed {...props} onDone={first} />)

    // The page unlocks behind the sheet and the caller re-renders with a new
    // callback identity, twice, while the note is still typing.
    act(() => void vi.advanceTimersByTime(CEREMONY_MS / 2))
    rerender(<StepConfirmed {...props} onDone={second} />)
    act(() => void vi.advanceTimersByTime(100))
    rerender(<StepConfirmed {...props} onDone={second} />)

    // The clock still runs from the original mount...
    act(() => void vi.advanceTimersByTime(CEREMONY_MS / 2 - 100))
    expect(second).toHaveBeenCalledTimes(1)
    // ...and it is the LATEST callback that gets it, not the stale one.
    expect(first).not.toHaveBeenCalled()
  })
})
