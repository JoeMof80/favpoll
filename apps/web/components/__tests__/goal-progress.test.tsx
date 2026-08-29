import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { GoalProgress } from "../goal-progress"

describe("GoalProgress", () => {
  it("exposes the goal as a progressbar, capped at the goal", () => {
    render(<GoalProgress totalRaised={412} goalAmount={900} />)
    const bar = screen.getByRole("progressbar", {
      name: "Progress towards the pledge goal",
    })
    expect(bar).toHaveAttribute("aria-valuemin", "0")
    expect(bar).toHaveAttribute("aria-valuemax", "900")
    expect(bar).toHaveAttribute("aria-valuenow", "412")
    expect(bar.firstElementChild).toHaveStyle({ width: "45.77777777777778%" })
    expect(bar.firstElementChild).toHaveClass("bg-primary")
  })

  it("turns green and stops at 100% once the goal is met — the total keeps counting, the bar does not", () => {
    render(<GoalProgress totalRaised={925} goalAmount={900} />)
    const bar = screen.getByRole("progressbar")
    expect(bar).toHaveAttribute("aria-valuenow", "900")
    expect(bar.firstElementChild).toHaveStyle({ width: "100%" })
    expect(bar.firstElementChild).toHaveClass("bg-success")
  })

  it("is green at exactly the goal", () => {
    render(<GoalProgress totalRaised={900} goalAmount={900} />)
    expect(screen.getByRole("progressbar").firstElementChild).toHaveClass(
      "bg-success"
    )
  })
})
