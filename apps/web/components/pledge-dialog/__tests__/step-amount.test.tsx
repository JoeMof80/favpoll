import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { StepAmount } from "../step-amount"

const BASE = {
  pledgeAmount: "10",
  updatePledgeAmount: vi.fn(),
  useSharedFund: false,
  hasFund: false,
  ownBreakdown: {
    lines: [{ label: "To Ocean Trust", amount: 10 }],
    total: { label: "Total charged", amount: 10 },
  },
  fundBreakdown: null,
  favouriteBreakdown: [{ label: "Blue", amount: 10 }],
  toggleFund: vi.fn(),
  tipAmount: 0,
  setTipAmount: vi.fn(),
  tipOptions: [0, 1, 2],
}

describe("StepAmount — shared-fund top-up box", () => {
  it("renders the top-up input on the own-funds path and forwards typing", () => {
    const setTopUpAmount = vi.fn()
    render(
      <StepAmount {...BASE} topUpAmount="" setTopUpAmount={setTopUpAmount} />
    )
    const input = screen.getByLabelText("Add to the shared fund")
    fireEvent.change(input, { target: { value: "5" } })
    expect(setTopUpAmount).toHaveBeenCalledWith("5")
  })

  it("is absent on the shared-fund path (you cannot top up the fund with the fund)", () => {
    render(
      <StepAmount
        {...BASE}
        useSharedFund
        ownBreakdown={null}
        topUpAmount=""
        setTopUpAmount={vi.fn()}
      />
    )
    expect(
      screen.queryByLabelText("Add to the shared fund")
    ).not.toBeInTheDocument()
  })

  it("is absent when no setter is provided (hero demo)", () => {
    render(<StepAmount {...BASE} />)
    expect(
      screen.queryByLabelText("Add to the shared fund")
    ).not.toBeInTheDocument()
  })
})
