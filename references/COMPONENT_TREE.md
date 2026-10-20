# Component Tree

Generated 2026-10-20 by `node scripts/component-tree.mjs` — do not edit by hand; rerun it (CI: `--check`).

## Legend

```
→  imports / renders
*  Storybook story exists
⚠  no production importer (only tests, stories, or nothing)
↑  already expanded above, or a shared subtree (see its section)
```

Counts: 30 routes · 192 component files · 38 with stories · 0 unused in production

---

## Routes

### `app/about/page.tsx`

```
app/about/page.tsx
  → components/contact-form.tsx
      → components/ui/button.tsx *
      → components/ui/input.tsx *
      → components/ui/label.tsx
      → components/ui/textarea.tsx
  → components/landing/fade-in.tsx
  → components/landing/hero-texture.tsx
  → components/ui/button.tsx *  ↑
  → components/ui/section-eyebrow.tsx *
```

### `app/appeals/[slug]/manage/page.tsx`

```
app/appeals/[slug]/manage/page.tsx
  → app/appeals/appeal-form.tsx
      → components/favpoll-form/date-helpers.ts
      → components/favpoll-form/date-time-picker.tsx *  ↑
      → components/favpoll-form/edit-helpers.tsx  ↑
      → components/favpoll-form/hero-photo-overlay.tsx  ↑
      → components/favpoll-form/schema.ts
      → components/new-favpoll-wizard/wizard-field.tsx  ↑
      → components/ui/button.tsx *
      → components/ui/input-group.tsx  ↑
      → components/ui/switch.tsx
      → components/ui/textarea.tsx
  → components/page-sheet.tsx
      → components/page-ground.tsx
  → components/ui/section-eyebrow.tsx *
  → lib/appeals-admin.ts  (lib)
  → lib/supabase/admin.ts  (lib)
```

### `app/appeals/[slug]/page.tsx`

```
app/appeals/[slug]/page.tsx
  → components/favpoll-summary-card.tsx *
      → components/closing-label.tsx
      → components/favpoll-card/favpoll-header.tsx *
          → components/favpoll-card/types.ts
      → components/favpoll-list-card/favpoll-list-card-charity-carousel.tsx  ↑
      → components/poll-heading.tsx *  ↑
      → components/ui/badge.tsx
      → packages/types/ *
  → components/goal-progress.tsx
  → components/landing/quiet-tail.tsx
  → components/page-layout.tsx
      → components/page-ground.tsx
      → components/shell-scroller.tsx
  → components/share-favpoll-button.tsx
      → components/ui/button.tsx *
  → components/ui/button.tsx *  ↑
  → components/ui/section-eyebrow.tsx *
  → lib/appeals-admin.ts  (lib)
  → lib/display.ts  (lib)
  → lib/supabase/admin.ts  (lib)
```

### `app/appeals/new/page.tsx`

```
app/appeals/new/page.tsx
  → app/appeals/appeal-form.tsx
      → components/favpoll-form/date-helpers.ts
      → components/favpoll-form/date-time-picker.tsx *  ↑
      → components/favpoll-form/edit-helpers.tsx  ↑
      → components/favpoll-form/hero-photo-overlay.tsx  ↑
      → components/favpoll-form/schema.ts
      → components/new-favpoll-wizard/wizard-field.tsx  ↑
      → components/ui/button.tsx *
      → components/ui/input-group.tsx  ↑
      → components/ui/switch.tsx
      → components/ui/textarea.tsx
  → components/page-sheet.tsx
      → components/page-ground.tsx
  → components/ui/section-eyebrow.tsx *
  → lib/appeals-admin.ts  (lib)
  → lib/supabase/admin.ts  (lib)
```

### `app/celebration/page.tsx`

```
app/celebration/page.tsx
  → components/landing/demo-fixture.ts
      → components/hero-demo-panel/scenes.ts *
          → components/favpoll-card/types.ts
      → components/keepsake/keepsake-document.tsx  ↑
      → components/landing/topic-picker-vignette.tsx  ↑
      → components/print-pack/pack-card.tsx  ↑
  → components/landing/fold.tsx
  → components/landing/folded-card-vignette.tsx
      → components/landing/demo-fixture.ts  ↑
      → components/landing/vignette.tsx
      → components/print-pack/pack-card.tsx  ↑
  → components/landing/hero.tsx
      → components/hero-demo-panel/demo-card.tsx *  ↑
      → components/hero-demo-panel/demo-frame.tsx
      → components/hero-demo-panel/phone-frame.tsx
      → components/hero-demo-panel/scenes.ts *  ↑
      → components/landing/count-up.tsx
      → components/landing/hero-texture.tsx
      → components/landing/quiet-tail.tsx
      → components/landing/use-demo-loop.ts
          → components/hero-demo-panel/scenes.ts *  ↑
      → components/ui/button.tsx *
      → components/ui/ranking-bar.tsx *
  → components/landing/how-it-works-hints.tsx
      → components/charity-row.tsx *  ↑
      → components/hero-demo-panel/scenes.ts *  ↑
      → components/landing/demo-fixture.ts  ↑
      → components/pledge-card/pledge-breakdown.tsx *
      → components/ui/button.tsx *  ↑
      → components/ui/ranking-bar.tsx *  ↑
      → packages/types/ *
  → components/landing/how-it-works-steps.tsx
      → components/landing/how-it-works-hints.tsx  ↑
  → components/landing/ideas-section.tsx
      → components/ui/section-eyebrow.tsx *
  → components/landing/keepsake-vignette.tsx
      → components/keepsake/keepsake-document.tsx  ↑
      → components/keepsake/keepsake-sheet.tsx
          → components/keepsake/keepsake-document.tsx  ↑
      → components/landing/demo-fixture.ts  ↑
      → components/landing/vignette.tsx  ↑
  → components/landing/live-vignette.tsx
      → components/hero-demo-panel/scenes.ts *  ↑
      → components/hero-demo-panel/tv-frame.tsx
      → components/landing/demo-fixture.ts  ↑
      → components/landing/display-still.tsx
          → components/hero-demo-panel/scene-favourites.ts
              → components/hero-demo-panel/scenes.ts *  ↑
              → packages/types/ *  ↑
          → components/hero-demo-panel/scenes.ts *  ↑
          → components/room-shell/  ↑
          → packages/types/ *  ↑
      → components/landing/vignette.tsx  ↑
  → components/landing/note-vignette.tsx
      → components/favpoll-card/poll-note.tsx *  ↑
      → components/hero-demo-panel/demo-card.tsx *  ↑
      → components/hero-demo-panel/phone-frame.tsx  ↑
      → components/hero-demo-panel/scenes.ts *  ↑
      → components/landing/demo-fixture.ts  ↑
      → components/landing/vignette.tsx  ↑
      → components/poll-heading.tsx *  ↑
  → components/landing/open-right-now.tsx
      → components/landing/fade-in.tsx
      → components/live-favpolls-carousel.tsx *
          → components/favpoll-summary-card.tsx *  ↑
          → components/ui/button.tsx *  ↑
      → components/ui/button.tsx *  ↑
      → components/ui/section-eyebrow.tsx *  ↑
  → components/landing/pro-section.tsx
      → components/ui/button.tsx *  ↑
  → components/landing/quiet-tail.tsx  ↑
  → components/register-scope.tsx
  → components/ui/button.tsx *  ↑
  → lib/i18n.ts  (lib)
  → lib/live-favpolls.ts  (lib)
```

### `app/charities/[id]/page.tsx`

