# Goodstack call — brief for the Ethan conversation + disbursement seam

_Companion to `disbursement-enquiries-2026-07.md` (which holds the enquiry
status + full question checklist). This is the readable narrative version._

**CALL PINNED: Friday 7 August 2026, 14:30 with Ethan (Goodstack).**

**UPDATED 7 August 2026 — call day.** Restructured for scanning: who you
are talking to, what a good call looks like, and the questions split by who
can actually answer them.

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

## Who you are talking to

- **Ethan — "Social Impact Partnerships Rep".** First-line commercial role:
  "Rep" is individual contributor, "Partnerships" is BD — **not** solutions
  engineering, **not** finance, **not** deal desk.
- His email is textbook **discovery**: _"learn more about"_, _"where there is
  a fit"_, 30 minutes. **He is qualifying you.** You are not being pitched to,
  and he is not there to be interrogated.
- Josh forwarded the thread, so Ethan inherited it cold. Assume he has read
  little and knows nothing about favpoll.

**The uncomfortable bit:** the #1 question (fees, and whether they can be
billed to the platform rather than netted from the gift) is the one he is
**least likely** to be able to answer. That is a deal-desk answer, usually
gated on volume — and if he answers verbally it is not binding.

### Shape of 30 minutes (plan for this)

- **~5 min** — intros
- **~12–15 min** — him asking about favpoll
- **~5–8 min** — his overview of Goodstack
- **~5 min** — next steps

Which leaves:

- **Roughly eight minutes for your questions.** Five is one or two too many —
  pick by _who can answer_, not by _what matters most_.
- He will ask: what it is, expected volume, launch date, geography, the legal
  entity, integration timeline.

---

## What "a good call" looks like

Not answers. **Three commitments a rep can actually deliver:**

1. **Sandbox keys provisioned.** If offered on the call, take it on the call.
2. **Fee schedule in writing.** Ask explicitly, then email the fee question
   straight afterwards so it is answered on the record.
3. **A named next call**, with whoever can quote and whoever is technical —
   **booked before you hang up.**

---

## Say this early (first five minutes)

- favpoll is a **UK charitable-giving platform** — a company, not a nonprofit,
  not a corporate grants programme.
- Guests pledge at life events, pick up to **3 UK charities**, proceeds split
  equally.
- **The crux, in one sentence:** _"favpoll takes 0% and promises 100% to the
  charity, so any fee has to be billed to us and paid out of optional guest
  contributions — never netted from the gift."_ Unusual, and the thing most
  likely to be mis-scoped if unsaid.
- You need **validate-and-disburse to donor-chosen charities without
  onboarding each** — which is why their Impact Foundation structure looks
  right.
- **Volumes are modest and it is pre-launch.** Say it plainly: minimums
  surface early, which is what you want.

**Posture (revised 7 Aug):** _"You are the leading option, and fees are the
deciding factor."_ NOT "we've already picked you" — with a sales rep that
gives away the only leverage you have on the one answer you need. It still
signals homework done.

---

## Questions — split by who can answer

### Ask live (he can answer these)

1. **Fund ingestion — the architecture decider.** Do donors pay the Foundation
   via _your_ flow (you largely replace our Stripe), or do we collect via
   Stripe and remit onward? Do you hold the payment step (PCI)? _(Also decides
   whether our Apple/Google Pay work carries over.)_
2. **Onboarding + keys.** Can a pre-launch UK Ltd onboard now — KYC, contract,
   minimum volume, revenue share, exclusivity? **When is sandbox access
   provisioned?**
3. **Gift Aid — confirm, don't ask open.** _"I can see the Foundation is
   HMRC-recognised for Gift Aid and the API has declaration endpoints — just
   confirming the claimed uplift passes to the recipient charity in the onward
   grant, and works for **any** donor-chosen UK charity, not only enrolled
   ones."_

### Get in writing (do not burn call time)

4. **Fees.** The Donation Delivery Policy says grants disburse "**net any
   applicable fees**". What is the structure for API-partner donations, and
   can fees be **billed to the platform**? _(Tip the preferred answer.)_
5. **Unpayable charity.** What if a chosen charity has no verified bank
   details? _(Their policy: outreach ~30 days, forced disbursement of held
   funds at 12 months — how does that play per-charity?)_

---

## Red flags to listen for

- **Fees deducted from donations with no platform-billed option** — breaks the
  100% promise. The #1 flag.
- **Gift Aid only for _enrolled_ charities** — reintroduces per-charity
  onboarding → Swiftaid fallback.
- **A minimum-volume commitment.**
- **Ingestion that forces a full Stripe rip-out pre-launch.**
- **Exclusivity or data-ownership terms.**

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
