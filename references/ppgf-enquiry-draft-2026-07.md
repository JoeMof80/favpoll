# PPGF partnership enquiry — draft

**Status: SENT 4 July 2026 — AND THEY REPLIED. Found 2026-10-13, three
months later, in the founder's mail; it was never recorded here, because
Goodstack was chosen on 6 July and the thread was abandoned mid-sentence.**

PPGF WAS NEVER TOLD NO, AND NEVER SAID NO. Reference
`C826-L003-TPPGF001-S999-W000000`. The sequence:

- **4 Jul 19:11** — the form below, seven numbered questions.
- **6 Jul** — Tiernan replies, having read it as a CHARITY enrolment:
  "complete your account profile on paypal and get your charity confirmed".
  He had missed the point entirely.
- **6 Jul 02:12** — founder corrects it clearly: favpoll is not a charity,
  this is about "PayPal Giving Fund's platform-partner arrangement, the
  model behind things like eBay for Charity or Meta fundraisers"; asks to
  be pointed at the right team.
- **6 Jul** — PayPal replies: **"What platform will you be raising the
  funds on? Is it a case that you want to then pass them on to PayPal
  giving fund?"**

AND THAT IS WHERE IT STOPS. Goodstack was made the lead rail the same
day. Their closing question is not a brush-off — it is someone checking
WHICH integration model is wanted, and its second half describes Model B
(we collect, then grant onward with per-charity recommendations) almost
exactly. It needed a two-line answer and never got one.

SO THE 6 JULY DECISION RESTS ON A FALSE PREMISE. `disbursement-enquiries-2026-07.md`
demoted PPGF for being "a business-development conversation, not an API
key" while preferring Goodstack's "API and self-serve onboarding" — but
Goodstack turned out to be sales-led with no API keys before a demo, then
never replied at all, while PPGF had answered within 48 hours and asked a
direct question.

CAVEATS, kept honest: both replies came from general PayPal customer
service, not PPGF partnerships, and the first proves that queue did not
understand the enquiry. The form template code is TPPGF001, so it routed
to a PPGF-tagged workflow, but it is unlikely to reach the partnerships
team unaided — the proper route stays the "Become a Partner" form below.
There is also a lesson in the shape: 2,500 characters and seven numbered
questions, into a support queue, returned boilerplate. Answer their short
question shortly.

_July 2026. Companion to `charity-register-and-paypal-2026-07.md` (§2–3).
Send from joseph.moffatt@gmail.com or hello@favpoll.com if it exists —
a product-domain address reads better for partnership inboxes._

**Where to send (verified July 2026):** the UK Giving Fund site has no
partner contact — intake happens through the **partner page**:

1. **Primary:** https://www.paypal.com/us/webapps/mpp/givingfund/partner
   → the **"Become a Partner"** button (a Microsoft Forms application).
   It's hosted on the US page but is PPGF's global partner intake — the
   same programme that covers eBay/Meta/GoFundMe across US/UK/CA/AU.
   Forms have small boxes: use the **short form** (questions 1–3 + 7
   below) in any free-text field and offer the rest by call.
2. **In parallel:** email the full draft to PPGF UK's published service
   address — listed in PayPal's help article "What is PayPal Giving Fund
   and how do I contact them?" (paypal.com/uk/cshelp, article help1078)
   and in the Fundraising Regulator directory entry for PayPal Giving
   Fund UK (charity no. 1110538). Service inboxes forward partnership
   mail; slower but it creates a written thread.
3. **If both stall:** PayPal Giving Fund has a LinkedIn company page —
   a short founder-to-BD message linking favpoll.com is a normal route
   for this kind of enquiry.

If a form asks for category, favpoll is a "fundraising platform /
technology partner", not a charity. Introduce the company as
"favpoll (a trading name of Josmo Services Limited)".

---

## Draft email (trimmed to fit ~2,500-character form limits)

**Subject:** Partnership enquiry — charitable pledging platform (UK, pre-scale)

Hello,

I'm the founder of favpoll (favpoll.com, a trading name of Josmo Services Limited), a UK platform for charitable giving at life's significant moments — memorials, birthdays, retirements. Guests pledge small amounts against a poll of someone's favourite things (their colour, their song), rankings update live in the room, and proceeds go to charities chosen in that person's name.

We're pre-scale and designing our payment architecture now — we'd rather build on the right rails than migrate later. We currently process pledges with Stripe and curate a small charity list; we want to offer the full Register of Charities, and PayPal Giving Fund looks like the strongest route.

Could you advise which partnership model fits, and a few specifics?

1. Integration model — do you support platforms (a) sending donors through a PPGF checkout directly, and/or (b) collecting donations themselves and granting proceeds to PPGF with per-charity recommendations?

2. Fees — for each model, who bears payment processing costs, and are there PPGF fees? We're designing a 0%-platform-fee model where 100% of each pledge reaches the charity.

3. Voluntary contributions — our revenue would come from optional contributions donors add for favpoll, collected separately from the donation. Is that structure compatible with your programmes?

4. Gift Aid — how does it work through a partner integration, and is 100% passed on to the charity?

5. Coverage and attribution — how are unenrolled charities handled, what payout timelines should charities expect, and can grants carry an attribution ("in memory of…")? Attribution matters unusually much in our context.

6. Markets — we're UK-first but designing for the US, Canada and Australia. Can one partnership cover those markets, or is each a separate application?

7. Process — what does the application involve for a pre-scale platform, and what would you need from us?

One disclosure for suitability review: pledges are small and numerous (typically £2–£20); events include funerals, a responsibility our product takes seriously; and our communal "shared fund" feature is favpoll money, not charitable funds — it stays on our own processor either way.

Happy to share a live demo or a short deck. Thank you.

Kind regards,
Joseph Moffatt
Founder, favpoll

---

## Notes on the draft (not part of the email)

- **Deliberately does not commit to 0%** — "designing a 0%-platform-fee
  model" keeps the decision open while signalling compatibility with
  their 100%-to-charity requirement.
- **Question 3 is the load-bearing one.** If tips-alongside-donations is
  refused, Model A dies and only Model B (grant-in) survives; the fee
  decision decouples from PPGF.
- **Question 5's attribution ask** is favpoll-specific: a grant arriving
  as anonymous PPGF money undermines "in the name of those we love". If
  attribution is weak, that's a real strike against Model A regardless of
  economics.
- The shared-fund disclosure is intentional — better to surface the one
  structurally awkward flow now than during due diligence.
- If a web form imposes a character limit, send questions 1–3 + 7 only
  and offer the rest by call; those four decide the strategy.


---

## 2026-10-13 — REOPENED, both routes

**1. Replied on the old thread** (ref `C826-L003-TPPGF001-S999-W000000`),
answering the question they left hanging on 6 July: funds are raised on our
own platform and processed via Stripe; yes, we would pass them to PPGF with a
per-charity recommendation (Model B); we are a company, not a charity; please
route to the partnerships team. Kept deliberately SHORT — the July message was
2,500 characters with seven numbered questions and came back as boilerplate.

**2. Submitted the "Become a Partner" survey** — the route July identified as
primary and which, as far as the record shows, had never been used.

**THE SURVEY STATES A THRESHOLD:** "We are particularly interested in hearing
from you if you operate one of the following, and **raise more than $10m for
charity each year**" — fundraising/social giving platforms, retail
marketplaces, streaming platforms. favpoll is orders of magnitude below that.
But the form's own Q6 offers "£0 - £1,000,000" as a band, so submissions far
below the bar are expected. Send it; keep expectations low. Answered Q6
honestly at the lowest band — anything else unravels in diligence.

**CHASE DATE: Monday 20 October.** If silent, one chase, then treat it as
signal (the July failure was not a refusal, it was three months of unexamined
silence).

**FEE WORDING USED, and a correction it forced.** The submission says favpoll
charges no platform fee and takes nothing from a pledge, with card processing
absorbed at settlement so the charity receives the pledge less its share. It
does NOT say "100% reaches the charity" — that claim was retired 2026-09-06
and I nearly restated it, because the BRAND SKILL still instructed it. Fixed
in `.claude/commands/favpoll-brand.md` on 2026-10-13. STILL CARRYING THE DEAD
CLAIM and not patched: `charity-collection-agreement-DRAFT.md` (lines 38, 193
— a contractual promise, left for the solicitor), `draft-terms-of-service-2026-09-15.md`
(line 36), `organiser-pitch.md` (line 59), `PROJECT.md`, and two PRINTED call
sheets (hospice, celebrant) that may already have been used with real people.


---

## Questions for the partnership conversation — HOLD until they engage

Not to be sent now. Two messages went out on 13 October and a third before any
reply is noise. These are for the moment PPGF picks it up.

**THE FEE, CORRECTED.** PPGF charges no platform fee, but a PARTNER FLOW IS
NOT FREE. Thrift+'s own donation screen discloses: *"You're donating to PayPal
Giving Fund UK (PPGF), a registered charity (No. 1110538). Your donation is
subject to processing fees of 1.4% + 20p."* PayPal absorbs processing on its
OWN surfaces; a partner integration does not get that. So the real comparison
is 1.4% + 20p against favpoll's current Stripe cost of 1.5% + 20p — roughly
FEE-NEUTRAL, marginally cheaper, which is a stronger and more checkable case
than "it's free". It also means the retired "100% reaches the charity" claim
does NOT come back under PPGF either.

