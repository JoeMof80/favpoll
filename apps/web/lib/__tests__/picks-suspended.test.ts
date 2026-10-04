import { describe, it, expect } from "vitest"
import { picksSuspended, picksEverSuspended } from "@/lib/picks-suspended"

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

// THE REVEAL IS OUT, ONE WAY (founder, 2026-10-04). A column of its own,
// so it survives the resume that clears picks_suspended_at.
describe("picksEverSuspended", () => {
  it("is false while the picks have never been suspended", () => {
    expect(picksEverSuspended({})).toBe(false)
    expect(picksEverSuspended({ picks_first_suspended_at: null })).toBe(false)
  })

  it("is true from the first suspension", () => {
    expect(
      picksEverSuspended({
        picks_suspended_at: "2026-10-03T12:00:00Z",
        picks_first_suspended_at: "2026-10-03T12:00:00Z",
      })
    ).toBe(true)
  })

  it("stays true after the picks resume — the guests have seen it", () => {
    expect(
      picksEverSuspended({
        picks_suspended_at: null,
        picks_first_suspended_at: "2026-10-03T12:00:00Z",
      })
    ).toBe(true)
  })
})
