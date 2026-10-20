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

import { updateFavpoll, updateClosesAt } from "@/app/favpolls/[id]/edit/actions"
import type { CanvasSubmitData } from "@favpoll/types"

// The ids are uuid columns, so the fixtures are uuids (#1109): the
// actions now check the format before they touch anything.
const FAVPOLL_ID = "11111111-1111-1111-1111-111111111111"
const PROT_ID = "22222222-2222-2222-2222-222222222222"
const CHARITY_ID = "33333333-3333-3333-3333-333333333333"
const CHARITY_2_ID = "44444444-4444-4444-4444-444444444444"
const POLL_ID = "66666666-6666-6666-6666-666666666666"
const TOPIC_ID = "55555555-5555-5555-5555-555555555555"

function makeInput(
  overrides: Partial<CanvasSubmitData> = {}
): CanvasSubmitData {
  return {
    protagonistName: "Alice",
    protagonistAbout: "A bio",
    dateLabel: null,
    photoUrl: null,
    category: "celebration",
    grouping: "individual",
    subject: "someone",
    causeLabel: null,
    openingLine: null,
    description: null,
    isListed: true,
    charityIds: [CHARITY_ID],
    closesAt: "2028-01-01T00:00:00.000Z",
    isPrivate: false,
    allowGuestItems: true,
    potAmount: null,
    poll: {
      id: POLL_ID,
      topicId: TOPIC_ID,
      topicIsCustom: false,
      customTopicTitle: "",
      customTopicItems: [],
      note: null,
      infiniteItems: null,
    },
    ...overrides,
  }
}

function makeFavpollRow(overrides: Record<string, any> = {}) {
  return {
    created_by: "user-1",
    closes_at: "2025-01-01T00:00:00Z",
    hard_close_at: null,
    extension_count: 0,
    ...overrides,
  }
}

/** Queue all responses for a minimal happy-path updateFavpoll (1 poll with id, 1 charity) */
function queueHappyPath(favpollRow = makeFavpollRow()) {
  mock.queue(favpollRow) // favpolls select → single
  mock.queue(null) // protagonists update → await
  mock.queue(null) // favpolls update → await
  mock.queue(null) // favpoll_charities delete → await
  mock.queue(null) // favpoll_charities insert → await
  mock.queue(null) // favpoll_polls update → await (single poll upsert)
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
})

// ─────────────────────────────────────────────────────────────────────────────
// Auth & ownership
// ─────────────────────────────────────────────────────────────────────────────