```
app/charities/[id]/page.tsx
  → components/closing-label.tsx
  → components/favpoll-card/favpoll-header.tsx *
      → components/favpoll-card/types.ts
  → components/favpoll-summary-card.tsx *
      → components/closing-label.tsx  ↑
      → components/favpoll-card/favpoll-header.tsx *  ↑
      → components/favpoll-list-card/favpoll-list-card-charity-carousel.tsx  ↑
      → components/poll-heading.tsx *  ↑
      → components/ui/badge.tsx
      → packages/types/ *
  → components/landing/quiet-tail.tsx
  → components/page-layout.tsx
      → components/page-ground.tsx
      → components/shell-scroller.tsx
  → components/private-charity-page.tsx
      → components/page-layout.tsx  ↑
      → components/ui/section-eyebrow.tsx *
  → components/ui/section-eyebrow.tsx *  ↑
  → lib/appeals-admin.ts  (lib)
  → lib/charity-legal-name.ts  (lib)
  → lib/charity-profile-page.ts  (lib)
  → lib/display.ts  (lib)
  → lib/i18n.ts  (lib)
  → lib/supabase/admin.ts  (lib)
  → packages/types/ *  ↑
```

### `app/charities/page.tsx`

```
app/charities/page.tsx
  → lib/i18n.ts  (lib)
  → lib/supabase/admin.ts  (lib)
  → packages/types/ *
```

### `app/favpolls/[id]/display/page.tsx`

```
app/favpolls/[id]/display/page.tsx
```

### `app/favpolls/[id]/edit/page.tsx`

```
app/favpolls/[id]/edit/page.tsx
```

### `app/favpolls/[id]/keepsake/page.tsx`

```
app/favpolls/[id]/keepsake/page.tsx
  → components/keepsake/keepsake-document.tsx
      → components/bump-chart.tsx *  ↑
      → components/landing/hero-texture.tsx
  → components/keepsake/keepsake-view.tsx
      → components/keepsake/export-csv-button.tsx
          → components/ui/button.tsx *
      → components/keepsake/export-image-button.tsx
          → components/ui/button.tsx *  ↑
      → components/keepsake/keepsake-document.tsx  ↑
      → components/print-workspace/
          → components/ui/button.tsx *  ↑
          → components/ui/segmented-control.tsx *
          → components/ui/toolbar-band.tsx *
      → components/ui/button.tsx *  ↑
      → components/ui/segmented-control.tsx *  ↑
  → components/page-ground.tsx
  → components/register-scope.tsx
  → components/ui/button.tsx *  ↑
  → lib/display.ts  (lib)
  → lib/poll-title.ts  (lib)
  → lib/rank-history.ts  (lib)
  → lib/register-palette.ts  (lib)
  → lib/registers.ts  (lib)
  → lib/supabase/admin.ts  (lib)
  → lib/supabase/paginate.ts  (lib)
```

### `app/favpolls/[id]/live/page.tsx`

```
app/favpolls/[id]/live/page.tsx
```

### `app/favpolls/[id]/manage/page.tsx`

```
app/favpolls/[id]/manage/page.tsx
  → app/favpolls/[id]/manage/manage-client.tsx
      → components/branded-qr.tsx
      → components/bump-chart.tsx *  ↑
      → components/countdown.tsx *
          → components/favpoll-card/types.ts
          → components/ui/section-eyebrow.tsx *
      → components/guest-book.tsx *  ↑
      → components/manage/charity-rows.tsx
          → components/favpoll-flow/charity-step.tsx
              → components/ui/button.tsx *
              → components/ui/chip.tsx *  ↑
              → packages/types/ *
          → components/new-favpoll-wizard/wizard-charity-card.tsx *  ↑
          → components/ui/button.tsx *  ↑
          → components/ui/responsive-overlay.tsx *  ↑
          → packages/types/ *  ↑
      → components/manage/editable-row.tsx
          → components/favpoll-form/date-helpers.ts
          → components/favpoll-form/date-time-picker.tsx *  ↑
          → components/favpoll-form/edit-helpers.tsx  ↑
          → components/favpoll-form/goal-picker.tsx
              → components/new-favpoll-wizard/wizard-field.tsx  ↑
              → components/ui/button.tsx *  ↑
              → components/ui/input-group.tsx  ↑
          → components/manage/settings-rows.tsx  ↑
          → components/mention-textarea.tsx
              → components/ui/textarea.tsx
          → components/new-favpoll-wizard/wizard-field.tsx  ↑
          → components/ui/input-group.tsx  ↑
      → components/manage/favourites-row.tsx
          → components/favpoll-flow/topic-items-dialog.tsx
              → components/ui/button.tsx *  ↑
              → components/ui/chip.tsx *  ↑
              → components/ui/input-group.tsx  ↑
              → components/ui/responsive-overlay.tsx *  ↑
          → components/favpoll-flow/topic-step.tsx
              → components/favpoll-form/schema.ts
              → components/ui/button.tsx *  ↑
              → components/ui/chip.tsx *  ↑
              → packages/types/ *  ↑
          → components/favpoll-form/schema.ts  ↑
          → components/new-favpoll-wizard/wizard-topic-card.tsx *  ↑
          → components/ui/button.tsx *  ↑
          → components/ui/responsive-overlay.tsx *  ↑
          → packages/types/ *  ↑
      → components/manage/photo-row.tsx
          → components/favpoll-form/hero-photo-overlay.tsx  ↑
          → components/favpoll-form/schema.ts  ↑
          → components/manage/settings-rows.tsx  ↑
          → components/ui/button.tsx *  ↑
      → components/manage/pledges-over-time.tsx
          → components/ui/section-eyebrow.tsx *  ↑
      → components/manage/settings-rows.tsx  ↑
      → components/new-favpoll-wizard/wizard-placeholders.ts
      → components/organizer-row/utils.ts
      → components/ranking-list/
          → components/ranking-list/hide-toggle.tsx
          → components/ranking-list/use-ranking-items.ts
              → components/ranking-list/utils.ts
              → packages/types/ *  ↑
          → components/ranking-list/utils.ts  ↑
          → components/ui/ranking-bar.tsx *
          → packages/types/ *  ↑
      → components/ui/button.tsx *  ↑
      → components/ui/popover.tsx
      → components/ui/responsive-overlay.tsx *  ↑
      → components/ui/section-eyebrow.tsx *  ↑
      → components/ui/segmented-control.tsx *
      → components/ui/switch-line.tsx
          → components/ui/switch.tsx
      → components/ui/toolbar-band.tsx *
      → packages/types/ *  ↑
  → app/favpolls/new/wizard-data.ts
      → packages/types/ *  ↑
  → components/guest-book.tsx *
      → components/ui/responsive-overlay.tsx *  ↑
      → components/ui/section-eyebrow.tsx *  ↑
  → components/manage/pledges-over-time.tsx  ↑
  → components/page-ground.tsx
  → components/register-scope.tsx
  → lib/charity-consent.ts  (lib)
  → lib/favpoll-locks.ts  (lib)
  → lib/live-totals.ts  (lib)
  → lib/organizer-favpolls.ts  (lib)
  → lib/poll-standings.ts  (lib)
  → lib/rank-history.ts  (lib)
  → lib/register-palette.ts  (lib)
  → lib/supabase/admin.ts  (lib)
  → lib/supabase/paginate.ts  (lib)
  → packages/types/ *  ↑
```

### `app/favpolls/[id]/page.tsx`

