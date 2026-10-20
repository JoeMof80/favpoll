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
import {
  createFavpoll,
  findOrCreateRegisterCharity,
  uploadPersonPhoto,
} from "../actions"

// The ids are uuid columns, so the fixtures are uuids (#1109) — a format
// the schema now checks, because `charityIds` is inserted straight into
// favpoll_charities and the poll's ids into the poll's rows.
const TOPIC_ID = "11111111-1111-1111-1111-111111111111"
const CHARITY_ID = "22222222-2222-2222-2222-222222222222"

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
  charityIds: [CHARITY_ID],
  closesAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  isPrivate: false,
  allowGuestItems: true,
  isListed: true,
  potAmount: null,
}

function queueCanonicalPoll() {
  mock.queue({ id: "user-1" }) // users upsert
  mock.queue({ id: "protagonist-1" }) // protagonists insert
  mock.queue({ id: "favpoll-1" }) // favpolls insert
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
        topicId: TOPIC_ID,
        customTopic: null,
        note: null,
        infiniteItems: null,
      },
    })

    expect(result).toEqual({ favpollId: "favpoll-1" })
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
          topicId: TOPIC_ID,
          customTopic: null,
          note: null,
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
    mock.queue({ id: "favpoll-1" }) // favpolls insert
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
        note: null,
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
    mock.queue({ id: "favpoll-1" }) // favpolls insert
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
        note: null,
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

  it("wires the new topic and items to the favpoll poll and poll_items", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    mock.queue({ id: "protagonist-1" }) // protagonists insert
    mock.queue({ id: "favpoll-1" }) // favpolls insert
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
        note: null,
        infiniteItems: null,
      },
    })

    const pollInsert = mock
      .callsFor("favpoll_polls")
      .find((c) => c.method === "insert")!
    expect(pollInsert.args[0]).toMatchObject({
      favpoll_id: "favpoll-1",
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
    mock.queue({ id: "favpoll-1" }) // favpolls insert
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
        note: null,
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
    mock.queue({ id: "favpoll-1" }) // favpolls insert
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
        topicId: TOPIC_ID,
        customTopic: null,
        note: null,
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
        topicId: TOPIC_ID,
        customTopic: null,
        note: null,
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
        topicId: TOPIC_ID,
        customTopic: null,
        note: null,
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
        topicId: TOPIC_ID,
        customTopic: null,
        note: null,
        infiniteItems: null,
      },
    })
    expect(
      mock.callsFor("favourites").filter((c) => c.method === "insert")
    ).toHaveLength(0)
  })
})

describe("createFavpoll — cause favpoll (subject='cause')", () => {
  it("skips protagonists insert and stores cause_label on the favpoll", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    // No protagonists insert
    mock.queue({ id: "favpoll-1" }) // favpolls insert
    mock.queue(null) // favpoll_charities insert
    mock.queue({ id: "poll-1" }) // favpoll_polls insert
    mock.queue(null) // favpoll_poll_favourites insert
    mock.queue(null) // favpoll_pots insert

    const result = await createFavpoll({
      ...BASE_INPUT,
      protagonistName: "",
      subject: "cause",
      causeLabel: "Ocean conservation across the UK coastline",
      charityIds: [CHARITY_ID],
      poll: {
        topicId: TOPIC_ID,
        customTopic: null,
        note: null,
        infiniteItems: null,
      },
    })

    expect(result).toEqual({ favpollId: "favpoll-1" })

    expect(
      mock.callsFor("protagonists").filter((c) => c.method === "insert")
    ).toHaveLength(0)

    const favpollInsert = mock
      .callsFor("favpolls")
      .find((c) => c.method === "insert")!
    expect(favpollInsert.args[0]).toMatchObject({
      protagonist_id: null,
      subject: "cause",
      cause_label: "Ocean conservation across the UK coastline",
    })
  })

  it("stores cause photo_url and context on the favpoll row", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    // No protagonists insert
    mock.queue({ id: "favpoll-1" }) // favpolls insert
    mock.queue(null) // favpoll_charities insert
    mock.queue({ id: "poll-1" }) // favpoll_polls insert
    mock.queue(null) // favpoll_poll_favourites insert
    mock.queue(null) // favpoll_pots insert

    await createFavpoll({
      ...BASE_INPUT,
      protagonistName: "",
      subject: "cause",
      causeLabel: "Help the Homeless",
      photoUrl: "https://example.com/cause.jpg",
      dateLabel: "Winter 2026 appeal",
      charityIds: [CHARITY_ID],
      poll: {
        topicId: TOPIC_ID,
        customTopic: null,
        note: null,
        infiniteItems: null,
      },
    })

    const favpollInsert = mock
      .callsFor("favpolls")
      .find((c) => c.method === "insert")!
    expect(favpollInsert.args[0]).toMatchObject({
      photo_url: "https://example.com/cause.jpg",
      context: "Winter 2026 appeal",
    })
  })

  it("persists cause note as personal_note on the favpoll poll", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    mock.queue({ id: "favpoll-1" }) // favpolls insert
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
      charityIds: [CHARITY_ID],
      poll: {
        topicId: TOPIC_ID,
        customTopic: null,
        note: "Their ocean conservation work reflects the breadth of colour in the sea.",
        infiniteItems: null,
      },
    })

    const pollInsert = mock
      .callsFor("favpoll_polls")
      .find((c) => c.method === "insert")!
    expect(pollInsert.args[0]).toMatchObject({
      personal_note:
        "Their ocean conservation work reflects the breadth of colour in the sea.",
    })
  })
})

