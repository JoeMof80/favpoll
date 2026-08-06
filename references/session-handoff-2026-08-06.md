# Session handoff — 2026-08-06 (PRs #531–#536)

Six PRs, all merged, all green on the five CI signals. Continues
session-handoff-2026-08-05.md.

The suite moved for the first time since #507: **1189 → 1199 in 117 files**.

Two threads run through the day. The **QR chain** — a real printed card that
scanned badly, fixed by three independent levers. And a defect class that kept
reappearing until it was named: **anything shown in two places had been defined
in two places, and had drifted** (§7).

---

## 1. The QR chain — 0.313mm → 0.737mm per module (#533, #534, #535)

Reported from a real print: the credit-card-size pack card scans with an iPhone
camera, but reluctantly.

**Not the printer.** The guest URL was `https://favpoll.com/favpolls/<uuid>` —
65 characters, 36 of them the UUID — which at error-correction H is a **49×49**
QR. At the wallet scale's 58px (15.35mm) each module was **0.313mm**, under the
~0.4mm floor printed codes need. Domestic ink spread merges adjacent modules at
that size; the printer only exposed a code already at the edge.

Three levers, applied in order:

|      | change                    | mm/module |
| ---- | ------------------------- | --------- |
| —    | as reported               | 0.313     |
| #533 | 58px → 84px               | 0.454     |
| #534 | short URL, 49×49 → 33×33  | 0.673     |
| #535 | 84px → 92px (the ceiling) | **0.737** |

**2.35× the module size**, and the card is the same 85.6 × 54mm.

**URL length is the dominant variable, and the boundaries are worth keeping:**

| URL length       | modules at EC H |
| ---------------- | --------------- |
| ≤ 25 chars       | 29×29           |
| 26–34            | **33×33**       |
| 35–44            | 37×37           |
| 65 (the old one) | 49×49           |

The homepage QR looks so much cleaner than the pack card for exactly this
reason — it encodes `https://favpoll.com`, 19 characters.

**A corrected claim.** An early comment said a short URL would make modules 69%
bigger. Measured, it is **48%** (49 → 33). The 69% came from assuming ~30 chars
reached 29×29 without checking. Corrected in a follow-up commit on #533.

### The short link (#534)

`/p/<12 hex chars>` → `app/p/[code]/page.tsx`, resolving `favpolls.short_code`.

- **12 characters because length is FREE up to 12** — 4-char and 12-char codes
  both land on 33×33. Private favpolls are auth-gated, but public-UNLISTED ones
  rely on URL obscurity, so a guessable 6-char code would make them enumerable.
- **QR-ONLY, deliberately.** The QR encodes `/p/<code>`; the link an organiser
  copies stays `/favpolls/<uuid>`. Random hex is no more memorable than a UUID,
  so it delivers no HUMAN benefit — that only arrives with a MEANINGFUL slug
  (`favpoll.com/p/belinda-hartley`), which is separate work. Keeping the code
  off the public face leaves that option open rather than spending a favpoll's
  public identity on random hex. Both halves are asserted in organizer-row's
  tests.
- Where the two differ, the long form is kept wherever the URL is **navigated**
  rather than scanned: `display-screen` took a new `qrUrl` prop beside
  `favpollUrl`, because its chrome does `router.push(favpollUrl)`.
- The resolver is deliberately dumb — validate shape, resolve, hand off.
  Privacy stays the target page's job. **307 not 308**: a permanent redirect is
  cached indefinitely and would foreclose ever serving something else at
  `/p/<code>`.

### ⚠️ Migration ledger gap

`20260806100000_favpoll_short_code.sql` was applied to **staging via MCP** (1793
rows, 1793 distinct codes) and to **production BY THE FOUNDER, by hand**. The
production column, default and unique index all exist and are correct — but
there is **no migration ledger row** for it.

Worth knowing: this project's repo stamps and ledger stamps **already diverged
in late July**. `fk_indexes` and older match exactly; the three applied via MCP
since 2026-07-29 carry different stamps on both projects. So this project is no
longer really deploying via `supabase db push`. Reconciling that is a decision
about how migrations should be deployed, not a tidy-up — deliberately left.

