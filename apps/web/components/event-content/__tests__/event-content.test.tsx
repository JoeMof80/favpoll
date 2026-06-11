import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import type {
  EventWithDetails,
  EventPollWithItems,
  Charity,
} from "@favpoll/types"

// Stub out sub-components that require complex providers or Supabase
vi.mock("@/components/event-hero", () => ({
  EventHero: ({ protagonist }: { protagonist: { name: string } }) => (
    <div data-testid="event-hero">{protagonist.name}</div>
  ),
}))
vi.mock("@/components/cause-hero", () => ({
  CauseHero: ({
    event,
  }: {
    event: { cause_label: string | null; description: string | null }
  }) => (
    <div data-testid="cause-hero">
      <span data-testid="cause-label">{event.cause_label ?? ""}</span>
      <span data-testid="cause-about">{event.description ?? ""}</span>
    </div>
  ),
}))
vi.mock("@/components/poll-section", () => ({
  PollSection: ({ protagonistName }: { protagonistName: string }) => (
    <div data-testid="poll-section" data-protagonist-name={protagonistName} />
  ),
}))
vi.mock("@/components/pledge-card", () => ({
  PledgeCard: () => null,
  LivePledgeCard: () => null,
}))
vi.mock("@/components/charity-banner", () => ({
  CharityBanner: () => null,
}))
vi.mock("@/components/countdown", () => ({
  Countdown: () => null,
}))
vi.mock("@/components/event-card/event-card-charity-carousel", () => ({
  EventCardCharityCarousel: () => null,
}))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/app/events/[id]/actions", () => ({
  addGuestItem: vi.fn(),
  addOrganizerItem: vi.fn(),
}))

import { EventContent } from "@/components/event-content"

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CHARITY: Charity = {
  id: "charity-1",
  name: "Ocean Trust",
  description: null,
  logo_url: null,
  registered_number: null,
  created_at: "2024-01-01T00:00:00Z",
}

const BASE_EVENT = {
  id: "event-1",
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
  event_category: "fundraiser" as const,
  event_grouping: "individual" as const,
  created_at: "2024-01-01T00:00:00Z",
  event_charities: [{ charities: CHARITY }],
}

const CAUSE_EVENT: EventWithDetails = {
  ...BASE_EVENT,
  protagonist_id: null,
  event_subject: "cause",
  cause_label: "Protecting our seas",
  description: "Together we can make a difference for ocean life.",
  protagonists: null,
}

const PERSON_EVENT: EventWithDetails = {
  ...BASE_EVENT,
  protagonist_id: "prot-1",
  event_subject: "someone",
  cause_label: null,
  description: null,
  protagonists: {
    id: "prot-1",
    name: "Alice",
    context: null,
    about: null,
    photo_url: null,
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
  },
}

const POLL: EventPollWithItems = {
  id: "poll-1",
  event_id: "event-1",
  topic_id: "topic-1",
  personal_reveal: "Their ocean work is as vivid and varied as colour itself.",
  created_at: "2024-01-01T00:00:00Z",
  topics: {
    id: "topic-1",
    title: "Colour",
    description: null,
    is_finite: false,
    is_active: true,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    topic_items: [],
  },
}

function renderContent(
  event: EventWithDetails,
  opts: { hasPledged?: boolean } = {}
) {
  return render(
    <EventContent
      event={event}
      pollWithItems={POLL}
      pot={null}
      userPotAllocation={null}
      hasPledged={opts.hasPledged ?? false}
      totalRaised={0}
      isClosed={false}
      clerkUserId={null}
      isOrganiser={false}
    />
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("EventContent — cause event", () => {
  it("renders CauseHero with cause_label and About from description", () => {
    renderContent(CAUSE_EVENT)

    expect(screen.getByTestId("cause-hero")).toBeInTheDocument()
    expect(screen.getByTestId("cause-label").textContent).toBe(
      "Protecting our seas"
    )
    expect(screen.getByTestId("cause-about").textContent).toBe(
      "Together we can make a difference for ocean life."
    )
    expect(screen.queryByTestId("event-hero")).not.toBeInTheDocument()
  })

  it("passes cause_label as protagonistName to PollSection", () => {
    renderContent(CAUSE_EVENT)

    const pollSection = screen.getByTestId("poll-section")
    expect(pollSection.dataset.protagonistName).toBe("Protecting our seas")
  })

  it("renders cleanly when description and reveal are empty", () => {
    renderContent({
      ...CAUSE_EVENT,
      description: null,
    })

    expect(screen.getByTestId("cause-hero")).toBeInTheDocument()
    expect(screen.queryByTestId("event-hero")).not.toBeInTheDocument()
    expect(screen.getByTestId("poll-section")).toBeInTheDocument()
  })
})

describe("EventContent — person event", () => {
  it("renders EventHero with protagonist name, not CauseHero", () => {
    renderContent(PERSON_EVENT)

    expect(screen.getByTestId("event-hero")).toBeInTheDocument()
    expect(screen.getByTestId("event-hero").textContent).toBe("Alice")
    expect(screen.queryByTestId("cause-hero")).not.toBeInTheDocument()
  })

  it("passes protagonist name to PollSection", () => {
    renderContent(PERSON_EVENT)

    const pollSection = screen.getByTestId("poll-section")
    expect(pollSection.dataset.protagonistName).toBe("Alice")
  })
})
