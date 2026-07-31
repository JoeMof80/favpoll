import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { StepAmount } from "../step-amount"

const BASE = {
  pledgeAmount: "20",
  updatePledgeAmount: vi.fn(),
  useSharedFund: false,
  hasFund: false,
  ownBreakdown: {
    lines: [{ label: "To Ocean Trust", amount: 18 }],
    total: { label: "Total charged", amount: 20 },
  },
  fundBreakdown: null,
  favouriteBreakdown: [{ label: "Blue", amount: 18 }],
  toggleFund: vi.fn(),
  tipAmount: 0,
  setTipAmount: vi.fn(),
  tipOptions: [0, 1, 2],
}

const stepUp = () =>
  screen.getByRole("button", { name: "Move £1 to the shared fund" })
const stepDown = () =>
  screen.getByRole("button", { name: "Move £1 back to your favourite" })

describe("StepAmount — total-then-split", () => {
  it("steps whole pounds between the favourite and the shared fund", () => {
    const onFundStep = vi.fn()
    render(<StepAmount {...BASE} fundPart={2} onFundStep={onFundStep} />)
    fireEvent.click(stepUp())
    expect(onFundStep).toHaveBeenCalledWith(1)
    fireEvent.click(stepDown())
    expect(onFundStep).toHaveBeenCalledWith(-1)
  })

  it("cannot step below zero", () => {
    render(<StepAmount {...BASE} fundPart={0} onFundStep={vi.fn()} />)
    expect(stepDown()).toBeDisabled()
    expect(stepUp()).toBeEnabled()
  })

  it("always leaves the favourite at least £1 of worth", () => {
    render(<StepAmount {...BASE} fundPart={19} onFundStep={vi.fn()} />)
    expect(stepUp()).toBeDisabled()
  })

  it("frames the favourite line as its worth, with the info popover", () => {
    render(<StepAmount {...BASE} fundPart={0} onFundStep={vi.fn()} />)
    expect(screen.getByText("Your favourite · its worth")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "About your favourite's worth" })
    ).toBeInTheDocument()
  })

  it("pluralises the worth label for several favourites", () => {
    render(
      <StepAmount
        {...BASE}
        favouriteBreakdown={[
          { label: "Blue", amount: 9 },
          { label: "Green", amount: 9 },
        ]}
        fundPart={2}
        onFundStep={vi.fn()}
      />
    )
    expect(
      screen.getByText("Your favourites · their worth")
    ).toBeInTheDocument()
  })

  it("hides the split on the shared-fund path", () => {
    render(
      <StepAmount
        {...BASE}
        useSharedFund
        ownBreakdown={null}
        fundPart={0}
        onFundStep={vi.fn()}
      />
    )
    expect(screen.queryByText("Shared fund")).not.toBeInTheDocument()
  })

  it("hides the split without a handler (hero demo) or a total", () => {
    render(<StepAmount {...BASE} />)
    expect(screen.queryByText("Shared fund")).not.toBeInTheDocument()
    render(
      <StepAmount
        {...BASE}
        pledgeAmount=""
        favouriteBreakdown={[{ label: "Blue", amount: 0 }]}
        fundPart={0}
        onFundStep={vi.fn()}
      />
    )
    expect(screen.queryByText("Shared fund")).not.toBeInTheDocument()
  })
})
