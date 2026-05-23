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
```

### `app/page.tsx` — Home
```
app/page.tsx
  → hero-demo-panel *
      → hero-demo-panel/hero-pitch-column
      → hero-demo-panel/demo-card
          → ui/button
          → ui/ranking-bar *
          → ui/reveal-quote *
      → ui/chip *
  → event-card *
      → ui/occasion-tag *
  → ui/button *
  → ui/section-eyebrow *
```

### `app/events/page.tsx` — Events list
```
app/events/page.tsx
  → event-card *
  → event-card-empty
      → ui/button
  → ui/section-eyebrow
```

### `app/events/new/page.tsx` — Create event
```
app/events/new/page.tsx
  → event-canvas
      → event-hero
      → canvas/poll-editor
          → poll-heading
              → favpoll-card/poll-title
              → favpoll-card/poll-reveal
          → canvas/topic-picker
              → canvas/removable-pill
          → canvas/custom-topic-options
              → canvas/inline-option-input
              → canvas/removable-pill
          → canvas/topic-priority-editor
              → canvas/inline-option-input
              → canvas/removable-pill
      → canvas/canvas-sidebar
          → canvas/canvas-sidebar/closing-date
              → ui/calendar
              → ui/section-eyebrow
              → ui/card
              → ui/field
              → ui/button
              → ui/textarea
          → canvas/canvas-sidebar/charity-picker
              → ui/button
              → ui/chip
              → ui/section-eyebrow
              → ui/popover
          → canvas/canvas-sidebar/shared-fund
          → canvas/canvas-sidebar/privacy-toggle
              → ui/switch
      → canvas/share-screen
      → ui/button
      → ui/chip
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
  → event-canvas  (same tree as create)
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
| `popover` | charity-picker | — |
| `calendar` | closing-date | — |
| `card` | closing-date | — |
| `field` | closing-date | — |
| `input` | — (direct HTML used elsewhere) | ✓ |
| `textarea` | closing-date | — |
| `switch` | privacy-toggle | — |
| `dropdown-menu` | — | — |
| `separator` | — | — |
| `alert` | — | — |
| `toggle` | — | — |
| `label` | — | — |
| `input-group` | — | — |

---

## `favpoll-card/` — Shared poll rendering primitives

These are **not** a self-contained card used in the app — they are a set of shared rendering primitives. `poll-section` (production) and `hero-demo-panel` consume individual pieces.

| Component | Used in production by |
|-----------|----------------------|
| `poll-title` | poll-heading |
| `poll-framing` | nobody ⚠ |
| `poll-reveal` | poll-heading |
| `poll-options` | favpoll-poll only |
| `poll-results` | favpoll-poll only |
| `favpoll-card-context` | favpoll-card internals |
| `favpoll-card` | stories only ⚠ |
| `favpoll-poll` | favpoll-card only |
| `favpoll-header` | favpoll-card only |
| `favpoll-pledge-panel` | favpoll-card only |
| `favpoll-shared-fund` | favpoll-poll only |
| `favpoll-charity-row` | event-page story only |

> `favpoll-card` (the assembled card component) has stories but is not rendered anywhere in the app. Its sub-primitives (`poll-title`, `poll-reveal`) are consumed via `poll-heading` in both the canvas editor and the event page. `poll-framing` is entirely unused — `personal_framing` was retired.

---

## Unused in production ⚠

| Component | File | Notes |
|-----------|------|-------|
| `home-carousel` | `components/home-carousel.tsx` | No imports anywhere |
| `pot-banner` | `components/pot-banner.tsx` | No imports anywhere |
| `poll-framing` | `components/favpoll-card/poll-framing.tsx` | No imports anywhere — `personal_framing` retired |
| `favpoll-card` | `components/favpoll-card/favpoll-card.tsx` | Stories only |
| `ui/dropdown-menu` | `components/ui/dropdown-menu.tsx` | No imports found |
| `ui/separator` | `components/ui/separator.tsx` | No imports found |
| `ui/alert` | `components/ui/alert.tsx` | No imports found |
| `ui/toggle` | `components/ui/toggle.tsx` | No imports found |
| `ui/label` | `components/ui/label.tsx` | No imports found |
| `ui/input-group` | `components/ui/input-group.tsx` | No imports found |
| `ui/input` | `components/ui/input.tsx` | Stories only (raw `<input>` used in production) |
