import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { GuestWall, type GuestWallEntry } from "@/components/guest-wall"

const ENTRIES: GuestWallEntry[] = [
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

describe("GuestWall — teaser for un-entitled viewers", () => {
  it("shows the pledge teaser when teaseBacked and entries exist", () => {
    render(<GuestWall entries={ENTRIES} teaseBacked />)
    expect(
      screen.getByText("Pledge to see what each guest backed.")
    ).toBeInTheDocument()
  })

  it("shows no teaser for entitled viewers", () => {
    render(<GuestWall entries={ENTRIES} teaseBacked={false} />)
    expect(screen.queryByText(/Pledge to see what/)).toBeNull()
  })

  it("shows no teaser on an empty wall — the empty state explains instead", () => {
    render(<GuestWall entries={[]} teaseBacked />)
    expect(screen.queryByText(/Pledge to see what/)).toBeNull()
    expect(
      screen.getByText("Guests appear here as they pledge.")
    ).toBeInTheDocument()
  })

  it("renders stripped entries as plain 'pledged' with name or Someone", () => {
    render(<GuestWall entries={ENTRIES} teaseBacked />)
    expect(screen.getByText("Alex")).toBeInTheDocument()
    expect(screen.getByText("Someone")).toBeInTheDocument()
    expect(screen.getAllByText("pledged")).toHaveLength(2)
  })
})

describe("GuestWall — expandable collapse", () => {
  const MANY = Array.from({ length: 12 }, (_, i) => ({
    id: `e${i}`,
    name: `Guest ${i}`,
    labels: [],
    created_at: "2026-08-01T00:00:00Z",
  }))

  it("collapses long walls and opens the full list from See all", () => {
    render(<GuestWall entries={MANY} expandable />)
    expect(screen.getAllByText(/Guest \d+/).length).toBe(8)
    expect(
      screen.getByRole("button", { name: "See all 12 guests" })
    ).toBeInTheDocument()
  })

  it("shows everything without the button when not expandable", () => {
    render(<GuestWall entries={MANY} />)
    expect(screen.getAllByText(/Guest \d+/).length).toBe(12)
    expect(screen.queryByRole("button", { name: /See all/ })).toBeNull()
  })
})
