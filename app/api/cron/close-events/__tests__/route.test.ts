// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockEmail = vi.hoisted(() => ({
  sendEventClosed: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/lib/email", () => mockEmail)

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => mock.supabase }))

import { POST } from "@/app/api/cron/close-events/route"

function makeRequest(authHeader?: string): Request {
  const headers = new Headers()
  if (authHeader !== undefined) headers.set("authorization", authHeader)
  return new Request("http://localhost/api/cron/close-events", { method: "POST", headers })
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockEmail.sendEventClosed.mockResolvedValue(undefined)
  process.env.CRON_SECRET = "test-secret"
})

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/cron/close-events — auth", () => {
  it("returns 401 when Authorization header is missing", async () => {
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe("Unauthorized")
  })

  it("returns 401 when bearer token is wrong", async () => {
    const res = await POST(makeRequest("Bearer wrong-secret"))
    expect(res.status).toBe(401)
  })

  it("proceeds when Authorization header matches CRON_SECRET", async () => {
    mock.queue([])        // events select → no events
    const res = await POST(makeRequest("Bearer test-secret"))
    expect(res.status).not.toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// No events to close
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/cron/close-events — no events", () => {
  it("returns { closed: 0 } when events array is empty", async () => {
    mock.queue([])

    const res = await POST(makeRequest("Bearer test-secret"))
    const body = await res.json()
    expect(body).toEqual({ closed: 0 })
  })

  it("returns { closed: 0 } when events query returns null", async () => {
    mock.queue(null)

    const res = await POST(makeRequest("Bearer test-secret"))
    const body = await res.json()
    expect(body).toEqual({ closed: 0 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DB error
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/cron/close-events — DB error", () => {
  it("returns 500 when events fetch fails", async () => {
    mock.queue(null, { message: "connection refused" })

    const res = await POST(makeRequest("Bearer test-secret"))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe("connection refused")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Happy path — events closed
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/cron/close-events — closes events", () => {
  function queueForOneEvent(options: {
    eventId?: string
    userId?: string
    protagonistName?: string
    totalRaised?: number
    organiserEmail?: string | null
    updateError?: { message: string } | null
  } = {}) {
    const {
      eventId = "event-1",
      userId = "user-1",
      protagonistName = "Alice",
      totalRaised = 150,
      organiserEmail = "organiser@example.com",
      updateError = null,
    } = options

    // 1. events select
    mock.queue([
      {
        id: eventId,
        created_by: userId,
        protagonists: { name: protagonistName },
      },
    ])
    // 2. pledges select (totals)
    mock.queue([
      {
        event_polls: { event_id: eventId },
        total_amount: totalRaised,
      },
    ])
    // 3. users select
    mock.queue(
      organiserEmail
        ? [{ id: userId, email: organiserEmail, display_name: "Organiser" }]
        : [{ id: userId, email: null, display_name: null }]
    )
    // 4. events update (per event in loop)
    mock.queue(null, updateError)
  }

  it("closes the event with closed_at and total_raised", async () => {
    queueForOneEvent({ totalRaised: 200 })

    await POST(makeRequest("Bearer test-secret"))

    const eventsUpdate = mock.callsFor("events").find((c) => c.method === "update")!
    expect(eventsUpdate.args[0]).toMatchObject({
      total_raised: 200,
      closed_at: expect.any(String),
    })
  })

  it("returns { closed: 1 } for a single successfully closed event", async () => {
    queueForOneEvent()

    const res = await POST(makeRequest("Bearer test-secret"))
    const body = await res.json()
    expect(body.closed).toBe(1)
  })

  it("sends sendEventClosed to the organiser email", async () => {
    queueForOneEvent({ eventId: "event-1", protagonistName: "Bob", totalRaised: 75, organiserEmail: "bob@example.com" })

    await POST(makeRequest("Bearer test-secret"))

    expect(mockEmail.sendEventClosed).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "bob@example.com",
        protagonistName: "Bob",
        totalRaised: 75,
        eventId: "event-1",
      })
    )
  })

  it("does not send email when organiser has no email address", async () => {
    queueForOneEvent({ organiserEmail: null })
    mockEmail.sendEventClosed.mockClear()

    await POST(makeRequest("Bearer test-secret"))

    expect(mockEmail.sendEventClosed).not.toHaveBeenCalled()
  })

  it("still increments closed count when email send fails", async () => {
    queueForOneEvent()
    mockEmail.sendEventClosed.mockRejectedValueOnce(new Error("email down"))

    const res = await POST(makeRequest("Bearer test-secret"))
    const body = await res.json()
    expect(body.closed).toBe(1)
  })

  it("lists event update errors but still closes others", async () => {
    // Two events: first fails to update, second succeeds
    const eventId1 = "event-fail"
    const eventId2 = "event-ok"
    const userId = "user-1"

    mock.queue([
      { id: eventId1, created_by: userId, protagonists: { name: "A" } },
      { id: eventId2, created_by: userId, protagonists: { name: "B" } },
    ])
    mock.queue([]) // no pledges
    mock.queue([{ id: userId, email: "u@test.com", display_name: null }])
    // First event update → error
    mock.queue(null, { message: "update failed" })
    // Second event update → success
    mock.queue(null)

    const res = await POST(makeRequest("Bearer test-secret"))
    const body = await res.json()

    expect(body.closed).toBe(1)
    expect(body.errors).toEqual(expect.arrayContaining([expect.stringContaining(eventId1)]))
  })

  it("sums pledge totals correctly from pledgeTotals rows", async () => {
    const eventId = "event-1"
    const userId = "user-1"

    mock.queue([{ id: eventId, created_by: userId, protagonists: { name: "A" } }])
    // Multiple pledge rows for the same event
    mock.queue([
      { event_polls: { event_id: eventId }, total_amount: 50 },
      { event_polls: { event_id: eventId }, total_amount: 30 },
      { event_polls: { event_id: eventId }, total_amount: 20 },
    ])
    mock.queue([{ id: userId, email: "u@test.com", display_name: null }])
    mock.queue(null) // update

    await POST(makeRequest("Bearer test-secret"))

    const eventsUpdate = mock.callsFor("events").find((c) => c.method === "update")!
    expect(eventsUpdate.args[0].total_raised).toBe(100)
  })
})
