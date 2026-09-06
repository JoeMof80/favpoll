import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { StepAmount, StepAmountHeader } from "../step-amount"

// Radix Slider measures its thumb with ResizeObserver, which jsdom lacks
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver ?? (RO as never)

const BASE = {
  pledgeAmount: "18",
  updatePledgeAmount: vi.fn(),
  useSharedFund: false,
  hasFund: false,
  toggleFund: vi.fn(),
}

const SPLIT = {
  favouriteBreakdown: [{ label: "Blue", amount: 18 }],
  fundPart: 2,
  onFavShare: vi.fn(),
}

describe("StepAmountHeader — two-part entry (founder mock, 2026-09-06)", () => {
  it("shows the favourites and shared-fund figures side by side", () => {
    const onFundAmountChange = vi.fn()
    render(
      <StepAmountHeader
        pledgeAmount="18"
        updatePledgeAmount={vi.fn()}
        fundAmount="2"
        onFundAmountChange={onFundAmountChange}
        favouriteCount={2}
      />
    )
    expect(screen.getByText("Favourites")).toBeInTheDocument()
    expect(screen.getByText("Shared fund")).toBeInTheDocument()
    const fund = screen.getByLabelText(
      "Shared fund amount in pounds, on top of your pledge"
    )
    fireEvent.change(fund, { target: { value: "5" } })
    expect(onFundAmountChange).toHaveBeenCalledWith("5")
  })

  it("takes the single-figure path when no favourite is picked", () => {
    render(
      <StepAmountHeader
        pledgeAmount="18"
        updatePledgeAmount={vi.fn()}
        fundAmount=""
        onFundAmountChange={vi.fn()}
        favouriteCount={0}
      />
    )
    expect(screen.getByText("Your pledge")).toBeInTheDocument()
    expect(screen.queryByText("Shared fund")).not.toBeInTheDocument()
  })

  it("falls back to the single figure without a fund handler (fund mode)", () => {
    render(
      <StepAmountHeader
        pledgeAmount="18"
        updatePledgeAmount={vi.fn()}
        useSharedFund
      />
    )
    expect(screen.getByText("Your pledge")).toBeInTheDocument()
    expect(screen.queryByText("Shared fund")).not.toBeInTheDocument()
  })
})

describe("StepAmount — presets and calm", () => {
  it("presets set the favourites' worth", () => {
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

describe("StepAmount — the rebalancing slider", () => {
  it("holds the favourites' share of the current sum", () => {
    render(<StepAmount {...BASE} {...SPLIT} />)
    const slider = screen.getByRole("slider")
    expect(slider).toHaveAttribute("aria-valuenow", "18")
    expect(slider).toHaveAttribute("aria-valuemin", "0")
    // £18 favourites + £2 fund → the sum is the range
    expect(slider).toHaveAttribute("aria-valuemax", "20")
  })

  it("names the favourites' share as the thumb moves", () => {
    const onFavShare = vi.fn()
    render(<StepAmount {...BASE} {...SPLIT} onFavShare={onFavShare} />)
    const slider = screen.getByRole("slider")
    fireEvent.keyDown(slider, { key: "End" })
    expect(onFavShare).toHaveBeenCalledWith(20)
    fireEvent.keyDown(slider, { key: "Home" })
    expect(onFavShare).toHaveBeenCalledWith(0)
  })

  it("re-prices the list as either figure moves", () => {
    render(<StepAmount {...BASE} {...SPLIT} />)
    expect(screen.getByText("Blue")).toBeInTheDocument()
    expect(screen.getByText(/£18/)).toBeInTheDocument()
    expect(screen.getByText("Shared fund")).toBeInTheDocument()
    expect(screen.getByText(/£2\.00/)).toBeInTheDocument()
  })

  it("hides on the fund path, without a handler, or with no pick", () => {
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
