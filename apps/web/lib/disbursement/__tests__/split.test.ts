import { describe, it, expect } from "vitest"
import { splitEqually } from "@/lib/disbursement/split"

const sum = (parts: { amount: number }[]) =>
  Math.round(parts.reduce((t, p) => t + p.amount, 0) * 100) / 100

describe("splitEqually", () => {
  it("splits evenly when the total divides cleanly", () => {
    const parts = splitEqually(90, ["a", "b", "c"])
    expect(parts).toEqual([
      { charityId: "a", amount: 30 },
      { charityId: "b", amount: 30 },
      { charityId: "c", amount: 30 },
    ])
  })

  it("gives the whole amount to a single charity", () => {
    expect(splitEqually(75, ["a"])).toEqual([{ charityId: "a", amount: 75 }])
  })

  it("distributes remainder pennies to the earliest charities and reconciles", () => {
    const parts = splitEqually(10, ["a", "b", "c"])
    expect(parts).toEqual([
      { charityId: "a", amount: 3.34 },
      { charityId: "b", amount: 3.33 },
      { charityId: "c", amount: 3.33 },
    ])
    expect(sum(parts)).toBe(10)
  })

  it("handles two charities with a half-penny-free split", () => {
    expect(splitEqually(25, ["a", "b"])).toEqual([
      { charityId: "a", amount: 12.5 },
      { charityId: "b", amount: 12.5 },
    ])
  })

  it("reconciles a messy pence total", () => {
    const parts = splitEqually(100.01, ["a", "b", "c"])
    expect(sum(parts)).toBe(100.01)
  })

  it("returns nothing when there are no charities", () => {
    expect(splitEqually(50, [])).toEqual([])
  })

  it("returns nothing when the total is zero or negative", () => {
    expect(splitEqually(0, ["a", "b"])).toEqual([])
    expect(splitEqually(-5, ["a"])).toEqual([])
  })
})
