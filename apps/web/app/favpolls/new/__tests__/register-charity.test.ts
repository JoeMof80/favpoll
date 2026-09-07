// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockAuth = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ userId: "user-1" })
)
const mockCurrentUser = vi.hoisted(() => vi.fn().mockResolvedValue(null))
const mockVerify = vi.hoisted(() =>
  vi
    .fn()
    .mockResolvedValue({ status: "verified", registeredName: "DOGS TRUST" })
)

vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser,
}))
const mockContact = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    email: "enquiries@dogstrust.org.uk",
    website: "www.dogstrust.org.uk",
  })
)

vi.mock("@/lib/charity-commission", () => ({
  verifyCharityNumber: mockVerify,
  fetchRegisterContact: mockContact,
}))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

// Relative path bypasses the Storybook mock alias in vitest.config.ts
import { findOrCreateRegisterCharity } from "../actions"

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
  mockVerify.mockReset()
  mockVerify.mockResolvedValue({
    status: "verified",
    registeredName: "DOGS TRUST",
  })
})

describe("findOrCreateRegisterCharity", () => {
  it("requires auth", async () => {
    mockAuth.mockResolvedValue({ userId: null })
    await expect(
      findOrCreateRegisterCharity({
        registeredNumber: "227523",
        displayName: "Dogs Trust",
      })
    ).rejects.toThrow(/authenticated/i)
  })

  it("returns the existing charity when the number is already known", async () => {
    mock.queue({ id: "c-existing", name: "Dogs Trust" })
    const c = await findOrCreateRegisterCharity({
      registeredNumber: "227523",
      displayName: "Dogs Trust",
    })
    expect(c.id).toBe("c-existing")
    expect(mock.callsFor("charities").some((x) => x.method === "insert")).toBe(
      false
    )
    expect(mockVerify).not.toHaveBeenCalled()
  })

  it("creates consent-pending and OFF the catalogue, with verification", async () => {
    mock.queue(null) // no existing row
    mock.queue({ id: "c-new", name: "Dogs Trust" }) // the insert's select
    const c = await findOrCreateRegisterCharity({
      registeredNumber: "227523",
      displayName: "Dogs Trust",
    })
    expect(c.id).toBe("c-new")
    const insert = mock
      .callsFor("charities")
      .find((x) => x.method === "insert")!
    expect(insert.args[0]).toMatchObject({
      name: "Dogs Trust",
      registered_number: "227523",
      is_active: false,
      consent_status: "pending",
      verification_status: "verified",
      verified_name: "DOGS TRUST",
      registered_email: "enquiries@dogstrust.org.uk",
      registered_website: "www.dogstrust.org.uk",
    })
  })

  it("refuses a charity no longer on the register", async () => {
    mock.queue(null)
    mockVerify.mockResolvedValue({ status: "removed", registeredName: "X" })
    await expect(
      findOrCreateRegisterCharity({
        registeredNumber: "1",
        displayName: "Gone",
      })
    ).rejects.toThrow(/isn't currently on the register/)
  })
})
