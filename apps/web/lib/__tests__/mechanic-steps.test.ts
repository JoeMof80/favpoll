import { describe, it, expect } from "vitest"
import { buildMechanicSteps, mechanicFooter } from "../mechanic-steps"

describe("buildMechanicSteps", () => {
  it("builds the person steps with charity and first name", () => {
    expect(
      buildMechanicSteps({
        topicTitle: "Seaside town",
        charityLine: "Samaritans",
        firstName: "Clive",
        isCause: false,
        hasReveal: true,
      })
    ).toEqual([
      "Pick your own favourite seaside town",
      "Pledge what it's worth — it all goes to Samaritans, favpoll takes no fee",
      "Clive's favourite will be revealed, along with the standings",
    ])
  })

  it("speaks as 'our pick' for causes", () => {
    const steps = buildMechanicSteps({
      topicTitle: "Colour",
      charityLine: null,
      firstName: null,
      isCause: true,
      hasReveal: true,
    })
    expect(steps[1]).toContain("it all goes to charity")
    expect(steps[2]).toBe("Our pick will be revealed, along with the standings")
  })

  it("promises only the standings when no reveal exists", () => {
    const steps = buildMechanicSteps({
      topicTitle: "Colour",
      charityLine: "Oxfam",
      firstName: "Joan",
      isCause: false,
      hasReveal: false,
    })
    expect(steps[2]).toBe("The standings will be revealed")
  })

  it("footer routes the favourite-less guest to the shared fund", () => {
    expect(mechanicFooter("Seaside town")).toBe(
      "Don't have a favourite seaside town? That's okay — you can still give to the shared fund."
    )
  })
})
