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
Goodstack replicates PPGF's charitable-intermediary model _with_ an API and
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
keys until after the call**. (The self-serve "Sign up" is the _nonprofit_
route — not us; favpoll is "A corporation".) So the Goodstack-specific
technical build is genuinely gated on the demo. A demo gate is normal here —
onboarding platforms is Goodstack's core commercial motion, so expect
engagement (unlike PPGF's closed program).

**Status: DEMO REQUESTED 6 July 2026 — NO RESPONSE as of 10 July** (not
even an acknowledgment; the form gave only a redirect, so there is no thread
and no proof of receipt). Chase drafted 10 July (below) — escalate the
channel (direct email leading with the Gift Aid question, or LinkedIn) rather
than re-submitting the form. One nudge, not a barrage. If still silent by
~17 July, treat the silence as signal and warm the CAF fallback.

### Contact log — trustee route (revised strategy, 11–15 July 2026)

Rather than a cold `sales@` email, the revised plan works the people around
the Impact Foundation first, keeping the company-side email in reserve:

- **Leo Chandler** — trustee, Goodstack Impact Foundation UK (verified on the
  Charity Commission register, appointed Nov 2020); early-stage investor.
  **LinkedIn connection note SENT 11 July 2026** (no reply as of 15 July):
  > Hi Leo, I'm building favpoll, a UK giving platform, considering Goodstack
  > and the Impact Foundation as our disbursement rail. I was hoping for your
  > insight as to whether we're a good fit. Thanks, Joe
- **Elani Buchan** — trustee since Nov 2023 (verified on the register); ops
  specialist (fractional COO/Head of Ops at Bondaval; ex-COO Concured;
  startup + charity crossover background). **LinkedIn connection note SENT
  15 July 2026**, angled to her operational lens:
  > Hi Elani, I'm building favpoll, a UK giving platform, hoping to use
  > Goodstack and the Impact Foundation as our disbursement rail. I'd value
  > your operational take on whether we're a fit. Thanks, Joe
- **Josh Radford** — VP of GTM at Goodstack (the "J.R." on the site; email
  format `{first}@goodstack.io`). **EMAIL SENT 20 July 2026** (trustees
  stayed silent past the ~17 July trigger). Founder chose the short, soft
  form — no Gift Aid question in the opener; that lands on the call/reply
  instead (it stays top of the questions list below). Sent verbatim:

  > Hi Josh,
  >
  > I hope you don't mind the direct approach. I requested a demo via
  > goodstack.io two weeks ago but haven't heard back yet.
  >
  > We're currently building favpoll, a UK charitable-giving platform.
  > Guests pledge money at life events and choose the UK charities that
  > receive it.
  >
  > We need infrastructure that validates and disburses to donor-chosen
  > charities, so Goodstack looks like a good fit. It would be great to
  > find out more.
  >
  > Thanks,
  > Joe Moffatt
  > favpoll.com

  Chase trigger: **~27 July** if silent; next card after that is Henry
  Ludlam, then CAF warming.

- **Henry Ludlam** — Goodstack team; wave two if all the above are quiet.
- Remaining trustees (Christina Hallett — chair, Henry Barclay): reserve;
  don't blanket the board.

Connection notes are private to each recipient, but the board is four people
— if both trustees reply, say plainly that a couple of trustees were
approached out of care to get the fit right. The ~17 July trigger fired on
20 July: the **Josh Radford email is SENT** (above). CAF warming is the
step after Henry Ludlam, not the immediate next move.

### Chase — drafted 10 July 2026

**Email** — to `sales@goodstack.io` (verify the address on goodstack.io;
`hello@` as fallback). Fresh email, since the form left no thread:

> **Subject: Demo request (6 July) — UK giving platform, one Gift Aid question**
>
> Hi — I requested a demo through goodstack.io on 6 July but haven't heard
> back, so I'm trying a more direct route.
>
> favpoll is a UK charitable-giving platform (a company, not a nonprofit —
> trading name of Josmo Services Ltd), launching soon. Guests pledge money at
> life events and choose the UK charities that receive it, so we need
> infrastructure that validates and disburses to donor-chosen charities
> without onboarding each one. Goodstack looks like the fit, and I've read up
> on the Impact Foundation structure — it's exactly the shape we need.
>
> One question decides it for us: does the Goodstack Impact Foundation UK
> (charity 1192508) claim Gift Aid on eligible UK donations and pass it to
> the recipient charity, the way PayPal Giving Fund does?
>
> If someone can confirm that and set up a short call on onboarding for a
> pre-launch platform, we're ready to move — our integration seam is already
> built and waiting for a provider.
>
> Thanks,
> Joseph Moffatt
> favpoll.com

**LinkedIn** — to a Goodstack BD/sales contact (CEO if no obvious SDR);
connection note or short InMail:

> Hi {name} — I requested a Goodstack demo via the website on 6 July but
> haven't heard anything, so trying you directly. favpoll (favpoll.com) is a
> UK charitable-giving platform launching soon: guests pledge at life events
> and pick the UK charities that receive it, so we need donor-chosen-charity
> validation and disbursement without per-charity onboarding — exactly what
> the Impact Foundation structure looks built for. One question decides it:
> does the Foundation claim Gift Aid and pass it through, PPGF-style? Happy
> to take a short call whenever suits.

Rationale: "one question decides it" signals a qualified, near-decision
buyer (gets prioritised over generic demo requests); "already built and
waiting" counters pre-launch smallness.

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
and get onboarding + sandbox access moving. You are qualifying _them_ as much
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

- **Fund ingestion:** do donors pay the Foundation via _your hosted flow_
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
**only if** Goodstack's reply confirms the Foundation does _not_ claim Gift Aid
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
