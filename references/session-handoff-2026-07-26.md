# Session handoff — 2026-07-26

For the next Fable session. State at close: **clean** — `main` at #393,
suite 1,128 green, no open PRs, nothing uncommitted. Continues
`session-handoff-2026-07-25.md` (#369–#382, dialog grammar + record
hexagon).

Covers PRs **#384–#393**: the friend-demo landing response, the
**guest identity model** (the window's big product work), and an
iOS device-testing sweep that caught one genuine money bug and one
genuine data leak. Every fix in this window was founder-screenshot- or
founder-log-driven.

---

## 1. The guest identity model (#387, #389, #390, #391) — READ THIS ONE

Decided with the founder across this window; the model as it now
stands:

- **One ACTIVE guest pledge per email per poll** (withdrawing frees
  it). Signed-in pledges have **no limit** — they stack. This
  asymmetry is deliberate: accounts are the identity-integrity answer.
- **First pledge stays frictionless** — "no account needed" is meant;
  nothing in the payment flow warns about future pledges (decided:
  say things at the moment they're needed).
- **Pre-charge preflight** (`guestPreflightState` action, ran by
  CheckoutForm BEFORE `stripe.confirmPayment`): account email →
  sign-in invitation; repeat guest email → sign-up invitation; both
  render a prefilled hand-off button
  (`/sign-in|/sign-up?email_address=…&redirect_url=<poll>`; both auth
  pages accept the param into Clerk `initialValues`). Account check
  wins when both apply. This ordering matters: the duplicate check
  used to fire AFTER the charge (see §3).
- **Claiming at signup**: Clerk `user.created` webhook links guest
  pledges on EXACT match to the VERIFIED primary email; keeps
  `guest_email`/`guest_token` (old withdrawal links keep working);
  skips withdrawn; sends a courtesy "pledges linked" email (the
  shared-inbox safeguard). Impersonation analysis: inbox control
  already held the withdrawal links, so claiming adds no surface;
  refunds only return to the original card.
- **Registered-but-signed-out** visitors are intercepted at preflight
  (sign-in invitation) so an orphaned guest pledge under an account
  email can never be created — which is why NO claim-on-login
  sweeping exists or is needed.
- Guest confirmation email carries one quiet create-an-account line.
- The pay step's guest identity is ONE "YOUR DETAILS" block (#390):
  email (required) + guest-wall name + hide toggle + merged caption.
  Email state lives in `use-pledge.guestEmail`; `CheckoutForm` takes
  it via `externalEmail` (validated/receipt/preflight/onSuccess same
  as its built-in field, which the live-card overlay still uses).

## 2. iOS sweep — the two serious catches

- **Guest reveal endpoint leaked the record** (#386):
  `/api/polls/[pollId]/reveal` returned the whole topic canon raw
  (`favourites select *`, no overlay) — a guest's post-pledge bars
  showed all-time record sums (£1.2K on a 1-pledge poll). It was the
  un-migrated "sixth fork" the `lib/poll-items` comment warned about.
  Now `fetchPollItems` + `pollStandings`/`overlayStandings`, matching
  every other surface. **Not iOS — guest-specific** (signed-in takes
  `router.refresh()`). Diagnosis trick: the on-screen numbers matched
  `favourites.all_time_pledged` byte for byte.
- **The frozen payment sheet was a charge-then-reject** (#387): a
  duplicate guest was charged by Stripe FIRST, then
  `createGuestPledge` threw; `handlePledgePaymentSuccess` had already
  nulled the client secret (checkout unmounted → empty sheet,
  orphaned submitting flag → "Processing…" forever, error rendered
  nowhere). Fixes: preflight before money moves; checkout stays
  mounted until the save succeeds; save failures re-throw and
  CheckoutForm shows them inline (retry cannot double-charge — Stripe
  rejects re-confirming a succeeded PI). Two orphaned succeeded PIs
  from the founder's test (sandbox) will surface in the reconcile
  cron.
  **Diagnosis lesson: the founder's dev server log
  (`apps/web/.next/dev/logs/next-development.log`) had the exact
  error at the exact timestamps — read it before theorising.** Note
  the founder runs his OWN dev server on :3000 (pinggy tunnel to his
  phone); mine took :3001 when both ran.

## 3. iOS sweep — the layout catches

- **562px column on a 390px viewport** (#392): `PageLayout`'s left
  grid item lacked `min-w-0`; grid `min-width:auto` let the
  rank-history chart's 520px intrinsic SVG (inside `overflow-x-auto`)
  force the whole column wide; `overflow-x-clip` then silently cut it
  — right margin gone, avatar off-screen. Found by probing
  `min-content` widths element-by-element in the live page. Desktop
  never showed it.
- **Stuck-hero dead space** (#393): the hero fades the subtitle
  ("1942 – 2025") to opacity 0 but left it IN LAYOUT — ~36px of
  invisible space pushing the sticky topic ribbon too low. The
  subtitle now collapses via max-height as it fades (floor 12px, NOT
  0 — founder flagged zero as crowding the name mid-review); the
  hero's ResizeObserver republishes `--hero-stuck-bottom`
  automatically. Mobile avatar scroll-shrink: 0.9 end-scale (72px =
  eyebrow+name block); desktop keeps 0.635.
- **Chips** (#386): size classes are `min-h` + `py`, never `h-` —
  fixed heights spill wrapped labels outside the pill (tw-merge: the
  later size class beat the base `h-auto`).
- **Bottom-sheet keyboard floor** (#386): the picker step body has
  `min-h-80` — filtering the chips used to shrink the sheet behind
  the iOS keyboard.

## 4. Landing response to the friend demo (#385, #384)

- **Guest-arc prose strip**: the #how section opens with the headline
  explained clause by clause (landing.how.* in en-GB.json). The
  Create/Share/Watch vignettes are deliberately organiser-only and the
  demo enacts the guest arc wordlessly — before this, NO prose on the
  page said what favpoll is.
- **Random demo opening scene**: picked post-hydration (Math.random
  initializer would mismatch SSR), before the reduced-motion return,
  without consuming the first-paint hold. Reduced-motion hero tests
  pin Math.random (they assert start-scene content — failed 1-in-4
  until pinned).
- **Register-specific branding: settled position** — homepage stays
  universal (the occasion-cycling experiment was tried and retired
  17 Jul); separate audience LANDING PAGES (`/memorials` first) are
  compatible and agreed, but **build timed against the Joy
  conversation**, not speculatively.
- #384: demo picker had double padding (its wrapper + the InputGroup
  #381 added); reveal quote border now spans the reserved height from
  the first keystroke (PollReveal `h-full` inert-in-flow trick;
  TypedReveal reserves height with an invisible copy placed AFTER the
  typed blockquote — tests read the first `[aria-hidden]` as the
  typing surface).

## 5. Environment notes

- **Storage**: project was 9GB — 4.3GB `apps/web/.next` dev cache +
  945MB stray root `.next`. Deleted (regenerates). `pnpm store prune`
  freed 1,529 packages; the 11GB store that remains is referenced by
  other projects on disk. `.next` is the regrower — first place to
  look.
- **Apple Pay on the tunnel**: pinggy free subdomains rotate; each new
  one needs registering in Stripe Dashboard → Payment method domains
  (server log says it plainly when unregistered). Launch flip still
  needs the production domain registered (outstanding-tasks §1b 4b).
- CI has no `RESEND_API_KEY`: any route test importing `lib/email`
  must mock it (module-level `new Resend()` throws) — local passes
  because `.env.local` has the key.

## 6. Founder's court

- **Stripe Link toggle** — STILL pending; the "Onelink" block remains
  most of the pay step's residual noise AND the source of the
  double-email complaint. Dashboard → Settings → Payment methods →
  Link off.
- Re-test on device: the three preflight paths (repeat guest /
  account email / fresh), the claimed-pledge signup flow, and the
  poll page layout fixes.
- Leo (Gift Aid answer; Josh chase ~27 July), Joy (call sheet
  printed; landing URL only), seeded-cohort keep-or-wipe, Vercel CLI
  re-auth.

## 7. Parked / backlog (carried)

`/memorials` audience page (waiting on Joy), mobile-form pass,
draft-first wizard, Doctor Who topic, Tier-2 topics, react-hooks
warning debt (28), E2E promotion to required.
