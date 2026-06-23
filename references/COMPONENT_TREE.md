# Component Tree

Rebuilt 2026-06-23 from source. Replaces the pre-ubiquitous-language-rename snapshot.

## Legend

```
→  renders / imports
*  Storybook story exists
⚠  unused in production (no non-story importers)
```

---

## `app/layout.tsx` — Root layout

```
app/layout.tsx
  → clerk-provider.tsx  (ClerkProvider)
      → @clerk/nextjs/ClerkProvider
  → @favpoll/ui/ThemeProvider
  → lib/edit-mode-context.tsx  (EditModeProvider)
  → header.tsx  (Header)
      → favpoll-logo.tsx  (FavpollLogo)
      → user-button-client.tsx  (UserButtonClient)  — lazy dynamic import, no SSR
      → @favpoll/ui/MenuButton  (Moon/Sun theme toggle)
      → ui/button.tsx *
      → new-favpoll-button.tsx  (NewFavpollButton)  — redirects signed-out users to /sign-in
  → sonner/Toaster  (position="bottom-center")
```

---

## Entry points

### `app/page.tsx` — Home

Server component. Queries `favpolls` (is_private=false, not closed, limit 6) via `createAdminClient`.

```
app/page.tsx
  → hero-demo-panel/index.tsx  (HeroDemoPanel)
      → hero-demo-panel/hero-pitch-column.tsx  (HeroPitchColumn)
      → hero-demo-panel/demo-card.tsx  (DemoCard)
          → ui/button.tsx *
          → ui/ranking-bar.tsx *
          → ui/reveal-quote.tsx *
      → ui/chip.tsx *
  → live-favpolls-carousel.tsx  (LiveFavpollsCarousel)  — Embla carousel with Autoplay
      → favpoll-summary-card.tsx  (FavpollSummaryCard)
          → favpoll-card/favpoll-header.tsx  (FavpollHeader) *
          → favpoll-card/section-label.tsx  (SectionLabel) *
          → favpoll-list-card/favpoll-list-card-charity-carousel.tsx  (FavpollListCardCharityCarousel)
          → closing-label.tsx  (ClosingLabel)
      → ui/button.tsx
  → ui/button.tsx *
  → ui/section-eyebrow.tsx *
```

---

### `app/favpolls/page.tsx` — Live favpolls list

Server component with `auth()` for pledge detection. Queries favpolls with poll results.

```
app/favpolls/page.tsx
  → ui/section-eyebrow.tsx *
  → favpoll-list-card.tsx  (FavpollListCard) *  — one per favpoll
      → favpoll-card/favpoll-header.tsx  (FavpollHeader) *
      → favpoll-card/section-label.tsx  (SectionLabel) *
      → ui/tooltip-icon-button.tsx *
      → pledge-dialog/index.tsx  (PledgeDialog) *  — see PledgeDialog subtree
      → favpoll-list-card/favpoll-list-card-results.tsx  (FavpollListCardResults)
          → favpoll-card/poll-results.tsx  (PollResults)
      → favpoll-list-card/favpoll-list-card-charity-carousel.tsx  (FavpollListCardCharityCarousel)
      → ui/button.tsx
  → favpoll-list-card-empty.tsx  (FavpollListCardEmpty) *  — when list is empty
      → ui/button.tsx
```

---

### `app/favpolls/new/page.tsx` — New favpoll wizard

Server component. Fetches charities, topics, categories, charity_topics via `getWizardData()`.