```
app/favpolls/[id]/page.tsx
  → components/favpoll-content/
      → components/favpoll-content/mobile-charity-footer.tsx
          → components/favpoll-content/use-hide-on-scroll.ts
          → components/favpoll-list-card/favpoll-list-card-charity-carousel.tsx  ↑
          → components/goal-progress.tsx
          → packages/types/ *
      → components/favpoll-content/use-favpoll-content.ts
          → packages/types/ *  ↑
      → components/favpoll-sheet/
          → components/bump-chart.tsx *  ↑
          → components/cause-hero.tsx
              → components/favpoll-hero-avatar.tsx *
              → components/hero-layout.tsx
              → components/mention-text.tsx  ↑
              → components/ui/section-eyebrow.tsx *
              → packages/types/ *  ↑
          → components/countdown.tsx *
              → components/favpoll-card/types.ts
              → components/ui/section-eyebrow.tsx *  ↑
          → components/favpoll-hero.tsx *
              → components/heroes/base-favpoll-hero.tsx
              → packages/types/ *  ↑
          → components/favpoll-list-card/favpoll-list-card-charity-carousel.tsx  ↑
          → components/goal-progress.tsx  ↑
          → components/guest-book.tsx *  ↑
          → components/heroes/fundraiser-slots.tsx
              → components/ui/section-eyebrow.tsx *  ↑
          → components/page-layout.tsx  ↑
          → components/poll-section/ *
              → components/lock-card-content.tsx
              → components/poll-heading.tsx *  ↑
              → components/poll-section/empty-poll-alert.tsx *
              → components/poll-section/typed-note.tsx
              → components/poll-section/use-poll-section.ts
              → components/ranking-list/
              → components/standings-skeleton.tsx
              → components/ui/badge.tsx
              → components/ui/button.tsx *
              → components/ui/dropdown-menu.tsx
              → packages/types/ *  ↑
              → packages/ui/
          → components/shell-scroller.tsx
          → components/ui/responsive-overlay.tsx *  ↑
          → components/ui/section-eyebrow.tsx *  ↑
          → packages/types/ *  ↑
      → components/guest-book.tsx *  ↑
      → components/pledge-dialog/ *
          → components/pledge-dialog/step-amount.tsx
              → components/ui/button.tsx *  ↑
              → components/ui/input-group.tsx  ↑
              → components/ui/slider.tsx
              → components/ui/tabs.tsx
          → components/pledge-dialog/step-guest-book.tsx
              → components/ui/input.tsx *
              → components/ui/switch.tsx
          → components/pledge-dialog/step-pay.tsx
              → components/pledge-card/pledge-breakdown.tsx *
              → components/pledge-card/utils.ts
              → components/stripe-checkout.tsx
              → components/ui/button.tsx *  ↑
              → components/ui/input.tsx *  ↑
              → components/ui/switch.tsx  ↑
          → components/pledge-dialog/step-pick-favourites.tsx
              → components/ui/chip.tsx *  ↑
              → packages/types/ *  ↑
          → components/pledge-dialog/use-pledge-dialog.ts
              → components/pledge-card/use-pledge.ts
              → packages/types/ *  ↑
          → components/poll-heading.tsx *  ↑
          → components/ui/button.tsx *  ↑
          → components/ui/responsive-overlay.tsx *  ↑
          → packages/types/ *  ↑
      → packages/types/ *  ↑
  → components/favpoll-subheader.tsx
      → components/share-favpoll-button.tsx  ↑
      → components/ui/button.tsx *  ↑
  → components/register-scope.tsx
  → lib/charity-consent.ts  (lib)
  → lib/compare-labels.ts  (lib)
  → lib/og/favpoll-og-data.ts  (lib)
  → lib/og/favpoll-og.ts  (lib)
  → lib/picks-suspended.ts  (lib)
  → lib/poll-standings.ts  (lib)
  → lib/poll-title.ts  (lib)
  → lib/rank-history.ts  (lib)
  → lib/register-palette.ts  (lib)
  → lib/supabase/admin.ts  (lib)
  → lib/supabase/paginate.ts  (lib)
  → packages/types/ *  ↑
```

### `app/favpolls/[id]/stationery/page.tsx`

```
app/favpolls/[id]/stationery/page.tsx
  → components/page-ground.tsx
  → components/print-pack/pack-document.tsx
      → components/branded-qr.tsx
      → components/keepsake/export-image-button.tsx
          → components/ui/button.tsx *
      → components/print-pack/avery-sheet.tsx
          → components/print-pack/pack-card.tsx  ↑
          → components/print-pack/pack-sheet.tsx
              → components/print-pack/pack-card.tsx  ↑
      → components/print-pack/insert-card.tsx
          → components/branded-qr.tsx  ↑
          → components/favpoll-logo.tsx
          → components/print-pack/pack-card.tsx  ↑
      → components/print-pack/pack-card.tsx  ↑
      → components/print-pack/pack-sheet.tsx  ↑
      → components/print-workspace/
          → components/ui/button.tsx *  ↑
          → components/ui/segmented-control.tsx *
          → components/ui/toolbar-band.tsx *
      → components/ui/button-group.tsx
      → components/ui/button.tsx *  ↑
      → components/ui/dropdown-menu.tsx
      → components/ui/popover.tsx
      → components/ui/segmented-control.tsx *  ↑
      → components/ui/switch.tsx
  → components/print-pack/qr-export.tsx
      → components/branded-qr.tsx  ↑
      → components/ui/button.tsx *  ↑
      → components/ui/dropdown-menu.tsx  ↑
  → components/register-scope.tsx
  → components/ui/button.tsx *  ↑
  → lib/display.ts  (lib)
  → lib/register-palette.ts  (lib)
  → lib/supabase/admin.ts  (lib)
```

### `app/favpolls/new/page.tsx`

```
app/favpolls/new/page.tsx
  → app/favpolls/new/wizard-data.ts
      → packages/types/ *
  → components/new-favpoll-wizard/
      → components/favpoll-flow/charity-step.tsx
          → components/ui/button.tsx *
          → components/ui/chip.tsx *  ↑
          → packages/types/ *  ↑
      → components/favpoll-flow/event-step.tsx
          → components/register-link.tsx
          → components/ui/toggle-group.tsx
              → components/ui/toggle.tsx
          → packages/types/ *  ↑
      → components/favpoll-flow/topic-items-dialog.tsx
          → components/ui/button.tsx *  ↑
          → components/ui/chip.tsx *  ↑
          → components/ui/input-group.tsx  ↑
          → components/ui/responsive-overlay.tsx *  ↑
      → components/favpoll-flow/topic-step.tsx
          → components/favpoll-form/schema.ts
          → components/ui/button.tsx *  ↑
          → components/ui/chip.tsx *  ↑
          → packages/types/ *  ↑
      → components/favpoll-form/seed-fund-modal.tsx
          → components/stripe-checkout.tsx
              → components/checkout-form.tsx
          → components/ui/button.tsx *  ↑
          → components/ui/responsive-overlay.tsx *  ↑
      → components/new-favpoll-wizard/use-wizard-state.ts  ↑
      → components/new-favpoll-wizard/wizard-charity-card.tsx *  ↑
      → components/new-favpoll-wizard/wizard-details-step.tsx
          → components/favpoll-form/date-helpers.ts
          → components/favpoll-form/date-time-picker.tsx *  ↑
          → components/favpoll-form/goal-picker.tsx
              → components/new-favpoll-wizard/wizard-field.tsx  ↑
              → components/ui/button.tsx *  ↑
              → components/ui/input-group.tsx  ↑
          → components/new-favpoll-wizard/use-wizard-state.ts  ↑
          → components/new-favpoll-wizard/wizard-field.tsx  ↑
          → components/ui/segmented-control.tsx *
          → components/ui/switch-line.tsx
              → components/ui/switch.tsx
      → components/new-favpoll-wizard/wizard-info-step.tsx
          → components/favpoll-form/edit-helpers.tsx  ↑
          → components/favpoll-form/hero-photo-overlay.tsx  ↑
          → components/favpoll-form/schema.ts  ↑
          → components/new-favpoll-wizard/use-wizard-state.ts  ↑
          → components/new-favpoll-wizard/wizard-field.tsx  ↑
          → components/new-favpoll-wizard/wizard-placeholders.ts
          → components/ui/button.tsx *  ↑
          → components/ui/input-group.tsx  ↑
      → components/new-favpoll-wizard/wizard-nav.tsx *
          → components/ui/button.tsx *  ↑
      → components/new-favpoll-wizard/wizard-progress-strip.tsx *
          → components/new-favpoll-wizard/wizard-step-rail.tsx *  ↑
          → components/ui/button.tsx *  ↑
      → components/new-favpoll-wizard/wizard-step-rail.tsx *  ↑
      → components/new-favpoll-wizard/wizard-step-shell.tsx
      → components/new-favpoll-wizard/wizard-story-step.tsx
          → components/favpoll-form/edit-helpers.tsx  ↑
          → components/mention-textarea.tsx
              → components/ui/textarea.tsx
          → components/new-favpoll-wizard/use-wizard-state.ts  ↑
          → components/new-favpoll-wizard/wizard-field.tsx  ↑
          → components/new-favpoll-wizard/wizard-generate-button.tsx
              → components/icons/people.tsx
              → components/new-favpoll-wizard/use-wizard-state.ts  ↑
              → components/ui/button.tsx *  ↑
              → components/ui/dropdown-menu.tsx
          → components/new-favpoll-wizard/wizard-generate-help.tsx
              → components/icons/people.tsx  ↑
              → components/ui/button.tsx *  ↑
              → components/ui/popover.tsx
          → components/new-favpoll-wizard/wizard-placeholders.ts  ↑
          → components/ui/input-group.tsx  ↑
      → components/new-favpoll-wizard/wizard-topic-card.tsx *  ↑
      → components/register-scope.tsx
      → components/ui/button.tsx *  ↑
      → components/ui/input-group.tsx  ↑
      → components/ui/responsive-overlay.tsx *  ↑
      → packages/types/ *  ↑
  → lib/charity-consent.ts  (lib)
  → lib/supabase/admin.ts  (lib)
  → packages/types/ *  ↑
```

