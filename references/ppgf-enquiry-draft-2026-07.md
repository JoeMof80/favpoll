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
