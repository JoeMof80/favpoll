import { describe, it, expect } from "vitest"
import { lookupEdges } from "../pairing-table"

// SUBSETS in the pairing table (favpoll-topic-rules §1, step 5): a subset
// inherits its parent's row unless a row names the subset; a charity's
// own subset is its own topic on the card, and its parent still is.

describe("lookupEdges with a subset on the card", () => {
  it("a subset inherits its parent's occasion row", () => {
    const parent = lookupEdges({
      register: "celebrating_one",
      occasionType: "Birthday",
      topicTitle: "Animal",
      charityName: null,
      causeFamily: null,
    })
    const subset = lookupEdges({
      register: "celebrating_one",
      occasionType: "Birthday",
      topicTitle: "Farm animal",
      parentTopicTitle: "Animal",
      charityName: null,
      causeFamily: null,
    })
    expect(!!subset.e1).toBe(!!parent.e1)
    if (parent.e1 && subset.e1) {
      expect(subset.e1.star).toBe(parent.e1.star)
      expect(subset.e1.text).toContain("farm animal")
    }
  })

  it("a subset with no parent named finds no row of its own", () => {
    const e = lookupEdges({
      register: "celebrating_one",
      occasionType: "Birthday",
      topicTitle: "Farm animal",
      charityName: null,
      causeFamily: null,
    })
    expect(e.e1).toBeNull()
  })

  it("the charity's own subset is its own topic; the parent is too", () => {
    const charityTopic = {
      title: "Animal",
      subsetTitle: "Farm animal",
      reason: "The animals are the point",
    }
    const own = lookupEdges({
      register: "celebrating_one",
      occasionType: null,
      topicTitle: "Farm animal",
      parentTopicTitle: "Animal",
      charityName: "Hackney City Farm",
      causeFamily: "animals",
      charityTopic,
    })
    expect(own.e2?.star).toBe(true)
    expect(own.e2?.text).toContain("Hackney City Farm's own topic")
    const parent = lookupEdges({
      register: "celebrating_one",
      occasionType: null,
      topicTitle: "Animal",
      charityName: "Hackney City Farm",
      causeFamily: "animals",
      charityTopic,
    })
    expect(parent.e2?.star).toBe(true)
    const other = lookupEdges({
      register: "celebrating_one",
      occasionType: null,
      topicTitle: "Zoo animal",
      parentTopicTitle: "Animal",
      charityName: "Hackney City Farm",
      causeFamily: "animals",
      charityTopic,
    })
    // Another corner of the same shelf: the parent is still the charity's
    // own topic, so the edge holds by the parent.
    expect(other.e2?.star).toBe(true)
  })
})
