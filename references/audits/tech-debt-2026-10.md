# Technical debt register — 2026-10-20

A measurement-first survey of the whole monorepo, run after the pre-share
audit. **Nothing here has been changed.** Every item carries its evidence,
a size, a risk, and a recommended verdict — the verdict is the founder's
to set. Supersedes the open items of `architecture-survey-2026-07-20.md`
(the Tier 1 money items there were fixed in #301–#303).

Verdicts: **FIX NOW** · **FIX WHEN TOUCHED** · *LEAVE** (with the reason
recorded, so it is a decision and not an oversight).

Sizes: S < 1h · M < 1 day · L > 1 day.
"First issue" marks work a developer can do while learning the codebase.

## The shape of the thing

|                                              |                                           |
| -------------------------------------------- | ----------------------------------------- |
| Source files (apps/web, excl. tests/stories) | 346                                       |
| Lines                                        | 55,187                                    |
| Comment lines                                | 8,854 (16%)                               |
| Dated founder rulings in comments            | 549                                       |
| TODO / FIXME / HACK                          | 0                                         |
| Routes                                       | 30                                        |
| Component files                              | 211 (46 with a story = 22%)               |
| Tests                                        | 1,458 web + 177 admin, 0 failing          |
| `as unknown as`                              | 29 (22 in money/auth paths)               |
| `: any`                                      | 10 · `@ts-ignore` 0 · `eslint-disable` 68 |

The headline is the last two rows of the first column. There are no TODOs
because the history lives in the comments instead: 549 dated rulings
inside source files, which is where decisions go when a project has no
decision log. That is the single biggest obstacle to a second person
(or a second codebase) learning this one.

---

## Tier 1 — correctness, security, trust

### 1.1 Three database views bypass row-level security · S · low risk · FIX NOW

The July survey recorded "no RLS anywhere". **That is now out of date and
was corrected by measurement:** RLS is enabled on 34 of 38 relations on
production, every policy is SELECT-only, and writes with the public key
are refused (`insert into charities` → HTTP 401, "new row violates
row-level security policy"). Pledges, users, gift-aid declarations and
charity profiles all return zero rows to the public key.

The exception is three **views**, which run as their owner and so read
straight past RLS on the tables beneath them:

| View                         | Reads from                                              | Public key can read it              |
| ---------------------------- | ------------------------------------------------------- | ----------------------------------- |
| `register_profile_floor`     | `register_charities` (locked)                           | yes — verified, 1 row returned      |
| `charity_profiles_stale`     | `charity_profiles` + `register_charities` (both locked) | yes (times out on size, not denied) |
| `charity_profiles_unkeyable` | `charities`                                             | yes                                 |

What leaks is public Charity Commission data plus `consent_status` and
`is_active` for every charity — not money, not personal data. So: real,
narrow, cheap. Two of the three (`register_profile_floor`,
`charity_profiles_stale`) are referenced only by the migration that
created them and by nothing in the application.

Fix: `alter view … set (security_invoker = on)` on all three, or
`revoke all on … from anon, authenticated`. Drop the two unused ones.

### 1.2 The route that decides what a card is charged has no test · M · low risk · FIX NOW

`app/api/stripe/payment-intent/route.ts` computes `totalPence` from the
pledge, tip and top-up parts and creates the PaymentIntent. It is the only
money path in the app with no test file of its own; every other one has
tests (`webhooks/stripe`, `webhooks/clerk`, both crons, all three action
files, `stripe-verify`, `card-fee`, `disbursement/split`,
`charity-consent`). The cases worth pinning: amount is server-computed and
ignores a client-supplied total, each part is capped, `totalPence <= 0` is
refused, metadata binds the favpoll and poll, and the consent gate refuses
under `consent-first`.

`lib/poll-standings.ts` is the other untested module that produces numbers
users see.

### 1.3 No server action validates its input · M · medium risk · DONE (#1104, PR #1127)

Two things this entry got wrong, both found at the point of doing the work.

**"Zero zod schemas" was wrong.** zod 4.4.3 was already a dependency of
`apps/web` and `components/favpoll-form/schema.ts` was already a real
schema with custom messages. Nothing had to be introduced; the pattern
was already in the codebase, just not on the server.

**"Every action reads `formData.get(...) as string`" was wrong for the
pledge path, which is the part that touches money.** Those actions take
typed object arguments, not FormData — `createPledge(input:
CreatePledgeInput)` — so the prescribed `parse(schema, formData)` helper
was the wrong shape for them. Only `withdrawPledge` takes FormData, and
it was the one action that should NOT use the helper (below).

What shipped: `lib/action-input.ts` parses an action's ARGUMENT against a
schema and throws the failing field's sentence; `app/favpolls/[id]/
pledge-input.ts` holds one schema per money action, with the TypeScript
types derived from the schemas so the two cannot drift.

What the schemas deliberately do not do is tighten anything an honest
person could get wrong. **By the time a pledge action runs, the card has
already been charged** — `verifyPledgePayment` is the first thing
`createPledge` does, against a PaymentIntent that has already
succeeded — so a refusal there is somebody debited for nothing. The
schemas guard the shape, which only a crafted request or a bug gets
wrong. Left loose on purpose: no floor on an amount (it has already been
charged and matched against the PaymentIntent), `.min(1)` on an id rather
than `.uuid()`, an empty `paymentIntentId` still falling through to
`verifyPledgePayment`'s better sentence, and unknown keys stripped rather
than refused.

Two things worth carrying forward:

**zod answers a wrong TYPE before it runs any check, with its own
sentence.** `z.number().finite("…")` therefore sent a guest "Invalid
input: expected number, received string" and the custom message never
fired — zod rejects NaN and Infinity at the base type. Every constructor
now carries its sentence as the first argument.

**`withdrawPledge` does not use the helper, and must not.** Its failures
are pages, not sentences: a form action that redirects has no caller to
render a result, and `asResult`'s try/catch would swallow the redirect
Next throws. Its missing-token case used to return silently, leaving the
guest on a page whose button did nothing; it now gets the same not-found
page the withdrawal page gives for the same condition. Its token-only
authorisation is documented in place, as this entry asked.

**The renamed-spec hole is closed (#1129, 2026-10-20).**
`scripts/check-e2e-projects.mjs` fails on a spec no project matches AND on
a project no spec matches — the second being the #897 shape, where a
pattern pointing at a file that no longer exists runs empty and passes. It
asks Playwright itself (`playwright test --list --reporter=json`, which
starts no browser and no web server) rather than reimplementing its glob
matching, and attributes files by each spec's own `tests[].projectName`.

It lives in **Format check**, not the advisory E2E job: the failure is a
suite that passes having run nothing, so the job that would have shown it
green is the wrong place to catch it.

Verified by reproducing #897 — renaming the spec and leaving the project
on the old name. Playwright's own verdict in that state: **exit 0, 16
specs instead of 17, the guest pledge flow silently absent.** The check
reports both halves and exits 1.

**Found while in there, raised separately:** the action redirects a stale
token to `/pledges/withdraw/invalid`, a route that **does not exist** —
so a guest clicking an already-used withdrawal link gets a 404 instead of
an explanation. Left alone because what that page should say is a copy
decision.

**The remaining files are seven, not five (#1109, 2026-10-20).** Counting
the files whose first line is the directive: `app/appeals/actions.ts`,
`app/favpolls/actions.ts`, `app/favpolls/[id]/edit/actions.ts`,
`app/favpolls/[id]/manage/actions.ts`, `app/favpolls/new/actions.ts`,
`app/favpolls/new/wizard-data.ts` and
`lib/actions/favpoll-poll-favourites.ts`. The original "six action files"
counted only the ones named `actions.ts`, which missed two.

**`lib/actions/generate-draft.ts` is converted (#1109, first of eight —
which is what leaves the seven listed above).** It was taken first because its unvalidated fields are not only
a shape risk. `topicTitle`, `itemLabels` and `displayName` are
interpolated verbatim into the Story prompt — `displayName` inside a
quoted instruction — so the boundary there is the boundary of a model
call. Three things came out of doing it:

**Its schemas are deliberately TIGHTER than the pledge path's**, for
reasons that invert one by one. Nothing has been charged, so a refusal
costs a toast rather than a debit. Every id is machine-supplied by a
picker, so a format check cannot refuse an honest person. And the free
text reaches a prompt, so bounding its length bounds what a generation
can cost.

**`buildCacheKey` joins the ids into a ":"-separated string**, so an id
carrying its own ":" shifts every field after it and addresses a
different shape's cached draft — readable on the way in, writable on the
way out. That is what the id format check is actually for, and there is a
test named after it. The check is `z.guid`, not `z.uuid`: a `uuid` column
stores any 128-bit value, while `z.uuid` enforces the RFC's version and
variant nibbles and would refuse an id the database handed us.

**The schema is also where a developer's sentence became a person's.**
`throw new Error("topicTitle required for custom topics")` was true and
useless; the organiser who caused it saw a generic toast. `parseInput` now
throws an `InvalidInputError`, which `safeGenerateDraft` is allowed to
return as a message and an internal error is not — Next redacts a thrown
message in production but returns a returned one verbatim, so without the
distinction `err.message` would have handed the browser whatever Postgres
last said.

Two things found while in there, both raised separately: the `model`
column recorded the `modelId` FUNCTION rather than its result, so no
draft has ever recorded which model wrote it (fixed in the same pull
request, one character); and the action's rate limiter is a
module-level in-memory `Map`, which on Vercel is per instance, while
`lib/rate-limit.ts` already provides a shared one that five other call
sites use. **DONE (#1132, 2026-10-20):** the generator is the sixth
caller now, and the `Map` is gone.

It counts ATTEMPTS where the `Map` counted successes, which is a
deliberate change and not an oversight. `check_rate_limit` increments on
every call and cannot un-count; and the old kindness was true of the
counter rather than of the bill, because a model call that fails has
usually already spent its tokens — a timeout on a 16,000-token request
is billed like any other. A CACHE HIT STILL COSTS NOTHING, because the
limiter is consulted only where a model call is about to happen, which
is the half worth keeping and the common first click. Two keys,
organiser and address, the shape guest items already use: signup is
open, so an account is cheap and a per-account limit alone bounds
patience rather than volume. Inherited rather than chosen:
`isRateLimited` fails OPEN, which is clearly right for a pledge and
trades money for availability here — changing it would change it for all
six callers.

**`app/favpolls/new/actions.ts` is converted (#1109, second).** The
wizard's publish path: four exported actions, one of which writes seven
tables. Four things came out of it.

**A filename chose part of a storage key.** `uploadPersonPhoto` built the
object key from `file.name.split(".").pop()`, so the uploader supplied the
extension: a name of `../../../etc/passwd` produced the key
`<user>/<ts>./etc/passwd`, and a name with no dot at all made the whole
name the extension. The key is built from the TYPE now, through a map the
schema has already accepted, and the filename is not read.

**The bucket is public and the content type was the client's word for
it.** `formData.get("photo") as File` was the entire check, so a string, a
missing field, a 200MB file or a `text/html` upload all got through — the
last of those being a page served from the project's own storage domain.
The allowlist is deliberately generous (jpeg, png, webp, gif, avif, heic,
heif) because every honest caller re-encodes through a canvas and sends
jpeg; what it refuses is a file that is not an image at all.

**`insertSubsetMembers` was an endpoint that could never work.** It was
exported from the `"use server"` file, so Next published it, but its first
parameter is a Supabase client and a client cannot cross the wire.
Validating it would have been guarding a door into a wall, so it moved to
`lib/subset-members.ts` and the three server-side callers import it from
there. The right treatment for an action that is not one is to stop
exporting it, the same judgement that kept `withdrawPledge` off the
helper for the opposite reason.

**`closesAt` was a RangeError waiting at the end of the wizard.** A string
`Date` could not read reached `new Date(...).toISOString()` and threw,
which the organiser saw as a generic failure after filling in every step.
It is an ISO datetime with a sentence of its own now. The same shape of
win: an unknown `grouping` used to make a favpoll quietly plural, because
`is_plural` is derived as `grouping !== "individual"`.

**`potAmount` is money, and the founder locked it (2026-10-20).** It
writes `favpoll_pots.total_deposited` directly, and it is the only route
to that column that does not go through a payment — the legitimate one is
`creditFund` -> `rpc("pot_top_up")`, which runs after
`verifyPledgePayment` has matched a PaymentIntent that already succeeded.
So a crafted request credited a shared pot with money nobody paid, and
because `deleteFavpoll` refuses a favpoll whose pot holds anything, left
it undeletable as well.

It now accepts `null` or `0` and nothing else: both callers send `null`,
zero is the same thing said differently and the column's default, and no
other value is something that form can mean. It was raised rather than
narrowed in the first pass because a ledger field is not a schema's
decision to take alone.

**The four small files are converted (#1109, third).**
`app/favpolls/actions.ts`, `lib/actions/favpoll-poll-favourites.ts`,
`app/appeals/actions.ts` and `app/favpolls/new/wizard-data.ts` went
together: 305 lines between them, and four near-identical pull requests
would have been harder to read than one. Three things worth keeping.

**There are now three idioms, and which one an action uses is a property
of its caller, not a preference.** `parseInput` THROWS, for an action
whose caller catches or whose wrapper converts (`generateDraft`,
`createFavpoll`, `deleteFavpoll` — the last because it ends in
`redirect()`, which Next throws, leaving no caller to render to).
`tryParseInput` RETURNS, for an action whose contract already is a result:
`app/appeals/actions.ts` answers `{ error }` and its form renders the
string, so a thrown message would break the caller rather than inform it.
And a bare `safeParse` returning the action's own "nothing" suits a
silent surface, which is what the ghost prefetch and the enacted lookup
are.

**`createAppeal` had the right checks in the wrong place.** It validated
the name, the slug's shape and the charity by hand and returned good
sentences for all three. Those sentences are unchanged; they are the
schema's now, which is what let `updateAppeal` be fixed in the same
breath — its `input.name.trim()` was a TypeError waiting for an argument
without a name, a 500 where the form wanted a sentence.

**`wizard-data.ts` was never an action, and had nothing to validate.**
`getWizardData()` takes no arguments, so the schema treatment this file
was listed for does not apply to it. What the listing did surface is that
the `"use server"` directive published it as an endpoint: it is imported
only by two server components, both of which call `auth()` for
themselves, so the directive was the one UNAUTHENTICATED way to ask for
the entire active catalogue — every charity with its register website and
email overlaid, every topic, every subset — in a single request. The
directive is gone. That is the second time the honest answer was "this is
not an action, stop publishing it as one", after `insertSubsetMembers`.

Housekeeping: the `z.guid` id schema and its reasoning now live once, as
`actionId` in `lib/action-input.ts`, rather than being copy-pasted into a
fourth schema file.

**The last two are converted (#1109, fourth — the entry is DONE).**
`app/favpolls/[id]/edit/actions.ts` and
`app/favpolls/[id]/manage/actions.ts`. Three things.

**An unknown field wrote nothing and reported success.** `updateStoryField`
took a `field` typed as `StoryField` and checked nowhere, and nothing
downstream refused an unrecognised one: `LIMITS[field]` is `undefined`, so
the length guard passes; the two required-field guards name specific
fields; and the switch that writes has **no default**. So a field the
action did not know fell through all of it, wrote nothing, threw nothing,
and `asResult` answered `{ ok: true }`. Of the three answers an action can
give, a silent success is the worst, and it is exactly what this entry's
"no action silently accepts a field it does not understand" was about.

**The per-field rules stayed where they were.** `updateStoryFieldInner`
already states the length limits, "A name is required", "The goal must be
a positive amount." — and all of them read `isCause` out of the database
to decide which column a field lands in. A schema cannot know that, so
the schemas here add only what the shape can carry: the field name, the
id, and that a value is one of the three kinds a column takes.

**`updateFavpoll` still throws, and that is #1105's half.** The wizard's
catch renders `err.message`, which Next redacts in production — so a
schema sentence reaches the organiser in development and does not in
production, exactly as every other throw in that action already does
not. Converting it is #1105's remaining work on this file; its sibling
`updateClosesAt` is the half that was already converted, and it parses
inside `asResult` so its sentence does travel. The two entries meet here,
and the sequencing means 1.3 cannot fully deliver "an actionable message"
for that one action until 1.4 reaches it.

**The field schemas now live once.** Creation and editing write the same
columns from two differently shaped arguments (`CreateFavpollInput` and
`CanvasSubmitData`), so the definitions moved to `lib/favpoll-input.ts`
and each path composes the shape it actually receives. Two schemas
describing the same column would have drifted, which is the thing this
entry exists to stop.

Found while in there: the edit tests had been asserting against
`closesAt: "2028-01-01T00:00"` — a `datetime-local` string that no caller
produces, since both the wizard and the manage row send
`.toISOString()`. The fixtures were loose rather than the schema being
tight; there is no `datetime-local` input anywhere in the app.

**All eight files are done.** `lib/action-input.ts` ended up with four
entry points, and which one an action uses is a property of its caller:
`parseInput` throws, `tryParseInput` returns, `parseFormData` does either
for a FormData argument, and a bare `safeParse` suits a silent surface.

### 1.4 Actions still throw where the project decided they should return · M · low risk · DONE for the pledge path (#1105, PR #1127)

This entry contradicted itself and was wrong on the count. "The manage
surface was converted in #1049" and "none of the six action files use it"
cannot both hold, because `manage/actions.ts` **is** one of the six: it
uses `asResult` five times, and `edit/actions.ts` twice. The real gap was
that the money path did not.

The pledge path now returns results. The five money actions keep their
bodies as `…Inner` functions and are wrapped together at the foot of
`app/favpolls/[id]/actions.ts`, the shape `manage/actions.ts` already
used; the three callers (`use-pledge`, `use-favpoll-list-card-pledge`,
`seed-fund-modal`) `unwrap`, which throws a real Error on the client
where the dialogs already show one inline.

`guestPledgeExists` and `guestPreflightState` stay as they are: they are
pre-payment reads whose return value is structural, not a message, and a
result would make every caller unwrap a boolean for nothing.

**Verified against a production build, not the dev server**, as this
entry's acceptance criteria asked — see the PR for the probe. Both
`topUpFund` (converted) and `addOrganizerItem` (not) refuse an
unauthenticated caller with the same sentence from the same file, one
returned and one thrown, so the build's treatment of each is a controlled
comparison.

Still to do: the wizard and the remaining action files, one per PR.

---

## Tier 2 — structure (what makes this codebase hard to learn)

### 2.1 549 dated rulings live in source comments, not in a decision log · L · low risk · FIX NOW (process)

Examples sit in nearly every file: "(founder, 2026-09-16, after a
tap-advance audition)", "THREE TO A ROW SINCE 2026-08-27, not two". They
are genuinely valuable — they are the reasons — but they are invisible to
anyone reading the repo top-down, they bloat the files they live in, and
they cannot be searched by decision. Moving the load-bearing ones into
ADRs under `docs/adr/` and leaving a one-line pointer in the code is the
single highest-value change for a second reader, and it is the
prerequisite for the Matt Pocock skills (`to-prd`, `to-issues`, `triage`
all assume a tracker and a doc layout).

### 2.2 Seven files over 700 lines mix layout, data, animation and copy · L each · medium risk · FIX WHEN TOUCHED

| File                                                | Lines | What it holds                                 |
| --------------------------------------------------- | ----- | --------------------------------------------- |
| `lib/pairing-table.ts`                              | 1,374 | data table — fine as data, but it is code     |
| `components/landing/hero.tsx`                       | 1,073 | layout + beat state machine + copy + carousel |
| `app/favpolls/[id]/manage/manage-client.tsx`        | 1,014 | seven sections in one client component        |
| `lib/story-engine.ts`                               | 956   | generation rules                              |
| `app/favpolls/[id]/actions.ts`                      | 878   | 13 exported actions, three pledge paths       |
| `components/new-favpoll-wizard/use-wizard-state.ts` | 832   | whole wizard state                            |
| `components/hero-demo-panel/demo-card.tsx`          | 819   | demo rendering + the still beat               |

The seams are visible in each: `hero.tsx` splits into layout / `useStillBeat`
/ copy; `manage-client.tsx` splits by section; `actions.ts` splits into
pledge-by-card, pledge-from-pot and guest-pledge over one shared pipeline
(the three duplicate their verification and insert logic today).

### 2.3 Two libraries are copy-pasted between web and admin, and the copies are formatted differently · M · low risk · DONE (#1108)

`lib/register-mirror.ts` (298 / 266 lines) and `lib/charity-commission.ts`
(636 / 635) exist in both apps. Diffed raw they differ on 308 and 574
lines; diffed ignoring semicolons and trailing commas they differ on 66
and 43 — **the two apps use different Prettier settings**, so a real
behavioural drift would be invisible in the formatting noise. This has
already bitten once, and the drift was real: `mirrorContactAndPurpose`
existed only in apps/web, and three comments had diverged in the other
file. Both now live in `packages/charity-register`, with a per-app
binding that supplies each app's own admin client.

Fix: one Prettier config at the root, then move both modules into
`packages/` and import them. `lib/utils.ts` is identical in both and can
go the same way.

### 2.4 One dead UI subsystem and eleven dead components · S · low risk · FIX NOW · first issue

Verified by grep, zero production importers: `ui/field` (249), `ui/form`
(152), `ui/ticker` (120), `ui/tooltip-icon-button` (43), `ui/occasion-tag`
(19), `landing/honour-charity-love-venn` (219),
`landing/guest-book-vignette` (91), `landing/goal-vignette` (60),
`favpoll-card/section-label` (29), `pledge-dialog/step-indicator` (23),
`keepsake/print-button` (20). About 1,025 lines.

Separately, the **`components/pledge-card/` subsystem is dead except
`pledge-breakdown.tsx`**: `index`, `preview-pledge-card`,
`live-pledge-card`, `pledge-card-wrapper`, `amount-input` and
`amount-presets` have no importer outside their own directory and their
stories. The pledge dialog's own step components replaced them. Six more
files.

Note the trap: five of these have Storybook stories, so "it has a story"
is not evidence of use.

### 2.5 20 of 177 message keys are dead · S · low risk · FIX NOW · first issue

**Corrected 2026-10-20 while fixing it: 20, not the 33 first counted.** The
first pass checked only `t("literal")` calls and template prefixes, so it
missed keys referenced as bare strings elsewhere and over-reported by 13.

The 20 are the whole `landing.how.*` set (10 keys, left behind when How It
Works was reframed as the organiser's process), `celebrations.moment.*` and
`celebrations.presence.*` (7), `home.router.explore`, `home.shines.title`,
and `landing.invariant` — which a copy sweep edited for a line no component
renders, and which only its own test kept alive. A key referenced solely by
a test or a story counts as dead: the test keeps it compiling, not visible.

### 2.6 Type escapes concentrate in the money and auth paths · M · medium risk · DONE for the relation casts (#1106)

Three things this entry got wrong, and one it got righter than it knew.

**"Working around Supabase's generated join types" — there are no
generated types.** Every client in the repo is built without one:
`createClient<Database>` appears nowhere, in either app or the scripts.
The casts are therefore not working around an awkward generated shape;
they are hand-written assertions about data that has no type at all.

**The file list was wrong.** `lib/stripe-verify.ts` had zero,
`lib/supabase/` had zero, and `lib/disbursement` is not a path. The casts
were 11 in `app/favpolls` and 7 in `app/api`.

**"The pattern is the same each time" — there were two.** The entry's own
example is the first, and it was the one worth fixing:

1. **A to-one embedded relation asserted to be an object** —
   `ec.charities as unknown as Charity | null`. Eight of these.
2. **A whole row asserted to a hand-written type** —
   `(favpolls ?? []) as unknown as RawFavpoll[]`. Ten of these, and a
   relation helper does nothing for them: they need the generated types
   the first finding says do not exist. Left, counted, with that reason.
   Raised as its own entry (#1138).

**What it got righter than it knew: the first kind were latent bugs, not
untidy types.** `lib/poll-title.ts` has carried this sentence since the
subset work — *"PostgREST hands back an object or a one-element array
depending on the join, so both are accepted"* — and
`app/appeals/[slug]/page.tsx` dates the lesson to 2026-09-06. Six sites
handled both shapes. Eight asserted the array could not happen. When it
does, the cast reads a field off the array itself, gets `undefined`, and
says nothing.

The worst of the eight was in the close-favpolls cron:

```
const favpollId = (row.favpoll_polls as unknown as { favpoll_id: string }).favpoll_id
raisedByFavpoll[favpollId] = (raisedByFavpoll[favpollId] ?? 0) + (row.total_amount ?? 0)
```

An array-shaped relation made `favpollId` undefined, so the pledge went
into `raisedByFavpoll["undefined"]` — a key nothing ever reads, since the
only read is by a real favpoll id. The pledge vanished from
`total_raised`, **and that total decides the disbursement split.**
Measured on two rows, one of each shape: £70 and £30 in, £30 out. The
skip that replaces it is behaviour-preserving, because that bucket was
already never read; what changes is that the array shape is now
attributed instead of lost.

`lib/supabase/relation.ts` holds `one` and `many`, generalised from the
narrow `one` that `poll-title.ts` had already named. Its parameter is
`unknown`, which is the truth about what it is handed.

**The environment variables: NOT CHANGED, and the attempt is the record
(#1106, 2026-10-20).** `lib/env.ts` was written — a `requiredEnv(name)`
that throws `Missing required environment variable: X`, naming the
variable and never its value — and applied to eleven of the twelve. CI
refused it, and the refusal is the useful part of this entry.

Two failures, neither of which the entry anticipated:

1. **Two route test files failed at IMPORT.** `app/api/webhooks/stripe`
   and `app/api/stripe/payment-intent` construct Stripe at module scope,
   so the throw fired when vitest loaded the module. Those tests mock
   Stripe and never need a key; `process.env.STRIPE_SECRET_KEY!` had been
   handing the constructor `undefined` and the constructor did not mind.
2. **`lib/stripe-verify.ts` was already lazy, and still broke.** Its
   `new Stripe(...)` sits inside a function, so the timing was right —
   but the throw is caught by that module's own error handling and comes
   back out as `Payment not found`. Six verification tests changed their
   message.

So the entry's framing — that these assertions "turn a missing variable
into a runtime crash rather than a startup error" — is right about the
problem and wrong about the fix being small. Making the message better
also made the failure FIRE where it previously did not: in a test run, in
CI, and on any fresh clone without the variables. A louder failure is not
automatically a better one when the thing that was quiet was also
harmless.

What this actually needs is the question the first attempt set aside: a
distinction between "needed at module load" and "needed at the moment of
use", and somewhere for the check to live that is neither of those — a
boot-time or build-time assertion that runs once, in production, where
the variables genuinely must exist. That is a design, not a helper, and
it is not attempted here. The twelve assertions stand.

---

## Tier 3 — tooling and process

### 3.1 CI never builds either app · S · low risk · FIX NOW

Jobs today: Test, Typecheck, Lint, Format check, and E2E (advisory). There
is **no `pnpm build` anywhere**. The repo's own `CLAUDE.md` records a trap
that only a build catches — a `"use server"` module may only export async
functions, and "typecheck and vitest miss it". Add a build job for both
apps.

Also absent: a coverage report, a bundle-size check, a dependency audit,
and a migration check. The component-tree check landed today (#1092).

### 3.2 Storybook is current but covers a fifth of the library · M–L · low risk · FIX WHEN TOUCHED

46 of 211 component files have a story; all 178 stories pass as browser
tests in CI, so what exists is accurate. The gaps are the big surfaces:

| Area                          | Files | Stories |
| ----------------------------- | ----- | ------- |
| `components/landing`          | 32    | 1       |
| `components/ui`               | 33    | 12      |
| `components/manage`           | 6     | 0       |
| `components/keepsake`         | 6     | 0       |
| `components/print-pack`       | 6     | 0       |
| `components/room-shell`       | 3     | 0       |
| `components/heroes`           | 2     | 0       |
| `favpoll-sheet`, `guest-book` | 2     | 0       |

**Five of the named surfaces now have one (#1110, 2026-10-20), and two of
them never needed one.** The table's last two rows were wrong:
`guest-book.stories.tsx` already existed, and so did
`favpoll-hero.stories.tsx` and `favpoll-hero-avatar.stories.tsx` — the
heroes the issue called storyless are the two files in
`components/heroes/`, not the hero surface.

**The repo already counts this, better than this entry did.**
`references/COMPONENT_TREE.md` marks every component reached by a story
with a `*` and prints the total, so the coverage number is a generated
fact rather than a `find | wc`: it read **38 with stories** before this
change and **45** after. Use that line, not a hand count — the 46-of-211
in this entry matches neither, and is probably story EXPORTS against
component files.

Added, one per surface that genuinely had none, choosing the component a
newcomer would want to see rather than the easiest to render:

| Story | Variants | What it shows |
| --- | --- | --- |
| `Manage/PledgesOverTime` | 4 | the dashboard chart, built through the exported `pledgeTimeline` so it cannot drift from how the page builds its points |
| `PrintPack/InsertCard` | 5 | the card an organiser slips into an order of service, with the QR's short `/p/<code>` form |
| `RoomShell/Podium` | 4 | the witnessed close, bronze to gold |
| `Keepsake/KeepsakeSheet` | 5 | A4, both orientations, both dials, scaled from the top-left as the real caller does |
| `FavpollSheet/FavpollSheet` | 6 | guest and room from one component, which is the whole point of it — fixture lifted from its own test so a story and its test describe the same favpoll |

All 24 render from a static `storybook build` (166 stories in the built
index, up from 142), which is the criterion that matters: #1101 existed
because stories could pass under vitest and fail the static build.

**The a11y addon found real violations, and they are pre-existing.** Run
with `test: "error"` instead of the configured `"todo"`, three of the five
report `color-contrast` failures on muted treatments — the insert card,
the keepsake and the sheet; the chart and the podium are clean. The
stories exposed them rather than caused them, which is the argument for
having stories. Raised as #1143, `ready-for-human`, because two of the
three surfaces are PRINT (axe applies screen ratios to paper) and the
muted steps are the register-ink grammar, not an accident. They fail
nothing today: `preview.tsx` keeps `a11y: { test: "todo" }`.

**Local note, not a defect.** The browser-test project passes 142 tests
on 33 files on a clean tree and fails to import seven files with all five
new stories added — including `@storybook/addon-vitest`'s own setup file,
and including stories this change never touched. Each new file passes on
its own. That is the Vite server failing to serve modules under load on
an 8GB machine, not a code error, and the memory caps that make this
machine survivable must not be raised to paper over it (see CLAUDE.md).
CI is the arbiter.

### 3.3 Fifteen stories fail in a static Storybook build · S · low risk · FIX NOW

`FavpollListCard` (5), `PledgeDialog` (5) and `PollSection` (5) throw
"invariant expected app router to be mounted" and "`__dirname` is not
defined" when opened from `storybook build` output, while passing under
vitest. Cause: `.storybook/main.ts` and `vitest.config.ts` keep **separate
alias lists** that have drifted. Fix: one exported alias map imported by
both. Until then Storybook cannot be deployed for anyone to look at.

### 3.4 No tracker, no ADRs, no templates · M · low risk · FIX NOW (process)

`references/` holds 90 markdown documents and `PROJECT.md` is 1,253 lines;
together they are a decision log in all but name, but nothing is indexed,
dated-but-superseded entries are not marked, and none of it is in the
format the engineering skills expect. There is no `.github` issue or PR
template, no CODEOWNERS, no CONTRIBUTING. `references/GLOSSARY.md` exists
and is the natural seed for `CONTEXT.md`.

The minimal skeleton: run `/setup-matt-pocock-skills` once (it asks three
questions — tracker, triage labels, doc layout), then turn this register
into issues with `/to-issues`, then work them with `tdd`.

---

## Recommended order

1. **1.1** views (an afternoon, closes the only security finding)
2. **2.4 + 2.5** dead code and dead keys (first issues, ~1,100 lines out)
3. **3.1** build in CI, **3.3** one alias map
4. **3.4** process skeleton, then **2.1** ADRs as you touch each area
5. **1.2 + 1.3** payment-intent tests and input validation
6. **2.3** shared packages, **1.4** action results, **2.2** splits — as you touch them

## A note on the React Native plan

Nothing in `apps/web` is reusable by a native client as it stands: the UI
is Tailwind on the DOM, and the data layer is Next server actions, which a
native app cannot call. A native client needs an HTTP API that does not
exist yet — today there are 10 route handlers, and they are webhooks,
crons and two entitlement-gated reads. Building that API is a real project
and the web app would benefit from it too (it would give the pledge
pipeline in 2.2 a single front door). It is a reasonable goal; it is not a
cheap way to learn the codebase. This register plus the ADRs in 2.1 is the
cheaper way.
