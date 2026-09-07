# Outstanding tasks — favpoll (as of 20 July 2026)

Organised by who's blocking what. Pulled from `PROJECT.md` Outstanding TODO,
the growth doc, and recent sessions. For everything shipped 10–20 July, see
`references/session-handoff-2026-07-20.md` (PRs #248–#298).

---

## 1. Your court — config / ops (gate real launch, not code)

| Task                                | Detail                                                                                                                                                                                                                                                                                                                                                                                               | Priority        |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| ~~Stripe webhook — configure it~~   | DONE 2026-07-21, verified end-to-end: endpoint lives in the **FavPoll sandbox** Stripe environment (`payment_intent.succeeded` → `/api/webhooks/stripe`), `STRIPE_WEBHOOK_SECRET` set in Vercel production. A real test pledge → webhook event → `reconciled: 1, unmatched: 0`. Clerk webhook secret still needs setting.                                                                            | —               |
| ~~Verify crons fire~~               | ROOT CAUSE FOUND + FIXED 2026-07-21: `CRON_SECRET` was never set in production, so every scheduled run 401'd silently since day one. Now set (Vercel prod env); `close-favpolls` (hourly :00) and `reconcile-payments` (hourly :30) authenticate — confirm the first scheduled `close-favpolls` run in Vercel → Cron Jobs, which will close any backlog in one batch (organiser emails per favpoll). | Med (observe)   |
| **Clerk production keys**           | Still `pk_test_` until `favpoll.com` points at the app; swap to `pk_live_`.                                                                                                                                                                                                                                                                                                                          | Med (at launch) |
| **`PARTNERSHIPS_EMAIL` in web env** | The charity "Get in touch" link falls back to support without it.                                                                                                                                                                                                                                                                                                                                    | Low             |
| **Real-device pass**                | New mobile hero (centred block), mobile menu (dropdown + blur + account rows), card interactions — check on an actual iPhone.                                                                                                                                                                                                                                                                        | Med             |

## 1b. Launch environment checklist (written 2026-07-21 — the night the prod env was untangled)

Production currently runs as a **deliberate mirror of staging** — decided
2026-07-21 after discovering prod pointed at an empty, unmigrated Supabase
project, carried live-mode Stripe keys, and had no `CRON_SECRET`. One world
until launch; this checklist is the flip:

| #   | Step                                 | Detail                                                                                                                                                                                                                                             |
| --- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ~~**Provision the prod database**~~  | **DONE 2026-07-28.** The migration chain was NOT self-contained (earliest migration renames pre-migration tables), so provisioned by **staging schema dump as baseline**: `supabase db dump` from staging → `DROP SCHEMA public CASCADE` on prod (held only 9 May prototype junk — 7 old-model `polls` + 39 `poll_items`, snapshotted first) → baseline applied via `supabase db query --file` → all 41 migrations marked applied via `supabase migration repair`. Then `pnpm seed` with prod env: **135 topics, 4,021 items, charities, full 5-register placeholders.** Exemplar favpolls still to create (founder, via the UI — for the Joy review). |
| 2   | ~~**Repoint Vercel prod Supabase env**~~ | **DONE 2026-07-28.** All three vars repointed to `kgwkpibkoecvwcundqtm` (values from `.env.production-web`) via Vercel CLI (token had self-refreshed), production redeployed and **verified serving the prod DB** (0 open favpolls, no staging fingerprints). Staging testbed untouched — local/tunnel testing continues on seeded data. |
| 3   | ~~**Swap Stripe to live mode**~~         | **DONE 2026-09-07** (founder-run scripts; the CLI bypassed the dashboard's secret+public-prefix validation dead-end). Live keys from `.env.production-web` onto favpoll-web production; `pk_live_` verified in the served bundle chunks. |
| 4   | ~~**Create the LIVE webhook**~~          | **DONE 2026-09-07**: fresh live endpoint (`we_1UD3m1…`) at `https://favpoll.com/api/webhooks/stripe`, its `whsec` stored; July's gamma-pointed live endpoint (unknown secret) deleted. Receipt verified sub-second on both smoke pledges. |
| 4b  | ~~**Re-register Apple Pay domain**~~     | **DONE 2026-09-07**: favpoll.com + www registered in LIVE mode — apple_pay/google_pay/link all ACTIVE; proven with a real on-device Apple Pay pledge (wallet-email backfill worked in production). |

| 5   | **Clerk live keys + de-branding**    | `pk_test_` → `pk_live_` once `favpoll.com` points at the app. The production instance also carries the remaining Clerk-branding fixes (founder, 2026-09-07): the "Development mode" badge disappears automatically; set CUSTOM Google/Apple OAuth credentials so the consent screen says favpoll, not "continue to Clerk"; dashboard branding toggle (paid plan) removes "Secured by Clerk" from the sign-in card and profile modal. The header dropdown is already ours (#account-menu). |
| 6   | ~~**Re-verify crons**~~                  | **DONE 2026-09-07**: reconcile-payments ran live at 15:30:32 UTC, authenticated, and stamped both smoke events `reconciled_kind: pledge`. close-favpolls uses the same auth (spot-confirmed on the next hourly tick). |
| 7   | ~~**Domain**~~                           | **DONE 2026-09-07**: favpoll.com moved (domain object personal scope → favpoll team; stuck cross-scope challenge cleared via `_vercel` TXT), attached to favpoll-web, apex aliased to production; www 308→apex; `NEXT_PUBLIC_BASE_URL` baked (zero gamma refs in served HTML). favpoll-holding no longer serves. |

| 8   | ~~**Smoke test the money loop**~~        | **DONE 2026-09-07** (founder, real money): Apple Pay pledge £1 + 50p tip (wallet `apple_pay`, sheet-supplied email) and card pledge £1 — each verified PI → webhook receipt (sub-second) → recorded pledge (parts exact) → reconciled 15:30. Two gamma-era sandbox pledges (£50+£5 ×2) deleted from the prod DB with their allocations/events. |


Gotchas learned the hard way: JWT keys start `eyJ…` (a clipped paste stores
an invalid key that fails SILENTLY into empty pages); `NEXT_PUBLIC_*` vars
are build-inlined (redeploy after changing them); the old Vercel CLI's
`env add` can store empty values — use the dashboard or REST API and verify
with `vercel env pull`.

## 2. Business / waiting

| Task                                   | Detail                                                                                                                                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~Goodstack (lead disbursement rail)~~ | **RETIRED (founder, 2026-09-06/07 — stated twice).** The enquiry/chase history stands in `references/disbursement-enquiries-2026-07.md` as record. The disbursement rail is an OPEN question again; the Gift Aid confidence that rode on Goodstack's HMRC recognition reopens with it. |
| **PPGF**                               | Was demoted to Gift-Aid-only interest while Goodstack led; with Goodstack retired, PPGF/CAF/Swiftaid are back on the open rail question.                                                                                                                                            |
| **Stripe Connect**                     | Application pending approval; disbursement not wired (cron has a placeholder).                                                                                                                                                                                                     |

## 3. Buildable code features (still open)

- **CSV exports — parked deliberately (2026-09-06).** A favpolls-level
  export is near-valueless at current volumes; the pledge-level export
  people would actually want (per-guest amounts, emails) is a GDPR
  posture decision — guests gave that data to favpoll, not necessarily
  the organiser — and charity reconciliation belongs to the
  eventual disbursement/Gift Aid rail (open question). Revisit when the professional audience
  (celebrants/planners running many favpolls) or the charity portal
  arrives; design per-favpoll/per-appeal with the privacy line first.

- **PayPal — parked for after launch (2026-09-07).** Not a toggle: PayPal
  via Stripe is a REDIRECT method, and pledge recording happens
  client-side after confirmPayment resolves in the open dialog — a
  redirect return would charge the guest and record nothing (the same
  reason payment-intent pins `card`). Building it means a persisted
  pledge draft surviving the redirect + return-param completion on
  load. With Apple Pay/Google Pay/Link/card live (#763/#764), the
  marginal audience is desktop PayPal-balance users. Revisit on guest
  demand; design the redirect-safe recording first.

| Task                                       | Notes                                                                                                                                                                            | My steer                                                                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Mobile-form pass**                       | Goal + closing-date editing are desktop-only (`hidden md:block`).                                                                                                                | **Best next build** — real usability gap, self-contained, no dependency/decision needed.                                   |
| ~~Wallet payments (Apple/Google Pay)~~ | DONE 2026-09-07 (#763/#764): Express Checkout row leads the payment block; card form suppresses its in-form wallets; Apple Pay verified live on the registered domain. | Shipped. |
| **Featured tiles on /favpolls**            | Wider first-row cards for closing-soon / highest-raised (the Polymarket move).                                                                                                   | Judge against real photo'd data first — the value row + photos may be enough.                                              |
| ~~/record links vs "Coming soon"~~         | DONE 2026-07-21 (#310): header/footer/about links hidden with restore-at-launch comments; topics breadcrumb kept.                                                                | Resolved as "hide until the record launches".                                                              |
| **Card money-figure dedupe**               | Single-charity cards show the same figure twice (value row total = footer share).                                                                                                | Watch it in real use; dropping the footer amount on cards is a one-liner.                                                  |
| **Localisation**                           | `t()` + `messages/en-GB.json` + `MARKET_DEFAULTS` in place; vignette content lives in top-of-file constants (per-market exemplar packs later). See `references/LOCALISATION.md`. | Hold until a 2nd market has a payout rail; keep the two disciplines (headline copy through `t()`, exemplars in constants). |
| **Transactions ledger → shared-fund tips** | Pot top-ups are bare counter increments; SeedFundModal can't record a tip yet.                                                                                                   | Gated on the ledger that disbursement (rail TBD) will force.                                                      |
| **Print-pack v2**                          | Order-of-service insert, per-register card variants, "in lieu of flowers" cards.                                                                                                 | Nice-to-have; extends the shipped v1.                                                                                      |
| **Gift Aid**                               | Growth doc's biggest UK lever (+25%, zero donor cost).                                                                                                                           | Research-then-scope; sequencing depends on the (reopened) rail decision.                                                 |
| **B2B funeral-director tier**              | White-label live display, printed QR packs, a dashboard.                                                                                                                         | Strategic, larger; start as a conversation.                                                                                |
| **Physical stationery / merch**            | Hero-SKU direction (letter-of-wishes kit, biscuit cutter, monogram wrap…).                                                                                                       | Genuinely physical/future.                                                                                                 |
| **/favpolls pagination**                   | 60-row fetch; "Load more" when it outgrows it. Older polls (incl. a founder-pledged one) already fall outside the window in dev.                                                 | When real volume approaches 60.                                                                                            |

## 3b. Survey follow-ups (2026-07-20 — see references/audits/architecture-survey-2026-07-20.md)

| Task                         | Notes                                                                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~Close-cron atomicity~~     | FIXED 2026-07-21: disbursements upsert first (duplicate-safe on favpoll_id+charity_id), close marker last — any failure leaves the favpoll open for retry. |
| ~~Live display item source~~ | FIXED 2026-07-21 (#306): `lib/poll-items.fetchPollItems` — the shared rule the other item-sourcing forks migrate to.                                       |
| ~~poll-standings row cap~~   | FIXED 2026-07-21 (#311 pagination + #317 join/chunk rewrite): every money read pages via `fetchAllRows`; id-list filters chunked at 100. |
| ~~Hygiene sweeps~~           | DONE 2026-07-21 (#313 formatters, #314 dead code, #315 ESLint gate). Item-source forks on the two list pages migrate as touched (`lib/poll-items` note). |
| **RLS posture**              | No policies anywhere by design (service-role only); document, and never add anon-key queries without revisiting.                                           |
| **Shelf 60-cap (parked)**    | /favpolls shows the newest 60 (`page.tsx .limit(60)`) — deliberate, and load-bearing (standings aggregate per card). Decided 2026-07-21: keep for launch. Eventual answer is "Load more" (cursor on created_at, 60/page) — but decide first whether the shelf is a shop window (recent-60 is right) or a finder (then it needs search, not depth). |
| **Scale-seed cohort live**   | 1,503 seeded favpolls + 56k pledges in the shared staging DB (2026-07-21, #317) for scale testing. Tear down with `pnpm seed:scale -- --wipe` when done. |

## 4. Doc hygiene (minor)

- `PROJECT.md` print-pack TODO still says `qrcode.react` — replaced by
  `BrandedQR` (`qr-code-styling`) in PR #197.
- A few migration lines read "production pending" though they've since been run.
- Founder's `h-174` hero tweak lives uncommitted in the working tree — fold
  into the next hero PR.
- Quick tidy pass available on request.

---

**Shipped 10–20 July (headline items; full detail in the 2026-07-20
handoff):** landing in current form (triad headline, recast vignette cast —
Jess's 30th, Grandad story — record vignette + Coming soon, shelf
convention), card unification + photos + value row, the money/standings
model (`lib/poll-standings`, `favpoll_live_totals` RPC), dark-mode pill fix,
cause wizard path + e2e spec, E2E teardown unlisting, seed canon expansion,
About definition + FAQ, mobile menu, my-favpolls row list.

**Shipped in the 6-July session (for reference):** 0% fee + tiered tips,
guest wall + anonymity, record threshold + breadth, both bump-chart
surfaces, keepsake PDF, charity pages + index + impact statements + claim
link, admin dashboard + access + oversight + restyle, Charity Commission
verification + register typeahead, rate limiting, branded emails, print
pack, branded QR, and the single-mark lattice hero texture.
