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
| #23 | feat: responsive layout, mobile picker UX, pledge panel draft state | See below                                                                                                                                                                 |

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

---

## Decisions locked in (additions from this session)

- **Picker overlay superseded.** The planned dark overlay behind open picker fields was not built. The Sheet (mobile) + Dialog (desktop) pattern in `pledge-panel.tsx` provides equivalent focus containment natively. Do not add a custom overlay to picker fields without explicit instruction.

- **Reveal must never be hardcoded to null on edit.** Pass `values.reveal || null` in the edit action. Hardcoding `reveal: null` silently deletes the organiser's reveal on every edit save.

- **`upsertPollForEvent` must check topic_id before deleting poll items.** Only delete and re-insert `event_poll_items` if `topic_id` has actually changed. Unconditional delete loses all organiser-added items on every edit save.

- **Mobile breakpoint is `md` (768px) throughout.** All responsive grid/layout changes use `md:` prefix. Do not introduce new `lg:` breakpoints for layout.

- **iOS input zoom prevention.** `globals.css` applies `font-size: max(16px, 1em)` to all `input, textarea, select` globally. Do not set `text-sm` or smaller on any focusable input element.

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

467 passing (12 new test cases added to `use-event-content.test.ts` for `hasPledged` prop).

---

## Standing instruction for Claude Code

> **Do not commit or push any changes. Make all changes locally so the developer can review them in VS Code before committing.**

This applies to every task, every session, without exception.

---

## Outstanding TODO

- **Mary Poppins copy** — verify both `onboarding-panel.tsx` and `onboarding-interstitial.tsx` match the canonical copy table above
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
- **`home-carousel.tsx`** — unused, remove or repurpose
- **`theme-provider.tsx` / `menu-button.tsx`** — duplicated across apps; extract to `packages/ui/`
- **Guest returning-visitor detection** — pledge detection only works for authenticated users server-side
- **Upload a list of items** — future TODO for infinite topic seeding
- **Localisation next steps** — `next-intl`, string extraction, US market prep
- **Mobile app** — future

---

## Skills to use next session

- `/favpoll-context` — always run at session start; reads `references/PROJECT.md` and `references/GLOSSARY.md`
- `/favpoll-brand` — if working on any user-facing copy
- `/favpoll-placeholders` — if working on reveal or about placeholder copy
