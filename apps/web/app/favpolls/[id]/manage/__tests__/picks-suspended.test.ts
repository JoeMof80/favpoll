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

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
})

describe("setPicksSuspended", () => {
  it("refuses a stranger", async () => {
    mock.queue({ ...open, created_by: "someone-else" })
    await expect(setPicksSuspended("f-1", true)).rejects.toThrow("Unauthorized")
  })

  it("refuses a closed favpoll", async () => {
    mock.queue({ ...open, closed_at: "2026-01-01T00:00:00Z" })
    await expect(setPicksSuspended("f-1", true)).rejects.toThrow("closed")
    expect(lastUpdate()).toBeUndefined()
  })

  it("suspends with the server's now", async () => {
    mock.queue(open)
    mock.queue(null)
    const before = Date.now()
    const value = await setPicksSuspended("f-1", true)
    expect(value).not.toBeNull()
    expect(new Date(value!).getTime()).toBeGreaterThanOrEqual(before)
    expect(lastUpdate()).toEqual({ picks_suspended_at: value })
  })

  it("resumes with null", async () => {
    mock.queue(open)
    mock.queue(null)
    expect(await setPicksSuspended("f-1", false)).toBeNull()
    expect(lastUpdate()).toEqual({ picks_suspended_at: null })
  })
})
