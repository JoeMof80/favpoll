// @vitest-environment node
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  OUTPUT,
  PALETTES,
  measure,
  renderCss,
} from "../../scripts/generate-register-tokens.mjs"

describe("register tokens", () => {
  it("app/register-tokens.css is what the generator produces (run `pnpm tokens`)", () => {
    expect(readFileSync(OUTPUT, "utf8")).toBe(renderCss())
  })

  it("every palette holds white button text and readable page ink in both themes", () => {
    for (const [key, palette] of Object.entries(PALETTES)) {
      const m = measure(palette) as Record<
        "light" | "dark",
        { name: string; ratio: number; floor: number; pass: boolean }[]
      >
      const byName = (theme: "light" | "dark", name: string) =>
        m[theme].find((p) => p.name === name)!
      expect(
        byName("light", "button text on primary").ratio,
        key
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        byName("light", "brand text / links on page").ratio,
        key
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        byName("light", "body ink on page").ratio,
        key
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        byName("dark", "body ink on page").ratio,
        key
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        byName("dark", "button text on primary").ratio,
        key
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        byName("dark", "muted text on page").ratio,
        key
      ).toBeGreaterThanOrEqual(4.5)
    }
  })
})
