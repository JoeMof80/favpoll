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
import { createFavpoll } from "../actions"

const BASE_INPUT = {
  protagonistName: "Joan",
  protagonistAbout: null,
  photoUrl: null,
  dateLabel: null,
  category: "celebration" as const,
  grouping: "individual" as const,
  subject: "someone" as const,
  causeLabel: null,
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
  mock.queue({ id: "event-1" }) // favpolls insert
  mock.queue(null) // favpoll_charities insert
  mock.queue({ id: "poll-1" }) // favpoll_polls insert
  mock.queue(null) // favpoll_poll_favourites insert
  mock.queue(null) // favpoll_pots insert
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
})

describe("createFavpoll — canonical topic", () => {
  it("returns favpollId and inserts in correct order", async () => {
    queueCanonicalPoll()

    const result = await createFavpoll({
      ...BASE_INPUT,
      poll: {
        topicId: "topic-1",
        customTopic: null,
        reveal: null,
        infiniteItems: null,
      },
    })

    expect(result).toEqual({ favpollId: "event-1" })
    expect(
      mock.callsFor("favpolls").find((c) => c.method === "insert")
    ).toBeTruthy()
    expect(
      mock.callsFor("favpoll_polls").find((c) => c.method === "insert")
    ).toBeTruthy()
  })

  it("throws when userId is null", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })
    await expect(
      createFavpoll({
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

describe("createFavpoll — custom topic", () => {
  it("inserts topic with placeholders:{} and is_active:true, is_finite:false", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    mock.queue({ id: "protagonist-1" }) // protagonists insert
    mock.queue({ id: "event-1" }) // favpolls insert
    mock.queue(null) // favpoll_charities insert
    mock.queue({ id: "new-topic-1" }) // topics insert
    mock.queue([{ id: "item-1" }, { id: "item-2" }]) // favourites insert
    mock.queue({ id: "poll-1" }) // favpoll_polls insert
    mock.queue(null) // favpoll_poll_favourites insert
    mock.queue(null) // favpoll_pots insert

    await createFavpoll({
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

  it("inserts favourites with source:organiser, is_canonical:false, review_status:pending_review", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    mock.queue({ id: "protagonist-1" }) // protagonists insert
    mock.queue({ id: "event-1" }) // favpolls insert
    mock.queue(null) // favpoll_charities insert
    mock.queue({ id: "new-topic-1" }) // topics insert
    mock.queue([{ id: "item-1" }, { id: "item-2" }]) // favourites insert
    mock.queue({ id: "poll-1" }) // favpoll_polls insert
    mock.queue(null) // favpoll_poll_favourites insert
    mock.queue(null) // favpoll_pots insert

    await createFavpoll({
      ...BASE_INPUT,
      poll: {
        topicId: null,
        customTopic: { title: "My Sport", items: ["Football", "Tennis"] },
        reveal: null,
        infiniteItems: null,
      },
    })

    const itemsInsert = mock
      .callsFor("favourites")
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
    mock.queue({ id: "event-1" }) // favpolls insert
    mock.queue(null) // favpoll_charities insert
    mock.queue({ id: "new-topic-99" }) // topics insert
    mock.queue([{ id: "item-a" }, { id: "item-b" }]) // favourites insert
    mock.queue({ id: "poll-99" }) // favpoll_polls insert
    mock.queue(null) // favpoll_poll_favourites insert
    mock.queue(null) // favpoll_pots insert

    await createFavpoll({
      ...BASE_INPUT,
      poll: {
        topicId: null,
        customTopic: { title: "Colours", items: ["Red", "Blue"] },
        reveal: null,
        infiniteItems: null,
      },
    })

    const pollInsert = mock
      .callsFor("favpoll_polls")
      .find((c) => c.method === "insert")!
    expect(pollInsert.args[0]).toMatchObject({
      favpoll_id: "event-1",
      topic_id: "new-topic-99",
    })

    const pollItemsInsert = mock
      .callsFor("favpoll_poll_favourites")
      .find((c) => c.method === "insert")!
    expect(pollItemsInsert.args[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          favpoll_poll_id: "poll-99",
          favourite_id: "item-a",
        }),
        expect.objectContaining({
          favpoll_poll_id: "poll-99",
          favourite_id: "item-b",
        }),
      ])
    )
  })

  it("skips favourites insert when no items are provided", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    mock.queue({ id: "protagonist-1" }) // protagonists insert
    mock.queue({ id: "event-1" }) // favpolls insert
    mock.queue(null) // favpoll_charities insert
    mock.queue({ id: "new-topic-1" }) // topics insert
    // No favourites insert
    mock.queue({ id: "poll-1" }) // favpoll_polls insert
    // No favpoll_poll_favourites insert
    mock.queue(null) // favpoll_pots insert

    await createFavpoll({
      ...BASE_INPUT,
      poll: {
        topicId: null,
        customTopic: { title: "Empty Topic", items: [] },
        reveal: null,
        infiniteItems: null,
      },
    })

    expect(
      mock.callsFor("favourites").filter((c) => c.method === "insert")
    ).toHaveLength(0)
  })
})

describe("createFavpoll — canonical topic with organiser additions (addedItems)", () => {
  function queueWithAdditions() {
    mock.queue({ id: "user-1" }) // users upsert
    mock.queue({ id: "protagonist-1" }) // protagonists insert
    mock.queue({ id: "event-1" }) // favpolls insert
    mock.queue(null) // favpoll_charities insert
    mock.queue({ id: "poll-1" }) // favpoll_polls insert
    // canonical path: no customItemIds favpoll_poll_favourites insert
    mock.queue([{ id: "add-1" }, { id: "add-2" }]) // favourites insert (addedItems)
    mock.queue(null) // favpoll_poll_favourites insert (addedItems)
    mock.queue(null) // favpoll_pots insert
  }

  it("inserts added items with source:organiser, is_canonical:false, review_status:pending_review", async () => {
    queueWithAdditions()
    await createFavpoll({
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
      .callsFor("favourites")
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

  it("links added items to the favpoll poll as favpoll_poll_favourites", async () => {
    queueWithAdditions()
    await createFavpoll({
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
      .callsFor("favpoll_poll_favourites")
      .filter((c) => c.method === "insert")
    // Only one favpoll_poll_favourites insert for canonical + addedItems path
    const additionsInsert = pollItemsInserts[0]
    expect(additionsInsert.args[0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          favpoll_poll_id: "poll-1",
          favourite_id: "add-1",
          is_guest_added: false,
        }),
        expect.objectContaining({
          favpoll_poll_id: "poll-1",
          favourite_id: "add-2",
          is_guest_added: false,
        }),
      ])
    )
  })

  it("skips addedItems insert when addedItems is empty", async () => {
    queueCanonicalPoll()
    await createFavpoll({
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
      mock.callsFor("favourites").filter((c) => c.method === "insert")
    ).toHaveLength(0)
  })

  it("skips addedItems insert when addedItems is undefined", async () => {
    queueCanonicalPoll()
    await createFavpoll({
      ...BASE_INPUT,
      poll: {
        topicId: "topic-1",
        customTopic: null,
        reveal: null,
        infiniteItems: null,
      },
    })
    expect(
      mock.callsFor("favourites").filter((c) => c.method === "insert")
    ).toHaveLength(0)
  })
})

describe("createFavpoll — cause event (subject='cause')", () => {
  it("skips protagonists insert and stores cause_label on the event", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    // No protagonists insert
    mock.queue({ id: "event-1" }) // favpolls insert
    mock.queue(null) // favpoll_charities insert
    mock.queue({ id: "poll-1" }) // favpoll_polls insert
    mock.queue(null) // favpoll_poll_favourites insert
    mock.queue(null) // favpoll_pots insert

    const result = await createFavpoll({
      ...BASE_INPUT,
      protagonistName: "",
      subject: "cause",
      causeLabel: "Ocean conservation across the UK coastline",
      charityIds: ["charity-1"],
      poll: {
        topicId: "topic-1",
        customTopic: null,
        reveal: null,
        infiniteItems: null,
      },
    })

    expect(result).toEqual({ favpollId: "event-1" })

    expect(
      mock.callsFor("protagonists").filter((c) => c.method === "insert")
    ).toHaveLength(0)

    const eventInsert = mock
      .callsFor("favpolls")
      .find((c) => c.method === "insert")!
    expect(eventInsert.args[0]).toMatchObject({
      protagonist_id: null,
      subject: "cause",
      cause_label: "Ocean conservation across the UK coastline",
    })
  })

  it("persists cause reveal as personal_reveal on the event poll", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    mock.queue({ id: "event-1" }) // favpolls insert
    mock.queue(null) // favpoll_charities insert
    mock.queue({ id: "poll-1" }) // favpoll_polls insert
    mock.queue(null) // favpoll_poll_favourites insert
    mock.queue(null) // favpoll_pots insert

    await createFavpoll({
      ...BASE_INPUT,
      protagonistName: "",
      subject: "cause",
      causeLabel: "Protecting our seas",
      description: "Together we can make a difference for ocean life.",
      charityIds: ["charity-1"],
      poll: {
        topicId: "topic-1",
        customTopic: null,
        reveal:
          "Their ocean conservation work reflects the breadth of colour in the sea.",
        infiniteItems: null,
      },
    })

    const pollInsert = mock
      .callsFor("favpoll_polls")
      .find((c) => c.method === "insert")!
    expect(pollInsert.args[0]).toMatchObject({
      personal_reveal:
        "Their ocean conservation work reflects the breadth of colour in the sea.",
    })
  })
})

describe("createFavpoll — fundraiser for a person (subject='someone')", () => {
  it("creates protagonist row and stores subject='someone'", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    mock.queue({ id: "protagonist-1" }) // protagonists insert
    mock.queue({ id: "event-1" }) // favpolls insert
    mock.queue(null) // favpoll_charities insert
    mock.queue({ id: "poll-1" }) // favpoll_polls insert
    mock.queue(null) // favpoll_poll_favourites insert
    mock.queue(null) // favpoll_pots insert

    await createFavpoll({
      ...BASE_INPUT,
      protagonistName: "Joan",
      subject: "someone",
      causeLabel: null,
      category: "fundraiser",
      poll: {
        topicId: "topic-1",
        customTopic: null,
        reveal: null,
        infiniteItems: null,
      },
    })

    expect(
      mock.callsFor("protagonists").filter((c) => c.method === "insert")
    ).toHaveLength(1)

    const eventInsert = mock
      .callsFor("favpolls")
      .find((c) => c.method === "insert")!
    expect(eventInsert.args[0]).toMatchObject({
      subject: "someone",
      cause_label: null,
    })
    expect(eventInsert.args[0].protagonist_id).toBe("protagonist-1")
  })
})
