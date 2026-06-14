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
  }) as unknown as Charity

const CHARITIES = [
  makeCharity("c1", "Shelter"),
  makeCharity("c2", "Oxfam"),
  makeCharity("c3", "RSPB"),
  makeCharity("c4", "BHF"),
]

describe("CharityStep", () => {
  it("always shows the search input", () => {
    render(<CharityStep charities={CHARITIES} value={[]} onChange={() => {}} />)
    expect(screen.getByPlaceholderText("Search charities…")).toBeInTheDocument()
  })

  it("renders all charity chips", () => {
    render(<CharityStep charities={CHARITIES} value={[]} onChange={() => {}} />)
    expect(screen.getByRole("button", { name: "Shelter" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Oxfam" })).toBeInTheDocument()
  })

  it("shows already-selected charities as selected", () => {
    render(
      <CharityStep charities={CHARITIES} value={["c1"]} onChange={() => {}} />
    )
    expect(screen.getByPlaceholderText("Search charities…")).toBeInTheDocument()
  })

  it("calls onChange with new id when unselected charity is clicked", () => {
    const onChange = vi.fn()
    render(
      <CharityStep charities={CHARITIES} value={["c1"]} onChange={onChange} />
    )
    fireEvent.click(screen.getByRole("button", { name: "Oxfam" }))
    expect(onChange).toHaveBeenCalledWith(["c1", "c2"])
  })

  it("calls onChange without id when selected charity is clicked", () => {
    const onChange = vi.fn()
    render(
      <CharityStep charities={CHARITIES} value={["c1"]} onChange={onChange} />
    )
    fireEvent.click(screen.getByRole("button", { name: "Shelter" }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it("filters chips by search query", () => {
    render(<CharityStep charities={CHARITIES} value={[]} onChange={() => {}} />)
    fireEvent.change(screen.getByPlaceholderText("Search charities…"), {
      target: { value: "ox" },
    })
    expect(screen.getByRole("button", { name: "Oxfam" })).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Shelter" })
    ).not.toBeInTheDocument()
  })

  it("shows no-results message when search matches nothing", () => {
    render(<CharityStep charities={CHARITIES} value={[]} onChange={() => {}} />)
    fireEvent.change(screen.getByPlaceholderText("Search charities…"), {
      target: { value: "zzz" },
    })
    expect(screen.getByText("No results.")).toBeInTheDocument()
  })

  it("does not call onChange when at max and an unselected charity is clicked", () => {
    const onChange = vi.fn()
    render(
      <CharityStep
        charities={CHARITIES}
        value={["c1", "c2", "c3"]}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "BHF" }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
