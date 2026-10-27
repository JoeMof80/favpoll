// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

let mock = makeSupabaseMock()

const storage = vi.hoisted(() => ({
  bucket: { remove: vi.fn() },
}))
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    ...mock.supabase,
    storage: { from: () => storage.bucket },
  }),
}))

import { GET } from "../route"

const authed = () =>
  new Request("https://favpoll.com/api/cron/prune-wizard-drafts", {
    headers: { authorization: "Bearer test-secret" },
  })

beforeEach(() => {
  mock = makeSupabaseMock()
  vi.clearAllMocks()
  process.env.CRON_SECRET = "test-secret"
  storage.bucket.remove.mockResolvedValue({ data: [], error: null })
})

describe("pruning abandoned wizard drafts", () => {
  it("refuses without the cron secret", async () => {
    const res = await GET(
      new Request("https://favpoll.com/api/cron/prune-wizard-drafts")
    )

    expect(res.status).toBe(401)
    expect(mock.callsFor("wizard_drafts")).toHaveLength(0)
  })

  it("does nothing when there is nothing stale", async () => {
    mock.queue([])

    const res = await GET(authed())

    expect(await res.json()).toEqual({ pruned: 0, photos: 0 })
    expect(storage.bucket.remove).not.toHaveBeenCalled()
  })

  // THE RULE THE CLAIM DEPENDS ON. A claimed draft's photo may still be the
  // live hero of a published favpoll, because claimWizardDraft publishes
  // with the drafts/ URL when the move fails rather than refusing someone
  // the favpoll they just signed up for.
  it("never looks at claimed drafts", async () => {
    mock.queue([])

    await GET(authed())

    const filters = mock
      .callsFor("wizard_drafts")
      .filter((c) => c.method === "is")
    expect(filters.some((c) => c.args[0] === "claimed_at")).toBe(true)
  })

  it("removes the photos before the rows that point at them", async () => {
    mock.queue([
      { id: "d1", photo_path: "drafts/d1/1.jpg" },
      { id: "d2", photo_path: null },
    ])
    mock.queue(null) // the delete
    storage.bucket.remove.mockResolvedValue({
      data: [{ name: "drafts/d1/1.jpg" }],
      error: null,
    })

    const res = await GET(authed())

    expect(storage.bucket.remove).toHaveBeenCalledWith(["drafts/d1/1.jpg"])
    expect(await res.json()).toEqual({ pruned: 2, photos: 1 })

    const methods = mock.callsFor("wizard_drafts").map((c) => c.method)
    expect(methods).toContain("delete")
  })

  // A dead photo_path is tidied by the next pass; a row deleted first leaves
  // a file nothing can ever find again.
  it("still deletes the rows when the storage sweep fails", async () => {
    mock.queue([{ id: "d1", photo_path: "drafts/d1/1.jpg" }])
    mock.queue(null)
    storage.bucket.remove.mockResolvedValue({
      data: null,
      error: { message: "storage unavailable" },
    })

    const res = await GET(authed())

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ pruned: 1, photos: 0 })
  })

  it("deletes only drafts older than the cutoff", async () => {
    mock.queue([])

    await GET(authed())

    const lt = mock.callsFor("wizard_drafts").find((c) => c.method === "lt")
    expect(lt?.args[0]).toBe("updated_at")
    const cutoff = new Date(lt!.args[1] as string).getTime()
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    expect(Date.now() - cutoff).toBeGreaterThan(sevenDays - 60_000)
    expect(Date.now() - cutoff).toBeLessThan(sevenDays + 60_000)
  })
})