```
app/favpolls/new/page.tsx
  → new-favpoll-wizard/index.tsx  (NewFavpollWizard)
      → new-favpoll-wizard/use-wizard-state.ts  (useWizardState)  — all wizard state + routing
      → new-favpoll-wizard/wizard-triad-rail.tsx  (WizardTriadRail) *  — desktop left column
      → new-favpoll-wizard/wizard-progress-strip.tsx  (WizardProgressStrip) *  — mobile <ol>
      → new-favpoll-wizard/wizard-step-shell.tsx  (WizardStepShell)  — title + guidance wrapper
      → new-favpoll-wizard/wizard-nav.tsx  (WizardNav) *  — Back + Next/Set-up buttons
      → new-favpoll-wizard/wizard-charity-card.tsx  (WizardCharityCard) *  — selected charity receipt
      → new-favpoll-wizard/wizard-topic-card.tsx  (WizardTopicCard) *  — selected topic + item chips
      → favpoll-flow/honour-step.tsx  (HonourStep)  — step 1: subject/category/grouping/causeLabel
      → favpoll-flow/charity-step.tsx  (CharityStep)  — step 2: charity chip grid
      → favpoll-flow/love-step.tsx  (LoveStep)  — step 3: topic chip grid + suggestions
      → favpoll-flow/topic-items-dialog.tsx  (TopicItemsDialog)  — search + add items sheet
      → ui/responsive-overlay.tsx *  — charity + love overlays (search input in header prop)
      → ui/button.tsx
```

---

### `app/favpolls/new/details/page.tsx` — Create favpoll form

Server component. Reached from wizard with query params pre-populating form values.

```
app/favpolls/new/details/page.tsx
  → favpoll-form/index.tsx  (FavpollForm)  — create mode
      [see FavpollForm subtree]
```

---

### `app/favpolls/[id]/page.tsx` — Favpoll guest/edit page

Server component with `auth()`. Queries favpoll + poll + charities + pot. Redirects on 404.

```
app/favpolls/[id]/page.tsx
  → favpoll-content/index.tsx  (FavpollContent)
      → favpoll-content/use-favpoll-content.ts  (useFavpollContent)  — hook
      → favpoll-hero.tsx  (FavpollHero) *  — when subject='someone'
          → heroes/base-favpoll-hero.tsx  (BaseFavpollHero)
              → hero-layout.tsx  (HeroLayout)  — Framer Motion scroll animations
              → favpoll-hero-avatar.tsx  (ProtagonistAvatar) *  — photo or hatched initials circle
              → ui/section-eyebrow.tsx
      → cause-hero.tsx  (CauseHero)  — when subject='cause'; shows getFavpollHeadline + cause_label
          → ui/section-eyebrow.tsx
      → countdown.tsx  (Countdown) *
      → ui/section-eyebrow.tsx
      → charity-banner.tsx  (CharityBanner) *
          → charity-row.tsx  (CharityRow) *
      → poll-section/index.tsx  (PollSection) *
          → poll-section/use-poll-section.ts  (usePollSection)  — hook; fires onViewChange on transitions
          → poll-heading.tsx  (PollHeading) *
              → favpoll-card/section-label.tsx  (SectionLabel)
              → favpoll-card/poll-reveal.tsx  (PollReveal) *  — purple-tinted reveal card post-pledge
              → ui/tooltip-icon-button.tsx *
          → ranking-list/index.tsx  (RankingList)
              → ranking-list/hide-toggle.tsx  (HideToggle)
              → ranking-list/use-ranking-items.ts  (useRankingItems)
              → ui/ranking-bar.tsx *
          → poll-section/empty-poll-alert.tsx  (EmptyPollAlert) *  — amber alert when all items hidden
          → ui/tabs.tsx
      → pledge-dialog/index.tsx  (PledgeDialog) *  — see PledgeDialog subtree
      → favpoll-form/seed-fund-modal.tsx  (SeedFundModal)  — guest variant="guest"; "Help others take part"
      → favpoll-list-card/favpoll-list-card-charity-carousel.tsx  (FavpollListCardCharityCarousel)
          — fixed bottom mobile charity strip
      → page-layout.tsx  (PageLayout)
      → ui/button.tsx
  → favpoll-subheader.tsx  (FavpollSubheader)  — organiser edit/share controls
      → ui/button.tsx
```

---

### `app/favpolls/[id]/edit/page.tsx` — Edit favpoll form

Server component. Queries existing favpoll data to pre-fill form.

```
app/favpolls/[id]/edit/page.tsx
  → favpoll-form/index.tsx  (FavpollForm)  — edit mode
      [see FavpollForm subtree; SeedFundModal not rendered in edit mode;
       EditableCountdown shows live Countdown with CloseDateOverlay affordance;
       CommandPanel shows Occasion/Charity/Topic as editable overlays]
```

