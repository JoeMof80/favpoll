import { describe, it, expect } from "vitest"
import { validateSubsetProposals } from "../subset-proposals"

const ANIMAL = {
  title: "Animal",
  isFinite: false,
  items: [
    "Dog",
    "Cat",
    "Cow",
    "Pig",
    "Sheep",
    "Goat",
    "Chicken",
    "Donkey",
    "Horse",
    "Lion",
    "Tiger",
    "Leopard",
    "Cheetah",
    "Jaguar",
    "Elephant",
    "Giraffe",
    "Zebra",
    "Hamster",
    "Rabbit",
  ],
}

describe("validateSubsetProposals (favpoll-topic-rules §1, ruling 7)", () => {
  it("keeps only labels on the parent's list, verbatim, and needs six of them", () => {
    const out = validateSubsetProposals(ANIMAL, [
      {
        title: "farm animal",
        items: ["cow", "Pig", "SHEEP", "Goat", "Chicken", "Donkey", "Unicorn"],
        reason: "City farms.",
      },
      { title: "Big cat", items: ["Lion", "Tiger"], reason: "Too few." },
    ])
    expect(out).toEqual([
      {
        title: "Farm animal",
        items: ["Cow", "Pig", "Sheep", "Goat", "Chicken", "Donkey"],
        reason: "City farms.",
      },
    ])
  })

  it("trims to sixteen, drops the topic's own name and duplicate titles", () => {
    const out = validateSubsetProposals(ANIMAL, [
      { title: "Animal", items: ANIMAL.items, reason: "" },
      { title: "Zoo animal", items: ANIMAL.items, reason: "" },
      { title: "zoo animal", items: ANIMAL.items.slice(0, 8), reason: "" },
    ])
    expect(out.map((s) => s.title)).toEqual(["Zoo animal"])
    expect(out[0].items).toHaveLength(16)
  })

  it("a subset may overlap another but may not contain it whole", () => {
    const bigCat = ["Lion", "Tiger", "Leopard", "Cheetah", "Jaguar", "Elephant"]
    const out = validateSubsetProposals(ANIMAL, [
      {
        title: "Zoo animal",
        items: [...bigCat, "Giraffe", "Zebra"],
        reason: "",
      },
      { title: "Big cat", items: bigCat, reason: "" },
      {
        title: "Pet",
        items: ["Dog", "Cat", "Hamster", "Rabbit", "Goat", "Horse"],
        reason: "",
      },
      {
        title: "Farm animal",
        items: ["Cow", "Pig", "Sheep", "Goat", "Chicken", "Donkey", "Horse"],
        reason: "",
      },
    ])
    expect(out.map((s) => s.title).sort()).toEqual([
      "Big cat",
      "Farm animal",
      "Pet",
    ])
  })
})