### `app/favpolls/page.tsx`

```
app/favpolls/page.tsx
  → app/favpolls/favpolls-list-client.tsx
      → app/favpolls/list-utils.ts
      → components/favpoll-list-card-empty.tsx *
          → components/favpoll-logo.tsx
          → components/new-favpoll-button.tsx
              → components/ui/button.tsx *
      → components/favpoll-list-card.tsx *
          → components/closing-label.tsx
          → components/favpoll-card/favpoll-header.tsx *
              → components/favpoll-card/types.ts
          → components/favpoll-card/types.ts  ↑
          → components/favpoll-hero-avatar.tsx *
          → components/favpoll-list-card/favpoll-list-card-charity-carousel.tsx  ↑
          → components/favpoll-list-card/favpoll-list-card-results.tsx
              → components/favpoll-card/poll-results.tsx
              → components/favpoll-list-card/use-favpoll-list-card-pledge.ts  ↑
          → components/favpoll-list-card/use-favpoll-list-card-pledge.ts  ↑
          → components/lock-card-content.tsx
          → components/mention-text.tsx  ↑
          → components/pledge-dialog/ *
              → components/pledge-dialog/step-amount.tsx
              → components/pledge-dialog/step-guest-book.tsx
              → components/pledge-dialog/step-pay.tsx
              → components/pledge-dialog/step-pick-favourites.tsx
              → components/pledge-dialog/use-pledge-dialog.ts
              → components/poll-heading.tsx *  ↑
              → components/ui/button.tsx *  ↑
              → components/ui/responsive-overlay.tsx *  ↑
              → packages/types/ *
          → components/poll-heading.tsx *  ↑
          → components/ui/badge.tsx
          → components/ui/button.tsx *  ↑
          → components/ui/tooltip.tsx
          → packages/types/ *  ↑
      → components/favpoll-list-card/use-favpoll-list-card-pledge.ts  ↑
      → components/list-controls.tsx  ↑
      → components/ui/toolbar-band.tsx *
  → app/favpolls/list-utils.ts  ↑
  → components/favpoll-list-card.tsx *  ↑
  → components/favpoll-list-card/use-favpoll-list-card-pledge.ts
  → components/new-favpoll-fab.tsx
      → components/new-favpoll-button.tsx  ↑
  → components/page-ground.tsx
  → components/ui/section-eyebrow.tsx *
  → lib/live-totals.ts  (lib)
  → lib/poll-standings.ts  (lib)
  → lib/poll-title.ts  (lib)
  → lib/supabase/admin.ts  (lib)
  → packages/types/ *  ↑
```

### `app/features/page.tsx`

```
app/features/page.tsx
  → components/landing/fade-in.tsx
  → components/landing/feature-nav.tsx
  → components/landing/fund-vignette.tsx
      → components/landing/vignette.tsx
      → components/ui/button.tsx *
  → components/landing/hero-texture.tsx
  → components/landing/keepsake-vignette.tsx
      → components/keepsake/keepsake-document.tsx  ↑
      → components/keepsake/keepsake-sheet.tsx
          → components/keepsake/keepsake-document.tsx  ↑
      → components/landing/demo-fixture.ts  ↑
      → components/landing/vignette.tsx  ↑
  → components/landing/live-vignette.tsx
      → components/hero-demo-panel/scenes.ts *
          → components/favpoll-card/types.ts
      → components/hero-demo-panel/tv-frame.tsx
      → components/landing/demo-fixture.ts  ↑
      → components/landing/display-still.tsx
          → components/hero-demo-panel/scene-favourites.ts
              → components/hero-demo-panel/scenes.ts *  ↑
              → packages/types/ *
          → components/hero-demo-panel/scenes.ts *  ↑
          → components/room-shell/  ↑
          → packages/types/ *  ↑
      → components/landing/vignette.tsx  ↑
  → components/landing/note-vignette.tsx
      → components/favpoll-card/poll-note.tsx *  ↑
      → components/hero-demo-panel/demo-card.tsx *  ↑
      → components/hero-demo-panel/phone-frame.tsx
      → components/hero-demo-panel/scenes.ts *  ↑
      → components/landing/demo-fixture.ts  ↑
      → components/landing/vignette.tsx  ↑
      → components/poll-heading.tsx *  ↑
  → components/landing/pack-vignette.tsx
      → components/landing/demo-fixture.ts  ↑
      → components/landing/vignette.tsx  ↑
      → components/print-pack/avery-sheet.tsx
          → components/print-pack/pack-card.tsx  ↑
          → components/print-pack/pack-sheet.tsx
              → components/print-pack/pack-card.tsx  ↑
      → components/print-pack/pack-card.tsx  ↑
      → components/print-pack/pack-sheet.tsx  ↑
  → components/landing/quiet-tail.tsx
  → components/landing/topic-picker-vignette.tsx
      → components/landing/vignette.tsx  ↑
      → components/poll-heading.tsx *  ↑
      → components/ui/button.tsx *  ↑
      → components/ui/chip.tsx *  ↑
      → components/ui/input-group.tsx  ↑
  → components/ui/button.tsx *  ↑
  → lib/i18n.ts  (lib)
```

### `app/fundraiser/page.tsx`

