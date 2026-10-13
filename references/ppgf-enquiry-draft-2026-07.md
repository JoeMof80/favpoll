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
