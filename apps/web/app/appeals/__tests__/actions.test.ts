// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockAuth = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ userId: "manager-1" })
)
vi.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }))

const mockCanManage = vi.hoisted(() => vi.fn().mockReturnValue(true))
vi.mock("@/lib/appeals-admin", () => ({ canManageAppeals: mockCanManage }))

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

import { createAppeal, updateAppeal } from "../actions"

const CHARITY_ID = "22222222-2222-2222-2222-222222222222"
const APPEAL_ID = "33333333-3333-3333-3333-333333333333"

const VALID = {
  name: "Winter Appeal",
  slug: "winter-appeal",
  charityId: CHARITY_ID,
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "manager-1" })
  mockCanManage.mockReturnValue(true)
})

// THESE RETURN, THEY DO NOT THROW. The form renders `error`, so every
// refusal below is a returned object — a thrown message would break the
// caller rather than inform it (#1109).
describe("createAppeal returns its refusals", () => {
  it("creates an appeal and answers with the slug", async () => {
    mock.queue(null) // the insert

    await expect(createAppeal(VALID)).resolves.toEqual({
      slug: "winter-appeal",
    })
    expect(
      mock.callsFor("appeals").find((c) => c.method === "insert")
    ).toBeTruthy()
  })

  it("keeps its own sentence for a slug that is not a slug", async () => {
    await expect(
      createAppeal({ ...VALID, slug: "Winter Appeal!" })
    ).resolves.toEqual({
      error: "Slug must be lowercase words joined by hyphens.",
    })
    expect(mock.from).not.toHaveBeenCalled()
  })

  it("keeps its own sentence for a missing name", async () => {
    await expect(createAppeal({ ...VALID, name: "   " })).resolves.toEqual({
      error: "Name is required.",
    })
  })

  it("keeps its own sentence for a charity that is not one", async () => {
    await expect(
      createAppeal({ ...VALID, charityId: "charity-1" })
    ).resolves.toEqual({ error: "Charity is required." })
  })

  // Was handed to Postgres, which answered in its own words.
  it("answers for a closing date it cannot read", async () => {
    await expect(
      createAppeal({ ...VALID, closesAt: "next Tuesday" })
    ).resolves.toEqual({ error: "That closing date didn't make sense." })
  })

  it("still refuses a caller who may not manage appeals", async () => {
    mockCanManage.mockReturnValue(false)

    await expect(createAppeal(VALID)).rejects.toThrow("Not authorised")
  })
})

describe("updateAppeal returns its refusals", () => {
  it("updates an appeal it can find", async () => {
    mock.queue({ slug: "winter-appeal" }) // the existing lookup
    mock.queue(null) // the update

    await expect(
      updateAppeal(APPEAL_ID, { name: "Winter Appeal 2027" })
    ).resolves.toEqual({})
  })

  it("answers for an id that is not an id", async () => {
    await expect(
      updateAppeal("appeal-1", { name: "Winter Appeal" })
    ).resolves.toEqual({ error: "That appeal wasn't recognised." })
    expect(mock.from).not.toHaveBeenCalled()
  })

  // `input.name.trim()` was a TypeError here — a 500 where the form
  // wanted a sentence.
  it("answers for a missing name instead of throwing a TypeError", async () => {
    await expect(
      updateAppeal(APPEAL_ID, {} as { name: string })
    ).resolves.toEqual({ error: "Name is required." })
    expect(mock.from).not.toHaveBeenCalled()
  })
})
