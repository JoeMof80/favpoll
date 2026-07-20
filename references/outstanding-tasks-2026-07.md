# Outstanding tasks — favpoll (as of 20 July 2026)

Organised by who's blocking what. Pulled from `PROJECT.md` Outstanding TODO,
the growth doc, and recent sessions. For everything shipped 10–20 July, see
`references/session-handoff-2026-07-20.md` (PRs #248–#298).

---

## 1. Your court — config / ops (gate real launch, not code)

| Task                                | Detail                                                                                                                                                                                                                                                                                                                             | Priority        |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **Stripe webhook (reconciliation)** | Correction (2026-07-20 survey): no Stripe webhook route exists at all — the blank secret was moot. Payment truth is now server-verified at save (PR #301); a webhook remains wanted to reconcile the charged-but-unrecorded window (client dies after confirmPayment). Clerk webhook route exists; its secret still needs setting. | High            |
| **Verify crons fire**               | Both handlers are GET now, but no scheduled run confirmed in Vercel → Cron Jobs since the fix. First real `close-favpolls` run closes any backlog in one batch (organiser emails per favpoll). Note: `total_raised` is only written at close (settlement figure) — live surfaces already compute their own sums.                   | High            |
| **Clerk production keys**           | Still `pk_test_` until `favpoll.com` points at the app; swap to `pk_live_`.                                                                                                                                                                                                                                                        | Med (at launch) |
| **`PARTNERSHIPS_EMAIL` in web env** | The charity "Get in touch" link falls back to support without it.                                                                                                                                                                                                                                                                  | Low             |
| **Real-device pass**                | New mobile hero (centred block), mobile menu (dropdown + blur + account rows), card interactions — check on an actual iPhone.                                                                                                                                                                                                      | Med             |

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
| **Featured tiles on /favpolls**            | Wider first-row cards for closing-soon / highest-raised (the Polymarket move).                                                                                                   | Judge against real photo'd data first — the value row + photos may be enough.                                              |
| **/record links vs "Coming soon"**         | Landing record section says Coming soon (no link); header + footer still link `/record`.                                                                                         | Decision, not build: hide the nav links until the record launches, or accept the tension.                                  |
| **Card money-figure dedupe**               | Single-charity cards show the same figure twice (value row total = footer share).                                                                                                | Watch it in real use; dropping the footer amount on cards is a one-liner.                                                  |
| **Localisation**                           | `t()` + `messages/en-GB.json` + `MARKET_DEFAULTS` in place; vignette content lives in top-of-file constants (per-market exemplar packs later). See `references/LOCALISATION.md`. | Hold until a 2nd market has a payout rail; keep the two disciplines (headline copy through `t()`, exemplars in constants). |
| **Transactions ledger → shared-fund tips** | Pot top-ups are bare counter increments; SeedFundModal can't record a tip yet.                                                                                                   | Gated on the ledger that disbursement (Connect/Goodstack) will force.                                                      |
| **Print-pack v2**                          | Order-of-service insert, per-register card variants, "in lieu of flowers" cards.                                                                                                 | Nice-to-have; extends the shipped v1.                                                                                      |
| **Gift Aid**                               | Growth doc's biggest UK lever (+25%, zero donor cost).                                                                                                                           | Research-then-scope; sequencing now depends on the Goodstack conversation.                                                 |
| **B2B funeral-director tier**              | White-label live display, printed QR packs, a dashboard.                                                                                                                         | Strategic, larger; start as a conversation.                                                                                |
| **Physical stationery / merch**            | Hero-SKU direction (letter-of-wishes kit, biscuit cutter, monogram wrap…).                                                                                                       | Genuinely physical/future.                                                                                                 |
| **/favpolls pagination**                   | 60-row fetch; "Load more" when it outgrows it. Older polls (incl. a founder-pledged one) already fall outside the window in dev.                                                 | When real volume approaches 60.                                                                                            |

## 3b. Survey follow-ups (2026-07-20 — see references/audits/architecture-survey-2026-07-20.md)

| Task                         | Notes                                                                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Close-cron atomicity**     | `closed_at` written before the disbursements insert; a ledger failure silently drops a payout. Make transactional or re-selectable. |
| **Live display item source** | `/live/[slug]` reads the whole topic canon — wrong for infinite/guest-curated topics.                                               |
| **poll-standings row cap**   | Unbounded `.in()` queries silently truncate at PostgREST's 1,000-row default on popular polls.                                      |
| **Hygiene sweeps**           | One money formatter (10+ forks), one `sourceItems` helper (5 forks), dead `PledgePanel` trio, CI: add ESLint job + admin Prettier.  |
| **RLS posture**              | No policies anywhere by design (service-role only); document, and never add anon-key queries without revisiting.                    |

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
