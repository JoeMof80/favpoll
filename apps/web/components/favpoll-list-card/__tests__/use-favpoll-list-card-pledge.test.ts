// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"

const mockCreatePledge = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
vi.mock("@/app/favpolls/[id]/actions", () => ({
  createPledge: mockCreatePledge,
}))

import { useFavpollListCardPledge } from "@/components/favpoll-list-card/use-favpoll-list-card-pledge"
import type { CardResultItem } from "@/components/favpoll-list-card/use-favpoll-list-card-pledge"

const RESULTS: CardResultItem[] = [
  { label: "Red", amountPence: 1000, widthPercent: 100 },
]

describe("useFavpollListCardPledge — initial state", () => {
  it("starts at idle with no initial results", () => {
    const { result } = renderHook(() =>
      useFavpollListCardPledge({ pollId: "p1" })
    )
    expect(result.current.step).toBe("idle")
    expect(result.current.selectedIds).toEqual([])
    expect(result.current.amount).toBeNull()
    expect(result.current.results).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("starts at pledged when initialResults provided", () => {
    const { result } = renderHook(() =>
      useFavpollListCardPledge({ pollId: "p1", initialResults: RESULTS })
    )
    expect(result.current.step).toBe("pledged")
    expect(result.current.results).toEqual(RESULTS)
  })
})

describe("useFavpollListCardPledge — setSelectedIds", () => {
  it("stores ids and stays idle when no amount set", () => {
    const { result } = renderHook(() =>
      useFavpollListCardPledge({ pollId: "p1" })
    )
    act(() => result.current.setSelectedIds(["item-1"]))
    expect(result.current.selectedIds).toEqual(["item-1"])
    expect(result.current.step).toBe("idle")
  })

  it("moves to ready when amount is already set", () => {
    const { result } = renderHook(() =>
      useFavpollListCardPledge({ pollId: "p1" })
    )
    act(() => result.current.selectAmount(10))
    act(() => result.current.setSelectedIds(["item-1"]))
    expect(result.current.step).toBe("ready")
  })

  it("returns to idle when selections cleared", () => {
    const { result } = renderHook(() =>
      useFavpollListCardPledge({ pollId: "p1" })
    )
    act(() => result.current.selectAmount(10))
    act(() => result.current.setSelectedIds(["item-1"]))
    act(() => result.current.setSelectedIds([]))
    expect(result.current.step).toBe("idle")
  })

  it("supports multiple selected ids", () => {
    const { result } = renderHook(() =>
      useFavpollListCardPledge({ pollId: "p1" })
    )
    act(() => result.current.setSelectedIds(["item-1", "item-2", "item-3"]))
    expect(result.current.selectedIds).toHaveLength(3)
  })
})

describe("useFavpollListCardPledge — selectAmount", () => {
  it("stores amount but stays idle when no item selected", () => {
    const { result } = renderHook(() =>
      useFavpollListCardPledge({ pollId: "p1" })
    )
    act(() => result.current.selectAmount(20))
    expect(result.current.amount).toBe(20)
    expect(result.current.step).toBe("idle")
  })

  it("moves to ready when item is already selected", () => {
    const { result } = renderHook(() =>
      useFavpollListCardPledge({ pollId: "p1" })
    )
    act(() => result.current.setSelectedIds(["item-1"]))
    act(() => result.current.selectAmount(20))
    expect(result.current.step).toBe("ready")
  })
})

describe("useFavpollListCardPledge — navigation actions", () => {
  it("closePayment returns to ready from paying", () => {
    const { result } = renderHook(() =>
      useFavpollListCardPledge({ pollId: "p1" })
    )
    act(() => result.current.setSelectedIds(["item-1"]))
    act(() => result.current.selectAmount(10))
    act(() => result.current.closePayment())
    expect(result.current.step).toBe("ready")
    expect(result.current.clientSecret).toBeNull()
  })

  it("viewResults moves to pledged", () => {
    const { result } = renderHook(() =>
      useFavpollListCardPledge({ pollId: "p1" })
    )
    act(() => result.current.viewResults())
    expect(result.current.step).toBe("pledged")
  })

  it("resetPledge clears all state back to idle", () => {
    const { result } = renderHook(() =>
      useFavpollListCardPledge({ pollId: "p1" })
    )
    act(() => result.current.setSelectedIds(["item-1"]))
    act(() => result.current.selectAmount(10))
    act(() => result.current.resetPledge())
    expect(result.current.step).toBe("idle")
    expect(result.current.selectedIds).toEqual([])
    expect(result.current.amount).toBeNull()
    expect(result.current.clientSecret).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
