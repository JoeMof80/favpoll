// Records the homepage hero through to the note reveal, for the portfolio.
//
// Deliberately NOT a Playwright test: scripts/check-e2e-projects.mjs fails a
// spec in e2e/ that no project matches, and this is a one-off recording, not
// cover. Run it against a PRODUCTION build — the dev server's compile stalls
// show up as stutter in the capture.
//
//   pnpm build && pnpm exec next start -p 3005
//   node scripts/record-homepage.mjs            # → recordings/
//
// THE WINDOW IS MEASURED, NOT ASSUMED. STILL_BEAT reaches the note at
// 14.15s, but that clock starts when the hero becomes active — after
// hydration, which on a cold production start is several seconds after
// navigation. A first cut timed from `goto` ended with the demo still on the
// amount step and no note in the clip at all. So the script now WAITS for
// the confirmation to appear, records a few seconds past it, and cuts the
// window backwards from the moment it actually happened.
import { chromium } from "playwright"
import { mkdir, readdir, rename, rm } from "node:fs/promises"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import path from "node:path"

const run = promisify(execFile)
const BASE = process.env.RECORD_BASE_URL ?? "http://localhost:3005"
const OUT = path.resolve(import.meta.dirname, "..", "..", "..", "recordings")
const RAW = path.join(OUT, ".raw")
const SIZE = { width: 1280, height: 800 }
/** How long to keep rolling after the note has landed, so the clip ends on
 *  the finished note rather than mid-type. */
const AFTER_REVEAL_MS = 4_000
/** How much of the run-up to keep: the picker and the amount step. */
const LEAD_IN_S = 8
const CLIP_SECONDS = 12

await rm(RAW, { recursive: true, force: true })
await mkdir(RAW, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: SIZE,
  recordVideo: { dir: RAW, size: SIZE },
  // The capture should show the motion, not the no-motion fallback.
  reducedMotion: "no-preference",
  deviceScaleFactor: 2,
})
const page = await context.newPage()
const errors = []
page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
page.on("pageerror", (e) => errors.push(String(e)))

const t0 = Date.now()
await page.goto(BASE, { waitUntil: "networkidle" })
// The confirmation is the first thing the ceremony paints, and the note
// types under it over the following ~1.9s.
await page
  .getByText("Pledge confirmed", { exact: false })
  .first()
  .waitFor({ state: "visible", timeout: 60_000 })
const revealAt = (Date.now() - t0) / 1000
await page.waitForTimeout(AFTER_REVEAL_MS)
await context.close()
await browser.close()

const [raw] = (await readdir(RAW)).filter((f) => f.endsWith(".webm"))
if (!raw) throw new Error("no video captured")
const rawPath = path.join(RAW, raw)
const outPath = path.join(OUT, "homepage-hero-and-note.webm")

// Cut backwards from the reveal so the clip always contains it.
const clipFrom = Math.max(0, revealAt - LEAD_IN_S)
await run("ffmpeg", [
  "-y",
  "-ss",
  String(clipFrom.toFixed(2)),
  "-i",
  rawPath,
  "-t",
  String(CLIP_SECONDS),
  "-c:v",
  "libvpx-vp9",
  "-crf",
  "30",
  "-b:v",
  "0",
  "-an",
  outPath,
])
await rm(RAW, { recursive: true, force: true })

const { stdout } = await run("ffprobe", [
  "-v",
  "error",
  "-show_entries",
  "format=duration",
  "-of",
  "default=noprint_wrappers=1:nokey=1",
  outPath,
])
console.log(
  `note landed at ${revealAt.toFixed(1)}s; clip cut from ${clipFrom.toFixed(1)}s`
)
console.log(`recorded ${outPath}`)
console.log(
  `duration ${Number(stdout.trim()).toFixed(1)}s at ${SIZE.width}x${SIZE.height}`
)
console.log(
  errors.length ? `CONSOLE ERRORS (${errors.length}):` : "no console errors"
)
for (const e of errors) console.log("  -", e)
