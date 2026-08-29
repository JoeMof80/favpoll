import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import type { Charity } from "@favpoll/types"
import { MobileCharityFooter } from "../mobile-charity-footer"

vi.mock("embla-carousel-react", () => ({ default: () => [vi.fn(), null] }))
vi.mock("embla-carousel-autoplay", () => ({ default: () => ({}) }))

const mind = { id: "c1", name: "Mind", logo_url: null } as unknown as Charity
const crisis = {
  id: "c2",
  name: "Crisis",
  logo_url: null,
} as unknown as Charity

describe("MobileCharityFooter", () => {
  it("renders nothing without charities", () => {
    const { container } = render(
      <MobileCharityFooter charities={[]} totalRaised={0} goalAmount={500} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("shows the charity and no goal when none is set — the footer as it always was", () => {
    render(
      <MobileCharityFooter
        charities={[mind]}
        totalRaised={40}
        goalAmount={null}
      />
    )
    expect(screen.getByText("Mind")).toBeInTheDocument()
    expect(screen.queryByRole("progressbar")).toBeNull()
    expect(screen.queryByText(/goal/)).toBeNull()
  })

  it("with a goal: the total, the goal beneath it, and the bar", () => {
    render(
      <MobileCharityFooter
        charities={[mind]}
        totalRaised={40}
        goalAmount={500}
      />
    )
    const bar = screen.getByRole("progressbar", {
      name: "Progress towards the pledge goal",
    })
    expect(bar).toHaveAttribute("aria-valuemax", "500")
    expect(bar).toHaveAttribute("aria-valuenow", "40")
    expect(screen.getByText("£40")).toBeInTheDocument()
    expect(screen.getByText("of the £500 goal")).toBeInTheDocument()
    expect(screen.queryByText(/raised/)).toBeNull()
  })

  it("shows £0 under a goal — the caption needs a figure above it", () => {
    render(
      <MobileCharityFooter
        charities={[mind]}
        totalRaised={0}
        goalAmount={500}
      />
    )
    expect(screen.getByText("£0")).toBeInTheDocument()
    expect(screen.getByText("of the £500 goal")).toBeInTheDocument()
  })

  it("splits the total per charity without a goal, but shows the whole total against a goal", () => {
    const { rerender } = render(
      <MobileCharityFooter
        charities={[mind, crisis]}
        totalRaised={600}
        goalAmount={null}
      />
    )
    expect(screen.getAllByText("£300")).toHaveLength(2)
    expect(screen.queryByText(/goal/)).toBeNull()

    rerender(
      <MobileCharityFooter
        charities={[mind, crisis]}
        totalRaised={600}
        goalAmount={500}
      />
    )
    expect(screen.queryByText("£300")).toBeNull()
    expect(screen.getAllByText("£600")).toHaveLength(2)
    expect(screen.getAllByText("of the £500 goal")).toHaveLength(2)
    expect(screen.getByRole("progressbar").firstElementChild).toHaveClass(
      "bg-success"
    )
  })
})
