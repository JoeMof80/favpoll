// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockAuth = vi.hoisted(() => vi.fn().mockResolvedValue({ userId: "user-1" }))
const mockEmail = vi.hoisted(() => ({
  sendPledgeConfirmation: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }))
vi.mock("@/lib/email", () => mockEmail)

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => mock.supabase }))

import { createPledge, createGuestPledge } from "@/app/events/[id]/actions"

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
      { topicItemId: "item-a", amount: 6 },
      { topicItemId: "item-b", amount: 4 },
    ],
  }

  it("throws 'Not authenticated' when userId is null", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })
    await expect(createPledge(input)).rejects.toThrow("Not authenticated")
  })

  it("inserts pledge row with correct fee (3% of totalAmount)", async () => {
    mock.queue({ id: "pledge-1" })  // pledge insert → single()
    mock.queue(null)                 // allocations insert → await

    await createPledge(input)

    const pledgeInsert = mock.callsFor("pledges").find((c) => c.method === "insert")!
    expect(pledgeInsert.args[0]).toMatchObject({
      event_poll_id: "poll-1",
      clerk_user_id: "user-1",
      total_amount: 10,
      fee: 0.3, // Math.round(10 * 0.03 * 100) / 100
    })
  })

  it("inserts pledge row with pot_allocation_id when provided", async () => {
    mock.queue({ id: "pledge-1" })
    mock.queue(null)

    await createPledge({ ...input, potAllocationId: "pot-alloc-1" })

    const pledgeInsert = mock.callsFor("pledges").find((c) => c.method === "insert")!
    expect(pledgeInsert.args[0].pot_allocation_id).toBe("pot-alloc-1")
  })

  it("inserts allocations with pledge_id from the pledge row", async () => {
    mock.queue({ id: "pledge-99" })
    mock.queue(null)

    await createPledge(input)

    const allocInsert = mock.callsFor("pledge_allocations").find((c) => c.method === "insert")!
    expect(allocInsert.args[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ pledge_id: "pledge-99", topic_item_id: "item-a", amount: 6 }),
        expect.objectContaining({ pledge_id: "pledge-99", topic_item_id: "item-b", amount: 4 }),
      ])
    )
  })

  it("filters out zero-amount allocations before inserting", async () => {
    mock.queue({ id: "pledge-1" })
    mock.queue(null)

    await createPledge({
      ...input,
      allocations: [
        { topicItemId: "item-a", amount: 10 },
        { topicItemId: "item-b", amount: 0 }, // should be excluded
      ],
    })

    const allocInsert = mock.callsFor("pledge_allocations").find((c) => c.method === "insert")!
    expect(allocInsert.args[0]).toHaveLength(1)
    expect(allocInsert.args[0][0].topic_item_id).toBe("item-a")
  })

  it("throws when pledge insert returns an error", async () => {
    mock.queue(null, { message: "duplicate key" })

    await expect(createPledge(input)).rejects.toThrow("duplicate key")
  })

  it("throws when allocation insert returns an error", async () => {
    mock.queue({ id: "pledge-1" })        // pledge insert ok
    mock.queue(null, { message: "FK violation" }) // alloc insert fails

    await expect(createPledge(input)).rejects.toThrow("FK violation")
  })

  it("calculates fee correctly for £25 pledge", async () => {
    mock.queue({ id: "pledge-1" })
    mock.queue(null)

    await createPledge({ ...input, totalAmount: 25 })

    const pledgeInsert = mock.callsFor("pledges").find((c) => c.method === "insert")!
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
    allocations: [{ topicItemId: "item-a", amount: 10 }],
  }

  it("throws 'Email is required' when guestEmail is empty", async () => {
    await expect(createGuestPledge({ ...input, guestEmail: "" }))
      .rejects.toThrow("Email is required")
  })

  it("throws when a duplicate active pledge exists for the same email + poll", async () => {
    mock.queue({ id: "existing-pledge" }) // maybeSingle finds existing

    await expect(createGuestPledge(input)).rejects.toThrow(
      "You've already pledged on this poll"
    )
  })

  it("inserts pledge with clerk_user_id: null, a UUID guest_token, and fee", async () => {
    mock.queue(null)                   // no existing pledge (maybeSingle)
    mock.queue({ id: "pledge-1" })     // pledge insert (single)
    mock.queue(null)                   // allocations insert (await)
    mock.queue({                       // email data fetch (single)
      events: {
        closes_at: "2025-12-01T00:00:00Z",
        protagonists: { name: "Alice" },
        event_charities: [{ charities: { name: "Oxfam" } }],
      },
    })

    await createGuestPledge(input)

    const pledgeInsert = mock.callsFor("pledges").find((c) => c.method === "insert")!
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
    mock.queue({ events: { closes_at: "2025-12-01T00:00:00Z", protagonists: { name: "A" }, event_charities: [] } })

    const token = await createGuestPledge(input)

    expect(typeof token).toBe("string")
    expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-/)
  })

  it("calls sendPledgeConfirmation with the correct arguments", async () => {
    mock.queue(null)
    mock.queue({ id: "pledge-1" })
    mock.queue(null)
    mock.queue({
      events: {
        closes_at: "2025-12-01T00:00:00Z",
        protagonists: { name: "Alice" },
        event_charities: [{ charities: { name: "Oxfam" } }],
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
    mock.queue({ events: { closes_at: "", protagonists: { name: "A" }, event_charities: [] } })
    mockEmail.sendPledgeConfirmation.mockRejectedValueOnce(new Error("Resend down"))

    const token = await createGuestPledge(input)

    expect(typeof token).toBe("string") // email failure was swallowed
  })

  it("throws when pledge insert fails", async () => {
    mock.queue(null)                            // no existing pledge
    mock.queue(null, { message: "insert fail" }) // pledge insert error

    await expect(createGuestPledge(input)).rejects.toThrow("insert fail")
  })
})
