import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { usePollSection } from "@/components/poll-section/use-poll-section"

const defaults = {
  pollId: "poll-1",
  hasPledged: false,
  isClosed: false,
  onSelectionsChange: vi.fn(),
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("usePollSection — initial view", () => {
  it("starts in 'pledge' view when not pledged and not closed", () => {
    const { result } = renderHook(() => usePollSection(defaults))
    expect(result.current.view).toBe("pledge")
  })

  it("starts in 'results' view when hasPledged is true", () => {
    const { result } = renderHook(() =>
      usePollSection({ ...defaults, hasPledged: true })
    )
    expect(result.current.view).toBe("results")
  })

  it("starts in 'results' view when isClosed is true", () => {
    const { result } = renderHook(() =>
      usePollSection({ ...defaults, isClosed: true })
    )
    expect(result.current.view).toBe("results")
  })

  it("starts with pledgeConfirmed matching hasPledged", () => {
    const { result: r1 } = renderHook(() => usePollSection(defaults))
    expect(r1.current.pledgeConfirmed).toBe(false)

    const { result: r2 } = renderHook(() =>
      usePollSection({ ...defaults, hasPledged: true })
    )
    expect(r2.current.pledgeConfirmed).toBe(true)
  })

  it("starts with rankingView as 'amount'", () => {
    const { result } = renderHook(() => usePollSection(defaults))
    expect(result.current.rankingView).toBe("amount")
  })

  it("starts with showRankings as true", () => {
    const { result } = renderHook(() => usePollSection(defaults))
    expect(result.current.showRankings).toBe(true)
  })
})

describe("usePollSection — pledgeJustConfirmed reveal", () => {
  it("transitions to 'results' view when pledgeJustConfirmed becomes true", () => {
    const { result, rerender } = renderHook(
      ({ confirmed }: { confirmed: boolean }) =>
        usePollSection({ ...defaults, pledgeJustConfirmed: confirmed }),
      { initialProps: { confirmed: false } }
    )
    expect(result.current.view).toBe("pledge")

    rerender({ confirmed: true })
    expect(result.current.view).toBe("results")
    expect(result.current.pledgeConfirmed).toBe(true)
  })

  it("hides rankings immediately on confirm then shows them after 300ms", () => {
    const { result, rerender } = renderHook(
      ({ confirmed }: { confirmed: boolean }) =>
        usePollSection({ ...defaults, pledgeJustConfirmed: confirmed }),
      { initialProps: { confirmed: false } }
    )

    rerender({ confirmed: true })
    expect(result.current.showRankings).toBe(false)

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.showRankings).toBe(true)
  })

  it("does not re-trigger reveal if pledgeJustConfirmed fires again", () => {
    const { result, rerender } = renderHook(
      ({ confirmed }: { confirmed: boolean }) =>
        usePollSection({ ...defaults, pledgeJustConfirmed: confirmed }),
      { initialProps: { confirmed: false } }
    )

    rerender({ confirmed: true })
    act(() => { vi.advanceTimersByTime(300) })

    // Manually switch back to pledge, simulate a second confirm signal
    act(() => { result.current.setView("pledge") })
    rerender({ confirmed: true }) // still true — no new transition

    // view should stay at "pledge" (reveal guard is locked after first fire)
    expect(result.current.view).toBe("pledge")
  })
})

describe("usePollSection — hasPledged fallback reveal", () => {
  it("transitions to 'results' when hasPledged flips from false to true", () => {
    const { result, rerender } = renderHook(
      ({ pledged }: { pledged: boolean }) =>
        usePollSection({ ...defaults, hasPledged: pledged }),
      { initialProps: { pledged: false } }
    )
    expect(result.current.view).toBe("pledge")

    rerender({ pledged: true })
    expect(result.current.view).toBe("results")
    expect(result.current.pledgeConfirmed).toBe(true)
  })

  it("does not trigger when hasPledged starts true and stays true", () => {
    const { result, rerender } = renderHook(
      ({ pledged }: { pledged: boolean }) =>
        usePollSection({ ...defaults, hasPledged: pledged }),
      { initialProps: { pledged: true } }
    )
    const viewBefore = result.current.view
    rerender({ pledged: true })
    expect(result.current.view).toBe(viewBefore)
  })
})

describe("usePollSection — setters", () => {
  it("setView changes the view", () => {
    const { result } = renderHook(() => usePollSection(defaults))
    act(() => { result.current.setView("results") })
    expect(result.current.view).toBe("results")
  })

  it("setRankingView changes the rankingView", () => {
    const { result } = renderHook(() => usePollSection(defaults))
    act(() => { result.current.setRankingView("count") })
    expect(result.current.rankingView).toBe("count")
  })
})

describe("usePollSection — handleSelectionsChange", () => {
  it("calls onSelectionsChange with the pollId and selectedIds", () => {
    const onSelectionsChange = vi.fn()
    const { result } = renderHook(() =>
      usePollSection({ ...defaults, pollId: "poll-99", onSelectionsChange })
    )
    act(() => {
      result.current.handleSelectionsChange(["item-a", "item-b"])
    })
    expect(onSelectionsChange).toHaveBeenCalledWith("poll-99", ["item-a", "item-b"])
  })

  it("uses the current pollId even after multiple renders", () => {
    const onSelectionsChange = vi.fn()
    const { result } = renderHook(() =>
      usePollSection({ ...defaults, pollId: "poll-1", onSelectionsChange })
    )
    act(() => { result.current.handleSelectionsChange(["x"]) })
    expect(onSelectionsChange).toHaveBeenCalledWith("poll-1", ["x"])
  })
})
