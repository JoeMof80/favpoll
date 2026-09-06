import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { StepSplit } from "../step-split"

const BASE = {
  favouriteBreakdown: [{ label: "Blue", amount: 18 }],
  fundPart: 2,
  onFundStep: vi.fn(),
  numericTotal: 20,
}

const stepUp = () =>
  screen.getByRole("button", { name: "Move £1 to the shared fund" })
const stepDown = () =>
  screen.getByRole("button", { name: "Move £1 back to your favourite" })

describe("StepSplit — the split as its own step (2026-09-06)", () => {
  it("steps whole pounds between the favourite and the shared fund", () => {
    const onFundStep = vi.fn()
    render(<StepSplit {...BASE} onFundStep={onFundStep} />)
    fireEvent.click(stepUp())
    expect(onFundStep).toHaveBeenCalledWith(1)
    fireEvent.click(stepDown())
    expect(onFundStep).toHaveBeenCalledWith(-1)
  })

  it("cannot step below zero", () => {
    render(<StepSplit {...BASE} fundPart={0} />)
    expect(stepDown()).toBeDisabled()
    expect(stepUp()).toBeEnabled()
  })

  it("always leaves the favourite at least £1 of worth", () => {
    render(
      <StepSplit
        {...BASE}
        favouriteBreakdown={[{ label: "Blue", amount: 1 }]}
        fundPart={19}
      />
    )
    expect(stepUp()).toBeDisabled()
  })

  it("renders every destination as a ranked bar of the total", () => {
    render(<StepSplit {...BASE} />)
    expect(screen.getByText("Blue")).toBeInTheDocument()
    expect(screen.getByText("Shared fund")).toBeInTheDocument()
    expect(screen.getByText(/£18/)).toBeInTheDocument()
  })
})