describe("createFavpoll — fundraiser for a person (subject='someone')", () => {
  it("creates protagonist row and stores subject='someone'", async () => {
    mock.queue({ id: "user-1" }) // users upsert
    mock.queue({ id: "protagonist-1" }) // protagonists insert
    mock.queue({ id: "favpoll-1" }) // favpolls insert
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
        topicId: TOPIC_ID,
        customTopic: null,
        note: null,
        infiniteItems: null,
      },
    })

    expect(
      mock.callsFor("protagonists").filter((c) => c.method === "insert")
    ).toHaveLength(1)

    const favpollInsert = mock
      .callsFor("favpolls")
      .find((c) => c.method === "insert")!
    expect(favpollInsert.args[0]).toMatchObject({
      subject: "someone",
      cause_label: null,
    })
    expect(favpollInsert.args[0].protagonist_id).toBe("protagonist-1")
  })
})

// ---------------------------------------------------------------------------
// The schema at the boundary (#1109)
// ---------------------------------------------------------------------------

/** The admin client's storage half, which the shared mock does not cover.
 *  Only the photo tests need it, and only the ones that get past the
 *  schema — a refusal happens before the client is even built. */
function stubStorage() {
  const uploads: { path: string; contentType?: string }[] = []
  ;(mock.supabase as unknown as Record<string, unknown>).storage = {
    createBucket: () => Promise.resolve({ error: null }),
    from: () => ({
      upload: (
        path: string,
        _bytes: ArrayBuffer,
        opts: { contentType?: string }
      ) => {
        uploads.push({ path, contentType: opts?.contentType })
        return Promise.resolve({ error: null })
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://cdn.example/${path}` },
      }),
    }),
  }
  return uploads
}

const photoForm = (file: unknown) => {
  const fd = new FormData()
  // A crafted request can put anything in a field, which is the point.
  fd.append("photo", file as Blob)
  return fd
}

const jpeg = (name = "photo.jpg") =>
  new File([new Uint8Array([1, 2, 3])], name, { type: "image/jpeg" })

describe("uploadPersonPhoto checks the file instead of casting it", () => {
  it("uploads an image and returns its public URL", async () => {
    const uploads = stubStorage()

    const url = await uploadPersonPhoto(photoForm(jpeg()))

    expect(uploads).toHaveLength(1)
    expect(uploads[0].contentType).toBe("image/jpeg")
    expect(url).toContain("https://cdn.example/user-1/")
    expect(url.endsWith(".jpg")).toBe(true)
  })

  // THE KEY USED TO BE PART THE UPLOADER'S. `file.name.split(".").pop()`
  // became the extension, so this filename produced the object key
  // "user-1/<ts>./etc/passwd". The type decides it now.
  it("takes the extension from the type, not from the filename", async () => {
    const uploads = stubStorage()

    await uploadPersonPhoto(
      photoForm(
        new File([new Uint8Array([1])], "../../../etc/passwd", {
          type: "image/png",
        })
      )
    )

    expect(uploads[0].path).toMatch(/^user-1\/\d+\.png$/)
    expect(uploads[0].path).not.toContain("etc")
    expect(uploads[0].path).not.toContain("..")
  })

  it("refuses a field that is not a file at all", async () => {
    await expect(uploadPersonPhoto(photoForm("just a string"))).rejects.toThrow(
      "No photo was attached."
    )
  })

  it("refuses a missing field", async () => {
    await expect(uploadPersonPhoto(new FormData())).rejects.toThrow(
      "No photo was attached."
    )
  })

  it("refuses an empty file", async () => {
    await expect(
      uploadPersonPhoto(
        photoForm(new File([], "photo.jpg", { type: "image/jpeg" }))
      )
    ).rejects.toThrow("That photo was empty.")
  })

  // THE BUCKET IS PUBLIC. An unchecked type would serve this back as a
  // page from the project's own storage domain.
  it("refuses a file that is not an image", async () => {
    await expect(
      uploadPersonPhoto(
        photoForm(
          new File(["<script>alert(1)</script>"], "photo.jpg", {
            type: "text/html",
          })
        )
      )
    ).rejects.toThrow("That file isn't an image we can use.")
  })

  it("refuses a file too large to be a photo", async () => {
    const big = new File([new Uint8Array(16 * 1024 * 1024)], "photo.jpg", {
      type: "image/jpeg",
    })

    await expect(uploadPersonPhoto(photoForm(big))).rejects.toThrow(
      "That photo is too large."
    )
  })
})

