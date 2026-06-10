// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockAuth = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ userId: "user-1" })
)
const mockCurrentUser = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    firstName: "Alice",
    lastName: "Smith",
    primaryEmailAddressId: "e1",
    emailAddresses: [{ id: "e1", emailAddress: "alice@example.com" }],
    imageUrl: "https://example.com/avatar.jpg",
  })
)

vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser,
}))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

// Use relative path to bypass the Storybook mock alias in vitest.config.ts
import { createEvent } from "../actions"

const BASE_INPUT = {
  protagonistName: "Joan",
  protagonistAbout: null,
  photoUrl: null,
  dateLabel: null,
  category: "celebration" as const,
  grouping: "individual" as const,
  openingLine: null,
  description: null,
  charityIds: ["charity-1"],
  closesAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  isPrivate: false,
  isListed: true,
  potAmount: null,
}

function queueCanonicalPoll() {
  mock.queue({ id: "user-1" }) // users upsert
  mock.queue({ id: "protagonist-1" }) // protagonists insert
  mock.queue({ id: "event-1" }) // events insert
  mock.queue(null) // event_charities insert
  mock.queue({ id: "poll-1" }) // event_polls insert
  mock.queue(null) // event_poll_items insert
  mock.queue(null) // event_pots insert
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
})

describe("createEvent — canonical topic", () => {
  it("returns eventId and inserts in correct order", async () => {
    queueCanonicalPoll()

    const result = await createEvent({
      ...BASE_INPUT,
      poll: {
        topicId: "topic-1",
        customTopic: null,
        reveal: null,
        infiniteItems: null,
      },
    })

    expect(result).toEqual({ eventId: "event-1" })
    expect(
      mock.callsFor("events").find((c) => c.method === "insert")
    ).toBeTruthy()
    expect(
      mock.callsFor("event_polls").find((c) => c.method === "insert")
    ).toBeTruthy()
  })

  it("throws when userId is null", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })
    await expect(
      createEvent({
        ...BASE_INPUT,
        poll: {
          topicId: "topic-1",
          customTopic: null,
          reveal: null,
          infiniteItems: null,
        },
      })
    ).rejects.toThrow("Not authenticated")
  })
})

describe("createEvent — custom topic", () => {
  it("inserts topic with placeholders:{} and is_active:true, is_finite:false", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    mock.queue({ id: "protagonist-1" }) // protagonists insert
    mock.queue({ id: "event-1" }) // events insert
    mock.queue(null) // event_charities insert
    mock.queue({ id: "new-topic-1" }) // topics insert
    mock.queue([{ id: "item-1" }, { id: "item-2" }]) // topic_items insert
    mock.queue({ id: "poll-1" }) // event_polls insert
    mock.queue(null) // event_poll_items insert
    mock.queue(null) // event_pots insert

    await createEvent({
      ...BASE_INPUT,
      poll: {
        topicId: null,
        customTopic: { title: "My Sport", items: ["Football", "Tennis"] },
        reveal: null,
        infiniteItems: null,
      },
    })

    const topicInsert = mock
      .callsFor("topics")
      .find((c) => c.method === "insert")!
    expect(topicInsert.args[0]).toMatchObject({
      title: "My Sport",
      created_by: "user-1",
      is_active: true,
      is_finite: false,
      placeholders: {},
    })
  })

  it("inserts topic_items with source:organiser, is_canonical:false, review_status:pending_review", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    mock.queue({ id: "protagonist-1" }) // protagonists insert
    mock.queue({ id: "event-1" }) // events insert
    mock.queue(null) // event_charities insert
    mock.queue({ id: "new-topic-1" }) // topics insert
    mock.queue([{ id: "item-1" }, { id: "item-2" }]) // topic_items insert
    mock.queue({ id: "poll-1" }) // event_polls insert
    mock.queue(null) // event_poll_items insert
    mock.queue(null) // event_pots insert

    await createEvent({
      ...BASE_INPUT,
      poll: {
        topicId: null,
        customTopic: { title: "My Sport", items: ["Football", "Tennis"] },
        reveal: null,
        infiniteItems: null,
      },
    })

    const itemsInsert = mock
      .callsFor("topic_items")
      .find((c) => c.method === "insert")!
    expect(itemsInsert.args[0]).toEqual([
      expect.objectContaining({
        label: "Football",
        source: "organiser",
        is_canonical: false,
        review_status: "pending_review",
      }),
      expect.objectContaining({
        label: "Tennis",
        source: "organiser",
        is_canonical: false,
        review_status: "pending_review",
      }),
    ])
  })

  it("wires the new topic and items to the event poll and poll_items", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    mock.queue({ id: "protagonist-1" }) // protagonists insert
    mock.queue({ id: "event-1" }) // events insert
    mock.queue(null) // event_charities insert
    mock.queue({ id: "new-topic-99" }) // topics insert
    mock.queue([{ id: "item-a" }, { id: "item-b" }]) // topic_items insert
    mock.queue({ id: "poll-99" }) // event_polls insert
    mock.queue(null) // event_poll_items insert
    mock.queue(null) // event_pots insert

    await createEvent({
      ...BASE_INPUT,
      poll: {
        topicId: null,
        customTopic: { title: "Colours", items: ["Red", "Blue"] },
        reveal: null,
        infiniteItems: null,
      },
    })

    const pollInsert = mock
      .callsFor("event_polls")
      .find((c) => c.method === "insert")!
    expect(pollInsert.args[0]).toMatchObject({
      event_id: "event-1",
      topic_id: "new-topic-99",
    })

    const pollItemsInsert = mock
      .callsFor("event_poll_items")
      .find((c) => c.method === "insert")!
    expect(pollItemsInsert.args[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          event_poll_id: "poll-99",
          topic_item_id: "item-a",
        }),
        expect.objectContaining({
          event_poll_id: "poll-99",
          topic_item_id: "item-b",
        }),
      ])
    )
  })

  it("skips topic_items insert when no items are provided", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    mock.queue({ id: "protagonist-1" }) // protagonists insert
    mock.queue({ id: "event-1" }) // events insert
    mock.queue(null) // event_charities insert
    mock.queue({ id: "new-topic-1" }) // topics insert
    // No topic_items insert
    mock.queue({ id: "poll-1" }) // event_polls insert
    // No event_poll_items insert
    mock.queue(null) // event_pots insert

    await createEvent({
      ...BASE_INPUT,
      poll: {
        topicId: null,
        customTopic: { title: "Empty Topic", items: [] },
        reveal: null,
        infiniteItems: null,
      },
    })

    expect(
      mock.callsFor("topic_items").filter((c) => c.method === "insert")
    ).toHaveLength(0)
  })
})

