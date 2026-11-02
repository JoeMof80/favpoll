/**
 * scripts/demo-portraits.ts
 * ---------------------------------------------------------------------------
 * DEV ONLY. Gives a demo favpoll the same generated portrait the seeded
 * cause favpolls wear (scripts/seed-portrait.ts): a green ground and
 * three soft discs placed by a hash of its name, so no two look alike
 * and nothing is claimed about a real group. A real photograph of a real
 * club is theirs to give us, not ours to find.
 *
 * Delete this script when the demos go.
 *
 *   cd apps/web
 *   # every favpoll in an appeal
 *   pnpm tsx --env-file=.env.local ../../scripts/demo-portraits.ts --appeal=<slug>
 *   # or named favpolls
 *   pnpm tsx --env-file=.env.local ../../scripts/demo-portraits.ts <id> [<id>…]
 *
 * SAFETY: refuses to run against anything but the staging/dev project.
 * ---------------------------------------------------------------------------
 */

import { createClient } from "@supabase/supabase-js"
import { createHash } from "node:crypto"
import { encodePng, makePortrait, REGISTER_RGB } from "./seed-portrait"

const args = process.argv.slice(2)
const APPEAL_SLUG = args
  .find((a) => a.startsWith("--appeal="))
  ?.slice("--appeal=".length)
const IDS = args.filter((a) => !a.startsWith("--"))
const WAVEFORM = args.includes("--waveform")
const STAGING_REF = "eotqyintgusvzidymumb"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
if (!SUPABASE_URL.includes(STAGING_REF)) {
  console.error(
    `\n🚫  Dev only.\n    URL: ${SUPABASE_URL}\n    Expected ref: ${STAGING_REF}\n`
  )
  process.exit(1)
}

const supabase = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// A WAVEFORM, for a favpoll about songs. The disc portrait says nothing
// about what the favpoll is; forty-four bars around a centre line at
// least say music. Heights come from a hash of the name under an
// envelope that swells in the middle, so it reads as a performance
// rather than noise, and the taller a bar the deeper its tone. Still
// plainly a graphic: nobody could mistake it for a photograph of a band,
// which is the point until there is a real one.
function makeWaveform(name: string, register: string): Uint8Array {
  const SIZE = 512
  const BARS = 44
  const [r0, g0, b0] = REGISTER_RGB[register] ?? REGISTER_RGB.cause
  const h = createHash("sha256").update(`waveform:${name}`).digest()
  const u = (i: number) => h[i % h.length] / 255

  const ground = [
    Math.round(255 - (255 - r0) * 0.08),
    Math.round(255 - (255 - g0) * 0.08),
    Math.round(255 - (255 - b0) * 0.08),
  ]
  const pitch = SIZE / BARS
  const barWidth = Math.round(pitch * 0.62)

  // Each bar: a half-height either side of the centre line, and the tone
  // it is drawn in, deepest at full height.
  const bars = Array.from({ length: BARS }, (_, i) => {
    const envelope = 0.35 + 0.65 * Math.sin((Math.PI * (i + 0.5)) / BARS)
    const amp = (0.12 + 0.88 * u(i * 2)) * envelope
    const t = 0.55 - 0.45 * amp // deep when tall, pale when short
    return {
      x0: Math.round(i * pitch + (pitch - barWidth) / 2),
      half: Math.max(3, Math.round((SIZE * 0.42 * amp) / 2)),
      rgb: [
        Math.round(r0 + (255 - r0) * t),
        Math.round(g0 + (255 - g0) * t),
        Math.round(b0 + (255 - b0) * t),
      ],
    }
  })

  const mid = SIZE / 2
  const raw = new Uint8Array((SIZE * 3 + 1) * SIZE)
  for (let y = 0; y < SIZE; y++) {
    raw[y * (SIZE * 3 + 1)] = 0 // filter: none
    for (let x = 0; x < SIZE; x++) {
      let [r, g, b] = ground
      const bar = bars[Math.floor(x / pitch)]
      if (
        bar &&
        x >= bar.x0 &&
        x < bar.x0 + barWidth &&
        Math.abs(y - mid) <= bar.half
      ) {
        ;[r, g, b] = bar.rgb
      }
      const o = y * (SIZE * 3 + 1) + 1 + x * 3
      raw[o] = r
      raw[o + 1] = g
      raw[o + 2] = b
    }
  }
  return encodePng(raw, SIZE)
}

async function main() {
  if (!APPEAL_SLUG && IDS.length === 0) {
    throw new Error("Give --appeal=<slug> or one or more favpoll ids.")
  }

  let query = supabase.from("favpolls").select("id, cause_label, photo_url")
  if (APPEAL_SLUG) {
    const { data: appeal, error: appealError } = await supabase
      .from("appeals")
      .select("id")
      .eq("slug", APPEAL_SLUG)
      .single()
    if (appealError || !appeal) {
      throw new Error(`No appeal ${APPEAL_SLUG}: ${appealError?.message}`)
    }
    query = query.eq("appeal_id", appeal.id)
  } else {
    query = query.in("id", IDS)
  }

  const { data: favpolls, error } = await query.order("created_at")
  if (error) throw new Error(error.message)
  if (!favpolls?.length) throw new Error("Nothing matched.")

  for (const f of favpolls) {
    const name = f.cause_label ?? f.id
    const path = `seed/${f.id}.png`
    const { error: uploadError } = await supabase.storage
      .from("protagonists")
      .upload(path, (WAVEFORM ? makeWaveform : makePortrait)(name, "cause"), {
        contentType: "image/png",
        upsert: true,
      })
    if (uploadError) {
      console.error(`  ✗ ${name}: ${uploadError.message}`)
      continue
    }
    const url = supabase.storage.from("protagonists").getPublicUrl(path)
      .data.publicUrl
    const { error: updateError } = await supabase
      .from("favpolls")
      .update({ photo_url: url })
      .eq("id", f.id)
    if (updateError) {
      console.error(`  ✗ ${name}: ${updateError.message}`)
      continue
    }
    console.log(`  ✓ ${name}\n    ${url}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
