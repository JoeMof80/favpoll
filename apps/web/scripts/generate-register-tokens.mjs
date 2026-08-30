// The colour system, generated (2026-08-30 — the register-palette decision,
// see references/PROJECT.md → Design System).
//
// favpoll carries a flexible identity: ONE mark, wordmark, type and voice, and
// FOUR palettes — a blue default, and purple / magenta / green for the
// memorial / celebration / fundraiser registers. Every palette is the same
// recipe (the original purple tokens expressed as functions of four numbers:
// hue, chroma, primary lightness, dark-background lightness), so they cannot
// drift from each other, and re-tuning one is a four-number change here
// followed by `pnpm tokens`, never a hand-edit of app/register-tokens.css.
//
// WHAT THE RECIPE ENCODES. In light, the brand colour is --primary and the
// surfaces are pale tints of it; in dark, the brand colour IS the page and
// --primary flips to near-white so the logo reads. Purple's 0.44 lightness
// does both jobs; the others need a lighter primary (white button text) and
// a deeper page (near-white page ink), which is why pL and dL are separate.
//
// One --primary is both a fill under white text and text on white (links,
// totals, the wordmark), so a primary must sit at L ≲ 0.55. That is the
// constraint that ruled gold out for celebrations (amber h74, ochre h82,
// old gold h90 all read as bronze or olive) and settled on magenta.
//
// HOW A PAGE TAKES A PALETTE. `[data-register-page="…"]` anywhere in the
// document recolours the WHOLE page — header, footer, logo — through
// :root:has(), server-rendered, no flash. `[data-register="…"]` recolours
// only its own subtree (a card on a mixed surface). See
// components/register-scope.tsx and lib/register-palette.ts.
//
// The two measured pairs that fail on every palette (eyebrow primary-muted
// on white ≈ 3.7, border-strong on white ≈ 2.2) are the original purple's
// own numbers, inherited by the recipe — a pre-existing debt, not a palette
// choice. Run `pnpm tokens` to see the table.
import { writeFileSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

export const PALETTES = {
  default: { h: 252, c: 0.15, pL: 0.46, dL: 0.43, label: "Default — blue" },
  memorial: { h: 278, c: 0.18, pL: 0.44, dL: 0.44, label: "Memorial — purple" },
  celebration: {
    h: 345,
    c: 0.17,
    pL: 0.5,
    dL: 0.41,
    label: "Celebration — magenta",
  },
  fundraiser: {
    h: 160,
    c: 0.13,
    pL: 0.5,
    dL: 0.41,
    label: "Fundraiser — green",
  },
}

// ── Colour maths (OKLCH → linear sRGB → luminance) ─────────────────────────
function oklchToLinear(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180)
  const b = C * Math.sin((h * Math.PI) / 180)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const clamp = (x) => Math.min(1, Math.max(0, x))
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}
const toSrgb = (x) =>
  x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b
