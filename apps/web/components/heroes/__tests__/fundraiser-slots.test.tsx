import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/components/countdown", () => ({
  Countdown: ({ closesAt }: { closesAt?: string }) => (
    <div data-testid="countdown" data-closes={closesAt} />
  ),
}))
import { fundraiserHeroSlots } from "@/components/heroes/fundraiser-slots"

function renderSlots(slots: ReturnType<typeof fundraiserHeroSlots>) {
  return render(
    <div>
      {slots.eyebrowText}
      {slots.title}
      {slots.subtitle}
      {slots.avatar}
      <div data-testid="aside">{slots.aside}</div>
      {slots.about}
    </div>
  )
}

describe("fundraiserHeroSlots — the money is the heading", () => {
  it("with a goal: eyebrow, figure and 'of £goal' on one line, the bar, the countdown aside", () => {
    renderSlots(
      fundraiserHeroSlots({
        fundraiser: {
          totalRaised: 250,
          goalAmount: 1000,
          closesAt: "2030-01-01T00:00:00Z",
          isClosed: false,
        },
      })
    )
    expect(screen.getByText("Pledge goal")).toBeInTheDocument()
    expect(screen.getByText("£250")).toBeInTheDocument()
    expect(screen.getByText("of £1,000")).toBeInTheDocument()
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "250"
    )
    expect(screen.queryByText(/Goal reached/)).not.toBeInTheDocument()
    expect(screen.getByTestId("countdown").dataset.closes).toBe(
      "2030-01-01T00:00:00Z"
    )
    // The person is no longer in the band: the rail's byline keeps the h1.
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument()
  })

  it("goal reached: the line at the eyebrow's right edge", () => {
    renderSlots(
      fundraiserHeroSlots({
        fundraiser: {
          totalRaised: 1200,
          goalAmount: 1000,
          closesAt: null,
          isClosed: false,
        },
      })
    )
    expect(screen.getByText(/Goal reached/)).toBeInTheDocument()
  })

  it("no goal: 'Raised so far', the figure alone, the countdown still aside", () => {
    renderSlots(
      fundraiserHeroSlots({
        fundraiser: {
          totalRaised: 40,
          goalAmount: null,
          closesAt: "2030-01-01T00:00:00Z",
          isClosed: false,
        },
      })
    )
    expect(screen.getByText("Raised so far")).toBeInTheDocument()
    expect(screen.queryByText(/^of £/)).not.toBeInTheDocument()
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    expect(screen.getByTestId("countdown")).toBeInTheDocument()
  })

  it("closed: the final figure, no goal, no goal-reached shout, no countdown", () => {
    renderSlots(
      fundraiserHeroSlots({
        fundraiser: {
          totalRaised: 1200,
          goalAmount: 1000,
          closesAt: null,
          isClosed: true,
        },
      })
    )
    expect(screen.getByText("Poll closed")).toBeInTheDocument()
    expect(screen.getByText("£1,200")).toBeInTheDocument()
    expect(screen.queryByText("of £1,000")).not.toBeInTheDocument()
    expect(screen.getByText(/final standings are in/)).toBeInTheDocument()
    expect(screen.queryByText(/Goal reached/)).not.toBeInTheDocument()
    expect(screen.queryByTestId("countdown")).not.toBeInTheDocument()
  })
})
