import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import type { EventWithDetails, EventPollWithItems, Protagonist, Charity } from "@/types"

// --- mocks (must be declared before vi.mock calls) ---

const mockRouter = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
const mockActions = vi.hoisted(() => ({
  addGuestItem: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("next/navigation", () => ({ useRouter: () => mockRouter }))
vi.mock("@/app/events/[id]/actions", () => mockActions)

// --- fixtures ---

import { useEventContent } from "@/components/event-content/use-event-content"

const protagonist: Protagonist = {
  id: "prot-1",
  name: "Alice",
  date_label: null,
  bio: null,
  photo_url: null,
  created_by: "user-1",
  created_at: "2024-01-01T00:00:00Z",
}

const charity: Charity = {
  id: "char-1",
  name: "Oxfam",
  description: null,
  logo_url: null,
  registered_number: null,
  created_at: "2024-01-01T00:00:00Z",
}

function makeEvent(overrides: Partial<EventWithDetails> = {}): EventWithDetails {
  return {
    id: "event-1",
    protagonist_id: "prot-1",
    occasion: "birthday",
    occasion_label: null,
    created_by: "user-1",
    closes_at: "2025-12-01T23:59:00Z",
    original_closes_at: null,
    hard_close_at: null,
    extension_count: 0,
    closed_at: null,
    total_raised: 0,
    is_private: false,
    description: null,
    created_at: "2024-01-01T00:00:00Z",
    protagonists: protagonist,
    event_charities: [{ charities: charity }],
    ...overrides,
  }
}

function makePoll(
  id: string,
  isFinite = false
): EventPollWithItems {
  return {
    id,
    event_id: "event-1",
    topic_id: "topic-1",
    personal_framing: null,
    personal_reveal: null,
    created_at: "2024-01-01T00:00:00Z",
    topics: {
      id: "topic-1",
      title: "Colour",
      description: null,
      is_finite: isFinite,
      is_active: true,
      created_by: null,
      created_at: "2024-01-01T00:00:00Z",
      topic_items: [],
    },
  }
}

const event = makeEvent()
const poll = makePoll("poll-1")
const finitePoll = makePoll("finite-poll", true)

describe("useEventContent — initial state", () => {
  it("starts with empty pledgeAmount", () => {
    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: false, clerkUserId: "user-1" })
    )
    expect(result.current.pledgeAmount).toBe("")
  })

  it("starts with empty pollSelections", () => {
    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: false, clerkUserId: "user-1" })
    )
    expect(result.current.pollSelections).toEqual({})
  })

  it("starts with empty confirmedPollIds", () => {
    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: false, clerkUserId: "user-1" })
    )
    expect(result.current.confirmedPollIds.size).toBe(0)
  })
})

describe("useEventContent — handleSelectionsChange", () => {
  it("updates pollSelections for a given pollId", () => {
    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: false, clerkUserId: "user-1" })
    )
    act(() => {
      result.current.handleSelectionsChange("poll-1", ["item-a", "item-b"])
    })
    expect(result.current.pollSelections["poll-1"]).toEqual(["item-a", "item-b"])
  })

  it("preserves other polls' selections when updating one", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollsWithItems: [poll, makePoll("poll-2")],
        isClosed: false,
        clerkUserId: "user-1",
      })
    )
    act(() => {
      result.current.handleSelectionsChange("poll-1", ["item-a"])
      result.current.handleSelectionsChange("poll-2", ["item-b"])
    })
    expect(result.current.pollSelections["poll-1"]).toEqual(["item-a"])
    expect(result.current.pollSelections["poll-2"]).toEqual(["item-b"])
  })
})

describe("useEventContent — handlePledgeSuccess", () => {
  it("adds confirmed poll IDs to the set", () => {
    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: false, clerkUserId: "user-1" })
    )
    act(() => {
      result.current.handlePledgeSuccess(["poll-1", "poll-2"])
    })
    expect(result.current.confirmedPollIds.has("poll-1")).toBe(true)
    expect(result.current.confirmedPollIds.has("poll-2")).toBe(true)
  })

  it("accumulates IDs across multiple calls", () => {
    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: false, clerkUserId: "user-1" })
    )
    act(() => { result.current.handlePledgeSuccess(["poll-1"]) })
    act(() => { result.current.handlePledgeSuccess(["poll-2"]) })
    expect(result.current.confirmedPollIds.size).toBe(2)
  })
})

describe("useEventContent — addItemHandler", () => {
  it("returns undefined for a finite topic", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollsWithItems: [finitePoll],
        isClosed: false,
        clerkUserId: "user-1",
      })
    )
    expect(result.current.addItemHandler(finitePoll)).toBeUndefined()
  })

  it("returns undefined when event is closed", () => {
    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: true, clerkUserId: "user-1" })
    )
    expect(result.current.addItemHandler(poll)).toBeUndefined()
  })

  it("returns undefined when clerkUserId is null (guest)", () => {
    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: false, clerkUserId: null })
    )
    expect(result.current.addItemHandler(poll)).toBeUndefined()
  })

  it("returns a function for an infinite, open poll with logged-in user", () => {
    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: false, clerkUserId: "user-1" })
    )
    expect(typeof result.current.addItemHandler(poll)).toBe("function")
  })

  it("calls addGuestItem and router.refresh when the handler is invoked", async () => {
    mockRouter.refresh.mockClear()
    mockActions.addGuestItem.mockClear()

    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: false, clerkUserId: "user-1" })
    )
    const handler = result.current.addItemHandler(poll)!
    await act(async () => { await handler("Mauve") })

    expect(mockActions.addGuestItem).toHaveBeenCalledWith(poll.id, poll.topic_id, "Mauve")
    expect(mockRouter.refresh).toHaveBeenCalled()
  })
})

describe("useEventContent — derived values", () => {
  it("showPledgeCard is true when not closed", () => {
    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: false, clerkUserId: "user-1" })
    )
    expect(result.current.showPledgeCard).toBe(true)
  })

  it("showPledgeCard is false when closed", () => {
    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: true, clerkUserId: "user-1" })
    )
    expect(result.current.showPledgeCard).toBe(false)
  })

  it("isOrganiser is true when clerkUserId matches event.created_by", () => {
    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: false, clerkUserId: "user-1" })
    )
    expect(result.current.isOrganiser).toBe(true)
  })

  it("isOrganiser is false for a different user", () => {
    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: false, clerkUserId: "user-2" })
    )
    expect(result.current.isOrganiser).toBe(false)
  })

  it("isOrganiser is false when clerkUserId is null", () => {
    const { result } = renderHook(() =>
      useEventContent({ event, pollsWithItems: [poll], isClosed: false, clerkUserId: null })
    )
    expect(result.current.isOrganiser).toBe(false)
  })
})
