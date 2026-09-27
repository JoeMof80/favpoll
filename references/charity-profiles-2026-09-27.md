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

## Open questions for the founder

- **Rule floor, how far?** A classification→topic-family map is
  cheap and honest; a classification→perfect-topic guess is not (a
  hospice classified "Health" must still get none). Proposal: family
  only by rule; topic only by model.
- **Whose image?** Preview from the site's own og:image is a fair
  reading of a public page; the public favpoll page shows only what
  the charity supplied. Confirm.
- **Off-register charities** (OSCR, NI): an account row with no
  register row, profile written by hand. Rare; keep the columns that
  make it possible.
- **Staleness**: a new extract changes objects or removes a charity.
  The profile stores its `extract_date`; the loader can flag profiles
  older than the row. Regenerate on demand, not in bulk.
- **Cost line**: the model per profile is pence; the batch that
  prepares a 2,000-charity slice is tens of pounds. Fine per outreach
  wave; not fine for all 172k at once.

## What happens next

1. Migration: `charity_profiles` keyed by registered number, with the
   rule-floor `topic_family` computed for every registered row.
2. Move the two backfills and the outreach queue onto it.
3. The number route for the page, private by default, register-only
   rendering when the profile is empty.
4. Point the wizard's Generate and the Story engine at the mirror for
   purpose and contact (already the case for verification and search).
5. Drop the register copies from `charities` once nothing reads them.

Related: `perfect-topics-2026-09-26.md` (the register pilot and the
founder's lens ruling), `appeals-concept-2026-09-05.md` (the other
aggregation-not-money concept), memory `project-consent-gate` (the
earned shelf), `project-register-mirror` (why the mirror is search's
source and never a consenting charity).
