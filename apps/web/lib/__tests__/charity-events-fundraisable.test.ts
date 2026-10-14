import { describe, it, expect } from "vitest"
import { couldFundraiseAt } from "@/lib/charity-events"

// Every string below is a real event the reader stored on production
// (2026-10-15), which is the point: the filter has to earn its keep on the
// 82 events we actually have, not on invented ones.
describe("couldFundraiseAt", () => {
  it("drops what a supporter cannot raise money at", () => {
    // Diabetes UK's regional calendar — the case that prompted this. Eight
    // of these filled the list and crowded out the real question.
    expect(
      couldFundraiseAt({
        name: "Coventry group",
        kind: "support group meeting",
      })
    ).toBe(false)
    expect(
      couldFundraiseAt({
        name: "Walk and talk",
        kind: "support group walk and talk",
      })
    ).toBe(false)
    // Professional and sector events, not fundraising ones.
    expect(
      couldFundraiseAt({
        name: "Hospice UK National Conference",
        kind: "conference",
      })
    ).toBe(false)
    expect(
      couldFundraiseAt({
        name: "MSF Scientific Days",
        kind: "conference or educational event",
      })
    ).toBe(false)
    expect(
      couldFundraiseAt({
        name: "Global Health and Humanitarian Medicine course",
        kind: "educational course",
      })
    ).toBe(false)
  })

  it("keeps a real fundraising event even when it maps to no topic", () => {
    // 59 of production's 82 look like these. A half marathon has no
    // favourite to pick, so topic: null is the honest answer — it is NOT a
    // reason to throw the event away.
    expect(
      couldFundraiseAt({
        name: "Cardiff Half Marathon",
        kind: "running event",
      })
    ).toBe(true)
    expect(
      couldFundraiseAt({
        name: "Chiltern 50 Challenge",
        kind: "hiking challenge",
      })
    ).toBe(true)
    expect(
      couldFundraiseAt({ name: "Tuesday Treat Draw", kind: "raffle" })
    ).toBe(true)
    expect(
      couldFundraiseAt({
        name: "Trussell's carol concert 2026",
        kind: "concert",
      })
    ).toBe(true)
    expect(
      couldFundraiseAt({
        name: "The innocent Big Knit",
        kind: "knitting fundraiser",
      })
    ).toBe(true)
    expect(
      couldFundraiseAt({
        name: "Crisis at Christmas",
        kind: "seasonal fundraising event",
      })
    ).toBe(true)
  })

  it("keeps the ones that do map to a topic", () => {
    expect(
      couldFundraiseAt({
        name: "Macmillan Coffee Morning",
        kind: "coffee morning",
      })
    ).toBe(true)
    expect(
      couldFundraiseAt({
        name: "Hospice open gardens",
        kind: "garden open day",
      })
    ).toBe(true)
    expect(
      couldFundraiseAt({
        name: "100km Dog Walking Challenge",
        kind: "dog walking challenge",
      })
    ).toBe(true)
  })

  // THE CASE THE MEASUREMENT CAUGHT, and the reason the rule is ordered the
  // way it is. The first version was a denylist alone, and the production dry
  // run showed it dropping Scope's "Tough Mudder 2026 — sponsored obstacle
  // COURSE", one of the largest charity challenge events in the country,
  // because "course" is also what a training course is. An explicit
  // fundraising signal now wins: the words meaning "money is raised here" are
  // few and unambiguous, where the words meaning "this is a service" collide
  // with ordinary English.
  it("lets a fundraising signal beat a denylist word", () => {
    expect(
      couldFundraiseAt({
        name: "Tough Mudder 2026",
        kind: "sponsored obstacle course",
      })
    ).toBe(true)
    expect(
      couldFundraiseAt({ name: "Wreath workshop", kind: "craft fundraiser" })
    ).toBe(true)
  })

  it("still drops a service whose words look innocent", () => {
    // No fundraising signal, so the denylist decides. A charity running a
    // free confidence workshop is providing a service, not holding something
    // a supporter raises money at.
    expect(
      couldFundraiseAt({
        name: "Christmas wreath workshop",
        kind: "craft workshop",
      })
    ).toBe(false)
  })
})
