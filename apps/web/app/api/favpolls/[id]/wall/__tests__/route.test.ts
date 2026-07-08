// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mocks = vi.hoisted(() => ({
  auth: vi.fn().mockResolvedValue({ userId: null }),
}))

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

import { GET } from "@/app/api/favpolls/[id]/wall/route"

const FUTURE = new Date(Date.now() + 7 * 86400000).toISOString()
const PAST = new Date(Date.now() - 86400000).toISOString()

const OPEN_FAVPOLL = {
  id: "fp-1",
  created_by: "user-org",
  closed_at: null,
  closes_at: FUTURE,
  live_slug: "slug-secret",
}

const WALL_ROW = {
  id: "pl-1",
  display_name: "Claire",
  is_anonymous: false,
  clerk_user_id: null,
  created_at: "2026-07-01T00:00:00Z",
  pledge_allocations: [{ favourites: { label: "Purple" } }],
}

const ANON_ROW = {
  ...WALL_ROW,
  id: "pl-2",
  display_name: "Secret Name",
  is_anonymous: true,
}

function req(query = ""): Request {
  return new Request(`http://localhost/api/favpolls/fp-1/wall${query}`)
}
const params = { params: Promise.resolve({ id: "fp-1" }) }

beforeEach(() => {
  mock = makeSupabaseMock()
  mocks.auth.mockReset().mockResolvedValue({ userId: null })
})

describe("GET /api/favpolls/[id]/wall", () => {
  it("404s when the favpoll does not exist", async () => {
    mock.queue(null)
    const res = await GET(req(), params)
    expect(res.status).toBe(404)
  })

  it("returns empty entries when the favpoll has no poll", async () => {
    mock.queue(OPEN_FAVPOLL)
    mock.queue(null) // favpoll_polls
    const res = await GET(req(), params)
    expect(await res.json()).toEqual({ entries: [] })
  })

  it("strips backed-labels for an un-entitled viewer of an open favpoll", async () => {
    mock.queue(OPEN_FAVPOLL)
    mock.queue({ id: "poll-1" })
    mock.queue([WALL_ROW])
    const res = await GET(req(), params)
    const body = await res.json()
    expect(body.entries[0]).toMatchObject({ name: "Claire", labels: [] })
  })

  it("includes labels on the display surface with the correct live_slug", async () => {
    mock.queue(OPEN_FAVPOLL)
    mock.queue({ id: "poll-1" })
    mock.queue([WALL_ROW])
    const res = await GET(req("?display_key=slug-secret"), params)
    const body = await res.json()
    expect(body.entries[0].labels).toEqual(["Purple"])
  })

  it("strips labels for a wrong display_key", async () => {
    mock.queue(OPEN_FAVPOLL)
    mock.queue({ id: "poll-1" })
    mock.queue([WALL_ROW])
    const res = await GET(req("?display_key=guessed-wrong"), params)
    const body = await res.json()
    expect(body.entries[0].labels).toEqual([])
  })

  it("includes labels once the favpoll is closed", async () => {
    mock.queue({ ...OPEN_FAVPOLL, closes_at: PAST })
    mock.queue({ id: "poll-1" })
    mock.queue([WALL_ROW])
    const res = await GET(req(), params)
    const body = await res.json()
    expect(body.entries[0].labels).toEqual(["Purple"])
  })

  it("includes labels for the organiser", async () => {
    mocks.auth.mockResolvedValue({ userId: "user-org" })
    mock.queue(OPEN_FAVPOLL)
    mock.queue({ id: "poll-1" })
    mock.queue([WALL_ROW])
    const res = await GET(req(), params)
    const body = await res.json()
    expect(body.entries[0].labels).toEqual(["Purple"])
  })

  it("includes labels for a guest with a pledging guest_token", async () => {
    mock.queue(OPEN_FAVPOLL)
    mock.queue({ id: "poll-1" })
    mock.queue([{ id: "pl-x" }]) // guest_token pledge lookup
    mock.queue([WALL_ROW])
    const res = await GET(req("?guest_token=tok-1"), params)
    const body = await res.json()
    expect(body.entries[0].labels).toEqual(["Purple"])
  })

  it("never exposes an anonymous pledger's name — even on the display", async () => {
    mock.queue(OPEN_FAVPOLL)
    mock.queue({ id: "poll-1" })
    mock.queue([ANON_ROW])
    const res = await GET(req("?display_key=slug-secret"), params)
    const body = await res.json()
    expect(body.entries[0].name).toBeNull()
    expect(JSON.stringify(body)).not.toContain("Secret Name")
  })
})
