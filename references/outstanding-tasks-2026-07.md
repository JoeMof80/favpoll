# Outstanding tasks — favpoll (as of 6 July 2026)

Organised by who's blocking what. Pulled from `PROJECT.md` Outstanding TODO,
the growth doc, and this session's work.

---

## 1. Your court — config / ops (gate real launch, not code)

| Task | Detail | Priority |
| --- | --- | --- |
| **Webhooks** | `CLERK_WEBHOOK_SECRET` + `STRIPE_WEBHOOK_SECRET` blank in Vercel. Stripe's is the important one — without it, payment truth rests on the client success callback. | High |
| **Verify crons fire** | Both handlers are GET now, but no scheduled run confirmed in Vercel → Cron Jobs since the fix. First real `close-favpolls` run closes any backlog in one batch (organiser emails per favpoll). | High |
| **Clerk production keys** | Still `pk_test_` until `favpoll.com` points at the app; swap to `pk_live_`. | Med (at launch) |
| **`PARTNERSHIPS_EMAIL` in web env** | The charity "Get in touch" link falls back to support without it. | Low |

## 2. Business / waiting

| Task | Detail |
| --- | --- |
| **PPGF partnership reply** | Chasing ~18 July. Gates the open-charity-register move **and** the Gift Aid approach (PPGF handles Gift Aid itself). |
| **Stripe Connect** | Application pending approval; disbursement not wired (cron has a placeholder). |

## 3. Buildable code features (still open)

| Task | Notes | My steer |
| --- | --- | --- |
| **Mobile-form pass** | Goal + closing-date editing are desktop-only (`hidden md:block`). | **Best next build** — real usability gap, self-contained, no dependency/decision needed. |
| **Localisation** | `next-intl`, string extraction, US-market prep. Discipline already in place. | Hold until a 2nd market has a payout rail. |
| **Transactions ledger → shared-fund tips** | Pot top-ups are bare counter increments; SeedFundModal can't record a tip yet. | Gated on the ledger that disbursement (Connect/PPGF) will force. |
| **Print-pack v2** | Order-of-service insert, per-register card variants, "in lieu of flowers" cards. | Nice-to-have; extends the shipped v1. |
| **Gift Aid** | Growth doc's biggest UK lever (+25%, zero donor cost). | Research-then-scope; start **after** the PPGF reply. |
| **B2B funeral-director tier** | White-label live display, printed QR packs, a dashboard. | Strategic, larger; start as a conversation. |
| **Physical stationery / merch** | Hero-SKU direction (letter-of-wishes kit, biscuit cutter, monogram wrap…). | Genuinely physical/future. |

## 4. Doc hygiene (minor)

- `PROJECT.md` print-pack TODO still says `qrcode.react` — replaced by `BrandedQR` (`qr-code-styling`) in PR #197.
- A few migration lines read "production pending" though they've since been run.
- Quick tidy pass available on request.

---

**Shipped this session (for reference):** 0% fee + tiered tips, guest wall +
anonymity, record threshold + breadth, both bump-chart surfaces, keepsake PDF,
charity pages + index + impact statements + claim link, admin dashboard +
access + oversight + restyle, Charity Commission verification + register
typeahead, rate limiting, branded emails, print pack, branded QR, and the
single-mark lattice hero texture.
