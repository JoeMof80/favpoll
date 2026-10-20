// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

// redirect throws so execution halts — mirrors NEXT_REDIRECT.
const mockRedirect = vi.hoisted(() =>
  vi.fn().mockImplementation((url: string) => {
    throw new Error(url)
  })
)
vi.mock("next/navigation", () => ({ redirect: mockRedirect }))

const mockAuth = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ userId: "user-1" })
)
vi.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

import { deleteFavpoll } from "../actions"

const FAVPOLL_ID = "11111111-1111-1111-1111-111111111111"

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
  mockRedirect.mockClear()
})

describe("deleteFavpoll", () => {
  it("deletes a favpoll the caller owns, then redirects", async () => {
    mock.queue({ id: FAVPOLL_ID }) // the ownership lookup

    await expect(deleteFavpoll(FAVPOLL_ID)).rejects.toThrow("/favpolls")

    const del = mock.callsFor("favpolls").find((c) => c.method === "delete")
    expect(del).toBeTruthy()
    expect(mockRedirect).toHaveBeenCalledWith("/favpolls")
  })

  it("refuses to run against an id the column could not hold", async () => {
    await expect(deleteFavpoll("favpoll-1")).rejects.toThrow(
      "That favpoll wasn't recognised."
    )
    // Nothing read, nothing deleted: the shape is checked before the
    // ownership lookup, which is the thing that does the real work.
    expect(mock.from).not.toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it("still refuses a favpoll that is not the caller's", async () => {
    mock.queue(null) // the ownership lookup finds nothing

    await expect(deleteFavpoll(FAVPOLL_ID)).rejects.toThrow(
      "Favpoll not found or not yours"
    )
    expect(
      mock.callsFor("favpolls").find((c) => c.method === "delete")
    ).toBeUndefined()
  })
})
