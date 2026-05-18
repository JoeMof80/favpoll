# favpoll — Ubiquitous Language Audit
**Date:** 2026-05-18
**Status:** Complete — build passing, 0 type errors

---

## Phase 1 — Database migrations

Four schema renames were required. Direct DDL execution was not possible via Supabase PostgREST (service role key does not authenticate against the connection pooler, and no `exec_sql` RPC function existed). The migration was written to:

**`supabase/migrations/20260518000000_ubiquitous_language.sql`**

This file contains four idempotent `DO $$ BEGIN ... END $$` blocks and must be applied manually via the Supabase Dashboard SQL Editor:

| # | Change |
|---|--------|
| 1 | Rename table `persons` → `protagonists`; drop old FK constraint |
| 2 | Rename column `events.person_id` → `protagonist_id` |
| 3 | Rename column `event_polls.personal_quote` → `personal_reveal` |
| 4 | Rename column `topic_items.is_master` → `is_canonical` |
| 5 | Rename function `graduate_topic_items()` → `include_topic_items()` |

---

## Phase 2–3 — Code violations fixed

All changes were applied in priority order: types → server actions → pages → components → UI copy → comments.

### Types (`types/index.ts`)

| Old | New |
|-----|-----|
| `Person` | `Protagonist` |
| `Event.person_id` | `protagonist_id` |
| `EventPoll.personal_quote` | `personal_reveal` |
| `TopicItem.is_master` | `is_canonical` |
| `EventWithDetails.persons` | `protagonists` |
| `CanvasPoll.quote` | `reveal` |
| `CanvasSubmitData.personName` | `protagonistName` |
| `CanvasSubmitData.personBio` | `protagonistBio` |
| `CanvasSubmitData.masterItemIds` | `canonicalItemIds` |
| `CanvasInitialData.personName` | `protagonistName` |
| `CanvasInitialData.personBio` | `protagonistBio` |
| `TopicPlaceholders.quote` | `reveal` |

### Library (`lib/occasions.ts`, `lib/display.ts`)

- `OccasionPlaceholders.quote` → `reveal` throughout `OCCASION_PLACEHOLDERS` and `TOPIC_REVEAL_PLACEHOLDERS`
- `DEFAULT_PLACEHOLDERS.quote` → `reveal`
- `getEventHeadline` param renamed from `personName` to `name`

### Server actions

| File | Changes |
|------|---------|
| `app/events/new/actions.ts` | `PollInput.quote` → `reveal`; `CreateEventInput.personName/personBio` → `protagonistName/protagonistBio`; `is_master` → `is_canonical`; `personal_quote` → `personal_reveal`; bucket `persons` → `protagonists`; `person_id` → `protagonist_id` |
| `app/events/[id]/actions.ts` | `persons(name)` → `protagonists(name)` query embed; `personName` local var → `protagonistName`; `is_master` → `is_canonical` |
| `app/events/[id]/edit/actions.ts` | `personal_quote` → `personal_reveal`; `masterItemIds` → `canonicalItemIds`; `is_master` → `is_canonical`; `personId` → `protagonistId`; `persons` → `protagonists` table; `personName/personBio` → `protagonistName/protagonistBio` |
| `app/api/cron/close-events/route.ts` | `persons` → `protagonists` query embed; `personName` → `protagonistName`; cast via `unknown` for Supabase embedded type |

### Pages

| File | Changes |
|------|---------|
| `app/events/page.tsx` | `persons!events_person_id_fkey(*)` → `protagonists!events_protagonist_id_fkey(*)` |
| `app/events/[id]/page.tsx` | Same FK rename in query |
| `app/events/[id]/manage/page.tsx` | Same FK rename; `typedEvent.persons.name` → `typedEvent.protagonists.name` |
| `app/events/[id]/edit/page.tsx` | FK rename; `poll.personal_quote` → `personal_reveal`; `event.persons.*` → `event.protagonists.*`; `event.person_id` → `event.protagonist_id` |
| `app/events/[id]/display/page.tsx` | FK rename; `personal_quote` → `personal_reveal`; `event.persons.*` → `event.protagonists.*`; `personName` prop → `protagonistName` |
| `app/pledges/withdraw/page.tsx` | `persons(name)` → `protagonists(name)`; `personName` local → `protagonistName` |

### Components

