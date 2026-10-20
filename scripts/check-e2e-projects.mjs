#!/usr/bin/env node
// A SPEC THAT MATCHES NO PLAYWRIGHT PROJECT, AND A PROJECT THAT MATCHES NO
// SPEC (#1129).
//
// playwright.config.ts names each project's specs by filename pattern, and
// Playwright does not complain when a pattern matches nothing: a run with
// no matching file reports success having executed zero tests. "No tests
// found" appears only when you name the file explicitly on the command
// line.
//
// That happened. #897 renamed reveal-after-pledge.spec.ts to
// note-after-pledge.spec.ts and left the `guest` project pointing at the
// old name, so from that merge until 2026-10-20 the guest pledge flow —
// the only end-to-end cover the money path has — never ran, and the
// advisory job stayed green throughout. Green-but-empty is worse than red,
// because red eventually gets looked at.
//
// THE RESOLUTION IS PLAYWRIGHT'S OWN, not a reimplementation of its glob
// matching: `playwright test --list` reports exactly what a run would
// execute. It starts no browser and no web server, so it is cheap enough
// for a gating job.

import { execFileSync } from "node:child_process"
import { readdirSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..")
const web = join(root, "apps/web")
const e2e = join(web, "e2e")

/** Every test file on disk: specs, plus the setup files projects depend on. */
function filesOnDisk(dir = e2e, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    // .auth holds credentials state, test-results holds output
    if (entry.isDirectory()) {
      if (!entry.name.startsWith(".") && entry.name !== "test-results")
        filesOnDisk(path, found)
    } else if (/\.(spec|setup)\.ts$/.test(entry.name)) {
      found.push(relative(e2e, path))
    }
  }
  return found
}

function playwrightResolution() {
  let raw
  try {
    raw = execFileSync(
      "pnpm",
      ["exec", "playwright", "test", "--list", "--reporter=json"],
      { cwd: web, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    )
  } catch (err) {
    console.error(
      "check-e2e-projects: could not list the Playwright suite.\n" +
        "This check needs `pnpm install` to have run in apps/web. It does\n" +
        "NOT need browsers — --list launches nothing.\n"
    )
    console.error(err.stderr || err.message)
    process.exit(2)
  }

  const report = JSON.parse(raw)
  const projects = report.config.projects.map((p) => p.name)
  const byProject = new Map(projects.map((name) => [name, new Set()]))
  const files = new Set()

  // EVERY SPEC CARRIES ITS OWN projectName, which is the authoritative
  // attribution — the suite tree's titles are file and describe names, and
  // reading projects out of them was a first guess that reported all four
  // projects empty.
  const walk = (suites) => {
    for (const suite of suites ?? []) {
      for (const spec of suite.specs ?? []) {
        if (spec.file) files.add(spec.file)
        for (const test of spec.tests ?? []) {
          if (spec.file) byProject.get(test.projectName)?.add(spec.file)
        }
      }
      walk(suite.suites)
    }
  }
  walk(report.suites)

  return { projects, byProject, files }
}

const onDisk = filesOnDisk()
const { projects, byProject, files } = playwrightResolution()

const orphanedSpecs = onDisk.filter((f) => !files.has(f)).sort()
const emptyProjects = projects.filter(
  (p) => (byProject.get(p)?.size ?? 0) === 0
)

if (orphanedSpecs.length === 0 && emptyProjects.length === 0) {
  console.log(
    `check-e2e-projects: ${onDisk.length} test files, ` +
      `${projects.length} projects, all matched.`
  )
  process.exit(0)
}

if (orphanedSpecs.length > 0) {
  console.error(
    "check-e2e-projects: these test files match NO project, so they never run:\n"
  )
  for (const f of orphanedSpecs) console.error(`  apps/web/e2e/${f}`)
  console.error(
    "\nAdd the file to a project's testMatch in apps/web/playwright.config.ts."
  )
}

if (emptyProjects.length > 0) {
  console.error(
    `\ncheck-e2e-projects: these projects match NO file, so they run empty` +
      ` and pass:\n`
  )
  for (const p of emptyProjects) console.error(`  ${p}`)
  console.error(
    "\nA project whose testMatch points at a file that no longer exists is\n" +
      "the #897 failure: it reports success having run nothing."
  )
}

process.exit(1)