**Also worth knowing: the project names mislead.** `favpoll-staging`
(eotqyintgusvzidymumb) holds 1793 favpolls and is what `.env.local` points at;
`favpoll` (kgwkpibkoecvwcundqtm) holds 20. Confirmed distinct — no id overlap.

---

## 2. The print pack followed the app theme (#535)

Started as "the grey borders don't print very clearly" and measurement found
something worse underneath. The card forces `bg-white` for print, but everything
ON it still took theme tokens. **Printed from dark mode**, against paper:

| element                | contrast         |
| ---------------------- | ---------------- |
| the protagonist's name | 1.09:1           |
| topic                  | 1.09:1           |
| step numbers           | 1.09:1           |
| borders                | 1.00:1 (gone)    |
| QR ink                 | rgb(243,245,252) |

White ink on white card stock — a dark-mode organiser printing table cards for a
funeral would have got blank paper. Latent rather than reported; the founder
prints in light mode.

**Fix: a `.paper` scope** pinning light token values regardless of the `.dark`
ancestor. A printed card is an artefact, not a surface of the app. The class
must restate EVERY token the pack consumes — a class has no light-mode selector
of its own, so anything omitted keeps leaking the dark value (the same trap that
produced an ice-on-ice page in the register theming exploration, PROJECT.md §14).

`--border` is deliberately darker there than the app's (0.91 → 0.66): **1.31:1 →
3.13:1**. Darker ink, not a thicker line — a thick faint line still prints muddy
where a thin dark one prints crisp.

**BrandedQR had to change to benefit.** It resolved colours from
`document.documentElement`, so no local scope could reach it; it now reads its
own node. Verified identical on every other surface:

| surface        | light         | dark             |           |
| -------------- | ------------- | ---------------- | --------- |
| home #how      | rgb(20,21,31) | rgb(243,245,252) | unchanged |
| display screen | rgb(34,34,91) | rgb(220,226,255) | unchanged |
| print pack     | rgb(10,11,15) | rgb(10,11,15)    | **fixed** |

**The keepsake page is the obvious next candidate** — the other printable
surface, same shape of bug, unchecked. Founder has parked it.

---

## 3. Copy (#531, #532)

**Register cards now all name the giving.** The fundraiser card was the tell:
its only "give" meant _give them an activity_, so the one register whose whole
point is raising money never mentioned charity.

Three decisions inside that:

- **memorial is one act, not two** — both gerunds hang off the same "by",
  because the pledge IS both halves;
- **"a gift to charity", not "their charity"** — /memorials is careful that the
  family names the recipient;
- **"fundraising", not "appeal" — and not "gamify".** That register spans a bake
  sale to a telethon and "appeal" is sector vocabulary fitting only the telethon
  end. "Gamify" is on the brand's own _what favpoll is not_ list.

**Home headline** → `Pick your favourite. Give what it's worth. See where it
stands.` The old one was written to caption the hero demo, which moved to the
register pages in #519–#522. "Reveal its standing" was captioning a reveal
ANIMATION no longer on the page, and with the demo gone it drifts toward the
PERSONAL reveal, which hero copy must never promise.

Rejected with measurements, so a revisit starts here:

- **the brand statement as headline** — at display size it breaks mid-clause
  and widows "love.", against its own never-break rule. At 18px it sits on one
  line, which is why it works as the subheader. It is also grammatically a coda.
- **"A way of giving that gives something back"** — reads as cashback beside a
  Create button.
- **two-beat candidates** — clean on desktop, broken mid-beat at 390px.

**The beats-never-wrap rule is HOME-ONLY and cannot be made hero-wide by
layout.** Home's beats are 404–427px; the register first-beats need 773–788px
against a pitch column of 795px at 1280 and **624px at 1024**. No cap fixes 624.
`max-w-3xl` in both modes buys /fundraisers one line back and nothing more.

`landing.cta.free` ("Free to create") sits **beside** the hero button, not
beneath: beneath costs 16px and tips 1280×800 — which #524 worked to make fit —
over the fold.

