#!/usr/bin/env node
// scripts/component-tree.mjs — regenerate references/COMPONENT_TREE.md from source.
//
//   node scripts/component-tree.mjs            # writes the file
//   node scripts/component-tree.mjs --check    # exits 1 if the file is stale
//
// Walks apps/web (app/, components/, lib/, hooks/) and packages/*, follows
// static imports (`@/…`, `@favpoll/…`, relative), and prints, per route,
// the tree of local modules it renders. Markers:  * story exists,
// ⚠ no production importer (only tests/stories or nothing),  ↑ already
// expanded above (shared subtree — see its own section).
// Server actions, route handlers and lib/ are listed under each route but
// not expanded (their imports are data plumbing, not UI).
import fs from "node:fs"
import path from "node:path"

const ROOT = path.resolve(new URL("..", import.meta.url).pathname)
const WEB = path.join(ROOT, "apps/web")
const OUT = path.join(ROOT, "references/COMPONENT_TREE.md")
const EXTS = [".tsx", ".ts", "/index.tsx", "/index.ts"]
const SKIP_DIR = /node_modules|\.next|__tests__|register-extract|\.storybook/

const files = []
;(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (SKIP_DIR.test(p)) continue
    if (e.isDirectory()) walk(p)
    else if (/\.(tsx|ts)$/.test(e.name)) files.push(p)
  }
})(WEB)
for (const pkg of fs.readdirSync(path.join(ROOT, "packages"))) {
  const src = path.join(ROOT, "packages", pkg)
  if (fs.existsSync(src) && fs.statSync(src).isDirectory())
    (function walk(d) {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name)
        if (SKIP_DIR.test(p) || /dist/.test(p)) continue
        if (e.isDirectory()) walk(p)
        else if (/\.(tsx|ts)$/.test(e.name)) files.push(p)
      }
    })(src)
}

const rel = (p) => path.relative(ROOT, p).replace(/^apps\/web\//, "")
const isStory = (p) => /\.stories\.tsx?$/.test(p)
const isTest = (p) => /\.test\.tsx?$/.test(p) || /__tests__/.test(p)
const resolveImport = (from, spec) => {
  let base
  if (spec.startsWith("@/")) base = path.join(WEB, spec.slice(2))
  else if (spec.startsWith("@favpoll/"))
    base = path.join(ROOT, "packages", spec.slice(9))
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec)
  else return null
  for (const ext of ["", ...EXTS]) {
    const cand = base + ext
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) return cand
  }
  return null
}

// import graph
const imports = new Map() // file -> Set(file)
const importers = new Map() // file -> Set(file)
for (const f of files) {
  const src = fs.readFileSync(f, "utf8")
  const set = new Set()
  for (const m of src.matchAll(
    /(?:^|\n)\s*(?:import|export)\s[^;]*?from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g
  )) {
    const r = resolveImport(f, m[1] ?? m[2])
    if (r && r !== f) set.add(r)
  }
  imports.set(f, set)
  for (const t of set)
    (importers.get(t) ?? importers.set(t, new Set()).get(t)).add(f)
}

const stories = new Set()
for (const f of files)
  if (isStory(f)) for (const t of imports.get(f)) stories.add(t)
const prodImporters = (f) =>
  [...(importers.get(f) ?? [])].filter((i) => !isStory(i) && !isTest(i))
const isComponent = (f) => /\/components\//.test(f) && !isStory(f) && !isTest(f)
const isRoute = (f) =>
  /\/app\/.*\/page\.tsx$/.test(f) ||
  /\/app\/page\.tsx$/.test(f) ||
  /\/app\/.*layout\.tsx$/.test(f)
