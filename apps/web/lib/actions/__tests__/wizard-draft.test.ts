// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockAuth = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ userId: "user-1" })
)
vi.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }))

let mock = makeSupabaseMock()

// The query mock has no storage surface, so the claim's file move needs one.
const storage = vi.hoisted(() => ({
  moves: [] as Array<{ from: string; to: string }>,
  moveError: null as { message: string } | null,
  bucket: {
    move: vi.fn(),
    upload: vi.fn(),
    getPublicUrl: vi.fn(),
  },
}))
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    ...mock.supabase,
    storage: {
      createBucket: async () => ({ error: null }),
      from: () => storage.bucket,
    },
  }),
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
const mockIsRateLimited = vi.hoisted(() => vi.fn().mockResolvedValue(false))
vi.mock("@/lib/rate-limit", () => ({
  isRateLimited: mockIsRateLimited,
  ipFromHeaders: () => "1.2.3.4",
}))
vi.mock("next/headers", () => ({
  cookies: async () => jar,
  headers: async () => new Headers(),
}))

import {
  saveWizardDraft,
  loadWizardDraft,
  claimWizardDraft,
  discardWizardDraft,
  uploadDraftPhoto,
} from "../wizard-draft"

const COOKIE = "favpoll_wizard_draft"

beforeEach(() => {
  mock = makeSupabaseMock()
  jar.store.clear()
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({ userId: "user-1" })
  mockIsRateLimited.mockResolvedValue(false)
  storage.bucket.upload.mockResolvedValue({ error: null })
  storage.moves = []
  storage.moveError = null
  storage.bucket.move.mockImplementation(async (from: string, to: string) => {
    storage.moves.push({ from, to })
    return { error: storage.moveError }
  })
  storage.bucket.getPublicUrl.mockImplementation((path: string) => ({
    data: { publicUrl: `https://cdn.test/${path}` },
  }))
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
    mock.queue({ id: "draft-1", photo_path: null })

    const result = await claimWizardDraft()

    expect(result).toEqual({
      ok: true,
      value: { claimed: true, photoUrl: null },
    })
    expect(jar.store.has(COOKIE)).toBe(false)
  })

  it("moves the draft's photo under the organiser who claimed it", async () => {
    jar.store.set(COOKIE, "draft-1")
    mock.queue({ id: "draft-1", photo_path: "drafts/draft-1/123.jpg" })

    const result = await claimWizardDraft()

    expect(storage.moves).toEqual([
      { from: "drafts/draft-1/123.jpg", to: "user-1/123.jpg" },
    ])
    expect(result).toEqual({
      ok: true,
      value: { claimed: true, photoUrl: "https://cdn.test/user-1/123.jpg" },
    })
  })

  // Somebody who just signed up must get their favpoll even if the tidy-up
  // fails. The file is public either way, and the pruner skips claimed rows.
  it("still publishes with the draft URL when the move fails", async () => {
    jar.store.set(COOKIE, "draft-1")
    mock.queue({ id: "draft-1", photo_path: "drafts/draft-1/123.jpg" })
    storage.moveError = { message: "storage unavailable" }

    const result = await claimWizardDraft()

    expect(result).toEqual({
      ok: true,
      value: {
        claimed: true,
        photoUrl: "https://cdn.test/drafts/draft-1/123.jpg",
      },
    })
  })

  // Two publishes racing: the second UPDATE matches no unclaimed row, so it
  // returns false and the caller knows not to create a second favpoll.
  it("a second claim reports false rather than publishing twice", async () => {
    jar.store.set(COOKIE, "draft-1")
    mock.queue(null)

    const result = await claimWizardDraft()

    expect(result).toEqual({
      ok: true,
      value: { claimed: false, photoUrl: null },
    })
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

  describe("the photo, with no account", () => {
    function form(name: string, type: string) {
      const fd = new FormData()
      fd.append("photo", new File([new Uint8Array([1, 2, 3])], name, { type }))
      return fd
    }

    it("writes under the draft, keyed by the TYPE and not the filename", async () => {
      jar.store.set(COOKIE, "draft-1")

      const result = await uploadDraftPhoto(
        form("../../../etc/passwd", "image/png")
      )

      const path = storage.bucket.upload.mock.calls[0]![0] as string
      expect(path).toMatch(/^drafts\/draft-1\/\d+\.png$/)
      expect(path).not.toContain("passwd")
      expect(result).toEqual({
        ok: true,
        value: `https://cdn.test/${path}`,
      })
    })

    // A photo needs a draft to belong to, and picking one may be the first
    // thing the visitor does.
    it("creates the draft when the photo comes first", async () => {
      mock.queue({ id: "draft-9" })

      await uploadDraftPhoto(form("x.jpg", "image/jpeg"))

      expect(jar.store.get(COOKIE)).toBe("draft-9")
      expect(storage.bucket.upload.mock.calls[0]![0]).toMatch(
        /^drafts\/draft-9\//
      )
    })

    // An unauthenticated endpoint that writes files needs a ceiling.
    it("refuses when the address has uploaded too often", async () => {
      jar.store.set(COOKIE, "draft-1")
      mockIsRateLimited.mockResolvedValue(true)

      const result = await uploadDraftPhoto(form("x.jpg", "image/jpeg"))

      expect(result.ok).toBe(false)
      expect(storage.bucket.upload).not.toHaveBeenCalled()
    })

    it("rejects a file that is not an image we can use", async () => {
      jar.store.set(COOKIE, "draft-1")

      const result = await uploadDraftPhoto(form("script.svg", "image/svg+xml"))

      expect(result.ok).toBe(false)
      expect(storage.bucket.upload).not.toHaveBeenCalled()
    })
  })
})