---

## 4. Bar fidelity (#531)

The demo polls capped their leader at 78–84% where the product normalises to the
leader: `widthPercent: round(item.total / max * 100)`, results/route.ts:129,
asserted at 100 in its own test. **The demos were depicting polls the product
cannot render.** Recomputed across all seven (3 router cards + 4 scenes) and
verified by parsing both files back against that formula.

No comment or decision record stood behind the old ceiling; it predates the
monorepo conversion.

---

## 5. The guest arc (#536)

`ProcessOverview` — five commits:

- **A fourth step, first in the sequence.** The arc opened on `selected`, a
  picker already in use, so it started mid-story and never showed the thing the
  rest resolves: the standings withheld. `arriving` is a LOCKED phase, so the
  card renders blurred decoy bars and the lock. Copy in `landing.how.arrive.*`.
- **The example is a hospice** (§6).
- **Band swap.** `#how` and `RegisterMatrix` were BOTH `bg-primary/5`, so the
  page ran purple · white · **tint · tint** · white. Now alternating.
  New token **`--band-tint`** = `color-mix(in oklab, var(--primary) 5%,
var(--background))` — the overview's sticky header must paint an OPAQUE
  backdrop over the band; `bg-primary/5` there would stack and roughly double.
- **Three fidelity fixes** (§7) and **vitest `testTimeout` → 15s**, project-wide.
  The long-flaky pledge-card test is entirely SYNCHRONOUS, so a timeout never
  meant it was waiting on something — a jsdom render was starved of CPU while
  117 files ran. Raising the ceiling fixes the class, not the one test that lost
  the race most often.

---

## 6. St Luke's, and the JustGiving question

The cause example moved from YoungMinds to **St Luke's (Cheshire) Hospice
(515595)** — hospices are the channel being approached next, and this scene now
carries the whole guest arc.

**NAMED, NOT BRANDED — a deliberate line.** Naming them matches how other scenes
name Marie Curie, Macmillan, Barnardo's. A LOGO would not: they are a prospect,
not a customer, and their mark on the homepage reads as endorsement before any
conversation. It is theirs to grant, and **"may we feature you?" is a better
opening than taking it** — worth having in your pocket for the meeting. The
occasion is a generic team walk, not one of their real named appeals, for the
same reason. If they say yes, the logo is one field (`logo_url`); the card
already renders it.

The card PRINTS the charity number, which is why getting it right mattered.

**On positioning as JustGiving.** The founder asked whether favpoll should carry
a "story" like a JustGiving campaign page, and whether that deviates too far.

Fetched the page. **Its story is two sentences.** The weight is elsewhere: 135
individual fundraisers, 8 teams, 40 recent donations with names and messages,
£54,427.80 with the Gift Aid split. The narrative is thin; the social proof is
thick.

So the answer given was: **don't add a story section; do consider the campaign
structure.** A long-form story fights two settled decisions — About is specified
to "tease the topic and the cause, but don't give too much away" (the
withholding IS the mechanic), and "a crowdfunding platform" is on the explicit
not-list. But _one campaign with many people each running a favpoll under it_ is
the thing JustGiving has that favpoll cannot currently do, and a hospice's
Midnight Walk is exactly its shape. **That is a real product concept — a parent
campaign, aggregate totals, a leaderboard of favpolls — and deserves its own
conversation rather than being smuggled in as "a story".**

---

## 7. The defect class of the day: shown twice, defined twice

Four instances surfaced independently before the pattern was named:

