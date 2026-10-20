import { describe, it, expect } from "vitest"
import { one, many } from "@/lib/supabase/relation"

// The cases are the two shapes PostgREST actually returns for the same
// embedded relation, plus the absences. `lib/poll-title.ts` has said since
// the subset work that both shapes arrive; seven sites asserted otherwise
// until #1106.

describe("one — the single row of a to-one relation", () => {
  it("takes the object shape", () => {
    expect(one<{ id: string }>({ id: "a" })).toEqual({ id: "a" })
  })

  it("takes the one-element array shape", () => {
    expect(one<{ id: string }>([{ id: "a" }])).toEqual({ id: "a" })
  })

  it("takes the first of a longer array, as PostgREST orders it", () => {
    expect(one<{ id: string }>([{ id: "a" }, { id: "b" }])).toEqual({ id: "a" })
  })

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["an empty array", []],
  ])("answers null for %s", (_name, value) => {
    expect(one(value)).toBeNull()
  })

  // This is the behaviour the casts lacked: reading a field off the array
  // itself gave undefined, silently.
  it("reads a field the same way whichever shape arrived", () => {
    const asObject = one<{ name: string }>({ name: "Joan" })?.name
    const asArray = one<{ name: string }>([{ name: "Joan" }])?.name
    expect(asObject).toBe("Joan")
    expect(asArray).toBe("Joan")
    expect(asArray).toBe(asObject)
  })
})

describe("many — every row of a to-many relation", () => {
  it("takes an array unchanged", () => {
    expect(many<{ id: string }>([{ id: "a" }, { id: "b" }])).toHaveLength(2)
  })

  // The mirror mistake: `?? []` keeps a bare object as a non-array and the
  // caller's .map throws.
  it("wraps a lone object, which `?? []` would not", () => {
    expect(many<{ id: string }>({ id: "a" })).toEqual([{ id: "a" }])
  })

  it.each([
    ["null", null],
    ["undefined", undefined],
  ])("answers an empty list for %s", (_name, value) => {
    expect(many(value)).toEqual([])
  })
})
