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

import { setPicksSuspendedAt } from "@/app/favpolls/[id]/manage/actions"

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

describe("setPicksSuspendedAt", () => {
  it("refuses a stranger", async () => {
    mock.queue({ ...open, created_by: "someone-else" })
    await expect(setPicksSuspendedAt("f-1", null)).rejects.toThrow(
      "Unauthorized"
    )
  })

  it("refuses a closed favpoll", async () => {
    mock.queue({ ...open, closed_at: "2026-01-01T00:00:00Z" })
    await expect(
      setPicksSuspendedAt("f-1", "2026-10-02T12:00:00Z")
    ).rejects.toThrow("closed")
  })

  it("suspends now — a stale client clock clamps forward, never fails", async () => {
    mock.queue(open)
    mock.queue(null)
    const before = Date.now()
    const value = await setPicksSuspendedAt("f-1", "2020-01-01T00:00:00Z")
    expect(value).not.toBeNull()
    expect(new Date(value!).getTime()).toBeGreaterThanOrEqual(before)
    expect(lastUpdate()).toEqual({ picks_suspended_at: value })
  })

  it("schedules a future moment as given", async () => {
    mock.queue(open)
    mock.queue(null)
    const value = await setPicksSuspendedAt("f-1", "2999-05-01T12:00:00Z")
    expect(value).toBe("2999-05-01T12:00:00.000Z")
  })

  it("refuses a moment at or after the close", async () => {
    mock.queue(open)
    await expect(
      setPicksSuspendedAt("f-1", "2999-06-01T12:00:00Z")
    ).rejects.toThrow("before the close date")
    expect(lastUpdate()).toBeUndefined()
  })

  it("resumes with null", async () => {
    mock.queue(open)
    mock.queue(null)
    expect(await setPicksSuspendedAt("f-1", null)).toBeNull()
    expect(lastUpdate()).toEqual({ picks_suspended_at: null })
  })

  it("rejects garbage", async () => {
    mock.queue(open)
    await expect(setPicksSuspendedAt("f-1", "soon")).rejects.toThrow(
      "Invalid time"
    )
  })
})
