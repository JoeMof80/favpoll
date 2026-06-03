# Session Handoff — 2026-06-03

## Branch

`main` — all PRs merged.

## PRs merged this session

| PR  | Title                                                               | Key change                                                                                                                                                                |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #17 | refactor: extract TooltipIconButton and apply to PollHeading        | New `ui/tooltip-icon-button.tsx`; reset-pledge / view-results icon buttons on PollHeading; EventCard deduped                                                              |
| #18 | fix: remove protagonist hint line from poll heading                 | `pledged` prop and `getPollHint` removed; reveal is the sole post-pledge disclosure mechanic                                                                              |
| #19 | fix: hardcode date button width                                     | `CALENDAR_WIDTH = 220` in `date-time-picker.tsx`; removed callback-ref sync                                                                                               |
| #20 | fix: remove charity counter from charity field                      | `{n/3}` counter span removed from `CharityField`                                                                                                                          |
| #21 | fix: replace window.alert and inline alert with warning toasts      | `toast.warning()` with amber inline styles; `<Toaster>` in `app/layout.tsx`; sonner CSS variables approach does not work — must pass `style` directly on each call        |
| #22 | feat: onboarding panel and form field labels                        | `OnboardingPanel` with Honour/Love/Charity sections; `isFirstTime` from events table query; localStorage flag for returning users; visible labels on all FormPanel fields |
| #23 | feat: responsive layout, mobile picker UX, pledge panel draft state | See PR #23 notes below                                                                                                                                                    |
| #24 | refactor: remove dead code across apps/web                          | See PR #24 notes below                                                                                                                                                    |
| #25 | refactor: component cleanup, packages/ui extraction, form-panel decomposition | See PR #25 notes below                                                                                                                              |

## PR #23 — what changed

### Responsive layout

- **Header**: converted to `"use client"`, hamburger menu on mobile (`md:hidden`), click-outside closes, all nav links hidden on mobile
- **Event page** (`app/events/[id]/page.tsx`): `px-4 py-6 md:p-16` padding; `pb-24` bottom padding
- **Event content grid**: `md:grid-cols-[1fr_300px]` (was `lg:`)
- **Topics page**: same grid change `md:` (was `lg:`)
- **Event subheader**: `style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}` on bottom bar

### Event form — mobile

- Left panel: full-width on mobile, `md:w-105` on desktop
- Right preview panel: `hidden md:flex` (stays in DOM for useWatch, hidden visually on mobile)
- New `onboarding-interstitial.tsx`: mobile-only full-screen overlay (fixed inset-0) shown to first-time organisers instead of the split-panel preview. "How favpoll works →" link re-shows it. Dismissed via localStorage `favpoll_show_onboarding = '0'`.
- Bottom bar: `paddingBottom: max(1rem, env(safe-area-inset-bottom))`

### Pledge panel rewrite (`pledge-panel.tsx`)

- **Draft state**: `draftIds` initialised from `selectedIds` on open, committed to `selectedIds` on Done, discarded on close/sheet-dismiss
- **Sheet (mobile) + Dialog (desktop)**: separate `sheetOpen`/`dialogOpen` states. The picker overlay approach was superseded by this pattern — the Sheet/Dialog provides natural focus containment on both platforms without a custom overlay.
- **Item chips + input inline**: chips and search input in a single `flex-wrap` container; input collapses to `w-0` when items are selected (prevents iOS keyboard on tap)
- **Backspace to deselect**: when input is empty and items selected, Backspace/Delete removes last chip
- **Placeholder hidden** when items are selected
- **Size `lg`** on all chips in picker and trigger; Done buttons `h-11 w-full text-base`
- **`topicTitle` prop** for contextual placeholder: `Search for your favourite [topic]…`
- `onOpenAutoFocus`: only `e.preventDefault()` — no auto-focus to avoid keyboard obscuring sheet

### Pledge card visibility (`event-content/`)

- `pollView` state in `useEventContent` initialised from `hasPledged || isClosed`
- `PollSection` fires `onViewChange` on mount (initial view) and on every view transition
- `showPledgeCard = !isClosed && !!pollWithItems && !pledgeConfirmed && pollView === "pledge"`
- No `!hasPledged` check — Reset Pledge correctly re-shows the card for previously-pledged users
- `pledgeConfirmed` hides immediately on submit; `router.refresh()` then updates `hasPledged` from server