```
app/fundraiser/page.tsx
  → components/landing/demo-fixture.ts
      → components/hero-demo-panel/scenes.ts *
          → components/favpoll-card/types.ts
      → components/keepsake/keepsake-document.tsx  ↑
      → components/landing/topic-picker-vignette.tsx  ↑
      → components/print-pack/pack-card.tsx  ↑
  → components/landing/fold.tsx
  → components/landing/hero.tsx
      → components/hero-demo-panel/demo-card.tsx *  ↑
      → components/hero-demo-panel/demo-frame.tsx
      → components/hero-demo-panel/phone-frame.tsx
      → components/hero-demo-panel/scenes.ts *  ↑
      → components/landing/count-up.tsx
      → components/landing/hero-texture.tsx
      → components/landing/quiet-tail.tsx
      → components/landing/use-demo-loop.ts
          → components/hero-demo-panel/scenes.ts *  ↑
      → components/ui/button.tsx *
      → components/ui/ranking-bar.tsx *
  → components/landing/how-it-works-hints.tsx
      → components/charity-row.tsx *  ↑
      → components/hero-demo-panel/scenes.ts *  ↑
      → components/landing/demo-fixture.ts  ↑
      → components/pledge-card/pledge-breakdown.tsx *
      → components/ui/button.tsx *  ↑
      → components/ui/ranking-bar.tsx *  ↑
      → packages/types/ *
  → components/landing/how-it-works-steps.tsx
      → components/landing/how-it-works-hints.tsx  ↑
  → components/landing/ideas-section.tsx
      → components/ui/section-eyebrow.tsx *
  → components/landing/keepsake-vignette.tsx
      → components/keepsake/keepsake-document.tsx  ↑
      → components/keepsake/keepsake-sheet.tsx
          → components/keepsake/keepsake-document.tsx  ↑
      → components/landing/demo-fixture.ts  ↑
      → components/landing/vignette.tsx
  → components/landing/note-vignette.tsx
      → components/favpoll-card/poll-note.tsx *  ↑
      → components/hero-demo-panel/demo-card.tsx *  ↑
      → components/hero-demo-panel/phone-frame.tsx  ↑
      → components/hero-demo-panel/scenes.ts *  ↑
      → components/landing/demo-fixture.ts  ↑
      → components/landing/vignette.tsx  ↑
      → components/poll-heading.tsx *  ↑
  → components/landing/open-right-now.tsx
      → components/landing/fade-in.tsx
      → components/live-favpolls-carousel.tsx *
          → components/favpoll-summary-card.tsx *  ↑
          → components/ui/button.tsx *  ↑
      → components/ui/button.tsx *  ↑
      → components/ui/section-eyebrow.tsx *  ↑
  → components/landing/pro-section.tsx
      → components/ui/button.tsx *  ↑
  → components/landing/quiet-tail.tsx  ↑
  → components/landing/share-vignette.tsx
      → components/landing/vignette.tsx  ↑
      → components/share-favpoll-button.tsx  ↑
      → components/ui/button.tsx *  ↑
  → components/landing/topic-picker-vignette.tsx
      → components/landing/vignette.tsx  ↑
      → components/poll-heading.tsx *  ↑
      → components/ui/button.tsx *  ↑
      → components/ui/chip.tsx *  ↑
      → components/ui/input-group.tsx  ↑
  → components/register-scope.tsx
  → components/ui/button.tsx *  ↑
  → lib/i18n.ts  (lib)
  → lib/live-favpolls.ts  (lib)
```

### `app/layout.tsx`

```
app/layout.tsx
  → components/clerk-provider.tsx
  → components/header-mount.tsx
      → components/header.tsx
          → components/account-menu.tsx
              → components/ui/dropdown-menu.tsx
          → components/header-bar.tsx
              → components/favpoll-logo.tsx
          → components/register-link.tsx
          → components/ui/button.tsx *
          → packages/ui/
              → packages/ui/src/menu-button.tsx
              → packages/ui/src/theme-provider.tsx
  → components/site-footer-mount.tsx
      → components/landing/site-footer.tsx
          → components/favpoll-logo.tsx  ↑
  → components/skip-link.tsx
  → lib/og/site.ts  (lib)
  → lib/utils.ts  (lib)
  → packages/ui/  ↑
```

### `app/live/[slug]/page.tsx`

```
app/live/[slug]/page.tsx
  → components/register-scope.tsx
  → components/room-shell/
      → components/branded-qr.tsx
      → components/favpoll-logo.tsx
      → components/favpoll-sheet/
          → components/bump-chart.tsx *  ↑
          → components/cause-hero.tsx
              → components/favpoll-hero-avatar.tsx *
              → components/hero-layout.tsx
              → components/mention-text.tsx  ↑
              → components/ui/section-eyebrow.tsx *
              → packages/types/ *
          → components/countdown.tsx *
              → components/favpoll-card/types.ts
              → components/ui/section-eyebrow.tsx *  ↑
          → components/favpoll-hero.tsx *
              → components/heroes/base-favpoll-hero.tsx
              → packages/types/ *  ↑
          → components/favpoll-list-card/favpoll-list-card-charity-carousel.tsx  ↑
          → components/goal-progress.tsx
          → components/guest-book.tsx *  ↑
          → components/heroes/fundraiser-slots.tsx
              → components/ui/section-eyebrow.tsx *  ↑
          → components/page-layout.tsx  ↑
          → components/poll-section/ *
              → components/lock-card-content.tsx
              → components/poll-heading.tsx *  ↑
              → components/poll-section/empty-poll-alert.tsx *
              → components/poll-section/typed-note.tsx
              → components/poll-section/use-poll-section.ts
              → components/ranking-list/
              → components/standings-skeleton.tsx
              → components/ui/badge.tsx
              → components/ui/button.tsx *
              → components/ui/dropdown-menu.tsx
              → packages/types/ *  ↑
              → packages/ui/
          → components/shell-scroller.tsx
          → components/ui/responsive-overlay.tsx *  ↑
          → components/ui/section-eyebrow.tsx *  ↑
          → packages/types/ *  ↑
      → components/guest-book.tsx *  ↑
      → components/room-shell/display-chrome.tsx
          → components/room-shell/  ↑
          → components/ui/button.tsx *  ↑
          → components/ui/dropdown-menu.tsx  ↑
          → packages/ui/  ↑
      → components/room-shell/podium.tsx
          → components/landing/hero-texture.tsx
          → packages/types/ *  ↑
      → packages/types/ *  ↑
  → lib/compare-labels.ts  (lib)
  → lib/picks-suspended.ts  (lib)
  → lib/poll-items.ts  (lib)
  → lib/poll-standings.ts  (lib)
  → lib/poll-title.ts  (lib)
  → lib/register-palette.ts  (lib)
  → lib/registers.ts  (lib)
  → lib/supabase/admin.ts  (lib)
  → lib/supabase/paginate.ts  (lib)
  → packages/types/ *  ↑
```

### `app/memorial/page.tsx`

```
app/memorial/page.tsx
  → components/landing/demo-fixture.ts
      → components/hero-demo-panel/scenes.ts *
          → components/favpoll-card/types.ts
      → components/keepsake/keepsake-document.tsx  ↑
      → components/landing/topic-picker-vignette.tsx  ↑
      → components/print-pack/pack-card.tsx  ↑
  → components/landing/fold.tsx
  → components/landing/hero.tsx
      → components/hero-demo-panel/demo-card.tsx *  ↑
      → components/hero-demo-panel/demo-frame.tsx
      → components/hero-demo-panel/phone-frame.tsx
      → components/hero-demo-panel/scenes.ts *  ↑
      → components/landing/count-up.tsx
      → components/landing/hero-texture.tsx
      → components/landing/quiet-tail.tsx
      → components/landing/use-demo-loop.ts
          → components/hero-demo-panel/scenes.ts *  ↑
      → components/ui/button.tsx *
      → components/ui/ranking-bar.tsx *
  → components/landing/how-it-works-steps.tsx
      → components/landing/how-it-works-hints.tsx  ↑
  → components/landing/ideas-section.tsx
      → components/ui/section-eyebrow.tsx *
  → components/landing/keepsake-vignette.tsx
      → components/keepsake/keepsake-document.tsx  ↑
      → components/keepsake/keepsake-sheet.tsx
          → components/keepsake/keepsake-document.tsx  ↑
      → components/landing/demo-fixture.ts  ↑
      → components/landing/vignette.tsx
  → components/landing/live-vignette.tsx
      → components/hero-demo-panel/scenes.ts *  ↑
      → components/hero-demo-panel/tv-frame.tsx
      → components/landing/demo-fixture.ts  ↑
      → components/landing/display-still.tsx
          → components/hero-demo-panel/scene-favourites.ts
              → components/hero-demo-panel/scenes.ts *  ↑
              → packages/types/ *
          → components/hero-demo-panel/scenes.ts *  ↑
          → components/room-shell/  ↑
          → packages/types/ *  ↑
      → components/landing/vignette.tsx  ↑
  → components/landing/note-vignette.tsx
      → components/favpoll-card/poll-note.tsx *  ↑
      → components/hero-demo-panel/demo-card.tsx *  ↑
      → components/hero-demo-panel/phone-frame.tsx  ↑
      → components/hero-demo-panel/scenes.ts *  ↑
      → components/landing/demo-fixture.ts  ↑
      → components/landing/vignette.tsx  ↑
      → components/poll-heading.tsx *  ↑
  → components/landing/open-right-now.tsx
      → components/landing/fade-in.tsx
      → components/live-favpolls-carousel.tsx *
          → components/favpoll-summary-card.tsx *  ↑
          → components/ui/button.tsx *  ↑
      → components/ui/button.tsx *  ↑
      → components/ui/section-eyebrow.tsx *  ↑
  → components/landing/order-of-service-vignette.tsx
      → components/landing/demo-fixture.ts  ↑
      → components/landing/vignette.tsx  ↑
      → components/print-pack/insert-card.tsx
          → components/branded-qr.tsx
          → components/favpoll-logo.tsx
          → components/print-pack/pack-card.tsx  ↑
  → components/landing/pro-section.tsx
      → components/ui/button.tsx *  ↑
  → components/landing/quiet-tail.tsx  ↑
  → components/register-scope.tsx
  → components/ui/button.tsx *  ↑
  → lib/i18n.ts  (lib)
  → lib/live-favpolls.ts  (lib)
```

