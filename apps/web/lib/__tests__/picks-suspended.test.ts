import { describe, it, expect } from "vitest"
import { picksSuspended, picksSuspensionScheduled } from "@/lib/picks-suspended"

const now = new Date("2026-10-02T12:00:00Z")

describe("picksSuspended", () => {
  it("is false when nothing is set", () => {
    expect(picksSuspended({}, now)).toBe(false)
    expect(picksSuspended({ picks_suspended_at: null }, now)).toBe(false)
  })

  it("is true at or after the set moment", () => {
    expect(
      picksSuspended({ picks_suspended_at: "2026-10-02T12:00:00Z" }, now)
    ).toBe(true)
    expect(
      picksSuspended({ picks_suspended_at: "2026-10-01T12:00:00Z" }, now)
    ).toBe(true)
  })

  it("is false while the moment is still ahead — that is a schedule", () => {
    const f = { picks_suspended_at: "2026-10-03T12:00:00Z" }
    expect(picksSuspended(f, now)).toBe(false)
    expect(picksSuspensionScheduled(f, now)).toBe(true)
  })

  it("a past moment is not a schedule", () => {
    expect(
      picksSuspensionScheduled(
        { picks_suspended_at: "2026-10-01T12:00:00Z" },
        now
      )
    ).toBe(false)
    expect(picksSuspensionScheduled({}, now)).toBe(false)
  })

  it("ignores an unparseable value", () => {
    expect(picksSuspended({ picks_suspended_at: "soon" }, now)).toBe(false)
    expect(picksSuspensionScheduled({ picks_suspended_at: "soon" }, now)).toBe(
      false
    )
  })
})
