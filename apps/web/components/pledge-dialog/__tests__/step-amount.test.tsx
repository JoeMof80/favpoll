import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { StepAmount } from "../step-amount"

// Radix Slider measures its thumb with ResizeObserver, which jsdom lacks
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver ?? (RO as never)

const BASE = {
  pledgeAmount: "20",
  updatePledgeAmount: vi.fn(),
  useSharedFund: false,
  hasFund: false,
  toggleFund: vi.fn(),
}

const SPLIT = {
  favouriteBreakdown: [{ label: "Blue", amount: 18 }],
  fundPart: 2,
  onFundChange: vi.fn(),
}

describe("StepAmount — amount and presets", () => {
  it("presets set the amount", () => {
    const updatePledgeAmount = vi.fn()
    render(<StepAmount {...BASE} updatePledgeAmount={updatePledgeAmount} />)
    fireEvent.click(screen.getByRole("button", { name: "£10" }))
    expect(updatePledgeAmount).toHaveBeenCalledWith("10")
  })

  it("carries no tip or bill — they live on the review page", () => {
    render(<StepAmount {...BASE} {...SPLIT} />)
    expect(screen.queryByText(/tip/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/total charged/i)).not.toBeInTheDocument()
  })
})

describe("StepAmount — the split slider (consolidated, 2026-09-06)", () => {
  it("divides whole pounds, favourite keeping at least £1", () => {
    render(<StepAmount {...BASE} {...SPLIT} />)
    const slider = screen.getByRole("slider")
    expect(slider).toHaveAttribute("aria-valuenow", "2")
    expect(slider).toHaveAttribute("aria-valuemin", "0")
    // £20 total → at most £19 to the fund
    expect(slider).toHaveAttribute("aria-valuemax", "19")
  })

  it("names an absolute fund value as the thumb moves", () => {
    const onFundChange = vi.fn()
    render(<StepAmount {...BASE} {...SPLIT} onFundChange={onFundChange} />)
    const slider = screen.getByRole("slider")
    fireEvent.keyDown(slider, { key: "End" })
    expect(onFundChange).toHaveBeenCalledWith(19)
    fireEvent.keyDown(slider, { key: "Home" })
    expect(onFundChange).toHaveBeenCalledWith(0)
  })

  it("re-prices the list under the thumb", () => {
    render(<StepAmount {...BASE} {...SPLIT} />)
    expect(screen.getByText("Blue")).toBeInTheDocument()
    // £18 appears as the favourite end-label AND the Blue row
    expect(screen.getAllByText(/£18/).length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText(/Shared fund/).length).toBeGreaterThanOrEqual(2)
  })

  it("cannot move at a £1 total — nothing to split", () => {
    render(
      <StepAmount
        {...BASE}
        {...SPLIT}
        pledgeAmount="1"
        favouriteBreakdown={[{ label: "Blue", amount: 1 }]}
        fundPart={0}
      />
    )
    expect(screen.getByRole("slider")).toHaveAttribute("data-disabled")
  })

  it("hides the split on the fund path, without a handler, or with no pick", () => {
    const { rerender } = render(
      <StepAmount {...BASE} {...SPLIT} useSharedFund />
    )
    expect(screen.queryByRole("slider")).not.toBeInTheDocument()
    rerender(<StepAmount {...BASE} />)
    expect(screen.queryByRole("slider")).not.toBeInTheDocument()
    rerender(<StepAmount {...BASE} {...SPLIT} favouriteBreakdown={[]} />)
    expect(screen.queryByRole("slider")).not.toBeInTheDocument()
  })
})
