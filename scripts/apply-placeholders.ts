/**
 * apply-placeholders.ts
 *
 * Reads all 6 regenerated-placeholder batch files, builds a single combined
 * map (asserting no duplicate title across batches), then rewrites the
 * `placeholders: { … }` block for every topic in seed.ts with the five
 * register-keyed entries from that map.
 *
 * Run with:  pnpm --filter @favpoll/web exec tsx ../../scripts/apply-placeholders.ts
 */

import fs from "node:fs"
import { regeneratedPlaceholders } from "./placeholders-regenerated"
import { regeneratedPlaceholdersBatch2 } from "./placeholders-regenerated-2"
import { regeneratedPlaceholdersBatch3 } from "./placeholders-regenerated-3"
import { regeneratedPlaceholdersBatch4 } from "./placeholders-regenerated-4"
import { regeneratedPlaceholdersBatch5 } from "./placeholders-regenerated-5"
import { regeneratedPlaceholdersBatch6 } from "./placeholders-regenerated-6"

// ---------------------------------------------------------------------------
// 1. Build combined map — fail loudly on duplicate titles
// ---------------------------------------------------------------------------

type Ph = { about: string; reveal: string }
const combined: Record<string, Record<string, Ph>> = {}

const batchNames = [
  "regenerated",
  "regenerated-2",
  "regenerated-3",
  "regenerated-4",
  "regenerated-5",
  "regenerated-6",
]
const batches = [
  regeneratedPlaceholders,
  regeneratedPlaceholdersBatch2,
  regeneratedPlaceholdersBatch3,
  regeneratedPlaceholdersBatch4,
  regeneratedPlaceholdersBatch5,
  regeneratedPlaceholdersBatch6,
]

for (let i = 0; i < batches.length; i++) {
  for (const [title, data] of Object.entries(batches[i])) {
    if (combined[title]) {
      throw new Error(
        `Duplicate topic title "${title}" found in batch ${batchNames[i]} (already seen in an earlier batch)`
      )
    }
    combined[title] = data as Record<string, Ph>
  }
}

console.log(`Combined map built: ${Object.keys(combined).length} topics`)

// ---------------------------------------------------------------------------
// 2. Read seed.ts and locate all topic titles
// ---------------------------------------------------------------------------

const seedPath = new URL("./seed.ts", import.meta.url).pathname
let src = fs.readFileSync(seedPath, "utf8")

// Find all `title: "X"` occurrences inside the topics array only
const topicsStart = src.indexOf("const topics: TopicSeed[]")
const topicsEnd = src.indexOf("\nconst topicItems")
if (topicsStart === -1 || topicsEnd === -1) {
  throw new Error("Could not locate const topics / const topicItems boundaries in seed.ts")
}
const topicsSrc = src.slice(topicsStart, topicsEnd)

const titleRe = /title:\s*"([^"]+)"/g
const titles: string[] = []
let m: RegExpExecArray | null
while ((m = titleRe.exec(topicsSrc)) !== null) {
  titles.push(m[1])
}

// ---------------------------------------------------------------------------
// 3. Validate total coverage
// ---------------------------------------------------------------------------

const combinedSet = new Set(Object.keys(combined))
const seedMisses = titles.filter((t) => !combinedSet.has(t))
if (seedMisses.length > 0) {
  throw new Error(
    `Seed topics missing from combined placeholder map:\n${seedMisses.map((t) => `  "${t}"`).join("\n")}`
  )
}

const seedSet = new Set(titles)
const mapExtras = [...combinedSet].filter((t) => !seedSet.has(t))
if (mapExtras.length > 0) {
  console.log(
    `Note: ${mapExtras.length} topics in the combined map are not yet in seed.ts (future topics):`
  )
  mapExtras.forEach((t) => console.log(`  "${t}"`))
}

// ---------------------------------------------------------------------------
// 4. Replace placeholder blocks in seed.ts (process in reverse to preserve offsets)
// ---------------------------------------------------------------------------

// Re-run to get absolute positions in the full src string
const titleReAbs = /title:\s*"([^"]+)"/g
titleReAbs.lastIndex = topicsStart
const topicPositions: Array<{ pos: number; title: string }> = []
while ((m = titleReAbs.exec(src)) !== null) {
  if (m.index >= topicsEnd) break
  topicPositions.push({ pos: m.index, title: m[1] })
}

// Process in reverse so positions remain valid as we splice
for (let i = topicPositions.length - 1; i >= 0; i--) {
  const { pos, title } = topicPositions[i]
  const data = combined[title]
  if (!data) continue // already warned above

  // Find the `placeholders:` keyword after this title
  const phKeyword = src.indexOf("placeholders:", pos)
  // Guard: don't cross into the next topic's region
  const nextPos =
    i + 1 < topicPositions.length ? topicPositions[i + 1].pos : topicsEnd
  if (phKeyword === -1 || phKeyword > nextPos) {
    console.warn(`  ⚠ No placeholders block found for "${title}" — skipping`)
    continue
  }

  // Find the opening brace of the placeholder object
  const braceOpen = src.indexOf("{", phKeyword)
  if (braceOpen === -1 || braceOpen > nextPos) continue

  // Walk to the matching closing brace
  let depth = 0
  let braceClose = -1
  for (let j = braceOpen; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") {
      depth--
      if (depth === 0) {
        braceClose = j
        break
      }
    }
  }
  if (braceClose === -1) continue

  // Generate the replacement block
  const replacement = buildBlock(data)

  src =
    src.slice(0, braceOpen) +
    replacement +
    src.slice(braceClose + 1)
}

// ---------------------------------------------------------------------------
// 5. Write updated seed.ts
// ---------------------------------------------------------------------------

fs.writeFileSync(seedPath, src)
console.log(`✓ seed.ts updated — ${titles.length} topics processed`)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeStr(s: string): string {
  // Escape backslashes first, then double quotes, then control chars
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")
}

function buildBlock(data: Record<string, Ph>): string {
  // 6-space indent for register key, 8-space for about/reveal, 10-space for string
  const regs = [
    "remembering",
    "celebrating_one",
    "celebrating_many",
    "cause",
    "neutral",
  ] as const
  const lines: string[] = ["{"]
  for (const reg of regs) {
    const ph = data[reg]
    if (!ph) continue
    const about = escapeStr(ph.about)
    const reveal = escapeStr(ph.reveal)
    lines.push(`      ${reg}: {`)
    lines.push(`        about:`)
    lines.push(`          "${about}",`)
    lines.push(`        reveal:`)
    lines.push(`          "${reveal}",`)
    lines.push(`      },`)
  }
  lines.push("    }")
  return lines.join("\n")
}
