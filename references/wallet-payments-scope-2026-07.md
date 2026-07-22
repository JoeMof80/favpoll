# Wallet payments (Apple Pay / Google Pay) — scope

Scoped 2026-07-21, prompted by the pledge.to evaluation (their 12+ payment
methods vs our card-only). The guest moment favpoll lives in — a phone in
one hand at a wake, a birthday, a finish line — is exactly where wallets
beat typing a card number.

## Why this is small

The checkout is **already wallet-ready on the frontend**: `CheckoutForm`
renders Stripe's `PaymentElement` and confirms with `confirmPayment`.
Apple Pay and Google Pay are not separate payment-method *types* — they
ride on the `card` type as wallets, so the existing
`payment_method_types: ["card"]` pin in
`app/api/stripe/payment-intent/route.ts` does **not** block them. They
appear automatically once the environment qualifies. Server-side
verification (`lib/stripe-verify`), the webhook, and the reconcile cron
are all method-agnostic — a wallet payment is a card payment to all of
them. No schema, no new flows.

## The actual work

1. **Apple Pay domain registration** (the one real task):
   - Serve Stripe's domain-association file at
     `/.well-known/apple-developer-merchantid-domain-association`
     (drop the Stripe-provided file into `apps/web/public/.well-known/`).
   - Register the domain in the Stripe dashboard (Settings → Payment
     methods → Apple Pay) for the **FavPoll sandbox**:
     `favpoll-web-gamma.vercel.app` (+ `localhost` works without).
   - **Launch-flip step**: re-register the real domain on the LIVE Stripe
     account (add to outstanding-tasks §1b when built).
2. **Google Pay**: nothing — works over HTTPS in Chrome via
   PaymentElement, no registration.
3. **Optionally** pass `wallets: { applePay: "auto", googlePay: "auto" }`
   in the PaymentElement options (that is already the default; only worth
   adding as documentation-in-code).
4. **Update the stale comment** in payment-intent/route.ts ("Apple Pay /
   Google Pay require additional domain verification") once registration
   is done.
5. **Keep `payment_method_types: ["card"]`** — deliberately. It keeps
   Link, Klarna, and other redirect methods out of the dialog flow (no
   `return_url` handling needed) while allowing both wallets.

## Testing

- **E2E: no change expected.** Headless Chromium has no wallet, so the
  card form renders exactly as today (the pressSequentially fill flow is
  untouched). One full E2E run to confirm.
- **Real-device pass** (the actual acceptance test):
  - iPhone Safari on the preview/prod URL with a card in Apple Wallet →
    Apple Pay button appears above the card form; complete a £2 pledge;
    verify the pledge row + `pi_` id + webhook event + reconcile, same as
    the 2026-07-21 production loop test.
  - Chrome (signed-in, saved card) → Google Pay button; same loop.

## Outcome (built 2026-07-21/22, #321–#322)

- Domain registered via the payment method domains API: **apple_pay
  active, google_pay active** on favpoll-web-gamma.vercel.app.
- **Apple Pay device-verified by the founder** (iPhone Safari, £2 pledge)
  and money-loop-proven: verified `pi_`, webhook event, reconciled by the
  scheduled 23:30 UTC cron run.
- **Google Pay: API-active but NOT device-tested** (no Android device to
  hand). Accepted risk — identical code path to Apple Pay (both are
  wallets on the `card` type through the same PaymentElement). A Google
  Pay pledge is folded into the §1b step-8 launch smoke test.
- Launch flip: §1b step 4b re-registers the live domain.

## Estimate

~Half a day, most of it device QA. Code diff is one static file + one
comment. Dashboard work in the FavPoll sandbox only until launch.
