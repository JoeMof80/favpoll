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

// A cookie jar that behaves like Next's: get/set/delete, nothing else.
const jar = vi.hoisted(() => {
  const store = new Map<string, string>()
  return {
    store,
    get: vi.fn((k: string) =>
      store.has(k) ? { name: k, value: store.get(k)! } : undefined
    ),
    set: vi.fn((k: string, v: string) => {
      store.set(k, v)
    }),
    delete: vi.fn((k: string) => {
      store.delete(k)
    }),
  }
})
vi.mock("next/headers", () => ({ cookies: async () => jar }))

import {
  saveWizardDraft,
  loadWizardDraft,
  claimWizardDraft,
  discardWizardDraft,
} from "../wizard-draft"

const COOKIE = "favpoll_wizard_draft"

beforeEach(() => {
  mock = makeSupabaseMock()
  jar.store.clear()
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({ userId: "user-1" })
})

describe("the wizard draft that outlives the sign-in", () => {
  it("creates a row on the first save and puts its id in the cookie", async () => {
    mock.queue({ id: "draft-1" })

    const result = await saveWizardDraft({ name: "Belinda" })

    expect(result).toEqual({ ok: true, value: "draft-1" })
    expect(jar.store.get(COOKIE)).toBe("draft-1")
    expect(
      mock.callsFor("wizard_drafts").some((c) => c.method === "insert")
    ).toBe(true)
  })

  it("the cookie is httpOnly, so script on the page cannot read a draft", async () => {
    mock.queue({ id: "draft-1" })
    await saveWizardDraft({ name: "Belinda" })

    expect(jar.set).toHaveBeenCalledWith(
      COOKIE,
      "draft-1",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" })
    )
  })

  it("updates in place on later saves, rather than piling up rows", async () => {
    jar.store.set(COOKIE, "draft-1")
    mock.queue({ id: "draft-1" })

    await saveWizardDraft({ name: "Belinda", about: "A longer About." })

    const calls = mock.callsFor("wizard_drafts")
    expect(calls.some((c) => c.method === "update")).toBe(true)
    expect(calls.some((c) => c.method === "insert")).toBe(false)
  })

  // The case that silently loses a favpoll: the cookie outlives the row.
  // An UPDATE matching nothing is not an error, so without this the save
  // would report success and write nowhere.
  it("starts a new draft when the cookie points at a pruned row", async () => {
    jar.store.set(COOKIE, "gone")
    mock.queue(null) // the update matches nothing
    mock.queue({ id: "draft-2" }) // the insert that follows

    const result = await saveWizardDraft({ name: "Belinda" })

    expect(result).toEqual({ ok: true, value: "draft-2" })
    expect(jar.store.get(COOKIE)).toBe("draft-2")
  })

  it("reads back only the draft this browser carries", async () => {
    jar.store.set(COOKIE, "draft-1")
    mock.queue({
      id: "draft-1",
      payload: { name: "Belinda" },
      photo_path: null,
    })

    const draft = await loadWizardDraft()

    expect(draft).toEqual({
      id: "draft-1",
      payload: { name: "Belinda" },
      photoPath: null,
    })
    const eqs = mock
      .callsFor("wizard_drafts")
      .filter((c) => c.method === "eq")
      .flatMap((c) => c.args)
    expect(eqs).toContain("draft-1")
  })

  it("reads nothing with no cookie, and asks the database nothing", async () => {
    expect(await loadWizardDraft()).toBeNull()
    expect(mock.callsFor("wizard_drafts")).toHaveLength(0)
  })

  it("a claimed draft reads as absent, so the wizard cannot reopen on it", async () => {
    jar.store.set(COOKIE, "draft-1")
    mock.queue(null) // claimed_at is not null, so the filter excludes it

    expect(await loadWizardDraft()).toBeNull()
  })

  it("claiming needs an account", async () => {
    mockAuth.mockResolvedValue({ userId: null })
    jar.store.set(COOKIE, "draft-1")

    const result = await claimWizardDraft()

    expect(result).toEqual({ ok: false, error: "Not authenticated" })
  })

  it("claims once and clears the cookie", async () => {
    jar.store.set(COOKIE, "draft-1")
    mock.queue({ id: "draft-1" })

    const result = await claimWizardDraft()

    expect(result).toEqual({ ok: true, value: true })
    expect(jar.store.has(COOKIE)).toBe(false)
  })

  // Two publishes racing: the second UPDATE matches no unclaimed row, so it
  // returns false and the caller knows not to create a second favpoll.
  it("a second claim reports false rather than publishing twice", async () => {
    jar.store.set(COOKIE, "draft-1")
    mock.queue(null)

    const result = await claimWizardDraft()

    expect(result).toEqual({ ok: true, value: false })
  })

  it("discarding deletes the row and forgets the cookie", async () => {
    jar.store.set(COOKIE, "draft-1")
    mock.queue(null)

    await discardWizardDraft()

    expect(jar.store.has(COOKIE)).toBe(false)
    expect(
      mock.callsFor("wizard_drafts").some((c) => c.method === "delete")
    ).toBe(true)
  })
})
