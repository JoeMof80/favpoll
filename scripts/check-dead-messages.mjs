// Guards against message keys that nothing renders. Every key in
// apps/web/messages/en-GB.json must be reachable from production source,
// either as a literal `t("some.key")` or through a template prefix such as
// t(`home.assure.${k}.label`). Run: node scripts/check-dead-messages.mjs
//
// Why: 20 keys outlived the copy they belonged to, including the whole
// landing.how.* set left behind when How It Works was reframed as the
// organiser's process, and landing.invariant, which a copy sweep edited for
// a line no component renders. A key referenced ONLY by a test or a story is
// counted dead — the test keeps it compiling, not visible.
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = new URL("..", import.meta.url).pathname
const MESSAGES = "apps/web/messages/en-GB.json"
const SCAN_DIRS = ["apps/web/app", "apps/web/components", "apps/web/lib"]
const SKIP =
  /node_modules|\.next|__tests__|\.test\.|\.stories\.|register-extract/

function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(join(ROOT, dir))
  } catch {
    return out
  }
  for (const entry of entries) {
    const rel = join(dir, entry)
    if (SKIP.test(rel)) continue
    const stat = statSync(join(ROOT, rel))
    if (stat.isDirectory()) walk(rel, out)
    else if (/\.tsx?$/.test(rel)) out.push(rel)
  }
  return out
}

const source = walk(SCAN_DIRS[0])
  .concat(walk(SCAN_DIRS[1]), walk(SCAN_DIRS[2]))
  .map((f) => readFileSync(join(ROOT, f), "utf8"))
  .join("\n")

// Literal first argument to t(), whether quoted or a template.
const literals = new Set(
  [...source.matchAll(/t\(\s*["'`]([^"'`]+)/g)].map((m) => m[1])
)
// t(`home.assure.${key}.label`) keeps every key under "home.assure." alive.
const prefixes = [...literals]
  .filter((l) => l.includes("${"))
  .map((l) => l.slice(0, l.indexOf("${")))
  .filter(Boolean)

const keys = Object.keys(JSON.parse(readFileSync(join(ROOT, MESSAGES), "utf8")))
const dead = keys.filter(
  (key) =>
    !literals.has(key) &&
    !prefixes.some((prefix) => key.startsWith(prefix)) &&
    !source.includes(`"${key}"`) &&
    !source.includes(`'${key}'`) &&
    !source.includes(`\`${key}\``)
)

if (dead.length > 0) {
  console.error(
    `Found ${dead.length} message key(s) that no production source renders.\n` +
      `Delete them from ${MESSAGES}, or render them:\n`
  )
  for (const key of dead) console.error("  " + key)
  process.exit(1)
}
console.log(
  `check-dead-messages: all ${keys.length} message keys are rendered.`
)
