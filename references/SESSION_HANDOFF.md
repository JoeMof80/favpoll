# Session Handoff — 2026-06-14

See [`session-handoff-2026-06-14.md`](session-handoff-2026-06-14.md) for the most recent session (PRs #97–#100: preview-panel split, CharityStep simplification, dialog header input pattern).

---

# Session Handoff — 2026-06-04

## Branch

`main` — all PRs merged through #32.

## PRs merged (current state)

| PR  | Title                                                                        | Key change                                                                       |
| --- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| #17 | refactor: extract TooltipIconButton                                          | `ui/tooltip-icon-button.tsx`; reset-pledge / view-results icon buttons           |
| #18 | fix: remove protagonist hint line from poll heading                          | `pledged` prop and `getPollHint` removed                                         |
| #19 | fix: hardcode date button width                                              | `CALENDAR_WIDTH = 220` in `date-time-picker.tsx`                                 |
| #20 | fix: remove charity counter from charity field                               | `{n/3}` counter span removed                                                     |
| #21 | fix: replace window.alert and inline alert with warning toasts               | `toast.warning()` with inline styles; sonner CSS variables don't work            |
| #22 | feat: onboarding panel and form field labels                                 | `OnboardingPanel`; `isFirstTime` from events table; localStorage flag           |
| #23 | feat: responsive layout, mobile picker UX, pledge panel draft state          | Header hamburger, Sheet+Dialog pledge panel, mobile form interstitial             |
| #24 | refactor: remove dead code across apps/web                                   | Deleted canvas, home-carousel, poll-framing, legacy lib exports                  |
| #25 | refactor: component cleanup, packages/ui extraction, form-panel decomposition | `packages/ui` for ThemeProvider+MenuButton; form-panel split into step files     |
| #26 | docs: update session handoff and component tree for PR #25                   | Reference docs updated                                                            |
| #27 | refactor: delete poll-options and dropdown-menu (zero importers)             | `poll-options.tsx` and `ui/dropdown-menu.tsx` deleted                            |
| #28 | test: add unit tests for display utilities, event form schema, pledge hook   | New test files for `lib/display.ts`, `schema.ts`, `use-event-card-pledge.ts`     |
| #29 | fix: correct review_status 'pending' → 'pending_review' throughout           | Migration + code aligned; contributions queue now reliable                        |
| #30 | fix: onboarding panel height, alignment, and tsconfig deprecation            | Onboarding panel layout fixes; tsconfig `moduleResolution` updated                |
| #31 | feat: add seed-events script for scale testing                               | `scripts/seed-events.ts` — 40 events, idempotent, staging-safety guard           |
| #32 | feat: EventSummaryCard, rankings polish, and event card improvements         | See PR #32 notes below                                                            |

---

## PR #32 — what changed

### New component: `EventSummaryCard`

`apps/web/components/event-summary-card.tsx` — compact read-only card with no pledge UI.

- Three sections: `FavpollHeader` (protagonist + opening_line eyebrow), `Countdown` + `PollTitle` (topic title + poll closes), `EventCardCharityCarousel` (charity row)
- Entire card is a `<Link href="/events/[id]">` — no interactive elements inside
- Wrapped in `FavpollCardProvider value={{ size: "full" }}` so `EventCardCharityCarousel` sizes correctly
- `EventSummaryCardEvent` type exported for use in pages and carousel

### Landing page carousel

`apps/web/components/live-events-carousel.tsx` now accepts `EventSummaryCardEvent[]` and renders `EventSummaryCard` per slide (was `EventCard`). Carousel structure preserved (Embla + Autoplay + prev/next buttons).

### Your Events page (`/my-events`)

`apps/web/app/my-events/page.tsx` now renders a 4-column responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) of `EventSummaryCard`. Query updated to include `logo_url` and `registered_number` for the charity carousel.

### EventCard — multi-select pledge panel

`apps/web/components/event-card.tsx`: replaced `PickerField` with `PledgePanel` (Sheet/Dialog pattern, consistent with the event page pledge flow).

`apps/web/components/event-card/use-event-card-pledge.ts`: refactored from single-item (`selectedItemId`/`selectItem`) to multi-item (`selectedIds`/`setSelectedIds`). `onPaymentSuccess` computes equal-split `pledge_allocations` across all selected items.

### Charity carousel overflow fix

Moved charity `<div>` inside the bordered card container `<div>` in `event-card.tsx`. It was outside, causing the charity row to bleed into the next CSS grid row.

### Poll results — all items shown

`apps/web/app/api/polls/[pollId]/results/route.ts`: now fetches all visible `event_poll_items` first, merges pledge totals in JS, and returns 0-value items. No more `slice(0,5)`. Excludes withdrawn pledges.

`apps/web/app/events/page.tsx`: `initialResults` computation updated to include all poll items (not just pledged ones), using poll items from already-fetched event data.

`apps/web/components/event-card/event-card-results.tsx`: delegates to `PollResults` component; 0-value items display `"—"`. Wrapped in `max-h-48 overflow-y-auto` scroll container.

### RankingBar used throughout

