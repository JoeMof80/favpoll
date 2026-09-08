import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useHideOnScrollDown } from "../use-hide-on-scroll"

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true })
  window.dispatchEvent(new Event("scroll"))
}

describe("useHideOnScrollDown", () => {
  it("hides on scroll down, returns on scroll up, always shows near the top", () => {
    act(() => scrollTo(0))
    const { result } = renderHook(() => useHideOnScrollDown())
    expect(result.current).toBe(false)

    act(() => scrollTo(300))
    expect(result.current).toBe(true)

    act(() => scrollTo(250))
    expect(result.current).toBe(false)

    act(() => scrollTo(600))
    expect(result.current).toBe(true)

    // Back near the top the bar is always shown
    act(() => scrollTo(20))
    expect(result.current).toBe(false)
  })

  it("slow scrolling accumulates instead of slipping under the threshold", () => {
    act(() => scrollTo(200))
    const { result } = renderHook(() => useHideOnScrollDown())
    act(() => scrollTo(203))
    expect(result.current).toBe(false) // below threshold, not yet
    act(() => scrollTo(206))
    act(() => scrollTo(209))
    expect(result.current).toBe(true) // accumulated past it
  })
})
