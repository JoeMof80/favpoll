// @vitest-environment node
//
// The route that decides what a card is charged. It was the only money path
// in the app with no test of its own (#1102), which is a poor place for the
// gap: every pledge and every pot top-up is priced here, and `lib/stripe-verify`
// later trusts this PaymentIntent's metadata when deciding what a pledge may
// record. These tests pin the behaviour that exists; none of them ask it to
// change.
import { describe, it, expect, vi, beforeEach } from "vitest"

const mockStripe = vi.hoisted(() => ({
  create: vi.fn(),
}))
vi.mock("stripe", () => ({
  default: class {
    paymentIntents = { create: mockStripe.create }
  },
}))

const mockAuth = vi.hoisted(() => ({ userId: null as string | null }))
vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: mockAuth.userId }),
}))

const mockLimit = vi.hoisted(() => ({ limited: false }))
vi.mock("@/lib/rate-limit", () => ({
  isRateLimited: async () => mockLimit.limited,
  ipFromHeaders: () => "1.2.3.4",
  RATE_LIMIT_MESSAGE: "Too many attempts",
}))

const mockConsent = vi.hoisted(() => ({
  posture: "open" as "open" | "consent-first",
  byPoll: vi.fn(async () => {}),
  byFavpoll: vi.fn(async () => {}),
}))
vi.mock("@/lib/charity-consent", () => ({
  consentPosture: () => mockConsent.posture,
  assertPledgeableCharitiesByPoll: mockConsent.byPoll,
  assertPledgeableCharitiesByFavpoll: mockConsent.byFavpoll,
}))

const mockAdmin = vi.hoisted(() => ({ created: 0 }))
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => {
    mockAdmin.created += 1
    return {}
  },
}))

import { POST } from "@/app/api/stripe/payment-intent/route"