1. **Demo bar widths** vs the API's normalisation formula (#531)
2. **Topic header** — real page uses `PollHeading` default `lg` (17px); demo
   passed `md` (15px) (#536)
3. **Lock card** — the guest page showed the full teaching card (CTA bar, three
   numbered steps, shared-fund footer); the demo showed a bare pill (#536)
4. **Demo frame** — the traffic-light window bar lived inline in `LandingHero`,
   so the same product appeared framed in one place and bare in another (#536)

Two are now closed structurally: **`components/lock-card-content.tsx`** and
**`components/hero-demo-panel/demo-frame.tsx`**, each used by both surfaces. The
guest page keeps its Button/sticky wrapper; the demo uses a static div.

Related, same commit: the **lock POSITION** was an absolute overlay on the
reveal element alone, vertically centred, so it floated over the About text and
the topic ribbon. `poll-section` uses a shared GRID CELL instead, and the reason
is recorded there — **WebKit ignores `sticky` inside absolutely-positioned
ancestors**, so the card never pinned on Safari (found 2026-08-02). Matching the
structure inherits that fix.

**A test broke and was right to.** `hero-demo-panel` asserted the literal string
"For young minds" and failed the moment the charity changed. It now derives the
heading from the scene and asserts the BEHAVIOUR. Same failure mode as the stale
E2E specs in #526 — worth watching for elsewhere.

---

## 8. Carried forward

- **Default image for the cause card.** Every asset in `public/demo` is a
  person's portrait; a faceless cause wants a SCENE photo. Reusing a portrait
  would be wrong and taking St Luke's imagery worse. The field is ready —
  needs a file in `public/demo/`.
- **"iOS frame".** What shipped is the browser window bar the hero demo uses.
  There is no phone chassis in the codebase; that would be a new component.
- **Horizontal page scroll at 1180, 1024 and 768** on all three register pages.
  Confirmed against a stashed baseline, so it predates today. Same class as the
  overflow #524 fixed on the home hero, but on the demo hero. A real bug, so it
  outlives the don't-polish-the-register-pages call.
- **Keepsake page** — needs work (founder), and now with a known-shaped bug: the
  same dark-mode print failure #535 fixed on the pack.
- **Register pages are due heavy rework** (founder, this session). Don't polish
  them meanwhile; carry open register items into that rework. Their two-beat
  headlines wrap mid-beat and that is accepted until then.
- **Reveal-tension copy grammar** → generation prompts + About guidance. Still
  only in /memorials page copy.
- The word **"causes"** still appears nowhere on home.
- **`home.shines.title`** is a stale i18n key — `register-shines.tsx` was deleted
  in #515.

## 9. Diary

- **Thu 6 Aug — Sarah** (marketing, The British Hamper Company). First field
  test of /celebrations and /fundraisers as artefacts. Prep in
  `references/outreach-notes.md`. Both pages changed materially today. A menu,
  not a pitch — the wrong first impressions are the yield.
- **Fri 7 Aug, 14:30 — Goodstack call with Ethan.** Fees are the decider; brief
  in `references/goodstack-call-brief-2026-07.md`.
- Joy's network feedback still pending → wrong-impressions ledger.

## 10. Method notes that earned their keep

- **Measure the right pixel.** Three readings of the band/header seam said
  "VISIBLE" and all three were sampling errors — the pinned demo card, then
  twice the antialiased edge of the eyebrow's glyphs. Sample empty backdrop.
- **`getComputedStyle` composited over white is the wrong question** for a
  translucent tint on a dark background. Screenshot and read the pixels back.
- The **canvas trick still applies**: Chrome returns `lab()`/`oklab()`, and
  parsing those as RGB yields confident nonsense.
- **Simulate before committing** — headline candidates and QR sizes were both
  injected into the live DOM and measured before a line was written.
- **Content variants matter.** The "steps are taller than the QR" theory was
  built on one favpoll and disproved by querying for the longest content in the
  database.
- **A stale tunnel build cost a round of theorising** about QR position. Rule
  out "are you looking at current code?" before building a third hypothesis.
- **Typecheck catches fixture drift** — the `qrUrl`/`short_code` additions broke
  three stories and two test fixtures immediately, which is the system working.

## Suggested skills for the next session

- **`favpoll-context`** — always, at session start.
- **`favpoll-brand`** — any user-facing copy; it carries the headline history,
  the withhold/reveal pattern and the not-list that decided the JustGiving
  question.
- **`diagnose`** — if the register-page horizontal scroll is picked up.
- **`db-migrate`** — if the migration ledger reconciliation is tackled.
