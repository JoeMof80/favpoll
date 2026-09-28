import { describe, it, expect } from "vitest"
import { subsetStanding } from "../subset-record"
import type { Favourite } from "@favpoll/types"

const fav = (id: string, pledged: number, count: number): Favourite => ({
  id,
  topic_id: "animal",
  label: id,
  all_time_pledged: pledged,
  all_time_count: count,
  is_canonical: true,
  source: "seed",
  markets: ["en-GB"],
  favpoll_count: 0,
  total_pledge_count: count,
  created_at: "2026-09-28T00:00:00Z",
})

describe("subsetStanding (favpoll-topic-rules §1, ruling 4 revised)", () => {
  it("adds the subset's own picks to its members' whole-list picks, and only members", () => {
    const parent = [fav("Cow", 10, 2), fav("Goat", 4, 1), fav("Lion", 50, 9)]
    const out = subsetStanding(
      parent,
      ["Cow", "Goat"],
      [
        { favourite_id: "Goat", all_time_pledged: 20, all_time_count: 3 },
        { favourite_id: "Lion", all_time_pledged: 99, all_time_count: 9 },
      ]
    )
    expect(
      out.map((f) => [f.id, f.all_time_pledged, f.all_time_count])
    ).toEqual([
      ["Goat", 24, 4],
      ["Cow", 10, 2],
    ])
  })

  it("a member with no subset picks keeps the parent's figure", () => {
    const out = subsetStanding([fav("Cow", 7, 1)], ["Cow"], [])
    expect(out[0].all_time_pledged).toBe(7)
  })
})
