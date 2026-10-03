import { describe, it, expect } from "vitest"
import { picksSuspended, standingsOpened } from "@/lib/picks-suspended"

describe("picksSuspended", () => {
  it("is false when nothing is set", () => {
    expect(picksSuspended({})).toBe(false)
    expect(picksSuspended({ picks_suspended_at: null })).toBe(false)
  })

  it("is true once the moment is stamped", () => {
    expect(picksSuspended({ picks_suspended_at: "2026-10-02T12:00:00Z" })).toBe(
      true
    )
  })
})

// THE STANDINGS OPEN, ONE WAY (founder, 2026-10-03). A column of its own,
// so the unlock survives the resume that clears picks_suspended_at.
describe("standingsOpened", () => {
  it("is false while the picks have never been suspended", () => {
    expect(standingsOpened({})).toBe(false)
    expect(standingsOpened({ standings_opened_at: null })).toBe(false)
  })

  it("is true once a suspension has opened them", () => {
    expect(
      standingsOpened({
        picks_suspended_at: "2026-10-03T12:00:00Z",
        standings_opened_at: "2026-10-03T12:00:00Z",
      })
    ).toBe(true)
  })

  it("stays true after the picks resume — the guests have seen them", () => {
    expect(
      standingsOpened({
        picks_suspended_at: null,
        standings_opened_at: "2026-10-03T12:00:00Z",
      })
    ).toBe(true)
  })
})
