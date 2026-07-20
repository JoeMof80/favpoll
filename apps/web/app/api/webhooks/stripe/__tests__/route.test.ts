// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockConstructEvent = vi.hoisted(() => vi.fn())
vi.mock("stripe", () => ({
  default: class MockStripe {
    webhooks = { constructEvent: mockConstructEvent }
  },
}))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

import { POST } from "@/app/api/webhooks/stripe/route"

function makeRequest(body = "{}", signature: string | null = "sig_test") {
  const headers = new Headers()
  if (signature) headers.set("stripe-signature", signature)
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers,
    body,
  })
}

const SUCCEEDED_EVENT = {
  type: "payment_intent.succeeded",
  data: {
    object: {
      id: "pi_hook_1",
      amount: 2500,
      currency: "gbp",
      metadata: { favpoll_poll_id: "poll-1", pledge_amount: "25" },
    },
  },
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockConstructEvent.mockReset()
  mockConstructEvent.mockReturnValue(SUCCEEDED_EVENT)
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test"
})

afterEach(() => {
  delete process.env.STRIPE_WEBHOOK_SECRET
})

describe("POST /api/webhooks/stripe", () => {
  it("returns 503 when the webhook secret is not configured", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET
    const res = await POST(makeRequest())
    expect(res.status).toBe(503)
    expect(mockConstructEvent).not.toHaveBeenCalled()
  })

  it("returns 400 on an invalid signature", async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error("bad signature")
    })
    const res = await POST(makeRequest())
    expect(res.status).toBe(400)
    expect(mock.callsFor("stripe_payment_events")).toHaveLength(0)
  })

  it("records a succeeded PaymentIntent idempotently", async () => {
    mock.queue(null) // upsert ok
    const res = await POST(makeRequest())
    expect(res.status).toBe(200)

    const upsert = mock
      .callsFor("stripe_payment_events")
      .find((c) => c.method === "upsert")!
    expect(upsert.args[0]).toMatchObject({
      payment_intent_id: "pi_hook_1",
      amount_pence: 2500,
      currency: "gbp",
      metadata: { favpoll_poll_id: "poll-1", pledge_amount: "25" },
    })
    expect(upsert.args[1]).toMatchObject({
      onConflict: "payment_intent_id",
      ignoreDuplicates: true,
    })
  })

  it("ignores other event types", async () => {
    mockConstructEvent.mockReturnValueOnce({
      type: "charge.refunded",
      data: { object: {} },
    })
    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    expect(mock.callsFor("stripe_payment_events")).toHaveLength(0)
  })

  it("returns 500 when the event write fails so Stripe retries", async () => {
    mock.queue(null, { message: "db down" })
    const res = await POST(makeRequest())
    expect(res.status).toBe(500)
  })
})
