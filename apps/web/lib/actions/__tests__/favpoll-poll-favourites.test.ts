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
  hideFavpollPollFavourite,
  showFavpollPollFavourite,
} from "@/lib/actions/favpoll-poll-favourites"

const ITEM_ID = "epi-1"
const FAVPOLL_ID = "favpoll-1"
const ORGANISER_ID = "user-1"
const OTHER_USER_ID = "user-2"

const organiserLookup = {
  favpoll_poll_id: "poll-1",
  favpoll_polls: {
    favpoll_id: FAVPOLL_ID,
    favpolls: { id: FAVPOLL_ID, created_by: ORGANISER_ID },
  },
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: ORGANISER_ID })
  mockRevalidatePath.mockReset()
})

// ─────────────────────────────────────────────────────────────────────────────
// hideFavpollPollFavourite
// ─────────────────────────────────────────────────────────────────────────────

describe("hideFavpollPollFavourite", () => {
  it("throws 'Not authenticated' when userId is null", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })
    await expect(hideFavpollPollFavourite(ITEM_ID)).rejects.toThrow(
      "Not authenticated"
    )
  })

  it("throws when item not found", async () => {
    mock.queue(null, { message: "not found" }) // verifyOrganiser lookup fails
    await expect(hideFavpollPollFavourite(ITEM_ID)).rejects.toThrow(
      "Favpoll poll favourite not found"
    )
  })

  it("throws when caller is not the organiser", async () => {
    mockAuth.mockResolvedValueOnce({ userId: OTHER_USER_ID })
    mock.queue({
      ...organiserLookup,
      favpoll_polls: {
        ...organiserLookup.favpoll_polls,
        favpolls: { id: FAVPOLL_ID, created_by: ORGANISER_ID },
      },
    })
    await expect(hideFavpollPollFavourite(ITEM_ID)).rejects.toThrow(
      "Not authorised"
    )
  })

  it("sets is_hidden=true, hidden_at, hidden_by on the item", async () => {
    mock.queue(organiserLookup) // verifyOrganiser lookup
    mock.queue(null) // update → await

    await hideFavpollPollFavourite(ITEM_ID)

    const updateCall = mock
      .callsFor("favpoll_poll_favourites")
      .find((c) => c.method === "update")!
    expect(updateCall.args[0]).toMatchObject({
      is_hidden: true,
      hidden_by: ORGANISER_ID,
    })
    expect(typeof updateCall.args[0].hidden_at).toBe("string")
  })

  it("revalidates the favpoll path", async () => {
    mock.queue(organiserLookup)
    mock.queue(null)

    await hideFavpollPollFavourite(ITEM_ID)

    expect(mockRevalidatePath).toHaveBeenCalledWith(`/favpolls/${FAVPOLL_ID}`)
  })

  it("throws when update fails", async () => {
    mock.queue(organiserLookup)
    mock.queue(null, { message: "update failed" })

    await expect(hideFavpollPollFavourite(ITEM_ID)).rejects.toThrow(
      "update failed"
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// showFavpollPollFavourite
// ─────────────────────────────────────────────────────────────────────────────

describe("showFavpollPollFavourite", () => {
  it("throws 'Not authenticated' when userId is null", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })
    await expect(showFavpollPollFavourite(ITEM_ID)).rejects.toThrow(
      "Not authenticated"
    )
  })

  it("throws when caller is not the organiser", async () => {
    mockAuth.mockResolvedValueOnce({ userId: OTHER_USER_ID })
    mock.queue({
      ...organiserLookup,
      favpoll_polls: {
        ...organiserLookup.favpoll_polls,
        favpolls: { id: FAVPOLL_ID, created_by: ORGANISER_ID },
      },
    })
    await expect(showFavpollPollFavourite(ITEM_ID)).rejects.toThrow(
      "Not authorised"
    )
  })

  it("clears is_hidden, hidden_at, hidden_by on the item", async () => {
    mock.queue(organiserLookup)
    mock.queue(null)

    await showFavpollPollFavourite(ITEM_ID)

    const updateCall = mock
      .callsFor("favpoll_poll_favourites")
      .find((c) => c.method === "update")!
    expect(updateCall.args[0]).toEqual({
      is_hidden: false,
      hidden_at: null,
      hidden_by: null,
    })
  })

  it("revalidates the favpoll path", async () => {
    mock.queue(organiserLookup)
    mock.queue(null)

    await showFavpollPollFavourite(ITEM_ID)

    expect(mockRevalidatePath).toHaveBeenCalledWith(`/favpolls/${FAVPOLL_ID}`)
  })
})
