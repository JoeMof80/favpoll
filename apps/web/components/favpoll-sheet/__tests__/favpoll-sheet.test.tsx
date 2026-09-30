import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import type {
  FavpollWithDetails,
  FavpollPollWithItems,
  Charity,
} from "@favpoll/types"

// The sheet's parts, stubbed to report what they were handed: the room
// and the guest differ only in what reaches the standings and the book.
vi.mock("@/components/favpoll-hero", () => ({
  FavpollHero: ({
    protagonist,
    compact,
  }: {
    protagonist: { name: string }
    compact?: boolean
  }) => (
    <div data-testid="favpoll-hero" data-compact={String(!!compact)}>
      {protagonist.name}
    </div>
  ),
}))
vi.mock("@/components/cause-hero", () => ({
  CauseHero: () => <div data-testid="cause-hero" />,
}))
vi.mock("@/components/poll-section", () => ({
  PollSection: (props: {
    entitled: boolean
    hasPledged: boolean
    personalNote: string | null
    hasNote?: boolean
    onOpenPledgeDialog?: () => void
    initialItems: { label: string }[]
  }) => (
    <div
      data-testid="poll-section"
      data-entitled={String(props.entitled)}
      data-has-pledged={String(props.hasPledged)}
      data-note={props.personalNote ?? ""}
      data-has-note={String(!!props.hasNote)}
      data-can-pledge={String(!!props.onOpenPledgeDialog)}
      data-items={props.initialItems.length}
    />
  ),
}))
vi.mock("@/components/guest-book", () => ({
  GuestBook: (props: {
    variant?: string
    entries: unknown[]
    teaseBacked?: boolean
    expanded?: boolean
    pinned?: React.ReactNode
  }) => (
    <div
      data-testid={`guest-book-${props.variant}`}
      data-entries={props.entries.length}
      data-tease={String(!!props.teaseBacked)}
      data-expanded={String(!!props.expanded)}
    >
      {props.pinned}
    </div>
  ),
}))
vi.mock("@/components/countdown", () => ({
  Countdown: () => null,
}))
vi.mock(
  "@/components/favpoll-list-card/favpoll-list-card-charity-carousel",
  () => ({ FavpollListCardCharityCarousel: () => null })
)
import { FavpollSheet } from "@/components/favpoll-sheet"

const CHARITY: Charity = {
  id: "charity-1",
  name: "Ocean Trust",
  description: null,
  logo_url: null,
  registered_number: null,
  created_at: "2024-01-01T00:00:00Z",
}

const FAVPOLL: FavpollWithDetails = {
  id: "favpoll-1",
  occasion_type: null,
  opening_line: null,
  market: "en-GB",
  created_by: "user-1",
  closes_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  original_closes_at: null,
  hard_close_at: null,
  extension_count: 0,
  closed_at: null,
  total_raised: 0,
  is_private: false,
  is_plural: null,
  is_listed: true,
  category: "fundraiser",
  grouping: "individual",
  created_at: "2024-01-01T00:00:00Z",
  favpoll_charities: [{ charities: CHARITY }],
  protagonist_id: "prot-1",
  subject: "someone",
  cause_label: null,
  description: null,
  protagonists: {
    id: "prot-1",
    name: "Alice",
    context: null,
    about: null,
    photo_url: null,
    pronoun: null,
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
  },
}

const POLL: FavpollPollWithItems = {
  id: "poll-1",
  favpoll_id: "favpoll-1",
  topic_id: "topic-1",
  personal_note: "Their ocean work is as vivid and varied as colour itself.",
  created_at: "2024-01-01T00:00:00Z",
  topics: {
    id: "topic-1",
    title: "Colour",
    description: null,
    is_finite: false,
    is_active: true,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    favourites: [
      { id: "i1", label: "Blue", topic_id: "topic-1" },
      { id: "i2", label: "Green", topic_id: "topic-1" },
    ] as FavpollPollWithItems["topics"]["favourites"],
  },
}

const WALL = [
  { id: "w1", name: "Priya", labels: ["Blue"], created_at: "2024-01-01" },
  { id: "w2", name: null, labels: ["Green"], created_at: "2024-01-01" },
]

