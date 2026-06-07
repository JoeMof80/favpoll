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

import { updateEvent } from "@/app/events/[id]/edit/actions"
import type { CanvasSubmitData } from "@favpoll/types"

function makeInput(
  overrides: Partial<CanvasSubmitData> = {}
): CanvasSubmitData {
  return {
    protagonistName: "Alice",
    protagonistAbout: "A bio",
    dateLabel: null,
    photoUrl: null,
    occasionType: "Birthday",
    openingLine: null,
    description: null,
    charityIds: ["charity-1"],
    closesAt: "2028-01-01T00:00",
    isPrivate: false,
    potAmount: null,
    poll: {
      id: "poll-1",
      topicId: "topic-1",
      topicIsCustom: false,
      customTopicTitle: "",
      customTopicItems: [],
      reveal: null,
      infiniteItems: null,
    },
    ...overrides,
  }
}

function makeEventRow(overrides: Record<string, any> = {}) {
  return {
    created_by: "user-1",
    closes_at: "2025-01-01T00:00:00Z",
    hard_close_at: null,
    extension_count: 0,
    ...overrides,
  }
}

/** Queue all responses for a minimal happy-path updateEvent (1 poll with id, 1 charity) */
function queueHappyPath(eventRow = makeEventRow()) {
  mock.queue(eventRow) // events select → single
  mock.queue(null) // protagonists update → await
  mock.queue(null) // events update → await
  mock.queue(null) // event_charities delete → await
  mock.queue(null) // event_charities insert → await
  mock.queue(null) // event_polls update → await (single poll upsert)
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
})

// ─────────────────────────────────────────────────────────────────────────────
// Auth & ownership
// ─────────────────────────────────────────────────────────────────────────────

describe("updateEvent — auth & ownership", () => {
  it("throws 'Not authenticated' when userId is null", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })
    await expect(updateEvent("event-1", "prot-1", makeInput())).rejects.toThrow(
      "Not authenticated"
    )
  })

  it("throws 'Unauthorized' when event belongs to a different user", async () => {
    mock.queue({ ...makeEventRow(), created_by: "other-user" })

    await expect(updateEvent("event-1", "prot-1", makeInput())).rejects.toThrow(
      "Unauthorized"
    )
  })

  it("throws when event is not found", async () => {
    mock.queue(null) // no event row

    await expect(updateEvent("event-1", "prot-1", makeInput())).rejects.toThrow(
      "Unauthorized"
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Extension validation
// ─────────────────────────────────────────────────────────────────────────────

describe("updateEvent — extension validation", () => {
  it("throws when extension_count is already 2", async () => {
    // closesAt is later than event.closes_at → isExtension = true
    mock.queue(
      makeEventRow({ extension_count: 2, closes_at: "2025-01-01T00:00:00Z" })
    )

    await expect(
      updateEvent(
        "event-1",
        "prot-1",
        makeInput({ closesAt: "2028-01-01T00:00" })
      )
    ).rejects.toThrow("Maximum extensions reached")
  })

  it("throws when new closing date is in the past", async () => {
    mock.queue(makeEventRow({ closes_at: "2020-01-01T00:00:00Z" }))

    await expect(
      updateEvent(
        "event-1",
        "prot-1",
        makeInput({ closesAt: "2021-01-01T00:00" })
      )
    ).rejects.toThrow("Closing date must be in the future")
  })

  it("throws when new closing date exceeds hard_close_at", async () => {
    mock.queue(
      makeEventRow({
        closes_at: "2025-01-01T00:00:00Z",
        hard_close_at: "2026-12-01T00:00:00Z",
      })
    )

    await expect(
      updateEvent(
        "event-1",
        "prot-1",
        makeInput({ closesAt: "2027-06-01T00:00" })
      )
    ).rejects.toThrow("Closing date cannot be extended beyond")
  })

  it("does NOT throw when extension_count is 1 (one extension still allowed)", async () => {
    queueHappyPath(
      makeEventRow({ extension_count: 1, closes_at: "2025-01-01T00:00:00Z" })
    )

    await expect(
      updateEvent(
        "event-1",
        "prot-1",
        makeInput({ closesAt: "2028-01-01T00:00" })
      )
    ).resolves.not.toThrow()
  })

  it("increments extension_count in the event update when extending", async () => {
    queueHappyPath(
      makeEventRow({ extension_count: 1, closes_at: "2025-01-01T00:00:00Z" })
    )

    await updateEvent(
      "event-1",
      "prot-1",
      makeInput({ closesAt: "2028-01-01T00:00" })
    )

    const eventsUpdate = mock
      .callsFor("events")
      .find((c) => c.method === "update")!
    expect(eventsUpdate.args[0].extension_count).toBe(2)
  })

  it("does NOT include extension_count in update when not extending", async () => {
    // closesAt same as closes_at → not an extension
    queueHappyPath(makeEventRow({ closes_at: "2028-01-01T00:00:00Z" }))

    await updateEvent(
      "event-1",
      "prot-1",
      makeInput({ closesAt: "2028-01-01T00:00" }) // same date → no extension
    )

    const eventsUpdate = mock
      .callsFor("events")
      .find((c) => c.method === "update")!
    expect(eventsUpdate.args[0]).not.toHaveProperty("extension_count")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DB writes on happy path
// ─────────────────────────────────────────────────────────────────────────────

describe("updateEvent — DB writes", () => {
  it("updates the protagonist with trimmed name and provided fields", async () => {
    queueHappyPath()

    await updateEvent(
      "event-1",
      "prot-1",
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

  it("replaces charities: deletes all then inserts new ones", async () => {
    queueHappyPath()

    await updateEvent(
      "event-1",
      "prot-1",
      makeInput({ charityIds: ["c-1", "c-2"] })
    )

    const charityDelete = mock
      .callsFor("event_charities")
      .find((c) => c.method === "delete")
    expect(charityDelete).toBeDefined()

    const charityInsert = mock
      .callsFor("event_charities")
      .find((c) => c.method === "insert")!
    expect(charityInsert.args[0]).toHaveLength(2)
    expect(charityInsert.args[0][0]).toMatchObject({
      charity_id: "c-1",
      display_order: 0,
    })
    expect(charityInsert.args[0][1]).toMatchObject({
      charity_id: "c-2",
      display_order: 1,
    })
  })

  it("skips charity insert when charityIds is empty", async () => {
    // Re-queue without charity insert response
    mock.queue(makeEventRow()) // events select
    mock.queue(null) // protagonists update
    mock.queue(null) // events update
    mock.queue(null) // event_charities delete
    // No charity insert since charityIds is empty
    mock.queue([]) // event_polls select

    await updateEvent("event-1", "prot-1", makeInput({ charityIds: [] }))

    const charityInserts = mock
      .callsFor("event_charities")
      .filter((c) => c.method === "insert")
    expect(charityInserts).toHaveLength(0)
  })
})
