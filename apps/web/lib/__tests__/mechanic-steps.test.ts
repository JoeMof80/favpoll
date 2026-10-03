import { describe, it, expect } from "vitest"
import { buildMechanicSteps, mechanicFooter } from "../mechanic-steps"

describe("buildMechanicSteps", () => {
  // Step 3 stopped referencing the reveal (founder, 2026-09-01): five
  // variants tried to explain a thing with multiple purposes. One
  // universal promise now — the labels still speak about the reveal.
  it("builds the three steps", () => {
    expect(
      buildMechanicSteps({
        topicTitle: "Seaside town",
        charityLine: "Samaritans",
      })
    ).toEqual([
      "Pick your favourite seaside town",
      "Pledge what it's worth — all money will go to Samaritans",
      "Reveal where your favourite stands among the others",
    ])
  })

  it("falls back to 'charity' without a charity line", () => {
    const steps = buildMechanicSteps({
      topicTitle: "Colour",
      charityLine: null,
    })
    expect(steps[1]).toContain("all money will go to charity")
    expect(steps[2]).toBe("Reveal where your favourite stands among the others")
  })

  it("footer routes the favourite-less guest to the shared pot", () => {
    expect(mechanicFooter("Seaside town")).toBe(
      "Don’t have a favourite? Give to the shared pot instead"
    )
  })
})

describe("buildMechanicSteps — the personal note (founder, 2026-09-17)", () => {
  it("step 3 carries the personal note on note-bearing polls", () => {
    const steps = buildMechanicSteps({
      topicTitle: "Comfort food",
      charityLine: "Hospice UK",
      hasNote: true,
    })
    expect(steps[2]).toBe(
      "Reveal where your favourite stands along with a personal note"
    )
  })

  it("step 3 stays the comparison without a note", () => {
    const steps = buildMechanicSteps({
      topicTitle: "Comfort food",
      charityLine: null,
    })
    expect(steps[2]).toBe("Reveal where your favourite stands among the others")
  })
})

describe("buildMechanicSteps — the picks are in (founder, 2026-10-02)", () => {
  it("teaches the pot's path once the picks are suspended", () => {
    expect(
      buildMechanicSteps({
        topicTitle: "Seaside town",
        charityLine: "Samaritans",
        picksSuspended: true,
      })
    ).toEqual([
      "The picks are in — pledge to the shared pot",
      "All money will go to Samaritans",
      "Reveal where the favourites stand",
    ])
  })

  it("still promises the note", () => {
    const steps = buildMechanicSteps({
      topicTitle: "Seaside town",
      charityLine: null,
      hasNote: true,
      picksSuspended: true,
    })
    expect(steps[1]).toBe("All money will go to charity")
    expect(steps[2]).toBe(
      "Reveal where the favourites stand along with a personal note"
    )
  })
})

// THE STANDINGS ARE OUT (founder, 2026-10-03): once a suspension opens
// them, step 3 cannot offer to reveal what the guest is reading.
describe("buildMechanicSteps with the standings open", () => {
  const suspended = {
    topicTitle: "Hot drink",
    charityLine: "Marie Curie",
    picksSuspended: true,
    standingsOpen: true,
  }

  it("promises the note, not the standings", () => {
    expect(buildMechanicSteps({ ...suspended, hasNote: true })).toEqual([
      "The picks are in — pledge to the shared pot",
      "All money will go to Marie Curie",
      "Reveal the personal note",
    ])
  })

  it("drops step 3 entirely where there is no note", () => {
    expect(buildMechanicSteps({ ...suspended, hasNote: false })).toEqual([
      "The picks are in — pledge to the shared pot",
      "All money will go to Marie Curie",
    ])
  })

  it("asks for the pick again once the picks resume", () => {
    // One way: the standings stay open, but picking is back on.
    expect(
      buildMechanicSteps({
        ...suspended,
        picksSuspended: false,
        hasNote: true,
      })
    ).toEqual([
      "Pick your favourite hot drink",
      "Pledge what it's worth — all money will go to Marie Curie",
      "Reveal the personal note",
    ])
  })

  it("leaves the covered card's steps alone", () => {
    expect(
      buildMechanicSteps({
        ...suspended,
        standingsOpen: false,
        hasNote: true,
      })
    ).toEqual([
      "The picks are in — pledge to the shared pot",
      "All money will go to Marie Curie",
      "Reveal where the favourites stand along with a personal note",
    ])
  })
})