---

### `app/favpolls/[id]/display/page.tsx` — Live display screen

Server component. Renders full-screen projector view.

```
app/favpolls/[id]/display/page.tsx
  → display-screen/index.tsx  (DisplayScreen) *
      → display-screen/display-poll-section.tsx  (DisplayPollSection)
          → display-screen/display-ranking-row.tsx  (DisplayRankingRow)
      → ranking-list/use-ranking-items.ts  (useRankingItems)
          — real-time Supabase subscription (channel per favpoll poll)
      → ui/ranking-bar.tsx
      → QRCodeSVG  (qrcode.react)
```

---

### `app/my-favpolls/page.tsx` — Organiser management surface

Server component with `auth()`. Queries organiser's favpolls with full management data.

```
app/my-favpolls/page.tsx
  → new-favpoll-button.tsx  (NewFavpollButton)
  → app/my-favpolls/organizer-page-client.tsx  (OrganizerPageClient)
      — client: filter (All/Active/Closed) + sort (Closing soonest/Recently created/Highest raised)
      → organizer-card/index.tsx  (OrganizerCard)  — one per favpoll
          → favpoll-card/favpoll-header.tsx  (FavpollHeader)
          → favpoll-card/section-label.tsx  (SectionLabel)
          → ui/button.tsx
          → ui/switch.tsx  — Listed/Unlisted toggle (calls setFavpollListed)
          → QRCodeSVG  (qrcode.react)
      → ui/button.tsx
```

---

### `app/rankings/page.tsx` — Global all-time rankings

Server component. Queries all categories, topics, and favourites.

```
app/rankings/page.tsx
  → app/rankings/rankings-client.tsx  (RankingsClient)
      → ui/chip.tsx
      → favpoll-card/section-label.tsx  (SectionLabel)
      → favpoll-card/poll-results.tsx  (PollResults)
```

---

### `app/topics/[id]/page.tsx` — Individual topic rankings

Server component. Queries topic + all favourites for that topic.

```
app/topics/[id]/page.tsx
  → page-layout.tsx  (PageLayout)
  → ui/button.tsx
  → app/topics/[id]/topic-rankings.tsx  (TopicRankings)
      → ui/tabs.tsx
      → ui/ranking-bar.tsx
      → favpoll-card/section-label.tsx  (SectionLabel)
      → ui/button.tsx
```

---

### `app/pledges/withdraw/page.tsx` — Guest pledge withdrawal

Server component. Validates token then calls withdrawPledge action.

```
app/pledges/withdraw/page.tsx
  → ui/button.tsx
```

---

### `app/landing-v2/page.tsx` — Alternative landing page

Server component. Animated Venn hero + six-step how-it-works + CTA.

```
app/landing-v2/page.tsx
  → landing-v2/how-it-works.tsx  (HowItWorks)
      → landing-v2/how-it-works-step1-preview.tsx  (Step1Preview)
      → landing-v2/how-it-works-step2-preview.tsx  (Step2Preview)
      → landing-v2/how-it-works-step3-preview.tsx  (Step3Preview)
      → landing-v2/how-it-works-step4-preview.tsx  (Step4Preview)
      → landing-v2/how-it-works-step5-preview.tsx  (Step5Preview)
      → landing-v2/how-it-works-step6-preview.tsx  (Step6Preview)
      — step previews use landing-v2/how-it-works-preview-card.tsx  (PreviewCard)
  → landing-v2/occasion-eyebrow.tsx  (OccasionEyebrow)  — cycles occasion names every 2.8s
  → landing-v2/honour-charity-love-venn.tsx  (HonourCharityLoveVenn) *
      — three rotating SVG rings; baked path coords, no FavpollMarkGlyph import
  → ui/button.tsx
  → ui/section-eyebrow.tsx
```

---

## Shared subtrees

### `FavpollForm` (favpoll-form/index.tsx)

Used by `app/favpolls/new/details/page.tsx` (create) and `app/favpolls/[id]/edit/page.tsx` (edit).

