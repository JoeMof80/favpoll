import { test, expect } from "@playwright/test"

// Section ids follow the 2026-08-09 by-feature redesign. The live display's
// artefact moved to RoomVignette, which crops itself rather than scaling into
// a fixed box, so it is not one of these — this test is about the boxes whose
// sizes are MEASURED CONSTANTS.
//
// The features page shows real components — the wallet card, the guest
// page in a phone, and the live display in a TV — each laid out at its own
// natural size and scaled down into a fixed box.
//
// Those box sizes are MEASURED constants, and the thing they are measured
// against can move without them. The display is the live one: below lg its
// guest wall stops sitting beside the rankings and stacks under them, so the
// same 940-wide screen is ~1240px tall instead of ~700. Change the display's
// layout and the boxes go stale silently — the artefact does not clip
// (scaling ignores layout), it just bleeds over whatever follows.
//
// jsdom cannot catch this: it has no layout engine, so every rect is zero.
// It has to be a browser.

const ARTEFACTS = [
  { name: "wallet card", section: "stationery" },
  { name: "shared-fund phone", section: "shared-fund" },
  { name: "reveal phone", section: "reveal" },
] as const

// Widths that straddle the display's own breakpoints, since that is what
// moves its height: below sm, between sm and lg, and above lg.
const WIDTHS = [390, 700, 1280, 1512]

test.describe("features page artefacts", () => {
  for (const width of WIDTHS) {
    test(`each artefact fits its box at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto("/features")

      for (const { name, section } of ARTEFACTS) {
        // Scroll it in — the page fades content up on view, and an element
        // that has never been in view is still at opacity 0.
        await page.locator(`#${section}`).scrollIntoViewIfNeeded()

        const box = page.locator(`#${section} [data-artefact-box]`)
        await expect(box, `${name} box is present`).toHaveCount(1)

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
          `${name} at ${width}px is ${Math.round(fit.renderW)}px wide in a ${Math.round(fit.boxW)}px box`
        ).toBeLessThanOrEqual(fit.boxW + 2)
        expect(
          fit.renderH,
          `${name} at ${width}px is ${Math.round(fit.renderH)}px tall in a ${Math.round(fit.boxH)}px box`
        ).toBeLessThanOrEqual(fit.boxH + 2)

        // And not absurdly small — a box far larger than its content means
        // the constants drifted the other way and the artefact is floating
        // in a hole.
        expect(
          fit.renderH,
          `${name} at ${width}px fills less than half its box`
        ).toBeGreaterThan(fit.boxH * 0.5)
      }

      // The whole point of the fixed boxes is that nothing spills sideways.
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      )
      expect(overflow, "page scrolls horizontally").toBe(0)
    })
  }
})
