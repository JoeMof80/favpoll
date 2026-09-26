import { describe, it, expect } from "vitest"
import { EXEMPLAR_BANK, pickExemplars, scoreExemplar } from "../exemplars"

describe("exemplar retrieval", () => {
  it("the bank holds the founder's edited Stories plus the four originals", () => {
    expect(EXEMPLAR_BANK.length).toBeGreaterThanOrEqual(25)
    expect(EXEMPLAR_BANK.some((e) => e.id === "seed-belinda")).toBe(true)
    expect(EXEMPLAR_BANK.some((e) => e.voice === "first")).toBe(true)
  })

  it("voice comes first: a first-person request gets first-person examples", () => {
    const picks = pickExemplars({
      register: "celebrating_many",
      occasionType: "Engagement",
      topicTitle: "Cocktail",
      causeFamily: "homelessness",
      pronoun: "i",
      grouping: "couple",
    })
    expect(picks).toHaveLength(4)
    expect(picks.every((e) => e.voice === "first")).toBe(true)
    expect(picks[0].occasion).toBe("Engagement")
  })

  it("a memorial with a flower is written next to memorials with flowers", () => {
    const picks = pickExemplars({
      register: "remembering",
      occasionType: "Tribute",
      topicTitle: "Flower",
      causeFamily: "end_of_life",
      pronoun: "she",
      grouping: "individual",
    })
    expect(picks.every((e) => e.register === "remembering")).toBe(true)
    expect(picks.some((e) => e.topic === "Flower")).toBe(true)
  })

  it("scores voice above register above occasion", () => {
    const base = {
      register: "celebrating_one" as const,
      occasionType: "Retirement",
      topicTitle: "Place",
      causeFamily: null,
      pronoun: "he" as const,
      grouping: "individual" as const,
    }
    const sameVoiceWrongRegister = {
      id: "a",
      triple: "",
      register: "remembering",
      occasion: "Memorial",
      topic: "Colour",
      family: null,
      voice: "third" as const,
      grouping: "individual",
      about: "",
      note: "",
    }
    const wrongVoiceRightRegister = {
      ...sameVoiceWrongRegister,
      register: "celebrating_one",
      voice: "first" as const,
    }
    // Voice alone (8) outweighs register alone (4).
    expect(scoreExemplar(sameVoiceWrongRegister, base)).toBeGreaterThan(
      scoreExemplar(wrongVoiceRightRegister, base)
    )
  })
})
