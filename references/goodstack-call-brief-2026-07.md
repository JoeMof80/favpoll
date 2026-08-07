# Goodstack call — Ethan, Friday 7 August 2026, 14:30

_Read this. The engineering design moved to `disbursement-provider-seam.md`;
the enquiry log and full checklist live in `disbursement-enquiries-2026-07.md`._

---

## Who you are talking to

- **"Social Impact Partnerships Rep"** — first-line commercial. BD, **not**
  solutions engineering, **not** deal desk.
- His email is discovery: _"learn more about"_, _"where there is a fit"_.
  **He is qualifying you.**
- Josh forwarded the thread cold. Assume he knows nothing about favpoll.
- **So: fees — the thing you most need — is the thing he can least likely
  answer.** It is a deal-desk call, usually gated on volume, and verbal is not
  binding.

**The 30 minutes:** ~5 intros · **~12–15 him asking about you** · ~5–8 his
overview · ~5 next steps. You get **about eight minutes**. Pick questions by
_who can answer_, not by _what matters most_.

---

## What a good call looks like

Not answers. **Three commitments a rep can actually deliver:**

1. **Sandbox keys** — if offered on the call, take it on the call.
2. **Fee schedule in writing** — ask, then email the question straight after.
3. **A named next call** with whoever can quote and whoever is technical,
   **booked before you hang up.**

---

## Say this early

- favpoll is a **UK charitable-giving platform** — a company, not a nonprofit,
  not a corporate grants programme.
- Guests pledge at life events, pick up to **3 UK charities**, split equally.
- **The crux:** _"favpoll takes 0% and promises 100% to the charity, so any fee
  has to be billed to us and paid from optional guest contributions — never
  netted from the gift."_
- You need **validate-and-disburse to donor-chosen charities without onboarding
  each** — why their Impact Foundation structure looks right.
- **Pre-launch, modest volumes.** Say it plainly; minimums surface early.

**Posture:** _"You're the leading option, and fees are the deciding factor."_
NOT "we've already picked you" — that hands a sales rep your only leverage.

---

## Answers to what he'll ask

**"Tell me about favpoll."**
> A UK giving platform for life events. Someone creates a favpoll — one
> question, like favourite dog breed — in memory of a person or for a cause,
> picks up to three UK charities, and guests pledge money to their own
> favourite. 100% goes to the charity. We take nothing.

**"What volume are you expecting?"** — you don't know, and that's fine. Don't
invent a number. Give the shape, then flip it:
> Pre-launch, so I'd be guessing. What I can tell you is the shape: guests
> pledge individually, but money only leaves **once per charity when a favpoll
> closes** — so one to three grants per favpoll, not one per pledge.
>
> **What I need from you is whether there's a floor** — a minimum volume or
> minimum grant size below which this doesn't work.

That converts a question you can't answer into one that gets you information.

**"When do you launch?"**
> I'm not putting a date on it today. The product is built; the disbursement
> path is the last piece, and it's waiting on this conversation.

True — `close-favpolls` closes favpolls and emails organisers but moves no
money — and it makes them the critical path.

**"Which markets?"** UK only, en-GB. US is a deliberate later second market.

**"What's the entity?"** Josmo Services Ltd, trading as favpoll. UK Ltd,
pre-revenue.

**"How would you integrate?"**
> Next.js on Vercel, Supabase, Stripe today. A partner-agnostic disbursement
> seam is already built — an interface taking favpoll, charity, registered
> number and amount, returning a status and a provider reference, with a
> ledger recording every attempt. It's a no-op right now. A Goodstack
> implementation is small once we have keys.

**"Who else are you looking at?"** Don't over-answer:
> You're the leading option. PPGF has the same structure without the API.

---

## Ask live (he can answer these)

1. **Fund ingestion — the architecture decider.** Do donors pay the Foundation
   via _your_ flow (largely replacing our Stripe), or do we collect and remit
   onward? Do you hold the payment step (PCI)?
2. **Onboarding + keys.** Can a pre-launch UK Ltd onboard now — KYC, contract,
   minimum volume, revenue share, exclusivity? **Sandbox provisioned when?**
3. **Gift Aid — confirm, don't ask open.** _"I can see the Foundation is
   HMRC-recognised and the API has declaration endpoints — just confirming the
   uplift passes to the recipient charity in the onward grant, and works for
   **any** donor-chosen UK charity, not only enrolled ones."_

**Ingestion and fees are the same question.** If Goodstack ingests the
donations, their fee base is every pledge. If we collect via Stripe and remit,
their base is the aggregated grants — one to three per favpoll. Many small
pledges into few grants is cheap per-grant and expensive per-donation, so his
answer to #1 tells you what the fee answer will look like before you get it.

## Get in writing (don't burn call time)

4. **Fees.** Their Donation Delivery Policy says grants disburse "**net any
   applicable fees**". What's the structure for API-partner donations, and can
   fees be **billed to the platform**?
5. **Unpayable charity.** What if a chosen charity has no verified bank
   details? _(Their policy: outreach ~30 days, forced disbursement at 12
   months — how does that play per-charity?)_

---

## Red flags

- **Fees deducted from donations with no platform-billed option** — breaks the
  100% promise. The #1 flag.
- **Gift Aid only for _enrolled_ charities** — reintroduces per-charity
  onboarding → Swiftaid fallback.
- **A minimum-volume commitment.**
- **Ingestion that forces a full Stripe rip-out pre-launch.**
- **Exclusivity or data-ownership terms.**

---

## Background, if needed

- **Goodstack is the lead rail.** It runs its own registered UK charity —
  **Goodstack Impact Foundation UK**, charity **1192508** — which receives
  donations and grants them onward. Same structure as PPGF, but with an API.
  favpoll never holds the money.
- **Gift Aid is effectively answered YES** (27 July sweep): the Charity
  Commission register flags the Foundation "Recognised by HMRC for gift aid",
  and the partner API has Gift Aid Declaration endpoints (`giftAidId` on
  donation events). Hence confirm, don't ask.
- **Sandbox is provisioned, not self-serve** (`sandbox.poweredbypercent.com`;
  keys "are provided to you"). `engineering-support@goodstack.io` is the
  documented fallback, email drafted and held while this thread is live.
