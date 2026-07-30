import { describe, it, expect } from "vitest"
import { OCCASIONS, occasionsForRegister } from "../occasions"

describe("occasion catalogue integrity", () => {
  it("labels are unique", () => {
    const labels = OCCASIONS.map((o) => o.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it("every occasion has at least one opening line and one context", () => {
    for (const o of OCCASIONS) {
      expect(o.openingLines.length, o.label).toBeGreaterThan(0)
      expect(o.contexts.length, o.label).toBeGreaterThan(0)
    }
  })

  it("opening lines fit the form's 50-char cap", () => {
    for (const o of OCCASIONS) {
      for (const line of o.openingLines) {
        expect(line.length, `${o.label}: "${line}"`).toBeLessThanOrEqual(50)
      }
    }
  })

  it("contexts fit the form's 40-char cap and carry no full stop", () => {
    for (const o of OCCASIONS) {
      for (const c of o.contexts) {
        expect(c.length, `${o.label}: "${c}"`).toBeLessThanOrEqual(40)
        expect(c.endsWith("."), `${o.label}: "${c}"`).toBe(false)
      }
    }
  })

  it("pair/group tags appear only on celebrating_many", () => {
    for (const o of OCCASIONS) {
      if (o.grouping) expect(o.register, o.label).toBe("celebrating_many")
    }
  })

  it("copy never uses the word choose", () => {
    for (const o of OCCASIONS) {
      for (const s of [o.label, ...o.openingLines, ...o.contexts]) {
        expect(/choose/i.test(s), s).toBe(false)
      }
    }
  })
})

describe("occasionsForRegister", () => {
  it("filters by register", () => {
    const remembering = occasionsForRegister("remembering")
    expect(remembering.length).toBeGreaterThan(0)
    expect(remembering.every((o) => o.register === "remembering")).toBe(true)
  })

  it("returns nothing for neutral", () => {
    expect(occasionsForRegister("neutral")).toEqual([])
  })

  it("pair filter drops group-only occasions and keeps untagged", () => {
    const forPair = occasionsForRegister("celebrating_many", "pair")
    expect(forPair.some((o) => o.label === "Wedding")).toBe(true)
    expect(forPair.some((o) => o.label === "Joint celebration")).toBe(true)
    expect(forPair.some((o) => o.label === "Championship win")).toBe(false)
  })

  it("group filter drops pair-only occasions and keeps untagged", () => {
    const forGroup = occasionsForRegister("celebrating_many", "group")
    expect(forGroup.some((o) => o.label === "Championship win")).toBe(true)
    expect(forGroup.some((o) => o.label === "Joint celebration")).toBe(true)
    expect(forGroup.some((o) => o.label === "Renewal of vows")).toBe(false)
  })

  it("no grouping argument returns the full celebrating_many list", () => {
    const all = occasionsForRegister("celebrating_many")
    const pair = occasionsForRegister("celebrating_many", "pair")
    expect(all.length).toBeGreaterThan(pair.length)
  })
})
