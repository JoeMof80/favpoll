// HOW MUCH TO LIGHTEN A PHOTO SO TEXT STAYS READABLE ON IT.
//
// The hero's ink is dark on light by design (#587/#588), so a banner
// photograph behind the hero has to be lightened rather than darkened.
// A fixed veil cannot work: the strength that lets you see a bright hall
// on a cloudy day leaves the name unreadable on a dark one, and the
// strength that saves the dark one wipes the bright one out. Organisers
// upload photographs nobody vets, so the veil has to be measured from
// the photograph itself.
//
// Measured where it matters. Not the whole image — only the band the
// text will actually cover. The top of a banner is usually sky and the
// bottom is usually the subject, and a mean over both describes neither.
//
// Two numbers come out of that band:
//
//   the DARK END, as the 10th percentile rather than the minimum, so one
//   black railing in the corner does not decide the whole favpoll; and
//
//   the BUSYNESS, as the standard deviation, because text fails on
//   bunting long before it fails on a flat wall of the same average
//   brightness. Busy bands ask for a higher target.
//
// Then it is arithmetic. A white veil at strength v turns luma L into
// L + (255 - L) * v, so the v that lifts the dark end to the target is
// (target - dark) / (255 - dark). Clamped, because a veil of 1 is a
// white rectangle and at that point the photograph should not be there.
//
// Runs in the BROWSER at upload, on the canvas the crop overlay already
// has — no image decoding on the server and no new dependency. The
// number travels with the photo and is stored beside it, so the page
// never measures anything at render.

/** The strip of the image the text will cover, in image pixels. */
export type VeilBand = { top: number; bottom: number }

/** Luma the dark end must reach for the hero's ink to hold. 190/255 is
 *  about 4.5:1 against the foreground, the WCAG AA floor for body text. */
export const TARGET_LUMA = 190
/** A busy band needs more than a flat one of the same brightness. Capped
 *  so a high-contrast photo cannot drive the target past white. */
const BUSYNESS_WEIGHT = 0.35
const BUSYNESS_CAP = 40
/** Past this the photograph is gone and the veil is just a white box. */
export const MAX_VEIL = 0.92
/** What an unmeasurable image gets: safe, not pretty. */
export const FALLBACK_VEIL = 0.85

/** Rec. 709 luma. Perceptual enough for a threshold, and cheap. */
function luma(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const i = Math.min(
    sorted.length - 1,
    Math.max(0, Math.round(p * (sorted.length - 1)))
  )
  return sorted[i]
}

/**
 * The veil strength (0–1) for the band of `pixels` the text will cover.
 *
 * `pixels` is RGBA, as `CanvasRenderingContext2D.getImageData` returns it.
 * Returns FALLBACK_VEIL when the band is empty or falls outside the image,
 * because a photo we could not read is not a photo we should trust.
 */
export function veilForBand(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  band: VeilBand
): number {
  const top = Math.max(0, Math.floor(band.top))
  const bottom = Math.min(height, Math.ceil(band.bottom))
  if (!(width > 0 && height > 0) || bottom <= top) return FALLBACK_VEIL

  // Every 4th pixel each way: 16x fewer samples, same answer to a
  // rounding error, and it keeps a 4000px phone photo off the main
  // thread for longer than a frame.
  const STEP = 4
  const lumas: number[] = []
  let sum = 0
  for (let y = top; y < bottom; y += STEP) {
    for (let x = 0; x < width; x += STEP) {
      const i = (y * width + x) * 4
      const l = luma(pixels[i], pixels[i + 1], pixels[i + 2])
      lumas.push(l)
      sum += l
    }
  }
  if (lumas.length === 0) return FALLBACK_VEIL

  const mean = sum / lumas.length
  const variance =
    lumas.reduce((acc, l) => acc + (l - mean) * (l - mean), 0) / lumas.length
  const busyness = Math.min(BUSYNESS_CAP, Math.sqrt(variance))

  lumas.sort((a, b) => a - b)
  const dark = percentile(lumas, 0.1)

  const target = TARGET_LUMA + busyness * BUSYNESS_WEIGHT
  if (dark >= target) return 0

  const veil = (target - dark) / (255 - dark)
  return Math.min(MAX_VEIL, Math.max(0, Number(veil.toFixed(3))))
}