const kind = (f) => {
  const r = rel(f)
  if (/^app\/.*\/route\.ts$/.test(r)) return "route handler"
  if (/\/actions\.ts$|^lib\/actions\//.test(r)) return "server action"
  if (/^lib\//.test(r) || /^hooks\//.test(r)) return "lib"
  if (/^packages\//.test(r)) return "package"
  return "component"
}
const label = (f) => {
  const r = rel(f).replace(/\/index\.tsx?$/, "/")
  return `${r}${stories.has(f) ? " *" : ""}${isComponent(f) && prodImporters(f).length === 0 ? " ⚠" : ""}`
}

// shared subtrees: components with 3+ distinct production importers, expanded once in their own section
const shared = files
  .filter(
    (f) =>
      isComponent(f) &&
      prodImporters(f).length >= 3 &&
      (imports.get(f)?.size ?? 0) >= 2
  )
  .sort((a, b) => prodImporters(b).length - prodImporters(a).length)
const sharedSet = new Set(shared)

function tree(f, depth, seen, lines, prefix = "  ", top = false) {
  const kids = [...(imports.get(f) ?? [])]
    .filter((k) => kind(k) === "component" || kind(k) === "package" || top)
    .sort((a, b) => rel(a).localeCompare(rel(b)))
  for (const k of kids) {
    const kk = kind(k)
    if (kk === "lib" || kk === "server action" || kk === "route handler") {
      if (top) lines.push(`${prefix}→ ${rel(k)}  (${kk})`)
      continue
    }
    if (sharedSet.has(k) && !top) {
      lines.push(`${prefix}→ ${label(k)}  ↑`)
      continue
    }
    if (seen.has(k)) {
      lines.push(`${prefix}→ ${label(k)}  ↑`)
      continue
    }
    lines.push(`${prefix}→ ${label(k)}`)
    seen.add(k)
    if (depth > 0) tree(k, depth - 1, seen, lines, prefix + "    ")
  }
}

const out = []
const today = new Date().toISOString().slice(0, 10)
out.push(
  `# Component Tree`,
  ``,
  `Generated ${today} by \`node scripts/component-tree.mjs\` — do not edit by hand; rerun it (CI: \`--check\`).`,
  ``,
  `## Legend`,
  ``,
  "```",
  `→  imports / renders`,
  `*  Storybook story exists`,
  `⚠  no production importer (only tests, stories, or nothing)`,
  `↑  already expanded above, or a shared subtree (see its section)`,
  "```",
  ``,
  `Counts: ${files.filter(isRoute).filter((f) => /page\.tsx$/.test(f)).length} routes · ${files.filter(isComponent).length} component files · ${stories.size} with stories · ${files.filter((f) => isComponent(f) && prodImporters(f).length === 0).length} unused in production`,
  ``,
  `---`,
  ``
)

const routes = files
  .filter((f) => /\/app\//.test(f) && /(page|layout)\.tsx$/.test(f))
  .sort((a, b) => rel(a).localeCompare(rel(b)))
out.push(`## Routes`, ``)
for (const r of routes) {
  const lines = []
  tree(r, 3, new Set([r]), lines, "  ", true)
  out.push(`### \`${rel(r)}\``, ``, "```", rel(r), ...lines, "```", ``)
}

out.push(
  `---`,
  ``,
  `## Shared subtrees`,
  ``,
  `Components with three or more production importers, expanded once.`,
  ``
)
for (const s of shared) {
  const lines = []
  tree(s, 3, new Set([s]), lines)
  out.push(
    `### \`${rel(s)}\` — used by ${prodImporters(s).length}`,
    ``,
    "```",
    label(s),
    ...lines,
    "```",
    ``
  )
}

const prims = files
  .filter((f) => /components\/ui\//.test(f) && isComponent(f))
  .sort((a, b) => rel(a).localeCompare(rel(b)))
out.push(
  `---`,
  ``,
  `## UI primitives (\`components/ui/\`)`,
  ``,
  "```",
  ...prims.map((p) => `${label(p)}  ← ${prodImporters(p).length}`),
  "```",
  ``
)

const unused = files
  .filter((f) => isComponent(f) && prodImporters(f).length === 0)
  .sort((a, b) => rel(a).localeCompare(rel(b)))
out.push(
  `---`,
  ``,
  `## Unused in production ⚠`,
  ``,
  unused.length ? "```\n" + unused.map(rel).join("\n") + "\n```" : "(none)",
  ``
)

const text = out.join("\n") + "\n"
if (process.argv.includes("--check")) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : ""
  const strip = (s) => s.replace(/^Generated \d{4}-\d{2}-\d{2}/m, "Generated")
  if (strip(cur) !== strip(text)) {
    console.error(
      "references/COMPONENT_TREE.md is stale — run node scripts/component-tree.mjs"
    )
    process.exit(1)
  }
  console.log("component tree up to date")
} else {
  fs.writeFileSync(OUT, text)
  console.log(
    `wrote ${rel(OUT)}: ${text.split("\n").length} lines, ${routes.length} routes, ${shared.length} shared subtrees, ${unused.length} unused`
  )
}
