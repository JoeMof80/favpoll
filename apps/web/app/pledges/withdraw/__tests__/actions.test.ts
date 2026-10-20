// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

// redirect throws so execution halts — mirrors real Next.js NEXT_REDIRECT behaviour
const mockRedirect = vi.hoisted(() =>
  vi.fn().mockImplementation((url: string) => {
    throw new Error(url)
  })
)

// notFound throws the same way, for the same reason
const mockNotFound = vi.hoisted(() =>
  vi.fn().mockImplementation(() => {
    throw new Error("NEXT_NOT_FOUND")
  })
)

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
  notFound: mockNotFound,
}))

// The mock is re-created per test; the module-level reference is replaced each time
let mock = makeSupabaseMock()

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

import { withdrawPledge } from "@/app/pledges/withdraw/actions"

function makeFormData(token?: string): FormData {
  const fd = new FormData()
  if (token !== undefined) fd.set("token", token)
  return fd
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockRedirect.mockClear()
  mockNotFound.mockClear()
})

// A missing or blank token can only be a tampered request: the page
// renders the token as a hidden field. It used to return silently, which
// left the guest on a page whose button appeared to do nothing. Now it
// gets the same not-found page the withdrawal page gives for a token that
// matches no pledge (#1104).
describe("withdrawPledge — no token", () => {
  it("shows not-found without querying the DB when the token is missing", async () => {
    await expect(withdrawPledge(makeFormData())).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
    expect(mock.from).not.toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it("shows not-found for a blank token", async () => {
    await expect(withdrawPledge(makeFormData(""))).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
    expect(mock.from).not.toHaveBeenCalled()
  })
})

describe("withdrawPledge — pledge not found", () => {
  it("redirects to /invalid when maybeSingle returns null", async () => {
    mock.queue(null) // pledge not found
    await expect(withdrawPledge(makeFormData("bad-token"))).rejects.toThrow(
      "/pledges/withdraw/invalid"
    )
  })
})

describe("withdrawPledge — favpoll is closed", () => {
  it("redirects to the favpoll page when closes_at is in the past", async () => {
    mock.queue({
      id: "pledge-1",
      withdrawn_at: null,
      favpoll_polls: {
        favpolls: { closes_at: "2020-01-01T00:00:00Z", id: "favpoll-1" },
      },
    })
    await expect(withdrawPledge(makeFormData("valid-token"))).rejects.toThrow(
      "/favpolls/favpoll-1"
    )
  })

  it("does not redirect to ?withdrawn=1 when favpoll is closed", async () => {
    mock.queue({
      id: "pledge-1",
      withdrawn_at: null,
      favpoll_polls: {
        favpolls: { closes_at: "2020-01-01T00:00:00Z", id: "favpoll-2" },
      },
    })
    try {
      await withdrawPledge(makeFormData("valid-token"))
    } catch (e) {
      expect((e as Error).message).not.toContain("withdrawn=1")
    }
  })
})

describe("withdrawPledge — success", () => {
  function makeFuturePledge(favpollId = "favpoll-1") {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    return {
      id: "pledge-1",
      withdrawn_at: null,
      favpoll_polls: {
        favpolls: { closes_at: future.toISOString(), id: favpollId },
      },
    }
  }

  it("calls update with withdrawn_at and guest_token: null", async () => {
    mock.queue(makeFuturePledge())
    mock.queue(null) // update response

    try {
      await withdrawPledge(makeFormData("valid-token"))
    } catch {
      // expected redirect throw
    }

    const updateCalls = mock
      .callsFor("pledges")
      .filter((c) => c.method === "update")
    expect(updateCalls).toHaveLength(1)
    expect(updateCalls[0].args[0]).toMatchObject({
      guest_token: null,
      withdrawn_at: expect.any(String),
    })
  })

  it("redirects to /favpolls/:id?withdrawn=1 on success", async () => {
    mock.queue(makeFuturePledge("favpoll-42"))
    mock.queue(null) // update response

    await expect(withdrawPledge(makeFormData("valid-token"))).rejects.toThrow(
      "/favpolls/favpoll-42?withdrawn=1"
    )
  })

  it("sets withdrawn_at to a valid ISO timestamp", async () => {
    mock.queue(makeFuturePledge())
    mock.queue(null)

    try {
      await withdrawPledge(makeFormData("valid-token"))
    } catch {
      // expected redirect throw
    }

    const updateCall = mock
      .callsFor("pledges")
      .find((c) => c.method === "update")!
    const ts = updateCall.args[0].withdrawn_at
    expect(new Date(ts).toISOString()).toBe(ts)
  })
})