```
FavpollForm  (favpoll-form/index.tsx)
  → favpoll-form/form-inner.tsx  (FormInner)  — layout, generation logic, session storage hydration
      → favpoll-form/command-panel.tsx  (CommandPanel)
          — floating fixed bottom-4 right-4 w-72 desktop; full-width bottom bar mobile
          → favpoll-form/close-date-overlay.tsx  (CloseDateOverlay)  — create mode: Publish overlay
              → favpoll-form/date-time-picker.tsx  (DateTimePicker) *
                  → ui/calendar.tsx
                  → ui/popover.tsx
                  → ui/card.tsx
                  → ui/input-group.tsx
          → favpoll-flow/honour-step.tsx  (HonourStep)  — edit mode: Occasion overlay
          → favpoll-flow/charity-step.tsx  (CharityStep)  — edit mode: Charity overlay
          → favpoll-flow/love-step.tsx  (LoveStep)  — edit mode: Topic overlay
          → favpoll-flow/topic-items-dialog.tsx  (TopicItemsDialog)  — edit mode
          → ui/responsive-overlay.tsx
          → ui/button.tsx
          → ui/switch.tsx  — Listed/Unlisted toggle
      → favpoll-form/preview-panel.tsx  (PreviewPanel)  — ~90-line coordinator
          → favpoll-form/editable-hero.tsx  (EditableHero) *
              — thin orchestrator; delegates all editing to overlay sub-components
              → favpoll-form/hero-name-overlay.tsx  (HeroNameOverlay)
              → favpoll-form/hero-context-overlay.tsx  (HeroContextOverlay)
              → favpoll-form/hero-cause-label-overlay.tsx  (HeroCauseLabelOverlay)
              → favpoll-form/hero-opening-line-overlay.tsx  (HeroOpeningLineOverlay)
              → favpoll-form/hero-about-overlay.tsx  (HeroAboutOverlay)
              → favpoll-form/hero-photo-overlay.tsx  (HeroPhotoOverlay)
                  — Cropper (react-easy-crop) + getCroppedBlob canvas utility; 3-phase flow
              → favpoll-hero-avatar.tsx  (ProtagonistAvatar) *
              → editable-field.tsx  (EditableField)
              → ui/section-eyebrow.tsx
              → ui/button.tsx
          → favpoll-form/editable-poll-area.tsx  (EditablePollArea) *
              — poll topic label, reveal toggle, reveal overlay, pledge/results preview
              → pledge-panel.tsx  (PledgePanel)  — organiser form preview only
                  → pledge-panel-picker-header.tsx  (PledgePanelPickerHeader)
                  → pledge-panel-picker-items.tsx  (PledgePanelPickerItems)
                  → ui/chip.tsx
                  → ui/button.tsx
                  → ui/input-group.tsx
                  → ui/responsive-overlay.tsx
              → favpoll-card/poll-results.tsx  (PollResults)
              → favpoll-card/section-label.tsx  (SectionLabel)
              → ui/responsive-overlay.tsx
              → ui/tabs.tsx
              → ui/switch.tsx
              → ui/button.tsx
              → ui/tooltip-icon-button.tsx
          → favpoll-form/editable-countdown.tsx  (EditableCountdown) *
              → countdown.tsx  (Countdown) *
              → favpoll-form/close-date-overlay.tsx  (CloseDateOverlay)  — edit mode only
          → charity-banner.tsx  (CharityBanner) *
              → charity-row.tsx  (CharityRow) *
  → favpoll-form/seed-fund-modal.tsx  (SeedFundModal)  — create mode only, post-publish
      → stripe-checkout.tsx  (StripeCheckout)  — inline prop (no overlay wrapper)
          → checkout-form.tsx  (CheckoutForm)  — must render inside Stripe Elements provider
      → ui/responsive-overlay.tsx  — hideCloseButton; no × button
      → ui/button.tsx
      → ui/switch.tsx
  → ui/form.tsx  (Form)
```

---

### `PledgeDialog` (pledge-dialog/index.tsx)

