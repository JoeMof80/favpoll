// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockAuth = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ userId: "user-1" })
)
vi.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

import { setPicksSuspended } from "@/app/favpolls/[id]/manage/actions"
import { unwrap } from "@/lib/action-result"

// The ids are uuid columns, so the fixtures are uuids (#1109): the
// actions now check the format before they touch anything.
const FAVPOLL_ID = "11111111-1111-1111-1111-111111111111"

const open = {
  created_by: "user-1",
  closed_at: null,
  closes_at: "2999-06-01T12:00:00Z",
  subject: "someone",
  protagonist_id: "p-1",
}

function lastUpdate() {
  return mock.callsFor("favpolls").find((c) => c.method === "update")?.args[0]
}

function updates() {
  return mock
    .callsFor("favpolls")
    .filter((c) => c.method === "update")
    .map((c) => c.args[0])
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
})

describe("setPicksSuspended", () => {
  it("refuses a stranger", async () => {
    mock.queue({ ...open, created_by: "someone-else" })
    expect(await setPicksSuspended(FAVPOLL_ID, true)).toEqual({
      ok: false,
      error: "Unauthorized",
    })
  })

  it("refuses a closed favpoll", async () => {
    mock.queue({ ...open, closed_at: "2026-01-01T00:00:00Z" })
    expect(await setPicksSuspended(FAVPOLL_ID, true)).toMatchObject({
      ok: false,
      error: expect.stringContaining("closed"),
    })
    expect(lastUpdate()).toBeUndefined()
  })

  it("suspends with the server's now", async () => {
    mock.queue(open)
    mock.queue(null)
    const before = Date.now()
    const value = unwrap(await setPicksSuspended(FAVPOLL_ID, true))
    expect(value).not.toBeNull()
    expect(new Date(value!).getTime()).toBeGreaterThanOrEqual(before)
    expect(lastUpdate()).toEqual({ picks_suspended_at: value })
  })

  it("resumes with null", async () => {
    mock.queue(open)
    mock.queue(null)
    expect(unwrap(await setPicksSuspended(FAVPOLL_ID, false))).toBeNull()
    expect(lastUpdate()).toEqual({ picks_suspended_at: null })
  })
})

// THE FIRST SUSPENSION IS STAMPED, AND STAYS (founder, 2026-10-03). A
// second write, guarded on the column still being null, so the FIRST
// moment survives a suspend / resume / suspend again.
describe("setPicksSuspended stamping the first suspension", () => {
  it("stamps the standings open alongside the suspension", async () => {
    mock.queue(open)
    mock.queue(null)
    mock.queue(null)
    const value = unwrap(await setPicksSuspended(FAVPOLL_ID, true))
    expect(updates()).toEqual([
      { picks_suspended_at: value },
      { picks_first_suspended_at: value },
    ])
    expect(
      mock
        .callsFor("favpolls")
        .filter((c) => c.method === "is")
        .map((c) => c.args)
    ).toContainEqual(["picks_first_suspended_at", null])
  })

  it("writes nothing about the standings on a resume", async () => {
    mock.queue(open)
    mock.queue(null)
    unwrap(await setPicksSuspended(FAVPOLL_ID, false))
    expect(updates()).toEqual([{ picks_suspended_at: null }])
  })
})