**THE DISCRETION CLAUSE, which matters more than the fee.** The same screen
says: *"In the rare event PPGF can't fund your chosen charity, it will
(whenever possible) ask you to recommend another, and grant the funds to a
similar charity if you don't respond."* PPGF retains discretion — that is what
keeps Gift Aid valid — but it means money raised in a named person's memory,
for the hospice that cared for them, could be granted ELSEWHERE. A footnote
for a clothing resale platform; not a footnote for a funeral.

So, three questions (founder, 2026-10-13):

1. **What makes a charity unfundable, and what proportion of the register is
   affected?** The base rate across all charities is probably genuinely rare.
   The rate that matters to us is among the LONG TAIL — small, local, stale
   register entries — which is exactly where favpoll's core case lives. Only
   PPGF can tell us that number.

2. **Does the API expose fundability at SELECTION time, and does it cover all
   162,000 or only the ~8,000 enrolled?** This is the same question as the
   8,000-vs-162,000 gap. If we can know at the moment an organiser picks, the
   problem mostly disappears — we never offer what cannot be paid. Catching it
   after the pledge is far worse.

3. **When it does happen, can the platform be notified?** THE ONE TO PUSH
   HARDEST. For a memorial, PPGF quietly granting elsewhere and nobody telling
   the family is worse than the problem itself.

Partial mitigation already built: an organiser may nominate up to THREE
charities, so one unfundable charity can be absorbed by the others rather than
failing the favpoll.

### How the failure case gets handled — FOUNDER'S RULING, 2026-10-13

I had framed PPGF granting elsewhere as close to unacceptable for a memorial.
The founder disagreed and was right: *"even in memorial cases, i think it is
forgivable to try and fail to donate, notifying the family and requesting an
alternative. Surely they wouldn't mind."*

**Handled openly it is a service recovery, not a scandal.** "We tried to send
£340 to St Luke's, they cannot receive it this way, would you like to pick
another?" is a reasonable thing to say, and people forgive honest failures
handled well. What is unforgivable is them finding out afterwards — which is
why notification (question 3 above) is the one to push hardest, and the only
part of my original framing that survives.

One cost worth remembering: the family has usually already told forty guests
they are raising for that hospice, so going back to them is their
embarrassment as well as ours. That is an argument for catching unfundability
at SELECTION time, not for treating recovery as unacceptable.

**THE BUILT-IN FALLBACK IS ALREADY THERE:** an organiser may nominate up to
three charities, so one unfundable charity is absorbed by the others, the
money still goes where the family chose, and nobody has to go back to anyone.
Free, and needs no promise.

**MATCHING: available, never promised.** The founder raised matching the
donation if a family did mind, and that he could give personally rather than
through favpoll. Personally is the clean version — a private individual giving
to a charity is just that: no agreement, no bank details held by favpoll, no
commercial-participator question, and he can Gift Aid it himself so the
charity receives more than the original pledge. Everything I had objected to
was about FAVPOLL paying a charity directly, and none of it attaches to him
doing it.

**THE LINE IS THE PROMISE, NOT THE PAYMENT.** Never say it in advance and
never put it anywhere a guest or organiser can read. In writing it stops being
a kindness and becomes a term — one that triggers exactly where it is most
expensive to honour, and that turns one quiet gesture into an expectation the
next family inherits. Said afterwards, to one family, as a thing he chose to
do: entirely fine.

### Peer intelligence — Thrift+ (Joe Metcalfe, CEO)

**LinkedIn connection note SENT 2026-10-13.** Founder-to-founder, asking about
their experience running PPGF. LinkedIn rather than email because it confirms
he is still there (the article below is from 2020), because a guessed address
at thrift.plus could bounce silently, and because a connection note worked for
this founder once already (Goodstack trustees, 11 July 2026, accepted).

**WHY THRIFT+ IS THE PROOF POINT.** UKBAA, 14 April 2020: nine staff, a £950k
impact raise after Dragons' Den, and **"over £150,000 for charity in the
preceding 12 months"**. Their donation page today reads £2M+ raised, 6.8K+
charities, 36.8K+ donors. So Thrift+ has never been anywhere near PPGF's
stated "$10m+ per year" interest threshold, at any point — which is a better
answer to "what are our chances" than anything inferable from PPGF's partner
list.

**WHAT TO ASK ONCE HE ACCEPTS** (three is the most a stranger will answer):
how long PPGF took from first contact to live and what they wanted to see;
whether the Charity Search API covers the whole register or only enrolled
charities; and how often a chosen charity turns out unfundable, and whether
they are told. The third is worth most — PPGF will give a policy answer, a
peer can say what actually happens. The FEE question is deliberately not
asked: it is already visible on their own donation screen, and asking what you
can see wastes one of three.

**Note for the thread:** they are both Joe. Sign as Joseph Moffatt.

---

## 2026-10-14 — JOE METCALFE REPLIED, and two of it changes the build

He answered the next day. Quoted in full because the detail matters more
than the endorsement:

> Thanks for reaching out. I left Thrift+ in June but happy to say that
> PPGF as a team were brilliantly supportive and I massively approve of
> their mission. We used them in a semi automated way — uploading mass
> payments files, rather than full API integration. Which worked fine for
> us. No concerns. If you want a technical perspective then it was @Henry
> McIntosh who looked after that part. Though again noting we never did a
> full API integration for the actual payments. We used their API to look
> up available charities.

**THE REFERENCE IS CLEAN.** "Brilliantly supportive", "no concerns", from
a founder with no reason to flatter them and no stake left in the company.
Against a partner we cannot otherwise audit, that is the most useful thing
a peer could have said. Caveat: he left in JUNE 2026, so this is a picture
of the relationship to that date.

### 1. The money moves by FILE, not by API

Thrift+ never built a payments integration. They uploaded **mass payment
files** — "semi automated", and it "worked fine". That is a batch of
charity-plus-amount rows handed over, not a call per grant.

**This is good news, and it reshapes the seam** (see
`disbursement-provider-seam.md`). The interface there is per-charity —
`disburse(req): Promise<DisbursementResult>` — and the active provider is
a no-op that writes a ledger row and returns `pending`. For a file-based
partner **that no-op is already the correct first half**: the ledger is
the queue. What is missing is not a payments client but a PAIR either side
of it:

  - an EXPORT that turns pending ledger rows into PPGF's file format, and
  - an IMPORT that reconciles the outcome back onto those rows.

Cheaper than an API client, and it keeps a human in the loop at the exact
moment money leaves — which at favpoll's current scale (nothing raised,
nothing operating) is a feature rather than a compromise. It also means
the per-charity `disburse` signature survives untouched; only the provider
behind it becomes "write the row and wait for the batch".

**UNANSWERED, and now worth asking Henry rather than PPGF:** the file's
format and identifiers (does it key on registered charity number, or on a
PPGF id we must first resolve?), the cadence PPGF accepts it on, and what
comes back — a per-row result, or silence unless something fails. The
third decides whether question 3 below is solved or merely promised.

### 2. There IS a charity-lookup API, and it is the one we need

"We used their API to look up available charities." That is a partial
answer to **question 2** above — fundability at SELECTION time — from a
source other than PPGF's own sales answer. An API that returns AVAILABLE
charities is exactly the shape that lets us never offer what cannot be
paid.

Still open, and the whole value of it: **coverage.** Available means what —
the ~8,000 enrolled, or anything on the register PPGF can reach by cheque?
Joe's wording does not settle it and he may not know. Henry would.

**CONSEQUENCE FOR THE OUTREACH WAVE:** if that API answers fundability
across the register, the **donate-route HTTP probe is obsolete before it is
built** — see [[project-outreach-wave]], where it is currently the one
filter measurement had not killed. An authoritative list from the party
that actually moves the money beats inferring intent from whether a charity
has a donate button. DO NOT BUILD THE PROBE until the API's coverage is
known.

### Next step: take the Henry McIntosh offer

Joe offered him unprompted, which makes an introduction cheap to ask for
and likely to land. The questions are no longer the peer-experience three
from the LinkedIn plan — those are answered. They are now technical and
narrow: the file format and its identifiers, what comes back after an
upload, and the lookup API's coverage. All three are things PPGF would
answer slowly and a predecessor can answer in a paragraph, and all three
are currently blocking estimates rather than decisions.

The PPGF chase date (Monday 20 October) stands regardless: Henry can
describe the plumbing but cannot approve us.

### The two questions the founder wants asked (2026-10-14)

Both go back to Joe rather than to Henry, because only he can answer them:

1. **How established was Thrift+ when they first approached PPGF — what
   volume?** THE ONE WORTH MOST. The whole case for applying at pre-launch
   rests on Thrift+ having been nowhere near the survey's stated "$10m+ per
   year", and that is currently INFERRED from a 2020 UKBAA profile (nine
   staff, £150k for charity in the preceding year) plus their present-day
   "£2M+ raised". Joe can confirm or demolish it in one sentence, and if he
   confirms it, the threshold is an aspiration rather than a gate.