describe("FavpollSheet — the room's screen", () => {
  it("shows the standings and the guest book, never the note, and offers no pledge", () => {
    render(
      <FavpollSheet
        favpoll={FAVPOLL}
        pollWithItems={POLL}
        totalRaised={0}
        isClosed={false}
        isOrganiser={false}
        wallEntries={WALL}
        rankHistory={null}
        presentation="room"
      />
    )
    const poll = screen.getByTestId("poll-section")
    expect(poll.dataset.entitled).toBe("true")
    expect(poll.dataset.note).toBe("")
    expect(poll.dataset.hasNote).toBe("false")
    expect(poll.dataset.canPledge).toBe("false")
    expect(poll.dataset.items).toBe("2")
    const rail = screen.getByTestId("guest-book-flat")
    expect(rail.dataset.entries).toBe("2")
    expect(rail.dataset.tease).toBe("false")
  })

  it("starts with the rail expanded, so the hero takes its compact sizes", () => {
    render(
      <FavpollSheet
        favpoll={FAVPOLL}
        pollWithItems={POLL}
        totalRaised={0}
        isClosed={false}
        isOrganiser={false}
        wallEntries={[]}
        rankHistory={null}
        presentation="room"
      />
    )
    expect(screen.getByTestId("guest-book-flat").dataset.expanded).toBe("true")
    expect(screen.getByTestId("favpoll-hero").dataset.compact).toBe("true")
  })
})

describe("FavpollSheet — the room's fundraiser dial", () => {
  it("renders the goal card, the bar as its hairline and the person's row — no hero band", () => {
    render(
      <FavpollSheet
        favpoll={{ ...FAVPOLL, goal_amount: 1000 }}
        pollWithItems={POLL}
        totalRaised={250}
        isClosed={false}
        isOrganiser={false}
        wallEntries={[]}
        rankHistory={null}
        presentation="room"
        heroVariant="fundraiser"
      />
    )
    expect(screen.queryByTestId("favpoll-hero")).not.toBeInTheDocument()
    expect(screen.getByText("Pledge goal")).toBeInTheDocument()
    expect(screen.getByText("£250")).toBeInTheDocument()
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "250"
    )
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Alice")
  })

  it("keeps the full hero on the tribute dial", () => {
    render(
      <FavpollSheet
        favpoll={{ ...FAVPOLL, goal_amount: 1000 }}
        pollWithItems={POLL}
        totalRaised={250}
        isClosed={false}
        isOrganiser={false}
        wallEntries={[]}
        rankHistory={null}
        presentation="room"
        heroVariant="tribute"
      />
    )
    expect(screen.getByTestId("favpoll-hero")).toBeInTheDocument()
    expect(screen.queryByText("Pledge goal")).not.toBeInTheDocument()
  })
})

describe("FavpollSheet — a guest's phone", () => {
  it("threads the viewer's standing through and withholds the book pre-pledge", () => {
    const open = vi.fn()
    render(
      <FavpollSheet
        favpoll={FAVPOLL}
        pollWithItems={POLL}
        totalRaised={0}
        isClosed={false}
        isOrganiser={false}
        wallEntries={WALL}
        rankHistory={null}
        presentation="guest"
        viewer={{
          clerkUserId: null,
          entitled: false,
          personalNote: null,
          hasNote: true,
          items: [],
          pledgeJustConfirmed: false,
          onOpenPledgeDialog: open,
        }}
      />
    )
    const poll = screen.getByTestId("poll-section")
    expect(poll.dataset.entitled).toBe("false")
    expect(poll.dataset.hasNote).toBe("true")
    expect(poll.dataset.canPledge).toBe("true")
    const rail = screen.getByTestId("guest-book-flat")
    expect(rail.dataset.entries).toBe("0")
    expect(rail.dataset.tease).toBe("true")
    expect(rail.dataset.expanded).toBe("false")
    expect(screen.getByTestId("favpoll-hero").dataset.compact).toBe("false")
  })

  it("hands the entitled guest the note and the real list", () => {
    render(
      <FavpollSheet
        favpoll={FAVPOLL}
        pollWithItems={POLL}
        totalRaised={0}
        isClosed={false}
        isOrganiser={false}
        wallEntries={WALL}
        rankHistory={null}
        viewer={{
          clerkUserId: "user-2",
          entitled: true,
          personalNote: POLL.personal_note,
          hasNote: true,
          items: POLL.topics.favourites,
          pledgeJustConfirmed: true,
        }}
      />
    )
    const poll = screen.getByTestId("poll-section")
    expect(poll.dataset.note).toBe(POLL.personal_note)
    expect(poll.dataset.items).toBe("2")
    expect(screen.getByTestId("guest-book-flat").dataset.entries).toBe("2")
  })
})
