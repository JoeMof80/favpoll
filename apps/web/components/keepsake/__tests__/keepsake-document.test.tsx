import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  KeepsakeDocument,
  type KeepsakeData,
} from "@/components/keepsake/keepsake-document"

const BASE: KeepsakeData = {
  prefix: "In loving memory of",
  name: "Mary Whitfield",
  context: "1941 – 2026",
  topicTitle: "Colour",
  reveal: "Autumn, always.",
  totalRaised: 640,
  goalAmount: null,
  charityNames: ["Marie Curie"],
  closedDate: "23rd July 2026",
  standings: [
    { favouriteId: "f1", label: "Purple", amount: 350 },
    { favouriteId: "f2", label: "Blue", amount: 190 },
    { favouriteId: "f3", label: "Red", amount: 100 },
  ],
  rankHistory: null,
  guestNames: [],
}

describe("KeepsakeDocument — the reached goal prints", () => {
  it("fundraiser: a reached goal gets its own line under the total", () => {
    render(
      <KeepsakeDocument
        data={{ ...BASE, goalAmount: 500 }}
        variant="fundraiser"
      />
    )
    expect(screen.getByText("£500 goal reached")).toBeInTheDocument()
  })

  it("tribute: the reached goal joins the one money sentence", () => {
    render(
      <KeepsakeDocument data={{ ...BASE, goalAmount: 500 }} variant="tribute" />
    )
    expect(
      screen.getByText(/reaching the £500 goal\./, { exact: false })
    ).toBeInTheDocument()
  })

  it("an unmet goal prints nothing — a finished sheet must not read as a shortfall", () => {
    render(
      <KeepsakeDocument
        data={{ ...BASE, goalAmount: 1000 }}
        variant="fundraiser"
      />
    )
    expect(screen.queryByText(/goal/i)).toBeNull()
  })

  it("no goal, no line", () => {
    render(<KeepsakeDocument data={BASE} variant="tribute" />)
    expect(screen.queryByText(/goal/i)).toBeNull()
  })
})
