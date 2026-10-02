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

// The revisit's rows (2026-10-01, ticked 2026-10-02): a subset with a row
// of its own beats inheritance, in the occasion rows and the charity rows.
describe("subset rows of their own", () => {
  it("Family gathering · Classic board game stars in its own name", () => {
    const e = lookupEdges({
      register: "celebrating_many",
      occasionType: "Family gathering",
      topicTitle: "Classic board game",
      parentTopicTitle: "Board game",
      charityName: null,
      causeFamily: null,
    })
    expect(e.e1?.star).toBe(true)
    expect(e.e1?.text).toContain("classic board game")
  })

  it("Reunion · Karaoke song is enacted: the karaoke list", () => {
    const e = lookupEdges({
      register: "celebrating_many",
      occasionType: "Reunion",
      topicTitle: "Karaoke song",
      parentTopicTitle: "Song",
      charityName: null,
      causeFamily: null,
    })
    expect(e.e1?.enacted).toBe("the top ten are the karaoke list for the night")
  })

  it("Achievement · British mountain stars where Mountain or peak did", () => {
    const e = lookupEdges({
      register: "celebrating_one",
      occasionType: "Achievement",
      topicTitle: "British mountain",
      parentTopicTitle: "Mountain or peak",
      charityName: "Mountain Rescue England and Wales",
      causeFamily: "health_condition",
    })
    expect(e.e1?.star).toBe(true)
    expect(e.e2?.star).toBe(true)
    expect(e.e2?.text).toContain("british mountain")
  })

  it("Wedding · Greek island carries the sharper hop: the honeymoon", () => {
    const e = lookupEdges({
      register: "celebrating_many",
      occasionType: "Wedding",
      topicTitle: "Greek island",
      parentTopicTitle: "Island",
      charityName: null,
      causeFamily: null,
    })
    expect(e.e1?.star).toBe(false)
    expect(e.e1?.text).toContain("the honeymoon")
    expect(e.e1?.text).not.toContain("the venue")
  })

  it("a subset with no charity row of its own inherits its parent's", () => {
    const parent = lookupEdges({
      register: "celebrating_one",
      occasionType: null,
      topicTitle: "Island",
      charityName: "RNLI",
      causeFamily: "sea_rescue",
    })
    const subset = lookupEdges({
      register: "celebrating_one",
      occasionType: null,
      topicTitle: "Scottish island",
      parentTopicTitle: "Island",
      charityName: "RNLI",
      causeFamily: "sea_rescue",
    })
    expect(!!parent.e2).toBe(true)
    expect(subset.e2?.star).toBe(parent.e2?.star)
    expect(subset.e2?.text).toContain("scottish island")
  })
})

// A subset that NAMES AN OCCASION never inherits (revisit section A).
// Found by the exemplar cohort of 2026-10-02, which paired "favourite
// wedding song" with a Remembrance and "Sunday roast" with an achievement.
describe("subsets that name an occasion", () => {
  it("Wedding song finds no row at a memorial, where Song has one", () => {
    const parent = lookupEdges({
      register: "remembering",
      occasionType: "Remembrance",
      topicTitle: "Song",
      charityName: null,
      causeFamily: null,
    })
    expect(parent.e1).not.toBeNull()
    const subset = lookupEdges({
      register: "remembering",
      occasionType: "Remembrance",
      topicTitle: "Wedding song",
      parentTopicTitle: "Song",
      charityName: null,
      causeFamily: null,
    })
    expect(subset.e1).toBeNull()
  })

  it("but keeps the row that names it, at the anniversary", () => {
    const e = lookupEdges({
      register: "celebrating_many",
      occasionType: "Anniversary",
      topicTitle: "Wedding song",
      parentTopicTitle: "Song",
      charityName: null,
      causeFamily: null,
    })
    expect(e.e1?.star).toBe(true)
  })

  it("Sunday roast does not reach an achievement through Comfort food", () => {
    const e = lookupEdges({
      register: "celebrating_one",
      occasionType: "Achievement",
      topicTitle: "Sunday roast",
      parentTopicTitle: "Comfort food",
      charityName: null,
      causeFamily: null,
    })
    expect(e.e1).toBeNull()
  })

  it("and still stars at the family gathering that names it", () => {
    const e = lookupEdges({
      register: "celebrating_many",
      occasionType: "Family gathering",
      topicTitle: "Sunday roast",
      parentTopicTitle: "Comfort food",
      charityName: null,
      causeFamily: null,
    })
    expect(e.e1?.star).toBe(true)
  })

  it("an ordinary subset still inherits", () => {
    const e = lookupEdges({
      register: "celebrating_one",
      occasionType: "Birthday",
      topicTitle: "Farm animal",
      parentTopicTitle: "Animal",
      charityName: null,
      causeFamily: null,
    })
    expect(e.e1 === null).toBe(
      lookupEdges({
        register: "celebrating_one",
        occasionType: "Birthday",
        topicTitle: "Animal",
        charityName: null,
        causeFamily: null,
      }).e1 === null
    )
  })
})
