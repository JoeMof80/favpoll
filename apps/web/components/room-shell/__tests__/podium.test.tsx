import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import type { Favourite } from "@favpoll/types"

vi.mock("@/components/landing/hero-texture", () => ({
  HeroTexture: () => null,
}))

import { Podium, podiumSteps, STEP_AT_MS, HOLD_MS } from "../podium"

const item = (label: string, pounds: number, count = 1) =>
  ({
    id: label,
    label,
    all_time_pledged: pounds,
    all_time_count: count,
  }) as Favourite

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

describe("podiumSteps", () => {
  it("takes the top three PLEDGED favourites, best first; unpledged never place", () => {
    const steps = podiumSteps([
      item("Beret", 45),
      item("Tokyo", 0, 0),
      item("Sombrero", 240),
      item("Fez", 150),
      item("Viking helmet", 190),
    ])
    expect(steps.map((s) => [s.rank, s.label, s.pounds])).toEqual([
      [1, "Sombrero", 240],
      [2, "Viking helmet", 190],
      [3, "Fez", 150],
    ])
  })

  it("is as short as the field: one pledged favourite is a one-step podium, none is no podium", () => {
    expect(podiumSteps([item("Beret", 45), item("Tokyo", 0, 0)])).toHaveLength(
      1
    )
    expect(podiumSteps([item("Tokyo", 0, 0)])).toHaveLength(0)
  })
})

describe("Podium", () => {
  const steps = podiumSteps([
    item("Sombrero", 240),
    item("Viking helmet", 190),
    item("Fez", 150),
  ])
  const shownRanks = () =>
    Array.from(document.querySelectorAll("[data-rank]"))
      .filter((el) => el.getAttribute("data-shown") === "true")
      .map((el) => Number(el.getAttribute("data-rank")))
      .sort()

  beforeEach(() => {
    vi.useFakeTimers()
    stubMotion(false)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("arrives bronze, silver, gold, then gives way after the hold", () => {
    const onDone = vi.fn()
    render(<Podium steps={steps} topicTitle="Marathon hat" onDone={onDone} />)
    expect(
      screen.getByRole("heading", { name: "Favourite Marathon hat" })
    ).toBeInTheDocument()
    expect(shownRanks()).toEqual([])
    act(() => vi.advanceTimersByTime(STEP_AT_MS[3]))
    expect(shownRanks()).toEqual([3])
    act(() => vi.advanceTimersByTime(STEP_AT_MS[2] - STEP_AT_MS[3]))
    expect(shownRanks()).toEqual([2, 3])
    act(() => vi.advanceTimersByTime(STEP_AT_MS[1] - STEP_AT_MS[2]))
    expect(shownRanks()).toEqual([1, 2, 3])
    // Gold carries the amount and the name.
    expect(screen.getByText("£240")).toBeInTheDocument()
    expect(screen.getByText("Sombrero")).toBeInTheDocument()
    expect(onDone).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(HOLD_MS - STEP_AT_MS[1]))
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it("the presenter can move on: a click or any key ends it early", () => {
    const onDone = vi.fn()
    render(<Podium steps={steps} topicTitle="Marathon hat" onDone={onDone} />)
    fireEvent.click(screen.getByTestId("podium"))
    expect(onDone).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(window, { key: "Enter" })
    expect(onDone).toHaveBeenCalledTimes(2)
  })

  it("under reduced motion all three stand at once", () => {
    stubMotion(true)
    render(<Podium steps={steps} topicTitle="Marathon hat" onDone={vi.fn()} />)
    expect(shownRanks()).toEqual([1, 2, 3])
  })
})
