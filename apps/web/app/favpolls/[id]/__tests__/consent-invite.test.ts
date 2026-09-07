// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockAuth = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ userId: "user-1" })
)
vi.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }))
vi.mock("@/lib/email", () => ({
  sendPledgeConfirmation: vi.fn(),
  sendGuestItemAdded: vi.fn(),
}))
vi.mock("@/lib/stripe-verify", () => ({
  verifyPledgePayment: vi.fn(),
  verifyTopUpPayment: vi.fn(),
}))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

import { inviteCharityConsent } from "@/app/favpolls/[id]/actions"

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
})

describe("inviteCharityConsent", () => {
  it("requires auth", async () => {
    mockAuth.mockResolvedValue({ userId: null })
    await expect(inviteCharityConsent("fav-1", "char-1")).rejects.toThrow(
      "Not authenticated"
    )
  })

  it("refuses a non-organiser", async () => {
    mock.queue({ created_by: "someone-else" })
    await expect(inviteCharityConsent("fav-1", "char-1")).rejects.toThrow(
      "Unauthorized"
    )
  })

  it("refuses a charity not on the favpoll", async () => {
    mock.queue({ created_by: "user-1" })
    mock.queue(null) // no favpoll_charities link
    await expect(inviteCharityConsent("fav-1", "char-1")).rejects.toThrow(
      "Charity is not on this favpoll"
    )
  })

  it("stamps consent_contacted_at, first invite only", async () => {
    mock.queue({ created_by: "user-1" })
    mock.queue({ charity_id: "char-1" })
    mock.queue(null) // update

    await expect(
      inviteCharityConsent("fav-1", "char-1")
    ).resolves.toBeUndefined()

    const update = mock
      .callsFor("charities")
      .find((c) => c.method === "update")!
    expect(update.args[0].consent_contacted_at).toEqual(expect.any(String))
    // .is("consent_contacted_at", null) — never overwrite the first stamp
    const isCall = mock.callsFor("charities").find((c) => c.method === "is")!
    expect(isCall.args).toEqual(["consent_contacted_at", null])
  })
})
