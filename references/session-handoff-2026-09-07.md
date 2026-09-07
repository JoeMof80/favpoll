# Session handoff — 2026-09-06/07 (the money-and-checkout marathon)

The pledge economics reversed to the JustGiving posture, the pledge
flow was rebuilt end-to-end through same-night iterations to its final
three-step shape, wallets shipped and were device-verified live, and
two product nouns were renamed estate-wide. #732–#776 ALL MERGED
(main = 85dddf8); the founder drove on-device throughout.

## Merged to main (by arc)

1. **Appeal form + charity expectations (#732–#736, #742, #744–#745)**
   — manage FAB; eyebrow carries the charity (dropdown only on
   bare-URL create); live `favpoll.com/appeals/{slug}` preview; slug
   auto-follows Name until touched; blank date ⇒ blank time +
   evergreen hint, clear = always-visible outline X; goal presets
   £1000/£5000/£10000 + fill-line field; appeals.goal_amount +
   GoalProgress + "N pledges across M favpolls" + share label + trust
   line. Portal-era appeal wizard mapped in the concept note,
   deliberately NOT built pre-portal.
2. **Form geometry settled (#735, #737–#741)** — Cancel/Save h-11
   everywhere, all Cancels ghost; the close-date saga ended at
   DateTimePicker date button w-[175px] (175+8+128 = the popover's
   natural 311px, harness-measured after two reverted thrashes —
   restore-to-last-approved, then measure); wizard pledge-goal
   presets £100/£250/£500/£1000 (no comma — founder explicit).
3. **Generator honours Pair/Group (#743)** — grouping threaded through
   generateDraft with a plural prompt directive; cache key v4. CSV
   exports parked with reasoning (#746, outstanding-tasks §3).
4. **Two-line FAVOURITE/TOPIC header sweep (#747–#749)** — /record,
   /topics/[id], record-flow micros, topic-picker vignette, live
   display, keepsake (left-aligned to the 150mm column); rule: the
   eyebrow is the SAME SIZE as the topic line — colour separates,
   never scale. "See it for a celebration…" deleted from the homepage.
5. **The scroll-return saga closed (#750–#755)** — the true bug: the
   in-card pledge NEVER navigates; iOS loses the page's scroll when
   the full-screen overlay closes → reseatAfterOverlay scrollIntoViews
   the card's li. Supporting cast: consume-on-success return key
   (StrictMode double-mount ate consume-at-read), 10-min staleness,
   interrupt listeners only after first centring. Proven by the
   founder-run persistent on-device log — lesson memorialised
   (instrument on first "still doesn't work", push freeze while the
   founder tests).
6. **Pledge sheet calm (#756)** — tip default ~10% every tier (<£10 ⇒
   50p); split folded behind a quiet row; heading + info popover
   retired. (Superseded hours later by the flow rebuild, but the tip
   default survives.)
7. **THE MONEY MODEL REVERSED (#757)** — founder consciously undid
   2026-08-27 guest-pays: charge = pledge + tip ONLY; card processing
   absorbed at settlement (charity nets pledge minus its share;
   lib/card-fee.ts records all three eras and keeps the helpers for
   settlement math). The 100%/"in full" claim RETIRED estate-wide for
   "no platform fee" — footer, about, charities, appeal trust line,
   assure grid, pledge copy… and the stragglers a founder screenshot
   later exposed: the Stripe block's summary, the RECEIPT EMAIL, and
   the DRAFT GENERATOR's prompt (cache bumped v5 so old-claim drafts
   retire).
8. **THE FLOW (#758 → #759)** — four steps shipped (Pick → Amount →
   Split → Review & pay), then consolidated the same night to THREE.
   Final shape: Pick → Your pledge (TWO co-equal figures — FAVOURITES,
   the typed worth, presets set it; SHARED POT, typed extra on top;
   the slider between them only REBALANCES their sum, ranking-bar
   audition → divider slider → founder's two-figure mock; the live
   list re-prices beneath) → Review & pay (itemised bill, tip chips
   that RE-PRICE the PaymentIntent server-side with the Elements
   provider keyed on the secret, identity, payment). Penny-even
   allocations replaced whole-percentage shares (£2/3 = .67/.67/.66,
   never a 2p bulge) — and the same grammar later gave EACH CHARITY
   its own bill line (#762). Latent bug fixed en route: picking-is-
   optional (2026-08-17) was gated out at baseCanConfirm — no-pick
   guests hit a dead Next; allowEmptySelection opens the dialog's
   gate. Review page deduped (one total — the Stripe summary left the
   inline variant), then polished (#761: bigger bill, minimal
   signed-in identity).
9. **Two names fixed (#759, #766)** — "shared fund" → **shared pot**
   (float rejected as till-money; 27 files) and "wall of favourites" →
   **guest book** (guest list/pledge wall considered; fits every
   register incl. memorials; 25 occurrences). Identifiers, file
   names and #shared-fund anchors unchanged in both sweeps.
10. **Checkout refinement train (#766–#770, #772)** — ALL helper text
    out of Review & pay (the cull was review-only; the amount step's
    one caption came back by correction #767); the guest hide-switch
    removed — the name field IS the choice (typed appears, blank =
    "Someone"); guest fields styled to the Stripe grammar (label,
    44px, 10px radius) then moved BELOW the wallet buttons via a
    fieldsSlot threaded into CheckoutForm; dialog search inputs
    text-lg. Picker's chip-echo duplication challenged and defended
    (token-field grammar; each copy has a job).
11. **WALLETS (#763, #764, #773)** — Express Checkout row leads the
    payment block (Apple Pay/Google Pay/Link), divider only when a
    wallet reports available; ONE runPayment routine; wallet-sheet
    email backfills a blank guest email (receipt + withdrawal link +
    preflight all use it — Apple Pay guests never type). The card
    form suppresses its in-form wallets (Link banner duplicated).
    Preflight veto now DISMISSES the sheet (event.paymentFailed —
    #763 wrongly said express had no abort; founder hit the hanging
    sheet with his own account email) and the message + sign-in
    hand-off render beside the wallet buttons. **Apple Pay
    device-verified live on gamma.** PayPal parked post-launch with
    the architectural reason (#771: redirect method vs client-side
    pledge recording); launch checklist row 4b amended with the new
    stakes (#776: miss it and the wallet row silently vanishes).
12. **E2E + incidents** — the reveal-after-pledge walk learnt the
    three-step flow (#760). Turbopack served stale route manifests
    after the night's ~15 branch switches (whole routes 404ing);
    healed per-route with content nudges. Gamma's every-favpoll-404:
    the public page joins appeals(name, slug) and PROD had no appeals
    schema — SQL handed over, **founder applied it same night**
    (gamma verified working). The truncated memorial reveal: the
    controls row's -top-12 seal band overpainted the second line;
    fix one (#774, mt-8) was eaten by MARGIN COLLAPSE with space-y-4;
    fix two (#775, mt-12) verified by Playwright measurement
    (band clears by 28.5px; elementFromPoint hits the blockquote).

## Decisions & doctrine established

- **Fee posture**: charge = the parts; processing absorbed at
  settlement; say "favpoll takes no platform fee", NEVER 100%/"in
  full" (generator prompt included). lib/card-fee.ts is the era record.
- **Two-part entry model**: the pledge IS the favourites' worth; the
  pot is more, on top; a slider may only REBALANCE a visible sum —
  never divide a hidden total.
- The REVIEW page owns the bill, the tip, identity and payment; the
  amount page owns the money decision. Helper text lives on the
  amount page only (one caption).
- The Express row is the ONE wallet home; the card form is purely the
  fallback. Redirect payment methods (PayPal) are blocked on the
  persisted-draft mechanism, not a toggle.
- Copy nouns: shared pot; guest book. Never reintroduce the old names.
- Test-mode Apple Pay charges nothing real (real card in sheet, test
  token behind it); payment-method domains are PER-ACCOUNT (flip-day
  4b is a launch blocker).

## State of the world

- main = 85dddf8; ZERO open PRs; tree clean; serve on main. 45 PRs
  #732–#776 all landed this window.
- Prod Supabase now carries the appeals schema + goal_amount (founder
  ran the SQL 2026-09-07); gamma fully working, Apple Pay live.
- Watcher discipline evolved under fire: gh pr checks exits non-zero
  on ADVISORY failures (never gate on its exit code — parse columns);
  Vercel flashes transient fail rows (only bail if a fail survives
  two 90s re-looks); racing PRs need gh pr update-branch retries.
- Memories updated: fee-model eras (legal), pot/guest-book naming
  (shared-fund-mandatory), instrument-on-device, appeals (prod DDL
  applied).

## Deferred / founder-side

- Serve restart still owed (APPEALS_ADMIN_USER_IDS env glue); same
  var to add on Vercel.
- Flip-day: checklist §1b — 4b (live-mode Apple Pay domains) now a
  launch blocker; step 8 includes eyeballing the wallet buttons.
- PayPal post-launch (outstanding-tasks §3, with the design
  prerequisite); CSV exports parked earlier the same day.
- Stationery design week (founder's), portal appeal wizard trigger,
  regulator threads, updateClosesAt dead export, cron closed-shelf
  lag — all carried unchanged.
- Guest email field now explains nothing visibly (helper cull) — if
  real guests hesitate, the agreed escape hatch is a placeholder
  hint, not paragraphs.

## Gotchas earned

- MARGIN COLLAPSE defeats additive spacing math — adjacent block
  margins take the max. When an overlay band needs clearance, put the
  full figure on ONE margin, then MEASURE (the mt-8 miss cost a
  round; the mt-12 fix shipped with rect proof).
- Stripe's express confirm event HAS paymentFailed() — never assume a
  missing abort; check the installed d.ts (grep needs the QUOTED
  attr form: TW4 compiles data-[x=y] with quotes, `orientation="…"`).
- python-in-zsh-heredoc set-e hole struck ~5 more times (count
  asserts, prettier-reflowed anchors, ternary shells): writes before
  the assert LAND, the chain continues, half-PRs ship. Grep-guard
  after every python step; prefer structural slicing over long
  verbatim anchors; read the verbatim region FIRST when prettier has
  touched the file.
- Turbopack under branch-dancing corrupts its route manifest (404s on
  real routes) and its CSS scan misses files created mid-run — heal
  with per-route/content nudges; a clean serve restart is the real
  reset.
- Two environments hold DIFFERENT favpolls: a /favpolls/<uuid> link
  pasted between tunnel (staging DB) and gamma (prod DB) 404s
  legitimately — check which world the id lives in before debugging.
- gh pr checks exit code covers advisory lanes — a watcher gating on
  it deadlocks when only advisory E2E fails.
