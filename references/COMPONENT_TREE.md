# Component Tree

> **⚠ Outdated snapshot** — this tree reflects the pre-ubiquitous-language-rename architecture (pre-Pass 2). Routes, component names, and file paths have changed significantly. See `references/PROJECT.md` §"Key Files" for the current structure. This document is retained as a historical reference.

## Legend

```
→  renders / imports
*  Storybook story exists
⚠  unused in production (no non-story imports)
```

---

## App entry points

### `app/layout.tsx`
```
app/layout.tsx
  → clerk-provider
  → @favpoll/ui/ThemeProvider
  → header
      → favpoll-logo
      → user-button-client
      → @favpoll/ui/MenuButton  (plain button, Moon/Sun toggle)
      → ui/button
  → sonner/Toaster  (position="bottom-center")
```

### `app/page.tsx` — Home
```
app/page.tsx  (server component, createAdminClient, full event query)
  → hero-demo-panel *
      → hero-demo-panel/hero-pitch-column
      → hero-demo-panel/demo-card
          → favpoll-card/favpoll-card-context  (FavpollCardProvider, size="demo")
          → favpoll-card/favpoll-header
          → favpoll-card/poll-title
          → ui/button
          → ui/ranking-bar *
          → ui/reveal-quote *
      → ui/chip *
  → live-events-carousel  (client component)
      → event-card  (see event-card tree)
  → ui/button *
  → ui/section-eyebrow *
```

### `app/events/page.tsx` — Events list
```
app/events/page.tsx  (server component, createAdminClient, auth() for pledge detection)
  → event-card  (see event-card tree; passes initialResults for previously pledged polls)
  → event-card-empty
      → ui/button
  → ui/section-eyebrow
```

### `event-card` — Interactive pledge card
```
event-card  (client component)
  → favpoll-card/favpoll-card-context  (FavpollCardProvider)
  → favpoll-card/favpoll-header
  → favpoll-card/poll-title
  → event-card/use-event-card-pledge  (hook: idle→ready→paying→pledged)
  → ui/picker-field
      → ui/popover
      → ui/chip
  → pledge-card/amount-presets
  → event-card/event-card-results
      → ui/ranking-bar
  → event-card/event-card-charity-carousel
      → charity-row
          → favpoll-card/favpoll-card-context  (useFavpollCard, size-aware)
  → stripe-checkout
  → ui/button
  → ui/tooltip-icon-button  (reset pledge, view results actions)
      → ui/button
      → ui/tooltip
          → @radix-ui/react-tooltip
```

### `app/events/new/page.tsx` — New event wizard
```
app/events/new/page.tsx  (server component; fetches charities, topics, categories, charity_topics via getWizardData())
  → new-event-wizard/index.tsx  (NewEventWizard; 3-step client component)
      → new-event-wizard/use-wizard-state  (hook: all wizard state, nextDisabled, handleNext/Back/Finish)
      → new-event-wizard/wizard-triad-rail *  (desktop left column: Honour/Charity/Love icons + labels)
      → new-event-wizard/wizard-progress-strip *  (mobile segmented progress strip)
      → new-event-wizard/wizard-step-shell *  (step title + guidance wrapper)
      → new-event-wizard/wizard-nav *  (Back + Next/Set-up-my-event buttons)
      → event-flow/honour-step  (subject/category/grouping/causeLabel)
      → new-event-wizard/wizard-charity-card *  (selected charity receipt card)
      → new-event-wizard/wizard-topic-card *  (selected topic card with item chips)
      → event-flow/charity-step  (charity chip grid; controlled search via search? prop)
      → event-flow/love-step  (topic chip grid; controlled search via search?/onSearchChange? props)
      → event-flow/topic-items-dialog  (add/remove poll items sheet)
      → ui/responsive-overlay  (charity + love overlays; search input in header prop)
      → ui/button
```

### `app/events/new/details/page.tsx` — Create event form
```
app/events/new/details/page.tsx  (query params pre-populate wizard choices)
  → event-form-v2  (EventFormV2; create mode)
      → event-form-v2/preview-panel  (coordinator; composes sub-components below)
          → event-form-v2/editable-hero  (name/context/photo/opening-line/about overlays)
              → event-form-v2/photo-crop-modal  → react-easy-crop
              → ui/responsive-overlay, ui/input, ui/textarea, ui/button, ui/switch
              → event-form-v2/edit-helpers  (EDIT_BTN, EditBadge, CharCounter, overlayFooter)
          → event-form-v2/editable-poll-area  (reveal toggle, reveal overlay, poll preview)
              → favpoll-card/poll-results
              → pledge-panel
              → ui/responsive-overlay, ui/textarea, ui/switch, ui/button
              → event-form-v2/edit-helpers
          → event-form-v2/editable-countdown  (Countdown placeholder in create; live in edit)
              → countdown
          → event-form-v2/onboarding-panel  (shown when no occasion selected)
              → ui/separator, ui/button
          → charity-banner
          → pledge-card  (prePublish mode)
      → event-form-v2/command-panel  (floating bottom-right; publish overlay with DateTimePicker)
          → event-form-v2/date-time-picker  → ui/calendar, ui/button
          → event-flow/honour-step
          → event-flow/charity-step
          → event-flow/love-step
          → event-flow/topic-items-dialog
          → ui/responsive-overlay, ui/button, ui/switch
      → event-form-v2/seed-fund-modal  (post-publish shared fund seeding)
          → stripe-checkout
          → pledge-card/amount-input
          → ui/responsive-overlay, ui/button
```

