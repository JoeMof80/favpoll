import { describe, it, expect } from "vitest"
import { validateSubsetCompletion } from "../subset-completion"

const INPUT = {
  parentTitle: "Takeaway",
  parentItems: [
    "Biryani",
    "Chicken tikka masala",
    "Katsu curry",
    "Korma",
    "Saag paneer",
    "Onion bhaji",
    "Fish and chips",
    "Chips and curry sauce",
  ],
  subsetTitle: "Curry",
  members: ["Biryani", "Chicken tikka masala", "Katsu curry", "Korma"],
}

describe("validateSubsetCompletion", () => {
  it("missing members must be on the parent's list and not already members", () => {
    const out = validateSubsetCompletion(INPUT, {
      missing: ["saag paneer", "Korma", "Jalfrezi", "Fish and chips"],
      additions: [],
    })
    expect(out.missing).toEqual(["Saag paneer", "Fish and chips"])
  })

  it("additions must be things the list lacks, deduplicated, at most eight", () => {
    const out = validateSubsetCompletion(INPUT, {
      missing: [],
      additions: [
        "Jalfrezi",
        "jalfrezi",
        "Korma",
        " Rogan  josh ",
        "Madras",
        "Balti",
        "Vindaloo",
        "Bhuna",
        "Dhansak",
        "Pasanda",
        "Thai green curry",
      ],
    })
    expect(out.additions).toEqual([
      "Jalfrezi",
      "Rogan josh",
      "Madras",
      "Balti",
      "Vindaloo",
      "Bhuna",
      "Dhansak",
      "Pasanda",
    ])
  })

  it("garbage in, empty out", () => {
    expect(
      validateSubsetCompletion(INPUT, { missing: "x", additions: 3 })
    ).toEqual({ missing: [], additions: [] })
  })
})