2. **How long from first contact to moving money?** Sets the expectation the
   chase date cannot: whether the rail is weeks or quarters away decides how
   much else gets parked behind it.

The COVERAGE question (whole register, or only the ~8,000 enrolled?) moved to
Henry, and PPGF must answer it formally anyway — so it is not worth one of
Joe's slots.

### How the file model actually works

Established from Joe: files not API, and the lookup API used for charities.
The rest is the standard shape of that flow and matches model (b) of the July
enquiry — collect, then grant onward with per-charity recommendations.

- **Per pledge, nothing reaches PPGF.** Stripe settles to favpoll's bank less
  processing; the pledge sits in the ledger. Already built.
- **At close**, `close-favpolls` splits `total_raised` equally across the ≤3
  charities and writes one `disbursements` row each, `pending`, keyed
  `${favpollId}:${charityId}`. Already built — the ledger IS the queue.
- **The batch run is the missing part:** EXPORT pending rows to a file (one
  line per grant), make ONE bank transfer to PPGF for the file's total,
  upload the file so they know how to break it apart, then IMPORT the result
  to mark each row sent / unpayable / failed on its reference.
- **PPGF grants onward** — enrolled charities by transfer, unenrolled by
  cheque or their own recommendation route.

Why it is cheaper than an API: no per-grant client, no retry or network
idempotency (the reference column already is the key), and a human sees the
total before money leaves — correct at £0 raised.

**THE LEGAL CONSEQUENCE, which is not PPGF's question.** This model means
favpoll HOLDS other people's donations between a favpoll closing and the file
going up. That is the heart of the Part II / agent-vs-principal question and
belongs in the brief for Pippa Garland, not in a technical conversation with
Henry. See references/legal-brief-the-fork-2026-10.md.

### THE TIP SETTLES THE MODEL CHOICE (founder, 2026-10-14)

He asked whether PPGF replaces Stripe, and if so what happens to the tips,
since PPGF cannot process those. The premise needs flipping, and the question
turns out to decide between the two models rather than threaten one.

**PPGF DOES NOT REPLACE STRIPE in the model Joe described.** Thrift+ collected
the money themselves and granted it onward, so PPGF sits DOWNSTREAM OF
SETTLEMENT, receiving a lump bank transfer. Stripe stays, the single
PaymentIntent stays (`app/api/stripe/payment-intent/route.ts` carries pledge +
tip + top-up in ONE charge, each stamped in metadata and verified server-side
at save, `fee_amount: "0"`), and the tip never enters the PPGF path. Only the
pledge portion goes in the file.

**THE TIP DOES BREAK MODEL (a), THOUGH — the PPGF checkout.** There PPGF
really would replace Stripe, and:

- PPGF cannot take the tip. Their checkout exists to receive charitable
  donations into a donor-advised fund; favpoll's optional contribution is
  COMMERCIAL REVENUE, not a donation, and has no business in that fund.
- So every guest needs TWO payments — PPGF for the pledge, Stripe for the tip.
  Two card entries, or a redirect and a return: exactly the checkout creep the
  founder retired the 100% claim to eliminate (`lib/card-fee.ts`, 2026-09-06).
- The pick and guest-book flow would break across a redirect to a third
  party's surface.
- And the tip would be asked for AFTER the donation had gone — the worst
  moment to ask.

So the tip is one of the strongest arguments FOR the file model, and unusually
it is structural rather than negotiable.

**A POSSIBLE FEE UPSIDE — A QUESTION, NOT A FINDING.** The 1.4% + 20p
disclosed on Thrift+'s donation screen is a CARD-processing fee on PPGF's own
checkout. In the file model the money arrives as one BANK TRANSFER with no
card involved, so that fee may not attach at all — which would make the file
model cheaper than the "roughly fee-neutral" comparison recorded above. They
may levy something else on inbound grants instead. ASK HENRY. (Two earlier
fee claims in this document were wrong: that PPGF charges nothing, and that a
PPGF model would restore the 100% line. Do not add a third.)

**THE COUNTERWEIGHT, so the choice is not made on one leg: GIFT AID MAY CUT
THE OTHER WAY.** Gift Aid needs a gift from an INDIVIDUAL to a charity, plus
that individual's declaration. If favpoll collects AS AGENT for the charity,
the donor's gift is to the charity and Gift Aid survives. If favpoll collects
AS PRINCIPAL and grants onward, the gift into PPGF is FAVPOLL'S, not the
donor's, and the declaration may be worthless — which would cost the charity
25% on every pledge that carried one.

That is the agent-vs-principal question, it is PIPPA'S and not PPGF's, and it
means: tips push hard toward the file model, Gift Aid might push back toward
the checkout, and THE LEGAL ANSWER DECIDES IT RATHER THAN THE ENGINEERING.
See references/legal-brief-the-fork-2026-10.md, which already asks every
question twice — once per structure. This is why.

### WHO GETS WHICH QUESTION (2026-10-14)

The questions had scattered across this document and it was no longer clear
who each was for. Four audiences, and the split matters because three of them
are cheap and slow and one is on the critical path.

**JOE METCALFE — commercial memory of the relationship. Nobody else can
answer these.**
- How established was Thrift+ when you first approached PPGF, what volume?
  THE ONE WORTH MOST: it is the only way to know whether the survey's "$10m+
  per year" is a gate or an aspiration.
- How long from first contact to moving money?
- Did Gift Aid ever apply to you at all? (See below — probably not, and a
  "no" is still worth having.)
- May I speak to Henry?

**HENRY McINTOSH — pure plumbing. A paragraph from him, weeks from PPGF.**
- The file's format and its IDENTIFIERS: registered charity number, or a PPGF
  id we must resolve first? If theirs, the lookup API is a PREREQUISITE.
- What comes back after an upload — per-row results, or silence unless
  something fails? This decides whether we can ever tell a family where their
  money went.
- The lookup API's coverage: the ~8,000 enrolled, or the register?

**PPGF — only they can answer, and only formally.**
- What makes a charity unfundable, and the rate in the LONG TAIL.
- Can the platform be notified when they re-grant elsewhere?
- Gift Aid in a GRANT-IN model (not their checkout).
- Does the 1.4% + 20p apply to a batch BANK TRANSFER, or only to their card
  checkout?
- Eligibility at pre-launch volume.

**PIPPA GARLAND — legal, and ON THE CRITICAL PATH because the Gift Aid answer
decides the model.**
- Agent or principal?
- Commercial participator or professional fundraiser under Part II, and the
  agreement that follows either way.
- Does holding donations between close and upload require anything?
- Does Gift Aid survive under each structure?

### THRIFT+ ALMOST CERTAINLY DID NOT DO GIFT AID — so the reference has a limit

Their model: you send clothes, Thrift+ resells them, and up to ~40% of each
sale goes to your chosen charity. The donation is therefore the PROCEEDS OF
SELLING YOUR OWN GOODS, not a cash gift from taxed income.

Gift Aid on goods does exist — the retail Gift Aid scheme — but it needs the
CHARITY to act as the donor's agent in selling, under a specific agency
agreement. Thrift+ is a commercial reseller, not a charity shop, so that
scheme does not obviously reach them.

**THE CONSEQUENCE FOR US: Joe's reference is clean on support,
responsiveness and the file mechanics, and SILENT ON GIFT AID.** Thrift+ used
PPGF to disburse resale proceeds, not to claim Gift Aid on cash gifts. Do not
let a good reference bleed into territory it never covered — nobody in our
evidence base has tested PPGF on Gift Aid.

### PRO BONO AT RUSSELL-COOKE: THEY DO IT, WE DO NOT QUALIFY

They run a free 15-minute telephone advice helpline with Voluntary Action
Islington and Kingston Voluntary Action — for MEMBER CHARITIES and
social-purpose organisations. favpoll is Josmo Services Limited, a commercial
company, so it does not qualify. Routing the question through a charity's
membership is not an option either: that would be using someone else's
entitlement for our benefit.

So the founder's instinct in September — that asking Hannah for pro bono felt
"slightly embarrassing" — was STRUCTURALLY CORRECT, not just shy.
Charity-sector pro bono is aimed at charities, and a for-profit platform
asking for free charity-law advice is knocking on the wrong door.

What IS reasonable to expect: a free scoping call, then a FIXED FEE for a
narrow question. The real lever is the one already pulled — Hannah's £5,000
bought a broad opinion that excluded drafting, where a single structured
question (agent or principal, and what follows) is a fraction of it. The fork
brief is already written to be answered that way.

### THE TWO MODELS COSTED (2026-10-14) — and a correction to my own framing

Founder, working the logic through: *"PPGF file model is good because it
avoids checkout fees... But would invalidate gift aid. We would need PPGF
checkout to support giftaid AND also Stripe for tips. But this wouldn't mean
double fees, would it?"*

**THE FEES. Nothing is charged twice on the same money — but the 20p FIXED fee
is paid twice, and it lands on the tip.** Stripe UK domestic 1.5% + 20p
(`lib/card-fee.ts`) against PPGF's disclosed partner rate of 1.4% + 20p, with
processing split proportionally as `/terms` promises:

