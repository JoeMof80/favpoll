import { describe, expect, it } from "vitest"
import {
  paletteForFavpoll,
  paletteForRegister,
  paletteForSceneKind,
} from "../register-palette"

describe("paletteForRegister", () => {
  it("maps the five registers onto the three palettes and the default", () => {
    expect(paletteForRegister("remembering")).toBe("memorial")
    expect(paletteForRegister("celebrating_one")).toBe("celebration")
    expect(paletteForRegister("celebrating_many")).toBe("celebration")
    expect(paletteForRegister("cause")).toBe("fundraiser")
    expect(paletteForRegister("neutral")).toBeNull()
    expect(paletteForRegister(null)).toBeNull()
    expect(paletteForRegister(undefined)).toBeNull()
  })
})

describe("paletteForFavpoll", () => {
  it("derives subject-first, then category", () => {
    expect(
      paletteForFavpoll({
        subject: "cause",
        category: null,
        grouping: "individual",
      })
    ).toBe("fundraiser")
    expect(
      paletteForFavpoll({
        subject: "someone",
        category: "memorial",
        grouping: "individual",
      })
    ).toBe("memorial")
    expect(
      paletteForFavpoll({
        subject: "someone",
        category: "celebration",
        grouping: "couple",
      })
    ).toBe("celebration")
    expect(
      paletteForFavpoll({
        subject: "someone",
        category: "fundraiser",
        grouping: "individual",
      })
    ).toBe("fundraiser")
    expect(
      paletteForFavpoll({
        subject: "someone",
        category: null,
        grouping: "individual",
      })
    ).toBeNull()
  })
})

describe("paletteForSceneKind", () => {
  it("a cause scene wears the fundraiser palette", () => {
    expect(paletteForSceneKind("memorial")).toBe("memorial")
    expect(paletteForSceneKind("celebration")).toBe("celebration")
    expect(paletteForSceneKind("fundraiser")).toBe("fundraiser")
    expect(paletteForSceneKind("cause")).toBe("fundraiser")
  })
})
