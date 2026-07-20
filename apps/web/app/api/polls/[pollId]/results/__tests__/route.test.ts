// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockAuth = vi.hoisted(() => ({ userId: null as string | null }))
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(() => Promise.resolve({ userId: mockAuth.userId })),
}))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

// Standings are unit-tested via lib/poll-standings' own queries; here we
// stub them so the tests focus on the entitlement gate + shaping.
vi.mock("@/lib/poll-standings", () => ({
  pollStandings: vi.fn().mockResolvedValue({
    totals: new Map([
      ["fav-1", 50],
      ["fav-2", 80],
    ]),
    counts: new Map(),
  }),
}))

import { GET } from "@/app/api/polls/[pollId]/results/route"

const FUTURE_DATE = "2099-01-01T00:00:00Z"
const PAST_DATE = "2020-01-01T00:00:00Z"

const POLL_ROW = {
  id: "poll-1",
  topic_id: "topic-1",
  favpoll_id: "favpoll-1",
  topics: { is_finite: true },
}

const OPEN_FAVPOLL = { closed_at: null, closes_at: FUTURE_DATE }
const CLOSED_FAVPOLL = {
  closed_at: "2024-06-01T00:00:00Z",
  closes_at: PAST_DATE,
}

const ITEMS = [
  { id: "fav-1", label: "Red" },
  { id: "fav-2", label: "Purple" },
]

function makeRequest(guestToken?: string): Request {
  const url = guestToken
    ? `http://localhost/api/polls/poll-1/results?guest_token=${encodeURIComponent(guestToken)}`
    : "http://localhost/api/polls/poll-1/results"
  return new Request(url)
}

function makeParams(pollId = "poll-1") {
  return { params: Promise.resolve({ pollId }) }
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.userId = null
})

// ─────────────────────────────────────────────────────────────────────────────
// The gate — an open poll's standings sit behind the pledge lock
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/polls/[pollId]/results — entitlement", () => {
  it("returns 403 for an anonymous viewer of an open poll", async () => {
    mock.queue(POLL_ROW) // favpoll_polls
    mock.queue(OPEN_FAVPOLL) // favpolls

    const res = await GET(makeRequest(), makeParams())
    expect(res.status).toBe(403)
  })

  it("returns 403 for a signed-in viewer who has not pledged", async () => {
    mockAuth.userId = "user-1"
    mock.queue(POLL_ROW)
    mock.queue(OPEN_FAVPOLL)
    mock.queue([]) // no pledge rows for user

    const res = await GET(makeRequest(), makeParams())
    expect(res.status).toBe(403)
  })

  it("returns 403 for an invalid guest token", async () => {
    mock.queue(POLL_ROW)
    mock.queue(OPEN_FAVPOLL)
    mock.queue([]) // no pledge rows for token

    const res = await GET(makeRequest("bad-token"), makeParams())
    expect(res.status).toBe(403)
  })

  it("returns 200 for a signed-in viewer who pledged", async () => {
    mockAuth.userId = "user-1"
    mock.queue(POLL_ROW)
    mock.queue(OPEN_FAVPOLL)
    mock.queue([{ id: "pledge-1" }]) // user pledged
    mock.queue(ITEMS) // finite items

    const res = await GET(makeRequest(), makeParams())
    expect(res.status).toBe(200)
  })

  it("returns 200 for a valid guest token", async () => {
    mock.queue(POLL_ROW)
    mock.queue(OPEN_FAVPOLL)
    mock.queue([{ id: "pledge-1" }]) // token pledged
    mock.queue(ITEMS)

    const res = await GET(makeRequest("good-token"), makeParams())
    expect(res.status).toBe(200)
  })

  it("returns 200 for anyone once the poll is closed", async () => {
    mock.queue(POLL_ROW)
    mock.queue(CLOSED_FAVPOLL)
    mock.queue(ITEMS)

    const res = await GET(makeRequest(), makeParams())
    expect(res.status).toBe(200)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Shape — entitled responses carry per-poll standings
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/polls/[pollId]/results — shape", () => {
  it("returns sorted results with pence amounts and width percents", async () => {
    mock.queue(POLL_ROW)
    mock.queue(CLOSED_FAVPOLL)
    mock.queue(ITEMS)

    const res = await GET(makeRequest(), makeParams())
    const body = await res.json()
    expect(body.results[0]).toEqual({
      label: "Purple",
      amountPence: 8000,
      widthPercent: 100,
    })
    expect(body.results[1]).toEqual({
      label: "Red",
      amountPence: 5000,
      widthPercent: 63,
    })
  })
})
