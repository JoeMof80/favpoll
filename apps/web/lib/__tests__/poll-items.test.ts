// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"
import { fetchPollItems } from "@/lib/poll-items"

let mock = makeSupabaseMock()

beforeEach(() => {
  mock = makeSupabaseMock()
})

const INPUT = { pollId: "poll-1", topicId: "topic-1", isFinite: false }

describe("fetchPollItems", () => {
  it("finite topic → the topic's closed set from favourites", async () => {
    mock.queue([{ id: "f1", label: "Red" }])

    const items = await fetchPollItems(mock.supabase as never, {
      ...INPUT,
      isFinite: true,
    })

    expect(items).toEqual([{ id: "f1", label: "Red" }])
    expect(mock.callsFor("favourites").some((c) => c.method === "select")).toBe(
      true
    )
    expect(mock.callsFor("favpoll_poll_favourites")).toHaveLength(0)
  })

  it("infinite topic → the poll's curated epf rows, hidden excluded", async () => {
    mock.queue([
      { is_hidden: false, favourites: { id: "f1", label: "Keats" } },
      { is_hidden: false, favourites: { id: "f2", label: "Heaney" } },
    ])

    const items = await fetchPollItems(mock.supabase as never, INPUT)

    expect(items.map((i) => i.label)).toEqual(["Keats", "Heaney"])
    // the hidden filter was applied
    const eqCalls = mock
      .callsFor("favpoll_poll_favourites")
      .filter((c) => c.method === "eq")
      .map((c) => c.args)
    expect(eqCalls).toContainEqual(["is_hidden", false])
    // and the whole canon was NOT queried
    expect(mock.callsFor("favourites")).toHaveLength(0)
  })

  it("includeHidden skips the hidden filter (organiser surfaces)", async () => {
    mock.queue([{ is_hidden: true, favourites: { id: "f3", label: "Larkin" } }])

    const items = await fetchPollItems(mock.supabase as never, {
      ...INPUT,
      includeHidden: true,
    })

    expect(items.map((i) => i.label)).toEqual(["Larkin"])
    const eqCalls = mock
      .callsFor("favpoll_poll_favourites")
      .filter((c) => c.method === "eq")
      .map((c) => c.args)
    expect(eqCalls).not.toContainEqual(["is_hidden", false])
  })

  it("drops epf rows whose favourite failed to join", async () => {
    mock.queue([
      { is_hidden: false, favourites: null },
      { is_hidden: false, favourites: { id: "f1", label: "Keats" } },
    ])

    const items = await fetchPollItems(mock.supabase as never, INPUT)
    expect(items).toHaveLength(1)
  })
})
