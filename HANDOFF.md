# Session handoff — 2026-06-21

## What shipped

### PR #110 — `feat: Framer Motion hero animations, PageLayout wrapper, example name updates` (merged, previous session)
Context only — this PR introduced `HeroLayout` (Framer Motion scroll animations on the live favpoll page) and `BaseEventHero` with an `isEdit` branching prop. The edit path's `onClick={() => {}}` no-ops on all `EditableField`s were the root cause of the work in PR #112.

### PR #111 — `feat: unified pledge dialog — collapse pick/amount/pay into one 3-step ResponsiveOverlay` (merged, previous session)
Context only — introduced `pledge-dialog/` with `PledgeDialog`, `usePledgeDialog`, step components, and stories. PR #113 wired this into `EventCard`.

### PR #112 — `refactor: simplify EditableHero, wire overlay triggers, replace PledgeCard preview` (merged)
Three changes bundled:

1. **EditableHero rewrite.** `editable-hero.tsx` no longer delegates to `BaseEventHero`. It renders its own static hero JSX (no Framer Motion) and owns all overlay state directly. Each `EditableField` has a named `open*()` function (e.g. `openName`, `openAbout`) that seeds the draft from the current form value before opening — closing without Save discards the draft and the form value is unchanged. Previously all `onClick` handlers were `() => {}` no-ops inherited from `BaseEventHero`'s edit-mode branch.

2. **BaseEventHero stripped to read-only.** Removed `isEdit`, `formValues`, `isGenerating`, `onRegenerate`, `editAvatar` props — the component is now purely a view renderer used by `EventHero` on the live favpoll page. `register` was also removed from the props/call (column was dropped in migration `20260607140000_derive_register.sql`; headline now derived from `occasion_type` directly via `getFavpollHeadline`). `EventHero` had its `isEdit={false}` prop removed (no longer accepted).

3. **Shared fund card in form preview.** `event-form-v2/preview-panel.tsx` and `event-form-v2/index.tsx` (FormInner sidebar) now show the same `rounded-lg border border-border bg-background px-5 py-4` card structure as the live `/favpolls/[id]` page, wrapped in `pointer-events-none opacity-40`. `PledgeCard` is no longer rendered in the form — it's kept for the organiser preview inside `editable-poll-area.tsx` only.

### PR #113 — `feat: EventCard uses PledgeDialog, fix homepage register column error` (merged)
Two changes:

1. **EventCard → PledgeDialog.** `event-card.tsx` now constructs a `FavpollPollWithItems` inline from the card's poll data and renders `PledgeDialog` (multi-step) instead of the old `PledgePanel` + inline amount inputs. Added `clerkUserId?: string | null` prop (passed from server page). On pledge success: fetches `/api/polls/[pollId]/results` and switches to `EventCardResults` view. `favpolls/page.tsx` passes `clerkUserId={userId}` and `is_finite` to each card.

2. **Homepage silent empty results fix.** `app/page.tsx` was selecting the `register` column from Supabase. That column was dropped by `20260607140000_derive_register.sql`. Supabase silently returns `{ data: null }` when any unknown column is selected — causing the homepage to always show "No live favpolls yet" regardless of DB contents. Fix: removed `register` from both the `.select()` string and the `RawEvent` type.

### PR #114 — `docs: update PROJECT.md for PRs #112 and #113` (open, awaiting CI)
Pending merge at time of writing. Docs only — no code changes.

## Key bugs to know about

**Dropped `register` column.** The `favpolls.register` column was dropped in migration `20260607140000_derive_register.sql`. Supabase returns `{ data: null }` (not an error) when a dropped column is selected — no Supabase error is raised, the entire query result is null. Any query that still selects `register` will silently return empty results. Both `app/page.tsx` (homepage) and any future query against `favpolls` must not include `register` in the select string. `register` exists only as a runtime-derived value in app code via `deriveRegister(category, grouping)`.

**Framer Motion only on live page.** `HeroLayout` (Framer Motion scroll animations) is used only on `app/favpolls/[id]/page.tsx`. `EditableHero` has its own static layout — do not re-introduce motion primitives there. `BaseEventHero` (read-only, used by `EventHero` on the live page) is also static; `HeroLayout` wraps it externally on the page.

## Repo state

`main` is clean. PR #114 (docs) is the only open PR; CI should pass (docs-only change). Branch `docs/pr-112-113-project-update` will be deleted after merge. Current working branch context: the session ended on `docs/pr-112-113-project-update`.

## Nothing else pending

No outstanding work from this session beyond merging PR #114. Project-wide outstanding TODOs (webhooks, Stripe Connect, rankings threshold, etc.) are unchanged — see `references/PROJECT.md` § Outstanding TODO.