| £10 pledge + £1 tip        | Charity | favpoll keeps of the tip |
|----------------------------|---------|--------------------------|
| FILE (one £11 Stripe charge) | £9.67 | **96.7p** |
| CHECKOUT (PPGF £10 + Stripe £1) | £9.66 | **78.5p** |

THE CHARITY LANDS WITHIN 3p EITHER WAY, at every size tested (£5/£1,
£10/£1, £25/£2.50, £50/£5). The whole difference falls on FAVPOLL'S TIP: a
flat ~18p per guest, which is 22% of a £1 tip and 6% of a £5 one. Being a
fixed-fee problem it bites hardest exactly where tips sit. So the file
model's advantage is not the pledge at all — it is that favpoll keeps its own
revenue.

**CORRECTION, MINE: THE FILE MODEL DOES NOT INHERENTLY INVALIDATE GIFT AID.**
I introduced the "Gift Aid may cut the other way" framing above and he
reasonably hardened it into "the file model would invalidate Gift Aid". It
would not, necessarily — JUSTGIVING COLLECTS AND PASSES DECLARATIONS to the
receiving charity, which is a collect-and-grant model with Gift Aid intact.
What the file model needs is two things, both open QUESTIONS rather than
blockers:
1. favpoll collecting AS AGENT and not as principal — Pippa's.
2. PPGF ACCEPTING PARTNER-COLLECTED DECLARATIONS — PPGF's, and standard
   practice elsewhere.
If either fails, Gift Aid dies on that rail. Neither is known to fail.

**HIS STRONGEST POINT: the prior question swallows all of this.** The live
`[COUNSEL]` marker in the draft terms asks whether a favpoll pledge qualifies
for Gift Aid AT ALL, since the guest's pick weights the standings and they may
receive a personal note. If that is a disqualifying benefit, Gift Aid fails on
EVERY rail, the dimension drops out, and the file model wins on everything
else including the 18p. His own earlier idea also survives either model: GIFT
AID ONLY ON THE SHARED POT, where the giver gets no pick and no note, so
nothing comes back to them.

**SO ASK ABOUT THE OTHER FEES — they never appear on a donation screen:**
- JOE: did Thrift+ pay PPGF anything at all — a platform charge, a monthly
  minimum, anything per payment file?
- HENRY: is there a per-row or per-grant cost on an uploaded file, and a
  minimum file value or frequency?

If the answer is "nothing", the file model's total cost is simply Stripe —
exactly what favpoll pays today, with no new fee anywhere in the chain.

---

## 2026-10-14 — GIVESENDGO, and why its regulatory model is not available to us

Founder: *"why don't we use givesendgo's regulatory model? Their organisers
can specify a charity themselves but are you saying that is just for display?
it is the organiser who gets paid and it is their responsibility to disburse?"*

He read the mechanics correctly. But GiveSendGo runs TWO models, and the one
that touches charitable money is the one we are already pursuing.

**givesendgo.com — the for-profit platform.** "Allocated funds are transferred
directly to the campaign owner or the identified beneficiary, depending on the
campaign's nature." They "cannot guarantee or be held responsible for the
campaign owner's actions or decisions after grant disbursement" and do not
"warrant that funds will be used for a particular purpose."

**givesendgo.org — "GiveSendGo Charities", EIN 88-3776392.** A SEPARATE
REGISTERED CHARITY running a DONOR-ADVISED FUND, a direct funding programme, a
DAF agreement and published grant policies.

Pay-the-organiser is what they use for PERSONAL fundraising, where there is no
charity and no tax deduction on offer. It is not an alternative regulatory
model for charitable giving; it is what you do when the recipient is a person.

**CORRECTION, SAME DAY.** I first wrote that GiveSendGo Charities is "the PPGF
architecture with the intermediary owned in house" — their rail for campaign
money. THE EVIDENCE DOES NOT SUPPORT THAT. It is a separate charitable
VENTURE: a donor-advised fund with a **$10,000 minimum**, a "V.I.P. Very
Important Projects" programme, and its own funds (Help A Veteran, GiverArmy
Charitable Causes), formed in 2022. That is a major-donor philanthropy product
and a grant-making arm, not the plumbing that moves an ordinary $50 campaign
donation — the main platform still pays campaign owners and beneficiaries
direct. They did not replace PPGF with it; they built a different business
alongside.

### Why PPGF was never available to GiveSendGo — and the one reason that transfers