### `app/events/[id]/page.tsx` — Event view
```
app/events/[id]/page.tsx
  → event-content
      → event-hero
          → event-hero-avatar *  (ProtagonistAvatar — photo or hatched initials circle)
      → countdown *
      → ui/section-eyebrow
      → charity-banner *
      → poll-section *
          → poll-heading
              → favpoll-card/poll-title
              → favpoll-card/poll-reveal
          → pledge-panel
              → ui/button
          → ranking-list
              → ui/ranking-bar
          → ui/tabs
          → ui/button
          → poll-section/empty-poll-alert *  (shown when all poll items are hidden)
      → pledge-card
          → stripe-checkout
          → pledge-card/amount-input *
          → pledge-card/amount-presets *
              → ui/button
          → pledge-card/pledge-breakdown *
          → ui/button
  → event-subheader
      → ui/button
```

### `app/events/[id]/edit/page.tsx` — Edit event
```
app/events/[id]/edit/page.tsx
  → event-form-v2  (EventFormV2; edit mode — same tree as create/details; isFirstTime always false;
                    initialClosesAt prop passed in; editable-countdown shows live Countdown widget;
                    SeedFundModal never rendered in edit mode)
```

### `app/events/[id]/manage/page.tsx` — Manage event
```
app/events/[id]/manage/page.tsx
  → live-display-section
      → ui/button
```

### `app/events/[id]/display/page.tsx` — Live display screen
```
app/events/[id]/display/page.tsx
  → display-screen *
      → ranking-list/use-ranking-items  (hook)
```

### `app/my-events/page.tsx` — My events
```
app/my-events/page.tsx
  → ui/button
  → app/events/delete-event-button
```

### `app/rankings/page.tsx` — Rankings
```
app/rankings/page.tsx
  → app/rankings/rankings-client
      → ui/chip
```

### `app/topics/[id]/page.tsx` — Topic rankings
```
app/topics/[id]/page.tsx
  → ui/button
  → app/topics/[id]/topic-rankings
      → ui/tabs
```

### `app/pledges/withdraw/page.tsx` — Withdraw pledge
```
app/pledges/withdraw/page.tsx
  → ui/button
```

### `app/sign-in`, `app/sign-up` — Auth pages
```
  → Clerk-rendered (no custom components)
```

---

## UI primitives (`components/ui/`)

| Component | Used by | Stories |
|-----------|---------|---------|
| `button` | throughout | ✓ |
| `chip` | pledge-panel, picker-field, event-form-v2/{occasion,topic,charity,item-add}-field, hero-demo-panel, rankings-client | ✓ |
| `section-eyebrow` | event-content, closing-date, charity-picker, events page, home | ✓ |
| `ranking-bar` | ranking-list, demo-card | ✓ |
| `reveal-quote` | demo-card | ✓ |
| `occasion-tag` | event-card | ✓ |
| `tabs` | poll-section, topic-rankings | — |
| `popover` | charity-picker, picker-field | — |
| `picker-field` | charity-picker, event-card | — |
| `tooltip` | event-card, tooltip-icon-button | — |
| `tooltip-icon-button` | event-card, poll-heading | ✓ |
| `calendar` | closing-date | — |
| `card` | closing-date | — |
| `field` | closing-date | — |
| `input` | event-form-v2/editable-hero (dialog header inputs) | ✓ |
| `textarea` | event-form-v2/editable-hero, editable-poll-area (dialog header inputs) | — |
| `switch` | privacy-toggle | — |
| `separator` | onboarding-panel | — |
| `alert` | poll-section/empty-poll-alert | — |
| `label` | ui/form, ui/field | — |
| `input-group` | form-panel | — |

---

## `favpoll-card/` — Shared poll rendering primitives

These are **not** a self-contained card used in the app — they are a set of shared rendering primitives. `poll-section` (production) and `hero-demo-panel` consume individual pieces.

| Component | Used in production by |
|-----------|----------------------|
| `poll-title` | poll-heading, event-card |
| `poll-reveal` | poll-heading |
| `poll-results` | preview-panel |
| `favpoll-card-context` | event-card, demo-card, charity-row |
| `favpoll-header` | event-card, demo-card |

> The assembled `favpoll-card`, `favpoll-poll`, `favpoll-pledge-panel`, `favpoll-shared-fund`, `favpoll-charity-row` components were deleted in PR #25 — they had no production importers. `poll-framing` and the canvas cluster were deleted in PR #24.

---

## Unused in production ⚠

No known unused components. `ui/input` and `ui/textarea` are now used in production via the dialog header input pattern (editable-hero, editable-poll-area).

> `home-carousel`, `pot-banner`, `poll-framing`, `ui/toggle` deleted in PR #24.
> `favpoll-card` cluster + `poll-options`, `ui/dropdown-menu` deleted in PRs #25–#27.
