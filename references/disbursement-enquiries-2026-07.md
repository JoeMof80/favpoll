# Disbursement rail enquiries — Goodstack + Swiftaid

**Decision (6 July 2026):** Goodstack (formerly Percent, `goodstack.io`) is
the lead disbursement rail. PPGF is demoted to a Gift-Aid-only bench option
(see `ppgf-enquiry-draft-2026-07.md`). Rationale and the wider landscape are
in `charity-register-and-paypal-2026-07.md`.

**KEY FINDING (6 July 2026):** Goodstack runs its own registered UK charity —
**Goodstack Impact Foundation UK** (charity **no. 1192508**, a CIO, formerly
"Intelligent Foundation"). It "receives donations from donors and disburses
them to over 7 million charities" (~£1.2m granted, 230+ UK charities). This is
the **same structure as PPGF**: a charity sits in the middle, receives the
gift, and grants it onward — donations are held **"unrestricted"** (Foundation
keeps discretion), which is exactly what keeps Gift Aid valid.

This largely closes the **fund-flow** question (favpoll never holds the money;
the gift goes to a charity) and **removes PPGF's last structural advantage** —
Goodstack replicates PPGF's charitable-intermediary model *with* an API and
self-serve onboarding. It also means **Swiftaid may be unnecessary**: if the
Foundation claims Gift Aid itself, no separate agent is needed.

So the whole thing now reduces to **one open question**:

> Does the Goodstack Impact Foundation UK (1192508) claim Gift Aid on eligible
> UK donations and pass it to the recipient charity, the way PayPal Giving Fund
> does?

Keep the outgoing message short (a BD person skims). The detailed list below is
the **call agenda / reply-thread checklist**, not the first touch.

---

## Goodstack

