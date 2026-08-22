import { test, expect } from "@playwright/test"

// NOTHING SCROLLS SIDEWAYS.
//
// A page wider than its viewport is the defect this codebase produces most
// often, and it is always the same shape: something with a FIXED width inside
// a track that cannot hold it. A grid item will not shrink below its
// min-content, so the page grows instead of the element shrinking, and nothing
// throws.
//
// Twice in a week:
//
//   - /features' How It Works stacked 414-1160px media in the text column, so
//     the column took the widest thing max-w-lg allowed (512) inside a 342px
//     track and every beat's text ran off the right of the phone. Fixed with
//     min-w-0 (2026-08-18).
//   - the register heroes gave a FIXED 400px demo card a grid column of
//     calc((100%-4rem)/3) — less than 400 at every width below ~1300 — so all
//     three pages scrolled: +157px at 768, +72 at 1024, +20 at 1180. Carried
//     unnoticed since 2026-08-15 (2026-08-22).
//
// Neither was visible in a screenshot at the width it was designed at, which
// is why this sweeps widths rather than trusting one.
//
// jsdom cannot do it: no layout engine, every rect is zero.

const PAGES = [
  "/",
  "/features",
  "/about",
  "/memorials",
  "/celebrations",
  "/fundraisers",
] as const

// The narrowest phone still in use, the iPhone baseline, a Pro Max, the two
// tablet stops, and the widths where the register grid used to fail. 1180 is
// here by name: it is where the demo column overflowed by only 20px, small
// enough to look like a rounding error and be dismissed.
const WIDTHS = [320, 360, 390, 430, 768, 1024, 1180, 1280, 1440] as const

test.describe("no page scrolls sideways", () => {
  for (const path of PAGES) {
    test(`${path} fits every width`, async ({ page }) => {
      const failures: string[] = []

      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(path)
        // Let the client-only artefacts mount; several are gated on `mounted`
        // and a page measured before they arrive is not the page.
        await page.waitForTimeout(600)

        const result = await page.evaluate((w) => {
          const scrollWidth = document.documentElement.scrollWidth
          if (scrollWidth <= w + 0.5) return null
          // Name the widest offender rather than only the number — the number
          // says a page is broken, the element says which commit broke it.
          let worst: { tag: string; cls: string; right: number } | null = null
          for (const el of document.querySelectorAll("body *")) {
            const r = el.getBoundingClientRect()
            if (r.width === 0 || r.height === 0) continue
            if (r.right > w + 0.5 && (!worst || r.right > worst.right)) {
              worst = {
                tag: el.tagName.toLowerCase(),
                cls: (el.className || "").toString().slice(0, 80),
                right: Math.round(r.right),
              }
            }
          }
          return { scrollWidth, worst }
        }, width)

        if (result) {
          failures.push(
            `${width}px: scrollWidth ${result.scrollWidth} (+${
              result.scrollWidth - width
            }) — widest <${result.worst?.tag}> right=${result.worst?.right} .${
              result.worst?.cls
            }`
          )
        }
      }

      expect(
        failures,
        `${path} overflows:\n  ${failures.join("\n  ")}`
      ).toEqual([])
    })
  }
})
