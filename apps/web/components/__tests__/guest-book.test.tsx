import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { GuestBook, type WallEntry } from "@/components/guest-book"

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

describe("GuestBook — teaser for un-entitled viewers", () => {
  it("shows the pledge teaser when teaseBacked and entries exist", () => {
    render(<GuestBook entries={ENTRIES} teaseBacked />)
    expect(
      screen.getByText("Pledge to see what everyone backed.")
    ).toBeInTheDocument()
  })

  it("shows no teaser for entitled viewers", () => {
    render(<GuestBook entries={ENTRIES} teaseBacked={false} />)
    expect(screen.queryByText(/Pledge to see what/)).toBeNull()
  })

  it("shows skeleton teaser rows on an empty wall with teaseBacked", () => {
    const { container } = render(<GuestBook entries={[]} teaseBacked />)
    // 6 skeleton rows (initial circle placeholders)
    const skeletons = container.querySelectorAll("[style*='oklch']")
    expect(skeletons.length).toBeGreaterThanOrEqual(6)
  })

  it("renders stripped entries as plain 'pledged' with name or Someone", () => {
    render(<GuestBook entries={ENTRIES} teaseBacked />)
    expect(screen.getByText("Alex")).toBeInTheDocument()
    expect(screen.getByText("Someone")).toBeInTheDocument()
  })
})

describe("GuestBook — initials and pills", () => {
  it("renders initial circles with the first letter of names", () => {
    render(<GuestBook entries={ENTRIES} />)
    expect(screen.getByText("A")).toBeInTheDocument() // Alex → A
  })

  it("renders the first backed favourite on line 2", () => {
    const entries: WallEntry[] = [
      {
        id: "p3",
        name: "Sam",
        labels: ["Dylan Thomas", "Sylvia Plath"],
        created_at: new Date().toISOString(),
      },
    ]
    render(<GuestBook entries={entries} />)
    expect(screen.getByText("Dylan Thomas +1")).toBeInTheDocument()
  })

  it("truncates labels beyond the first with a +N indicator", () => {
    const entries: WallEntry[] = [
      {
        id: "p4",
        name: "Jo",
        labels: ["Red", "Blue", "Green"],
        created_at: new Date().toISOString(),
      },
    ]
    render(<GuestBook entries={entries} />)
    expect(screen.getByText("Red +2")).toBeInTheDocument()
  })
})

describe("GuestBook — messages", () => {
  it("hides messages in the card view (shown only in the expanded dialog)", () => {
    const entries: WallEntry[] = [
      {
        id: "m1",
        name: "Kate",
        labels: ["Bath"],
        message: "Thinking of you",
        created_at: new Date().toISOString(),
      },
    ]
    render(<GuestBook entries={entries} />)
    // Messages hidden in compact card row
    expect(screen.queryByText("Thinking of you")).toBeNull()
    // Name still visible
    expect(screen.getByText("Kate")).toBeInTheDocument()
  })

  it("does not render a message line when message is null", () => {
    const entries: WallEntry[] = [
      {
        id: "m2",
        name: "Tom",
        labels: ["London"],
        message: null,
        created_at: new Date().toISOString(),
      },
    ]
    render(<GuestBook entries={entries} />)
    expect(screen.getByText("Tom")).toBeInTheDocument()
    // No italic message line
    expect(screen.queryByText("Thinking of you")).toBeNull()
  })
})

describe("GuestBook — count in eyebrow", () => {
  it("shows the pledge count beside the title", () => {
    render(<GuestBook entries={ENTRIES} />)
    expect(screen.getByText("· 2 pledges")).toBeInTheDocument()
  })

  it("uses singular for one pledge", () => {
    render(<GuestBook entries={[ENTRIES[0]]} />)
    expect(screen.getByText("· 1 pledge")).toBeInTheDocument()
  })

  it("shows no count on an empty wall", () => {
    render(<GuestBook entries={[]} />)
    expect(screen.queryByText(/· \d+ pledge/)).toBeNull()
  })
})

describe("GuestBook — expandable collapse", () => {
  const MANY = Array.from({ length: 12 }, (_, i) => ({
    id: `e${i}`,
    name: `Guest ${i}`,
    labels: [],
    created_at: "2026-08-01T00:00:00Z",
  }))

  it("shows all rows in a scrollable list with an expand control", () => {
    render(<GuestBook entries={MANY} expandable />)
    expect(screen.getAllByText(/Guest \d+/).length).toBe(12)
    expect(screen.getByRole("list", { name: "Recent pledges" })).toHaveClass(
      "overflow-y-auto"
    )
    expect(
      screen.getByRole("button", { name: "Expand guest book" })
    ).toBeInTheDocument()
  })

  it("no expand control or height cap when not expandable", () => {
    render(<GuestBook entries={MANY} />)
    expect(
      screen.getByRole("list", { name: "Recent pledges" })
    ).not.toHaveClass("max-h-80")
    expect(
      screen.queryByRole("button", { name: "Expand guest book" })
    ).toBeNull()
  })
})
