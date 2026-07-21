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
| 1   | **Provision the prod database**      | Supabase project `favpoll` (`kgwkpibkoecvwcundqtm`) is bare — apply all `supabase/migrations/**` in order, run `pnpm seed` against it (topics/charities/placeholders), and seed exemplars.                                                         |
| 2   | **Repoint Vercel prod Supabase env** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` → the `favpoll` project's values (currently = staging `eotqyintgusvzidymumb`).                                                                            |
| 3   | **Swap Stripe to live mode**         | `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → the main favpoll account's LIVE keys (currently = the "FavPoll sandbox" test keys, acct `…F29w5QLsoQ`).                                                                               |
| 4   | **Create the LIVE webhook**          | In the main account's live mode: destination `payment_intent.succeeded` → `https://favpoll.com/api/webhooks/stripe`; set its `whsec_…` as prod `STRIPE_WEBHOOK_SECRET`. (Stripe sandboxes are isolated — the sandbox webhook will NOT carry over.) |
| 5   | **Clerk live keys**                  | `pk_test_` → `pk_live_` once `favpoll.com` points at the app (existing row above).                                                                                                                                                                 |
| 6   | **Re-verify crons**                  | `CRON_SECRET` survives env edits, but confirm both cron jobs authenticate post-swap (close-favpolls :00, reconcile-payments :30).                                                                                                                  |
| 7   | **Domain**                           | Point `favpoll.com` at the Vercel project; update the Stripe webhook URL (step 4) and any `NEXT_PUBLIC_BASE_URL`.                                                                                                                                  |
| 8   | **Smoke test the money loop**        | One real small-value pledge end-to-end: verified record → webhook event → reconciled. The same three-step check used to verify staging on 2026-07-21.                                                                                              |

Gotchas learned the hard way: JWT keys start `eyJ…` (a clipped paste stores
an invalid key that fails SILENTLY into empty pages); `NEXT_PUBLIC_*` vars
are build-inlined (redeploy after changing them); the old Vercel CLI's
`env add` can store empty values — use the dashboard or REST API and verify
with `vercel env pull`.

## 2. Business / waiting

| Task                                   | Detail                                                                                                                                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Goodstack (lead disbursement rail)** | Leo Chandler + Elani Buchan messaged on LinkedIn — no reply. **Josh Radford emailed 20 July** (sent copy in `references/disbursement-enquiries-2026-07.md`); chase trigger ~27 July if silent, then Henry Ludlam, then CAF warming. Gift Aid question reserved for the reply/call. |
| **PPGF**                               | Demoted to Gift-Aid-only interest; Goodstack is the lead rail. CAF/Swiftaid remain the Gift Aid fallback.                                                                                                                                                                          |
| **Stripe Connect**                     | Application pending approval; disbursement not wired (cron has a placeholder).                                                                                                                                                                                                     |

## 3. Buildable code features (still open)

| Task                                       | Notes                                                                                                                                                                            | My steer                                                                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Mobile-form pass**                       | Goal + closing-date editing are desktop-only (`hidden md:block`).                                                                                                                | **Best next build** — real usability gap, self-contained, no dependency/decision needed.                                   |
| **Wallet payments (Apple/Google Pay)** | Scoped 2026-07-21 (`references/wallet-payments-scope-2026-07.md`): PaymentElement is already wallet-ready; work = Apple Pay domain file + registration, device QA. ~½ day. | High-leverage, small: wallets fit the phone-in-hand guest moment. Borrowed from the pledge.to evaluation. |
| **Featured tiles on /favpolls**            | Wider first-row cards for closing-soon / highest-raised (the Polymarket move).                                                                                                   | Judge against real photo'd data first — the value row + photos may be enough.                                              |
| ~~/record links vs "Coming soon"~~         | DONE 2026-07-21 (#310): header/footer/about links hidden with restore-at-launch comments; topics breadcrumb kept.                                                                | Resolved as "hide until the record launches".                                                              |
| **Card money-figure dedupe**               | Single-charity cards show the same figure twice (value row total = footer share).                                                                                                | Watch it in real use; dropping the footer amount on cards is a one-liner.                                                  |
| **Localisation**                           | `t()` + `messages/en-GB.json` + `MARKET_DEFAULTS` in place; vignette content lives in top-of-file constants (per-market exemplar packs later). See `references/LOCALISATION.md`. | Hold until a 2nd market has a payout rail; keep the two disciplines (headline copy through `t()`, exemplars in constants). |
| **Transactions ledger → shared-fund tips** | Pot top-ups are bare counter increments; SeedFundModal can't record a tip yet.                                                                                                   | Gated on the ledger that disbursement (Connect/Goodstack) will force.                                                      |
| **Print-pack v2**                          | Order-of-service insert, per-register card variants, "in lieu of flowers" cards.                                                                                                 | Nice-to-have; extends the shipped v1.                                                                                      |
| **Gift Aid**                               | Growth doc's biggest UK lever (+25%, zero donor cost).                                                                                                                           | Research-then-scope; sequencing now depends on the Goodstack conversation.                                                 |
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