| File | Changes |
|------|---------|
| `components/event-hero.tsx` | Import `Person` → `Protagonist`; `ViewProps.person` → `protagonist`; `EditProps.personName/personBio` → `protagonistName/protagonistBio`; `onPersonNameChange/onPersonBioChange` → `onProtagonistNameChange/onProtagonistBioChange` |
| `components/event-content/index.tsx` | `event.persons` → `event.protagonists`; `person=` prop → `protagonist=`; `personName=` → `protagonistName=` |
| `components/event-canvas/index.tsx` | `personName=` / `personBio=` → `protagonistName=` / `protagonistBio=`; `onPersonNameChange` → `onProtagonistNameChange`; `onPersonBioChange` → `onProtagonistBioChange` |
| `components/event-canvas/use-canvas.ts` | Initial state `personName/personBio` → `protagonistName/protagonistBio`; submit mapping; `quote` → `reveal`; `masterItemIds` → `canonicalItemIds`; `is_master` → `is_canonical` |
| `components/event-canvas/utils.ts` | `CanvasState.personName/personBio` → `protagonistName/protagonistBio`; `newPoll` `quote` → `reveal` |
| `components/poll-section/index.tsx` | Props `personName` → `protagonistName`; `const quote` → `reveal`; `quote={null}` → `reveal={null}` |
| `components/poll-heading.tsx` | `ViewProps.quote` / `EditProps.quote` → `reveal`; `onQuoteChange` → `onRevealChange`; placeholder `"framing" \| "quote"` → `"framing" \| "reveal"` |
| `components/display-screen/index.tsx` | `Props.personName` → `protagonistName`; `DisplayPoll.personal_quote` → `personal_reveal`; `poll.personal_quote` → `poll.personal_reveal`; `getEventHeadline({ personName })` → `getEventHeadline({ name: protagonistName })` |
| `components/canvas/poll-editor.tsx` | `masterItems` / `i.is_master` → `canonicalItems` / `i.is_canonical`; placeholder `quote` → `reveal`; PollHeading `quote=` → `reveal=`; `onQuoteChange` → `onRevealChange`; `TopicPriorityEditor` prop `masterItems` → `canonicalItems` |
| `components/canvas/topic-priority-editor.tsx` | Props `masterItems` → `canonicalItems`; entry type `"master"` → `"canonical"`; UI copy "all-time rankings" → "the record" / "contribute to the record"; stray `masterItems.some(...)` → `canonicalItems.some(...)` |

### UI copy

| File | Old | New |
|------|-----|-----|
| `app/rankings/rankings-client.tsx` | "The record" heading (already correct) | — |
| `app/topics/[id]/topic-rankings.tsx` | `aria-label="… all-time rankings"` | `aria-label="… the record"` |
| `app/sign-up/[[...sign-up]]/page.tsx` | "all-time ranking of human favourites" | "the record of human favourites" |
| `app/sign-up/[[...sign-up]]/page.tsx` | "pledge donations" | "make pledges" |
| `app/page.tsx` | "Donate with meaning" | "Pledge with meaning" |
| `app/page.tsx` | "pledges a donation" | "makes a pledge" |
| `app/page.tsx` | "Guests pledge donations against" | "Guests pledge against" |
| `app/topics/[id]/page.tsx` | "turn their answers into donations" | "turn their pledges into funds" |
| `components/pledge-card/index.tsx` | "Donate more to the shared fund" | "Add more to the shared fund" |

### Seed script

| File | Old | New |
|------|-----|-----|
| `scripts/seed.ts` | `is_master: true` | `is_canonical: true` |

### Email (`lib/email.ts`)

- `PledgeConfirmationParams.personName` → `protagonistName`
- `EventClosedParams.personName` → `protagonistName`
- All internal usages updated; callers in `app/events/[id]/actions.ts` and `app/api/cron/close-events/route.ts` updated to match

### Pre-existing bug fixed

- `components/canvas/canvas-sidebar/closing-date.tsx`: duplicate `minDate` prop (once explicit, once spread) caused a TypeScript error — removed the redundant spread.

---

## Phase 4 — Build verification

```
✓ Compiled successfully in 45s
✓ TypeScript: no errors
✓ Static pages generated (11/11)
```

All 17 routes build clean.

---

## Remaining actions (require manual steps)

1. **Apply DB migration** — run `supabase/migrations/20260518000000_ubiquitous_language.sql` in the Supabase Dashboard SQL Editor. Until this is done, the renamed columns (`protagonist_id`, `personal_reveal`, `is_canonical`) and the renamed function (`include_topic_items()`) do not exist in the database and the app will return errors at runtime.

2. **Storage bucket rename** — the Supabase Storage bucket is still named `persons`. Rename it to `protagonists` via the Supabase Dashboard, or update the upload path back to `persons` until the rename is done.

3. **Clean up temporary scripts** — the following scripts were created during investigation and are no longer needed:
   - `scripts/migrate-ubiquitous-language.ts`
   - `scripts/run-migrations.ts`
   - `scripts/run-sql-migrations.mjs`
   - `scripts/run-sql-migrations.cjs`

---

## Terms confirmed absent from application code post-audit

- `person_id` (application code — present only in migration scripts as SQL string literals)
- `personal_quote` (same)
- `is_master` (same)
- `masterItem` / `masterItems`
- `all-time ranking` / `all-time rankings`
- `donation` / `Donate` (UI copy)
- `personName` / `personBio` (as prop or type names)
- `\.persons\b` (as Supabase table reference in application code)
