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
this could be outsourced to bring costs down). Profile work is
EXTRACTION, not authorship — read these objects, pick from a fixed
catalogue, or say none — which is Haiku-shaped. To be measured, not
assumed: run both models over the gold set that exists (the 11 perfect
topics confirmed by hand on production, plus the honest "none"
answers) and compare. If Haiku agrees, the per-profile cost drops by
roughly an order of magnitude and the cap stops mattering much.

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
   rule-floor `topic_family` computed for every registered row.
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
- the loader gains the removal check, which is the only part of
  staleness that can hurt someone, and is worth doing BEFORE any of
  this: it guards accounts that already exist;
- the SC/NIC message is independent of all of it and can ship any time.

The Haiku-vs-Sonnet comparison (decision 4) should run before step 2 is
budgeted, since it moves the per-profile cost by an order of magnitude.

Related: `perfect-topics-2026-09-26.md` (the register pilot and the
founder's lens ruling), `appeals-concept-2026-09-05.md` (the other
aggregation-not-money concept), memory `project-consent-gate` (the
earned shelf), `project-register-mirror` (why the mirror is search's
source and never a consenting charity).