### Charity carousel

- `EventCardCharityCarousel` moved outside the grid to a `fixed bottom-0` bar (`md:hidden`)
- Always visible on mobile regardless of pledge/results state
- `paddingBottom: max(0.75rem, env(safe-area-inset-bottom))`

### Bug fixes

- **Reveal not saving on edit**: `event-form-v2/index.tsx` had `reveal: null` hardcoded; fixed to `reveal: values.reveal || null`
- **Topic items deleted on edit**: `upsertPollForEvent` in `edit/actions.ts` now checks if `topic_id` actually changed before deleting and re-inserting `event_poll_items`
- **iOS zoom**: `font-size: max(16px, 1em)` globally on `input, textarea, select` in `globals.css`; all `text-sm` changed to `text-base` on pledge card inputs
- **Chip truncation**: added `min-w-0 shrink whitespace-normal` to `chip.tsx` base class

### New files

- `components/event-form-v2/onboarding-interstitial.tsx` — mobile-only full-screen onboarding overlay
- `components/ui/sheet.tsx` — shadcn Sheet component (SlideOver drawer, mobile picker)

## PR #24 — what changed

Dead code audit and removal. Full detail in `dead-code-summary.txt` at repo root.

### Files deleted

- `components/canvas/inline-option-input.tsx` — no importers after EventCanvas removal
- `components/home-carousel.tsx` — no importers
- `components/favpoll-card/poll-framing.tsx` — no importers

### Exports removed

