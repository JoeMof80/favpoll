# Session handoff — 2026-07-29

For the next Fable session. State at close: **clean** — `main` at #425,
suite 1,132 green, no open PRs, nothing uncommitted. Continues
`session-handoff-2026-07-26.md` (#384–#393). Covers PRs **#395–#425**
across three days: the prod-environment stand-up + exemplar shakedown,
the Goodstack breakthrough, the Joy call outcomes, and the hero saga
that ended in a founder rollback.

---

## 1. ⚠️ THE HERO ROLLBACK — read before touching the sticky hero

**The founder rolled back all hero changes (#423) and is fixing it
himself. DO NOT touch the hero system without his explicit direction.**
He had `base-favpoll-hero.tsx` open in his IDE at session close.

The saga: name step-down sizing (#416, #419) → avatar clip on HIS
devices that never reproduced in Chromium/WebKit sweeps → pure-layout
avatar (#420) → static-hero simplification (#422, deleted all five
scroll animations, −103 lines) → avatar "too high" on his device →
**full revert (#423)** of #416/#419/#420/#422 to the pre-step-down
state (`788b87c^`): hero-layout with #393 subtitle-collapse + #395
scale/margin avatar; heroes at fixed `text-4xl sm:text-5xl`;
`heroNameSizeClass` removed from lib/display.

Facts that survive for whoever fixes it:
- All sticky offsets read `--hero-stuck-bottom` = 56 + hero
  `offsetHeight`, published by a ResizeObserver in `hero-layout.tsx`;
  `offsetHeight` INCLUDES the hero's `pt-6 md:pt-16` padding.
- Consumers: poll-section ribbon (`top-[var(--hero-stuck-bottom,10rem)]`
  + opaque backdrop panel), lock pill and sort tabs at `calc(var +
  3rem)`.
- The #395 design (scale transform + compensating negative margin) is
  the desync-prone piece: two values that must agree; on the founder's
  devices they visibly didn't (photo unscaled, margin applied → ribbon
  pinned into the photo). Environment cause never identified — his
  Chrome sat un-relaunched on a pending update throughout.
- The founder's stated direction: standardise the name at the smaller
  size (he likes it better) and make the positioning simple. The #422
  static approach (nothing animates, band pins as-is) matched that
  intent but its fixed avatar placement read "too high" to him.
- Lesson recorded: three environment-specific failures in one
  subsystem = the design has too many moving parts; also, when the
  founder's screenshot and your measurements disagree, suspect the
  design that PERMITS divergence, and dual-sweep with
  `* { transform: none !important }` injected.

## 2. Prod environment stood up (launch §1b steps 1–2 DONE)

- Prod Supabase `kgwkpibkoecvwcundqtm` provisioned via **staging schema
  dump as baseline** (the migration chain renames pre-migration tables
  — it CANNOT run from scratch; future rebuilds: dump staging), 41
  migrations marked applied via `supabase migration repair`, base seed
  run (135 topics / 4,021 items). May-prototype junk snapshotted then
  dropped.
- Vercel prod env repointed to prod Supabase + redeployed. Staging
  stays the seeded testbed (untouched, founder still tests there).
- `NEXT_PUBLIC_BASE_URL` temporarily = `https://favpoll-web-gamma.vercel.app`
  (favpoll.com → holding page → QR codes 404'd). **Flip back at launch
  step 7.** Printed QR packs made before the flip carry the vercel URL.
- `ANTHROPIC_API_KEY` added to prod env (generator was failing).
- Four founder-curated exemplars live: Stanley (memorial · Dog breed ·
  Dogs Trust), Joan & Arthur (golden wedding · Seaside town ·
  Alzheimer's), Ben's Channel Swim (fundraiser · Comfort food · RNLI),
  Warm plates this winter (cause · Part of a roast dinner · Trussell
  Trust). Topic **"Roast dinner" renamed "Part of a roast dinner"**
  (SQL on BOTH DBs first — seed matches by title; then seed.ts +
  batch-7 placeholder key; #407).
- Stripe test-mode assistant hidden (#406,
  `developerTools.assistant.enabled=false`); prod pledges are sandbox
  (real cards decline — the Joy message says so).

## 3. The caching double-bug (both landing-page freezes)

1. #408: the landing had no `revalidate`/`dynamic` → Next froze its
   FIRST render forever. `export const revalidate = 60`.
2. #411: STILL stale — Next's **Data Cache** stores Supabase GET
   responses and **survives deploys**; ISR re-rendered against a
   pickled query result. Fix: `createAdminClient` stamps
   `cache: "no-store"` on every fetch. **Rule: DB reads must never be
   fetch-cached; ISR caches the rendered page instead.**

## 4. The min-w-0 epidemic (same bug, three surfaces)

Grid/flex `min-width:auto` let wide content blow out containers,
defeating inner `truncate` and clipping siblings: poll page column
(#392, prior session), summary-card names/topics (#412), organizer-row
expanded panel (#421). **Review rule: any grid/flex child containing
truncatable or wide content needs `min-w-0`.**

## 5. Other fixes this window (all founder-caught on device)

- #405 BASE_URL/QR 404; #409 empty Context field camouflaged at /40 →
  /50 + "Add dates or other context" (About placeholder got the same
  fix in #424); #418 cause lock pill said "…Trussell Trust's favourite"
  → "Pledge to reveal our pick" (register grammar; tests pin it);
  #421 my-favpolls read settlement-only total_raised → `withLiveTotals`
  overlay (the money-model rule); #424 **iOS keyboard covered bottom
  sheets entirely** → `useKeyboardInset` (visualViewport) in
  ResponsiveOverlay lifts ALL dialogs (the #386 picker floor was a
  special case; keyboard lift needs founder device confirmation);
  #425 FABs raised above the mobile charity bar (`bottom safe-area +
  5.5rem`, `md:bottom-5`).
- Landing/list polish: #410 lg CTA + card chevron/hover link cues;
  #413 card avatars → rounded squares (radius scales by size).

## 6. Share feature + JustGiving positioning

- #414/#417: `ShareFavpollButton` — native sheet gated to
  `(hover:none) and (pointer:coarse)` ONLY (desktop share sheets are
  bad practice; desktop = copy-link + inline confirmation). Desktop:
  labelled button in the right rail; mobile: FAB; post-pledge inline
  share at the reveal peak (`pledgeJustConfirmed` only). 4 unit tests
  pin the pointer gate.
- `references/justgiving-positioning-2026-07.md` (#415): fee facts
  verified (their 0%+tips = our model — claim NO fee advantage; their
  1.9%+30p processing beats ours; their 5% Gift Aid agent fee is
  quotable only once Goodstack uplift confirms). Wedge: **the
  gathering** — "JustGiving asks you to give. favpoll asks you to take
  part." Borrow ledger: share BUILT; guest-wall messages agreed
  (post-Joy; no amounts beside messages, organiser hide control,
  optional field in YOUR DETAILS); homepage search DECLINED.

## 7. Goodstack — transformed (see disbursement-enquiries doc)

- **Ethan replied** (Josh forwarded the 20 July email) offering a
  30-min call; Joe replied proposing this week + sandbox access ahead.
  Call brief (`goodstack-call-brief-2026-07.md`) reordered: **fees
  first** ("net any applicable fees" vs the 100% promise — push
  platform-billed), fund-ingestion second, Gift Aid demoted to a
  one-line confirmation.
- **Gift Aid effectively answered YES**: Charity Commission flags the
  Foundation "Recognised by HMRC for gift aid"; the partner API has
  Gift Aid Declaration endpoints (`giftAidId`). Swiftaid stays benched.
- Public docs exist (`docs.goodstack.io`) but sandbox is provisioned,
  not self-serve; `engineering-support@goodstack.io` email drafted and
  HELD while the Ethan thread lives. Chase ladder stood down.

## 8. Joy — call happened (see celebrant-outreach doc + addenda)

No ethical concerns (scrutiny went to business viability); 99/100
memorials have charitable donations; QR-on-order-of-service already
normalising; funeral-director brochure-pack card = HER channel idea;
wakes > services; tip default ratified ("if you do that, it will
probably stay at 0%"). **Joe owes her the app link** — message drafted
in-conversation (thanks + link + Stanley pointer + test-mode payments
note + "whether you'd trust it as a business"; warm-pilot ask
deliberately held for the follow-up). A Stanley QR table-card image
was generated then dropped by the founder (file still in scratchpad).
`/memorials` audience door: unparked in principle, not yet built.

## 9. Housekeeping done this window

51 stale branches deleted; 7 stashes audited — register-keyed
/new-topic rewrite RESCUED from a stash (#397, live doc had described
the retired 15-occasion model) + admin cursor rule; obsolete stashes
dropped. ClosingLabel hydration mismatch suppressed (#396 — the
"script tag in ThemeProvider" console error was a symptom). Project
disk 9GB → 3.8GB (`apps/web/.next` is the regrower). Docker was
started for a supabase dump and may still be running.

## 10. Founder's court

- **Hero fix — his.** Stay out until directed.
- Ethan scheduling reply → call (brief is print-ready).
- Send the Joy message (draft ready; final device check of #424/#425
  first was advised).
- Stripe Link dashboard toggle (StILL pending; the pay step's
  "Onelink" block + double email field both die with it).
- Verify on device: keyboard-lifted dialogs (#424), FAB clearance
  (#425).
- Launch flip remainder: §1b steps 3–8 (live Stripe keys + webhook,
  Apple Pay domain re-registration, Clerk live keys, domain +
  BASE_URL flip-back, money-loop smoke test).

## 11. Parked / backlog (carried)

Guest-wall messages arc (agreed, post-Joy), `/memorials` audience page,
mobile-form pass, draft-first wizard, Doctor Who topic, Tier-2 topics,
react-hooks warning debt (28), E2E promotion to required, "Roast
dinner (the meats)" as an optional new topic (needs full placeholder
discipline).