function post(body: unknown): Request {
  return new Request("http://localhost/api/stripe/payment-intent", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

/** The arguments the route handed Stripe. */
function charge() {
  return mockStripe.create.mock.calls.at(-1)?.[0]
}

beforeEach(() => {
  mockStripe.create.mockReset()
  mockStripe.create.mockResolvedValue({
    client_secret: "pi_test_secret",
    id: "pi_test",
  })
  mockAuth.userId = null
  mockLimit.limited = false
  mockConsent.posture = "open"
  mockConsent.byPoll.mockClear()
  mockConsent.byFavpoll.mockClear()
  mockAdmin.created = 0
})

describe("the charge is computed server-side", () => {
  it("charges the sum of the parts, in pence", async () => {
    await POST(
      post({
        pledgeAmount: 18,
        tipAmount: 2,
        topUpAmount: 5,
        favpollPollId: "poll-1",
      })
    )
    expect(charge().amount).toBe(2500)
    expect(charge().currency).toBe("gbp")
  })

  it("ignores an amount the client supplies", async () => {
    await POST(
      post({
        pledgeAmount: 5,
        favpollPollId: "poll-1",
        // None of these are part of the route's contract. A client that
        // sends them must not change what it is charged.
        amount: 999_999,
        totalPence: 999_999,
        total: 999_999,
      })
    )
    expect(charge().amount).toBe(500)
  })

  it("treats a missing part as zero rather than refusing", async () => {
    await POST(post({ pledgeAmount: 10, favpollPollId: "poll-1" }))
    expect(charge().amount).toBe(1000)
    expect(charge().metadata.tip_amount).toBe("0")
    expect(charge().metadata.topup_amount).toBe("0")
  })

  it("adds no fee to the charge", async () => {
    await POST(post({ pledgeAmount: 20, favpollPollId: "poll-1" }))
    expect(charge().amount).toBe(2000)
    expect(charge().metadata.fee_amount).toBe("0")
  })

  it("rounds the sum to the penny rather than carrying float error", async () => {
    await POST(
      post({ pledgeAmount: 0.1, tipAmount: 0.2, favpollPollId: "poll-1" })
    )
    expect(charge().amount).toBe(30)
  })
})

describe("what it refuses", () => {
  const bad = async (body: unknown) => {
    const res = await POST(post(body))
    expect(res.status).toBe(400)
    expect(mockStripe.create).not.toHaveBeenCalled()
    return (await res.json()).error as string
  }

  it("refuses a total of zero", async () => {
    expect(await bad({ pledgeAmount: 0, favpollPollId: "poll-1" })).toBe(
      "Invalid amount"
    )
  })

  it("refuses a negative part", async () => {
    await bad({ pledgeAmount: -5, favpollPollId: "poll-1" })
  })

  it("refuses a part above the ten-thousand ceiling", async () => {
    await bad({ pledgeAmount: 10_001, favpollPollId: "poll-1" })
  })

  it("allows a part at exactly the ceiling", async () => {
    await POST(post({ pledgeAmount: 10_000, favpollPollId: "poll-1" }))
    expect(charge().amount).toBe(1_000_000)
  })

  it("refuses a sub-penny fraction", async () => {
    await bad({ pledgeAmount: 1.005, favpollPollId: "poll-1" })
  })

  it("refuses a part that is not a number", async () => {
    await bad({ pledgeAmount: "lots", favpollPollId: "poll-1" })
  })

  it("refuses infinity", async () => {
    await bad({ pledgeAmount: Number.POSITIVE_INFINITY, favpollPollId: "p" })
  })

  it("refuses a pledge with no poll to bind it to", async () => {
    expect(await bad({ pledgeAmount: 10 })).toBe("Missing poll")
  })

  it("allows a pot top-up with no poll, since it pledges nothing", async () => {
    await POST(post({ topUpAmount: 25, favpollId: "favpoll-1" }))
    expect(charge().amount).toBe(2500)
  })
})

describe("the PaymentIntent carries what verification will check", () => {
  it("binds the poll and the favpoll, and records each part", async () => {
    await POST(
      post({
        pledgeAmount: 18,
        tipAmount: 2,
        topUpAmount: 1,
        favpollPollId: "poll-1",
        favpollId: "favpoll-1",
      })
    )
    expect(charge().metadata).toMatchObject({
      favpoll_poll_id: "poll-1",
      favpoll_id: "favpoll-1",
      pledge_amount: "18",
      tip_amount: "2",
      topup_amount: "1",
      fee_amount: "0",
    })
  })

  it("records the signed-in user, and omits the field for a guest", async () => {
    mockAuth.userId = "user_abc"
    await POST(post({ pledgeAmount: 5, favpollPollId: "poll-1" }))
    expect(charge().metadata.clerk_user_id).toBe("user_abc")

    mockAuth.userId = null
    await POST(post({ pledgeAmount: 5, favpollPollId: "poll-1" }))
    expect(charge().metadata).not.toHaveProperty("clerk_user_id")
  })

  it("ignores a poll id that is not a string", async () => {
    await POST(post({ topUpAmount: 5, favpollId: { nested: "object" } }))
    expect(charge().metadata).not.toHaveProperty("favpoll_id")
  })

  it("pins card only, so no redirect method can reach a flow with no return url", async () => {
    await POST(post({ pledgeAmount: 5, favpollPollId: "poll-1" }))
    expect(charge().payment_method_types).toEqual(["card"])
  })

  it("returns the client secret and the intent id", async () => {
    const res = await POST(post({ pledgeAmount: 5, favpollPollId: "poll-1" }))
    expect(await res.json()).toEqual({
      clientSecret: "pi_test_secret",
      paymentIntentId: "pi_test",
    })
  })
})

describe("the consent gate", () => {
  it("asks nothing and touches no database while the posture is open", async () => {
    await POST(post({ pledgeAmount: 5, favpollPollId: "poll-1" }))
    expect(mockConsent.byPoll).not.toHaveBeenCalled()
    expect(mockAdmin.created).toBe(0)
    expect(mockStripe.create).toHaveBeenCalled()
  })

  it("checks the poll's charities under consent-first, and still charges when they pass", async () => {
    mockConsent.posture = "consent-first"
    await POST(post({ pledgeAmount: 5, favpollPollId: "poll-1" }))
    expect(mockConsent.byPoll).toHaveBeenCalledWith({}, "poll-1")
    expect(mockStripe.create).toHaveBeenCalled()
  })

  it("checks the favpoll's charities for a pot top-up", async () => {
    mockConsent.posture = "consent-first"
    await POST(post({ topUpAmount: 5, favpollId: "favpoll-1" }))
    expect(mockConsent.byFavpoll).toHaveBeenCalledWith({}, "favpoll-1")
  })

  it("refuses with 403 and charges nothing when a charity has not agreed", async () => {
    mockConsent.posture = "consent-first"
    mockConsent.byPoll.mockRejectedValueOnce(
      new Error("Marie Curie has not agreed to receive pledges")
    )
    const res = await POST(post({ pledgeAmount: 5, favpollPollId: "poll-1" }))
    expect(res.status).toBe(403)
    expect((await res.json()).error).toBe(
      "Marie Curie has not agreed to receive pledges"
    )
    expect(mockStripe.create).not.toHaveBeenCalled()
  })
})

describe("rate limiting", () => {
  it("returns 429 and charges nothing once the limit is hit", async () => {
    mockLimit.limited = true
    const res = await POST(post({ pledgeAmount: 5, favpollPollId: "poll-1" }))
    expect(res.status).toBe(429)
    expect((await res.json()).error).toBe("Too many attempts")
    expect(mockStripe.create).not.toHaveBeenCalled()
  })
})
