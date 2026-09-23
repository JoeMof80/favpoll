import { describe, it, expect } from "vitest"
import { favpollLocks, lockReason } from "@/lib/favpoll-locks"

// The rule protects OTHER PEOPLE'S gifts, not the existence of money
// (founder, 2026-09-23). The case that prompted it: a live favpoll with
// £50 of someone else's money in the pot and zero pledges, which locked
// everything and reported "guests have already pledged".
describe("favpollLocks", () => {
  const none = { pledgeCount: 0, totalAllocated: 0, topUpsByOthers: 0 }

  it("leaves everything open when no money has arrived", () => {
    expect(favpollLocks(none)).toEqual({
      event: false,
      charity: false,
      topic: false,
    })
  })

  it("forgives the organiser's own unspent top-up", () => {
    // topUpsByOthers counts only top-ups NOT paid for by the organiser,
    // so their own money leaves every field editable.
    expect(favpollLocks(none)).toEqual({
      event: false,
      charity: false,
      topic: false,
    })
  })

  it("locks the charity but frees the topic on someone else's top-up", () => {
    expect(favpollLocks({ ...none, topUpsByOthers: 1 })).toEqual({
      event: true,
      charity: true,
      topic: false,
    })
  })

  it("locks the topic once anyone has pledged", () => {
    // Including a give-without-picking pledge: it is still a pledge made
    // in the context of this topic (founder, 2026-09-23).
    expect(favpollLocks({ ...none, pledgeCount: 1 })).toEqual({
      event: true,
      charity: true,
      topic: true,
    })
  })

  it("locks the topic once the pot has been drawn on", () => {
    expect(favpollLocks({ ...none, totalAllocated: 10 })).toEqual({
      event: true,
      charity: true,
      topic: true,
    })
  })
})

describe("lockReason", () => {
  it("does not claim pledges when only the pot holds money", () => {
    const locks = favpollLocks({
      pledgeCount: 0,
      totalAllocated: 0,
      topUpsByOthers: 1,
    })
    expect(lockReason(locks, "charity")).toBe(
      "Locked — there's money in the shared pot."
    )
  })

  it("says pledges when guests really have pledged", () => {
    const locks = favpollLocks({
      pledgeCount: 2,
      totalAllocated: 0,
      topUpsByOthers: 0,
    })
    expect(lockReason(locks, "charity")).toBe(
      "Locked — guests have already pledged."
    )
    expect(lockReason(locks, "topic")).toBe(
      "Locked — guests have already pledged."
    )
  })
})
