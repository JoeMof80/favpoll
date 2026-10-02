import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("@/components/countdown", () => ({
  Countdown: ({ closesAt }: { closesAt?: string }) => (
    <div data-testid="countdown" data-closes={closesAt} />
  ),
}))
import { fundraiserHeroSlots } from "@/components/heroes/fundraiser-slots"

const BYLINE = { name: "Alice", context: "1950 – 2026", photoUrl: null }

function renderSlots(slots: ReturnType<typeof fundraiserHeroSlots>) {
  return render(
    <div>
      {slots.eyebrowText}
      {slots.title}
      {slots.subtitle}
      {slots.avatar}
      {slots.about}
    </div>
  )
}

describe("fundraiserHeroSlots — the money is the heading", () => {
  it("with a goal: eyebrow, figure, 'of £goal' and the bar; the person a byline h1", () => {
    renderSlots(
      fundraiserHeroSlots({
        fundraiser: {
          totalRaised: 250,
          goalAmount: 1000,
          closesAt: "2030-01-01T00:00:00Z",
          isClosed: false,
        },
        byline: BYLINE,
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
    expect(screen.queryByTestId("countdown")).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Alice")
    expect(screen.getByText("1950 – 2026")).toBeInTheDocument()
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
        byline: BYLINE,
      })
    )
    expect(screen.getByText(/Goal reached/)).toBeInTheDocument()
  })

  it("no goal: 'Raised so far' and the countdown as the subtitle line", () => {
    renderSlots(
      fundraiserHeroSlots({
        fundraiser: {
          totalRaised: 40,
          goalAmount: null,
          closesAt: "2030-01-01T00:00:00Z",
          isClosed: false,
        },
        byline: { ...BYLINE, photoUrl: "https://x/y.jpg" },
      })
    )
    expect(screen.getByText("Raised so far")).toBeInTheDocument()
    expect(screen.getByTestId("countdown").dataset.closes).toBe(
      "2030-01-01T00:00:00Z"
    )
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Alice" })).toBeInTheDocument()
  })

  it("closed: the final figure, no goal-reached shout, no countdown", () => {
    renderSlots(
      fundraiserHeroSlots({
        fundraiser: {
          totalRaised: 1200,
          goalAmount: 1000,
          closesAt: null,
          isClosed: true,
        },
        byline: BYLINE,
      })
    )
    expect(screen.getByText("Poll closed")).toBeInTheDocument()
    expect(screen.getByText("£1,200")).toBeInTheDocument()
    expect(screen.getByText(/final standings are in/)).toBeInTheDocument()
    expect(screen.queryByText(/Goal reached/)).not.toBeInTheDocument()
    expect(screen.queryByTestId("countdown")).not.toBeInTheDocument()
  })
})
