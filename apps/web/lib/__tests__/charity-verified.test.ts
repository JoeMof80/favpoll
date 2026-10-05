import { describe, it, expect } from "vitest"
import { charityNameNeedsReview, isCharityVerified } from "@favpoll/types"

const c = (over: Record<string, unknown> = {}) =>
  ({
    verification_status: "name_mismatch",
    verified_name: "WWF - UK",
    name_accepted_at: null,
    name_accepted_name: null,
    ...over,
  }) as Parameters<typeof isCharityVerified>[0]

describe("what the verified tick means", () => {
  it("shows when the register verified the name", () => {
    expect(isCharityVerified(c({ verification_status: "verified" }))).toBe(true)
  })

  it("shows when an admin accepted the difference", () => {
    const accepted = c({
      name_accepted_at: "2026-10-05T12:00:00Z",
      name_accepted_name: "WWF - UK",
    })
    expect(isCharityVerified(accepted)).toBe(true)
    expect(charityNameNeedsReview(accepted)).toBe(false)
  })

  it("does not show for a mismatch nobody has looked at", () => {
    expect(isCharityVerified(c())).toBe(false)
    expect(charityNameNeedsReview(c())).toBe(true)
  })

  // The acceptance was of ONE discrepancy. If the register renames the
  // charity, the acceptance was about something else — and because the
  // nightly cron rewrites verification_status but never touches the
  // acceptance, this comparison is what makes it lapse.
  it("lapses when the register's name changes", () => {
    const stale = c({
      name_accepted_at: "2026-10-05T12:00:00Z",
      name_accepted_name: "WWF - UK",
      verified_name: "WORLD WIDE FUND FOR NATURE UK",
    })
    expect(isCharityVerified(stale)).toBe(false)
    expect(charityNameNeedsReview(stale)).toBe(true)
  })

  // An acceptance is about a NAME. It can never speak for a charity that
  // has left the register, or a number that resolves to nothing.
  it("never shows for removed or not_found, accepted or not", () => {
    for (const status of ["removed", "not_found", "error"] as const) {
      expect(
        isCharityVerified(
          c({
            verification_status: status,
            name_accepted_at: "2026-10-05T12:00:00Z",
            name_accepted_name: "WWF - UK",
          })
        )
      ).toBe(false)
    }
  })
})
