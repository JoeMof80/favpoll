// The figures every poll surface puts on its bars: the poll page, the live
// display and the card results all read these, and the module's own comment
// says the bars must sum to the favpoll's raised figure. Untested until
// #1102.
import { describe, it, expect, vi } from "vitest"

type Row = {
  favourite_id: string
  amount: number | null
  pledges: { favpoll_poll_id: string } | null
}

/** A Supabase stand-in that records the query and returns fixed rows. */
function clientReturning(rows: Row[]) {
  const query: Record<string, unknown> = {}
  const builder = {
    select: (cols: string) => ((query.select = cols), builder),
    in: (col: string, vals: string[]) => ((query.in = [col, vals]), builder),
    is: (col: string, val: unknown) => ((query.is = [col, val]), builder),
    range: (from: number, to: number) => {
      query.ranges = [...((query.ranges as number[][]) ?? []), [from, to]]
      // One page, then empty, so fetchAllRows stops.
      return Promise.resolve({
        data: from === 0 ? rows : [],
        error: null,
      })
    },
  }
  const supabase = {
    from: (table: string) => ((query.table = table), builder),
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { supabase: supabase as any, query }
}

const alloc = (favourite: string, amount: number | null, poll = "poll-1") => ({
  favourite_id: favourite,
  amount,
  pledges: { favpoll_poll_id: poll },
})

import {
  pollStandings,
  pollSetStandings,
  overlayStandings,
} from "@/lib/poll-standings"

describe("pollStandings — the figures on the bars", () => {
  it("sums each favourite's allocations and counts the pledges behind them", async () => {
    const { supabase } = clientReturning([
      alloc("blue", 10),
      alloc("blue", 5),
      alloc("red", 20),
    ])
    const standings = await pollStandings(supabase, "poll-1")
    expect(standings.totals.get("blue")).toBe(15)
    expect(standings.counts.get("blue")).toBe(2)
    expect(standings.totals.get("red")).toBe(20)
    expect(standings.counts.get("red")).toBe(1)
  })

  it("counts an allocation with no amount, and treats it as nothing", async () => {
    const { supabase } = clientReturning([
      alloc("blue", null),
      alloc("blue", 5),
    ])
    const standings = await pollStandings(supabase, "poll-1")
    expect(standings.totals.get("blue")).toBe(5)
    expect(standings.counts.get("blue")).toBe(2)
  })

  it("asks for this poll's rows only, and excludes withdrawn pledges", async () => {
    const { supabase, query } = clientReturning([])
    await pollStandings(supabase, "poll-1")
    expect(query.table).toBe("pledge_allocations")
    expect(query.in).toEqual(["pledges.favpoll_poll_id", ["poll-1"]])
    // A withdrawn pledge keeps its allocations; the filter is what stops
    // them reaching the bars.
    expect(query.is).toEqual(["pledges.withdrawn_at", null])
  })

  it("pages, so a popular poll is not silently truncated at the row cap", async () => {
    // PostgREST caps a response at 1,000 rows and says nothing about it, so
    // a full page has to be followed by another request or the bars
    // under-report. Page one is full; page two holds the tail.
    const full = Array.from({ length: 1000 }, () => alloc("blue", 1))
    const ranges: number[][] = []
    const builder = {
      select: () => builder,
      in: () => builder,
      is: () => builder,
      range: (from: number, to: number) => {
        ranges.push([from, to])
        return Promise.resolve({
          data: from === 0 ? full : [alloc("blue", 7)],
          error: null,
        })
      },
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const standings = await pollStandings(
      { from: () => builder } as any,
      "poll-1"
    )
    expect(ranges.length).toBeGreaterThan(1)
    expect(ranges[0]).toEqual([0, 999])
    // 1,000 x £1 from the first page, plus the £7 only the second page knew.
    expect(standings.totals.get("blue")).toBe(1007)
    expect(standings.counts.get("blue")).toBe(1001)
  })

  it("returns empty standings for a poll with no pledges", async () => {
    const { supabase } = clientReturning([])
    const standings = await pollStandings(supabase, "poll-empty")
    expect(standings.totals.size).toBe(0)
    expect(standings.counts.size).toBe(0)
  })
})

describe("pollSetStandings — many polls at once", () => {
  it("keeps each poll's figures apart", async () => {
    const { supabase } = clientReturning([
      alloc("blue", 10, "poll-1"),
      alloc("blue", 99, "poll-2"),
    ])
    const byPoll = await pollSetStandings(supabase, ["poll-1", "poll-2"])
    expect(byPoll.get("poll-1")?.totals.get("blue")).toBe(10)
    expect(byPoll.get("poll-2")?.totals.get("blue")).toBe(99)
  })

  it("drops a row whose poll cannot be read rather than miscrediting it", async () => {
    const { supabase } = clientReturning([
      { favourite_id: "blue", amount: 10, pledges: null },
    ])
    const byPoll = await pollSetStandings(supabase, ["poll-1"])
    expect(byPoll.size).toBe(0)
  })

  it("chunks the id list so the query string cannot explode", async () => {
    const ids = Array.from({ length: 250 }, (_, i) => `poll-${i}`)
    const chunks: string[][] = []
    const builder = {
      select: () => builder,
      in: (_col: string, vals: string[]) => (chunks.push(vals), builder),
      is: () => builder,
      range: () => Promise.resolve({ data: [], error: null }),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await pollSetStandings({ from: () => builder } as any, ids)
    expect(chunks.map((c) => c.length)).toEqual([100, 100, 50])
  })
})

describe("overlayStandings — this poll's numbers, under the all-time names", () => {
  const items = [
    { id: "blue", all_time_pledged: 9999, all_time_count: 42 },
    { id: "red", all_time_pledged: 1, all_time_count: 1 },
  ]

  it("replaces the all-time figures with this poll's", async () => {
    const { supabase } = clientReturning([alloc("blue", 15)])
    const standings = await pollStandings(supabase, "poll-1")
    const [blue] = overlayStandings(items, standings)
    expect(blue.all_time_pledged).toBe(15)
    expect(blue.all_time_count).toBe(1)
  })

  it("zeroes a favourite nobody picked, rather than leaving its all-time figure", async () => {
    const { supabase } = clientReturning([alloc("blue", 15)])
    const standings = await pollStandings(supabase, "poll-1")
    const red = overlayStandings(items, standings)[1]
    expect(red.all_time_pledged).toBe(0)
    expect(red.all_time_count).toBe(0)
  })

  it("does not mutate the items it was given", async () => {
    const { supabase } = clientReturning([alloc("blue", 15)])
    const standings = await pollStandings(supabase, "poll-1")
    overlayStandings(items, standings)
    expect(items[0].all_time_pledged).toBe(9999)
  })
})
