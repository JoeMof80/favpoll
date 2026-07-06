// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockEmail = vi.hoisted(() => ({
  sendFavpollClosed: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/lib/email", () => mockEmail)

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

import { GET } from "@/app/api/cron/close-favpolls/route"

function makeRequest(authHeader?: string): Request {
  const headers = new Headers()
  if (authHeader !== undefined) headers.set("authorization", authHeader)
  return new Request("http://localhost/api/cron/close-favpolls", {
    headers,
  })
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockEmail.sendFavpollClosed.mockResolvedValue(undefined)
  process.env.CRON_SECRET = "test-secret"
})

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/cron/close-favpolls — auth", () => {
  it("returns 401 when Authorization header is missing", async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe("Unauthorized")
  })

  it("returns 401 when bearer token is wrong", async () => {
    const res = await GET(makeRequest("Bearer wrong-secret"))
    expect(res.status).toBe(401)
  })

  it("proceeds when Authorization header matches CRON_SECRET", async () => {
    mock.queue([]) // favpolls select → no favpolls
    const res = await GET(makeRequest("Bearer test-secret"))
    expect(res.status).not.toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// No favpolls to close
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/cron/close-favpolls — no favpolls", () => {
  it("returns { closed: 0 } when favpolls array is empty", async () => {
    mock.queue([])

    const res = await GET(makeRequest("Bearer test-secret"))
    const body = await res.json()
    expect(body).toEqual({ closed: 0 })
  })

  it("returns { closed: 0 } when favpolls query returns null", async () => {
    mock.queue(null)

    const res = await GET(makeRequest("Bearer test-secret"))
    const body = await res.json()
    expect(body).toEqual({ closed: 0 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DB error
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/cron/close-favpolls — DB error", () => {
  it("returns 500 when favpolls fetch fails", async () => {
    mock.queue(null, { message: "connection refused" })

    const res = await GET(makeRequest("Bearer test-secret"))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe("connection refused")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Happy path — favpolls closed
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/cron/close-favpolls — closes favpolls", () => {
  function queueForOneFavpoll(
    options: {
      favpollId?: string
      userId?: string
      protagonistName?: string
      totalRaised?: number
      organiserEmail?: string | null
      updateError?: { message: string } | null
    } = {}
  ) {
    const {
      favpollId = "favpoll-1",
      userId = "user-1",
      protagonistName = "Alice",
      totalRaised = 150,
      organiserEmail = "organiser@example.com",
      updateError = null,
    } = options

    // 1. favpolls select
    mock.queue([
      {
        id: favpollId,
        created_by: userId,
        protagonists: { name: protagonistName },
      },
    ])
    // 2. pledges select (totals)
    mock.queue([
      {
        favpoll_polls: { favpoll_id: favpollId },
        total_amount: totalRaised,
      },
    ])
    // 3. favpoll_charities select — none by default, so no disbursement occurs
    mock.queue([])
    // 4. users select
    mock.queue(
      organiserEmail
        ? [{ id: userId, email: organiserEmail, display_name: "Organiser" }]
        : [{ id: userId, email: null, display_name: null }]
    )
    // 5. favpolls update (per favpoll in loop)
    mock.queue(null, updateError)
  }

  it("closes the favpoll with closed_at and total_raised", async () => {
    queueForOneFavpoll({ totalRaised: 200 })

    await GET(makeRequest("Bearer test-secret"))

    const favpollsUpdate = mock
      .callsFor("favpolls")
      .find((c) => c.method === "update")!
    expect(favpollsUpdate.args[0]).toMatchObject({
      total_raised: 200,
      closed_at: expect.any(String),
    })
  })

  it("returns { closed: 1 } for a single successfully closed favpoll", async () => {
    queueForOneFavpoll()

    const res = await GET(makeRequest("Bearer test-secret"))
    const body = await res.json()
    expect(body.closed).toBe(1)
  })

  it("sends sendFavpollClosed to the organiser email", async () => {
    queueForOneFavpoll({
      favpollId: "favpoll-1",
      protagonistName: "Bob",
      totalRaised: 75,
      organiserEmail: "bob@example.com",
    })

    await GET(makeRequest("Bearer test-secret"))

    expect(mockEmail.sendFavpollClosed).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "bob@example.com",
        protagonistName: "Bob",
        totalRaised: 75,
        favpollId: "favpoll-1",
      })
    )
  })

  it("does not send email when organiser has no email address", async () => {
    queueForOneFavpoll({ organiserEmail: null })
    mockEmail.sendFavpollClosed.mockClear()

    await GET(makeRequest("Bearer test-secret"))

    expect(mockEmail.sendFavpollClosed).not.toHaveBeenCalled()
  })

  it("still increments closed count when email send fails", async () => {
    queueForOneFavpoll()
    mockEmail.sendFavpollClosed.mockRejectedValueOnce(new Error("email down"))

    const res = await GET(makeRequest("Bearer test-secret"))
    const body = await res.json()
    expect(body.closed).toBe(1)
  })

  it("lists favpoll update errors but still closes others", async () => {
    // Two favpolls: first fails to update, second succeeds
    const favpollId1 = "favpoll-fail"
    const favpollId2 = "favpoll-ok"
    const userId = "user-1"

    mock.queue([
      { id: favpollId1, created_by: userId, protagonists: { name: "A" } },
      { id: favpollId2, created_by: userId, protagonists: { name: "B" } },
    ])
    mock.queue([]) // no pledges
    mock.queue([]) // no charities → no disbursement
    mock.queue([{ id: userId, email: "u@test.com", display_name: null }])
    // First favpoll update → error
    mock.queue(null, { message: "update failed" })
    // Second favpoll update → success
    mock.queue(null)

    const res = await GET(makeRequest("Bearer test-secret"))
    const body = await res.json()

    expect(body.closed).toBe(1)
    expect(body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining(favpollId1)])
    )
  })

  it("sums pledge totals correctly from pledgeTotals rows", async () => {
    const favpollId = "favpoll-1"
    const userId = "user-1"

    mock.queue([
      { id: favpollId, created_by: userId, protagonists: { name: "A" } },
    ])
    // Multiple pledge rows for the same favpoll
    mock.queue([
      { favpoll_polls: { favpoll_id: favpollId }, total_amount: 50 },
      { favpoll_polls: { favpoll_id: favpollId }, total_amount: 30 },
      { favpoll_polls: { favpoll_id: favpollId }, total_amount: 20 },
    ])
    mock.queue([]) // no charities
    mock.queue([{ id: userId, email: "u@test.com", display_name: null }])
    mock.queue(null) // update

    await GET(makeRequest("Bearer test-secret"))

    const favpollsUpdate = mock
      .callsFor("favpolls")
      .find((c) => c.method === "update")!
    expect(favpollsUpdate.args[0].total_raised).toBe(100)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Disbursement — ledger written on close
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/cron/close-favpolls — disbursement", () => {
  it("records an equal-split disbursement per charity in the ledger", async () => {
    const favpollId = "favpoll-1"
    const userId = "user-1"

    mock.queue([
      { id: favpollId, created_by: userId, protagonists: { name: "A" } },
    ])
    mock.queue([{ favpoll_polls: { favpoll_id: favpollId }, total_amount: 90 }])
    // Three charities
    mock.queue([
      {
        favpoll_id: favpollId,
        charities: { id: "ch-1", registered_number: "111" },
      },
      {
        favpoll_id: favpollId,
        charities: { id: "ch-2", registered_number: "222" },
      },
      {
        favpoll_id: favpollId,
        charities: { id: "ch-3", registered_number: null },
      },
    ])
    mock.queue([{ id: userId, email: "u@test.com", display_name: null }])
    mock.queue(null) // favpolls update
    mock.queue(null) // disbursements insert

    await GET(makeRequest("Bearer test-secret"))

    const insert = mock
      .callsFor("disbursements")
      .find((c) => c.method === "insert")!
    const rows = insert.args[0]
    expect(rows).toHaveLength(3)
    expect(rows.map((r: { amount: number }) => r.amount)).toEqual([30, 30, 30])
    expect(rows.every((r: { status: string }) => r.status === "pending")).toBe(
      true
    )
    expect(rows.every((r: { provider: string }) => r.provider === "noop")).toBe(
      true
    )
    expect(rows[0]).toMatchObject({
      favpoll_id: favpollId,
      charity_id: "ch-1",
      provider_ref: `noop:${favpollId}:ch-1`,
    })
  })

  it("does not disburse when the favpoll raised nothing", async () => {
    const favpollId = "favpoll-1"
    const userId = "user-1"

    mock.queue([
      { id: favpollId, created_by: userId, protagonists: { name: "A" } },
    ])
    mock.queue([]) // no pledges → totalRaised 0
    mock.queue([
      {
        favpoll_id: favpollId,
        charities: { id: "ch-1", registered_number: "111" },
      },
    ])
    mock.queue([{ id: userId, email: "u@test.com", display_name: null }])
    mock.queue(null) // favpolls update

    const res = await GET(makeRequest("Bearer test-secret"))
    const body = await res.json()

    expect(body.closed).toBe(1)
    expect(
      mock.callsFor("disbursements").filter((c) => c.method === "insert")
    ).toHaveLength(0)
  })
})
