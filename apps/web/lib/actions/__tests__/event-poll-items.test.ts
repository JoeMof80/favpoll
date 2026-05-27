// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockAuth = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ userId: "user-1" })
)
const mockRevalidatePath = vi.hoisted(() => vi.fn())

vi.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }))
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidatePath }))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

import {
  hideEventPollItem,
  showEventPollItem,
} from "@/lib/actions/event-poll-items"

const ITEM_ID = "epi-1"
const EVENT_ID = "event-1"
const ORGANISER_ID = "user-1"
const OTHER_USER_ID = "user-2"

const organiserLookup = {
  event_poll_id: "poll-1",
  event_polls: {
    event_id: EVENT_ID,
    events: { id: EVENT_ID, created_by: ORGANISER_ID },
  },
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: ORGANISER_ID })
  mockRevalidatePath.mockReset()
})

// ─────────────────────────────────────────────────────────────────────────────
// hideEventPollItem
// ─────────────────────────────────────────────────────────────────────────────

describe("hideEventPollItem", () => {
  it("throws 'Not authenticated' when userId is null", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })
    await expect(hideEventPollItem(ITEM_ID)).rejects.toThrow(
      "Not authenticated"
    )
  })

  it("throws when item not found", async () => {
    mock.queue(null, { message: "not found" }) // verifyOrganiser lookup fails
    await expect(hideEventPollItem(ITEM_ID)).rejects.toThrow(
      "Event poll item not found"
    )
  })

  it("throws when caller is not the organiser", async () => {
    mockAuth.mockResolvedValueOnce({ userId: OTHER_USER_ID })
    mock.queue({
      ...organiserLookup,
      event_polls: {
        ...organiserLookup.event_polls,
        events: { id: EVENT_ID, created_by: ORGANISER_ID },
      },
    })
    await expect(hideEventPollItem(ITEM_ID)).rejects.toThrow("Not authorised")
  })

  it("sets is_hidden=true, hidden_at, hidden_by on the item", async () => {
    mock.queue(organiserLookup) // verifyOrganiser lookup
    mock.queue(null) // update → await

    await hideEventPollItem(ITEM_ID)

    const updateCall = mock
      .callsFor("event_poll_items")
      .find((c) => c.method === "update")!
    expect(updateCall.args[0]).toMatchObject({
      is_hidden: true,
      hidden_by: ORGANISER_ID,
    })
    expect(typeof updateCall.args[0].hidden_at).toBe("string")
  })

  it("revalidates the event path", async () => {
    mock.queue(organiserLookup)
    mock.queue(null)

    await hideEventPollItem(ITEM_ID)

    expect(mockRevalidatePath).toHaveBeenCalledWith(`/events/${EVENT_ID}`)
  })

  it("throws when update fails", async () => {
    mock.queue(organiserLookup)
    mock.queue(null, { message: "update failed" })

    await expect(hideEventPollItem(ITEM_ID)).rejects.toThrow("update failed")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// showEventPollItem
// ─────────────────────────────────────────────────────────────────────────────

describe("showEventPollItem", () => {
  it("throws 'Not authenticated' when userId is null", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })
    await expect(showEventPollItem(ITEM_ID)).rejects.toThrow(
      "Not authenticated"
    )
  })

  it("throws when caller is not the organiser", async () => {
    mockAuth.mockResolvedValueOnce({ userId: OTHER_USER_ID })
    mock.queue({
      ...organiserLookup,
      event_polls: {
        ...organiserLookup.event_polls,
        events: { id: EVENT_ID, created_by: ORGANISER_ID },
      },
    })
    await expect(showEventPollItem(ITEM_ID)).rejects.toThrow("Not authorised")
  })

  it("clears is_hidden, hidden_at, hidden_by on the item", async () => {
    mock.queue(organiserLookup)
    mock.queue(null)

    await showEventPollItem(ITEM_ID)

    const updateCall = mock
      .callsFor("event_poll_items")
      .find((c) => c.method === "update")!
    expect(updateCall.args[0]).toEqual({
      is_hidden: false,
      hidden_at: null,
      hidden_by: null,
    })
  })

  it("revalidates the event path", async () => {
    mock.queue(organiserLookup)
    mock.queue(null)

    await showEventPollItem(ITEM_ID)

    expect(mockRevalidatePath).toHaveBeenCalledWith(`/events/${EVENT_ID}`)
  })
})
