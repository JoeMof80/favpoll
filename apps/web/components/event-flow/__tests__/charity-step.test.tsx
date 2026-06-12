import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CharityStep } from "../charity-step"
import type { Charity } from "@favpoll/types"

const makeCharity = (id: string, name: string): Charity =>
  ({
    id,
    name,
    is_active: true,
    description: null,
    logo_url: null,
    registered_number: null,
    market: "en-GB",
    created_at: null,
  }) as Charity

const CHARITIES = [
  makeCharity("c1", "Shelter"),
  makeCharity("c2", "Oxfam"),
  makeCharity("c3", "RSPB"),
  makeCharity("c4", "BHF"),
]

describe("CharityStep — empty state", () => {
  it("shows the search picker when no charity is selected", () => {
    render(<CharityStep charities={CHARITIES} value={[]} onChange={() => {}} />)
    expect(screen.getByPlaceholderText("Search charities…")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Shelter" })).toBeInTheDocument()
  })

  it("does not show the split note when no charity is selected", () => {
    render(<CharityStep charities={CHARITIES} value={[]} onChange={() => {}} />)
    expect(screen.queryByTestId("split-note")).not.toBeInTheDocument()
  })
})

describe("CharityStep — one charity selected", () => {
  it("shows selected charity prominently and hides full picker", () => {
    render(
      <CharityStep charities={CHARITIES} value={["c1"]} onChange={() => {}} />
    )
    expect(
      screen.queryByPlaceholderText("Search charities…")
    ).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Shelter" })).toBeInTheDocument()
  })

  it("shows 'Add another charity' link", () => {
    render(
      <CharityStep charities={CHARITIES} value={["c1"]} onChange={() => {}} />
    )
    expect(screen.getByTestId("add-another")).toBeInTheDocument()
  })

  it("does not show split note with one charity", () => {
    render(
      <CharityStep charities={CHARITIES} value={["c1"]} onChange={() => {}} />
    )
    expect(screen.queryByTestId("split-note")).not.toBeInTheDocument()
  })

  it("clicking 'Add another' reveals the picker", () => {
    render(
      <CharityStep charities={CHARITIES} value={["c1"]} onChange={() => {}} />
    )
    fireEvent.click(screen.getByTestId("add-another"))
    expect(screen.getByPlaceholderText("Search charities…")).toBeInTheDocument()
  })

  it("removes charity when selected chip is clicked", () => {
    const onChange = vi.fn()
    render(
      <CharityStep charities={CHARITIES} value={["c1"]} onChange={onChange} />
    )
    fireEvent.click(screen.getByRole("button", { name: "Shelter" }))
    expect(onChange).toHaveBeenCalledWith([])
  })
})

describe("CharityStep — two charities selected", () => {
  it("shows the split note", () => {
    render(
      <CharityStep
        charities={CHARITIES}
        value={["c1", "c2"]}
        onChange={() => {}}
      />
    )
    expect(screen.getByTestId("split-note")).toBeInTheDocument()
    expect(screen.getByTestId("split-note")).toHaveTextContent(
      "Proceeds are split equally"
    )
  })

  it("still shows 'Add another charity' when below max", () => {
    render(
      <CharityStep
        charities={CHARITIES}
        value={["c1", "c2"]}
        onChange={() => {}}
      />
    )
    expect(screen.getByTestId("add-another")).toBeInTheDocument()
  })
})

describe("CharityStep — three charities selected (max)", () => {
  it("hides 'Add another charity' when at max", () => {
    render(
      <CharityStep
        charities={CHARITIES}
        value={["c1", "c2", "c3"]}
        onChange={() => {}}
      />
    )
    expect(screen.queryByTestId("add-another")).not.toBeInTheDocument()
  })

  it("adding a fourth charity does nothing (onChange not called with 4)", () => {
    const onChange = vi.fn()
    render(
      <CharityStep
        charities={CHARITIES}
        value={["c1", "c2", "c3"]}
        onChange={onChange}
      />
    )
    // Expand picker to try adding
    fireEvent.click(screen.getByRole("button", { name: "Shelter" }))
    expect(onChange).toHaveBeenCalledWith(["c2", "c3"])
  })
})

describe("CharityStep — picking first charity collapses picker", () => {
  it("auto-collapses to selected state after first pick", () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <CharityStep charities={CHARITIES} value={[]} onChange={onChange} />
    )
    // Picker is visible
    expect(screen.getByPlaceholderText("Search charities…")).toBeInTheDocument()

    // Pick first charity
    fireEvent.click(screen.getByRole("button", { name: "Shelter" }))
    expect(onChange).toHaveBeenCalledWith(["c1"])

    // Simulate parent updating value
    rerender(
      <CharityStep charities={CHARITIES} value={["c1"]} onChange={onChange} />
    )
    // Picker should collapse
    expect(
      screen.queryByPlaceholderText("Search charities…")
    ).not.toBeInTheDocument()
  })
})