### `app/my-favpolls/page.tsx`

```
app/my-favpolls/page.tsx
  → app/my-favpolls/organizer-page-client.tsx
      → components/list-controls.tsx  ↑
      → components/organizer-row/console-row.tsx
          → components/organizer-row/utils.ts
          → components/ui/button.tsx *
          → components/ui/tooltip.tsx
          → packages/types/ *
      → components/organizer-row/utils.ts  ↑
      → components/ui/toolbar-band.tsx *
  → components/new-favpoll-button.tsx
      → components/ui/button.tsx *  ↑
  → components/new-favpoll-fab.tsx
      → components/new-favpoll-button.tsx  ↑
  → components/page-ground.tsx
  → lib/live-totals.ts  (lib)
  → lib/organizer-favpolls.ts  (lib)
  → lib/supabase/admin.ts  (lib)
```

### `app/p/[code]/page.tsx`

```
app/p/[code]/page.tsx
  → lib/supabase/admin.ts  (lib)
```

### `app/page.tsx`

```
app/page.tsx
  → components/landing/capability-grid.tsx
      → components/ui/section-eyebrow.tsx *
  → components/landing/fade-in.tsx
  → components/landing/hero-texture.tsx
  → components/landing/open-right-now.tsx
      → components/landing/fade-in.tsx  ↑
      → components/live-favpolls-carousel.tsx *
          → components/favpoll-summary-card.tsx *  ↑
          → components/ui/button.tsx *
      → components/ui/button.tsx *  ↑
      → components/ui/section-eyebrow.tsx *  ↑
  → components/landing/process-overview.tsx
      → components/hero-demo-panel/demo-card.tsx *  ↑
      → components/hero-demo-panel/phone-frame.tsx
      → components/hero-demo-panel/scenes.ts *
          → components/favpoll-card/types.ts
      → components/hero-demo-panel/tv-frame.tsx
      → components/keepsake/keepsake-sheet.tsx
          → components/keepsake/keepsake-document.tsx  ↑
      → components/landing/demo-fixture.ts  ↑
      → components/landing/display-still.tsx
          → components/hero-demo-panel/scene-favourites.ts
              → components/hero-demo-panel/scenes.ts *  ↑
              → packages/types/ *
          → components/hero-demo-panel/scenes.ts *  ↑
          → components/room-shell/  ↑
          → packages/types/ *  ↑
      → components/landing/wizard-vignettes.tsx
          → components/favpoll-flow/event-step.tsx
              → components/register-link.tsx
              → components/ui/toggle-group.tsx
              → packages/types/ *  ↑
          → components/hero-demo-panel/demo-frame.tsx
          → components/hero-demo-panel/scenes.ts *  ↑
          → components/new-favpoll-wizard/wizard-charity-card.tsx *  ↑
          → components/new-favpoll-wizard/wizard-field.tsx  ↑
          → components/new-favpoll-wizard/wizard-nav.tsx *
              → components/ui/button.tsx *  ↑
          → components/new-favpoll-wizard/wizard-step-rail.tsx *  ↑
          → components/new-favpoll-wizard/wizard-step-shell.tsx
          → components/new-favpoll-wizard/wizard-topic-card.tsx *  ↑
          → components/ui/button.tsx *  ↑
          → components/ui/input.tsx *
          → components/ui/textarea.tsx
          → packages/types/ *  ↑
      → components/print-pack/pack-card.tsx  ↑
      → components/register-link.tsx  ↑
      → components/ui/button.tsx *  ↑
      → components/ui/section-eyebrow.tsx *  ↑
  → components/landing/quiet-tail.tsx
  → components/landing/record-flow.tsx
  → components/landing/rotating-register-hero.tsx
      → components/landing/demo-fixture.ts  ↑
      → components/landing/hero.tsx  ↑
      → components/ui/button.tsx *  ↑
  → components/ui/button.tsx *  ↑
  → lib/i18n.ts  (lib)
  → lib/live-favpolls.ts  (lib)
```

### `app/pledges/withdraw/page.tsx`

```
app/pledges/withdraw/page.tsx
  → app/pledges/withdraw/actions.ts  (server action)
  → components/ui/button.tsx *
  → lib/i18n.ts  (lib)
  → lib/supabase/admin.ts  (lib)
```

### `app/privacy/page.tsx`

```
app/privacy/page.tsx
```

### `app/record/page.tsx`

```
app/record/page.tsx
  → app/record/record-client.tsx
      → components/favpoll-card/poll-results.tsx
          → components/favpoll-card/types.ts
          → components/ui/ranking-bar.tsx *
      → components/list-controls.tsx  ↑
      → components/new-favpoll-fab.tsx
          → components/new-favpoll-button.tsx
              → components/ui/button.tsx *
      → components/page-ground.tsx
      → components/poll-heading.tsx *  ↑
      → components/ui/chip.tsx *  ↑
      → packages/types/ *
  → lib/supabase/admin.ts  (lib)
  → packages/types/ *  ↑
```

### `app/sign-in/[[...sign-in]]/page.tsx`

```
app/sign-in/[[...sign-in]]/page.tsx
  → components/auth-shell.tsx
```

### `app/sign-in/layout.tsx`

```
app/sign-in/layout.tsx
```

### `app/sign-up/[[...sign-up]]/page.tsx`

```
app/sign-up/[[...sign-up]]/page.tsx
  → components/auth-shell.tsx
```

### `app/sign-up/layout.tsx`

```
app/sign-up/layout.tsx
```

### `app/terms/page.tsx`

```
app/terms/page.tsx
```

### `app/topics/[id]/page.tsx`

```
app/topics/[id]/page.tsx
  → app/topics/[id]/topic-rankings.tsx
      → components/poll-heading.tsx *  ↑
      → components/ui/button.tsx *
      → components/ui/ranking-bar.tsx *
      → components/ui/tabs.tsx
      → packages/types/ *
  → components/page-layout.tsx
      → components/page-ground.tsx
      → components/shell-scroller.tsx
  → components/topic-chart-card.tsx
      → components/bump-chart.tsx *  ↑
      → components/ui/responsive-overlay.tsx *  ↑
  → components/ui/button.tsx *  ↑
  → lib/i18n.ts  (lib)
  → lib/rank-history.ts  (lib)
  → lib/record.ts  (lib)
  → lib/subset-record.ts  (lib)
  → lib/supabase/admin.ts  (lib)
  → lib/supabase/paginate.ts  (lib)
  → packages/types/ *  ↑
```

