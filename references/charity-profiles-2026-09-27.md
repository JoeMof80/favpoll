# A page ready for every charity — design note, 2026-09-27

Written the evening the register mirror went live (#941, #942: every
Commission charity in our own database, 171,886 registered rows in
production, search under half a second). The founder's question that
prompted it: "shouldn't the charity page be 1-to-1 with the register?
We need data for every charity — perfect topic, profile, images — so
every charity has a page ready to go, and onboarding is as easy as
possible, generating examples in the language the charity uses
itself." And its sharper form: "one reason for the mirror was to make
enriching generated examples easier and faster; how, if we don't have
data for all of them ready?"

## The answer in one line

The data for every registered charity IS ready — that is the mirror.
What is derived from it by the model is a cache, made on first touch
and kept, with a rule-based floor that costs nothing. The account
table stays what it is: the relationship, created when a charity
engages. Three layers, one key: the registered number.

## Why not make `charities` 1-to-1 with the register

The mirror is knowledge; `charities` is the relationship. Every mirror
row is written by the loader from the Commission's extract and the
next load overwrites it wholesale — nothing in it is ours, and it is
server-only (RLS, no policies). Every column on `charities` records
something we or the charity decided: consent, the shelf (`is_active`),
display name, logo, cause family, the CONFIRMED perfect topic,
signature events, verification history, market — and favpolls,
pledges, settlements and Gift Aid claims all point at its rows. Money
keyed on a table an external extract rewrites is the wrong shape; a
table with two owners (loader and admin) is the classic mistake. The
memory rule stands: a mirror row is never a consenting charity.

What the mirror HAS superseded is the register copies on `charities`
(`registered_email`, `registered_website`, `activities`,
`classification`, `areas`, `objects`), taken at insert because there
was no mirror. They can go over time, read from the mirror by number.
Two reasons to keep them a while: a charity registered since the
extract has no mirror row until the next load; a Scottish or Northern
Irish charity is not on the Commission's register at all.

## The three layers

| Layer | Table | Owner | Rows | Written by | Refreshed |
|---|---|---|---|---|---|
| Register | `register_charities` (+ `register_search_rows`) | the Commission | 358k (172k registered) | `scripts/register/load-register.ts` | wholesale, from the extract |
| Profile | `charity_profiles` (new) | us, unagreed | grows on touch | rules, then the model, then an admin | per row, on demand or in batches |
| Account | `charities` | us + the charity | ~30 | onboarding, admin | never by a loader |

All three join on `registered_number`. A charity can exist in one, two
or three layers: every registered charity is in the first; one someone
has met is in the second; one that has agreed is in the third.

### What the register already gives, for all of them, in milliseconds

The charity's own words (objects, activities, area of benefit — their
filings, not our paraphrase), classification codes (what / who / how),
areas of operation, latest income and expenditure, registered address
and place, phone, email, website, Gift Aid and CIO flags, registration
and removal dates, status. One indexed lookup by number, no API call.
The wizard's Generate can write in a charity's language TODAY for a
charity nobody has ever opened — the mirror row is the enrichment
input. Nothing in this note is a prerequisite for that.

### The profile: a cache with a floor

`charity_profiles`, keyed by `registered_number`, holding what the
model (or a rule) derived from the register row:

- `topic_family` — from the classification codes BY RULE, no model
  (Animals → animal topics; Environment/conservation/heritage →
  landscapes, rivers, gardens; Religious → hymns; Arts → plays, songs).
  Pre-computable for all 172k for free. The floor.
