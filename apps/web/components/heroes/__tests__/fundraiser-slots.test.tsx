import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { FundraiserStrip } from "@/components/heroes/fundraiser-slots"

describe("FundraiserStrip — the pledge goal in the countdown card's grammar", () => {
  it("with a goal: eyebrow, figure, 'of £goal' at its baseline — the bar is the sheet's", () => {
    render(
      <FundraiserStrip
        fundraiser={{
          totalRaised: 250,
          goalAmount: 1000,
          isClosed: false,
          charityLabel: "Ocean Trust",
        }}
      />
    )
    expect(screen.getByText("Pledge goal")).toBeInTheDocument()
    expect(screen.getByText("£250")).toBeInTheDocument()
    expect(screen.getByText("for Ocean Trust")).toBeInTheDocument()
    expect(screen.getByText("of")).toBeInTheDocument()
    expect(screen.getByText("£1,000")).toBeInTheDocument()
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    expect(screen.getByText("£1,000").className).toContain("text-primary")
    expect(screen.queryByRole("heading")).not.toBeInTheDocument()
  })

  it("goal reached: the line beside the figure", () => {
    render(
      <FundraiserStrip
        fundraiser={{
          totalRaised: 1200,
          goalAmount: 1000,
          isClosed: false,
          charityLabel: null,
        }}
      />
    )
    // The goal's figure turns success once reached; no separate line.
    expect(screen.getByText("£1,000").className).toContain("text-success")
  })

  it("no goal: 'Raised so far' and the figure alone", () => {
    render(
      <FundraiserStrip
        fundraiser={{
          totalRaised: 40,
          goalAmount: null,
          isClosed: false,
          charityLabel: "Ocean Trust",
        }}
      />
    )
    expect(screen.getByText("Raised so far")).toBeInTheDocument()
    expect(screen.getByText("£40")).toBeInTheDocument()
    expect(screen.getByText("for Ocean Trust")).toBeInTheDocument()
    expect(screen.queryByText(/^of £/)).not.toBeInTheDocument()
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
  })

  it("closed: the final figure as 'raised', the goal still beside it, no bar", () => {
    render(
      <FundraiserStrip
        fundraiser={{
          totalRaised: 1200,
          goalAmount: 1000,
          isClosed: true,
          charityLabel: "A & B",
        }}
      />
    )
    expect(screen.getByText("Poll closed")).toBeInTheDocument()
    expect(screen.getByText("£1,200")).toBeInTheDocument()
    expect(screen.getByText("raised for A & B")).toBeInTheDocument()
    expect(screen.getByText("£1,000")).toBeInTheDocument()
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
  })
})
