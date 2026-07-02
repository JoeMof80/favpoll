# PROTOTYPE — landing page redesign variants (throwaway)

**Question:** what should the redesigned favpoll home page look like — which
structure/hierarchy best sells the withhold-then-disclose mechanic and drives
"Create a favpoll"?

**Plan:** four variants on the existing `/` route, switchable via `?variant=`
and a dev-only floating bottom bar (← → arrows, keyboard too):

- `current` — the existing seven-section landing (baseline for comparison)
- `stage` — demo-first, single centred column: the demo card is the hero,
  everything else is a quiet vertical story beneath it
- `editorial` — magazine-style: oversized display type, the reveal as a
  pull-quote, big-numeral steps, live favpolls as list rows, prose sections
- `split` — product-led: purple full-bleed hero band with live stats, then a
  sticky left rail (nav + CTA card) beside a scrolling stack of real product
  surfaces

Notes:

- Variants reuse the real data fetched by `app/page.tsx` (live favpolls,
  record items, charities) — same props for all.
- The hero demo **animation** is only in `current` (via HeroDemoPanel);
  `stage`/`split` embed a static reveal-phase `DemoCard` snapshot. The
  question is layout/hierarchy, not animation — the loop would be re-wired
  into whichever variant wins.
- Switcher and non-`current` variants are disabled in production builds.

**Verdict (in progress):** `split` chosen as the base direction (2026-07-02).
It has since been evolved to **v2** with these decisions baked in:

- **Demo lives inside the purple hero** — full animation loop (extracted to
  `use-demo-loop.ts`), white card on purple, Choose/Pledge/Reveal beat
  indicator beneath it.
- **Register copy cycles in the hero** (eyebrow synced to the demo scene via
  `SCENE_EYEBROWS`, as the old HeroPitchColumn did); body sections are
  register-neutral; the reveal-mechanic section deliberately uses a
  celebration scene (Poppy/ice cream) to balance the memorial-led opener.
- **Interactive reveal-mechanic section** (`reveal-mechanic-demo.tsx`,
  inspired by the editorial pull-quote): blurred quote + lock, visitor clicks
  a demo "Pledge £5" → unblur + typewriter. "Lock it again" resets.
- **Subtle motion**: in-view fade-ups (`fade-in.tsx`), record bars grow on
  view (`record-bars.tsx`), count-up hero stats (`count-up.tsx`), scrollspy
  rail (`rail-nav.tsx`), card hover lift. All prefers-reduced-motion aware.

**v2.1 refinements (2026-07-02, from screenshot review):**

- **Tense-aware headline**: the two verbs cycle with the scene — "loved/cared"
  for the memorial scene, "love/care" for the five living occasions, quiet
  word-level crossfade (`TenseWord` in `split-hero.tsx`). Fold-in requires an
  i18n restructure — `landing.headline` is a single fixed string today.
- **White-on-white bug fixed**: the purple band's `text-primary-foreground`
  was inherited by DemoCard internals (amount presets, breakdown, total);
  a `text-foreground` reset on the card wrapper fixes it.
- **Card scale**: DemoCard renders at full logical size (500×660px — nothing
  cropped, the real experience) inside a `scale-80 origin-top-left` wrapper
  reserving 400×528px. Keeps fidelity while fitting the hero.
- **Hero texture** (`hero-texture.tsx`): favpoll mark tiled at ~4.5% opacity,
  rotated −8°, with a slow diagonal shimmer band (masked gradient, 7s sweep +
  5s rest) that reveals the pattern at ~10%. Off under reduced motion.
- **Triad animation** (shared `honour-charity-love-venn.tsx`, affects live
  landing too): rotations slowed ~3× (16/24/20s — shimmer, not spinning) and
  each ring breathes (stroke-opacity 0.45→0.75, 9s, staggered 0/3/6s) so
  honour → charity → love take turns coming forward.

**v2.2 refinements (2026-07-02):**

- **Per-occasion headlines** (`SCENE_HEADLINES` in `split-hero.tsx`): one per
  scene, same rhythm, the verb carries the register — Honour (memorial,
  canonical line unchanged) / Celebrate / Thank / Toast / Send them off /
  Cheer them on. Whole-headline crossfade synced to the scene.
  ⚠ **Contradicts the brand skill's "never change the headline" rule** — if
  adopted, `.claude/commands/favpoll-brand.md` and the `landing.headline`
  i18n key must be updated at fold-in.
- **Monogram texture** (`hero-texture.tsx`): two marks interlocked
  point-symmetrically on a half-drop canvas with diamond accents — replaces
  the plain tiled mark. Geometry (v2.3): the glyph is the **founder-authored
  SVG verbatim** (13×15 viewBox — vertical point-symmetric weave, hearts
  top-right/bottom-left, bars interleaving, a dot in each heart's curl),
  fills converted to currentColor. NB the founder's source SVG uses #534BB7
  (near-miss of brand #534AB7) — fix at source. Alternate rows rotate 90°
  (classic alternating-orientation canvas). `FavpollMonogramGlyph` and the tile
  are self-contained specifically so the pattern can be lifted for future
  merchandising (print/textile use was the design intent). Tuning knobs:
  pivot point (interleave tightness), tile size 76px (density), base opacity
  0.05 / shimmer 0.11.

**v2.4 refinements (2026-07-03):**

- **Record section → record-holder tiles** (`record-holders.tsx`): one
  champion per topic (deduped), topic eyebrow + holder + all-time figure.
  Cross-topic comparative bars were semantically wrong — different questions
  don't share a scale. `record-bars.tsx` kept for within-topic use.
- **Money/wills moved off the landing body** into the footer as compact
  blurbs. Full **about page divided into register sections** (for memorials /
  celebrations / fundraisers) is the long-term home — follow-up task.
- **Site footer** (`site-footer.tsx` — promote to `components/landing/` and
  mount in the root layout at fold-in): brand statement, Explore/Your account
  links, money+wills blurbs, © + Stripe line.
- **Venn labels 1.5×**: each baked label path wrapped in a scale transform
  around its own centroid (shared component — live landing benefits too).

Open questions before fold-in: final say on `stage`/`editorial` deletion;
mobile treatment of the hero demo (currently hidden < md); whether the
old two-column HeroDemoPanel retires entirely; protagonist photos for the
six demo scenes (initials boxes are the weakest pixel); about page with
register sections; footer should mount app-wide (root layout), not just
on the landing page.
