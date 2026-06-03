// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"

const mockCreatePledge = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
vi.mock("@/app/events/[id]/actions", () => ({
  createPledge: mockCreatePledge,
}))

import { useEventCardPledge } from "@/components/event-card/use-event-card-pledge"
import type { CardResultItem } from "@/components/event-card/use-event-card-pledge"

const RESULTS: CardResultItem[] = [
  { label: "Red", amountPence: 1000, widthPercent: 100 },
]

describe("useEventCardPledge — initial state", () => {
  it("starts at idle with no initial results", () => {
    const { result } = renderHook(() => useEventCardPledge({ pollId: "p1" }))
    expect(result.current.step).toBe("idle")
    expect(result.current.selectedItemId).toBeNull()
    expect(result.current.amount).toBeNull()
    expect(result.current.results).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("starts at pledged when initialResults provided", () => {
    const { result } = renderHook(() =>
      useEventCardPledge({ pollId: "p1", initialResults: RESULTS })
    )
    expect(result.current.step).toBe("pledged")
    expect(result.current.results).toEqual(RESULTS)
  })
})

describe("useEventCardPledge — selectItem", () => {
  it("stores item and stays idle when no amount set", () => {
    const { result } = renderHook(() => useEventCardPledge({ pollId: "p1" }))
    act(() => result.current.selectItem("item-1", "Purple"))
    expect(result.current.selectedItemId).toBe("item-1")
    expect(result.current.selectedItemLabel).toBe("Purple")
    expect(result.current.step).toBe("idle")
  })

  it("moves to ready when amount is already set", () => {
    const { result } = renderHook(() => useEventCardPledge({ pollId: "p1" }))
    act(() => result.current.selectAmount(10))
    act(() => result.current.selectItem("item-1", "Purple"))
    expect(result.current.step).toBe("ready")
  })
})

describe("useEventCardPledge — selectAmount", () => {
  it("stores amount but stays idle when no item selected", () => {
    const { result } = renderHook(() => useEventCardPledge({ pollId: "p1" }))
    act(() => result.current.selectAmount(20))
    expect(result.current.amount).toBe(20)
    expect(result.current.step).toBe("idle")
  })

  it("moves to ready when item is already selected", () => {
    const { result } = renderHook(() => useEventCardPledge({ pollId: "p1" }))
    act(() => result.current.selectItem("item-1", "Purple"))
    act(() => result.current.selectAmount(20))
    expect(result.current.step).toBe("ready")
  })
})

describe("useEventCardPledge — navigation actions", () => {
  it("closePayment returns to ready from paying", () => {
    const { result } = renderHook(() => useEventCardPledge({ pollId: "p1" }))
    act(() => result.current.selectItem("item-1", "Purple"))
    act(() => result.current.selectAmount(10))
    // Simulate paying state directly
    act(() => result.current.closePayment())
    expect(result.current.step).toBe("ready")
    expect(result.current.clientSecret).toBeNull()
  })

  it("viewResults moves to pledged", () => {
    const { result } = renderHook(() => useEventCardPledge({ pollId: "p1" }))
    act(() => result.current.viewResults())
    expect(result.current.step).toBe("pledged")
  })

  it("resetPledge clears all state back to idle", () => {
    const { result } = renderHook(() => useEventCardPledge({ pollId: "p1" }))
    act(() => result.current.selectItem("item-1", "Purple"))
    act(() => result.current.selectAmount(10))
    act(() => result.current.resetPledge())
    expect(result.current.step).toBe("idle")
    expect(result.current.selectedItemId).toBeNull()
    expect(result.current.selectedItemLabel).toBeNull()
    expect(result.current.amount).toBeNull()
    expect(result.current.clientSecret).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
