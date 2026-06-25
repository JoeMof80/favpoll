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

import { GET } from "@/app/api/polls/[pollId]/reveal/route"

const FUTURE_DATE = "2099-01-01T00:00:00Z"
const PAST_DATE = "2020-01-01T00:00:00Z"

const POLL_ROW = {
  personal_reveal: "Belinda's was purple.",
  topic_id: "topic-1",
  favpoll_id: "favpoll-1",
}

const OPEN_FAVPOLL = { closed_at: null, closes_at: FUTURE_DATE }
const CLOSED_FAVPOLL = { closed_at: "2024-06-01T00:00:00Z", closes_at: PAST_DATE }

const ITEMS = [
  { id: "fav-1", label: "Red", all_time_pledged: 50, all_time_count: 2 },
  { id: "fav-2", label: "Purple", all_time_pledged: 80, all_time_count: 3 },
]

function makeRequest(guestToken?: string): Request {
  const url = guestToken
    ? `http://localhost/api/polls/poll-1/reveal?guest_token=${encodeURIComponent(guestToken)}`
    : "http://localhost/api/polls/poll-1/reveal"
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
// 404 — poll not found
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/polls/[pollId]/reveal — not found", () => {
  it("returns 404 when poll does not exist", async () => {
    mock.queue(null) // favpoll_polls → no data
    const res = await GET(makeRequest(), makeParams())
    expect(res.status).toBe(404)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Closed poll — entitled without pledge
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/polls/[pollId]/reveal — closed poll", () => {
  it("returns 200 for any unauthenticated viewer when poll is closed", async () => {
    mock.queue(POLL_ROW)       // favpoll_polls
    mock.queue(CLOSED_FAVPOLL) // favpolls
    mock.queue(ITEMS)          // favourites

    const res = await GET(makeRequest(), makeParams())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.personal_reveal).toBe("Belinda's was purple.")
    expect(body.items).toHaveLength(2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Open poll — un-pledged → 403
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/polls/[pollId]/reveal — open poll, not entitled", () => {
  it("returns 403 for unauthenticated visitor with no guest token", async () => {
    mock.queue(POLL_ROW)      // favpoll_polls
    mock.queue(OPEN_FAVPOLL)  // favpolls
    // no pledge rows for unauth

    const res = await GET(makeRequest(), makeParams())
    expect(res.status).toBe(403)
  })

  it("returns 403 for signed-in user without a pledge", async () => {
    mockAuth.userId = "user-99"
    mock.queue(POLL_ROW)      // favpoll_polls
    mock.queue(OPEN_FAVPOLL)  // favpolls
    mock.queue([])             // pledges by clerk_user_id → empty

    const res = await GET(makeRequest(), makeParams())
    expect(res.status).toBe(403)
  })

  it("returns 403 for guest token that has no matching pledge", async () => {
    mock.queue(POLL_ROW)      // favpoll_polls
    mock.queue(OPEN_FAVPOLL)  // favpolls
    mock.queue([])             // pledges by guest_token → empty

    const res = await GET(makeRequest("bad-token"), makeParams())
    expect(res.status).toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Open poll — entitled: signed-in with pledge
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/polls/[pollId]/reveal — signed-in with pledge", () => {
  it("returns 200 with real reveal and items", async () => {
    mockAuth.userId = "user-1"
    mock.queue(POLL_ROW)              // favpoll_polls
    mock.queue(OPEN_FAVPOLL)          // favpolls
    mock.queue([{ id: "pledge-1" }])  // pledges by clerk_user_id → found
    mock.queue(ITEMS)                 // favourites

    const res = await GET(makeRequest(), makeParams())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.personal_reveal).toBe("Belinda's was purple.")
    expect(body.items).toHaveLength(2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Open poll — entitled: guest with valid token
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/polls/[pollId]/reveal — guest with valid token", () => {
  it("returns 200 with real reveal and items", async () => {
    mock.queue(POLL_ROW)              // favpoll_polls
    mock.queue(OPEN_FAVPOLL)          // favpolls
    mock.queue([{ id: "pledge-2" }])  // pledges by guest_token → found
    mock.queue(ITEMS)                 // favourites

    const res = await GET(makeRequest("valid-guest-token"), makeParams())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.personal_reveal).toBe("Belinda's was purple.")
    expect(body.items).toHaveLength(2)
  })

  it("returns null personal_reveal when poll has none", async () => {
    mock.queue({ ...POLL_ROW, personal_reveal: null })
    mock.queue(OPEN_FAVPOLL)
    mock.queue([{ id: "pledge-2" }])
    mock.queue(ITEMS)

    const res = await GET(makeRequest("valid-guest-token"), makeParams())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.personal_reveal).toBeNull()
  })
})
