# Component Tree

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

### `app/events/new/page.tsx` — Create event
```
app/events/new/page.tsx  (queries events table to derive isFirstTime)
  → event-form-v2  (EventFormV2 — split FormPanel + PreviewPanel)
      → event-form-v2/form-panel  (thin shell — sequences 5 StepSection wrappers)
          → event-form-v2/step-section  (StepSection, CounterWhenTyping)
          → event-form-v2/steps/step-occasion
              → event-form-v2/occasion-picker-field
                  → ui/popover, ui/chip
          → event-form-v2/steps/step-profile
              → event-form-v2/photo-crop-modal
                  → react-easy-crop
              → ui/input-group
          → event-form-v2/steps/step-topic
              → event-form-v2/topic-picker-field
                  → ui/popover, ui/chip
          → event-form-v2/steps/step-reveal
          → event-form-v2/steps/step-event
              → event-form-v2/charity-field
                  → ui/popover, ui/chip
              → event-form-v2/date-time-picker
                  → ui/calendar, ui/button
      → event-form-v2/preview-panel  (live preview; isFirstTime prop)
          → event-form-v2/onboarding-panel  (shown when no occasion selected, first-time or localStorage flag)
              → ui/separator
              → ui/button
          → event-hero
          → poll-heading
              → ui/tooltip-icon-button  (onResetPledge, onViewResults)
          → pledge-panel
          → favpoll-card/poll-results
          → countdown
          → charity-banner
          → pledge-card  (prePublish mode; toast.warning on click)
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
  → event-form-v2  (same tree as create; isFirstTime always false on edit)
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
| `chip` | event-canvas, charity-picker, hero-demo-panel, rankings-client | ✓ |
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
| `input` | — (direct HTML used elsewhere) | ✓ |
| `textarea` | closing-date | — |
| `switch` | privacy-toggle | — |
| `dropdown-menu` | — ⚠ | — |
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
| `poll-options` | (no production caller) |
| `poll-results` | preview-panel |
| `favpoll-card-context` | event-card, demo-card, charity-row |
| `favpoll-header` | event-card, demo-card |

> The assembled `favpoll-card`, `favpoll-poll`, `favpoll-pledge-panel`, `favpoll-shared-fund`, `favpoll-charity-row` components were deleted in PR #25 — they had no production importers. `poll-framing` and the canvas cluster were deleted in PR #24.

---

## Unused in production ⚠

| Component | File | Notes |
|-----------|------|-------|
| `ui/dropdown-menu` | `components/ui/dropdown-menu.tsx` | No importers — `menu-button` moved to `@favpoll/ui` (plain button, no dropdown) |
| `ui/input` | `components/ui/input.tsx` | Stories only (raw `<input>` used in production) |

> `home-carousel`, `pot-banner`, `poll-framing`, `ui/toggle` deleted in PR #24.
> `favpoll-card` cluster (favpoll-card, favpoll-poll, favpoll-pledge-panel, favpoll-shared-fund, favpoll-charity-row) deleted in PR #25.
