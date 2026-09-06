import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { StepSplit } from "../step-split"

// Radix Slider measures its thumb with ResizeObserver, which jsdom lacks
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver ?? (RO as never)

const BASE = {
  favouriteBreakdown: [{ label: "Blue", amount: 18 }],
  fundPart: 2,
  onFundChange: vi.fn(),
  numericTotal: 20,
}

describe("StepSplit — slider grammar (founder, 2026-09-06 v2)", () => {
  it("divides whole pounds, favourite keeping at least £1", () => {
    render(<StepSplit {...BASE} />)
    const slider = screen.getByRole("slider")
    expect(slider).toHaveAttribute("aria-valuenow", "2")
    expect(slider).toHaveAttribute("aria-valuemin", "0")
    // £20 total → at most £19 to the fund
    expect(slider).toHaveAttribute("aria-valuemax", "19")
  })

  it("names an absolute fund value as the thumb moves", () => {
    const onFundChange = vi.fn()
    render(<StepSplit {...BASE} onFundChange={onFundChange} />)
    const slider = screen.getByRole("slider")
    fireEvent.keyDown(slider, { key: "End" })
    expect(onFundChange).toHaveBeenCalledWith(19)
    fireEvent.keyDown(slider, { key: "Home" })
    expect(onFundChange).toHaveBeenCalledWith(0)
  })

  it("re-prices the list under the thumb", () => {
    render(<StepSplit {...BASE} />)
    expect(screen.getByText("Blue")).toBeInTheDocument()
    // £18 appears as the favourite end-label AND the Blue row
    expect(screen.getAllByText(/£18/).length).toBeGreaterThanOrEqual(2)
    // "Shared fund" appears as the slider's end label and the list row
    expect(screen.getAllByText(/Shared fund/).length).toBeGreaterThanOrEqual(2)
  })

  it("cannot move at a £1 total — nothing to split", () => {
    render(<StepSplit {...BASE} fundPart={0} numericTotal={1} />)
    const slider = screen.getByRole("slider")
    expect(slider).toHaveAttribute("data-disabled")
  })
})
