import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import {
  OCCASION_ROWS,
  FAMILY_ROWS,
  CHARITY_ROWS,
  HONOUR_CHARITY_ROWS,
  REGISTER_ADDED,
  lookupEdges,
} from "../pairing-table"
import { OCCASION_TYPES_BY_REGISTER } from "../registers"

// The reference note promises "every topic and charity named here
// exists". The catalogue is scripts/seed.ts; read its titles so a renamed
// or retired topic fails here instead of silently losing its edge.
const seedSource = readFileSync(
  resolve(__dirname, "../../../../scripts/seed.ts"),
  "utf8"
)
const CATALOGUE = new Set(
  [...seedSource.matchAll(/title: "((?:[^"\\]|\\.)*)"/g)].map((m) =>
    m[1].replace(/\\'/g, "'")
  )
)
const SEEDED_CHARITIES = new Set(
  [...seedSource.matchAll(/name: "((?:[^"\\]|\\.)*)"/g)].map((m) =>
    m[1].replace(/\\'/g, "'")
  )
)

describe("pairing table — vocabulary drift guards", () => {
  it("every occasion key is a live occasion_type", () => {
    const live = new Set(Object.values(OCCASION_TYPES_BY_REGISTER).flat())
    for (const key of Object.keys(OCCASION_ROWS)) {
      expect(
        live.has(key),
        `occasion "${key}" is not in OCCASION_TYPES_BY_REGISTER`
      ).toBe(true)
    }
  })

  it("every topic in every row is a catalogue title", () => {
    expect(CATALOGUE.size).toBeGreaterThan(100)
    const rows = [
      ...Object.values(OCCASION_ROWS).map((r) => r.topics),
      ...Object.values(FAMILY_ROWS).map((r) => r.topics),
      ...Object.values(CHARITY_ROWS),
    ]
    for (const row of rows) {
      for (const { topic } of row) {
        expect(
          CATALOGUE.has(topic),
          `topic "${topic}" is not in scripts/seed.ts`
        ).toBe(true)
      }
    }
  })

  it("every per-charity row names a seeded or register-added charity", () => {
    const known = new Set([...SEEDED_CHARITIES, ...REGISTER_ADDED])
    for (const name of Object.keys(CHARITY_ROWS)) {
      expect(known.has(name), `charity "${name}" is not known`).toBe(true)
    }
  })

  it("every occasion↔charity row names live occasions", () => {
    const live = new Set(Object.values(OCCASION_TYPES_BY_REGISTER).flat())
    for (const row of HONOUR_CHARITY_ROWS) {
      for (const o of row.occasions) {
        expect(live.has(o), `occasion "${o}" in §2b is not live`).toBe(true)
      }
    }
  })

  it("the HOLD rows are not encoded (founder, 2026-09-23: extra cautious)", () => {
    // D — homelessness charity→topic
    expect(FAMILY_ROWS.homelessness.topics).toEqual([])
    // E — health charities where a topic could jar
    expect(CHARITY_ROWS["Stroke Association"]).toBeUndefined()
    expect(CHARITY_ROWS["Diabetes UK"]).toBeUndefined()
    expect(CHARITY_ROWS["Scope"]).toBeUndefined()
    expect(FAMILY_ROWS.health_condition.topics).toEqual([])
    // H — the weak occasion↔charity rows
    const weak = [
      "Citizenship",
      "Leaving do",
      "New job",
      "Promotion",
      "Graduation",
      "Exam success",
      "Coming out",
      "Divorce party",
    ]
    for (const row of HONOUR_CHARITY_ROWS) {
      for (const o of row.occasions) expect(weak).not.toContain(o)
    }
  })
})