Used by `favpoll-list-card.tsx` (listing card) and `favpoll-content/index.tsx` (favpoll page). Self-contained trigger + 3-step `ResponsiveOverlay`.

```
PledgeDialog *
  → pledge-dialog/use-pledge-dialog.ts  (usePledgeDialog)
      → pledge-card/use-pledge.ts  (usePledge)
      → computePledgeAllocations  (pledge-panel.tsx)
  → pledge-dialog/step-pick-favourites.tsx
      PickerHeader  — chip + search field in overlay header prop (inline)
      PickerItems   — chip grid; Chip per favourite (inline)
  → pledge-dialog/step-amount.tsx
      StepAmountHeader  — rendered in overlay header prop (inline)
      StepAmount  — AmountInput + breakdown + funding path (card/shared-fund tabs) (inline)
          → pledge-card/pledge-breakdown.tsx  (PledgeBreakdown) *
          → ui/input-group.tsx
          → ui/tabs.tsx
          → ui/button.tsx
  → pledge-dialog/step-pay.tsx  (StepPay)  — step 3
      → stripe-checkout.tsx  (StripeCheckout)
          → checkout-form.tsx  (CheckoutForm)
  → pledge-dialog/step-indicator.tsx  (StepIndicator)  ⚠ extracted but never imported — dead code
  → ui/responsive-overlay.tsx  — Sheet mobile / Dialog desktop
  → ui/button.tsx
```

---

## UI primitives (`components/ui/`)

| Component | Used by (production) | Story |
|-----------|----------------------|-------|
| `alert` | `poll-section/empty-poll-alert` | — |
| `button` | throughout | ✓ |
| `calendar` | `favpoll-form/date-time-picker`, `favpoll-form/close-date-overlay` | — |
| `card` | `favpoll-form/date-time-picker` | ✓ |
| `chip` | `pledge-panel`, `pledge-dialog/step-pick-favourites`, `favpoll-flow/love-step`, `favpoll-flow/charity-step`, `new-favpoll-wizard/wizard-topic-card`, `hero-demo-panel`, `rankings-client` | ✓ |
| `dialog` | `ui/responsive-overlay` (desktop path) | — |
| `field` | `ui/form` | ✓ |
| `form` | `favpoll-form/index` | — |
| `input` | `favpoll-form/editable-hero` (border-stripped in header prop) | ✓ |
| `input-group` | `pledge-panel`, `pledge-dialog/step-amount`, `favpoll-form/date-time-picker` | — |
| `label` | `ui/form`, `ui/field` | — |
| `occasion-tag` | ⚠ unused in production | ✓ |
| `popover` | `favpoll-form/date-time-picker` | — |
| `ranking-bar` | `ranking-list`, `display-screen`, `hero-demo-panel/demo-card`, `app/topics/[id]/topic-rankings` | ✓ |
| `responsive-overlay` | `pledge-dialog`, `favpoll-form/*`, `favpoll-flow/*`, `pledge-panel` | ✓ |
| `reveal-quote` | `hero-demo-panel/demo-card` | ✓ |
| `section-eyebrow` | `app/page`, `app/favpolls/page`, `favpoll-content`, `cause-hero`, `heroes/base-favpoll-hero`, `favpoll-form/editable-hero`, `app/landing-v2/page` | ✓ |
| `separator` | (shadcn composition only) | — |
| `sheet` | `ui/responsive-overlay` (mobile path) | — |
| `switch` | `favpoll-form/editable-poll-area`, `favpoll-form/command-panel`, `favpoll-form/seed-fund-modal`, `organizer-card` | — |
| `tabs` | `poll-section`, `app/topics/[id]/topic-rankings`, `pledge-dialog/step-amount`, `favpoll-form/editable-poll-area` | — |
| `textarea` | `favpoll-form/editable-hero`, `favpoll-form/editable-poll-area` (border-stripped in header prop) | — |
| `toggle` | `ui/toggle-group` (internal) | — |
| `toggle-group` | `favpoll-flow/honour-step` (subject + category rows) | — |
| `tooltip` | `ui/tooltip-icon-button` | — |
| `tooltip-icon-button` | `favpoll-list-card`, `poll-heading`, `favpoll-form/editable-poll-area` | ✓ |

