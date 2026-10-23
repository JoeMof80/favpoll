import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, act } from "@testing-library/react"
import type { Favourite } from "@favpoll/types"
import { RankingList } from "../index"

// THE CLIMB AFTER A PLEDGE (2026-10-22). The bars never climbed on the real
// page: RankingList is not mounted pre-pledge and a CSS transition does not
// run on first paint, so the first painted width was the final width.
//
// The subtle half, and the reason this file exists: the list MOUNTS while the
// pledge sheet is still up — the page unlocks behind it — so `climb` is false
// at mount and turns true later, when the sheet leaves. A flag seeded from
// `climb` at mount latched true and the climb never ran at all. It is derived
// now, so the frame in which `climb` turns true already paints zero.

const items = [
  { id: "a", label: "Black", all_time_pledged: 100, all_time_count: 4 },
  { id: "b", label: "Blue", all_time_pledged: 50, all_time_count: 2 },
] as unknown as Favourite[]

const widths = (c: HTMLElement) =>
  Array.from(c.querySelectorAll<HTMLElement>("[style*='width']")).map(
    (el) => el.style.width
  )

function stubMotion(reduced: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((q: string) => ({
      matches: reduced && q.includes("reduce"),
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  })
}

describe("RankingList — the climb", () => {
  let frames: FrameRequestCallback[] = []
  beforeEach(() => {
    stubMotion(false)
    frames = []
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      frames.push(cb)
      return frames.length
    })
    vi.stubGlobal("cancelAnimationFrame", () => {})
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const flush = () => {
    // Two frames: the browser has to paint the zero before the change to the
    // real width counts as a transition.
    for (let i = 0; i < 2; i++) {
      const due = frames
      frames = []
      act(() => due.forEach((cb) => cb(0)))
    }
  }

  it("does not climb when it is not asked to", () => {
    const { container } = render(
      <RankingList initialItems={items} favpollPollId="p" topicId="t" />
    )
    expect(widths(container).every((w) => w !== "0%")).toBe(true)
  })

  it("climbs from zero when climb turns true AFTER mount — the sheet leaving", () => {
    const { container, rerender } = render(
      <RankingList
        initialItems={items}
        favpollPollId="p"
        topicId="t"
        climb={false}
      />
    )
    // Mounted behind the sheet: full width, nothing playing.
    expect(widths(container)).not.toContain("0%")

    rerender(
      <RankingList initialItems={items} favpollPollId="p" topicId="t" climb />
    )
    // The very frame climb turns true paints zero — no flicker of full width.
    expect(widths(container).every((w) => w === "0%")).toBe(true)

    flush()
    expect(widths(container).some((w) => w === "100%")).toBe(true)
  })

  it("climbs when climb is already true at mount — no ceremony ran", () => {
    const { container } = render(
      <RankingList initialItems={items} favpollPollId="p" topicId="t" climb />
    )
    expect(widths(container).every((w) => w === "0%")).toBe(true)
    flush()
    expect(widths(container).some((w) => w === "100%")).toBe(true)
  })

  it("under reduced motion the bars are simply there", () => {
    stubMotion(true)
    const { container } = render(
      <RankingList initialItems={items} favpollPollId="p" topicId="t" climb />
    )
    act(() => {})
    expect(widths(container).some((w) => w === "100%")).toBe(true)
  })
})