- `perfect_topic_suggested_id`, `perfect_topic_items`, `perfect_topic_reason`
  — the model's reading of objects + activities against the catalogue
  (today's `lib/perfect-topic.ts`, moved off `charities`). "None" is a
  valid, stored answer with its reason (22 of 30 on production today:
  hospices, condition and homelessness charities, honestly).
- `profile` — a short profile in the charity's own language, quoting
  the register's objects and activities and the site's signature
  events; never invented facts.
- `examples` — two or three example favpolls (Story-engine output for
  the perfect topic, with the charity as the cause), the "we've set up
  Favourite river for you" of the onboarding pitch.
- `signature_events`, `website_read_at` — moved off `charities`
  (they are a reading of the site, not an agreement).
- `image_url`, `image_source` — the site's own og:image or favicon,
  for PREVIEW only; the public page shows an image only when the
  charity supplies or approves one at onboarding. Logos belong to the
  charity.
- `status` — `rule` | `drafted` | `reviewed` (an admin looked) |
  `superseded` (the charity replaced it at onboarding); `generated_at`,
  `model`, `extract_date` (which register row it was derived from, so
  a later extract can flag it stale).

Made on first touch: an admin opens the charity, the wizard picks it,
an outreach batch prepares it. Kept, so the second touch is free and
an admin can correct it. Pre-warmed in batches for whoever is about to
be approached (the animals-and-environment pilot did exactly this for
2,115 charities in `scripts/register/`). Not generated for all 172k up
front: days of model time and thousands of pounds, roughly half of it
on parish halls with nothing to write about.

### The account, unchanged in role

Created when the charity engages — approves its page, or is approved
in the outreach queue. Carries what was AGREED: the confirmed perfect
topic (copied from the profile at confirmation, then the charity's),
consent, shelf, logo, display name, money. The profile's
`superseded` status marks the hand-over. `charities` shrinks toward a
pure account table as the register copies are dropped.

## The page

`/charities/[registered_number]` renders from the register row plus
the profile if one exists, and from the register row alone if not —
so every registered charity has a page that CAN render. Visibility
follows the consent doctrine exactly as today:

- **Private** (admin, and the charity via its onboarding link) for a
  charity with no account or a pending one. This is the "page ready to
  go": the charity sees its own words, its suggested topic, its
  examples, and corrects what it likes.
- **Public** only once consent is approved — the earned shelf,
  unchanged. No public page implies an endorsement we don't have.

Existing `/charities/[slug]` for account charities keeps working;
the number route is the general case it becomes a special case of.

## Onboarding, as it becomes

1. Outreach picks a batch (a slice of the register, or one charity).
   Profiles are prepared: rule floor, then model, then a glance from an
   admin in the queue (#869's queue, reading from `charity_profiles`).
2. The email carries the private page link: "we've set up Favourite
   river for you — here is your page, in your own words."
3. The charity opens it, edits its profile and topic if it wants,
   supplies a logo, and approves. That approval creates the account
   row, sets consent, and puts it on the shelf. The profile is marked
   superseded; the account is now the source.
4. Nothing generated is ever public without step 3.

## What moves, what stays

- Moves off `charities` to `charity_profiles`: `perfect_topic_suggested_id`,
  `perfect_topic_items` (suggested), `perfect_topic_reason`,
  `signature_events`, `website_read_at`. Confirmed `perfect_topic_id`
  and `perfect_topic_items` (agreed) stay on the account.
- Read from the mirror instead of stored: `registered_email`,
  `registered_website`, `activities`, `classification`, `areas`,
  `objects` — dropped from `charities` once the Story engine and the
  wizard read the mirror (`lib/register-mirror.ts` already gives
  contact and purpose from it).
- Stays: everything about consent, money, the shelf, the confirmed
  topic, the logo, the display name.
- Backfills become profile preparation: `backfill-perfect-topic.ts` and
  `backfill-signature-events.ts` write to `charity_profiles` for any
  registered number, not only account rows.

## Decided (founder, 2026-10-04)

All five taken one at a time. The question each answers is kept, so the
reasoning is not lost; the answer is what builds.

### 1. Rule floor — family by rule, topic only by model

*How much may be derived from the classification codes alone?*

A rule may name the topic FAMILY and never the topic. Family from codes
is mechanical and free for all 172k, so every charity has something the
moment its page exists. The perfect topic needs the model to read the
charity's own words, because the codes are coarse exactly where it
matters: a hospice and a research institute share "Health", and the
hospice's right answer is none. A rule cannot tell them apart, and the
failure is the worst kind — confidently offering a bereavement charity
a cheerful favourite.

### 2. Image — their own og:image, private surfaces only

*May a profile show a charity's image before it has agreed to anything?*

Yes, on the PRIVATE page and the admin preview, stored with
`image_source` so a scraped image is never mistaken for a given one.
The private page is shown to the charity itself ("here is your page, in
your own words"), and they are the one audience who cannot object to
their own mark; replacing it is step 3 of onboarding.

Two guards, which the design above did not spell out:

- the scraped image NEVER survives onboarding. When the charity
  supplies a logo the scraped one is dropped, not kept as a fallback,
  or `superseded` leaks and we serve a scraped image publicly by
  accident.
- og:image or favicon only. No crawling further for a better picture:
  an og:image is published FOR being shown elsewhere; a site's photo
  library is not.

The public page was never in question — it is private until consent is
approved, and by then the logo is the charity's own.

### 3. Staleness — flag on the fields that matter, regenerate on touch

*What happens when a new extract lands?*

Flag and regenerate lazily, but compare the fields the profile was
DERIVED from — `objects`, `activities`, `classification`, `name` — not
the row's `extract_date`. Almost every row changes every extract
(`latest_income`, `latest_expenditure`, `financial_year_end` update
annually for all 172k), so dating alone would flag the whole table and
charge for regenerations that change nothing.

Bulk regeneration after a load is refused: it turns a quarterly data
load into an unbudgeted model bill, spent mostly on charities nobody
will contact this year.

REMOVAL IS NOT STALENESS. The extract also deregisters charities
(`status`, `removed_on`). A profile whose charity is gone is wrong, not
old, and two things follow at load time rather than on next touch: it
drops out of outreach eligibility, so no wave can email a removed
charity; and if that number has an ACCOUNT row an admin sees it
loudly, because favpolls, pledges, settlements and Gift Aid claims
point at that account and money moving to a deregistered charity is the
one failure here with real consequences.

### 4. Cost — the batch filter is the lever, not the model price

*When do we spend model money on profiles?*

Per outreach wave, with a cap covering admin on-demand touches as well
(clicking through the queue is the motion that spends invisibly). But
the "half of it on parish halls with nothing to write about" is
avoidable before a single call, with free SQL on the mirror. A wave's
candidates must be:

- `status` Registered
- have a website (no site = no og:image, no signature events, nothing
  to read beyond the filing: a thin profile and a weak pitch)
- a classification the rule floor can map to a family we serve
- above an income floor (a £3,673 canal society is one person and a
  bank account; an outreach email will not land)

Each is a `where` clause on a table we already hold, and together they
make the per-profile price much less interesting than it looks.

THE MODEL ITSELF IS A THIRD LEVER (founder, 2026-10-04, asking whether
this could be outsourced to bring costs down). Profile work looked like
EXTRACTION rather than authorship — read these objects, pick from a
fixed catalogue, or say none — which is Haiku-shaped. It was measured
rather than assumed, and the answer is NO for this call.

MEASURED 2026-10-04. Both models run over the gold set on production
(the 12 confirmed perfect topics and the 21 explicit "none"s with
recorded reasons; 9 never-processed charities excluded), reading the
real register rows and the live 140-topic catalogue. `perfect-topic.ts`
already takes its model from `LLM_MODEL_ID`, so no code changed.

| | agrees with the label | must say none (21) | has a topic (12) |
|---|---|---|---|
| claude-sonnet-5 | 27/33 | **21/21** | 6/12 |
| claude-haiku-4-5 | 27/33 | 19/21 | **8/12** |

The headline is a tie and the headline is misleading. The models are
OPPOSITES: Haiku finds more real topics, Sonnet refuses more reliably,
and the two Haiku got wrong are the ones that matter —

- NSPCC → "Children's book"
- Save the Children → "Children's book"

which is exactly the failure the none rule exists to prevent, and the
one that would go out in an outreach email. Sonnet never once offered a
topic to a charity that should have none; its six misses are all
over-caution (Trussell Trust, WWF, Barnardos → NONE), which costs an
admin a click rather than a relationship. The asymmetry decides it: a
missed topic is recoverable, a cheerful favourite suggested to a
child-protection charity is not.

SO: the none/not-none judgement stays on the better model — one short
call per charity. The saving is still available on the SUMMARISING work
either side of it, which is most of the tokens: the profile paragraph,
the signature-events extraction, the examples. Model per task, not per
pipeline.

TWO THINGS THE RUN TURNED UP, for the founder's eye:

- COMIC RELIEF: both models independently said "Comedian" against the
  confirmed "Film genre". When two models disagree with a label the
  same way, the label is worth a second look.
- TRUSSELL TRUST: both said none; the founder ruled "Comfort food" by
  hand (2026-09-27). A known divergence — the model will keep proposing
  none there, so the confirmation has to hold it.

### 5. Off-register — hand-written, and say so out loud

*Scotland (OSCR) and Northern Ireland (CCNI) are not on this register.*

No loaders for them now. Every account charity is England and Wales,
each other regulator is a separate register with its own schema and
loader, and nobody is waiting. It already fails in the safe direction:
a Scottish number falls through the mirror to the Commission API, which
does not have it either, so verification fails and no account is
created. For a system that routes money to the verified party, failing
closed on an unverifiable charity is correct.

- Keep the columns that make a HAND-WRITTEN account possible: admin
  creates the account, writes the profile, status `reviewed`, no
  `extract_date` because no extract produced it, and verification is a
  recorded human act rather than an API call.
- MAKE THE DEAD END LEGIBLE. An `SC` or `NIC` number currently reads as
  "not found", which looks like a typo and sends the user round the
  loop. Recognising the prefix and saying "Scottish and Northern Irish
  charities aren't supported yet" is a few lines, turns a mystery into
  a known limit, and gives a demand signal: if that message starts
  firing, you will know before anyone complains.
- The trigger to revisit is the first real request, not a date. OSCR
  publishes a downloadable register in much the same shape, so it is a
  loader and a column mapping — roughly a day. The three-layer model
  does not change; layer one gains a second source.

## What happens next

1. Migration: `charity_profiles` keyed by registered number, with the
   rule-floor `topic_family` computed for every registered row. DONE
   2026-10-04 (migration 20261004160000): 171,909 profiles on dev, the
   floor for all of them up front (the founder's call — the model's work
   is still made on touch, as below; only the free part is pre-computed).
   Two things the data changed:
   - THE FLOOR IS A CATALOGUE CATEGORY, as the examples in this note
     always said (Animals → animal topics, Environment → landscapes and
     rivers, Religious → hymns), and NEVER a cause family. Mapping the
     same codes to cause families scores 26 of 59 against the founder's
     confirmed set and fails worst where it matters: every hospice comes
     out `health_condition`, every mental-health charity the same, Age UK
     comes out `homelessness`. The WHO axis cannot save it —
     "Children/young People" is ticked by 95,769 charities, five of our
     seven hospices among them.
   - A MISSION GUARD was needed. A subject code sitting incidentally on a
     charity whose work is care gave the RNLI "Books & Arts", FareShare
     "Nature" and RNIB "Sport". So any of health, disability, poverty,
     overseas aid or housing silences the subject claim: the rule then
     speaks for 11 of the 59 and is right 11 times, covering 36% of the
     register instead of 51%. Decision 1's own reasoning picks that
     trade.
   Also found: the register has an EIGHT-digit number (19262026, a CIO
   registered in March 2026), which broke the first backfill — nothing in
   the code should assume six or seven.
2. Move the two backfills and the outreach queue onto it.
3. The number route for the page, private by default, register-only
   rendering when the profile is empty.
4. Point the wizard's Generate and the Story engine at the mirror for
   purpose and contact (already the case for verification and search).
5. Drop the register copies from `charities` once nothing reads them.

What the decisions above add to that order, none of it large:

- step 1 also computes the rule floor as FAMILY only, and the profile
  carries `image_source` and the four derived-field fingerprints
  staleness compares against;
- step 2 gains the wave's eligibility filter (registered, has a
  website, mappable classification, income floor) and the spend cap;
- the loader gained the removal check — DONE 2026-10-04, the first thing
  built from these decisions, because it is the only part of staleness
  that can hurt someone and it guards accounts that already exist:
  `register_account_removals()` (migration 20261004140000) reads every
  account charity's standing against the mirror with the money pointing
  at it, `scripts/register/check-removals.ts` runs at the end of every
  load and alone, admin `/charities` leads with the list, and
  `setCharityConsent` refuses to approve a number the register has
  removed;
- the SC/NIC message is independent of all of it and can ship any time.

The Haiku-vs-Sonnet comparison (decision 4) RAN on 2026-10-04 and
settled the wrong way: the cheap model is not safe for the none
judgement. Step 2's budget assumes the better model for that one call
and the cheap one for the summarising either side of it.

Related: `perfect-topics-2026-09-26.md` (the register pilot and the
founder's lens ruling), `appeals-concept-2026-09-05.md` (the other
aggregation-not-money concept), memory `project-consent-gate` (the
earned shelf), `project-register-mirror` (why the mirror is search's
source and never a consenting charity).
