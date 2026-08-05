# Session handoff — 2026-08-05 (PRs #508–#526)

Two sessions in one day. Part one (#508–#522, §1–§8) is the matrix and the
first hero-router passes. Part two (#523–#526, §9–§12) rebuilt the hero
router and repaired CI. Continues session-handoff-2026-08-04.md. All
merged; suite 1189 in 116 files throughout — NOTHING all day added a test
(see §12).

## 1. The feature × register matrix (#512, #514–#517)

`components/landing/register-matrix.tsx` — a feature-by-register table
where every cell is a PHRASE, never a tick, and nothing is ever crossed
out. Shine cells carry the register's accent dot + foreground ink;
"works" cells sit muted. The closing italic line IS the section's
message: no rules, every favpoll can use every feature. Column heads
deep-link to the register pages in their accents; the Feature head
matches their grammar. Titled "What fits the occasion" (the founder
floated "Suggested feature use" and invited better).

Seven rows, each led by a lucide icon in primary-muted: Tv (live
display) · Quote (reveal) · Target (goal) · QrCode (QR code stationery
— was "Printed table cards", founder swapped copy AND icon in #517) ·
ListChecks (topics) · Users (wall) · HeartHandshake (shared fund). The
two Live-display rows folded into one in #516 (tribute phrase for
memorials, telethon for fundraisers, party total mid-cell).

**The round trip worth remembering (#514 → #515):** the 8×3 grid read
as "comparison furniture — dry for a homepage", so home was given three
accent-headed shine-only columns (`register-shines.tsx`) and the full
matrix moved to /about. That failed for a reason worth keeping: stripped
of the feature labels, the phrases lost their referent — "between the
courses" of WHAT? The matrix came back to home with context intact, and
was WARMED instead (icons + row hover, the founder's pick of three
options). `register-shines.tsx` and the /about mount are deleted. In
#518 the three register columns took muted accent washes
(memorial-muted/50, warning-muted/60, success/8) so they read as
register territories rather than table columns.

Home order now: hero · ProcessOverview · #how (Create/Share/Watch) ·
**RegisterMatrix** · **reassurance band** · #anyone · #watch · record ·
#live shelf · final CTA.

## 2. Home reassurance band + memorial grammar (#509)

The validator's checklist — a register-neutral 4-up grid (`home.assure.*`):
free to set up / 100% to charity / no favourite needed (shared fund) /
no app to install. Register-neutral restatements of the reassurance
grids the register pages already carry (page-architecture layer 2).

/memorials step 1 adopted the **their-question grammar** — "The family
picks the question — favourite song, favourite flower, favourite walk —
and every guest answers with their own." This resolves the Joy tension
inside the page's own copy. The grammar is still not in the generation
prompts or About guidance (§6).

## 3. Footer as the cross-register spine (#510, #511)

The footer gained the three register links and now mounts on the
register landing pages (marketing/trust surfaces belong on the mount
allowlist). This is how the trio cross-links beyond home — an open
thread from the last handoff, now closed.

## 4. Full-screen hero + the router cards become polls (#518–#522)

**Full-screen band (#518):** the hero fills the viewport below the h-14
nav — `min-h-[calc(100vh-3.5rem)]`, content vertically centred. `min-h`
not `h` so short phones never clip. Applies to home AND every register
hero (it's one component).

**Cards carry their poll (#519):** polls are the product's core
(founder), so each router card now shows its register's example poll —
topic title + top-three `RankingBar`s in the register accent, pulled
from `SCENES.find(s => s.kind === card.kind)`, i.e. the card previews
the exact story its page then plays. #520 added the demo footer in one
line — charity name + running total — completing the story arc: topic,
bars, charity, money.

**Four shapes in one day, ending where it started.** Stacked (#519) ran
too tall → 2-up in a 44rem column with fundraiser spanning both (#520)
→ a true 2×2 with the faceless-cause scene promoted to a fourth Causes
card, Explore links removed since the whole card is the link, text
bumped up a step (#521) → **final (#522): three cards stacked, each
internally two columns — register text left, scene poll right.** The
Causes card was tried and MEASURED OUT: four rows run to 1020px against
an 844px viewport. Causes folded back into "Fundraisers & causes".

The load-bearing decision underneath: **fundraiser and cause stay ONE
register at the marketing layer** — one audience, one intent, one page.
Split only if a distinct channel emerges. When both cards existed they
were both green and both routed to /fundraisers (keyed by `kind`, two
cards sharing an href), which was the tell that they were one thing.

The whole router is still reversible: `LandingHero`'s `router` prop.
Drop it from `app/page.tsx` and the demo hero returns.

## 5. Security: RLS on two service-role tables (#513)

`disbursements` and `rate_limits` were created without RLS — readable
AND writable via the anon key through PostgREST (Supabase advisor
ERRORs, emailed 2026-08-03). Both are service-role surfaces and the
service role bypasses RLS, so enabling RLS with **no policies** — the
house pattern — closes the anon door at zero app cost. Migration
`20260805100000_enable_rls_disbursements_rate_limits.sql`, applied to
staging and production via MCP the same day.

Worth internalising: the house pattern for any new service-role table
is "enable RLS, write no policies", and it should be part of creating
the table, not a later advisor cleanup.

## 6. Carried forward (still open)

- **No tests were added this session.** The matrix and the hero router
  are untested; the suite is 1189 exactly as it was at #507.
- **The flaky test is still flaky.** pledge-card "renders the Pledge
  favourites button" (`components/pledge-card/__tests__/pledge-card.test.tsx:31`)
  still runs at the default 5s and still has no explicit timeout. The
  agreed fix — bump to 10s — was never applied.
- Reveal-tension copy grammar ("their question, your answer, their last
  word") → generation prompts + About guidance. #509 put it in the
  /memorials page copy only.
- Register v2 deeper sections (WatchItHappen per register, add/subtract
  per register); register CTAs preselecting the wizard category.
- PROJECT.md's register-landing bullet describes the router cards as
  plain accent-ruled cards — it predates #519–#522 (updated in part).

## 7. Diary — the two meetings

- **Thursday 6 Aug (TOMORROW): Sarah**, a friend in marketing at The
  British Hamper Company (luxury occasion hampers; consumer + corporate
  gifting). Prep is in `references/outreach-notes.md`. This is the
  FIRST FIELD TEST of /celebrations and /fundraisers as artefacts. Same
  discipline as Joy: a menu, not a pitch — the wrong first impressions
  are the yield. The gold is Sarah's ORGANISER and CHANNEL knowledge
  (occasion discovery/seasonality, who buys celebration things inside a
  company, complement-vs-replace against a physical gift); politely
  park the hamper-bundle partnership ideas as downstream.
- **Friday 7 Aug, 14:30: Goodstack call with Ethan** — pinned 5 Aug,
  no chase needed. Fees are the decider (Gift Aid effectively confirmed
  27 Jul); brief is print-ready in
  `references/goodstack-call-brief-2026-07.md`, review it Thursday.
- Joy's network feedback still pending → wrong-impressions ledger.

## 8. Ops (unchanged, still true)

- Turbopack's persistent Tailwind scan cache in `.next` survives
  restarts and withholds newly-named utilities. Fix: stop the server,
  `rm -rf apps/web/.next`.
- Dev server launched with `NODE_OPTIONS=--max-old-space-size=8192`
  after repeated ~5-7GB wedges.
- Measure, don't eyeball — this session's card layouts were settled by
  measured heights (1020 vs 844), and the previous one's crossfade by
  scroll math after IntersectionObserver silently failed in the
  founder's Chrome.

---

# Part two — the hero rebuild and CI repair (PRs #523–#526)

## 9. Hero register router, rebuilt (#524)

Brief: the cards are "too wide, or too white". Measured, they covered
**35%** of the band at 1440 and **42%** at 1280 — the founder was seeing
the mild version.

**Width.** The cards are now exactly the LAST OF THREE COLUMNS. The row
uses `grid-cols-3` on the three-beat's own 2rem gutter; the demo hero the
register pages mount uses `calc((100%-4rem)/3)`. Both resolve to the same
402.7px and right-align to the same container edge, asserted by comparing
each card's left edge against each three-beat column's at every viewport.
Narrowing cost nothing in height: the poll side governs the card, so the
text just reflows beside it.

**Colour.** The cards are a translucent wash of the band's OWN foreground,
with band ink throughout. That is what survives the theme flip: the hero
band inverts (deep purple + white ink in light; near-white + purple ink in
dark) and a wash of its own ink inverts with it. No per-theme branching.

**The accessibility bug this exposed.** The accent-coloured eyebrows were
already failing contrast BEFORE any of this: gold **2.14:1** on the white
card, blue **1.95:1** in dark. The cause is structural and will bite again
anywhere accents meet the brand band — the band inverts between themes and
the accent tokens do not, so memorial dies in light (1.04:1 on glass) and
gold and green die in dark. Fixed at the cause:

- NEW tokens `--memorial-on-band` / `--warning-on-band` / `--success-on-band`
  (globals.css, both themes), light on the dark band and dark on the pale
  one, keeping the gold > green > blue energy order in both directions;
- the accent moved OFF the label text onto a DOT — the register matrix's
  existing grammar (accent dot + full ink).

Every accent mark now clears the 3:1 non-text floor in both themes
(3.8–5.6 measured). Use the `*-on-band` variants for any accent mark on
the brand band; the base tokens stay correct on page surfaces.

**Layout: the cards became a row.** Statement on top, three doors beneath.
Free at 1440 and up — the min-height governs, and the cards were already a
third of the container, so they do not resize (403×204 in both layouts).
The headline scales up to hold the width it inherits, gated at `2xl` because
at 1280–1440 the extra 40px of line height is the difference between fitting
a laptop and not.

**The overflow bug (worth internalising).** The card interior burst its own
bounds by up to **69px** between 768 and ~950px, with horizontal page scroll
below 800: plain `1fr` tracks have `min-width:auto`, so the poll could not
shrink below its 147px min-content. Fixed with a **container query**, not a
breakpoint — the interior has to answer to the CARD's width, which varies
with the layout AND with browser zoom, which is how the founder found it and
what no fixed-viewport test would have caught. `minmax(0,…)` stops the burst
outright. Swept 1804 → 390: no spill, no scrollX.

**Content.** Register-synonymous topics with their OWN miniature polls
(flower / cake / biscuit) rather than the register's demo scene — the scenes
are authored stories whose topics serve their own reveal, and the memorial
scene turns on Belinda's favourite COLOUR, named aloud in its reveal quote.
Charities are short by design (Marie Curie / Barnardo's / Macmillan) and two
pairings do extra work: Marie Curie's appeal IS the daffodil, and the biscuit
poll lands on Macmillan of coffee-morning fame. The `+N more` lines exist
because the visible figures fall ~27% short of the total and **that gap is
correct** — more items sit below, and every favpoll's shared fund takes
pledges attaching to no favourite. Making the numbers balance would have
depicted a favpoll that cannot exist.

## 10. A wrong claim, corrected — read this before trusting a "ceiling"

Mid-session the assistant said the cards were "at their height ceiling".
The founder challenged it and was right. In a ROW a card's height costs the
hero **once**, not three times (`rowH == cardH`, measured 208 = 208). Real
headroom before the hero exceeds one viewport:

| viewport | interior | card | headroom |
| --- | --- | --- | --- |
| 1804×1002 | 2-col | 208 | +189px |
| 1440×900 | 2-col | 208 | +128px |
| 1280×800 | 2-col | 208 | +28px |
| 1180×820 | stacked | 324 | −69px |
| 1024×768 | stacked | 324 | −121px |

The claim came from generalising the ONE tight case (1083×900, where the
interior stacks so two gap bumps land in the same column and cost 8px, not
4). The genuinely constrained band is the stacked-interior mid widths and
short 768-tall viewports, and that is total hero content, not card height —
a row is already the most compact arrangement there (324px against ~450 for
three full-width stacked cards).

Because the row created room, two earlier compromises were REVERSED: card
padding 16 → 20px and poll rows 4 → 6px. Hero padding stays cut (`md:py-8`)
and should stay cut: above 1280 the min-height governs and the content is
centred, so that padding never renders — it is a floor for short viewports,
not a look.

## 11. CI repair — both signals were failing on EVERY PR (#525, #526)

Found because a **docs-only PR failed Lint and E2E identically**. Two
signals that fail unconditionally are worse than no signals: a real
regression is indistinguishable from the noise.

**Lint (#525): 5 errors → 0.** Fixed, not downgraded — `eslint.config.mjs`
already carries the policy ("do NOT silence individual hits with disable
comments; fix them or leave them counted"), and its warn-list is for rules
needing per-component refactors. These didn't.

- `pack-document.tsx` ×3: `SheetPrintButton` was declared INSIDE
  `PackDocument`, so it was a new component type every render and React
  unmounted/remounted the subtree instead of updating it. Hoisted to module
  scope; the setter arrives as an `onPrint` prop.
- the two `form-inner-*` test harnesses ×2: each assigned the form handle to
  a module-scope variable during render. Moved into an effect — RTL flushes
  effects inside `render()`, so the handle is ready before any test reads it.

35 warnings remain: that is the tracked debt the config deliberately counts.

**E2E (#526): 3 failures, all stale specs.** The specs had fallen behind
three UI changes the unit tests all followed.

- "choose your favourite" → the dialog says **"Pick your favourite {topic}"**
  (the house Pick-never-Choose rule).
- radio `"A cause"` → the label is **"Cause"**; `honour-step.test.tsx` had
  been asserting the correct name all along.
- a `"She"` pronoun radio in the honour step → **those controls left that
  step on 2026-07-30** (they only shape generated suggestions, so they moved
  to the form's Generate control). The gate is now
  `subject !== "cause" && !category`, so a category alone enables Next. The
  step was removed, not re-pointed.

Not runnable locally (E2E needs Clerk credentials + staging, absent from
`.env.local`), so CI was the first real execution — and passed 4/4.

**The proof the two failures were independent and real:** #525 passed Lint
and failed E2E; #526 passed E2E and failed Lint. Neither could be green
alone, because each was missing the other's fix.

## 12. Carried forward from part two

- **Still no tests, all day.** The suite is 1189 exactly as it was at #507.
  The matrix, the hero router, the glass treatment and the `*-on-band`
  tokens are all untested. This is now a day-long gap, not a session one.
- The flaky pledge-card test (§6) is STILL unbumped.
- Mid widths 1024–1180 and short 768-tall viewports scroll the hero by
  69–121px. Accepted, not fixed: it is total hero content, and a row is
  already the most compact arrangement there.
- `home.router.fundraisers.title` lost "& causes", so **the word "causes"
  now appears nowhere on home** — consistent with the one-register decision,
  but a faceless-cause organiser scanning the page has nothing that says
  "this is for me". The natural home if you want it back is the card's body
  copy, not the label.

## 13. Method notes that earned their keep

- **Simulate before committing.** The row layout was applied to the live DOM
  and measured at four viewports before a line of it was written — that is
  how "the cards don't resize" was known rather than hoped.
- **Chrome returns `lab()`/`oklab()` from `getComputedStyle`.** Parsing the
  numbers out of that string as RGB yields garbage (it produced a confident,
  entirely wrong contrast table). Paint the colour to a 1×1 canvas and read
  the pixel back to get real sRGB.
- **Container queries where the parent's size is the variable.** Viewport
  breakpoints cannot see zoom or a layout change; the card interior needed
  the card's width.
- **Assert alignment, don't eyeball it.** Comparing card left edges against
  three-beat column left edges turned "looks aligned" into a boolean.

---

# Part three — register branding settled (PRs #527–#529)

## 14. Per-register THEMING: explored, rejected, nothing shipped

A founder-led revisit of the 2026-08-03 "no per-register rebrand" call —
**deliberate, stated as such, not drift.** Two shapes were built on
/memorials and looked at:

- **(a) indigo + ice blue** — purple's hue shifted 278 → 262, the light end
  re-pitched to ~0.985 / hue 250;
- **(b) the founder's framing: purple held EXACTLY**, only the white end
  re-pitched — surfaces, borders, and the ink on purple, which also carries
  the logo and the monogram texture since both draw with `currentColor`.

Neither was rejected for breaking anything: both measured **7.0–7.6:1**
headline-on-band. They were rejected for what they DO. With purple held,
the register can only live in the LIGHT surfaces — clear on content bands,
**nearly invisible above the fold** where the screen is mostly purple, since
the only difference from home up there is ink at 0.955 vs 0.99 lightness.
Registers became something you feel as you scroll rather than something the
page announces.

**Conclusion: subtle accents on the standard branding.** Working tree
reverted; nothing shipped. Recorded in PROJECT.md via #528 so a third
revisit starts from the finding rather than from scratch.

**Trap for anyone who tries again:** a `.theme-*` class has no light-mode
selector, so every token it sets leaks into dark unless the dark block
restates ALL of them. The first attempt produced an ice page with ice ink —
completely unreadable — from exactly this.

## 15. Register pages back to standard branding (#529)

The register pages had gone further than the accent system intended: a full
accent BAND for the hero and the close, plus an accent-tinted section. They
now wear standard purple/white exactly as home, and the register is carried
the way the home router cards carry it — **small marks**.

Each page drops its `bandClassName` (hero = brand purple, verified identical
to home's computed colour), its tinted section becomes `bg-primary/5`, and
its close becomes the purple monogram close. What stays accent: the
pull-quote rule, the presence-list dots, and — new — the demo card's LEADER
bar, via an optional `accentBarClassName` threaded `DemoCard ← LandingHero`.
Runners-up stay `bg-chart-3`, so the accent marks the top answer only.

**NEW TOKENS `--warning-strong` / `--success-strong`.** Gold and green are
pitched light for surface use, so as marks on a pale track they measured
**1.94:1** and **3.04:1** — gold below even the 3:1 non-text floor, i.e. a
"subtle gold mark" was effectively invisible. The deep variants clear 4.5 and
the three registers now read at matched weight:

| register | bar vs track | rule vs page |
| --- | --- | --- |
| memorial | 5.28 | 6.00 |
| celebration | 4.56 | 5.17 |
| fundraiser | 4.49 | 5.09 |

Memorial needs no variant — its base already sits at 0.5. Same job
`--destructive-strong` already does for error text on a soft surface. In
dark the variants go LIGHTER, since a mark on a dark surface reads by
lightening, not deepening.

## 16. State at session close

**Merged today:** #523 (handoff pt1 + diary pins), #524 (hero rebuild),
#525 (lint), #526 (E2E), #527 (handoff pt2). `main` is green on all five CI
signals — Lint, Test, Typecheck, Format, E2E — for the first time in a
while, since Lint and E2E had been failing on EVERY PR including docs-only
ones.

**Open, awaiting review:** #528 (theming decision record, docs only) and
#529 (register pages → standard branding).

**Still carried forward:** nothing all day added a test — the suite is 1189
exactly as it was at #507, so the matrix, the hero router, the glass
treatment, the `*-on-band` and `*-strong` tokens are all untested. The
pledge-card flaky test is still unbumped.

## 17. Ops — the Tailwind scan cache bit TWICE

Both times on newly-named utilities (`bg-memorial-on-band`, then
`bg-warning-strong`). Symptom: the class is present in the DOM but resolves
to transparent, and the custom property is missing from computed style
entirely — Tailwind v4 strips properties it believes unreferenced, and the
stale scan cache is what makes it believe that.

**The giveaway worth remembering:** a contrast probe returned an impossible
**18.51:1 for two different colours**. Identical ratios for different inputs
means both resolved to the same thing — transparent, painted as black.

Fix, both times: stop the dev server, `rm -rf apps/web/.next`, restart with
`NODE_OPTIONS=--max-old-space-size=8192`. Before touching a running dev
server, prove it is local: a fresh `pnpm build` CONTAINED the tokens while
the dev chunk did not, which established it was never a shipped regression.
