import { describe, it, expect } from "vitest"
import {
  veilForBand,
  MAX_VEIL,
  FALLBACK_VEIL,
  TARGET_LUMA,
} from "@/lib/image-veil"

/** A flat image of one colour, as getImageData would hand it over. */
function flat(w: number, h: number, r: number, g = r, b = r) {
  const px = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    px[i * 4] = r
    px[i * 4 + 1] = g
    px[i * 4 + 2] = b
    px[i * 4 + 3] = 255
  }
  return px
}

/** Alternating black and white columns: same mean as mid grey, far busier. */
function stripes(w: number, h: number) {
  const px = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = Math.floor(x / 4) % 2 === 0 ? 0 : 255
      const i = (y * w + x) * 4
      px[i] = v
      px[i + 1] = v
      px[i + 2] = v
      px[i + 3] = 255
    }
  }
  return px
}

const W = 64
const H = 64
const BAND = { top: 16, bottom: 48 }

describe("veilForBand", () => {
  it("asks for nothing on a band already brighter than the target", () => {
    expect(veilForBand(flat(W, H, 255), W, H, BAND)).toBe(0)
  })

  // The property that actually matters, and the reason the number is
  // computed rather than chosen: whatever comes back must lift the dark
  // end of the band to something the hero's ink can sit on.
  it("always lifts the dark end to the readable target", () => {
    for (const v of [0, 20, 60, 128, 170]) {
      const veil = veilForBand(flat(W, H, v), W, H, BAND)
      const lifted = v + (255 - v) * veil
      expect(lifted, `luma ${v}`).toBeGreaterThanOrEqual(TARGET_LUMA - 1)
    }
  })

  it("needs no more than three quarters of a veil, even on black", () => {
    expect(veilForBand(flat(W, H, 0), W, H, BAND)).toBeCloseTo(0.745, 2)
  })

  it("asks for more of a dark band than a light one", () => {
    const dark = veilForBand(flat(W, H, 60), W, H, BAND)
    const light = veilForBand(flat(W, H, 170), W, H, BAND)
    expect(dark).toBeGreaterThan(light)
    expect(light).toBeGreaterThan(0)
  })

  // The whole reason the mean is not enough: bunting and a flat wall can
  // share an average and not share a chance of being read over.
  it("asks for more of a busy band than a flat one of the same mean", () => {
    const busy = veilForBand(stripes(W, H), W, H, BAND)
    const calm = veilForBand(flat(W, H, 128), W, H, BAND)
    expect(busy).toBeGreaterThan(calm)
  })

  // One dark railing in the corner must not decide the whole favpoll,
  // which is why the dark end is a percentile and not the minimum.
  it("is not decided by a few dark pixels", () => {
    const px = flat(W, H, 200)
    for (let y = 16; y < 18; y++) {
      for (let x = 0; x < 2; x++) {
        const i = (y * W + x) * 4
        px[i] = px[i + 1] = px[i + 2] = 0
      }
    }
    expect(veilForBand(px, W, H, BAND)).toBe(
      veilForBand(flat(W, H, 200), W, H, BAND)
    )
  })

  it("measures the band it is given, not the whole image", () => {
    // Dark on top, light below: the two bands must disagree.
    const px = new Uint8ClampedArray(W * H * 4)
    for (let y = 0; y < H; y++) {
      const v = y < H / 2 ? 30 : 240
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4
        px[i] = px[i + 1] = px[i + 2] = v
        px[i + 3] = 255
      }
    }
    const top = veilForBand(px, W, H, { top: 0, bottom: 30 })
    const bottom = veilForBand(px, W, H, { top: 34, bottom: 64 })
    expect(top).toBeGreaterThan(bottom)
  })

  it("falls back rather than guessing when the band is empty or outside", () => {
    expect(veilForBand(flat(W, H, 255), W, H, { top: 40, bottom: 40 })).toBe(
      FALLBACK_VEIL
    )
    expect(veilForBand(flat(W, H, 255), W, H, { top: 500, bottom: 600 })).toBe(
      FALLBACK_VEIL
    )
    expect(veilForBand(new Uint8ClampedArray(0), 0, 0, BAND)).toBe(
      FALLBACK_VEIL
    )
  })

  it("never returns more than the maximum or less than nothing", () => {
    for (const v of [0, 10, 60, 128, 200, 255]) {
      const veil = veilForBand(flat(W, H, v), W, H, BAND)
      expect(veil).toBeGreaterThanOrEqual(0)
      expect(veil).toBeLessThanOrEqual(MAX_VEIL)
    }
  })
})