---

## Shared subtrees

Components with three or more production importers, expanded once.

### `components/landing/demo-fixture.ts` — used by 12

```
components/landing/demo-fixture.ts
  → components/hero-demo-panel/scenes.ts *
      → components/favpoll-card/types.ts
  → components/keepsake/keepsake-document.tsx  ↑
  → components/landing/topic-picker-vignette.tsx  ↑
  → components/print-pack/pack-card.tsx  ↑
```

### `components/ui/responsive-overlay.tsx` — used by 12

```
components/ui/responsive-overlay.tsx *
  → components/ui/button.tsx *
  → components/ui/dialog.tsx
  → components/ui/sheet.tsx
      → components/ui/button.tsx *  ↑
```

### `components/ui/input-group.tsx` — used by 11

```
components/ui/input-group.tsx
  → components/ui/button.tsx *
  → components/ui/input.tsx *
  → components/ui/textarea.tsx
```

### `components/poll-heading.tsx` — used by 10

```
components/poll-heading.tsx *
  → components/favpoll-card/types.ts
  → components/ui/button.tsx *
```

### `components/new-favpoll-wizard/wizard-field.tsx` — used by 8

```
components/new-favpoll-wizard/wizard-field.tsx
  → components/ui/button.tsx *
  → components/ui/popover.tsx
```

### `components/print-pack/pack-card.tsx` — used by 8

```
components/print-pack/pack-card.tsx
  → components/branded-qr.tsx
```

### `components/ui/chip.tsx` — used by 8

```
components/ui/chip.tsx *
  → components/ui/button.tsx *
```

### `components/favpoll-form/edit-helpers.tsx` — used by 5

```
components/favpoll-form/edit-helpers.tsx
  → components/ui/button.tsx *
```

### `components/guest-book.tsx` — used by 5

```
components/guest-book.tsx *
  → components/ui/responsive-overlay.tsx *  ↑
  → components/ui/section-eyebrow.tsx *
```

### `components/keepsake/keepsake-document.tsx` — used by 5

```
components/keepsake/keepsake-document.tsx
  → components/bump-chart.tsx *  ↑
  → components/landing/hero-texture.tsx
```

### `components/mention-text.tsx` — used by 5

```
components/mention-text.tsx
```

### `components/new-favpoll-wizard/use-wizard-state.ts` — used by 5

```
components/new-favpoll-wizard/use-wizard-state.ts
  → components/favpoll-form/schema.ts
  → packages/types/ *
```

### `components/page-layout.tsx` — used by 5

```
components/page-layout.tsx
  → components/page-ground.tsx
  → components/shell-scroller.tsx
```

### `components/bump-chart.tsx` — used by 4

```
components/bump-chart.tsx *
  → components/ui/section-eyebrow.tsx *
```

### `components/favpoll-list-card/favpoll-list-card-charity-carousel.tsx` — used by 4

```
components/favpoll-list-card/favpoll-list-card-charity-carousel.tsx
  → components/charity-row.tsx *  ↑
  → components/favpoll-card/types.ts
  → packages/types/ *
```

### `components/favpoll-list-card/use-favpoll-list-card-pledge.ts` — used by 4

```
components/favpoll-list-card/use-favpoll-list-card-pledge.ts
```

### `components/landing/hero.tsx` — used by 4

```
components/landing/hero.tsx
  → components/hero-demo-panel/demo-card.tsx *  ↑
  → components/hero-demo-panel/demo-frame.tsx
  → components/hero-demo-panel/phone-frame.tsx
  → components/hero-demo-panel/scenes.ts *
      → components/favpoll-card/types.ts
  → components/landing/count-up.tsx
  → components/landing/hero-texture.tsx
  → components/landing/quiet-tail.tsx
  → components/landing/use-demo-loop.ts
      → components/hero-demo-panel/scenes.ts *  ↑
  → components/ui/button.tsx *
  → components/ui/ranking-bar.tsx *
```

### `components/landing/keepsake-vignette.tsx` — used by 4

```
components/landing/keepsake-vignette.tsx
  → components/keepsake/keepsake-document.tsx  ↑
  → components/keepsake/keepsake-sheet.tsx
      → components/keepsake/keepsake-document.tsx  ↑
  → components/landing/demo-fixture.ts  ↑
  → components/landing/vignette.tsx
```

### `components/landing/note-vignette.tsx` — used by 4

```
components/landing/note-vignette.tsx
  → components/favpoll-card/poll-note.tsx *  ↑
  → components/hero-demo-panel/demo-card.tsx *  ↑
  → components/hero-demo-panel/phone-frame.tsx
  → components/hero-demo-panel/scenes.ts *
      → components/favpoll-card/types.ts
  → components/landing/demo-fixture.ts  ↑
  → components/landing/vignette.tsx
  → components/poll-heading.tsx *  ↑
```

### `components/landing/open-right-now.tsx` — used by 4

```
components/landing/open-right-now.tsx
  → components/landing/fade-in.tsx
  → components/live-favpolls-carousel.tsx *
      → components/favpoll-summary-card.tsx *  ↑
      → components/ui/button.tsx *
  → components/ui/button.tsx *  ↑
  → components/ui/section-eyebrow.tsx *
```

### `components/charity-row.tsx` — used by 3

```
components/charity-row.tsx *
  → components/favpoll-card/types.ts
  → packages/types/ *
```

### `components/favpoll-card/poll-note.tsx` — used by 3

```
components/favpoll-card/poll-note.tsx *
  → components/mention-text.tsx  ↑
```

### `components/favpoll-form/date-time-picker.tsx` — used by 3

```
components/favpoll-form/date-time-picker.tsx *
  → components/favpoll-form/constants.ts
  → components/ui/button.tsx *
  → components/ui/calendar.tsx
      → components/ui/button.tsx *  ↑
  → components/ui/card.tsx *
  → components/ui/input-group.tsx  ↑
  → components/ui/popover.tsx
  → components/ui/responsive-overlay.tsx *  ↑
```

### `components/favpoll-form/hero-photo-overlay.tsx` — used by 3

```
components/favpoll-form/hero-photo-overlay.tsx
  → components/favpoll-form/edit-helpers.tsx  ↑
  → components/favpoll-form/schema.ts
  → components/favpoll-hero-avatar.tsx *
  → components/ui/button.tsx *
  → components/ui/input-group.tsx  ↑
  → components/ui/responsive-overlay.tsx *  ↑
```

### `components/favpoll-summary-card.tsx` — used by 3

```
components/favpoll-summary-card.tsx *
  → components/closing-label.tsx
  → components/favpoll-card/favpoll-header.tsx *
      → components/favpoll-card/types.ts
  → components/favpoll-list-card/favpoll-list-card-charity-carousel.tsx  ↑
  → components/poll-heading.tsx *  ↑
  → components/ui/badge.tsx
  → packages/types/ *
```

### `components/hero-demo-panel/demo-card.tsx` — used by 3

```
components/hero-demo-panel/demo-card.tsx *
  → components/charity-row.tsx *  ↑
  → components/favpoll-card/poll-note.tsx *  ↑
  → components/favpoll-hero-avatar.tsx *
  → components/favpoll-logo.tsx
  → components/goal-progress.tsx
  → components/hero-demo-panel/phone-frame.tsx
  → components/hero-demo-panel/scenes.ts *
      → components/favpoll-card/types.ts
  → components/hero-demo-panel/variants.ts
  → components/landing/hero-texture.tsx
  → components/lock-card-content.tsx
  → components/pledge-dialog/step-amount.tsx
      → components/ui/button.tsx *
      → components/ui/input-group.tsx  ↑
      → components/ui/slider.tsx
      → components/ui/tabs.tsx
  → components/pledge-dialog/step-pick-favourites.tsx
      → components/ui/chip.tsx *  ↑
      → packages/types/ *
  → components/poll-heading.tsx *  ↑
  → components/standings-skeleton.tsx
  → components/ui/button.tsx *  ↑
  → components/ui/chip.tsx *  ↑
  → components/ui/ranking-bar.tsx *
  → components/ui/section-eyebrow.tsx *
  → packages/types/ *  ↑
```