---

## `favpoll-card/` — Shared poll rendering primitives

These are standalone rendering primitives, not a self-contained card. They are imported individually by multiple consumers.

| Component | Used in production by |
|-----------|----------------------|
| `favpoll-header.tsx`  (FavpollHeader) | `favpoll-list-card`, `favpoll-summary-card`, `organizer-card` |
| `poll-reveal.tsx`  (PollReveal) | `poll-heading` |
| `poll-results.tsx`  (PollResults) | `favpoll-form/editable-poll-area`, `favpoll-list-card/favpoll-list-card-results`, `app/rankings/rankings-client` |
| `section-label.tsx`  (SectionLabel) | `favpoll-list-card`, `favpoll-summary-card`, `organizer-card`, `poll-heading`, `favpoll-form/editable-poll-area`, `app/rankings/rankings-client`, `app/topics/[id]/topic-rankings` |

Stories exist in `components/favpoll-card/stories/` for `favpoll-header`, `poll-reveal`, and `section-label`.

---

## `pledge-card/` — Partially active subsystem

The hooks and utilities in this directory are still in use; the rendered components are not.

| File | Status |
|------|--------|
| `use-pledge.ts`  (usePledge) | ✓ Used by `pledge-dialog/use-pledge-dialog.ts` |
| `utils.ts`  (GBP, FUND_GREEN/AMBER/RED, formatCharityLabel) | ✓ Used by `pledge-dialog/step-amount.tsx` |
| `pledge-breakdown.tsx`  (PledgeBreakdown) | ✓ Used by `pledge-dialog/step-amount.tsx` |
| `index.tsx`  (PledgeCard) | ⚠ No production importers — superseded by PledgeDialog |
| `pledge-card-wrapper.tsx`  (PledgeCardWrapper) | ⚠ No production importers — re-exported from index |
| `live-pledge-card.tsx`  (LivePledgeCard) | ⚠ No production importers — re-exported from index |
| `preview-pledge-card.tsx`  (PreviewPledgeCard) | ⚠ No production importers — composed in index |
| `amount-input.tsx`  (AmountInput) | ⚠ No production importers — amount input is now inline in step-amount |
| `amount-presets.tsx`  (AmountPresets) | ⚠ No production importers — presets are now inline in step-amount |

---

## Unused in production ⚠

Components with no non-story, non-test importers:

| Component | Reason |
|-----------|--------|
| `ui/occasion-tag.tsx` | No production importers found |
| `honour-charity-love-venn.tsx` (root-level) | Superseded by `landing-v2/honour-charity-love-venn.tsx`; `landing-v2/page.tsx` imports the scoped variant |
| `landing-v2/favpoll-mark.tsx` | `landing-v2/honour-charity-love-venn.tsx` embeds its own paths inline; this file is never imported |
| `pledge-card/index.tsx` (`PledgeCard`) | Superseded by `PledgeDialog`; no importers outside the pledge-card directory |
| `pledge-card/pledge-card-wrapper.tsx` | No importers outside pledge-card directory |
| `pledge-card/live-pledge-card.tsx` | No importers outside pledge-card directory |
| `pledge-card/preview-pledge-card.tsx` | No importers outside pledge-card directory |
| `pledge-card/amount-input.tsx` | Amount input now inline in `pledge-dialog/step-amount.tsx` |
| `pledge-card/amount-presets.tsx` | Presets now inline in `pledge-dialog/step-amount.tsx` |

Deleted in this PR (confirmed zero importers, safe to remove):
- `components/favpoll-form/photo-crop-modal.tsx` — crop logic moved inline to `editable-hero.tsx`
- `components/live-display-section.tsx` — manage page retired; OrganizerCard carries the live display link

> `FavpollMark` (default export of `components/favpoll-mark.tsx`) has no non-story importers; `FavpollMarkGlyph` from the same file is used by the root-level `honour-charity-love-venn.tsx`. Both could be deleted alongside that venn, but this is deferred.
