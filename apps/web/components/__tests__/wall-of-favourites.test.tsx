import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  WallOfFavourites,
  type WallEntry,
} from "@/components/wall-of-favourites"

const ENTRIES: WallEntry[] = [
  {
    id: "p1",
    name: "Alex",
    labels: [],
    created_at: new Date().toISOString(),
  },
  {
    id: "p2",
    name: null,
    labels: [],
    created_at: new Date().toISOString(),
  },
]

describe("WallOfFavourites — teaser for un-entitled viewers", () => {
  it("shows the pledge teaser when teaseBacked and entries exist", () => {
    render(<WallOfFavourites entries={ENTRIES} teaseBacked />)
    expect(
      screen.getByText("Pledge to see what everyone backed.")
    ).toBeInTheDocument()
  })

  it("shows no teaser for entitled viewers", () => {
    render(<WallOfFavourites entries={ENTRIES} teaseBacked={false} />)
    expect(screen.queryByText(/Pledge to see what/)).toBeNull()
  })

  it("shows no teaser on an empty wall — the empty state explains instead", () => {
    render(<WallOfFavourites entries={[]} teaseBacked />)
    expect(screen.queryByText(/Pledge to see what/)).toBeNull()
    expect(
      screen.getByText("Names appear here as people pledge.")
    ).toBeInTheDocument()
  })

  it("renders stripped entries as plain 'pledged' with name or Someone", () => {
    render(<WallOfFavourites entries={ENTRIES} teaseBacked />)
    expect(screen.getByText("Alex")).toBeInTheDocument()
    expect(screen.getByText("Someone")).toBeInTheDocument()
    expect(screen.getAllByText("pledged")).toHaveLength(2)
  })
})

describe("WallOfFavourites — expandable collapse", () => {
  const MANY = Array.from({ length: 12 }, (_, i) => ({
    id: `e${i}`,
    name: `Guest ${i}`,
    labels: [],
    created_at: "2026-08-01T00:00:00Z",
  }))

  it("shows all rows in a scrollable list with an expand control", () => {
    render(<WallOfFavourites entries={MANY} expandable />)
    expect(screen.getAllByText(/Guest \d+/).length).toBe(12)
    expect(screen.getByRole("list", { name: "Recent pledges" })).toHaveClass(
      "max-h-72",
      "overflow-y-auto"
    )
    expect(
      screen.getByRole("button", { name: "Expand guest book" })
    ).toBeInTheDocument()
  })

  it("no expand control or height cap when not expandable", () => {
    render(<WallOfFavourites entries={MANY} />)
    expect(
      screen.getByRole("list", { name: "Recent pledges" })
    ).not.toHaveClass("max-h-72")
    expect(
      screen.queryByRole("button", { name: "Expand guest book" })
    ).toBeNull()
  })
})
