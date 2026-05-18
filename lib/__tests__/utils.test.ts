import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500")
  })

  it("merges multiple classes", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold")
  })

  it("resolves Tailwind conflicts — last class wins", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
    expect(cn("p-4", "p-2")).toBe("p-2")
  })

  it("ignores falsy values", () => {
    expect(cn("text-sm", false, undefined, null, "font-bold")).toBe("text-sm font-bold")
  })

  it("handles conditional class objects", () => {
    expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe("text-red-500")
  })

  it("returns empty string when given no truthy values", () => {
    expect(cn(false, undefined, null)).toBe("")
  })
})