export function contrast(a, b) {
  const [y1, y2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (y1 + 0.05) / (y2 + 0.05)
}
// 5% of `over` composited on `base` in sRGB — what bg-primary/5 paints. Kept
// as rgb() deliberately: it is a MEASURED composite, and an oklch round trip
// reintroduces the rounding error it exists to avoid (2026-08-06).
function tint(base, over) {
  const mix = base.map((x, i) =>
    Math.round((toSrgb(x) * 0.95 + toSrgb(over[i]) * 0.05) * 255)
  )
  return `rgb(${mix.join(", ")})`
}

// ── The recipe ──────────────────────────────────────────────────────────────
// Chroma multipliers are the original tokens' chromas over 0.18, so the
// purple palette reproduces the 2026-07 globals.css exactly.
export function ramp({ h, c, pL, dL }) {
  const f = c / 0.18
  const round = (x) => Math.round(x * 1000) / 1000
  const ok = (L, C18) => `oklch(${round(L)} ${round(C18 * f)} ${h})`
  const light = {
    // The white surfaces and white button text are part of the recipe too —
    // and they MUST live here rather than in globals.css: a `:root` there
    // comes after this file's `.dark` and would win in dark mode (measured
    // 2026-08-30: white page, white-on-white band ink).
    "--background": "oklch(1 0 0)",
    "--card": "oklch(1 0 0)",
    "--popover": "oklch(1 0 0)",
    "--primary-foreground": "oklch(0.99 0 0)",
    "--sidebar-primary-foreground": "oklch(0.99 0 0)",
    "--foreground": ok(0.2, 0.02),
    "--card-foreground": ok(0.2, 0.02),
    "--popover-foreground": ok(0.2, 0.02),
    "--primary": ok(pL, 0.18),
    "--secondary": ok(0.96, 0.03),
    "--secondary-foreground": ok(pL, 0.18),
    "--muted": ok(0.96, 0.03),
    "--muted-foreground": ok(0.52, 0.06),
    "--accent": ok(0.92, 0.05),
    "--accent-foreground": ok(pL, 0.18),
    "--border": ok(0.91, 0.02),
    "--border-strong": ok(0.75, 0.1),
    "--input": ok(0.91, 0.02),
    "--primary-muted": ok(0.62, 0.14),
    "--reveal-foreground": ok(0.29, 0.1),
    // Display-screen QR ink: brand-tinted, bounded by scan contrast.
    "--qr": ok(0.29, 0.1),
    "--ring": ok(0.62, 0.14),
    "--chart-1": ok(pL, 0.18),
    "--chart-2": ok(0.62, 0.14),
    "--chart-3": ok(0.75, 0.1),
    "--chart-4": ok(0.85, 0.06),
    "--chart-5": ok(0.96, 0.03),
    "--sidebar": ok(0.98, 0.01),
    "--sidebar-foreground": ok(0.2, 0.02),
    "--sidebar-primary": ok(pL, 0.18),
    "--sidebar-accent": ok(0.96, 0.03),
    "--sidebar-accent-foreground": ok(pL, 0.18),
    "--sidebar-border": ok(0.91, 0.02),
    "--sidebar-ring": ok(0.62, 0.14),
    "--band-tint": tint(oklchToLinear(1, 0, 0), oklchToLinear(pL, c, h)),
  }
  const dark = {
    "--background": ok(dL, 0.18),
    "--foreground": ok(0.97, 0.01),
    "--card": ok(dL + 0.06, 0.17),
    "--card-foreground": ok(0.97, 0.01),
    "--popover": ok(dL + 0.06, 0.17),
    "--popover-foreground": ok(0.97, 0.01),
    "--primary": ok(0.97, 0.01),
    "--primary-foreground": ok(dL, 0.18),
    "--secondary": ok(dL + 0.08, 0.15),
    "--secondary-foreground": ok(0.97, 0.01),
    "--muted": ok(dL - 0.06, 0.18),
    "--muted-foreground": ok(0.82, 0.07),
    "--accent": ok(dL + 0.11, 0.14),
    "--accent-foreground": ok(0.97, 0.01),
    "--primary-muted": ok(0.82, 0.08),
    "--reveal-foreground": ok(0.95, 0.03),
    // 0.92 is the toned floor a decoder still reads against a dark field.
    "--qr": ok(0.92, 0.05),
    "--ring": ok(0.82, 0.08),
    "--chart-1": ok(0.92, 0.05),
    "--chart-2": ok(0.78, 0.1),
    "--chart-3": ok(0.64, 0.14),
    "--chart-4": ok(dL + 0.08, 0.15),
    "--chart-5": ok(dL - 0.06, 0.18),
    "--sidebar": ok(dL + 0.06, 0.17),
    "--sidebar-foreground": ok(0.97, 0.01),
    "--sidebar-primary": ok(0.97, 0.01),
    "--sidebar-primary-foreground": ok(dL, 0.18),
    "--sidebar-accent": ok(dL + 0.08, 0.15),
    "--sidebar-accent-foreground": ok(0.97, 0.01),
    "--sidebar-ring": ok(0.82, 0.08),
    "--band-tint": tint(
      oklchToLinear(dL, c, h),
      oklchToLinear(0.97, 0.01 * f, h)
    ),
  }
  // PAPER — anything printed, or shown as a sheet on screen (the pack, the
  // keepsake): the palette's LIGHT values pinned regardless of the .dark
  // ancestor, because the sheet forces white and dark ink on it went
  // near-white on white (measured 2026-08-06). --border is deliberately
  // darker than the app's (0.91 → 0.66): a 1px rule at the app value
  // measured 1.31:1 against paper and dithered to nothing on a domestic
  // printer. Generated per palette (2026-08-31) so a memorial's keepsake
  // prints purple and a fundraiser's green — .paper used to pin the
  // original purple by hand, which is why every sheet was purple whatever
  // the register.
  const paper = {
    "--background": "oklch(1 0 0)",
    "--foreground": ok(0.2, 0.02),
    "--muted-foreground": ok(0.52, 0.06),
    "--primary": ok(pL, 0.18),
    "--primary-foreground": "oklch(0.99 0 0)",
    "--border": ok(0.66, 0.02),
    "--border-strong": ok(0.75, 0.1),
    "--muted": ok(0.96, 0.03),
    "--primary-muted": ok(0.62, 0.14),
    "--reveal-foreground": ok(0.29, 0.1),
    "--qr": ok(0.29, 0.1),
    "--chart-1": ok(pL, 0.18),
    "--chart-2": ok(0.62, 0.14),
    "--chart-3": ok(0.75, 0.1),
    "--chart-4": ok(0.85, 0.06),
    "--chart-5": ok(0.96, 0.03),
  }
  // A sheet shown on screen keeps the app's border weight — the print
  // border reads as a hard outline drawn around every row at card size.
  const paperScreen = { "--border": ok(0.91, 0.02) }
  return { light, dark, paper, paperScreen }
}

// ── Contrast pairs worth knowing (WCAG: 4.5 text, 3 non-text) ───────────────
export function measure({ h, c, pL, dL }) {
  const f = c / 0.18
  const lin = (L, C18) => oklchToLinear(L, C18 * f, h)
  const white = oklchToLinear(1, 0, 0)
  const pairs = {
    light: [
      ["button text on primary", oklchToLinear(0.99, 0, 0), lin(pL, 0.18), 4.5],
      ["body ink on page", lin(0.2, 0.02), white, 4.5],
      ["muted text on page", lin(0.52, 0.06), white, 4.5],
      ["brand text / links on page", lin(pL, 0.18), white, 4.5],
      ["eyebrow (primary-muted) on page", lin(0.62, 0.14), white, 4.5],
      ["reveal ink on secondary", lin(0.29, 0.1), lin(0.96, 0.03), 4.5],
      ["border-strong on page (non-text)", lin(0.75, 0.1), white, 3],
    ],
    dark: [
      ["body ink on page", lin(0.97, 0.01), lin(dL, 0.18), 4.5],
      ["muted text on page", lin(0.82, 0.07), lin(dL, 0.18), 4.5],
      ["button text on primary", lin(dL, 0.18), lin(0.97, 0.01), 4.5],
      ["eyebrow (primary-muted) on page", lin(0.82, 0.08), lin(dL, 0.18), 4.5],
      ["ink on card", lin(0.97, 0.01), lin(dL + 0.06, 0.17), 4.5],
      ["reveal ink on secondary", lin(0.95, 0.03), lin(dL + 0.08, 0.15), 4.5],
    ],
  }
  const out = {}
  for (const theme of ["light", "dark"]) {
    out[theme] = pairs[theme].map(([name, a, b, floor]) => {
      const ratio = Math.round(contrast(a, b) * 100) / 100
      return { name, ratio, floor, pass: ratio >= floor }
    })
  }
  return out
}

// ── Emit ────────────────────────────────────────────────────────────────────
export function renderCss() {
  const block = (o) =>
    Object.entries(o)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n")
  let css = `/* GENERATED by scripts/generate-register-tokens.mjs — do not hand-edit.
   Re-tune a palette there and run \`pnpm tokens\`. A test guards that this
   file matches the generator.

   Selector notes. The default is :root / .dark. A register's light block
   must not apply in dark, and :root[…] (0,1,1) would beat .dark (0,1,0), so
   every register block is guarded on .dark explicitly and the dark blocks
   come second. \`:root:has([data-register-page])\` lifts a page's register to
   the whole document (header and footer included); \`[data-register]\` scopes
   a subtree. Both are server-rendered attributes — no flash, no script. */
`
  for (const [key, p] of Object.entries(PALETTES)) {
    const { light, dark } = ramp(p)
    css += `\n/* ${p.label} — h ${p.h}, c ${p.c}, primary L ${p.pL}, dark page L ${p.dL} */\n`
    if (key === "default") {
      css += `:root {\n${block(light)}\n}\n.dark {\n${block(dark)}\n}\n`
    } else {
      css += `:root:has([data-register-page="${key}"]):not(.dark),\n:root:not(.dark) [data-register="${key}"] {\n${block(light)}\n}\n`
      css += `:root.dark:has([data-register-page="${key}"]),\n:root.dark [data-register="${key}"] {\n${block(dark)}\n}\n`
    }
  }
  // THEME-LIGHT (founder, 2026-08-31: "the iPhone and live display should
  // show light mode on the How it works demo when dark mode is set"). A
  // device shown INSIDE the page — a phone in a frame, a screen in a TV — is
  // its own surface with its own theme, and a demo of one reads best in
  // light. `.theme-light` pins the full light ramp: the default palette on
  // the element itself, and each register's on any register-scoped element
  // inside it (or on itself), at the dark scope rules' own specificity
  // (0,3,0) and after them, so it wins. Paper is the same idea with the
  // print-dark border and fewer tokens.
  css += `\n/* Theme-light — a device shown inside the page keeps light mode whatever the page's theme; see the generator. */\n`
  for (const [key, p] of Object.entries(PALETTES)) {
    const { light } = ramp(p)
    if (key === "default") {
      css += `.theme-light {\n${block(light)}\n}\n`
    } else {
      css += `:root .theme-light[data-register="${key}"],\n:root .theme-light [data-register="${key}"] {\n${block(light)}\n}\n`
    }
  }
  // Paper after everything: the default sheet, then each register's, and the
  // on-screen border override after each so it wins at equal specificity.
  css += `\n/* Paper — the light values pinned for print and on-screen sheets; see the generator. */\n`
  for (const [key, p] of Object.entries(PALETTES)) {
    const { paper, paperScreen } = ramp(p)
    if (key === "default") {
      css += `.paper {\n${block(paper)}\n}\n.paper-screen {\n${block(paperScreen)}\n}\n`
    } else {
      const sel = (cls) =>
        `:root:has([data-register-page="${key}"]) .${cls},\n[data-register="${key}"] .${cls},\n.${cls}[data-register="${key}"]`
      css += `${sel("paper")} {\n${block(paper)}\n}\n${sel("paper-screen")} {\n${block(paperScreen)}\n}\n`
    }
  }
  return css
}

export const OUTPUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "../app/register-tokens.css"
)

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const css = renderCss()
  let previous = ""
  try {
    previous = readFileSync(OUTPUT, "utf8")
  } catch {}
  writeFileSync(OUTPUT, css)
  console.log(
    previous === css
      ? "register-tokens.css unchanged"
      : "register-tokens.css written"
  )
  for (const [key, p] of Object.entries(PALETTES)) {
    const m = measure(p)
    const fails = [
      ...m.light.map((x) => ({ ...x, t: "light" })),
      ...m.dark.map((x) => ({ ...x, t: "dark" })),
    ].filter((x) => !x.pass)
    console.log(
      key.padEnd(12),
      fails.length
        ? "below floor: " +
            fails.map((x) => `${x.t}/${x.name} ${x.ratio}`).join("; ")
        : "all pairs pass"
    )
  }
}
