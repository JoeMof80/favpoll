// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockAuth = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ userId: "user-1" })
)
const mockEmail = vi.hoisted(() => ({
  sendPledgeConfirmation: vi.fn().mockResolvedValue(undefined),
}))
// Payment verification (lib/stripe-verify) — resolved by default so existing
// happy paths pass; individual tests reject it to prove nothing is recorded.
const mockVerify = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockVerifyTopUp = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }))
vi.mock("@/lib/email", () => mockEmail)
vi.mock("@/lib/stripe-verify", () => ({
  verifyPledgePayment: mockVerify,
  verifyTopUpPayment: mockVerifyTopUp,
}))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

import {
  createPledge,
  createGuestPledge,
  addOrganizerItem,
  topUpFundAsGuest,
  deleteFavpoll,
} from "@/app/favpolls/[id]/actions"

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
  mockEmail.sendPledgeConfirmation.mockResolvedValue(undefined)
  mockVerify.mockReset()
  mockVerify.mockResolvedValue(undefined)
  mockVerifyTopUp.mockReset()
  mockVerifyTopUp.mockResolvedValue(undefined)
})

// ─────────────────────────────────────────────────────────────────────────────
// createPledge
// ─────────────────────────────────────────────────────────────────────────────

describe("createPledge", () => {
  const input = {
    favpollPollId: "poll-1",
    potAllocationId: null,
    totalAmount: 10,
    allocations: [
      { favouriteId: "item-a", amount: 6 },
      { favouriteId: "item-b", amount: 4 },
    ],
    paymentIntentId: "pi_test_123",
  }

  it("throws 'Not authenticated' when userId is null", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })
    await expect(createPledge(input)).rejects.toThrow("Not authenticated")
  })

  it("verifies the PaymentIntent against the recorded amounts", async () => {
    mock.queue(null) // PI-unused check → maybeSingle
    mock.queue({ id: "pledge-1" })
    mock.queue(null)

    await createPledge({ ...input, tipAmount: 1 })

    expect(mockVerify).toHaveBeenCalledWith({
      paymentIntentId: "pi_test_123",
      favpollPollId: "poll-1",
      totalAmount: 10,
      tipAmount: 1,
    })
  })

  it("records nothing when payment verification fails", async () => {
    mockVerify.mockRejectedValueOnce(new Error("Payment has not completed"))

    await expect(createPledge(input)).rejects.toThrow(
      "Payment has not completed"
    )
    expect(mock.callsFor("pledges")).toHaveLength(0)
    expect(mock.callsFor("pledge_allocations")).toHaveLength(0)
  })

  it("rejects a PaymentIntent that was already recorded", async () => {
    mock.queue({ id: "pledge-existing" }) // PI-unused check finds a pledge

    await expect(createPledge(input)).rejects.toThrow(
      "This payment has already been recorded."
    )
    expect(
      mock.callsFor("pledges").filter((c) => c.method === "insert")
    ).toHaveLength(0)
  })

  it("inserts pledge row with zero fee, the tip recorded separately, and the PI id", async () => {
    mock.queue(null) // PI-unused check
    mock.queue({ id: "pledge-1" }) // pledge insert → single()
    mock.queue(null) // allocations insert → await

    await createPledge({ ...input, tipAmount: 1 })

    const pledgeInsert = mock
      .callsFor("pledges")
      .find((c) => c.method === "insert")!
    expect(pledgeInsert.args[0]).toMatchObject({
      favpoll_poll_id: "poll-1",
      clerk_user_id: "user-1",
      total_amount: 10, // charity money only — tip never inflates it
      fee: 0,
      tip_amount: 1,
      payment_intent_id: "pi_test_123",
    })
  })

  it("inserts pledge row with pot_allocation_id when provided", async () => {
    mock.queue(null) // PI-unused check
    mock.queue({ id: "pledge-1" })
    mock.queue(null)

    await createPledge({ ...input, potAllocationId: "pot-alloc-1" })

    const pledgeInsert = mock
      .callsFor("pledges")
      .find((c) => c.method === "insert")!
    expect(pledgeInsert.args[0].pot_allocation_id).toBe("pot-alloc-1")
  })

  it("inserts allocations with pledge_id from the pledge row", async () => {
    mock.queue(null) // PI-unused check
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
    mock.queue(null) // PI-unused check
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
    mock.queue(null) // PI-unused check
    mock.queue(null, { message: "duplicate key" })

    await expect(createPledge(input)).rejects.toThrow("duplicate key")
  })

  it("throws when allocation insert returns an error", async () => {
    mock.queue(null) // PI-unused check
    mock.queue({ id: "pledge-1" }) // pledge insert ok
    mock.queue(null, { message: "FK violation" }) // alloc insert fails

    await expect(createPledge(input)).rejects.toThrow("FK violation")
  })

  it("defaults tip_amount to 0 when no tip is passed", async () => {
    mock.queue(null) // PI-unused check
    mock.queue({ id: "pledge-1" })
    mock.queue(null)

    await createPledge({ ...input, totalAmount: 25 })

    const pledgeInsert = mock
      .callsFor("pledges")
      .find((c) => c.method === "insert")!
    expect(pledgeInsert.args[0].fee).toBe(0)
    expect(pledgeInsert.args[0].tip_amount).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// createGuestPledge
// ─────────────────────────────────────────────────────────────────────────────

describe("createGuestPledge", () => {
  const input = {
    favpollPollId: "poll-1",
    guestEmail: "guest@example.com",
    totalAmount: 10,
    allocations: [{ favouriteId: "item-a", amount: 10 }],
    paymentIntentId: "pi_test_456",
  }

  it("throws 'Email is required' when guestEmail is empty", async () => {
    await expect(
      createGuestPledge({ ...input, guestEmail: "" })
    ).rejects.toThrow("Email is required")
  })

  it("records nothing when payment verification fails", async () => {
    mockVerify.mockRejectedValueOnce(
      new Error("Pledge amount does not match the payment")
    )

    await expect(createGuestPledge(input)).rejects.toThrow(
      "does not match the payment"
    )
    expect(mock.callsFor("pledges")).toHaveLength(0)
  })

  it("throws when a duplicate active pledge exists for the same email + poll", async () => {
    mock.queue(null) // PI-unused check
    mock.queue({ id: "existing-pledge" }) // maybeSingle finds existing

    await expect(createGuestPledge(input)).rejects.toThrow(
      "You've already pledged on this poll"
    )
  })

  it("inserts pledge with clerk_user_id: null, a UUID guest_token, zero fee", async () => {
    mock.queue(null) // PI-unused check
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
    expect(row.fee).toBe(0)
    // guest_token is a UUID
    expect(row.guest_token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
  })

  it("returns the guest_token on success", async () => {
    mock.queue(null) // PI-unused check
    mock.queue(null) // no existing pledge
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
    mock.queue(null) // PI-unused check
    mock.queue(null) // no existing pledge
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
    mock.queue(null) // PI-unused check
    mock.queue(null) // no existing pledge
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
    mock.queue(null) // PI-unused check
    mock.queue(null) // no existing pledge
    mock.queue(null, { message: "insert fail" }) // pledge insert error

    await expect(createGuestPledge(input)).rejects.toThrow("insert fail")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// addOrganizerItem
// ─────────────────────────────────────────────────────────────────────────────

describe("addOrganizerItem", () => {
  const favpollId = "favpoll-1"
  const label = "Red"

  it("throws 'Not authenticated' when userId is null", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })
    await expect(addOrganizerItem(favpollId, label)).rejects.toThrow(
      "Not authenticated"
    )
  })

  it("throws 'Unauthorized' when user is not the favpoll creator", async () => {
    mock.queue({ created_by: "other-user" }) // favpolls select

    await expect(addOrganizerItem(favpollId, label)).rejects.toThrow(
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

    await expect(addOrganizerItem(favpollId, label)).rejects.toThrow(
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

    await addOrganizerItem(favpollId, label)

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

    await addOrganizerItem(favpollId, label)

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

    await addOrganizerItem(favpollId, label)

    const epiInserts = mock
      .callsFor("favpoll_poll_favourites")
      .filter((c) => c.method === "insert")
    expect(epiInserts).toHaveLength(0)
  })

  it("throws 'Label is required' for blank label", async () => {
    await expect(addOrganizerItem(favpollId, "   ")).rejects.toThrow(
      "Label is required"
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// topUpFundAsGuest
// ─────────────────────────────────────────────────────────────────────────────

describe("topUpFundAsGuest", () => {
  it("verifies the top-up payment before crediting the fund", async () => {
    mock.queue("pot-1") // pot_top_up rpc

    await topUpFundAsGuest("favpoll-1", 10, "pi_topup_1")

    expect(mockVerifyTopUp).toHaveBeenCalledWith({
      paymentIntentId: "pi_topup_1",
      favpollId: "favpoll-1",
      topUpAmount: 10,
    })
    const rpcCall = mock.callsFor("rpc:pot_top_up")[0]!
    expect(rpcCall.args[0]).toEqual({
      p_favpoll_id: "favpoll-1",
      p_amount: 10,
      p_payment_intent_id: "pi_topup_1",
      p_clerk_user_id: null,
    })
  })

  it("credits nothing when payment verification fails", async () => {
    mockVerifyTopUp.mockRejectedValueOnce(
      new Error("Top-up amount does not match the payment")
    )

    await expect(
      topUpFundAsGuest("favpoll-1", 10, "pi_topup_1")
    ).rejects.toThrow("does not match the payment")
    expect(mock.callsFor("rpc:pot_top_up")).toHaveLength(0)
  })

  it("rejects a top-up payment that was already recorded", async () => {
    mock.queue(null, {
      message:
        'duplicate key value violates unique constraint "pot_topups_payment_intent_id_key"',
    })

    await expect(
      topUpFundAsGuest("favpoll-1", 10, "pi_topup_1")
    ).rejects.toThrow("This payment has already been recorded.")
  })

  it("throws when the rpc fails", async () => {
    mock.queue(null, { message: "Favpoll not found" })

    await expect(
      topUpFundAsGuest("favpoll-1", 10, "pi_topup_1")
    ).rejects.toThrow("Favpoll not found")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// deleteFavpoll
// ─────────────────────────────────────────────────────────────────────────────

describe("deleteFavpoll", () => {
  const OWNED_EMPTY = {
    created_by: "user-1",
    protagonist_id: "prot-1",
    favpoll_polls: [{ id: "poll-1", pledges: [{ count: 0 }] }],
    favpoll_pots: [{ id: "pot-1", total_deposited: 0 }],
  }

  it("throws Unauthorized when the favpoll belongs to someone else", async () => {
    mock.queue({ ...OWNED_EMPTY, created_by: "other-user" })
    await expect(deleteFavpoll("favpoll-1")).rejects.toThrow("Unauthorized")
  })

  it("refuses when any pledge exists", async () => {
    mock.queue({
      ...OWNED_EMPTY,
      favpoll_polls: [{ id: "poll-1", pledges: [{ count: 2 }] }],
    })
    await expect(deleteFavpoll("favpoll-1")).rejects.toThrow("can't be deleted")
    expect(
      mock.callsFor("favpolls").filter((c) => c.method === "delete")
    ).toHaveLength(0)
  })

  it("refuses when the shared pot holds deposits", async () => {
    mock.queue({
      ...OWNED_EMPTY,
      favpoll_pots: [{ id: "pot-1", total_deposited: 25 }],
    })
    await expect(deleteFavpoll("favpoll-1")).rejects.toThrow("can't be deleted")
  })

  it("deletes children, the favpoll, and the orphaned protagonist", async () => {
    mock.queue(OWNED_EMPTY) // ownership + counts fetch
    mock.queue(null) // favpoll_poll_favourites delete
    mock.queue(null) // favpoll_polls delete
    mock.queue(null) // favpoll_charities delete
    mock.queue(null) // pot_allocations delete
    mock.queue(null) // favpoll_pots delete
    mock.queue(null) // favpolls delete
    mock.queue(null) // protagonists delete

    await deleteFavpoll("favpoll-1")

    for (const table of [
      "favpoll_poll_favourites",
      "favpoll_polls",
      "favpoll_charities",
      "pot_allocations",
      "favpoll_pots",
      "favpolls",
      "protagonists",
    ]) {
      expect(
        mock.callsFor(table).filter((c) => c.method === "delete")
      ).toHaveLength(1)
    }
  })

  it("skips the protagonist delete for cause favpolls", async () => {
    mock.queue({ ...OWNED_EMPTY, protagonist_id: null })
    mock.queue(null) // favpoll_poll_favourites
    mock.queue(null) // favpoll_polls
    mock.queue(null) // favpoll_charities
    mock.queue(null) // pot_allocations
    mock.queue(null) // favpoll_pots
    mock.queue(null) // favpolls

    await deleteFavpoll("favpoll-1")

    expect(
      mock.callsFor("protagonists").filter((c) => c.method === "delete")
    ).toHaveLength(0)
  })
})
