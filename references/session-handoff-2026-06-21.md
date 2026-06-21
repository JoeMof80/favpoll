# Session handoff — favpoll
Date: 21 June 2026

---

## What was completed this session

### PRs #117, #118, #119 — Ubiquitous-language rename, passes 3–5 (merged at session start)

These were open at the start of the session and all had green CI. Merged in order
(each branch built on the prior). Collectively they completed the `events` →
`favpolls` rename across all five passes:

- **Pass 3** — internal identifiers (props, locals, private types)
- **Pass 4** — Supabase query string literals; `formatEventDate` → `formatFavpollDate`, `sendEventClosed` → `sendFavpollClosed`
- **Pass 5** — docs and seed script identifiers; `ALLOW_EVENT_SEED` → `ALLOW_FAVPOLL_SEED` in both seed scripts; `README.md` and `COMPONENT_TREE.md` marked as outdated snapshots

Full exclusion list documented in PROJECT.md under the ubiquitous-language rename entry.

---

### PR #120 — Fix seed scripts: occasion model fields never written; reveal lookup wrong key (merged)

Four bugs discovered in `scripts/seed-favpolls.ts` and `scripts/seed-exemplars.ts`:

**Bug 1 — `personal_reveal` always null (highest priority)**
`topic.placeholders` is keyed by register (`"remembering"`, `"celebrating_one"`, etc.).
The seed scripts were looking up `topic.placeholders[occasionType]` — e.g.
`topic.placeholders["Memorial"]` — which never matches any key and always returns
undefined.

Fix: `topic.placeholders?.[register]?.reveal ?? null`

**Bug 2 — `opening_line` never written**
`FavpollListCard` renders `eyebrow={favpoll.opening_line ?? ""}` with no fallback. The
detail-page hero falls back to `OCCASION_TYPE_PREFIXES` via `getFavpollHeadline`, but
the listing card does not. Seeds were writing `null`, so the listing eyebrow was always
blank.

Fix: local `OPENING_LINE_PREFIXES` map (mirror of `OCCASION_TYPE_PREFIXES` in
`lib/display.ts`) written at seed time. Neutral-register favpolls (`occasionType: null`)
get `opening_line: null` — this is correct; no prefix exists for unclassified occasions.

**Bug 3 — `category` / `grouping` / `subject` / `is_listed` never written**
The DB canonical occasion model was entirely blank on all seeded rows. Legacy bridges
(`OCCASION_TYPE_PREFIXES`, `registerForOccasionType`) masked this for rendering, but
the DB state was semantically wrong.

Fix: local `registerToOccasionModel()` helper with hand-built mapping:

| register | category | grouping | subject | is_listed |
|---|---|---|---|---|
| remembering | memorial | individual | someone | false |
| celebrating_one | celebration | individual | someone | true |
| celebrating_many | celebration | couple | someone | true |
| cause | fundraiser | individual | cause | true |
| neutral | null | individual | someone | true |

**Bug 4 — Hargreaves exemplar rendered wrong hero**
The Hargreaves Memorial Fund exemplar (`register: "cause"`) was being inserted with a
protagonist row and `subject` defaulting to `'someone'`, causing `FavpollHero` to render
instead of `CauseHero`.

Fix in `seed-exemplars.ts`: for cause exemplars, skip the protagonist insert entirely;
set `subject: 'cause'`, `cause_label: ex.name`, `description: ex.about`,
`protagonist_id: null`. Idempotency check switched from `protagonists.name` to
`favpolls.cause_label` for cause exemplars.

**Duplication note:** `OPENING_LINE_PREFIXES` and `registerToOccasionModel()` cannot
import from `apps/web/lib/` in scripts, so both are duplicated across the two seed
files. If `OCCASION_TYPE_PREFIXES` in `lib/display.ts` or `deriveRegister` in
`lib/registers.ts` changes, update both seed scripts too. Risk documented in PROJECT.md.

**Re-seed required:** existing seeded rows had blank occasion model fields. Delete + re-run both seed scripts after merging. Joseph confirmed re-seed completed.

---

### PR #121 — Fix listing card crash on cause favpolls (merged)

After re-seeding, Hargreaves didn't appear on the `/favpolls` listing. Two root causes:

1. `FavpollListCard` accessed `favpoll.protagonist.name` unconditionally — null for cause
   favpolls → runtime crash / card silently dropped by Next.js error boundary.
2. `FAVPOLL_SELECT` in `app/favpolls/page.tsx` didn't select `subject` or `cause_label`,
   so there was no name to display even if the crash were fixed.

Fix:
- `FAVPOLL_SELECT`: add `subject`, `cause_label`
- `RawFavpoll` type: `protagonist` → `{ name: string } | null`; add `subject`, `cause_label`
- `FavpollListCardFavpoll` type: same
- `FavpollHeader` name prop: `subject === 'cause' ? cause_label : protagonist?.name`

---

## Patterns to carry forward

### Seed scripts write the full occasion model
Both seed scripts now write `opening_line`, `category`, `grouping`, `subject`,
`is_listed` on every favpoll insert. The `personal_reveal` lookup uses
`topic.placeholders[register]` (the correct key), never `topic.placeholders[occasionType]`.

### Cause favpolls have no protagonist row
`protagonist_id` is null. Any query or component that joins protagonists must handle
null. `FavpollListCard.protagonist` is typed nullable; `subject === 'cause'` is the
branch condition for all cause-specific rendering.

### `opening_line` is nullable for neutral-register favpolls
No occasion type → no prefix → `opening_line: null`. The listing card eyebrow is
intentionally blank. The detail-page hero still shows "Honouring" via the register
prefix fallback in `getFavpollHeadline`. Do not add a fallback to the listing card —
the blank is correct.

---

## Current state

- Branch: `main`
- Last merged PR: #121
- Tests: 811 web passing (77 test files), 56 admin passing (4 test files)
- All CI green at merge

---

## Outstanding TODO (unchanged from prior sessions unless noted)

- **Webhooks not configured** — `CLERK_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET` blank in Vercel
- **Clerk production keys** — using `pk_test_` until `favpoll.com` DNS pointed at app
- **Stripe Connect** — disbursement not wired; cron placeholder; Connect application pending
- **All-time rankings** — `/rankings` exists but needs data threshold logic
- **Favpoll oversight admin page** — `/favpolls` in admin is a shell only
- **Email templates** — currently plain text via Resend
- **Rate limiting** on API routes
- **Localisation next steps** — `next-intl`, string extraction, US market prep
- **Abandoned wizard draft recovery** — if organiser closes the tab before publishing, `sessionStorage` draft is lost; `localStorage` recovery deferred
- **`LiveDisplaySection` cleanup** — component is unused since manage page retired; safe to delete
