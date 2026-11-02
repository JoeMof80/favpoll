/**
 * scripts/seed-portrait.ts
 * ---------------------------------------------------------------------------
 * The abstract portrait every seeded favpoll wears. Lifted out of
 * seed-stories.ts on 2026-10-29 so a second script can draw the same
 * image: seed-stories.ts runs its seed on import, so importing it to
 * borrow one function is not an option.
 * ---------------------------------------------------------------------------
 */

import { createHash } from "node:crypto"
import { deflateSync } from "node:zlib"

// Every real favpoll has a photo; a seeded one had the initials tile, so
// the shelf read as a demo (founder, 2026-09-24). Each seeded favpoll gets
// an abstract portrait in its register colour: a tinted ground and three
// soft discs placed by a hash of the name. Drawn as a raster (no image
// library in scope) and uploaded by the caller to the same public bucket
// real photos use, so photo_url is an ordinary URL for the hero AND the OG
// image (Satori renders PNG; it would not render an SVG data URI).
export const REGISTER_RGB: Record<string, [number, number, number]> = {
  remembering: [91, 79, 207], // memorial purple
  celebrating_one: [192, 57, 123], // celebration magenta
  celebrating_many: [192, 57, 123],
  cause: [46, 139, 106], // fundraiser green
}

function crc32(buf: Uint8Array): number {
  let c = ~0
  for (const b of buf) {
    c ^= b
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}
function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const len = new Uint8Array(4)
  new DataView(len.buffer).setUint32(0, data.length)
  const body = new Uint8Array(type.length + data.length)
  body.set(Buffer.from(type), 0)
  body.set(data, type.length)
  const crc = new Uint8Array(4)
  new DataView(crc.buffer).setUint32(0, crc32(body))
  return Buffer.concat([len, body, crc])
}

/** A 512×512 PNG portrait, deterministic for (name, register). */
export function makePortrait(name: string, register: string): Uint8Array {
  const SIZE = 512
  const [r0, g0, b0] = REGISTER_RGB[register] ?? REGISTER_RGB.celebrating_one
  const h = createHash("sha256").update(`${register}:${name}`).digest()
  const u = (i: number) => h[i % h.length] / 255
  // Ground: the register at a whisper. Discs: three tones of the register,
  // from deep to pale, each with its own alpha, placed by the hash.
  const ground = [
    Math.round(255 - (255 - r0) * 0.1),
    Math.round(255 - (255 - g0) * 0.1),
    Math.round(255 - (255 - b0) * 0.1),
  ]
  const discs = [0, 1, 2].map((i) => {
    const t = 0.15 + i * 0.35 // 0.15 deep, 0.5 mid, 0.85 pale
    return {
      cx: SIZE * (0.2 + 0.6 * u(i * 3)),
      cy: SIZE * (0.2 + 0.6 * u(i * 3 + 1)),
      r: SIZE * (0.22 + 0.2 * u(i * 3 + 2)),
      rgb: [
        Math.round(r0 + (255 - r0) * t),
        Math.round(g0 + (255 - g0) * t),
        Math.round(b0 + (255 - b0) * t),
      ],
      a: 0.85 - i * 0.2,
    }
  })
  const raw = new Uint8Array((SIZE * 3 + 1) * SIZE)
  for (let y = 0; y < SIZE; y++) {
    raw[y * (SIZE * 3 + 1)] = 0 // filter: none
    for (let x = 0; x < SIZE; x++) {
      let [r, g, b] = ground
      for (const d of discs) {
        const dx = x - d.cx,
          dy = y - d.cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        // Soft edge over the last 6px so the discs don't alias.
        const cover = Math.max(0, Math.min(1, (d.r - dist) / 6)) * d.a
        if (cover > 0) {
          r = r + (d.rgb[0] - r) * cover
          g = g + (d.rgb[1] - g) * cover
          b = b + (d.rgb[2] - b) * cover
        }
      }
      const o = y * (SIZE * 3 + 1) + 1 + x * 3
      raw[o] = r
      raw[o + 1] = g
      raw[o + 2] = b
    }
  }
  return encodePng(raw, SIZE)
}

/** A square 8-bit RGB PNG from raw scanlines, each already prefixed with
 *  its filter byte. Exported so another script can draw its own image
 *  without a second copy of the chunk plumbing. */
export function encodePng(raw: Uint8Array, size: number): Uint8Array {
  const ihdr = new Uint8Array(13)
  const dv = new DataView(ihdr.buffer)
  dv.setUint32(0, size)
  dv.setUint32(4, size)
  ihdr[8] = 8
  ihdr[9] = 2 // 8-bit RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", new Uint8Array(0)),
  ])
}
