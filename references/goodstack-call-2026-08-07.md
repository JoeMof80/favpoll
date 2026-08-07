# Goodstack — post-call note, Friday 7 August 2026

_Call with Ethan, "Social Impact Partnerships Rep", 14:30, 30 minutes.
Brief: `goodstack-call-brief-2026-07.md`. Enquiry log:
`disbursement-enquiries-2026-07.md`._

**Outcome: none of the three things the brief called a good call.** No
sandbox keys, no fee schedule, no next call booked. The follow-up email
(below) is now carrying the whole thread.

---

## What actually happened

- **He liked favpoll.** The demo landed — homepage, then the end-to-end
  arc. No objection to the concept.
- **"Our relationships are mostly with North American non-profits, very
  little in Europe."** The remark that changed the shape of the call.
- **He did not appear to know about Goodstack Impact Foundation UK.**
- **"We don't tend to hand out sandbox keys."** He offered to ask
  internally.

---

## Reading those signals

Separating what is known from what is inferred, because the difference
matters and it is easy to lose in a week.

**Verified (27 July docs sweep, unchanged by this call):** Goodstack Impact
Foundation UK is registered charity **1192508**; the Charity Commission
register flags it HMRC-recognised for Gift Aid; the partner API carries Gift
Aid Declaration endpoints (`giftAidId` on donation events). None of that
stops being true because a rep had not heard of it. **His not knowing is weak
evidence about the structure** — a group charity entity is finance and legal,
not a sales talking point.

**The North America remark is ambiguous between three readings**, and only
one of them hurts:

1. their _customers_ are mostly US — irrelevant to us;
2. _he_ covers North American accounts — irrelevant to us;
3. their _UK disbursement coverage_ is thin — fatal to the plan.

The follow-up asks the question that separates them, and it is the question
the brief should have led with:

> **What proportion of UK registered charities can you deliver funds to
> today, without the ~30-day outreach path in the Donation Delivery Policy?**

**The reframe that came out of it:** the Impact Foundation model exists so
that nobody needs a relationship with each charity — the Foundation receives,
then grants onward. So "we don't have relationships with European
non-profits" may be answering a question we were not asking. What we need is
**payability**, not relationships.

**Sandbox is a qualification signal.** Keys gated on a qualified opportunity;
pre-launch, no volume, no revenue puts us low in that queue. Not fatal, but
it says where we sit — and it is another reason the fee answer will be slow.

---

## Terminology, since it caused confusion

- **Pledge** — favpoll's word. What a guest does: one guest, one card
  payment. Many per favpoll, over the days it is open.
- **Donation** — Goodstack's word. Money arriving at the Foundation. The unit
  their API records and the unit **Gift Aid attaches to**.
- **Grant** — the Foundation paying onward to the recipient charity.

favpoll **aggregates**: money leaves once per charity at close, so 40 pledges
become 1–3 grants.

**But that does not necessarily mean 1–3 billable events.** Gift Aid needs a
declaration _per donor_, so if we collect via Stripe and remit one lump per
charity, the Foundation has nothing to claim on. Keeping Gift Aid probably
forces **one donation record per pledge** regardless of how the money moves.
So aggregation may save nothing under per-donation pricing. This is a
question, not a finding — but it is the sharper form of the fee question and
it makes the fund-flow and fee answers fall out of one reply.

---

## Two strategy questions the call raised

Both worth recording, neither decided. **Neither should be decided on the
back of one call with a rep who had not heard of his own company's UK
charity.**

### Target the US sooner?

The pull came from a remark about _Goodstack's_ account base — information
about the vendor, not about our market. Choosing a country because of a
supplier is the tail wagging the dog.

Against, and it is heavy: **no Gift Aid equivalent** (a 25% uplift given up);
501(c)(3) verification is a different data source; **state-by-state
charitable solicitation registration**; our entity is a UK Ltd; en-GB copy
needs a full tone pass, not a spelling substitution. And **all our
distribution is UK** — hospices, Sarah, the founder story.

For: the US market is far larger and the "in lieu of flowers" convention is
stronger there. A real second market — just not for this reason.

**Position: documented option with a trigger, not a plan.**

### Onboard charities ourselves — our own Impact Foundation?

The instinct is right and the asset is real. That is exactly why it is a moat
and exactly why it is expensive.

What it actually takes: a registered charity with objects, a constitution and
**at least three independent trustees who must act in the charity's interest,
not favpoll's** (Josmo Services Ltd would be a connected party throughout);
annual returns, SORP accounts, independent examination; AML and sanctions
screening, because we would be holding other people's charitable money; HMRC
recognition and a Gift Aid claiming function; and the genuinely hard part —
**bank details for ~170,000 UK charities**, which is precisely why PPGF and
Goodstack both run outreach and why coverage is partial anywhere.

**The cheaper version that gets most of the asset:**

- **Own the head, rent the tail.** Memorial giving clusters hard — Marie
  Curie, Macmillan, Dogs Trust, local hospices. Direct relationships with the
  few hundred that get picked repeatedly cover most volume; a rail handles
  the rest.
- **Onboard on demand** — "your charity has been chosen, claim these funds",
  which is what PPGF does. The cost is a delay on first use, not a blocker.
- **The hospice outreach IS charity onboarding.** St Luke's is a charity.
  Every conversation in that channel is simultaneously distribution and a
  payable recipient. We are already doing the expensive part for other
  reasons. That is the wedge.

**Position: not now. Accumulate payability data as a by-product of outreach.**

---

## The follow-up (sent 7 August)

Four questions, in writing so they can be routed:

1. Is the Foundation the right structure — and **what proportion of the UK
   register can it reach today** without the 30-day outreach path?
2. Fund flow: do donors pay the Foundation through their flow, or do we
   collect via Stripe and remit onward?
3. Fees: structure for API-partner donations, and **can they be billed to the
   platform** rather than netted from the gift?
4. Sandbox: not production credentials — and if not now, what would clear
   that hurdle?

Plus a routing line ("if UK delivery sits with someone else, point me their
way"), a decision timeline ("picking a partner in the next few weeks —
either way is useful"), a screenshot, and a forwardable one-paragraph
overview.

The Foundation question is deliberately framed as _"have I misread it?"_.
He cannot ask internally about something he cannot name, and a correction
would only make him defensive.

---

## Next

- **Nudge after ~5 working days** if silent. Short: "any luck internally?"
- **Stop being single-threaded.** Enquire with **PayPal Giving Fund UK** and
  **CAF** this week — the enquiry log already has CAF as the fallback in the
  Goodstack → Ludlam → CAF chain. If any of them covers the UK register, both
  strategy questions above become moot.
- **Record payability as we go.** From now on, treat every hospice/charity
  conversation as dual-purpose and capture the details needed to pay them.
- **The launch bridge:** we do not need a rail to launch. For the first
  handful of favpolls, **disburse manually** — a favpoll closes, we make the
  transfer. Entirely viable at low volume and it buys months.
  `close-favpolls` moves no money today and there are no users, so the
  disbursement gap only becomes real at the first real close.

**The risk to watch:** building infrastructure instead of launching. Both
strategy questions above are shaped like that failure mode.
