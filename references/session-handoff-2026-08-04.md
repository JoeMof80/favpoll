# Session handoff — 2026-08-04 (PRs #485–#506)

Continues session-handoff-2026-08-03.md. All merged; suite 1189.

## 1. Register landing pages + accent system (#485–#487)

/memorials, /celebrations, /fundraisers shipped. Accent-not-rebrand:
purple stays brand + neutral default; memorial = forget-me-not blue
(NEW tokens --memorial/-foreground/-muted, light+dark, registered in
@theme), celebration = --warning gold, fundraiser = --success green
(semantic: already the goal-reached colour). Palette is a system:
gold/green/blue near-triadic; lightness encodes register energy
(0.76 > 0.62 > 0.50 > brand 0.44). Rejected: neutral-base rebrand
(purple IS the cross-register neutral; charity product needs warmth).

## 2. Hero parameterization + home router (#489–#494)

LandingHero takes sceneKind/copy/band/hideStats/eyebrow props — home
passes nothing (unchanged) except the NEW `router` prop: demo slot →
three accent register cards (one-line reversible). Register pages
mount the real hero looping their own scene (scenes were ALREADY
register-keyed in scenes.ts — the big de-abstraction came free).

## 3. The Goodstack section saga (#494–#504, SIX shapes)

Final form (components/landing/process-overview.tsx): pinned
eyebrow+headline (top-28, solid h-14 mask above exactly filling the
nav gap — h-28 bled into the hero; gradient fade below), step texts
SCROLL past, third-column bare DemoCard stills (0.8) crossfade by
SCROLL MATH (active = last block top past 45% viewport) — IO
percentage rootMargins silently never fired in the founder's Chrome
while headless chromium passed: measure with scroll math, not IO.
Mid-flow DemoCard phases hydrate dirty (never SSR'd) → frames mount
client-only. #how keeps ONLY Create/Share/Watch vignettes (#505
over-removed, #506 corrected — "the three-beat section" meant the
duplicate strip, not the organiser vignettes).

## 4. Page architecture principle (recorded in PROJECT.md TODO block)

In-product teaches guests; home shows the guest experience to win the
undecided organiser + validators; register pages serve organisers/
gatekeepers in register voice. Not strict — register pages restate the
mechanic (forwarded links are first touches).

## 5. Ops lessons

- Turbopack's persistent Tailwind scan cache in .next SURVIVES
  restarts and withholds newly-named utilities (bg-memorial) while
  passing plain CSS through. Fix: stop server, rm -rf apps/web/.next.
  Isolating test: standalone `npx @tailwindcss/cli -i globals.css`.
- Dev server wedges (~5-7GB) recurred 3x on 2026-08-03; now launched
  with NODE_OPTIONS max-old-space-size=8192.
- pledge-card "renders the Pledge favourites button" 5s timeout flaked
  3x at ship gates (always green standalone). TODO: bump that test's
  timeout to 10s.
- ffmpeg installed (brew) — founder screen recordings are now
  frame-extractable; his stills/recordings were the ground truth that
  fixed every section iteration.

## 6. Open threads

- Goodstack call Friday 7 Aug afternoon (pin a slot if no invite by
  Wed). Joy network feedback pending → wrong-impressions ledger.
- Register v2 deeper sections (WatchItHappen per register, add/
  subtract); register CTAs preselecting wizard category; trio
  cross-linking beyond home (footer?).
- Reveal-tension copy grammar ("their question, your answer, their
  last word") → generation prompts + About guidance when picked up.
