import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import type {
  FavpollWithDetails,
  FavpollPollWithItems,
  Protagonist,
  Charity,
} from "@favpoll/types"

// --- mocks (must be declared before vi.mock calls) ---

const mockRouter = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
const mockActions = vi.hoisted(() => ({
  addGuestItem: vi.fn().mockResolvedValue(undefined),
  addOrganizerItem: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("next/navigation", () => ({ useRouter: () => mockRouter }))
vi.mock("@/app/favpolls/[id]/actions", () => mockActions)

// --- fixtures ---

import { useEventContent } from "@/components/event-content/use-event-content"

const protagonist: Protagonist = {
  id: "prot-1",
  name: "Alice",
  context: null,
  about: null,
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

function makeEvent(
  overrides: Partial<FavpollWithDetails> = {}
): FavpollWithDetails {
  return {
    id: "event-1",
    protagonist_id: "prot-1",
    subject: "someone" as const,
    cause_label: null,
    occasion_type: "Birthday",
    opening_line: null,
    market: "en-GB",
    created_by: "user-1",
    closes_at: "2025-12-01T23:59:00Z",
    original_closes_at: null,
    hard_close_at: null,
    extension_count: 0,
    closed_at: null,
    total_raised: 0,
    is_plural: null,
    is_private: false,
    description: null,
    created_at: "2024-01-01T00:00:00Z",
    protagonists: protagonist,
    favpoll_charities: [{ charities: charity }],
    ...overrides,
  }
}

function makePoll(id: string, isFinite = false): FavpollPollWithItems {
  return {
    id,
    favpoll_id: "event-1",
    topic_id: "topic-1",
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
      favourites: [],
    },
  }
}

const event = makeEvent()
const poll = makePoll("poll-1")
const finitePoll = makePoll("finite-poll", true)

describe("useEventContent — initial state", () => {
  it("starts with empty pledgeAmount", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: poll,
        isClosed: false,
        hasPledged: false,
        clerkUserId: "user-1",
      })
    )
    expect(result.current.pledgeAmount).toBe("")
  })

  it("starts with empty pollSelections", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: poll,
        isClosed: false,
        hasPledged: false,
        clerkUserId: "user-1",
      })
    )
    expect(result.current.pollSelections).toEqual({})
  })

  it("starts with pledgeConfirmed as false", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: poll,
        isClosed: false,
        hasPledged: false,
        clerkUserId: "user-1",
      })
    )
    expect(result.current.pledgeConfirmed).toBe(false)
  })
})

describe("useEventContent — handleSelectionsChange", () => {
  it("updates pollSelections for a given pollId", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: poll,
        isClosed: false,
        hasPledged: false,
        clerkUserId: "user-1",
      })
    )
    act(() => {
      result.current.handleSelectionsChange("poll-1", ["item-a", "item-b"])
    })
    expect(result.current.pollSelections["poll-1"]).toEqual([
      "item-a",
      "item-b",
    ])
  })

  it("allows updating the poll's selections multiple times", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: poll,
        isClosed: false,
        hasPledged: false,
        clerkUserId: "user-1",
      })
    )
    act(() => {
      result.current.handleSelectionsChange("poll-1", ["item-a"])
    })
    act(() => {
      result.current.handleSelectionsChange("poll-1", ["item-a", "item-b"])
    })
    expect(result.current.pollSelections["poll-1"]).toEqual([
      "item-a",
      "item-b",
    ])
  })
})

describe("useEventContent — handlePledgeSuccess", () => {
  it("sets pledgeConfirmed to true", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: poll,
        isClosed: false,
        hasPledged: false,
        clerkUserId: "user-1",
      })
    )
    act(() => {
      result.current.handlePledgeSuccess()
    })
    expect(result.current.pledgeConfirmed).toBe(true)
  })
})

describe("useEventContent — addItemHandler", () => {
  it("returns undefined for a finite topic", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: finitePoll,
        isClosed: false,
        hasPledged: false,
        clerkUserId: "user-1",
      })
    )
    expect(result.current.addItemHandler(finitePoll)).toBeUndefined()
  })

  it("returns undefined when event is closed", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: poll,
        isClosed: true,
        hasPledged: false,
        clerkUserId: "user-1",
      })
    )
    expect(result.current.addItemHandler(poll)).toBeUndefined()
  })

  it("returns undefined when clerkUserId is null (guest)", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: poll,
        isClosed: false,
        hasPledged: false,
        clerkUserId: null,
      })
    )
    expect(result.current.addItemHandler(poll)).toBeUndefined()
  })

  it("returns a function for the organiser that calls addOrganizerItem", async () => {
    mockRouter.refresh.mockClear()
    mockActions.addOrganizerItem.mockClear()

    // event.created_by is "user-1" — same as clerkUserId means organiser
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: poll,
        isClosed: false,
        hasPledged: false,
        clerkUserId: "user-1",
      })
    )
    const handler = result.current.addItemHandler(poll)!
    expect(typeof handler).toBe("function")

    await act(async () => {
      await handler("Scarlet")
    })

    expect(mockActions.addOrganizerItem).toHaveBeenCalledWith(
      "event-1",
      "Scarlet"
    )
    expect(mockRouter.refresh).toHaveBeenCalled()
  })

  it("returns a function for an infinite, open poll with a non-organiser logged-in user", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: poll,
        isClosed: false,
        hasPledged: false,
        clerkUserId: "user-2", // guest — different from event.created_by ("user-1")
      })
    )
    expect(typeof result.current.addItemHandler(poll)).toBe("function")
  })

  it("calls addGuestItem and router.refresh when the handler is invoked", async () => {
    mockRouter.refresh.mockClear()
    mockActions.addGuestItem.mockClear()

    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: poll,
        isClosed: false,
        hasPledged: false,
        clerkUserId: "user-2", // guest — different from event.created_by ("user-1")
      })
    )
    const handler = result.current.addItemHandler(poll)!
    await act(async () => {
      await handler("Mauve")
    })

    expect(mockActions.addGuestItem).toHaveBeenCalledWith(
      poll.id,
      poll.topic_id,
      "Mauve"
    )
    expect(mockRouter.refresh).toHaveBeenCalled()
  })
})

describe("useEventContent — derived values", () => {
  it("showPledgeCard is true when not closed and poll is set", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: poll,
        isClosed: false,
        hasPledged: false,
        clerkUserId: "user-1",
      })
    )
    expect(result.current.showPledgeCard).toBe(true)
  })

  it("showPledgeCard is false when closed", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: poll,
        isClosed: true,
        hasPledged: false,
        clerkUserId: "user-1",
      })
    )
    expect(result.current.showPledgeCard).toBe(false)
  })

  it("showPledgeCard is false when pollWithItems is null", () => {
    const { result } = renderHook(() =>
      useEventContent({
        event,
        pollWithItems: null,
        isClosed: false,
        hasPledged: false,
        clerkUserId: "user-1",
      })
    )
    expect(result.current.showPledgeCard).toBe(false)
  })
})
