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

import {
  setFavpollCharities,
  setFavpollTopic,
  setPicksSuspended,
  updateStoryField,
  type StoryField,
} from "@/app/favpolls/[id]/manage/actions"

const FAVPOLL_ID = "11111111-1111-1111-1111-111111111111"
const TOPIC_ID = "22222222-2222-2222-2222-222222222222"
const CHARITY_ID = "33333333-3333-3333-3333-333333333333"

const openFavpoll = {
  created_by: "user-1",
  closed_at: null,
  closes_at: "2999-06-01T12:00:00Z",
  subject: "someone",
  protagonist_id: "44444444-4444-4444-4444-444444444444",
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
})

// Every refusal here is a RESULT, not a throw: the parse happens inside
// asResult, which is what the organiser's row already renders (#1109).
describe("updateStoryField refuses a field it does not know", () => {
  it("saves a field it does know (the control)", async () => {
    mock.queue(openFavpoll) // the ownership lookup
    mock.queue(null) // the write

    await expect(
      updateStoryField(FAVPOLL_ID, "opening_line", "In memory of")
    ).resolves.toEqual({ ok: true, value: undefined })
  })

  // THE REASON THIS SCHEMA EXISTS. LIMITS[field] is undefined so the
  // length guard passed, the required-field guards name specific fields,
  // and the switch that writes has no default — so an unknown field fell
  // through everything, wrote nothing, threw nothing, and asResult
  // answered { ok: true }. A silent success.
  it("no longer reports success for a field it cannot write", async () => {
    const result = await updateStoryField(
      FAVPOLL_ID,
      "created_by" as StoryField,
      "somebody-else"
    )

    expect(result).toEqual({
      ok: false,
      error: "That isn't a field we can change.",
    })
    expect(mock.from).not.toHaveBeenCalled()
  })

  it("refuses an id that is not one", async () => {
    await expect(
      updateStoryField("favpoll-1", "about", "A bio")
    ).resolves.toEqual({
      ok: false,
      error: "That favpoll, topic or charity wasn't recognised.",
    })
    expect(mock.from).not.toHaveBeenCalled()
  })

  it("refuses a value that is not a value", async () => {
    await expect(
      updateStoryField(FAVPOLL_ID, "about", {
        toString: "nice try",
      } as unknown as string)
    ).resolves.toEqual({
      ok: false,
      error: "That value isn't something we can store.",
    })
  })
})

describe("the other three manage actions check their arguments", () => {
  it("setFavpollCharities refuses a charity that is not a uuid", async () => {
    await expect(
      setFavpollCharities(FAVPOLL_ID, ["charity-1"])
    ).resolves.toMatchObject({ ok: false })
    expect(mock.from).not.toHaveBeenCalled()
  })

  it("setFavpollCharities keeps the action's own count rule", async () => {
    mock.queue(openFavpoll)

    // Four real ids: the schema lets them through, the action refuses
    // them in its own words, because deduping comes first.
    await expect(
      setFavpollCharities(FAVPOLL_ID, [
        CHARITY_ID,
        "55555555-5555-5555-5555-555555555555",
        "66666666-6666-6666-6666-666666666666",
        "77777777-7777-7777-7777-777777777777",
      ])
    ).resolves.toEqual({
      ok: false,
      error: "Pick between one and three charities.",
    })
  })

  it("setFavpollTopic refuses a topic that is not a uuid", async () => {
    await expect(
      setFavpollTopic(FAVPOLL_ID, { topicId: "topic-1", subsetId: null })
    ).resolves.toMatchObject({ ok: false })
    expect(mock.from).not.toHaveBeenCalled()
  })

  // The subset is nested a level down, where a schema is easiest to get
  // wrong — its members become the poll's rows.
  it("setFavpollTopic refuses a subset that is not a uuid", async () => {
    await expect(
      setFavpollTopic(FAVPOLL_ID, { topicId: TOPIC_ID, subsetId: "subset-1" })
    ).resolves.toMatchObject({ ok: false })
    expect(mock.from).not.toHaveBeenCalled()
  })

  it("setPicksSuspended refuses something that is not a yes or a no", async () => {
    await expect(
      setPicksSuspended(FAVPOLL_ID, "yes" as unknown as boolean)
    ).resolves.toEqual({
      ok: false,
      error: "Say whether the picks are suspended.",
    })
    expect(mock.from).not.toHaveBeenCalled()
  })
})
