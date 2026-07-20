// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

import { GET } from "@/app/api/cron/reconcile-payments/route"

function makeRequest(auth?: string) {
  const headers = new Headers()
  if (auth) headers.set("authorization", auth)
  return new Request("http://localhost/api/cron/reconcile-payments", {
    headers,
  })
}

const FRESH = new Date().toISOString()
const STALE = new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1h old

beforeEach(() => {
  mock = makeSupabaseMock()
  process.env.CRON_SECRET = "test-secret"
})

afterEach(() => {
  delete process.env.CRON_SECRET
})

describe("GET /api/cron/reconcile-payments", () => {
  it("returns 401 without the cron secret", async () => {
    const res = await GET(makeRequest("Bearer wrong"))
    expect(res.status).toBe(401)
  })

  it("returns zeros when there is nothing to reconcile", async () => {
    mock.queue([]) // no unreconciled events
    const res = await GET(makeRequest("Bearer test-secret"))
    const body = await res.json()
    expect(body).toEqual({ reconciled: 0, unmatched: 0 })
  })

  it("marks events matched by a pledge and by a pot top-up", async () => {
    mock.queue([
      { payment_intent_id: "pi_a", amount_pence: 1000, received_at: FRESH },
      { payment_intent_id: "pi_b", amount_pence: 2000, received_at: FRESH },
    ])
    mock.queue([{ payment_intent_id: "pi_a" }]) // pledges match pi_a
    mock.queue([{ payment_intent_id: "pi_b" }]) // pot_topups match pi_b
    mock.queue(null) // update pledge-matched
    mock.queue(null) // update topup-matched

    const res = await GET(makeRequest("Bearer test-secret"))
    const body = await res.json()

    expect(body.reconciled).toBe(2)
    expect(body.unmatched).toBe(0)

    const updates = mock
      .callsFor("stripe_payment_events")
      .filter((c) => c.method === "update")
    expect(updates[0].args[0]).toMatchObject({ reconciled_kind: "pledge" })
    expect(updates[1].args[0]).toMatchObject({ reconciled_kind: "pot_topup" })
  })

  it("reports a stale unmatched payment as charged-but-unrecorded", async () => {
    mock.queue([
      { payment_intent_id: "pi_lost", amount_pence: 5000, received_at: STALE },
    ])
    mock.queue([]) // no pledge match
    mock.queue([]) // no topup match

    const res = await GET(makeRequest("Bearer test-secret"))
    const body = await res.json()

    expect(body.reconciled).toBe(0)
    expect(body.unmatched).toBe(1)
    expect(body.unmatchedDetails[0]).toMatchObject({
      payment_intent_id: "pi_lost",
      amount_pence: 5000,
    })
  })

  it("gives fresh unmatched events grace instead of reporting them", async () => {
    mock.queue([
      { payment_intent_id: "pi_new", amount_pence: 500, received_at: FRESH },
    ])
    mock.queue([]) // no pledge match
    mock.queue([]) // no topup match

    const res = await GET(makeRequest("Bearer test-secret"))
    const body = await res.json()

    expect(body.reconciled).toBe(0)
    expect(body.unmatched).toBe(0)
  })
})
