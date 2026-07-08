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
