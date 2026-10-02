import { describe, it, expect } from "vitest"
import { picksSuspended } from "@/lib/picks-suspended"

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
