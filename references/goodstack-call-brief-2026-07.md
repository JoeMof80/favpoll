# Goodstack demo — call brief + disbursement seam (readable)

_Companion to `disbursement-enquiries-2026-07.md` (which holds the enquiry
status + full question checklist). This is the readable narrative version._

---

## Where things stand

- **Goodstack is the lead disbursement rail.** It runs its own registered UK
  charity — **Goodstack Impact Foundation UK** (charity **1192508**) — which
  receives donations and grants them onward, the **same structure as PPGF** but
  with an API and self-serve reach. That largely closes the fund-flow question
  (the gift goes to a charity; favpoll never holds the money) and removes
  PPGF's last advantage.
- **The business route is sales-led — "request a demo".** No self-serve, no
  sandbox keys until after the call. So the Goodstack-specific build is gated
  on the demo. A demo gate is normal here — onboarding platforms is their core
  business, so expect engagement.
- **The `close-favpolls` cron currently never disburses** — it closes favpolls,
  sums totals, and emails the organiser. Money isn't leaving today. That's the
  gap the seam fills.

---

## Call brief

**Frame it in one breath, early:** favpoll is a UK charitable-giving _platform_
— a company, not a nonprofit, not a corporate grants programme. Guests pledge
at life events, pick up to 3 UK charities, proceeds split. 0% platform fee,
donors cover processing. You need validate-and-disburse to donor-chosen
charities without onboarding each — which is why their Impact Foundation
structure looks right.

**Ask these, in this order:**

1. **Gift Aid (the decider).** Does the Impact Foundation (1192508) claim Gift
   Aid PPGF-style, for _any_ donor-chosen UK charity or only enrolled ones?
2. **Fund ingestion (the architecture decider).** Do donors pay the Foundation
   via _your_ flow (you largely replace our Stripe), or do we collect via
   Stripe and remit onward? Do you hold the payment step (PCI)?
3. **Onboarding.** Can a pre-launch UK Ltd onboard now — KYC, contract, any
   minimum volume / revenue-share / exclusivity? Confirm 2.9% + 20p, no
   platform fee. Sandbox keys?
4. **Edge case.** What if a chosen charity isn't payable (no verified bank
   details)?

**Red flags to listen for:** Gift Aid only for _enrolled_ charities
(reintroduces per-charity onboarding → Swiftaid fallback); a minimum-volume
commitment; ingestion that forces a full Stripe rip-out pre-launch;
exclusivity / data-ownership terms.

**Your posture:** you've already picked them as the lead — you're de-risking,
not pitching. Volunteer that you're architecture-ready (a provider seam waiting
for their SDK) and that early volumes are modest, so "minimum volume" surfaces
early.

---

## The disbursement-provider seam (what's being built now)

A thin, partner-agnostic boundary: favpoll's core computes _who gets how much_;
a provider handles _resolve + move money_. Goodstack becomes the first real
implementation; a no-op keeps the pipeline runnable until the demo unlocks
their SDK.

The interface (money in pounds, matching the rest of favpoll; pence only at a
real provider's API boundary):

```ts
export type DisbursementRequest = {
  favpollId: string
  charityId: string
  registeredNumber: string | null // Charity Commission no.
  amount: number // pounds
  reference: string // idempotency key: `${favpollId}:${charityId}`
}

export type DisbursementResult = {
  status: "pending" | "sent" | "unpayable" | "failed"
  providerRef: string | null
  reason?: string
}

export interface DisbursementProvider {
  readonly name: string
  disburse(req: DisbursementRequest): Promise<DisbursementResult>
}
```

**How it slots in:** in `close-favpolls`, after a favpoll is closed, load its
charities, split `total_raised` equally (≤3 charities, equal split), call the
provider per charity, and record every attempt in a new **`disbursements`
ledger table**. The active provider is a **no-op** that marks everything
`pending` — so the ledger is populated and it's unambiguous that no money has
actually moved yet.

**Two deliberate choices:**

- The interface is **neutral on _when_ money moves** — `disburse` works whether
  Goodstack already holds the funds (hosted-payment model → really an
  "allocate" instruction) or needs a remittance. This protects the design from
  the fund-ingestion unknown until the demo answers it.
- **Gift Aid is not on this interface.** Declaration capture is a pledge-time
  concern, and _who claims_ depends on the demo. Keeping it off the seam avoids
  baking in an assumption we can't yet confirm.

**Build now vs hold:** building the seam + no-op provider + `disbursements`
ledger + cron wiring now is low-regret — it retires the do-nothing gap and
gives a real ledger whatever the demo decides. The `GoodstackProvider` impl and
the Gift-Aid claim path wait for the call.

The ledger also feeds the future "transactions ledger → shared-fund tips" work,
so it pays double.