No stated reason exists; theirs is mission language ("a greater impact of
hope"). But the structure is decisive: **A DONOR-ADVISED FUND CAN ONLY GRANT
TO QUALIFIED 501(c)(3)s.** GiveSendGo's core beneficiaries are individuals,
missionaries, families, legal-defence funds and small churches. PPGF cannot pay
any of those. For the bulk of their volume PPGF was not a rail they rejected —
it was one they could not use.

Two likely secondary reasons, inferred: DEPENDENCY RISK (their positioning is
that they do not refuse campaigns others do, and building on PayPal's charity
hands a veto to a company that has used one) and THE FLOAT (interest on held
funds, kept as a treasury fee).

**THREE OF THOSE DO NOT TRANSFER TO FAVPOLL.** We pay ONLY registered
charities, by design and as the trust proposition, so we fit a DAF the way
GiveSendGo never could; we are not exposed to deplatforming; we are not selling
philanthropy services. And they founded theirs in 2022 AFTER the convoy
campaign put them at scale — favpoll has raised £0, where founding a charity is
absurd.

**THE FIRST ONE TRANSFERS EXACTLY, AND IT IS WHAT HENRY'S COVERAGE QUESTION
TESTS.** If PPGF reaches only the ~8,000 enrolled charities out of 171,886 on
the register, then favpoll's core case — the small local hospice, the stale
register entry — hits precisely the wall that made PPGF unusable for
GiveSendGo. That is the point at which we would FACE their fork rather than
study it. And it is already framed: "own charitable intermediary" is the second
structure in references/legal-brief-the-fork-2026-10.md. So the coverage answer
does not merely size a feature — IT DECIDES WHICH HALF OF THAT BRIEF WE ARE
LIVING IN.

### And the saving would be illusory, which is what actually settles it

**PART II ATTACHES TO THE REPRESENTATION, NOT THE MONEY FLOW.** A commercial
participator under s.58 is someone carrying on a commercial venture who
REPRESENTS that contributions will benefit a charitable institution. While
favpoll's pages say the money goes to Marie Curie, that representation exists
whoever holds the cash. Routing payouts through the organiser would take every
cost below and still leave the s.59 agreement to draft.

### The costs are the product itself

- `/terms` says a pledge is "a gift to the favpoll's chosen registered charity
  — never to the organiser, and never to favpoll". That sentence IS the trust
  proposition.
- At a FUNERAL, telling guests the money lands in the bereaved family's
  account and they will pass it on is the opposite of what favpoll is for.
- It is the model that generates "crowdfunder kept the money" news stories.
  favpoll's differentiator is that this CANNOT happen.
- GIFT AID DIES OUTRIGHT — a gift to an individual is not a charitable
  donation, on any rail.
- It makes a grieving organiser the fundraiser, carrying the responsibility.
- Charities would not endorse it. The consent gate exists because they must
  agree, and none agrees to money reaching a stranger's personal account first.
- Payouts to individuals are MORE compliance, not less: per-organiser identity
  verification instead of one company's.

### One thing worth taking: a model agency clause

GiveSendGo's terms assert that "a giver's donation to a GiveSendGo fundraiser
fulfills the giver's obligation to the recipient, and the recipient agrees that
GiveSendGo's receipt of funds on their behalf constitutes receipt by them."

That is an AGENCY CLAUSE, contractually stated: the platform receives ON THE
RECIPIENT'S BEHALF, and that receipt counts as the recipient's. It is exactly
the position favpoll wants for the agent answer, and it is drafting precedent
to put IN FRONT of Pippa rather than describe to her in the abstract. Add it
to the fork brief's agent-structure section.

### Their revenue model, for the record (it is ours, plus two lines)

0% platform fee; processing 2.7% + $0.30 deducted from the GROSS donation so
the recipient bears it; a donor tip defaulting to 10%, donor-paid and
removable; **a fundraiser-contributed percentage of up to 10%, elected by the
organiser**; and **interest on funds they hold, retained as a "treasury
management fee"**.

The last two are not ours. The organiser contribution is straightforwardly
transferable — it never touches a guest's pledge — and is a product decision.
THE FLOAT IS NOT: under the file model favpoll holds donations between close
and upload, and whether the interest is favpoll's or the charity's IS THE
AGENT-VS-PRINCIPAL QUESTION WITH A NUMBER ON IT. Agent: the money is the
charity's and arguably so is the interest. Principal: it is favpoll's, but then
pledges are turnover. For Pippa.

### THE GOFUNDME WARNING, which is live and is about our own UI

GoFundMe's tip defaults are reported at 13.5-17.5%; state attorneys general
have called them deceptive; and a CLASS ACTION WAS FILED ON 6 AUGUST 2026
alleging preselected tips added without clear disclosure or affirmative
consent. The named faults: default settings, an unobvious opt-out, small type,
and not clearly identifying the charge as optional.

favpoll's tip UI (`components/pledge-card/utils.ts`, `pledge-dialog/
step-pay.tsx`) compares well against GoFundMe's: "None" is ALWAYS the first
chip at every tier; the amounts are FLAT, never percentages; the preselected
middle is ~10%, well below GoFundMe's 13.5-17.5%; and the tip is a line item
in the itemised breakdown before paying.

**CORRECTION (same day): MEMORIALS ARE NOT EXEMPT ON THE MAIN FLOW.** I said
`suggestTip: false` spared them. It does not — `favpoll-content/index.tsx`
carries the note that the memorial override was DROPPED 2026-07-31 on celebrant
feedback ("a None default simply stays None; nobody read the ask as
insensitive"). Only `favpoll-list-card.tsx` still passes it. So preselection is
UNIVERSAL on the primary surface, deliberately, and for a MEASURED reason.

### THE REAL EXPOSURE IS NOT THE US LAWSUIT — IT IS ALREADY UK LAW

The class actions (Donovan v. GoFundMe, N.D. Ill. 1:26-cv-09423, filed 6 Aug
2026; Munoz v. GoFundMe, N.D. Cal. 3:26-cv-01217, further along) cannot reach
Josmo Services Ltd, and US consumer class actions typically run 2-4 years and
settle. They are a signal, not a risk.

**The DMCC Act 2024 is the risk, and it is in force.** CMA direct enforcement
powers since 6 April 2025, fines up to 10% OF GLOBAL TURNOVER. The rule that
bites: optional extras need not sit in the headline price BUT MUST BE GENUINELY
OPTIONAL AND NOT PRE-SELECTED — pre-ticked add-ons included unless the consumer
actively deselects them are named as problematic. On 18 November 2025 the CMA
opened its first investigations under the regime, explicitly targeting unfair
online choice architecture including AUTOMATICALLY BUNDLED OPTIONAL SERVICES.

Where favpoll stands: CLEAN on drip pricing — the tip is a visible itemised
line before payment and nothing is revealed late. EXPOSED on the separate
pre-selection point, universally, on the primary surface.

**DO NOT CHANGE THIS ON MY READING OF A SEARCH RESULT.** The obvious fix —
default to None — is one the founder already tested and found fatal to the only
revenue line. It is consumer law, Pippa is being engaged anyway, and it is a
cheap addition to her list:

- Is a PRE-SELECTED optional contribution, itemised in full before payment,
  compliant under the DMCCA's choice-architecture provisions?
- If not, does an ACTIVE CHOICE satisfy it — no pre-selection, but no skipping
  either, so the guest must pick a contribution (including zero) to continue?
  That is the option worth her view, because it answers "not pre-selected"
  WITHOUT defaulting to the outcome that was measured as nothing.

And one thing that helps under any answer: the VISIBLE label reads "Tip for
favpoll", with "optional" only in the `aria-label`, so a sighted guest never
reads it. One word. HIS COPY, HIS CALL.

### PPGF's REACH DOES NOT STOP AT THE ENROLLED 8,000 — CORRECTING THE FRAME

Founder: *"why would PPGF's reach stop at the 8000? who else would they hand
out cheques to?"* He was right to push. From PPGF's own UK help pages:

- **Enrolled** → electronic payment, promptly.
- **Not enrolled** → PPGF invites them to enrol, for up to 90 days, and a
  charity that never enrols **RECEIVES A CHEQUE WITHIN 90 DAYS OF THE
  DONATION, posted to its CHARITY COMMISSION ADDRESS.**
- **INELIGIBLE** — lost Charity Commission registration, or breached PPGF's
  Charity Certification Policy → *then* the donor is asked to nominate an
  alternative.

**So enrolment governs PAYMENT METHOD AND SPEED, not whether money arrives.**
The 8,000-vs-171,886 gap is a latency gap, not a fundability gap.

**THIS SHRINKS THE DISCRETION WORRY SHARPLY.** The clause that money could be
granted elsewhere applies to INELIGIBLE charities, not merely unenrolled ones —
a far narrower set. And favpoll ALREADY CATCHES THE MAIN CASE:
`register_account_removals()` and `scripts/register/check-removals.ts` refuse
approval on a removed number, loudly, with the money at stake attached.

**SO I OVERSTATED THE GIVESENDGO PARALLEL.** I wrote that the coverage answer
"decides which half of the fork brief we are living in". It does not. Their
wall was BENEFICIARIES WHO ARE NOT CHARITIES — individuals, missionaries,
legal-defence funds — and every favpoll recipient is a registered charity by
design. A small local hospice that has never heard of PPGF still gets paid.

### The two residual issues, both narrower and both actionable

1. **NINETY DAYS.** A cheque within 90 days *of the donation*. A favpoll may
   itself run up to 90 days, then close, then disburse. For a MEMORIAL the
   family could be six months from knowing the money landed. That is a
   COMMUNICATION problem, not a money problem — and it is exactly why the
   notification question is the one to push hardest on PPGF.
2. **THE CHEQUE GOES TO THE REGISTER ADDRESS.** A stale address sends the
   cheque to the wrong place. But favpoll HOLDS that address in the mirror, and
   it is on screen in admin as `register_place` since #1033 — so it is
   checkable before a charity is ever named, which is a better position than
   most platforms are in.

### Henry's question sharpens accordingly

It stops being "does the lookup API cover the register" and becomes **"does the
lookup tell us whether this SPECIFIC charity is enrolled?"** Enrolled-vs-not is
the difference between prompt electronic payment and a 90-day cheque — worth
knowing at the moment an organiser picks, and possibly worth telling them.

### GIVESENDGO DOES NOT USE PPGF — correcting a premise I accepted

The founder asked "why did GiveSendGo choose to create a charity rather than
use PPGF?", and I answered it — reasoning about why PPGF would not have suited
their missionaries and individuals — WITHOUT FIRST CHECKING WHETHER PPGF WAS
EVER A CANDIDATE. It was not. There is no PPGF anywhere in their model. The
earlier section's reasoning about "why PPGF was never available to them" is
answering a question nobody established.

**What they actually do** (their own policies and filings):

- **GiveSendGo Charities, Inc.** — a New Hampshire 501(c)(3), EIN 88-3776392,
  LEGALLY DISTINCT from GiveSendGo.com.
- It USES the platform to receive and distribute tax-deductible donations.
- "All donations to GiveSendGo Charities, Inc. become the property of the
  charity, and the Board of Directors retains FULL CHARITABLE DISCRETION over
  all disbursements."
- "GiveSendGo disburses funds to recipients via third-party payment processors,
  ACH transfers, or other disbursement methods" — THEY DO IT THEMSELVES.
- The charity issues the tax receipts. Disaster relief within 30 days; grants to
  individuals or families 2-4 weeks after verification.
- The TIP MODEL sits on the shared platform and serves both arms. That part
  favpoll already copies.

### So this is the SECOND FORK, with a proof point at scale behind it

Their charitable model is: OWN A CHARITY, take the donation INTO it, hold board
discretion, grant out. That is `legal-brief-the-fork-2026-10.md`'s charitable
intermediary — with favpoll owning the intermediary instead of renting PPGF's.

**What it would buy:**
- NOBODY CAN REFUSE US. No $10m threshold, no eligibility survey, no enrolment
  latency, no third party re-granting a memorial's money elsewhere.
- Our own charity claims the Gift Aid.
- TIPS RIDE THE SAME STRIPE CHARGE — GiveSendGo demonstrably does this, which
  is the first evidence in this file that a one-charge split is workable.
- We could pay a small local hospice DIRECTLY, which is favpoll's core case.

**What it costs, and two are UK-specific:**
- Running a charity: Commission registration, trustees, annual accounts,
  independent governance.
- THE COMMISSION SCRUTINISES A CHARITY CONTROLLED BY A COMMERCIAL COMPANY.
  Trustee independence is the issue, and "Josmo Services Ltd's charity" invites
  exactly that question. Probably a CIO, and probably slow.
- DISCRETION DOES NOT DISAPPEAR, IT BECOMES OURS. Board discretion over grants
  is inherent to the structure, not a PPGF quirk — we would inherit the same
  inability to promise a donor their chosen charity absolutely.
- Months and real money at £0 raised. GiveSendGo built theirs in 2022, AFTER
  the convoy campaign put them at scale.

**And it does not fix QUESTION B.** Whether a pledge is a pure gift depends on
what the GUEST gets back — the pick weighting the standings, the personal note.
Changing who receives the money does not touch that.

NOT TO PURSUE NOW. But it is the first time the second fork has had a working
proof at scale behind it, which changes the question for Pippa from "could we?"
to "GiveSendGo does — what would it take here?"

---

## 2026-10-14 — GOFUNDME IS THE PROOF POINT. (The founder meant GoFundMe, not GiveSendGo.)

He asked whether "they" use PPGF to disburse plus a tip model, meaning
GoFundMe. They do, and it answers in practice the question this document has
been circling since July.

**From GoFundMe's own support pages:**
- "GoFundMe partners with PayPal Giving Fund to send funds raised for certified
  nonprofit fundraisers."
- Nonprofit fundraisers run in the **US, UK, Ireland, Canada and Australia** —
  so the arrangement exists IN OUR MARKET, with PPGF UK as the registered
  charity intermediary.
- ENROLLED nonprofits receive funds to their PayPal account; UNENROLLED receive
  a cheque in the mail — consistent with PPGF's own published policy.
- MONTHLY payout: donations through the 15th go out that month, after the 15th
  the following month.
- "The fundraiser organizer will not set up bank transfers or handle the funds
  raised."

So a platform at enormous scale collects donations on ITS OWN PAGES, runs a TIP
MODEL as its revenue, and uses PPGF to disburse, in the UK. That is favpoll's
intended shape, already operating.

### RETRACTION: the tip is not a structural objection

I wrote that a PPGF route forces TWO PAYMENTS per guest (~18p and a broken
flow) and called it "structural rather than negotiable". **GoFundMe takes a tip
alongside a PPGF-destined donation in what the donor experiences as ONE
PAYMENT.** The thing I said could not be done is done at scale in our market.
That is the third movement in this analysis; the earlier costing of the
"checkout model" assumed a split that GoFundMe does not appear to make.

### Question A gets much easier to ask

Not "do you support model (a) or (b)?" but **"we want the GoFundMe
arrangement — what does that take?"** Naming a live partner beats describing an
abstraction, and it also sidesteps the risk of them answering the wrong
question.

### STILL OPEN: the legal mechanics underneath

GoFundMe describes tips as "a separate transaction between the donor and the
platform", yet a user reported the tip being DEDUCTED FROM THEIR GIVING-FUND
BALANCE — so even their own framing is ambiguous. Whether the donation is made
TO PPGF with the platform as its agent, or the platform COLLECTS AND GRANTS
ONWARD, is still what decides agent-vs-principal, who holds the float, and who
claims Gift Aid. GoFundMe proves it is ACHIEVABLE. It does not tell us ON WHAT
TERMS, and it cannot: they are orders of magnitude over the $10m threshold.

### A pattern worth noticing

GoFundMe has since launched its own "GoFundMe Giving Fund" (carefully not
calling it a DAF: 13.5% default tip, $5 minimum to charities, 2.9% + $0.30
processing) and offers GoFundMe Pay so US nonprofits can bypass PPGF entirely.
GiveSendGo built their own 501(c)(3) too. **THE BIG PLAYERS START ON PPGF AND
END UP OWNING AN INTERMEDIARY** — arrived at independently, twice. That is the
second fork of legal-brief-the-fork-2026-10.md, and it is where scale leads.
Which argues for PPGF now and the fork later, rather than either/or.

---

## 2026-10-14 — WHAT THE COMPETITION PUBLISHES. Read before paying anyone.

Founder: *"the more info we have ahead of a scoping meeting with Pippa, the
less she can charge us for."* Correct, and the public documents turn out to
answer most of it.

### 1. GOFUNDME'S TERMS ANSWER QUESTION A IN WRITING

> "**PayPal Giving Fund receives Donations from Users as the NPO of record**
> and then, in accordance with its policies, grants Funds to the NPO selected
> by the Organizer."
>
> "GoFundMe itself **does not hold any funds** raised on our Platform, nor does
> it handle the actual processing of payments."
>
> "Tips are fully optional, and Donors may decline to tip GoFundMe by moving
> the tip slider to 0%. **Tips go directly to GoFundMe.**"

So: DONATION → PPGF AS NPO OF RECORD. TIP → THE PLATFORM. One donor-facing
flow, and the platform holds nothing.

**Why that is the attractive branch for favpoll:** no holding, no float, no
trust account, agent-vs-principal largely DISSOLVES for pledges (no turnover,
no VAT exposure), and Gift Aid becomes PPGF's to claim as the charity of
record. The tip is a clean, separate payment to favpoll.

**ONE GENUINE PUZZLE, do not copy it blind:** GoFundMe's terms contain NO
reference to Gift Aid, the Charities Act 1992, commercial participator status,
professional fundraiser status, solicitation statements, or trust. Possible
readings: that with PPGF as NPO of record they argue the donor gives directly
to a charity so GoFundMe is not representing that ITS contributions benefit a
charity; that UK compliance lives in a separate document; or that they are
exposed. We cannot tell, and must not assume the first. FOR PIPPA.

### 2. JUSTGIVING'S TERMS ARE THE OTHER MODEL, ALSO IN WRITING

> Donations are paid into a "**Charity Trust Funds Account**" and are "held on
> trust for the Charity and **do not belong to JustGiving**" — *other than the
> interest accruing on such monies*.

Collect-and-remit done properly in the UK: a trust account, funds on trust for
the charity, **THE INTEREST EXPRESSLY CARVED OUT so JustGiving keeps the
float**, and JustGiving acting as each charity's **GIFT AID AGENT under an
agreement with each charity**.

That answers the float question ("whose is the interest?" — theirs, by express
term) and shows the agency drafting, in the published terms of the platform
favpoll says it mirrors.

### 3. WORK FOR GOOD SHOWS HOW TO DELIVER THE s.59 AGREEMENT

Businesses fundraising through them **are commercial participators** under the
1992 Act — they say so plainly. And they **INCORPORATE THE COMMERCIAL
PARTICIPATION AGREEMENT INTO THE T&Cs BOTH PARTIES ACCEPT ON REGISTRATION**,
with a solicitation statement at the point of sale naming the charity.

**So favpoll may not need 42 signed documents.** The agreement can live in
terms accepted at onboarding — close to what the consent gate already does.
This is the single biggest cost saving available on the legal track.

### 4. THE TEMPLATE IS FREE — AND IT IS PUBLISHED BY BATES WELLS

**"Charities Act 1992 – Standard Form Agreement", Institute of Fundraising in
partnership with BATES WELLS.** Free to use. Saved in this repo as
`references/iof-bates-wells-standard-form-agreement-charities-act-1992.pdf`.

Covers: definitions and interpretation; the terms of the commercial
participation arrangement; identifying the charitable beneficiary; charity
accounts and financial arrangements; insurance and liability; termination;
dispute resolution. It addresses the s.60 solicitation statement.

**Hannah's own firm publishes the drafting template her £5,000 opinion
excluded.** Not a criticism of the quote — an opinion is not a template, and a
template is not advice on our facts. But it changes what we are buying.

### WHAT THE SCOPING CALL SHOULD NOW ASK

Not "advise us on Part II". Instead, four narrow things, three of which have a
document attached:

1. **Which architecture applies to us** — PPGF as NPO of record (GoFundMe) or
   trust account plus per-charity agency (JustGiving)? Both are published; we
   are not asking her to invent one.
2. **Adapt the IoF/Bates Wells standard form** for a platform naming up to
   three charities per favpoll, with equal splits. Drafting from a free
   template, not from scratch.
3. **Can the agreement be incorporated into terms accepted at onboarding**, as
   Work for Good does, rather than signed per charity?
4. The two nobody else can answer: **does a favpoll pledge qualify for Gift Aid
   at all** (the pick weights the standings, a personal note may follow), and
   **is a pre-selected optional contribution compliant under the DMCC Act**.

That is a scopable, fixed-fee brief instead of an open opinion.

### THE QUESTION THAT MAY UNBLOCK THE PRODUCT (founder, 2026-10-14)

*"why would we need per-charity agreement if we are using ppgf?"*

**s.59 requires a written agreement with THE CHARITABLE INSTITUTION.** If PPGF
is the **NPO of record** — the donation is made to PPGF, and PPGF decides the
grant — then the charitable institution receiving favpoll's solicited funds is
arguably **PPGF**. In which case favpoll needs **ONE AGREEMENT, WITH PPGF**,
not 42 and eventually thousands.

**AND THAT WOULD EXPLAIN GOFUNDME'S SILENCE.** Their terms mention no
commercial participator status, no solicitation statement and no per-charity
agreements — which read as a conspicuous gap when first found. If their s.59
counterparty is PPGF and the arrangement lives in their PPGF partner contract,
there would be nothing to put in public terms.

**THE COUNTER-ARGUMENT, so both are on the table.** favpoll's pages say a
pledge is "a gift to the favpoll's chosen registered charity". If favpoll
represents that contributions benefit MARIE CURIE, a regulator might hold that
Marie Curie is the charitable institution however the money transits. GoFundMe
names nonprofits too, so they are exposed to the same reading — which is either
reassurance or shared risk, and we cannot tell which.

**WHY THIS IS WORTH MORE THAN ANYTHING ELSE IN THIS FILE.** If one PPGF
agreement suffices it does not merely save drafting — IT UNBLOCKS THE PRODUCT.
The consent gate exists because of the agreement requirement: 42 charities sit
pending, nothing is listed, no favpoll can accept a pledge, and outreach gates
everything downstream. If the counterparty is PPGF rather than each charity,
the gate could open across the register. **42 charities against 171,886.**

Charities may still WANT to be asked — reputationally, and consent-first was
partly the founder's own ethical choice. But wanting and being legally required
are different things, and only one of them blocks launch.

**IT ALSO WEAKENS THE JUSTGIVING LEAN I HAD JUST OFFERED.** That rested on
three legs: favpoll already has Stripe and a one-charge flow; it needs a
per-charity agreement anyway; and it does not depend on PPGF saying yes. THE
MIDDLE LEG MAY NOT HOLD, and it was doing real work. If PPGF collapses the
agreement requirement from thousands to one, that is a serious — possibly
decisive — advantage for copying GoFundMe, because it is the difference between
launching and waiting on outreach.

**SO THIS IS NOW FIRST ON PIPPA'S LIST**, ahead of agent-vs-principal: under
the PPGF-as-NPO-of-record architecture, is our s.59 counterparty PPGF or each
named charity? And if PPGF, does the consent gate remain a choice rather than a
requirement?

### THE FOUNDER'S POSITION, STATED PLAINLY (2026-10-14)

I offered a "two tier" framing — onboarded charities, plus a long tail favpoll
could name "without having met them". He rejected the framing:

> *"i don't want to meet any charities to be able to fundraise for them. i want
> to do it because it is useful, not because it is necessary."*

**So the position is: FUNDRAISING FOR A CHARITY SHOULD REQUIRE NOTHING FROM
THAT CHARITY. Onboarding exists because it GIVES them something — their own
favpolls, appeals, a profile — not because it buys permission.** A value
exchange, not a gate. Which is a better business: you approach a charity to
BRING them something rather than to ask a favour.

**WHAT FOLLOWS, and it reorders everything:**

1. **The s.59 counterparty question is no longer a rail detail. It is the
   question the business model rests on.** If the answer is "each named
   charity", this model is not expensive — it is UNAVAILABLE. If it is PPGF, it
   works.
2. **So the architecture choice was never about the 18p or the tip.** It is
   about whether favpoll can name a charity it has never contacted. GOFUNDME'S
   MODEL PERMITS EXACTLY THAT — their auto-created nonprofit pages ARE this
   model, operating in the UK today. JUSTGIVING'S DOES NOT: charity membership
   first, every time. That is a far better basis for choosing than fees.
3. **Outreach inverts.** The unwritten cold invite was going to ask permission
   (the existing draft "claims an organiser has already picked them"). Under
   this model the email says *money has been raised for you*, or *here is what
   you could run yourself*. Much easier to send, much easier to answer — and
   the reason parking the copy was right.
4. **The consent gate is a lever, not a feature** — which is already how it was
   built (posture env, inert-by-default, "legal opinion sets the flip"). Nothing
   to unbuild.
5. **HE ALREADY BUILT FOR THIS.** 171,886 charity profiles and a page for every
   registered number make no sense for a catalogue of 42 approved charities. The
   charity-profiles work was built AT REGISTER SCALE, which is this model rather
   than the consent-gated one. The instinct has been consistent since September
   even while the legal framing wobbled.

**THE HONEST RISK, as the mirror image:** if the answer is "each charity", much
of that register-scale work becomes outreach TOOLING rather than product
surface — still useful for verification, prioritisation and the removal check,
but a different job.

---

## FOUNDER'S STANDING RULING, 2026-10-15: GET IN GOFUNDME'S SLIPSTREAM

> *"i don't want to be held up so lets get in the gofundme slipstream. as a
> matter of course, use their practices as a guide for our own, subject to a
> partnership with PPGF"*

**So GoFundMe's published practices are the DEFAULT GUIDE for favpoll's
charitable-fundraising practices, conditional on a PPGF partnership.** Where
they have published a practice, follow it rather than inventing a position.

### THREE CARVE-OUTS — the instruction needs a boundary, not just a direction

1. **NOT their tip UI.** They pre-select 13.5-17.5%, are being sued over it
   (Donovan, N.D. Ill., filed 6 Aug 2026; Munoz, N.D. Cal.) and state attorneys
   general have called it deceptive. favpoll is already better: "None" first at
   every tier, FLAT amounts never percentages, ~10% at the preselected middle,
   and the tip itemised before payment. Following GoFundMe here would move
   BACKWARDS into the conduct in litigation. OUR TIP PRACTICE STAYS OURS.
2. **NOT their auto-created nonprofit pages.** They generate pages for
   charities that never signed up, and advisers publicly tell charities to
   object. "Charities need not agree first" and "charities get no say" are
   DIFFERENT THINGS, and the second is what causes the friction. Keep a removal
   path on request — Code 9.1.1 expects it anyway.
3. **WHERE THEY ARE SILENT WE ARE ON OUR OWN.** Their terms say nothing about
   UK Part II, commercial participator status or solicitation statements.
   Copying a gap is copying nothing; that is what Pippa is for.

### WHAT THE RULING CHANGES

- **Disbursement build: probably NONE.** If PPGF is NPO of record and receives
  the donation, there is no export, no import and no payouts to build. PR #1026
  (bank details) CLOSES rather than unparks.
- **`/terms`:** the money paragraph is rewritten so PPGF receives as charity of
  record and grants onward. DRAFT NOW, SHIP ONLY WHEN THE PARTNERSHIP IS REAL —
  saying it before it is true would be false, and the current wording ("a gift
  to the favpoll's chosen registered charity") is what creates the per-charity
  s.59 reading.
- **Consent gate:** becomes a lever to flip when the partnership lands AND
  Pippa confirms. Not before.
- **Charity pages:** the 171,886 profiles and per-number pages become product
  surface, as they were built to be.
- **Outreach copy:** inverts to an OFFER. Still parked, but now parked on a
  known shape.
- **THE ONE OPEN ENGINEERING RISK:** if PPGF must be charity of record, the
  pledge has to REACH PPGF — which may mean not using Stripe for pledges.
  "No disbursement build" may therefore trade for "a payment-integration
  build", and nobody has told us which. This is the mechanism question (A).

### WHAT IS NO LONGER WORTH DOING

Designing the file-model export/import pair. It was built on one sentence of
Joe's that PPGF's own policies do not support, and under this ruling it is not
the architecture anyway.

---

## 2026-10-15 — JOE'S SECOND REPLY. The practitioner's answer to the s.59 question.

Quoted in full, because it is the most consequential paragraph in this file:

> PPGF is the middle man, so you just need to have a contract with them that
> makes you one of their partners. After that you are then able to present the
> charities and their logos to your customers. **You don't need any direct
> relationship with the charities themselves.** PPGF are then strict on how you
> present the donation and wording etc in your TS and C's and on the donation
> page.
>
> Having said that, I do think they aim for something like **£10k per year**. We
> were relatively established but not very.
>
> But yes, it is a small team at PPGF and requires effort on their side to
> integrate and manage your account, so there will be a process of explaining
> who you are and **that there are a significant volume of donations expected**.
>
> In terms of how long - I can't quite remember, I'm afraid. It's not some big
> bureaucratic thing, just a small team so a few calls. Then they share the
> process / tech docs.

### 1. ONE CONTRACT, NO CHARITY RELATIONSHIPS — practised, not theorised

This is the founder's model, described by someone who ran it: a partner
contract with PPGF, after which you may present charities AND THEIR LOGOS,
with no relationship with any of them.

**WHAT IT DOES NOT SETTLE, and the distinction matters.** Joe is describing
PPGF's COMMERCIAL requirement, not UK statutory compliance. "PPGF says you do
not need charity relationships" is PPGF's position on its own contract; it is
not a view on whether favpoll is a commercial participator under s.58 or whose
agreement s.59 then requires. Joe is not a lawyer and does not claim to be.

**BUT IT IS STRONG EVIDENCE, and it narrows the legal question to almost
nothing.** PPGF is a UK registered charity (1110538) that presumably takes its
own advice, and the giveaway is the next sentence: they are **STRICT ON THE
WORDING** in our T&Cs and on the donation page. That is exactly what you would
expect if the wording is engineered so the donor's gift is legally TO PPGF —
which is what makes PPGF the s.59 counterparty. The mandated wording is the
mechanism, and it is theirs.

So the ask of Pippa collapses from "advise us on Part II" to: **here is PPGF's
partner agreement and the wording they require — does it make PPGF our s.59
counterparty?** One document, one question.

**A CONSEQUENCE WORTH NAMING: `/terms` IS PARTLY NOT OURS TO WRITE.** The money
paragraph and the pledge-page copy will be constrained by PPGF. Which also
dissolves the worry recorded above that our own wording ("a gift to the
favpoll's chosen registered charity") creates the per-charity reading — we will
be told what to say instead.

**AND THE LOGOS COME WITH IT.** "Present the charities and their logos" bears on
the charity-image work (#1014/#1023): scraped favicons and og:images may be
replaceable by whatever PPGF supplies. Worth asking before more scraping.

### 2. THE THRESHOLD IS NOT $10m

Joe: "something like £10k per year". The survey's line is **"We are
particularly interested in hearing from you if you operate one of the
following, and raise more than $10m for charity each year"** — a PREFERENCE,
not a bar, and the form's own Q6 offers a "£0 - £1,000,000" band, which already
said submissions far below are expected. Both can be true: $10m is who they
court, £10k is what they will take.

**THE REAL REQUIREMENT IS A CREDIBLE VOLUME STORY, NOT A NUMBER WE ALREADY
HIT.** "A process of explaining who you are and that there are a significant
volume of donations expected." favpoll has raised nothing, so this is work:
the application needs projections it can defend, and the funeral-director
channel (Co-op's ~93,000 services a year) is the strongest thing we have to
put in it. See [[project-funeral-directors]].

### 3. THE TIMELINE IS CALLS, NOT BUREAUCRACY

"Not some big bureaucratic thing, just a small team so a few calls. Then they
share the process / tech docs."

**SO HENRY'S QUESTIONS MAY ANSWER THEMSELVES.** The file format, what comes
back after an upload, the lookup API's coverage — Joe says PPGF share the
process and tech docs once engaged. Henry is still worth asking (he is free and
immediate, where PPGF is a few calls away), but the plumbing questions stop
being blockers and become things that arrive with the partnership.

### WHAT THIS MEANS FOR MONDAY

The chase stops being "will you consider us" and becomes **"we would like to
be a partner — may we have a call?"** with a volume story attached. And the
single question to put to Pippa afterwards is the partner agreement plus their
mandated wording, which is one document and one question instead of an opinion.

### THE MANDATED WORDING, FOUND IN THE WILD (2026-10-15)

Joe said PPGF "are strict on how you present the donation and wording etc in
your TS and C's and on the donation page". So we read a UK partner's terms. The
founder's idea; it paid.

**THRIFT+'S OWN TERMS (thrift.plus/terms-of-service) — the closest precedent we
have, because Thrift+ is a UK company where GoFundMe's UK arm has a US parent:**

> "In both scenarios, **we make a donation on your behalf to PayPal Giving Fund
> (registered charity No. 1110538)**" — which then "makes a grant to your
> **Suggested Charity**."
>
> Users select from charities "**enrolled with PayPal Giving Fund**". If a
> preferred charity is not available, Thrift+ recommends contacting them about
> enrolment.
>
> "There is no additional fee to you or your Suggested Charity for processing
> this donation."

**PPGF UK'S OWN FRAMING:**

> "All donations through PayPal Giving Fund programmes are **gifts made
> voluntarily to PayPal Giving Fund**, a registered charity in England and
> Wales (No. 1110538), **for the benefit of a charity chosen by the donor**."
>
> "PayPal Giving Fund has **legal control over all donations**."
>
> Grants monthly, typically 15-45 days after receipt; where funds cannot be
> delivered, PPGF reassigns them.

**"SUGGESTED CHARITY" IS THE GIVEAWAY.** The vocabulary carries the legal
architecture: the donor SUGGESTS, PPGF GRANTS, PPGF holds LEGAL CONTROL. That is
what makes PPGF the recipient, and so arguably the s.59 counterparty. The
discretion clause the founder already ruled on is the same sentence seen from
the other side.

**SO WE KNOW THE SHAPE OF OUR `/terms` CHANGE WITHOUT PAYING FOR IT.** Today:
"A pledge is a gift to the favpoll's chosen registered charity — never to the
organiser, and never to favpoll." Under PPGF's framing it becomes closer to:
a gift to PayPal Giving Fund, for the benefit of the charity you suggest. The
word "pledge" survives; "chosen" becomes "suggested"; the recipient changes.
NOT TO BE WRITTEN until a partnership exists, but no longer unknown.

### THE PATTERN IN WHAT IS ABSENT

Thrift+'s terms mention NO Gift Aid, NO Charities Act 1992, NO commercial
participator or professional fundraiser status, NO solicitation statement.
Exactly as GoFundMe's do not.

Two UK-operating PPGF partners, the same silence — and Thrift+ is the weightier
case: a UK company selling goods and donating a share while naming charities is
close to the PARADIGM commercial participator. Its silence either strongly
supports the PPGF-as-counterparty reading or is two partners making the same
omission. PIPPA DECIDES WHICH, but it is a far better-evidenced question than
it was this morning, and the evidence is free.

(Also: no Gift Aid anywhere in their terms, which confirms the earlier
reasoning that Gift Aid never applied to Thrift+ — their donation is resale
proceeds, not a cash gift from taxed income.)

### A NEW CONSTRAINT: THE PICKER MAY BE THE ENROLLED SET, NOT THE REGISTER

Thrift+ offered only charities "enrolled with PayPal Giving Fund", and told
users to ask an unenrolled charity to enrol. That matches their published
"6.8K+ charities" — the ENROLLED set, not the register's 171,886.

So even though PPGF can CHEQUE an unenrolled charity (their own policy, above),
a partner's SELECTION LIST may be limited to the enrolled. Those are consistent:
the picker uses the enrolled list; the cheque route covers donations made
elsewhere, such as GoFundMe's auto-created nonprofit pages.

**THIS SHARPENS THE COVERAGE QUESTION INTO ITS FINAL FORM, FOR PPGF:** can our
picker offer ANY registered charity, or only your enrolled list? Thousands
either way, and vastly more than 42 — but favpoll's core case is the small
local hospice, and that is exactly the kind most likely to be unenrolled.

### CORRECTION, SAME HOUR: THE PICKER IS NOT LIMITED TO THE ENROLLED

The founder: *"gofundme offer more than the enrolled charities, don't they?"*
They do, and the constraint I had just introduced was wrong.

**PAYPAL'S OWN PARTNER PAGE:** the Charity Search API provides access to "a
global directory of **over a million vetted charities**" and "quickly updates
the list of **eligible** charities with **registration and status data**".

**GOFUNDME'S OWN SUPPORT:** "If you're enrolled with PPGF, you can receive
funds directly to your business PayPal account, and **if you aren't enrolled,
funds will be disbursed via a check in the mail.**"

So ELIGIBILITY IS DRIVEN BY REGISTRATION, NOT ENROLMENT. Thrift+'s
enrolled-only picker was **Thrift+'s own choice**, not a PPGF limitation —
plausibly operational, since 90-day cheques across thousands of tiny resale
donations would be miserable to run.

Which restores the conclusion reached two days ago from PPGF's help pages and
then talked out of an hour later: **ENROLMENT IS LATENCY, NOT REACH.**

**MY OWN PATTERN, WORTH NAMING SO IT STOPS.** Twice in this thread I narrowed
the picture on partial evidence and the founder pushed back, and both times the
published facts were MORE favourable than my reading: first "PPGF's reach stops
at the enrolled 8,000" (wrong — unenrolled charities get a cheque), then "a
partner's picker may be limited to the enrolled set" (wrong — the API's universe
is the register). The error was the same both times: reading ONE partner's
implementation as the platform's constraint. Read the platform's own
documentation for what is POSSIBLE, and a partner's terms only for what is
PRACTISED.

**SO THE COVERAGE QUESTION IS LARGELY ANSWERED, AND FAVOURABLY.** It stays on
the list for PPGF to confirm in writing, but the expected answer is now: the
picker can offer the register, and enrolment decides whether a charity is paid
by monthly transfer or by cheque within 90 days. That is the answer favpoll's
model needs — the small local hospice is reachable.

One residual: PPGF's API does its own vetting with "registration and status
data", which overlaps our register mirror. The mirror still earns its keep —
it carries activities, objects, classification and areas for the topic and
profile work, which a fundability API would not — but for FUNDABILITY the
authoritative source becomes theirs, not ours.

### PPGF UK'S OWN SOLICITORS ARE BATES WELLS (2026-10-15)

The founder asked whether GoFundMe's or Thrift+'s law firm could be found — a
firm that has already advised a PPGF partner on Part II would have the answer
on a shelf. Neither is public. But PPGF UK's filed annual report names its
professional advisers, and they are:

- **Solicitors: BATES WELLS**, 10 Queen Street Place, London EC4R 1BE
- Auditor: Sayer Vincent

(Named in their filed accounts, so "named in the report" rather than
"currently acting"; and being named as solicitors does not prove they advised
on the PARTNER PROGRAMME specifically.)

**1. IT PROBABLY ANSWERS HIS QUESTION OF 2026-10-13.** He asked "why would
Hannah recommend somebody with the same compliance risk as her?", and I
answered about risk appetite. The likelier explanation is a **CONFLICT**: a firm
acting for PPGF cannot comfortably advise a prospective PPGF partner on its
position relative to PPGF. The referral to Pippa Garland at Russell Cooke is
what a conflicts check produces, not a brush-off. Worth knowing, because it
means the referral was professional rather than evasive.

**2. IT MAKES PPGF'S MANDATED WORDING MORE TRUSTWORTHY.** "Gifts made
voluntarily to PayPal Giving Fund … for the benefit of a charity chosen by the
donor", and "Suggested Charity", were drafted with a leading UK charity-law firm
advising the charity. The architecture favpoll is about to adopt has had proper
attention — not ours, but proper. That is the strongest evidence yet that the
PPGF-as-counterparty reading is sound, and it is better than the inference from
two partners' silence.

**3. IT MAKES PIPPA'S JOB SMALLER AND THE BRIEF SHARPER.** The ask becomes:
*"PPGF's partner terms were drafted with Bates Wells advising PPGF. Does that
architecture make PPGF our s.59 counterparty?"* Reading a document drafted by a
specialist firm for a charity client is far less work than reasoning from first
principles, and naming it will get her attention.

**DO NOT APPROACH BATES WELLS FOR THIS.** The conflict runs both ways, and
asking Hannah to advise on PPGF now would read badly. (It also puts the £5,000
quote in a different light: an opinion that excluded drafting may have been the
most she could scope without touching the client relationship.)