### `components/landing/how-it-works-hints.tsx` — used by 3

```
components/landing/how-it-works-hints.tsx
  → components/charity-row.tsx *  ↑
  → components/hero-demo-panel/scenes.ts *
      → components/favpoll-card/types.ts
  → components/landing/demo-fixture.ts  ↑
  → components/pledge-card/pledge-breakdown.tsx *
  → components/ui/button.tsx *
  → components/ui/ranking-bar.tsx *
  → packages/types/ *
```

### `components/landing/ideas-section.tsx` — used by 3

```
components/landing/ideas-section.tsx
  → components/ui/section-eyebrow.tsx *
```

### `components/landing/live-vignette.tsx` — used by 3

```
components/landing/live-vignette.tsx
  → components/hero-demo-panel/scenes.ts *
      → components/favpoll-card/types.ts
  → components/hero-demo-panel/tv-frame.tsx
  → components/landing/demo-fixture.ts  ↑
  → components/landing/display-still.tsx
      → components/hero-demo-panel/scene-favourites.ts
          → components/hero-demo-panel/scenes.ts *  ↑
          → packages/types/ *
      → components/hero-demo-panel/scenes.ts *  ↑
      → components/room-shell/  ↑
      → packages/types/ *  ↑
  → components/landing/vignette.tsx
```

### `components/landing/topic-picker-vignette.tsx` — used by 3

```
components/landing/topic-picker-vignette.tsx
  → components/landing/vignette.tsx
  → components/poll-heading.tsx *  ↑
  → components/ui/button.tsx *
  → components/ui/chip.tsx *  ↑
  → components/ui/input-group.tsx  ↑
```

### `components/list-controls.tsx` — used by 3

```
components/list-controls.tsx
  → components/ui/input.tsx *
  → components/ui/segmented-control.tsx *
```

### `components/manage/settings-rows.tsx` — used by 3

```
components/manage/settings-rows.tsx
  → components/new-favpoll-wizard/wizard-field.tsx  ↑
  → components/new-favpoll-wizard/wizard-step-shell.tsx
```

### `components/new-favpoll-wizard/wizard-charity-card.tsx` — used by 3

```
components/new-favpoll-wizard/wizard-charity-card.tsx *
  → components/ui/button.tsx *
  → packages/types/ *
```

### `components/new-favpoll-wizard/wizard-step-rail.tsx` — used by 3

```
components/new-favpoll-wizard/wizard-step-rail.tsx *
  → components/ui/button.tsx *
```

### `components/new-favpoll-wizard/wizard-topic-card.tsx` — used by 3

```
components/new-favpoll-wizard/wizard-topic-card.tsx *
  → components/favpoll-form/schema.ts
  → components/poll-heading.tsx *  ↑
  → components/ui/button.tsx *
  → components/ui/chip.tsx *  ↑
  → packages/types/ *
```

### `components/room-shell/index.tsx` — used by 3

```
components/room-shell/
  → components/branded-qr.tsx
  → components/favpoll-logo.tsx
  → components/favpoll-sheet/
      → components/bump-chart.tsx *  ↑
      → components/cause-hero.tsx
          → components/favpoll-hero-avatar.tsx *
          → components/hero-layout.tsx
              → components/favpoll-logo.tsx  ↑
              → components/shell-scroller.tsx
          → components/mention-text.tsx  ↑
          → components/ui/section-eyebrow.tsx *
          → packages/types/ *
      → components/countdown.tsx *
          → components/favpoll-card/types.ts
          → components/ui/section-eyebrow.tsx *  ↑
      → components/favpoll-hero.tsx *
          → components/heroes/base-favpoll-hero.tsx
              → components/favpoll-hero-avatar.tsx *  ↑
              → components/hero-layout.tsx  ↑
              → components/mention-text.tsx  ↑
              → components/ui/section-eyebrow.tsx *  ↑
              → packages/types/ *  ↑
          → packages/types/ *  ↑
      → components/favpoll-list-card/favpoll-list-card-charity-carousel.tsx  ↑
      → components/goal-progress.tsx
      → components/guest-book.tsx *  ↑
      → components/heroes/fundraiser-slots.tsx
          → components/ui/section-eyebrow.tsx *  ↑
      → components/page-layout.tsx  ↑
      → components/poll-section/ *
          → components/lock-card-content.tsx
          → components/poll-heading.tsx *  ↑
          → components/poll-section/empty-poll-alert.tsx *
              → components/ui/alert.tsx
          → components/poll-section/typed-note.tsx
              → components/favpoll-card/poll-note.tsx *  ↑
              → components/mention-text.tsx  ↑
          → components/poll-section/use-poll-section.ts
          → components/ranking-list/
              → components/ranking-list/hide-toggle.tsx
              → components/ranking-list/use-ranking-items.ts
              → components/ranking-list/utils.ts
              → components/ui/ranking-bar.tsx *
              → packages/types/ *  ↑
          → components/standings-skeleton.tsx
          → components/ui/badge.tsx
          → components/ui/button.tsx *
          → components/ui/dropdown-menu.tsx
          → packages/types/ *  ↑
          → packages/ui/
              → packages/ui/src/menu-button.tsx
              → packages/ui/src/theme-provider.tsx
      → components/shell-scroller.tsx  ↑
      → components/ui/responsive-overlay.tsx *  ↑
      → components/ui/section-eyebrow.tsx *  ↑
      → packages/types/ *  ↑
  → components/guest-book.tsx *  ↑
  → components/room-shell/display-chrome.tsx
      → components/room-shell/  ↑
      → components/ui/button.tsx *  ↑
      → components/ui/dropdown-menu.tsx  ↑
      → packages/ui/  ↑
  → components/room-shell/podium.tsx
      → components/landing/hero-texture.tsx
      → packages/types/ *  ↑
  → packages/types/ *  ↑
```

### `components/share-favpoll-button.tsx` — used by 3

```
components/share-favpoll-button.tsx
  → components/ui/button.tsx *
```

---

## UI primitives (`components/ui/`)

```
components/ui/alert.tsx  ← 1
components/ui/badge.tsx  ← 3
components/ui/button-group.tsx  ← 1
components/ui/button.tsx *  ← 74
components/ui/calendar.tsx  ← 1
components/ui/card.tsx *  ← 1
components/ui/chip.tsx *  ← 8
components/ui/dialog.tsx  ← 1
components/ui/dropdown-menu.tsx  ← 6
components/ui/input-group.tsx  ← 11
components/ui/input.tsx *  ← 6
components/ui/label.tsx  ← 1
components/ui/popover.tsx  ← 5
components/ui/ranking-bar.tsx *  ← 6
components/ui/responsive-overlay.tsx *  ← 12
components/ui/section-eyebrow.tsx *  ← 21
components/ui/segmented-control.tsx *  ← 6
components/ui/sheet.tsx  ← 1
components/ui/slider.tsx  ← 1
components/ui/switch-line.tsx  ← 2
components/ui/switch.tsx  ← 5
components/ui/tabs.tsx  ← 2
components/ui/textarea.tsx  ← 5
components/ui/toggle-group.tsx  ← 1
components/ui/toggle.tsx  ← 1
components/ui/toolbar-band.tsx *  ← 4
components/ui/tooltip.tsx  ← 2
```

---

## Unused in production ⚠

(none)