- `lib/display.ts`: `occasionLabel` (legacy slugs), `getPollHint` (retired PR #18)
- `lib/occasions.ts`: `OCCASIONS`, `OCCASION_LABELS`, `NAME_LABELS`, `DESCRIPTION_LABELS`, `TOPIC_REVEAL_PLACEHOLDERS`, `getAboutPlaceholder`

### Types deleted

- `packages/types/index.ts`: `CanvasPoll`, `CanvasInitialData` — legacy EventCanvas types, no references in either app

### Dependency removed

- `date-fns` from `apps/web/package.json` — no direct imports; resolved transitively via react-day-picker

### Still live — do not touch

- `protagonistFirstName` on `PollHeading` — used in poll-section, preview-panel, favpoll-poll, poll-reveal
- `previewSuffix` — drives Eye/EyeOff toggle in preview panel
- `showReveal` — drives reveal display in preview-panel and hero-demo-panel
- `CanvasPollInput`, `CanvasSubmitData` — used by event-form-v2 and edit actions
- `suggestClosingDate` / `CLOSING_DEFAULTS` — tested, no production caller yet; retained
- `ordinal` / `formatRelativeDate` / `formatEventDate` — tested utilities; retained

## PR #25 — what changed

### Phase 2a — Dead files deleted

- `components/pot-banner.tsx`
- `components/ui/toggle.tsx`
- `components/favpoll-card/favpoll-card.tsx`, `favpoll-poll.tsx`, `favpoll-pledge-panel.tsx`, `favpoll-shared-fund.tsx`, `favpoll-charity-row.tsx`
- `components/favpoll-card/stories/favpoll-card.stories.tsx`, `event-page.stories.tsx`
- **Not deleted**: `ui/dropdown-menu.tsx` had a live importer (`menu-button.tsx`); `ui/label.tsx` used by `ui/form.tsx` and `ui/field.tsx`
- **Post-merge note**: `ui/dropdown-menu.tsx` is now genuinely unused — `menu-button.tsx` was replaced by `@favpoll/ui/MenuButton` (plain button, no dropdown)

### Phase 2b — Component decomposition

- `ProtagonistAvatar` extracted from `event-hero.tsx` → `event-hero-avatar.tsx` + story (3 variants)
- `EmptyPollAlert` extracted from `poll-section/index.tsx` → `poll-section/empty-poll-alert.tsx` + story
- `StepSection` + `CounterWhenTyping` extracted → `event-form-v2/step-section.tsx`
- `form-panel.tsx` (630 lines) split into `steps/step-occasion.tsx`, `steps/step-profile.tsx`, `steps/step-topic.tsx`, `steps/step-reveal.tsx`, `steps/step-event.tsx`; `form-panel.tsx` is now a ~70-line thin shell
- Each step file uses `useFormContext<EventFormValues>()` internally; `StepProfile` owns `cropSrc`/`fileInputRef` photo state; `StepReveal` owns the `useEffect` clearing reveal when topic cleared

### Phase 2c — `packages/ui` extraction

- `packages/ui/` created: `ThemeProvider` (identical between apps) and `MenuButton` (plain button variant from admin — no shadcn `DropdownMenu` dependency)
- Both `apps/web` and `apps/admin` now import `ThemeProvider` and `MenuButton` from `@favpoll/ui`
- Duplicate `components/theme-provider.tsx` and `components/menu-button.tsx` deleted from both apps
- `packages/ui/package.json` has `@types/react` as devDependency + `tsconfig.json` for CI type resolution

### Phase 2d — Storybook

- `components/ui/tooltip-icon-button.stories.tsx` added (was the only missing story)
- New stories: `event-hero-avatar.stories.tsx`, `poll-section/empty-poll-alert.stories.tsx`

---

## Decisions locked in (additions from this session)

- **Picker overlay superseded.** The planned dark overlay behind open picker fields was not built. The Sheet (mobile) + Dialog (desktop) pattern in `pledge-panel.tsx` provides equivalent focus containment natively. Do not add a custom overlay to picker fields without explicit instruction.

- **Reveal must never be hardcoded to null on edit.** Pass `values.reveal || null` in the edit action. Hardcoding `reveal: null` silently deletes the organiser's reveal on every edit save.

- **`upsertPollForEvent` must check topic_id before deleting poll items.** Only delete and re-insert `event_poll_items` if `topic_id` has actually changed. Unconditional delete loses all organiser-added items on every edit save.

- **Mobile breakpoint is `md` (768px) throughout.** All responsive grid/layout changes use `md:` prefix. Do not introduce new `lg:` breakpoints for layout.

- **iOS input zoom prevention.** `globals.css` applies `font-size: max(16px, 1em)` to all `input, textarea, select` globally. Do not set `text-sm` or smaller on any focusable input element.

- **`packages/ui` uses plain button for `MenuButton`.** The web app's `DropdownMenu`-based version was superseded by the simpler admin version. `ui/dropdown-menu` is now unused in `apps/web`.

- **`form-panel.tsx` is a thin shell.** Each step is a self-contained component using `useFormContext`. Do not put form logic back into `form-panel.tsx` — add it to the relevant step file.

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

## Tests

442 passing (448 − 6 story-based test cases removed with the deleted favpoll-card stories).

---

## Standing instruction for Claude Code

> **Do not commit or push any changes. Make all changes locally so the developer can review them in VS Code before committing.**

This applies to every task, every session, without exception.

---

## Outstanding TODO

- **"How favpoll works" page** — `OnboardingPanel` footer link has no destination; a `/how-it-works` or `/about` page needs building
- **Copyright review** — Mary Poppins example copy; review before public launch
- **`review_status` inconsistency** — `addGuestItem` and `addOrganizerItem` use `'pending'`; schema docs and `acceptContribution` reference `'pending_review'`; needs a migration to align before contributions queue is relied upon
- **Stripe Connect** — disbursement not wired; cron has placeholder; Connect application pending approval
- **Webhooks not configured** — `CLERK_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET` blank in Vercel
- **Clerk production keys** — using `pk_test_` until `favpoll.com` DNS pointed at app
- **All-time rankings** — `/rankings` exists but needs data threshold logic
- **Event oversight admin page** — `/events` in admin is a shell only
- **Email templates** — currently plain text via Resend
- **Rate limiting** on API routes
- **`ui/dropdown-menu.tsx`** — now unused (no importers after MenuButton moved to packages/ui); safe to delete
- **Guest returning-visitor detection** — pledge detection only works for authenticated users server-side
- **Upload a list of items** — future TODO for infinite topic seeding
- **Localisation next steps** — `next-intl`, string extraction, US market prep
- **Mobile app** — future

---

## Skills to use next session

- `/favpoll-context` — always run at session start; reads `references/PROJECT.md` and `references/GLOSSARY.md`
- `/favpoll-brand` — if working on any user-facing copy
- `/favpoll-placeholders` — if working on reveal or about placeholder copy