describe("lookupEdges — the worked triples from the reference note", () => {
  it("Ben's Channel Swim · Seaside town · RNLI is a triad, every edge starred", () => {
    const edges = lookupEdges({
      register: "celebrating_one",
      occasionType: "Achievement",
      topicTitle: "Seaside town",
      charityName: "RNLI",
      causeFamily: "sea_rescue",
    })
    expect(edges.count).toBe(3)
    expect(edges.e1?.star).toBe(true)
    expect(edges.e2?.star).toBe(true)
    expect(edges.e3?.star).toBe(true)
    expect(edges.e1?.text).toBe(
      "A favourite seaside town is part of an achievement: where the effort happens — the sea, the peak, the route."
    )
    expect(edges.e3?.text).toBe(
      "RNLI belongs at an achievement: the cause the effort is for — a swim for the lifeboats, a climb for mountain rescue."
    )
  })

  it("Emma & James · Song · Shelter is two edges (wedding→song, wedding↔a home)", () => {
    const edges = lookupEdges({
      register: "celebrating_many",
      occasionType: "Wedding",
      topicTitle: "Song",
      charityName: "Shelter",
      causeFamily: "homelessness",
    })
    expect(edges.count).toBe(2)
    expect(edges.e1?.star).toBe(true)
    expect(edges.e2).toBeNull() // note D is HOLD
    expect(edges.e3?.star).toBe(true)
  })

  it("David Clarke · Place · BHF is one unstarred edge whose text names the hop", () => {
    const edges = lookupEdges({
      register: "celebrating_one",
      occasionType: "Retirement",
      topicTitle: "Place",
      charityName: "British Heart Foundation",
      causeFamily: "health_condition",
    })
    expect(edges.count).toBe(1)
    expect(edges.e1?.star).toBe(false)
    expect(edges.e1?.text).toContain(
      "only by a step the about must say out loud: the freedom to finally go"
    )
    expect(edges.e2).toBeNull()
    expect(edges.e3).toBeNull()
  })

  it("Joan & Arthur · Seaside town · Alzheimer's Society scores zero", () => {
    const edges = lookupEdges({
      register: "celebrating_many",
      occasionType: "Anniversary",
      topicTitle: "Seaside town",
      charityName: "Alzheimer's Society",
      causeFamily: "end_of_life",
    })
    expect(edges.count).toBe(0)
  })
})

describe("lookupEdges — rules", () => {
  it("a charity's own row beats its family's (Dogs Trust → Dog breed ★)", () => {
    const own = lookupEdges({
      register: "celebrating_one",
      occasionType: null,
      topicTitle: "Dog breed",
      charityName: "Dogs Trust",
      causeFamily: "animals",
    })
    expect(own.e2?.star).toBe(true)
    const family = lookupEdges({
      register: "celebrating_one",
      occasionType: null,
      topicTitle: "Dog breed",
      charityName: "Rescue Pups",
      causeFamily: "animals",
    })
    expect(family.e2?.star).toBe(false)
    expect(family.e2?.text).toBe(
      "Rescue Pups works for animals — rescue, welfare and wildlife: a favourite dog breed sits inside that cause."
    )
  })

  it("no confirmed family means no charity edges, whatever the name", () => {
    const edges = lookupEdges({
      register: "remembering",
      occasionType: "Memorial",
      topicTitle: "Flower",
      charityName: "Marie Curie",
      causeFamily: null,
    })
    expect(edges.e1?.star).toBe(true)
    expect(edges.e2).toBeNull()
    expect(edges.e3).toBeNull()
    expect(edges.count).toBe(1)
  })

  it("the memorial row serves every remembering occasion type", () => {
    for (const o of OCCASION_TYPES_BY_REGISTER.remembering) {
      if (o === "Pet memorial") continue
      const edges = lookupEdges({
        register: "remembering",
        occasionType: o,
        topicTitle: "Hymn",
        charityName: "Marie Curie",
        causeFamily: "end_of_life",
      })
      expect(edges.count, o).toBe(2)
      expect(edges.e3?.star, o).toBe(true)
    }
  })

  it("the cause register never has an Honour edge", () => {
    const edges = lookupEdges({
      register: "cause",
      occasionType: "In memoriam appeal",
      topicTitle: "Flower",
      charityName: "Marie Curie",
      causeFamily: "end_of_life",
    })
    expect(edges.e1?.star).toBe(true)
    expect(edges.e3).toBeNull()
  })

  it("the register defaults pair with nothing", () => {
    for (const o of ["Celebration", "Joint celebration", "Just because"]) {
      const edges = lookupEdges({
        register: "celebrating_one",
        occasionType: o,
        topicTitle: "Song",
        charityName: null,
        causeFamily: null,
      })
      expect(edges.count, o).toBe(0)
    }
  })

  it("matches occasion, topic and charity case-insensitively", () => {
    const edges = lookupEdges({
      register: "celebrating_one",
      occasionType: "milestone BIRTHDAY",
      topicTitle: "decade",
      charityName: "age uk",
      causeFamily: "older_people",
    })
    expect(edges.count).toBe(3)
  })
})

describe("lookupEdges — a row's exceptions", () => {
  it("RNIB does not belong at a memorial for fighting what takes people", () => {
    const rnib = lookupEdges({
      register: "remembering",
      occasionType: "Tribute",
      topicTitle: "Instrument",
      charityName: "RNIB",
      causeFamily: "health_condition",
    })
    expect(rnib.e3).toBeNull()
    const bhf = lookupEdges({
      register: "remembering",
      occasionType: "Tribute",
      topicTitle: "Instrument",
      charityName: "British Heart Foundation",
      causeFamily: "health_condition",
    })
    expect(bhf.e3).not.toBeNull()
  })
})
