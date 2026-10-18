import { describe, it, expect } from "vitest"
import { compareLabels } from "@/lib/compare-labels"

describe("compareLabels", () => {
  it("orders numbered labels by their numbers, not their digits", () => {
    const labels = [
      "10 · Marsh Lane",
      "2 · Willow Lane",
      "1 · Friends",
      "55 · Queensway",
      "20 · Wrenbury",
    ]
    expect([...labels].sort(compareLabels)).toEqual([
      "1 · Friends",
      "2 · Willow Lane",
      "10 · Marsh Lane",
      "20 · Wrenbury",
      "55 · Queensway",
    ])
  })

  it("stays alphabetical and case-insensitive for plain labels", () => {
    expect(["bourbon", "Hobnob", "Digestive"].sort(compareLabels)).toEqual([
      "bourbon",
      "Digestive",
      "Hobnob",
    ])
  })
})
