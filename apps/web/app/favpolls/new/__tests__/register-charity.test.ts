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
// Hoisted: vi.mock factories run before module-level consts exist.
const mockPurpose = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    activities: "Rescues and rehomes dogs across the UK.",
    classification: { what: ["Animals"], who: [], how: ["Provides Services"] },
  })
)

// The action reads the register mirror (2026-09-27); the mirror has its
// own tests, so here it is the API's shape, mocked.
vi.mock("@/lib/register-mirror", () => ({
  verifyOnMirror: mockVerify,
  contactFromMirror: mockContact,
  purposeFromMirror: mockPurpose,
}))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

const mockIsRateLimited = vi.hoisted(() => vi.fn().mockResolvedValue(false))
vi.mock("@/lib/rate-limit", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/rate-limit")>()
  return { ...actual, isRateLimited: mockIsRateLimited }
})
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7" }),
}))

// Relative path bypasses the Storybook mock alias in vitest.config.ts
import { findOrCreateRegisterCharity } from "../actions"

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
  mockIsRateLimited.mockReset()
  mockIsRateLimited.mockResolvedValue(false)
  mockVerify.mockReset()
  mockVerify.mockResolvedValue({
    status: "verified",
    registeredName: "DOGS TRUST",
  })
})

describe("findOrCreateRegisterCharity", () => {
  // OPEN SINCE 2026-10-27, with the search it serves. A visitor picking
  // a charity in the signed-out wizard gets here before they have an
  // account, so an auth gate would have made the register unusable to
  // exactly the people the step exists for.
  it("serves a visitor with no account", async () => {
    mockAuth.mockResolvedValue({ userId: null })
    mock.queue({ id: "c-existing", name: "Dogs Trust" })

    const c = await findOrCreateRegisterCharity({
      registeredNumber: "227523",
      displayName: "Dogs Trust",
    })

    expect(c.id).toBe("c-existing")
  })

  it("meters a visitor by address, on a bucket of their own", async () => {
    mockAuth.mockResolvedValue({ userId: null })
    mock.queue({ id: "c-existing", name: "Dogs Trust" })

    await findOrCreateRegisterCharity({
      registeredNumber: "227523",
      displayName: "Dogs Trust",
    })

    expect(mockIsRateLimited).toHaveBeenCalledWith(
      "register-add-anon-ip",
      "203.0.113.7",
      expect.any(Array)
    )
  })

  // The limit is the control the session used to stand in for, so it has
  // to bite BEFORE anything is written.
  it("writes nothing once the bucket is empty", async () => {
    mockAuth.mockResolvedValue({ userId: null })
    mockIsRateLimited.mockResolvedValue(true)

    await expect(
      findOrCreateRegisterCharity({
        registeredNumber: "227523",
        displayName: "Dogs Trust",
      })
    ).rejects.toThrow(/too many requests/i)
    expect(mock.callsFor("charities")).toHaveLength(0)
    expect(mockVerify).not.toHaveBeenCalled()
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
    mock.queue([]) // the catalogue, for the perfect-topic suggestion
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
    })
    // STEP 4: the register's own words are no longer COPIED onto the
    // account. The number is the link, and contact and purpose are read
    // from the mirror wherever they are shown — which is what lets step 5
    // drop these columns.
    for (const copied of [
      "registered_email",
      "registered_website",
      "activities",
      "classification",
      "objects",
      "areas",
      "grant_making",
    ]) {
      expect(insert.args[0]).not.toHaveProperty(copied)
    }
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
