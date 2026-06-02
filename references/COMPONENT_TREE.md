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
  → theme-provider
  → header
      → favpoll-logo
      → user-button-client
      → menu-button
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
      → event-form-v2/form-panel  (5-step form; all fields have visible labels)
          → event-form-v2/occasion-picker-field
              → ui/popover, ui/chip
          → event-form-v2/topic-picker-field
              → ui/popover, ui/chip
          → event-form-v2/charity-field
              → ui/popover, ui/chip
          → event-form-v2/date-time-picker
              → ui/calendar, ui/button
          → event-form-v2/photo-crop-modal
              → react-easy-crop
          → ui/button
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
          → ui/alert  (empty-poll warning when all items hidden)
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
| `tooltip-icon-button` | event-card, poll-heading | — |
| `calendar` | closing-date | — |
| `card` | closing-date | — |
| `field` | closing-date | — |
| `input` | — (direct HTML used elsewhere) | ✓ |
| `textarea` | closing-date | — |
| `switch` | privacy-toggle | — |
| `dropdown-menu` | — | — |
| `separator` | onboarding-panel | — |
| `alert` | poll-section | — |
| `toggle` | — | — |
| `label` | — | — |
| `input-group` | form-panel | — |

---

## `favpoll-card/` — Shared poll rendering primitives

These are **not** a self-contained card used in the app — they are a set of shared rendering primitives. `poll-section` (production) and `hero-demo-panel` consume individual pieces.

| Component | Used in production by |
|-----------|----------------------|
| `poll-title` | poll-heading, event-card |
| `poll-framing` | nobody ⚠ |
| `poll-reveal` | poll-heading |
| `poll-options` | favpoll-poll only |
| `poll-results` | favpoll-poll only |
| `favpoll-card-context` | event-card, demo-card, charity-row |
| `favpoll-card` | stories only ⚠ |
| `favpoll-poll` | favpoll-card only |
| `favpoll-header` | event-card, demo-card |
| `favpoll-pledge-panel` | favpoll-card only |
| `favpoll-shared-fund` | favpoll-poll only |
| `favpoll-charity-row` | event-page story only |

> `favpoll-card` (the assembled card component) has stories but is not rendered anywhere in the app. Its sub-primitives (`poll-title`, `poll-reveal`) are consumed via `poll-heading` in both the canvas editor and the event page. `poll-framing` is entirely unused — `personal_framing` was retired.

---

## Unused in production ⚠

| Component | File | Notes |
|-----------|------|-------|
| `home-carousel` | `components/home-carousel.tsx` | Not imported by production code — live-events-carousel is used for homepage |
| `pot-banner` | `components/pot-banner.tsx` | No imports anywhere |
| `poll-framing` | `components/favpoll-card/poll-framing.tsx` | No imports anywhere — `personal_framing` retired |
| `favpoll-card` | `components/favpoll-card/favpoll-card.tsx` | Stories only |
| `ui/dropdown-menu` | `components/ui/dropdown-menu.tsx` | No imports found |
| `ui/alert` | `components/ui/alert.tsx` | Used by `poll-section` — no longer unused |
| `ui/separator` | `components/ui/separator.tsx` | Used by `onboarding-panel` — no longer unused |
| `ui/input-group` | `components/ui/input-group.tsx` | Used by `form-panel` — no longer unused |
| `ui/toggle` | `components/ui/toggle.tsx` | No imports found |
| `ui/label` | `components/ui/label.tsx` | No imports found |
| `ui/input` | `components/ui/input.tsx` | Stories only (raw `<input>` used in production) |
