/**
 * scripts/demo-charity-logo.ts
 * ---------------------------------------------------------------------------
 * DEV ONLY, ONE-OFF. Puts a logo FILE the founder supplied on a charity
 * row, for a demo. Note this COPIES the image into our own storage,
 * which references/charity-profiles-2026-09-27.md decision 2 forbids for
 * a SCRAPED image ("taking a copy would be taking the image"). This is
 * not that case: the file was handed to us, and nothing here reaches
 * production, where a logo arrives at step 3 of onboarding from the
 * charity itself. Prefer the charity's own URL when there is one.
 *
 * Delete this script when the demos go.
 *
 *   cd apps/web
 *   pnpm tsx --env-file=.env.local ../../scripts/demo-charity-logo.ts \
 *     --number=216401 --file=/path/to/logo.png
 * ---------------------------------------------------------------------------
 */

import { readFileSync } from "node:fs"
import { extname } from "node:path"
import { createClient } from "@supabase/supabase-js"

const args = process.argv.slice(2)
const opt = (n: string) =>
  args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? null

const NUMBER = opt("number")
const FILE = opt("file")
const STAGING_REF = "eotqyintgusvzidymumb"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
if (!SUPABASE_URL.includes(STAGING_REF)) {
  console.error(`\n🚫  Dev only.\n    URL: ${SUPABASE_URL}\n`)
  process.exit(1)
}

const supabase = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
}

async function main() {
  if (!NUMBER || !FILE) {
    throw new Error("Give --number=<registered number> and --file=<path>.")
  }
  const ext = extname(FILE).toLowerCase()
  const contentType = TYPES[ext]
  if (!contentType) throw new Error(`Not an image I will upload: ${ext}`)

  const { data: charity, error: findError } = await supabase
    .from("charities")
    .select("id, name")
    .eq("registered_number", NUMBER)
    .single()
  if (findError || !charity) {
    throw new Error(`No charity ${NUMBER}: ${findError?.message}`)
  }

  const path = `seed/logo-${NUMBER}${ext}`
  const { error: uploadError } = await supabase.storage
    .from("protagonists")
    .upload(path, readFileSync(FILE), { contentType, upsert: true })
  if (uploadError) throw new Error(uploadError.message)

  const url = supabase.storage.from("protagonists").getPublicUrl(path)
    .data.publicUrl
  const { error: updateError } = await supabase
    .from("charities")
    .update({ logo_url: url })
    .eq("id", charity.id)
  if (updateError) throw new Error(updateError.message)

  console.log(`  ✓ ${charity.name}\n    ${url}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