describe("updateFavpoll — auth & ownership", () => {
  it("throws 'Not authenticated' when userId is null", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })
    await expect(
      updateFavpoll(FAVPOLL_ID, PROT_ID, makeInput())
    ).rejects.toThrow("Not authenticated")
  })

  it("throws 'Unauthorized' when favpoll belongs to a different user", async () => {
    mock.queue({ ...makeFavpollRow(), created_by: "other-user" })

    await expect(
      updateFavpoll(FAVPOLL_ID, PROT_ID, makeInput())
    ).rejects.toThrow("Unauthorized")
  })

  it("throws when favpoll is not found", async () => {
    mock.queue(null) // no favpoll row

    await expect(
      updateFavpoll(FAVPOLL_ID, PROT_ID, makeInput())
    ).rejects.toThrow("Unauthorized")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Extension validation
// ─────────────────────────────────────────────────────────────────────────────

describe("updateFavpoll — extension validation", () => {
  it("throws when extension_count is already 2", async () => {
    // closesAt is later than favpoll.closes_at → isExtension = true
    mock.queue(
      makeFavpollRow({ extension_count: 2, closes_at: "2025-01-01T00:00:00Z" })
    )

    await expect(
      updateFavpoll(
        FAVPOLL_ID,
        PROT_ID,
        makeInput({ closesAt: "2028-01-01T00:00:00.000Z" })
      )
    ).rejects.toThrow("Maximum extensions reached")
  })

  it("throws when new closing date is in the past", async () => {
    mock.queue(makeFavpollRow({ closes_at: "2020-01-01T00:00:00Z" }))

    await expect(
      updateFavpoll(
        FAVPOLL_ID,
        PROT_ID,
        makeInput({ closesAt: "2021-01-01T00:00:00.000Z" })
      )
    ).rejects.toThrow("Closing date must be in the future")
  })

  it("throws when new closing date exceeds hard_close_at", async () => {
    mock.queue(
      makeFavpollRow({
        closes_at: "2025-01-01T00:00:00Z",
        hard_close_at: "2026-12-01T00:00:00Z",
      })
    )

    await expect(
      updateFavpoll(
        FAVPOLL_ID,
        PROT_ID,
        makeInput({ closesAt: "2027-06-01T00:00:00.000Z" })
      )
    ).rejects.toThrow("Closing date cannot be extended beyond")
  })

  it("does NOT throw when extension_count is 1 (one extension still allowed)", async () => {
    queueHappyPath(
      makeFavpollRow({ extension_count: 1, closes_at: "2025-01-01T00:00:00Z" })
    )

    await expect(
      updateFavpoll(
        FAVPOLL_ID,
        PROT_ID,
        makeInput({ closesAt: "2028-01-01T00:00:00.000Z" })
      )
    ).resolves.not.toThrow()
  })

  it("increments extension_count in the favpoll update when extending", async () => {
    queueHappyPath(
      makeFavpollRow({ extension_count: 1, closes_at: "2025-01-01T00:00:00Z" })
    )

    await updateFavpoll(
      FAVPOLL_ID,
      PROT_ID,
      makeInput({ closesAt: "2028-01-01T00:00:00.000Z" })
    )

    const favpollsUpdate = mock
      .callsFor("favpolls")
      .find((c) => c.method === "update")!
    expect(favpollsUpdate.args[0].extension_count).toBe(2)
  })

  it("does NOT include extension_count in update when not extending", async () => {
    // closesAt same as closes_at → not an extension
    queueHappyPath(makeFavpollRow({ closes_at: "2028-01-01T00:00:00Z" }))

    await updateFavpoll(
      FAVPOLL_ID,
      PROT_ID,
      makeInput({ closesAt: "2028-01-01T00:00:00.000Z" }) // same date → no extension
    )

    const favpollsUpdate = mock
      .callsFor("favpolls")
      .find((c) => c.method === "update")!
    expect(favpollsUpdate.args[0]).not.toHaveProperty("extension_count")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DB writes on happy path
// ─────────────────────────────────────────────────────────────────────────────

describe("updateFavpoll — DB writes", () => {
  it("updates the protagonist with trimmed name and provided fields", async () => {
    queueHappyPath()

    await updateFavpoll(
      FAVPOLL_ID,
      PROT_ID,
      makeInput({
        protagonistName: "  Bob  ",
        dateLabel: "1990–2025",
        protagonistAbout: "Bio text",
      })
    )

    const protUpdate = mock
      .callsFor("protagonists")
      .find((c) => c.method === "update")!
    expect(protUpdate.args[0]).toMatchObject({
      name: "Bob",
      context: "1990–2025",
      about: "Bio text",
    })
  })

  it("stores cause photo_url and context on the favpoll row (subject='cause')", async () => {
    queueHappyPath()

    await updateFavpoll(
      FAVPOLL_ID,
      "",
      makeInput({
        subject: "cause",
        causeLabel: "Help the Homeless",
        protagonistName: "",
        photoUrl: "https://example.com/cause.jpg",
        dateLabel: "Winter 2026 appeal",
      })
    )

    expect(
      mock.callsFor("protagonists").filter((c) => c.method === "update")
    ).toHaveLength(0)

    const favpollUpdate = mock
      .callsFor("favpolls")
      .find((c) => c.method === "update")!
    expect(favpollUpdate.args[0]).toMatchObject({
      cause_label: "Help the Homeless",
      photo_url: "https://example.com/cause.jpg",
      context: "Winter 2026 appeal",
    })
  })

  it("keeps favpoll-level photo/context null for person favpolls (they live on the protagonist)", async () => {
    queueHappyPath()

    await updateFavpoll(
      FAVPOLL_ID,
      PROT_ID,
      makeInput({
        photoUrl: "https://example.com/me.jpg",
        dateLabel: "1990–2025",
      })
    )

    const favpollUpdate = mock
      .callsFor("favpolls")
      .find((c) => c.method === "update")!
    expect(favpollUpdate.args[0]).toMatchObject({
      photo_url: null,
      context: null,
    })
    const protUpdate = mock
      .callsFor("protagonists")
      .find((c) => c.method === "update")!
    expect(protUpdate.args[0]).toMatchObject({
      photo_url: "https://example.com/me.jpg",
      context: "1990–2025",
    })
  })

  it("replaces charities: deletes all then inserts new ones", async () => {
    queueHappyPath()

    await updateFavpoll(
      FAVPOLL_ID,
      PROT_ID,
      makeInput({ charityIds: [CHARITY_ID, CHARITY_2_ID] })
    )

    const charityDelete = mock
      .callsFor("favpoll_charities")
      .find((c) => c.method === "delete")
    expect(charityDelete).toBeDefined()

    const charityInsert = mock
      .callsFor("favpoll_charities")
      .find((c) => c.method === "insert")!
    expect(charityInsert.args[0]).toHaveLength(2)
    expect(charityInsert.args[0][0]).toMatchObject({
      charity_id: CHARITY_ID,
      display_order: 0,
    })
    expect(charityInsert.args[0][1]).toMatchObject({
      charity_id: CHARITY_2_ID,
      display_order: 1,
    })
  })

  it("skips charity insert when charityIds is empty", async () => {
    // Re-queue without charity insert response
    mock.queue(makeFavpollRow()) // favpolls select
    mock.queue(null) // protagonists update
    mock.queue(null) // favpolls update
    mock.queue(null) // favpoll_charities delete
    // No charity insert since charityIds is empty
    mock.queue([]) // favpoll_polls select

    await updateFavpoll(FAVPOLL_ID, PROT_ID, makeInput({ charityIds: [] }))

    const charityInserts = mock
      .callsFor("favpoll_charities")
      .filter((c) => c.method === "insert")
    expect(charityInserts).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// updateClosesAt — the manage page's Close date row (a result, not a throw)
// ─────────────────────────────────────────────────────────────────────────────

describe("updateClosesAt", () => {
  const soon = new Date(Date.now() + 7 * 86_400_000).toISOString()

  it("refuses a close in the past even when it SHORTENS (a past close is a close)", async () => {
    mock.queue(makeFavpollRow({ closes_at: soon, closed_at: null }))
    const yesterday = new Date(Date.now() - 86_400_000).toISOString()
    expect(await updateClosesAt(FAVPOLL_ID, yesterday)).toEqual({
      ok: false,
      error: "Closing date must be in the future",
    })
  })

  it("accepts a shorter close that is still ahead, without spending an extension", async () => {
    mock.queue(
      makeFavpollRow({ closes_at: soon, closed_at: null, extension_count: 2 })
    )
    mock.queue(null) // favpolls update
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString()
    expect(await updateClosesAt(FAVPOLL_ID, tomorrow)).toEqual({
      ok: true,
      value: undefined,
    })
  })

  it("says why when the extensions are spent", async () => {
    mock.queue(
      makeFavpollRow({ closes_at: soon, closed_at: null, extension_count: 2 })
    )
    const later = new Date(Date.now() + 14 * 86_400_000).toISOString()
    expect(await updateClosesAt(FAVPOLL_ID, later)).toMatchObject({
      ok: false,
      error: expect.stringContaining("Maximum extensions reached"),
    })
  })
})

// ---------------------------------------------------------------------------
// The schema at the boundary (#1109)
// ---------------------------------------------------------------------------

describe("updateFavpoll checks its arguments", () => {
  // THIS ONE THROWS, like every other guard in the action. The wizard's
  // catch renders err.message, so the sentence shows in development and
  // is redacted in production — converting it to a result is #1105's
  // remaining work on this file, not this ticket's.
  it("throws for an id that is not one, before reading anything", async () => {
    await expect(
      updateFavpoll("favpoll-1", PROT_ID, makeInput())
    ).rejects.toThrow("That favpoll, topic or charity wasn't recognised.")
    expect(mock.from).not.toHaveBeenCalled()
  })

  it("throws for a closing date it cannot read", async () => {
    await expect(
      updateFavpoll(
        FAVPOLL_ID,
        PROT_ID,
        makeInput({ closesAt: "next Tuesday" })
      )
    ).rejects.toThrow("That closing date didn't make sense.")
    expect(mock.from).not.toHaveBeenCalled()
  })

  // A cause favpoll has no protagonist row and the wizard calls this with
  // "" for it (use-wizard-state: `edit.protagonistId ?? ""`), so the empty
  // string is a legitimate value rather than a missing one.
  it("accepts the empty protagonist id a cause favpoll sends", async () => {
    queueHappyPath()

    await expect(
      updateFavpoll(
        FAVPOLL_ID,
        "",
        makeInput({ subject: "cause", causeLabel: "Winter" })
      )
    ).resolves.toBeUndefined()
  })
})

describe("updateClosesAt answers with a result, not a throw", () => {
  it("returns the refusal for an id that is not one", async () => {
    await expect(
      updateClosesAt("favpoll-1", "2028-01-01T00:00:00.000Z")
    ).resolves.toEqual({
      ok: false,
      error: "That favpoll, topic or charity wasn't recognised.",
    })
    expect(mock.from).not.toHaveBeenCalled()
  })

  it("returns the refusal for a date it cannot read", async () => {
    await expect(updateClosesAt(FAVPOLL_ID, "next Tuesday")).resolves.toEqual({
      ok: false,
      error: "That closing date didn't make sense.",
    })
    expect(mock.from).not.toHaveBeenCalled()
  })
})