describe("createEvent — canonical topic with organiser additions (addedItems)", () => {
  function queueWithAdditions() {
    mock.queue({ id: "user-1" }) // users upsert
    mock.queue({ id: "protagonist-1" }) // protagonists insert
    mock.queue({ id: "event-1" }) // events insert
    mock.queue(null) // event_charities insert
    mock.queue({ id: "poll-1" }) // event_polls insert
    // canonical path: no customItemIds event_poll_items insert
    mock.queue([{ id: "add-1" }, { id: "add-2" }]) // topic_items insert (addedItems)
    mock.queue(null) // event_poll_items insert (addedItems)
    mock.queue(null) // event_pots insert
  }

  it("inserts added items with source:organiser, is_canonical:false, review_status:pending_review", async () => {
    queueWithAdditions()
    await createEvent({
      ...BASE_INPUT,
      poll: {
        topicId: "topic-1",
        customTopic: null,
        reveal: null,
        infiniteItems: null,
        addedItems: ["Purple", "Orange"],
      },
    })
    const itemsInsert = mock
      .callsFor("topic_items")
      .find((c) => c.method === "insert")!
    expect(itemsInsert.args[0]).toEqual([
      expect.objectContaining({
        label: "Purple",
        source: "organiser",
        is_canonical: false,
        review_status: "pending_review",
      }),
      expect.objectContaining({
        label: "Orange",
        source: "organiser",
        is_canonical: false,
        review_status: "pending_review",
      }),
    ])
  })

  it("links added items to the event poll as event_poll_items", async () => {
    queueWithAdditions()
    await createEvent({
      ...BASE_INPUT,
      poll: {
        topicId: "topic-1",
        customTopic: null,
        reveal: null,
        infiniteItems: null,
        addedItems: ["Purple", "Orange"],
      },
    })
    const pollItemsInserts = mock
      .callsFor("event_poll_items")
      .filter((c) => c.method === "insert")
    // Only one event_poll_items insert for canonical + addedItems path
    const additionsInsert = pollItemsInserts[0]
    expect(additionsInsert.args[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          event_poll_id: "poll-1",
          topic_item_id: "add-1",
          is_guest_added: false,
        }),
        expect.objectContaining({
          event_poll_id: "poll-1",
          topic_item_id: "add-2",
          is_guest_added: false,
        }),
      ])
    )
  })

  it("skips addedItems insert when addedItems is empty", async () => {
    queueCanonicalPoll()
    await createEvent({
      ...BASE_INPUT,
      poll: {
        topicId: "topic-1",
        customTopic: null,
        reveal: null,
        infiniteItems: null,
        addedItems: [],
      },
    })
    expect(
      mock.callsFor("topic_items").filter((c) => c.method === "insert")
    ).toHaveLength(0)
  })

  it("skips addedItems insert when addedItems is undefined", async () => {
    queueCanonicalPoll()
    await createEvent({
      ...BASE_INPUT,
      poll: {
        topicId: "topic-1",
        customTopic: null,
        reveal: null,
        infiniteItems: null,
      },
    })
    expect(
      mock.callsFor("topic_items").filter((c) => c.method === "insert")
    ).toHaveLength(0)
  })
})