**Route (confirmed 6 July 2026):** Goodstack's **business** path is
**sales-led — "Request a demo"**, no self-serve signup and **no sandbox/API
keys until after the call**. (The self-serve "Sign up" is the *nonprofit*
route — not us; favpoll is "A corporation".) So the Goodstack-specific
technical build is genuinely gated on the demo. A demo gate is normal here —
onboarding platforms is Goodstack's core commercial motion, so expect
engagement (unlike PPGF's closed program).

**Status: DEMO REQUESTED 6 July 2026.** Submitted via the "request a demo"
form; got the redirect screen ("someone will be in touch") but **no
confirmation email** — normal for demo-request flows, the redirect is the
acknowledgement, so it almost certainly registered. **Awaiting contact.**
If quiet by ~10 July: book directly (if a Calendly/booking link was offered)
or send one short LinkedIn note to a Goodstack BD/sales contact linking
favpoll.com. One nudge, not a barrage — don't re-submit repeatedly.

### Sent enquiry (fresh single first-contact — informed by the Foundation finding)

> favpoll is a UK charitable-giving platform (a company, not a nonprofit —
> trading name of Josmo Services Ltd), launching soon. Guests pledge money at
> life events and choose UK charities to receive it, so we need infrastructure
> to validate and disburse to donor-chosen charities without onboarding each
> one. Goodstack looks like a strong fit.
>
> From reading up on the Goodstack Impact Foundation UK (charity 1192508), I
> think the structure is what we'd need — donations run donor → the Foundation
> → the recipient charity, so we never hold the funds. The main thing I'd like
> to confirm is whether the Foundation claims Gift Aid on eligible UK donations
> and passes it to the recipient charity, the way PayPal Giving Fund does.
>
> Could we set up a short call to cover that, plus onboarding for a pre-launch
> platform? Thanks — Joseph, favpoll.

### Questions to get answered (call / reply thread)

1. **Gift Aid — THE open question.** Does the Goodstack Impact Foundation UK
   (1192508) claim Gift Aid on eligible UK donations and pass it to the
   recipient charity, PPGF-style? _(If yes, Swiftaid is unnecessary; if no, the
   Swiftaid fallback below is back in play.)_
2. **Fund flow — confirm.** Largely answered by the Foundation finding, but
   confirm: the Foundation is the legal recipient and grants onward, so favpoll
   never holds/owns the funds. How, and how often, are funds disbursed?
3. **Onboarding.** Can a pre-launch UK platform of our size onboard now?
   Requirements (KYC, contracts, minimum volume) and rough timeline?
4. **Pricing.** Confirm 2.9% + 20p on UK cards, no platform/monthly fee.
5. **PCI.** Do you host the payment step so we stay out of PCI scope?
6. **Donor-covers-fees.** Can donors cover processing so the charity receives
   the full pledge?
7. **Later / multi-market.** Compliant donor tax receipts in US / EU / AU?

---

## Call brief — Goodstack demo

**Your goal for the call:** confirm the one open question (Gift Aid), learn the
fund-ingestion model (does it replace favpoll's Stripe flow or sit after it),
and get onboarding + sandbox access moving. You are qualifying *them* as much
as the reverse — you've already chosen them as the lead; this de-risks it.

**30-second pitch (say this early to frame it right):**
> favpoll is a UK charitable-giving platform — a company, not a nonprofit.
> Guests pledge money at life events, choose up to three UK charities, and the
> proceeds are split between them. We charge no platform fee; donors optionally
> cover processing, so as close to 100% as possible reaches the charity. We
> need a partner to validate and disburse to donor-chosen charities without us
> onboarding each one — which is why the Impact Foundation structure looks
> right.

**The one that decides it — ask first:**
- Does the **Goodstack Impact Foundation UK (1192508)** claim **Gift Aid** on
  eligible UK donations and pass it to the recipient charity, PPGF-style? For
  **any** donor-chosen registered UK charity, or only enrolled ones?

**Architecture (determines how much of favpoll changes):**
- **Fund ingestion:** do donors pay the Foundation via *your hosted flow*
  (i.e. you largely **replace Stripe**), or does favpoll collect payment
  (Stripe) and **remit onward** to the Foundation? This is the big one for our
  build.
- Do you host the payment step, so we stay **out of PCI scope**?
- Is it API + hosted components, or embed-only? (We're Next.js / Supabase.)

**Commercial / onboarding:**
- Can a **pre-launch** UK company (Josmo Services Ltd) onboard now? KYC,
  contract, any **minimum volume** or revenue-share, exclusivity, data terms?
- Confirm pricing: **2.9% + 20p** UK cards, **no platform/monthly fee**.
- Can donors **cover the processing fee** so the charity gets the full pledge?
- **Sandbox access** — can we get keys to start building now?

**Disbursement edge cases:**
- Frequency/mechanics of payout to charities. What happens if a donor-chosen
  charity **isn't payable** (no verified bank details, dormant)? Fallback?

**Later / multi-market (mention, don't dwell):**
- Compliant donor **tax receipts** for US / EU / AU when we expand.

**Things to volunteer that make onboarding smoother:** UK Ltd company with
Charity Commission verification already built into the product; pre-launch but
architecture-ready (a provider seam waiting for their SDK); realistic early
volumes are modest (set expectations so "minimum volume" surfaces early).

**Red flags to listen for:** Gift Aid only for enrolled charities (reintroduces
per-charity onboarding → Swiftaid fallback); a minimum volume commitment we
can't meet; fund-ingestion that forces a full Stripe rip-out before launch;
exclusivity or data-ownership terms.

---

## Swiftaid — ON HOLD (fallback only)

**Do not send yet.** The Goodstack Impact Foundation finding means Goodstack
may claim Gift Aid itself, making a separate agent unnecessary. Send this
**only if** Goodstack's reply confirms the Foundation does *not* claim Gift Aid
on donor-chosen-charity donations.

**Where to send (when/if needed):** `swiftaid.co.uk` (HMRC-registered Gift Aid
agent).

**Status:** _ON HOLD — not sent_

### Sent enquiry (short)

> favpoll is a UK charitable-giving platform (a company, not a nonprofit)
> launching soon. Donors pledge to charities they choose, and the funds are
> disbursed via a donation-infrastructure partner rather than held by us. I'd
> like to add Gift Aid and think Swiftaid may be the fit. The main thing I need
> to understand is whether you can claim Gift Aid when donations reach the
> charity through a platform plus a disbursement partner, for any donor-chosen
> UK charity. Could we grab a quick call? Thanks — Joseph, favpoll.

### Questions to get answered (call / reply thread)

1. **Compatibility with our fund flow.** Can Swiftaid claim Gift Aid when
   donations pass through a platform and a disbursement partner (e.g.
   Goodstack) on the way to the end charity? What must the fund flow /
   recipient structure look like for the donor→charity relationship to stay
   valid for Gift Aid? _(Biggest question.)_
2. **Any charity, or enrolled only?** Because donors pick any registered UK
   charity, does a claim work for any charity named, or only charities enrolled
   with Swiftaid? If each end charity must appoint Swiftaid as HMRC agent, can
   that be automated at scale? _(If it can't, "Goodstack + Swiftaid" just moves
   the per-charity onboarding friction rather than removing it — watch this
   answer.)_
3. **Integration + donor data.** What do you need from us (donor name/address,
   taxpayer declaration, donation records, per-charity attribution) and how
   does integration work (API)? Donor experience for the declaration?
4. **Fees.** How do you charge (percentage of Gift Aid reclaimed)?
5. **Onboarding.** Can a pre-launch platform onboard now, and what's involved?
6. **Compliance.** Do you handle taxpayer-eligibility checks and the HMRC
   record-keeping / audit trail?

---

## Not tax/legal advice

Fund-flow-vs-Gift-Aid interaction is subtle (the gift must run donor →
charity, or via a charity intermediary). Confirm with the partners and, before
launch, a charity-tax adviser. Rates/thresholds change.
