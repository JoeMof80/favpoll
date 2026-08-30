// PROTOTYPE — register colour system (2026-08-30). Throwaway.
//
// QUESTION: can favpoll carry a Premier-League-style flexible identity —
// purple = memorials, amber/gold = celebrations, green = fundraisers, a
// new neutral default (blue or ink), the logo recolouring with the page —
// as full token ramps in both themes, on the REAL pages?
//
// This script derives every ramp from ONE recipe (the current purple
// tokens in globals.css, expressed as functions of hue, chroma and primary
// lightness) so the variants differ only in the three numbers that matter
// and cannot drift from each other. It writes:
//   app/prototype-register-colours.css   the token overrides per variant
//   app/prototype/register-colours/contrast.json   measured contrast pairs
// Run:  node app/prototype/register-colours/generate.mjs
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))

// ── Palettes: the three numbers per variant ─────────────────────────────────
// c is the brand chroma at the primary; every other chroma in the recipe is
// scaled by c / 0.18 (the current purple's). pL is the primary lightness in
// light theme; dL is the page background in dark. The current recipe makes
// the brand colour the dark background and purple's 0.44 does both jobs —
// amber and green need a lighter primary (white button text) and a deeper
// background (near-white page ink), so the two numbers are split.
export const PALETTES = {
  memorial: {
    h: 278,
    c: 0.18,
    pL: 0.44,
    dL: 0.44,
    label: "Memorial — purple (today's brand, unchanged)",
  },
  celebration: {
    h: 74,
    c: 0.15,
    pL: 0.53,
    dL: 0.42,
    label: "Celebration — amber / gold",
  },
  fundraiser: {
    h: 160,
    c: 0.13,
    pL: 0.5,
    dL: 0.41,
    label: "Fundraiser — green",
  },
  blue: {
    h: 252,
    c: 0.15,
    pL: 0.46,
    dL: 0.43,
    label: "Default candidate — forget-me-not blue",
  },
  ink: {
    h: 270,
    c: 0.035,
    pL: 0.27,
    dL: 0.25,
    label: "Default candidate — ink",
  },
}

// ── Colour maths (OKLCH → linear sRGB → luminance) ─────────────────────────
function oklchToLinear(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180)
  const b = C * Math.sin((h * Math.PI) / 180)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3,
    m = m_ ** 3,
    s = s_ ** 3
  const clamp = (x) => Math.min(1, Math.max(0, x))
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}
const toSrgb = (x) =>
  x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
const toLinear = (x) =>
  x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b
export function contrast(a, b) {
  const [y1, y2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (y1 + 0.05) / (y2 + 0.05)
}
// 5% of `over` composited on `base`, in sRGB (what bg-primary/5 does).
function tint(base, over) {
  const mix = base.map((x, i) => {
    const s = toSrgb(x) * 0.95 + toSrgb(over[i]) * 0.05
    return Math.round(s * 255)
  })
  return `rgb(${mix.join(", ")})`
}

// ── The recipe ──────────────────────────────────────────────────────────────
// Each entry: token → [L, C-multiplier-of-0.18, h-offset] for light and dark.
// The C multipliers are the current tokens' chromas divided by 0.18, so the
// purple palette reproduces globals.css exactly.
function ramp({ h, c, pL, dL }) {
  const f = c / 0.18
  const ok = (L, C18) => `oklch(${round(L)} ${round(C18 * f)} ${h})`
  const round = (x) => Math.round(x * 1000) / 1000
  const light = {
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
  return { light, dark }
}

// ── Contrast pairs worth knowing (WCAG: 4.5 text, 3 non-text) ───────────────
function measure({ h, c, pL, dL }) {
  const f = c / 0.18
  const lin = (L, C18) => oklchToLinear(L, C18 * f, h)
  const white = oklchToLinear(0.99, 0, 0)
  const pairs = {
    light: {
      "button text on primary": [white, lin(pL, 0.18), 4.5],
      "body ink on page": [lin(0.2, 0.02), oklchToLinear(1, 0, 0), 4.5],
      "muted text on page": [lin(0.52, 0.06), oklchToLinear(1, 0, 0), 4.5],
      "brand text / links on page": [
        lin(pL, 0.18),
        oklchToLinear(1, 0, 0),
        4.5,
      ],
      "eyebrow (primary-muted) on page": [
        lin(0.62, 0.14),
        oklchToLinear(1, 0, 0),
        4.5,
      ],
      "reveal ink on secondary": [lin(0.29, 0.1), lin(0.96, 0.03), 4.5],
      "border-strong on page (non-text)": [
        lin(0.75, 0.1),
        oklchToLinear(1, 0, 0),
        3,
      ],
    },
    dark: {
      "body ink on page (brand bg)": [lin(0.97, 0.01), lin(dL, 0.18), 4.5],
      "muted text on page": [lin(0.82, 0.07), lin(dL, 0.18), 4.5],
      "button text on primary (near-white)": [
        lin(dL, 0.18),
        lin(0.97, 0.01),
        4.5,
      ],
      "eyebrow (primary-muted) on page": [lin(0.82, 0.08), lin(dL, 0.18), 4.5],
      "ink on card": [lin(0.97, 0.01), lin(dL + 0.06, 0.17), 4.5],
      "reveal ink on secondary": [lin(0.95, 0.03), lin(dL + 0.08, 0.15), 4.5],
    },
  }
  const out = {}
  for (const theme of ["light", "dark"]) {
    out[theme] = Object.entries(pairs[theme]).map(([name, [a, b, floor]]) => {
      const ratio = Math.round(contrast(a, b) * 100) / 100
      return { name, ratio, floor, pass: ratio >= floor }
    })
  }
  return out
}

// ── Emit ────────────────────────────────────────────────────────────────────
let css = `/* PROTOTYPE — register colour system (2026-08-30). GENERATED by
   app/prototype/register-colours/generate.mjs — do not hand-edit; re-run it.
   Delete this file, its @import in globals.css, the switcher and the
   /prototype/register-colours route together when the question is answered.

   Selector notes: the light block must lose to .dark, and :root[attr]
   (0,1,1) would beat .dark (0,1,0), so both are pinned at (0,2,1) and the
   dark block comes second. */
`
const report = {}
for (const [key, p] of Object.entries(PALETTES)) {
  const { light, dark } = ramp(p)
  const block = (o) =>
    Object.entries(o)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n")
  css += `\n/* ${p.label} — h ${p.h}, c ${p.c}, primary L ${p.pL}, dark bg L ${p.dL} */\n`
  css += `:root[data-register="${key}"]:not(.dark) {\n${block(light)}\n}\n`
  css += `:root.dark[data-register="${key}"] {\n${block(dark)}\n}\n`
  report[key] = { ...p, contrast: measure(p) }
}
writeFileSync(join(here, "../../prototype-register-colours.css"), css)
writeFileSync(
  join(here, "contrast.json"),
  JSON.stringify(report, null, 2) + "\n"
)

for (const [key, r] of Object.entries(report)) {
  const fails = [
    ...r.contrast.light.map((x) => ({ ...x, t: "light" })),
    ...r.contrast.dark.map((x) => ({ ...x, t: "dark" })),
  ].filter((x) => !x.pass)
  console.log(
    key.padEnd(12),
    fails.length
      ? "FAILS: " + fails.map((x) => `${x.t}/${x.name} ${x.ratio}`).join("; ")
      : "all pairs pass"
  )
}
