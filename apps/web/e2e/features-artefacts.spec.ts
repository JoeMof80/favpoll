import { test, expect } from "@playwright/test"

// The features page shows REAL components as its artefacts — the printed
// pack, the pledge dialog's fund split, PollReveal, CharityBanner, GuestWall,
// and a room with the display in it. That is the point: a page drawn as
// lookalikes would describe a product it could quietly stop resembling.
//
// It is also the risk this test covers. Every one of those can change
// underneath the page, and the page has no way to notice.
//
// TWO FAILURE MODES, and they need different checks:
//
//   1. The PACK scales into a box whose size is a MEASURED constant. If the
//      card's real dimensions move, the box goes stale silently — the
//      artefact does not throw, it just clips against the frame's crop, or
//      floats in a hole.
//
//   2. Every vignette sits inside Vignette's overflow-hidden. That is what
//      stops the room's phone spilling its section, and it is also what
//      HIDES a vignette that has collapsed to nothing or grown past its
//      frame. A height floor catches the collapse.
//
// jsdom cannot catch either: it has no layout engine, so every rect is zero.
// It has to be a browser.

const SECTIONS = [
  "topics",
  "stationery",
  "display",
  "shared-fund",
  "reveal",
  "goal",
  "guest-wall",
  "keepsake",
] as const

// The artefacts scaled into measured boxes — the pack's fan and the
// keepsake's pair of sheets. Their box sizes are constants that go stale
// silently if the sheets' real dimensions move.
const MEASURED_BOXES = ["stationery", "keepsake"] as const

// Widths that straddle the artefacts' own breakpoints: below sm, between sm
// and lg, and above lg.
const WIDTHS = [390, 700, 1280, 1512]

// Below this a vignette has collapsed — the frame is drawn but the artefact
// inside it did not lay out.
const MIN_VIGNETTE_HEIGHT = 140

test.describe("features page artefacts", () => {
  for (const width of WIDTHS) {
    test(`every vignette lays out at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto("/features")

      for (const section of SECTIONS) {
        // Scroll it in — the page fades content up on view, and an element
        // that has never been in view is still at opacity 0.
        await page.locator(`#${section}`).scrollIntoViewIfNeeded()

        const frame = page.locator(`#${section} [data-vignette]`)
        await expect(frame, `#${section} has a vignette`).toHaveCount(1)

        const h = await frame.evaluate(
          (el) => el.getBoundingClientRect().height
        )
        expect(
          h,
          `#${section} vignette is only ${Math.round(h)}px tall`
        ).toBeGreaterThan(MIN_VIGNETTE_HEIGHT)
      }

      for (const section of MEASURED_BOXES) {
        const box = page.locator(`#${section} [data-artefact-box]`)
        const fit = await box.evaluate((el) => {
          const scaled = el.firstElementChild as HTMLElement
          const b = el.getBoundingClientRect()
          const s = scaled.getBoundingClientRect()
          return {
            boxW: b.width,
            boxH: b.height,
            renderW: s.width,
            renderH: s.height,
          }
        })

        // A pixel of slack for sub-pixel rounding in the scale.
        expect(
          fit.renderW,
          `#${section} at ${width}px is ${Math.round(fit.renderW)}px wide in a ${Math.round(fit.boxW)}px box`
        ).toBeLessThanOrEqual(fit.boxW + 2)
        expect(
          fit.renderH,
          `#${section} at ${width}px is ${Math.round(fit.renderH)}px tall in a ${Math.round(fit.boxH)}px box`
        ).toBeLessThanOrEqual(fit.boxH + 2)

        // And not absurdly small — a box far larger than its content means
        // the constants drifted the other way and the artefact is floating
        // in a hole.
        expect(
          fit.renderH,
          `#${section} at ${width}px fills less than half its box`
        ).toBeGreaterThan(fit.boxH * 0.5)
      }

      // Nothing spills sideways.
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      )
      expect(overflow, "page scrolls horizontally").toBe(0)
    })
  }
})
