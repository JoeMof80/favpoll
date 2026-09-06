import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { StepAmount } from "../step-amount"

const BASE = {
  pledgeAmount: "20",
  updatePledgeAmount: vi.fn(),
  useSharedFund: false,
  hasFund: false,
  toggleFund: vi.fn(),
}

describe("StepAmount — lean (four-step flow, 2026-09-06)", () => {
  it("presets set the amount", () => {
    const updatePledgeAmount = vi.fn()
    render(<StepAmount {...BASE} updatePledgeAmount={updatePledgeAmount} />)
    fireEvent.click(screen.getByRole("button", { name: "£10" }))
    expect(updatePledgeAmount).toHaveBeenCalledWith("10")
  })

  it("carries no split, tip or bill — they live on later steps", () => {
    render(<StepAmount {...BASE} />)
    expect(screen.queryByText(/shared fund/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/tip/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/total charged/i)).not.toBeInTheDocument()
  })

  it("shows the fund tabs only when the guest has a fund to draw on", () => {
    render(<StepAmount {...BASE} hasFund />)
    expect(screen.getByText("Use shared fund")).toBeInTheDocument()
  })
})