`apps/web/app/topics/[id]/topic-rankings.tsx`: replaced bordered `<li>` card rows with `RankingBar`.

`apps/web/components/display-screen/index.tsx`: `DisplayRankingRow` now uses `RankingBar` internally, keeping the animated `translateY` wrapper for live re-ranking.

---

## Staging DB notes

- Staging Supabase ref: `eotqyintgusvzidymumb`
- `apps/web/.env.local` points to **production**; root `.env.local` points to **staging**
- **Canonical seed-events command** (always loads root env → staging):
  ```
  cd apps/web && pnpm exec tsx ../../scripts/seed-events.ts --env-file=../../.env.local
  ```
  Or from repo root: `pnpm --filter @favpoll/web exec tsx ../../scripts/seed-events.ts`
- `ALLOW_EVENT_SEED=1` **must only be used after explicitly confirming** the loaded `NEXT_PUBLIC_SUPABASE_URL` contains `eotqyintgusvzidymumb`. It is the bypass for the staging-ref guard — not a casual alternative to the explicit env load.
- Schema lag resolved: `guest_email`, `guest_token`, `withdrawn_at`, `pot_allocation_id` on `pledges` are now captured in migration `20260604120000_add_guest_pledge_columns.sql`. Applied to staging manually; **production needs this migration run** (see migration file for SQL).

---

## Tests

481 passing (51 test files).

---

## Decisions locked in (additions from PRs #27–#32)

- **`review_status` values are `'pending_review'`** (not `'pending'`). Migration #29 aligned all code and existing rows. The contributions queue now reliably shows pending items. Do not use `'pending'` anywhere.

- **`poll-options.tsx` and `ui/dropdown-menu.tsx` are deleted.** Both had zero importers after PR #25. Do not reintroduce.

- **EventCard uses PledgePanel (Sheet+Dialog), not PickerField.** Consistent with the event page pledge flow. Multi-item selection with equal-split allocations.

- **Poll results always include all visible items.** Even 0-value items are returned by the API and shown in `EventCardResults`. `widthPercent` is 0 for items with no pledges; amount displayed as `"—"`.

- **EventSummaryCard is the read-only listing card.** Used on the landing page carousel and `/my-events` grid. `EventCard` (with pledge UI) remains for the `/events` listing page only.

- **RankingBar is the canonical ranking row component.** Used in EventCardResults (via PollResults), topic rankings page, and display screen. Do not build custom ranking rows.

- **`scripts/seed-events.ts` behaviour.** Owns all rows via `created_by = 'user_seed_scale'` (organisers `user_seed_001`–`008` for guest pledges). Tops up to `TARGET_EVENTS = 40` idempotently; never deletes. Inserting `pledge_allocations` fires the record trigger, so each run **shifts staging's `all_time_pledged` / `all_time_count`** — relevant when building the `/rankings` data threshold logic, which will be tested against synthetic numbers. `event_count` / `total_pledge_count` are intentionally left at 0 (no trigger; reserved for future inclusion-promotion). Cleanup: `delete from events where created_by = 'user_seed_scale';` (cascades to polls, items, pledges, allocations, pots).

---

## Mary Poppins onboarding copy — canonical version

Verify `components/event-form-v2/onboarding-panel.tsx` and
`components/event-form-v2/onboarding-interstitial.tsx` contain
exactly this copy. Do not paraphrase or improve — this wording
was arrived at deliberately.

| Field      | Value                                                                                                                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name       | Mary Poppins                                                                                                                                                                                          |
| Context    | Practically perfect in every way                                                                                                                                                                      |
| About      | She arrived by umbrella when the wind changed, with a cheery disposition, rosy cheeks, and a surprising number of favourite things. She knows what helps the medicine go down at Great Ormond Street. |
| Topic chip | Favourite Things                                                                                                                                                                                      |
| Charity    | Great Ormond Street Hospital                                                                                                                                                                          |
| Reveal     | Raindrops on roses. We don't know why. She never explained.                                                                                                                                           |

---

## Outstanding TODO

- **"How favpoll works" page** — `OnboardingPanel` footer link has no destination; a `/how-it-works` or `/about` page needs building
- **Copyright review** — Mary Poppins example copy; review before public launch
- **Stripe Connect** — disbursement not wired; cron has placeholder; Connect application pending approval
- **Webhooks not configured** — `CLERK_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET` blank in Vercel
- **Clerk production keys** — using `pk_test_` until `favpoll.com` DNS pointed at app
- **All-time rankings** — `/rankings` exists but needs data threshold logic
- **Event oversight admin page** — `/events` in admin is a shell only
- **Email templates** — currently plain text via Resend
- **Rate limiting** on API routes
- **Guest returning-visitor detection** — pledge detection only works for authenticated users server-side
- **Upload a list of items** — future TODO for infinite topic seeding
- **Localisation next steps** — `next-intl`, string extraction, US market prep
- **Mobile app** — future

---

## Skills to use next session

- `/favpoll-context` — always run at session start; reads `references/PROJECT.md` and `references/GLOSSARY.md`
- `/favpoll-brand` — if working on any user-facing copy
- `/favpoll-placeholders` — if working on reveal or about placeholder copy
