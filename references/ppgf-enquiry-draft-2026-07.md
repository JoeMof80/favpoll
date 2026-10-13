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