describe("createFavpoll refuses a malformed argument", () => {
  function expectNothingWritten() {
    expect(mock.from).not.toHaveBeenCalled()
  }

  it("refuses a charity id that is not a uuid", async () => {
    await expect(
      createFavpoll({
        ...BASE_INPUT,
        charityIds: ["charity-1"],
        poll: {
          topicId: TOPIC_ID,
          customTopic: null,
          note: null,
          infiniteItems: null,
        },
      })
    ).rejects.toThrow("That favpoll, topic or charity wasn't recognised.")
    expectNothingWritten()
  })

  // Was a RangeError from `new Date(...).toISOString()`, which reached the
  // organiser as a generic failure at the very end of the wizard.
  it("refuses a closing date it cannot read, with a sentence", async () => {
    await expect(
      createFavpoll({
        ...BASE_INPUT,
        closesAt: "next Tuesday",
        poll: {
          topicId: TOPIC_ID,
          customTopic: null,
          note: null,
          infiniteItems: null,
        },
      })
    ).rejects.toThrow("That closing date didn't make sense.")
    expectNothingWritten()
  })

  // `is_plural` is derived as `grouping !== "individual"`, so an unknown
  // grouping used to make a favpoll quietly plural.
  it("refuses a grouping it does not know", async () => {
    await expect(
      createFavpoll({
        ...BASE_INPUT,
        grouping: "crowd",
        poll: {
          topicId: TOPIC_ID,
          customTopic: null,
          note: null,
          infiniteItems: null,
        },
      } as unknown as Parameters<typeof createFavpoll>[0])
    ).rejects.toThrow("That isn't a grouping we know.")
    expectNothingWritten()
  })

  it("refuses more charities than a favpoll can name", async () => {
    await expect(
      createFavpoll({
        ...BASE_INPUT,
        charityIds: [
          "11111111-1111-1111-1111-111111111111",
          "22222222-2222-2222-2222-222222222222",
          "33333333-3333-3333-3333-333333333333",
          "44444444-4444-4444-4444-444444444444",
        ],
        poll: {
          topicId: TOPIC_ID,
          customTopic: null,
          note: null,
          infiniteItems: null,
        },
      })
    ).rejects.toThrow("A favpoll can name at most three charities.")
    expectNothingWritten()
  })

  // potAmount writes favpoll_pots.total_deposited directly. Both real
  // callers send null; a negative would have corrupted the pot.
  it("refuses a negative pot amount", async () => {
    await expect(
      createFavpoll({
        ...BASE_INPUT,
        potAmount: -500,
        poll: {
          topicId: TOPIC_ID,
          customTopic: null,
          note: null,
          infiniteItems: null,
        },
      })
    ).rejects.toThrow("That amount isn't a number we can take.")
    expectNothingWritten()
  })

  it("drops a field it does not understand instead of honouring it", async () => {
    queueCanonicalPoll()

    await createFavpoll({
      ...BASE_INPUT,
      poll: {
        topicId: TOPIC_ID,
        customTopic: null,
        note: null,
        infiniteItems: null,
      },
      created_by: "somebody-else",
    } as unknown as Parameters<typeof createFavpoll>[0])

    const favpollInsert = mock
      .callsFor("favpolls")
      .find((c) => c.method === "insert")
    expect(favpollInsert?.args[0]).toMatchObject({ created_by: "user-1" })
  })
})

describe("findOrCreateRegisterCharity checks its two fields", () => {
  it("refuses a charity name longer than we can store", async () => {
    await expect(
      findOrCreateRegisterCharity({
        registeredNumber: "1234567",
        displayName: "N".repeat(201),
      })
    ).rejects.toThrow("That charity name is too long.")
    expect(mock.from).not.toHaveBeenCalled()
  })
})
