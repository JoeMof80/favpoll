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
