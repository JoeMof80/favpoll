# PROTOTYPE — register colour system (2026-08-30)

**Question.** Can favpoll carry a Premier-League-style flexible identity —
purple = memorials, amber/gold = celebrations, green = fundraisers, a new
neutral default (blue or ink), the logo recolouring with the page — as full
token ramps in both themes, on the real pages? And which default?

**Where.** `?variant=` on any page (floating bar, ←/→ keys, theme toggle);
`/prototype/register-colours` shows a real page in all six variants side by
side with the measured contrast table. Variants: `current` (no override),
`memorial`, `celebration`, `fundraiser`, `blue`, `ink`.

**How.** `generate.mjs` derives every ramp from today's purple tokens as a
recipe of four numbers (hue, chroma, primary L, dark background L) → writes
`app/prototype-register-colours.css` + `contrast.json`. Re-run after
changing a palette. The register is NOT derived from the favpoll yet — the
bar forces one, which is the point of a prototype.

**Files to delete together:** this directory, `app/prototype-register-colours.css`
and its `@import` in `globals.css`, `components/prototype-register-switcher.tsx`
and its mount in `app/layout.tsx`.

**Measured (generate.mjs).** Every variant clears WCAG on every pair except
the two that today's purple fails too (eyebrow `primary-muted` on white 3.5–3.8,
`border-strong` on white 2.2) — baseline, inherited by the recipe.

**First observations (Claude, 2026-08-30 — before the founder has looked):**

- The logo recolours for free (currentColor), and five distinct identities
  come out of four numbers each; the recipe holds.
- Amber can only be a primary at L 0.53, which reads as bronze rather than
  gold, and its dark page (L 0.42) is a rust-brown — the weakest of the five
  in dark mode. The bright gold survives only as the secondary/bars.
- Green is the strongest of the three registers on its own page; blue is a
  convincing neutral; ink is crisp and sober, and the darkest dark theme.
- Under any new default, the home router cards' existing accent dots
  (memorial = forget-me-not blue) collide with a blue default — in the new
  system those dots become purple / amber / green. Not in this prototype.

**Founder round 1 (2026-08-30).** "Exactly what I meant." Gold too brown /
rusty to feel celebratory; loves blue and ink; ink maybe the default for the
bolder colours but bland as a brand in itself; "the blue is beautiful".

**Why gold cannot work here.** One `--primary` is both a fill under white
text (buttons) and text on white (links, totals, the wordmark). A gold that
can be the wordmark on white is a dark gold, and dark gold is bronze or
olive: amber h74 / ochre h82 / old gold h90 were all built and rejected.

**Founder round 2.** Option 2 — change celebration's family. Coral (h28),
rose (h5) and warm magenta (h345) added; all clear every measured pair by a
margin (button text 5.3 / 6.1 / 6.4).

**Verdict.** _(founder to fill in: which warm; blue as default)_
