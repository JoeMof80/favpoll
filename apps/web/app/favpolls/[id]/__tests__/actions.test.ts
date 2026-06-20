// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockAuth = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ userId: "user-1" })
)
const mockEmail = vi.hoisted(() => ({
  sendPledgeConfirmation: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }))
vi.mock("@/lib/email", () => mockEmail)

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

import {
  createPledge,
  createGuestPledge,
  addOrganizerItem,
  topUpFundAsGuest,
} from "@/app/favpolls/[id]/actions"

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
  mockEmail.sendPledgeConfirmation.mockResolvedValue(undefined)
})

// ─────────────────────────────────────────────────────────────────────────────
// createPledge
// ─────────────────────────────────────────────────────────────────────────────

describe("createPledge", () => {
  const input = {
    eventPollId: "poll-1",
    potAllocationId: null,
    totalAmount: 10,
    allocations: [
      { favouriteId: "item-a", amount: 6 },
      { favouriteId: "item-b", amount: 4 },
    ],
  }

  it("throws 'Not authenticated' when userId is null", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })
    await expect(createPledge(input)).rejects.toThrow("Not authenticated")
  })

  it("inserts pledge row with correct fee (3% of totalAmount)", async () => {
    mock.queue({ id: "pledge-1" }) // pledge insert → single()
    mock.queue(null) // allocations insert → await

    await createPledge(input)

    const pledgeInsert = mock
      .callsFor("pledges")
      .find((c) => c.method === "insert")!
    expect(pledgeInsert.args[0]).toMatchObject({
      favpoll_poll_id: "poll-1",
      clerk_user_id: "user-1",
      total_amount: 10,
      fee: 0.3, // Math.round(10 * 0.03 * 100) / 100
    })
  })

  it("inserts pledge row with pot_allocation_id when provided", async () => {
    mock.queue({ id: "pledge-1" })
    mock.queue(null)

    await createPledge({ ...input, potAllocationId: "pot-alloc-1" })

    const pledgeInsert = mock
      .callsFor("pledges")
      .find((c) => c.method === "insert")!
    expect(pledgeInsert.args[0].pot_allocation_id).toBe("pot-alloc-1")
  })

  it("inserts allocations with pledge_id from the pledge row", async () => {
    mock.queue({ id: "pledge-99" })
    mock.queue(null)

    await createPledge(input)

    const allocInsert = mock
      .callsFor("pledge_allocations")
      .find((c) => c.method === "insert")!
    expect(allocInsert.args[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pledge_id: "pledge-99",
          favourite_id: "item-a",
          amount: 6,
        }),
        expect.objectContaining({
          pledge_id: "pledge-99",
          favourite_id: "item-b",
          amount: 4,
        }),
      ])
    )
  })

  it("filters out zero-amount allocations before inserting", async () => {
    mock.queue({ id: "pledge-1" })
    mock.queue(null)

    await createPledge({
      ...input,
      allocations: [
        { favouriteId: "item-a", amount: 10 },
        { favouriteId: "item-b", amount: 0 }, // should be excluded
      ],
    })

    const allocInsert = mock
      .callsFor("pledge_allocations")
      .find((c) => c.method === "insert")!
    expect(allocInsert.args[0]).toHaveLength(1)
    expect(allocInsert.args[0][0].favourite_id).toBe("item-a")
  })

  it("throws when pledge insert returns an error", async () => {
    mock.queue(null, { message: "duplicate key" })

    await expect(createPledge(input)).rejects.toThrow("duplicate key")
  })

  it("throws when allocation insert returns an error", async () => {
    mock.queue({ id: "pledge-1" }) // pledge insert ok
    mock.queue(null, { message: "FK violation" }) // alloc insert fails

    await expect(createPledge(input)).rejects.toThrow("FK violation")
  })

  it("calculates fee correctly for £25 pledge", async () => {
    mock.queue({ id: "pledge-1" })
    mock.queue(null)

    await createPledge({ ...input, totalAmount: 25 })

    const pledgeInsert = mock
      .callsFor("pledges")
      .find((c) => c.method === "insert")!
    // Math.round(25 * 0.03 * 100) / 100 = Math.round(75) / 100 = 0.75
    expect(pledgeInsert.args[0].fee).toBe(0.75)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// createGuestPledge
// ─────────────────────────────────────────────────────────────────────────────

describe("createGuestPledge", () => {
  const input = {
    eventPollId: "poll-1",
    guestEmail: "guest@example.com",
    totalAmount: 10,
    allocations: [{ favouriteId: "item-a", amount: 10 }],
  }

  it("throws 'Email is required' when guestEmail is empty", async () => {
    await expect(
      createGuestPledge({ ...input, guestEmail: "" })
    ).rejects.toThrow("Email is required")
  })

  it("throws when a duplicate active pledge exists for the same email + poll", async () => {
    mock.queue({ id: "existing-pledge" }) // maybeSingle finds existing

    await expect(createGuestPledge(input)).rejects.toThrow(
      "You've already pledged on this poll"
    )
  })

  it("inserts pledge with clerk_user_id: null, a UUID guest_token, and fee", async () => {
    mock.queue(null) // no existing pledge (maybeSingle)
    mock.queue({ id: "pledge-1" }) // pledge insert (single)
    mock.queue(null) // allocations insert (await)
    mock.queue({
      // email data fetch (single)
      favpolls: {
        closes_at: "2025-12-01T00:00:00Z",
        protagonists: { name: "Alice" },
        favpoll_charities: [{ charities: { name: "Oxfam" } }],
      },
    })

    await createGuestPledge(input)

    const pledgeInsert = mock
      .callsFor("pledges")
      .find((c) => c.method === "insert")!
    const row = pledgeInsert.args[0]
    expect(row.clerk_user_id).toBeNull()
    expect(row.guest_email).toBe("guest@example.com")
    expect(row.fee).toBe(0.3)
    // guest_token is a UUID
    expect(row.guest_token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
  })

  it("returns the guest_token on success", async () => {
    mock.queue(null)
    mock.queue({ id: "pledge-1" })
    mock.queue(null)
    mock.queue({
      favpolls: {
        closes_at: "2025-12-01T00:00:00Z",
        protagonists: { name: "A" },
        favpoll_charities: [],
      },
    })

    const token = await createGuestPledge(input)

    expect(typeof token).toBe("string")
    expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-/)
  })

  it("calls sendPledgeConfirmation with the correct arguments", async () => {
    mock.queue(null)
    mock.queue({ id: "pledge-1" })
    mock.queue(null)
    mock.queue({
      favpolls: {
        closes_at: "2025-12-01T00:00:00Z",
        protagonists: { name: "Alice" },
        favpoll_charities: [{ charities: { name: "Oxfam" } }],
      },
    })

    await createGuestPledge(input)

    expect(mockEmail.sendPledgeConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "guest@example.com",
        protagonistName: "Alice",
        charityNames: ["Oxfam"],
        amount: 10,
        closesAt: "2025-12-01T00:00:00Z",
        guestToken: expect.any(String),
      })
    )
  })

  it("still returns guest_token even when sendPledgeConfirmation throws", async () => {
    mock.queue(null)
    mock.queue({ id: "pledge-1" })
    mock.queue(null)
    mock.queue({
      favpolls: {
        closes_at: "",
        protagonists: { name: "A" },
        favpoll_charities: [],
      },
    })
    mockEmail.sendPledgeConfirmation.mockRejectedValueOnce(
      new Error("Resend down")
    )

    const token = await createGuestPledge(input)

    expect(typeof token).toBe("string") // email failure was swallowed
  })

  it("throws when pledge insert fails", async () => {
    mock.queue(null) // no existing pledge
    mock.queue(null, { message: "insert fail" }) // pledge insert error

    await expect(createGuestPledge(input)).rejects.toThrow("insert fail")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// addOrganizerItem
// ─────────────────────────────────────────────────────────────────────────────

describe("addOrganizerItem", () => {
  const eventId = "event-1"
  const label = "Red"

  it("throws 'Not authenticated' when userId is null", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })
    await expect(addOrganizerItem(eventId, label)).rejects.toThrow(
      "Not authenticated"
    )
  })

  it("throws 'Unauthorized' when user is not the favpoll creator", async () => {
    mock.queue({ created_by: "other-user" }) // favpolls select

    await expect(addOrganizerItem(eventId, label)).rejects.toThrow(
      "Unauthorized"
    )
  })

  it("throws when the favpoll poll topic is finite", async () => {
    mock.queue({ created_by: "user-1" }) // favpolls select
    mock.queue({
      id: "poll-1",
      topic_id: "topic-1",
      topics: { is_finite: true },
    }) // favpoll_polls select

    await expect(addOrganizerItem(eventId, label)).rejects.toThrow(
      "Cannot add favourites to a finite topic"
    )
  })

  it("reuses existing favourite when label matches case-insensitively", async () => {
    mock.queue({ created_by: "user-1" }) // favpolls
    mock.queue({
      id: "poll-1",
      topic_id: "topic-1",
      topics: { is_finite: false },
    }) // favpoll_polls
    mock.queue({ id: "item-existing" }) // favourites ilike match
    mock.queue(null) // no existing favpoll_poll_favourite
    mock.queue(null) // favpoll_poll_favourites insert

    await addOrganizerItem(eventId, label)

    // Should NOT have inserted a new favourite
    const topicItemInserts = mock
      .callsFor("favourites")
      .filter((c) => c.method === "insert")
    expect(topicItemInserts).toHaveLength(0)

    const epiInsert = mock
      .callsFor("favpoll_poll_favourites")
      .find((c) => c.method === "insert")!
    expect(epiInsert.args[0]).toMatchObject({
      favpoll_poll_id: "poll-1",
      favourite_id: "item-existing",
      is_guest_added: false,
      added_by: "user-1",
    })
  })

  it("creates a new favourite and favpoll_poll_favourite when no match exists", async () => {
    mock.queue({ created_by: "user-1" }) // favpolls
    mock.queue({
      id: "poll-1",
      topic_id: "topic-1",
      topics: { is_finite: false },
    }) // favpoll_polls
    mock.queue(null) // no existing favourite
    mock.queue({ id: "item-new" }) // favourites insert
    mock.queue(null) // no existing favpoll_poll_favourite
    mock.queue(null) // favpoll_poll_favourites insert

    await addOrganizerItem(eventId, label)

    const topicItemInsert = mock
      .callsFor("favourites")
      .find((c) => c.method === "insert")!
    expect(topicItemInsert.args[0]).toMatchObject({
      topic_id: "topic-1",
      label: "Red",
      source: "organiser",
      is_canonical: false,
      review_status: "pending_review",
      markets: ["en-GB"],
    })

    const epiInsert = mock
      .callsFor("favpoll_poll_favourites")
      .find((c) => c.method === "insert")!
    expect(epiInsert.args[0]).toMatchObject({
      favpoll_poll_id: "poll-1",
      favourite_id: "item-new",
      is_guest_added: false,
    })
  })

  it("skips favpoll_poll_favourites insert when item already in poll (idempotent)", async () => {
    mock.queue({ created_by: "user-1" }) // favpolls
    mock.queue({
      id: "poll-1",
      topic_id: "topic-1",
      topics: { is_finite: false },
    }) // favpoll_polls
    mock.queue({ id: "item-existing" }) // favourites ilike match
    mock.queue({ id: "epi-1" }) // favpoll_poll_favourites already exists

    await addOrganizerItem(eventId, label)

    const epiInserts = mock
      .callsFor("favpoll_poll_favourites")
      .filter((c) => c.method === "insert")
    expect(epiInserts).toHaveLength(0)
  })

  it("throws 'Label is required' for blank label", async () => {
    await expect(addOrganizerItem(eventId, "   ")).rejects.toThrow(
      "Label is required"
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// topUpFundAsGuest
// ─────────────────────────────────────────────────────────────────────────────

describe("topUpFundAsGuest", () => {
  it("throws when no pot exists for the favpoll", async () => {
    mock.queue(null) // no pot returned (maybeSingle → null via single)

    await expect(topUpFundAsGuest("event-1", 10)).rejects.toThrow(
      "No shared fund found for this favpoll"
    )
  })

  it("updates total_deposited by adding the amount to the existing balance", async () => {
    mock.queue({ id: "pot-1", total_deposited: 50 }) // pot select
    mock.queue(null) // pot update

    await topUpFundAsGuest("event-1", 10)

    const potUpdate = mock
      .callsFor("favpoll_pots")
      .find((c) => c.method === "update")!
    expect(potUpdate.args[0]).toEqual({ total_deposited: 60 })
  })

  it("throws when the update fails", async () => {
    mock.queue({ id: "pot-1", total_deposited: 50 })
    mock.queue(null, { message: "update failed" })

    await expect(topUpFundAsGuest("event-1", 10)).rejects.toThrow(
      "update failed"
    )
  })
})
