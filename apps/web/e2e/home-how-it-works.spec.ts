import { test, expect } from "@playwright/test"

// HOW IT WORKS, ON A PHONE.
//
// Each beat carries its own medium on mobile (2026-08-17), and every one of
// those is a real object laid out at its real size and then transform-scaled
// down: the phone chassis is 414 wide, the keepsake's A4 sheet 794, the TV
// 940. A transform does not change the layout box, so all of that width is
// still there as far as layout is concerned.
//
// That is what broke here (2026-08-18). While the medium sat in normal flow it
// set the text column's MIN-CONTENT width, and a grid item cannot shrink below
// its min-content — so the column took the widest thing max-w-lg permits,
// 512px, inside a 342px track. Every beat's text wrapped at 512 and ran 146px
// past the right edge of a 390px phone, where the section's overflow-x-clip
// cut it off mid-word. The page did not scroll sideways and nothing threw:
// the copy was simply sliced, which is why it survived to a real device.
//
// The check is therefore NOT "does the page scroll horizontally" — it did not,
// even when badly broken. It is that the text and the media both sit inside
// the viewport.
//
// jsdom cannot catch this: it has no layout engine, so every rect is zero. It
// has to be a browser, at a real phone width.

// The seven beats, in order. Named rather than counted so a dropped beat
// fails here too.
const BEATS = [
  "card",
  "arriving",
  "selected",
  "amount-picked",
  "reveal",
  "room",
  "keepsake",
] as const

// Phone widths that matter: the narrowest phone still in use, the iPhone
// baseline the guest viewport is designed around, and a Pro Max. 320 is the
// tight one — the keepsake's scaled sheet is ~270 wide in a 272px column, so
// it is the width that catches a scale being nudged up.
const WIDTHS = [320, 390, 430]

// Sub-pixel slack. Layout lands on fractions at these scales and a strict
// > comparison would flake on rounding, not on a real regression.
const SLACK = 0.5

test.describe("home — how it works, on a phone", () => {
  for (const width of WIDTHS) {
    test(`every beat's text and medium fit at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto("/")

      const section = page.locator("#how")
      await section.scrollIntoViewIfNeeded()

      for (const key of BEATS) {
        const block = page.locator(`[data-beat="${key}"]`)
        await expect(block, `beat ${key} is on the page`).toHaveCount(1)

        // Scroll it in: the media mount client-side and the beats fade on
        // scroll, so a beat that has never been near the viewport may not
        // have laid out yet.
        await block.scrollIntoViewIfNeeded()

        // ── The text ──────────────────────────────────────────────────────
        // The body paragraph is the thing that was being clipped. Assert on
        // its own box rather than the block's: a block can be the right width
        // while its contents overflow it.
        const body = block.locator("p").nth(1)
        const textBox = await body.evaluate((el) => {
          const r = el.getBoundingClientRect()
          return { left: r.left, right: r.right }
        })
        expect(
          textBox.right,
          `beat ${key}: body text runs ${Math.round(
            textBox.right - width
          )}px past the right edge at ${width}px`
        ).toBeLessThanOrEqual(width + SLACK)
        expect(
          textBox.left,
          `beat ${key}: body text starts ${Math.round(textBox.left)}px left of the viewport`
        ).toBeGreaterThanOrEqual(-SLACK)

        // ── The medium ────────────────────────────────────────────────────
        // The CHILD of the positioning wrapper, not the wrapper itself. The
        // wrapper only centres; the scale sits on the medium inside it, and a
        // parent's rect does not shrink for a child's transform — so measuring
        // the wrapper reports the unscaled 940 and fails on a page that is
        // perfectly fine. Measuring the child reports the transformed box,
        // which is what a reader actually sees. (This distinction is the same
        // one the bug itself turned on, so it is worth being explicit about.)
        const media = block.locator("[data-beat-media] > *")
        await expect(media, `beat ${key} has its medium on mobile`).toHaveCount(
          1
        )
        const mediaBox = await media.evaluate((el) => {
          const r = el.getBoundingClientRect()
          return { left: r.left, right: r.right, width: r.width }
        })

        // It laid out at all — a collapsed medium is invisible inside its
        // well and would otherwise pass every containment check trivially.
        expect(
          mediaBox.width,
          `beat ${key}: medium collapsed to ${Math.round(mediaBox.width)}px wide`
        ).toBeGreaterThan(80)

        expect(
          mediaBox.right,
          `beat ${key}: medium runs ${Math.round(
            mediaBox.right - width
          )}px past the right edge at ${width}px`
        ).toBeLessThanOrEqual(width + SLACK)
        expect(
          mediaBox.left,
          `beat ${key}: medium starts ${Math.round(mediaBox.left)}px left of the viewport`
        ).toBeGreaterThanOrEqual(-SLACK)
      }
    })
  }
})
