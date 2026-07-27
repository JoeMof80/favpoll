# Goodstack call — brief for the Ethan conversation + disbursement seam

_Companion to `disbursement-enquiries-2026-07.md` (which holds the enquiry
status + full question checklist). This is the readable narrative version._

**UPDATED 27 July 2026 for the Ethan call** — Josh forwarded the 20 July
email; **Ethan (Goodstack) replied 27 July offering 30 minutes**. Joe's
reply proposes this week and asks for **sandbox access ahead of the call**
(integration-ready posture). Question order reshuffled below: the 27 July
docs sweep effectively answered Gift Aid, so **fees are now the decider**.

---

## Where things stand

- **Goodstack is the lead disbursement rail.** It runs its own registered UK
  charity — **Goodstack Impact Foundation UK** (charity **1192508**) — which
  receives donations and grants them onward, the **same structure as PPGF** but
  with an API and self-serve reach. That largely closes the fund-flow question
  (the gift goes to a charity; favpoll never holds the money) and removes
  PPGF's last advantage.
- **Gift Aid: effectively answered YES (27 July sweep).** The Charity
  Commission register flags the Foundation "**Recognised by HMRC for gift
  aid**", and the partner API has **Gift Aid Declaration endpoints**
  (`giftAidId` on donation events). On the call this is a one-line
  _confirmation_, not an open question — and citing their own register
  entry + API docs signals homework done.
- **Public docs exist** (`docs.goodstack.io`) and a **sandbox dashboard**
  (`sandbox.poweredbypercent.com`) — but access is **provisioned, not
  self-serve** (keys "are provided to you"; no signup page). Ask Ethan to
  provision it; `engineering-support@goodstack.io` is the documented
  fallback channel (email drafted, HELD while the Ethan thread is live).
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
structure looks right. You've read their docs and your integration seam is
built: you're here to de-risk and get keys, not to be pitched.

**Ask these, in this order (reordered 27 July):**

1. **Fees (now the decider).** The Donation Delivery Policy says grants
   disburse "**net any applicable fees**". What's the fee structure for
   API-partner donations — and can fees be **billed to the platform** rather
   than deducted from donations? favpoll's public promise is 100%-to-charity;
   a deduction from the gift breaks it. (Tip the preferred answer.)
2. **Fund ingestion (the architecture decider).** Do donors pay the Foundation
   via _your_ flow (you largely replace our Stripe), or do we collect via
   Stripe and remit onward? Do you hold the payment step (PCI)? (Also
   determines whether our Apple/Google Pay work carries over.)
3. **Gift Aid (confirm, don't ask open).** "I can see the Foundation is
   HMRC-recognised for Gift Aid and the API has declaration endpoints — just
   confirming the claimed uplift is passed to the recipient charity in the
   onward grant, and that it works for _any_ donor-chosen UK charity, not
   only enrolled ones."
4. **Onboarding + keys.** Can a pre-launch UK Ltd onboard now — KYC,
   contract, any minimum volume / revenue-share / exclusivity? **Sandbox
   access provisioned when?** (If offered on the call, take it on the call.)
5. **Edge case.** What if a chosen charity isn't payable (no verified bank
   details)? (Their delivery policy: outreach ~30 days, forced disbursement
   of held funds at 12 months — ask how that plays per-charity.)

**Red flags to listen for:** fees deducted from donations with no
platform-billed option (breaks the 100% promise — the new #1 flag); Gift Aid
only for _enrolled_ charities (reintroduces per-charity onboarding →
Swiftaid fallback); a minimum-volume commitment; ingestion that forces a
full Stripe rip-out pre-launch; exclusivity / data-ownership terms.

**Your posture:** you've already picked them as the lead — you're de-risking,
not pitching. Volunteer that you're architecture-ready (a provider seam waiting
for their SDK, docs read, launch imminent) and that early volumes are modest,
so "minimum volume" surfaces early.

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
