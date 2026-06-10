# favpoll — Project Document

## What is favpoll?

favpoll is a charitable polling platform for life events — memorials, funerals, birthdays, retirements, weddings, and more. An organiser creates an event honouring a person, selects one or more charities, picks a poll topic (favourite colour, favourite biscuit, etc.), and shares a link with guests. Guests pledge real money against their favourite options. The rankings update in real time. All proceeds go to the chosen charities.

Every pledge also feeds a permanent all-time universal ranking of human favourites — a collectively funded, financially weighted record of what people love most, built through acts of generosity.

---

## The Core Idea

- **Events** honour a person (protagonist) on a specific occasion
- **Topics** are canonical questions — Colour, Season, Biscuit, Film, etc.
- **Event polls** activate a topic within an event, with an optional personal reveal (shown after pledging). The reveal is the sole mechanic for disclosing the protagonist's favourite — no hint line is shown before pledging.
- **Pledges** are financial commitments against specific topic items, contributing to both the event ranking and the all-time universal ranking
- **Pledge allocations** split a single pledge across multiple items (e.g. 60% Purple, 40% Blue)
- **Shared fund** allows generous donors to top up a communal pot so others (e.g. children) can participate without paying

---

## Stack

- **Monorepo:** pnpm workspace — `apps/web` (Next.js main app), `apps/admin` (Next.js admin panel), `packages/types` (shared domain types as `@favpoll/types`)
- **Framework:** Next.js 15, App Router, TypeScript
- **UI:** shadcn/ui with Base UI (preset b0), Tailwind 4, Lucide icons, Framer Motion, Embla Carousel
- **Component catalogue:** Storybook (`@storybook/nextjs-vite`), co-located `.stories.tsx` files
- **Auth:** Clerk (`@clerk/nextjs`) — login is optional for guests. Admin app requires `publicMetadata.role === 'admin'` on the Clerk user.
- **Database:** Supabase (Postgres + Realtime). Production and staging are separate projects.
- **Payments:** Stripe (marketplace model — favpoll collects, disburses to charities via Stripe Connect Express). Connect application submitted, pending approval.
- **Image cropping:** react-easy-crop (photo crop modal, circular 1:1, JPEG output)
- **Email:** Resend
- **Package manager:** pnpm (workspace root; run all commands from root or with `--filter`)
- **Hosting:** Vercel (Pro Trial team `favpoll`). Two projects: `favpoll-web` and `favpoll-admin`.
- **Domain:** favpoll.com (holding page live; main app deployed at `favpoll-web-gamma.vercel.app` until domain is switched)
- **CI:** GitHub Actions (`.github/workflows/ci.yml`) — Test, Typecheck, and Format jobs on push/PR to main. Format job runs `pnpm --filter @favpoll/web exec prettier --check .` (must run from apps/web — prettier is only installed there)
- **Branch:** `main` (renamed from `master`)
- **Localisation:** UK-first (`en-GB`). `messages/en-GB.json` holds UI strings. `lib/i18n.ts` provides `formatCurrency()`, `t()`, and `MARKET_DEFAULTS`. `next-intl` planned when a second market launches.

---

## Environments

| Environment   | Web URL                      | Admin URL                 | Supabase                       | Clerk                           |
| ------------- | ---------------------------- | ------------------------- | ------------------------------ | ------------------------------- |
| Production    | favpoll-web-gamma.vercel.app | [admin vercel URL]        | production project             | pk*test* keys until domain swap |
| Preview (PRs) | auto-generated vercel URL    | auto-generated vercel URL | staging (eotqyintgusvzidymumb) | pk*test* keys                   |
| Development   | localhost:3000               | localhost:3001            | production or staging          | pk*test* keys                   |

Production Clerk instance is configured with Google OAuth and ready — using dev keys temporarily until `favpoll.com` points at the app.

---

## Database Schema

```sql
users (
  id text primary key,              -- Clerk user ID
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz,
  updated_at timestamptz
)

charities (
  id uuid primary key,
  name text not null,
  description text,
  logo_url text,
  registered_number text,
  is_active boolean not null default true,
  market text not null default 'en-GB',
  created_at timestamptz
)

categories (
  id uuid primary key,
  label text not null,              -- Nature, Music, Film & TV, etc.
  description text,
  created_at timestamptz
)

topics (
  id uuid primary key,
  title text not null,              -- Short title, no "Favourite" prefix: "Colour", "Season"
  description text,
  is_finite boolean default false,
  is_active boolean not null default true,
  placeholders jsonb default '{}',  -- Keyed about+reveal pairs by register: { remembering, celebrating_one, celebrating_many, cause, neutral }
  created_by text references users(id),
  created_at timestamptz
)

topic_categories (
  topic_id uuid references topics(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (topic_id, category_id)
)

topic_items (
  id uuid primary key,
  topic_id uuid references topics(id) on delete cascade,
  label text not null,
  all_time_pledged numeric default 0,
  all_time_count integer default 0,
  is_canonical boolean default true,
  source text default 'seed',       -- 'seed' | 'organiser' | 'guest'
  markets text[] not null default array['en-GB'],
  event_count integer default 0,
  total_pledge_count integer default 0,
  display_order integer,            -- null = alphabetical; set only for finite topics
  review_status text,               -- 'pending_review' | 'accepted' | 'rejected' | null (null for seed items)
  rejection_reason text,
  reviewed_at timestamptz,
  reviewed_by text,                 -- Clerk user ID of admin who reviewed
  created_at timestamptz
)

protagonists (
  id uuid primary key,
  name text not null,
  context text,                     -- e.g. "1940 – 2024", "Turning 35"
  about text,
  photo_url text,
  created_by text references users(id),
  created_at timestamptz
)

events (
  id uuid primary key,
  protagonist_id uuid references protagonists(id),
  occasion_type text,               -- Legacy: free-text occasion. Kept for backward compat; superseded by event_category.
  event_category text               -- 'celebration' | 'memorial' | 'fundraiser'. Nullable for legacy rows. register is derived via deriveRegister(event_category, event_grouping).
    CHECK (event_category IN ('celebration','memorial','fundraiser')),
  event_grouping text not null default 'individual'
    CHECK (event_grouping IN ('individual','couple','group')),
  opening_line text,
  market text not null default 'en-GB',
  created_by text references users(id),
  description text,
  closes_at timestamptz not null,
  is_private boolean default false,
  closed_at timestamptz,
  total_raised numeric default 0,
  extension_count integer default 0,
  original_closes_at timestamptz,
  hard_close_at timestamptz,        -- created_at + 90 days, immutable
  is_listed boolean not null default true,  -- discoverability only; false = URL-accessible but not on /events
  created_at timestamptz
)

event_charities (
  id uuid primary key,
  event_id uuid references events(id) on delete cascade,
  charity_id uuid references charities(id),
  display_order integer default 0,
  created_at timestamptz
)

event_polls (
  id uuid primary key,
  event_id uuid references events(id) on delete cascade,  -- UNIQUE(event_id) enforced
  topic_id uuid references topics(id),
  personal_framing text,            -- Retired; column kept but app no longer reads or writes it
  personal_reveal text,             -- Disclosed after pledging
  created_at timestamptz
)

event_poll_items (
  id uuid primary key,
  event_poll_id uuid references event_polls(id) on delete cascade,
  topic_item_id uuid references topic_items(id),
  is_guest_added boolean default false,
  is_hidden boolean default false,   -- Organiser can hide guest-added items from results
  hidden_at timestamptz,
  hidden_by text,                    -- Clerk user ID of organiser who hid it
  added_by text references users(id),
  created_at timestamptz
)

pledges (
  id uuid primary key,
  event_poll_id uuid references event_polls(id) on delete cascade,
  clerk_user_id text,
  guest_email text,
  guest_token uuid,
  pot_allocation_id uuid,
  total_amount numeric not null check (total_amount > 0),
  fee numeric not null default 0,
  withdrawn_at timestamptz,
  created_at timestamptz,
  constraint pledges_identity_check check (
    clerk_user_id is not null or guest_email is not null
  )
)

pledge_allocations (
  id uuid primary key,
  pledge_id uuid references pledges(id) on delete cascade,
  topic_item_id uuid references topic_items(id),
  amount numeric not null check (amount > 0)
)

event_pots (
  id uuid primary key,
  event_id uuid references events(id) on delete cascade,
  created_by text references users(id),
  total_deposited numeric not null,
  total_allocated numeric default 0,
  created_at timestamptz
)

pot_allocations (
  id uuid primary key,
  pot_id uuid references event_pots(id) on delete cascade,
  allocated_to text references users(id),
  amount numeric not null,
  created_at timestamptz
)

event_invites (
  id uuid primary key,
  event_id uuid references events(id) on delete cascade,
  email text not null,
  created_at timestamptz
)

item_flags (
  id uuid primary key,
  topic_item_id uuid references topic_items(id) on delete cascade,
  clerk_user_id text references users(id),
  reason text,
  created_at timestamptz
)
```

---

## Migrations (applied)

```
20260518000000_ubiquitous_language.sql
20260522000000_rename_protagonist_bio_to_about.sql
20260523000000_enforce_single_poll_per_event.sql
20260523120000_guest_item_moderation.sql
20260524000000_charity_management.sql
20260526000000_remove_event_poll_item_priority.sql
20260527000000_rename_date_label_to_context.sql        -- protagonists.date_label → context
20260527000001_rename_occasion_label_to_opening_line.sql  -- events.occasion_label → opening_line
20260527000002_restore_topic_item_display_order.sql    -- topic_items.display_order integer nullable
20260604000000_fix_review_status_pending.sql           -- corrects review_status 'pending' → 'pending_review' for existing rows
20260604120000_add_guest_pledge_columns.sql            -- guest_email, guest_token, withdrawn_at, pot_allocation_id on pledges; re-adds pledges_identity_check
20260607140000_derive_register.sql                     -- backfills occasion_type from register, then drops events.register column
20260609000000_add_is_listed.sql                       -- ADD COLUMN is_listed boolean NOT NULL DEFAULT true
20260609120000_add_event_category_grouping.sql         -- ADD COLUMN event_category + event_grouping; backfill from occasion_type/is_plural
```

---

## Registers and Occasion Types

`register` is a **code-only concept** — never stored in the DB. It is derived at runtime via `deriveRegister(category, grouping)` in `apps/web/lib/registers.ts`.

```typescript
type Register =
  | "remembering" // memorial
  | "celebrating_one" // celebration + individual
  | "celebrating_many" // celebration + couple or group
  | "cause" // fundraiser
  | "neutral"; // category is null

export type EventCategory = "celebration" | "memorial" | "fundraiser";
export type EventGrouping = "individual" | "couple" | "group";
```

### `deriveRegister(category: EventCategory | null, grouping: EventGrouping): Register`

Pure function in `lib/registers.ts`:

| category    | grouping        | register         |
| ----------- | --------------- | ---------------- |
| null        | any             | neutral          |
| memorial    | any             | remembering      |
| fundraiser  | any             | cause            |
| celebration | individual      | celebrating_one  |
| celebration | couple or group | celebrating_many |

### HONOUR step — category + grouping are the inputs

The Honour step shows 3 category chips (Celebration / Memorial / Fundraiser) and a grouping segmented control (An individual / A couple / A group). Selecting Fundraiser hides the grouping control and resets grouping to "individual". `register` is derived deterministically and set in the form via `form.setValue("register", deriveRegister(cat, grp))`.

`is_listed` is auto-set to `false` when `deriveRegister` returns `"remembering"`.

### Legacy: `registerForOccasionType(occasionType)` and `occasion_type`

Kept internally for the backfill and any legacy read paths. `occasion_type` column remains on `events` and is nullable. New events write `event_category` + `event_grouping`; `occasion_type` is left null. `effectiveRegister` and `DEFAULT_OCCASION_TYPE` exports are removed.

### Display headline prefixes (from `lib/display.ts`)

```
remembering      → 'In memory of'
celebrating_one  → 'Celebrating'
celebrating_many → 'Celebrating'
cause            → 'In support of'
neutral          → 'Honouring'
```

### Default poll closing period (`suggestClosingDate(category, eventDate?)` in `lib/registers.ts`)

| EventCategory | Days until close |
| ------------- | ---------------- |
| memorial      | 30               |
| celebration   | 14               |
| fundraiser    | 14               |
| null          | 14               |

---

## Topic Types

### Finite (`is_finite = true`) — fixed list, no guest additions

Colour, Season, Day of the week, Meal of the day, Time of day, Decade

### Infinite (`is_finite = false`) — open list

Organiser can pin/reorder (not remove) items. Guests can suggest additions.
Guest-added items land with `source = 'guest'`, `is_canonical = false`,
`review_status = 'pending_review'`. Admin reviews at `apps/admin/app/contributions/`.

---

## Application Routes

### apps/web

```
/                              -- Home: HeroDemoPanel + live events carousel (bg-primary/5) + CTA
/landing-v2                    -- Alternate landing page: animated Venn hero + six-step how-it-works + CTA
/events                        -- Live events grid (public, no auth)
/events/new                    -- New event wizard (3-step page: Honour → Love → Charity)
/events/new/details            -- Create event form (EventFormV2); reached from wizard with pre-populated query params
/events/[id]                   -- Event page — guest pledge view + edit mode toggle
/events/[id]/edit              -- Edit event (EventFormV2)
/events/[id]/manage            -- Management panel (organiser only)
/events/[id]/display           -- Live display for projector screen
/my-events                     -- Organiser's created events (auth required)
/rankings                      -- Global all-time rankings
/topics/[id]                   -- Individual topic rankings
/pledges/withdraw              -- Guest pledge withdrawal via token
/sign-in, /sign-up             -- Clerk auth pages

API:
/api/cron/close-events         -- Vercel cron (hourly), closes expired events
/api/stripe/payment-intent     -- Creates Stripe PaymentIntent for pledge checkout
/api/webhooks/clerk            -- Clerk user sync webhook
/api/events/[id]/request-extension -- Sends extension request email to admin
/api/polls/[pollId]/results    -- Ranked pledge totals for a poll (admin client)
NOTE: /api/exemplar removed (PR-B) — example pane replaced by grey placeholder preview
```

### apps/admin

```
/placeholders                  -- Topic placeholder editor (about + reveal per occasion)
/placeholders/[topicId]        -- Per-topic editor
/contributions                 -- Guest item review queue (pending/accepted/rejected)
/charities                     -- Charity management (add/edit/deactivate)
/events                        -- Event oversight (shell only — not yet built)
/access-denied                 -- Shown to authenticated non-admin users
```

---

## Key Files

### apps/web

```
app/
├── layout.tsx
├── page.tsx
├── events/
│   ├── page.tsx
│   ├── actions.ts
│   ├── new/page.tsx, actions.ts, wizard-data.ts
│   └── details/page.tsx
│   └── [id]/
│       ├── page.tsx
│       ├── actions.ts
│       ├── display/page.tsx
│       ├── edit/page.tsx, actions.ts
│       └── manage/page.tsx
├── my-events/page.tsx
├── rankings/page.tsx
├── topics/[id]/page.tsx
└── api/
    ├── cron/close-events/route.ts
    ├── stripe/payment-intent/route.ts
    ├── webhooks/clerk/route.ts
    ├── events/[id]/request-extension/route.ts
    └── polls/[id]/results/route.ts

components/
├── ui/
│   ├── button.tsx, card.tsx, input.tsx, field.tsx
│   ├── chip.tsx                  -- Selectable pill toggle; min-w-0 shrink whitespace-normal to allow truncation
│   ├── sheet.tsx                 -- shadcn Sheet (SlideOver drawer); used by pledge-panel on mobile
│   ├── responsive-overlay.tsx    -- Sheet (mobile <768px) / Dialog (desktop) dual primitive; useIsMobile() hook init false (no hydration flash); props: open, onOpenChange, title, description?, footer?, children
│   ├── occasion-tag.tsx
│   ├── section-eyebrow.tsx
│   ├── ranking-bar.tsx           -- labelSuffix prop for inline Hide/Show toggle
│   ├── reveal-quote.tsx
│   ├── tooltip.tsx
│   └── tooltip-icon-button.tsx   -- Ghost icon button with tooltip; used by event-card and poll-heading
├── new-event-button.tsx          -- Client button that navigates to /events/new; redirects signed-out users to /sign-in; accepts onBeforeOpen callback (used by header to close menu)
├── new-event-wizard.tsx          -- 3-step page component (Honour → Love → Charity); takes pre-fetched WizardData as props; two-column layout (desktop): static icon+prompt left, step content right; step dots with aria roles; on completion redirects to /events/new/details?category=...&grouping=...&topicId=...&charityIds=...
├── event-form-v2/                -- Canonical create/edit form; preview panel full-width + floating command panel
│   ├── index.tsx                 -- EventFormV2 (outer, router + form) + FormInner; preview panel full-width; CommandPanel floated fixed; Event Settings overlay (isPrivate Switch + sharedFund input)
│   ├── command-panel.tsx         -- Floating command panel: fixed bottom-4 right-4 w-72 on desktop, full-width bottom bar on mobile. Contains: three-pick summary chips (Occasion/Topic/Charity) + 3 ResponsiveOverlay sheets, Listed/Unlisted Switch, missing-field checklist, Publish/Cancel/Settings buttons. Auto-sets isListed=false when register="remembering".
│   ├── preview-panel.tsx         -- Authoring artefact: hero fields inlined with ghost Button + Pencil edit affordances → ResponsiveOverlay draft pattern. Pre/post-reveal Eye toggle (C5). Local state: previewSuffix, previewPhoto. Always visible on mobile (stacks below; pb-52 clears command bar). Shows OnboardingPanel when no occasion selected.
│   ├── occasion-overlay.tsx      -- All occasion types grouped under register-labelled section headers (no register chip prerequisite); free-text input always shown; Switch shown only for celebrating_one; Footer: Done + Clear; controlled-open
│   ├── onboarding-panel.tsx      -- Desktop: three-section panel (Honour/Love/Charity) with labelled form mockups; accepts onHowItWorks callback
│   ├── onboarding-interstitial.tsx -- Mobile-only: fixed inset-0 full-screen overlay for first-time organisers; same localStorage key as onboarding-panel
│   ├── schema.ts                 -- Zod schema + EventFormValues
│   ├── constants.ts              -- PickerSize, INPUT_SIZE, TEXTAREA_SIZE, CHIP_IN_INPUT_* maps
│   ├── date-time-picker.tsx      -- Side-by-side date button (opens calendar) + time InputGroup; button width hardcoded to CALENDAR_WIDTH = 220
│   ├── topic-picker-field.tsx    -- ResponsiveOverlay (internal open state); search input + filter buttons + topic chips; Enter creates custom topic
│   ├── item-add-field.tsx        -- ResponsiveOverlay (internal open state); disabled state unchanged; NOT used in form pillar 2
│   ├── charity-field.tsx         -- ResponsiveOverlay (internal open state); search input + charity chip grid; max 3
│   └── photo-crop-modal.tsx      -- react-easy-crop circular 1:1 crop → JPEG Blob
├── pledge-panel.tsx              -- Draft state: draftIds committed on Done, discarded on close. Sheet (mobile) + Dialog (desktop). Chips + input inline (flex-wrap); input collapses to w-0 when chips present. Backspace removes last chip. size=lg chips.
├── pledge-card/
│   ├── index.tsx                 -- PledgeCard dispatcher → PreviewPledgeCard (prePublish, fully interactive except pledge) | LivePledgeCard; all inputs text-base (iOS zoom fix)
│   ├── use-pledge.ts, amount-input.tsx
│   ├── amount-presets.tsx, pledge-breakdown.tsx, utils.ts
│   └── __tests__/pledge-card.test.tsx, use-pledge.test.ts, utils.test.ts
├── ranking-list/
│   ├── index.tsx, use-ranking-items.ts, utils.ts
├── favpoll-card/
│   ├── section-label.tsx             -- Generic small-caps brand-purple section label (`text-[#7F77DD] uppercase tracking-[0.09em]`); used across cards, wizard steps, form preview, rankings
│   ├── poll-reveal.tsx
│   ├── poll-results.tsx
├── poll-section/
│   ├── index.tsx             -- renders amber Alert when all items are hidden (empty-poll warning for organiser)
│   ├── use-poll-section.ts   -- fires onViewChange on mount (initial view) and all view transitions
├── event-content/
│   ├── index.tsx             -- grid md:grid-cols-[1fr_300px]; LivePledgeCard mobile (md:hidden); charity carousel fixed bottom mobile
│   └── use-event-content.ts  -- pollView state tracks pledge/results view; showPledgeCard = !isClosed && !!pollWithItems && !pledgeConfirmed && pollView==="pledge"
├── hero-demo-panel/
│   ├── index.tsx, scenes.ts, variants.ts
│   ├── hero-pitch-column.tsx, demo-card.tsx
├── event-hero.tsx               -- view-only: event + protagonist props, hideAvatar?, aboutPlaceholder? (renders grey when about is blank)
├── event-card.tsx
├── event-card/
│   ├── use-event-card-pledge.ts, event-card-results.tsx
│   └── event-card-charity-carousel.tsx  -- also used as fixed bottom mobile bar on event page
├── event-summary-card.tsx        -- Compact read-only card (no pledge UI): FavpollHeader + Countdown + SectionLabel + EventCardCharityCarousel. Used on landing carousel and /my-events grid.
├── live-events-carousel.tsx
├── favpoll-mark.tsx              -- Symbol-only mark (no wordmark); exports FavpollMarkGlyph (<g> of paths) + default FavpollMark SVG
├── honour-love-charity-venn.tsx  -- Animated Venn SVG (three rotating rings); uses FavpollMarkGlyph at centroid
├── landing-v2/
│   ├── example.ts               -- Belinda Hartley thread: EXAMPLE data + OCCASIONS list
│   ├── occasion-eyebrow.tsx     -- Client: cycles occasion names every 2.8s with framer-motion fade
│   ├── favour-love-charity-venn.tsx  -- See root-level; this is the landing-v2-scoped variant
│   ├── honour-love-charity-venn.stories.tsx
│   ├── how-it-works.tsx         -- Six-step timeline (Create/Share/Reveal phases) with mini preview cards
│   └── favpoll-mark.tsx         -- landing-v2-scoped FavpollMark with native design-source coordinates
├── charity-banner.tsx, countdown.tsx
├── header.tsx                   -- "use client"; hamburger menu on mobile (md:hidden); click-outside closes; uses NewEventButton (passes onBeforeOpen={close} in mobile menu)
├── poll-heading.tsx             -- view-only: topicTitle, reveal, protagonistFirstName?; onResetPledge/onViewResults render TooltipIconButton; no hint line
├── stripe-checkout.tsx, pot-banner.tsx

lib/
├── occasions.ts                  -- shortTopicLabel (DATE_LABEL_PLACEHOLDERS removed)
├── registers.ts                  -- Register type, deriveRegister(), suggestClosingDate(), getExampleName(), registerForOccasionType() (legacy), OCCASION_TYPES_BY_REGISTER (legacy)
├── display.ts                    -- charityNames, formatAmount, ordinal, formatRelativeDate, formatEventDate, getEventHeadline (register param optional — derived from occasionType if absent)
├── i18n.ts                       -- formatCurrency(), t(), MARKET_DEFAULTS
├── email.ts                      -- Resend helpers
├── edit-mode-context.tsx
├── utils.ts                      -- cn()
└── supabase/client.ts, server.ts, admin.ts

lib/actions/
└── event-poll-items.ts           -- hideEventPollItem, showEventPollItem

__mocks__/
├── supabase-client.ts            -- Storybook stub for @/lib/supabase/client (no-op channel/removeChannel/from)
└── stripe.ts                     -- Storybook stub for @stripe/stripe-js (loadStripe returns null)

.storybook/main.ts                -- viteFinal aliases __mocks__/supabase-client and __mocks__/stripe for browser test isolation

messages/en-GB.json
packages/types/index.ts           -- All domain types (@favpoll/types)
packages/ui/                      -- @favpoll/ui: ThemeProvider + MenuButton (shared between apps/web and apps/admin)
scripts/seed.ts                   -- pnpm seed — additive, idempotent
scripts/seed-events.ts            -- scale-test seed: generates 40 events across all occasions/topics. Run with ALLOW_EVENT_SEED=1 or against a staging URL.
scripts/lint-topics.mjs           -- build-time guard: validates every occasion reveal names an item present in that topic's item list
```

### apps/admin

```
app/
├── layout.tsx                    -- ThemeProvider, header (favpoll admin + theme toggle), sidebar
├── placeholders/
│   ├── page.tsx                  -- Topic list sidebar
│   └── [topicId]/page.tsx        -- Occasion editor
├── contributions/page.tsx        -- Guest item review queue
├── charities/page.tsx            -- Charity management
├── events/page.tsx               -- Shell only
└── access-denied/page.tsx

components/
├── sidebar.tsx
├── occasion-editor.tsx           -- 5 register rows per topic (remembering/celebrating_one/celebrating_many/cause/neutral); about + reveal textarea each
├── display-order-editor.tsx      -- Per-item number inputs for finite topic display_order; shown above OccasionEditor
└── charity-list.tsx

lib/
├── supabase/admin.ts             -- createAdminClient() — service role, bypasses RLS
└── actions/
    ├── placeholders.ts           -- getTopics, updatePlaceholder, getTopicItems, updateItemDisplayOrder
    ├── contributions.ts          -- getPendingContributions, acceptContribution, rejectContribution
    └── charities.ts              -- getCharities, createCharity, updateCharity, deactivateCharity, reactivateCharity
```

---

## Atomic UI Components

| Component        | Props                                                           | Usage                                                                                                                   |
| ---------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `OccasionTag`    | `label, className?`                                             | Small uppercase occasion label, brand purple                                                                            |
| `SectionEyebrow` | `children, className?, variant?`                                | `variant="brand"` or `variant="muted"`                                                                                  |
| `RankingBar`     | `label, amount, widthPercent, ..., labelSuffix?`                | `labelSuffix` renders inline after label — used for Hide/Show toggle                                                    |
| `RevealQuote`    | `text, ...`                                                     | Left-bordered italic blockquote                                                                                         |
| `Chip`           | `selected?, readOnly?, size?: "sm"\|"md"\|"lg", ...buttonProps` | Selectable pill. Default bg: `bg-muted`. `readOnly`: `bg-background pointer-events-none`. Never use for amount presets. |

---

## Design System

### Brand colours

```
Primary:   #534AB7   — buttons, logo, links
Mid:       #7F77DD   — ranking bars
Light:     #EEEDFE   — selected states, reveal backgrounds
Border:    #AFA9EC   — purple-tinted borders, edit underlines
Dark:      #3C3489   — text on purple surfaces
Green:     #1D9E75   — shared fund, positive states
Gray 50:   #F1EFE8   — page background
Gray 100:  #D3D1C7   — borders, dividers
```

### Typography

- Typeface: Plus Jakarta Sans, weights 400/500 only (never 600/700)
- Reveal/quote: 18px italic `leading-relaxed text-[#26215C] border-l-[2.5px] border-[#7F77DD]`
- Section eyebrow (brand): 11px medium `tracking-widest uppercase text-[#534AB7]`

### Edit mode field treatment

- `peer` on input/textarea + zero-height sibling div `border-b-2 border-dotted border-border peer-focus:border-primary/40`
- Guest view: no underlines, no placeholders, no edit controls

---

## Poll Close / Extension Rules

- Max duration: 90 days (`hard_close_at`, immutable)
- 1st extension: free; 2nd: inline warning; 3rd: blocked, request via form
- Auto-close: Vercel cron (hourly)
- Disbursement: Stripe Connect TODO — placeholder in cron

---

## Auth — Guest Pledging

- Login optional for guests
- Guest pledges: `clerk_user_id = null`, `guest_email` required
- `guest_token`: UUID for withdrawal link, nulled after use
- Admin app: requires `publicMetadata.role === 'admin'` on Clerk user

---

## Testing

Run from repo root:

```
pnpm --filter @favpoll/web test:run     -- web tests
pnpm --filter @favpoll/admin test:run   -- admin tests
```

All tests must pass before committing. Current counts: 542 web, 35 admin.
Run `pnpm --filter @favpoll/web exec prettier --write .` from `apps/web` after changes (never from repo root — strips TS generics in .tsx).

Co-located `__tests__/` directories. Environments:

- Default (jsdom): pure functions, hooks
- `// @vitest-environment node`: server actions, API routes

Supabase mock: `makeSupabaseMock()` from `@/tests/mocks/supabase-admin`.
`vi.hoisted()` required for mock variables inside `vi.mock()` factories.
`redirect()` must throw — mock as `vi.fn().mockImplementation((url) => { throw new Error(url) })`.

---

## Environment Variables

### apps/web

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET              -- configure at Clerk dashboard → Webhooks
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET             -- configure at Stripe dashboard → Webhooks
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RESEND_API_KEY
NEXT_PUBLIC_BASE_URL
FAVPOLL_ADMIN_EMAIL
CRON_SECRET                       -- random hex, used to authenticate cron calls
```

### apps/admin

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_BASE_URL
```

---

## Decisions locked in

- **One poll per event.** `UNIQUE(event_id)` on `event_polls`. All types use singular `poll`. Do not build multi-poll support without explicit instruction.

- **`personal_framing` retired.** Column kept but never read/written. Auto-generated hint line replaces it.

- **Topic-aware about placeholders, keyed by effective register.** `protagonists.about`. EventFormV2 preview panel reads `topic.placeholders[effReg].about/reveal` for grey placeholder text when fields are blank. `deriveRegister(category, grouping)` in `lib/registers.ts` resolves the register from `event_category` + `event_grouping`. `lib/shape-prompts.ts` deleted (replaced by register-keyed topic placeholders). `topics.placeholders` stores exactly 5 keys: `remembering`, `celebrating_one`, `celebrating_many`, `cause`, `neutral`.

- **Placeholder `about` is charity-free.** Placeholder `about` strings are shared across all charities, so per-(register × topic × charity) sets are not viable. Placeholder `about` teases the topic domain only — no charity references. Charity weaving belongs in the organiser's own words (their free-text `about`) and in per-event exemplars only. Exemplars keep their charity weaving unchanged.

- **Localisation foundations.** `events.market` default `'en-GB'`, `topic_items.markets` default `['en-GB']`. `formatCurrency()` in `lib/i18n.ts`. `next-intl` deferred. See `references/LOCALISATION.md`.

- **Guest item moderation.** Guest items land immediately (pledge works without review). `review_status` on `topic_items` governs canonical promotion only. Organisers hide/show via `event_poll_items.is_hidden`. `acceptContribution` must set both `is_canonical = true` AND `review_status = 'accepted'`.

- **Results ranking sort order.** Primary: `all_time_pledged` desc. Secondary: `display_order asc nulls last` for finite topics, then `localeCompare` alphabetical for ties. `topic_items.display_order` (nullable integer) set only for finite topics via admin `DisplayOrderEditor`; null = alphabetical sort.

- **`events.event_category` + `events.event_grouping` are the canonical occasion model.** `event_category` ∈ {celebration, memorial, fundraiser} (nullable for legacy rows). `event_grouping` ∈ {individual, couple, group} (default: individual). `register` is never stored — always derived via `deriveRegister(event_category, event_grouping)`. `occasion_type` and `is_plural` columns remain on the `events` table for backward compatibility with legacy rows but are not written by new code.

- **Shared fund is mandatory.** Every event gets an `event_pot` row on creation, seeded at `total_deposited: 0` if the organiser doesn't specify an initial amount. Never gate pot creation on `potAmount > 0`. The "Add to the shared fund" top-up input in `LivePledgeCard` is always rendered. `topUpFund` creates the pot lazily for events that predate this decision.

- **Item management — organiser additions from the wizard (canonical and custom).** Organisers add poll items post-publish on the event page (`addOrganizerItem` server action). In the wizard (step 2), both canonical and new/custom topics expose a **"View & add"** chip trigger that opens `TopicItemsDialog` (`event-flow/topic-items-dialog.tsx`) — a search-and-add sheet. Canonical topics: existing items are shown read-only; organisers can add their own on top. New/custom topics: no existing items; ≥2 items required before the wizard can proceed. The draft is carried via `sessionStorage` key `favpoll_draft_additions` (`{ topicRef: { kind: 'new', title } | { kind: 'existing', id }, addedItems: string[] }`), with `&draftAdditions=1` as the SSR-safe URL signal; `FormInner` hydrates from `sessionStorage` on mount via `useEffect`. Legacy key `favpoll_new_topic_draft` (`{ title, items }`) is still supported as a fallback for old links. Canonical topics with **no** additions skip `sessionStorage` entirely and pass `topicId` + `topicTitle` directly in the URL. At publish, `createEvent` inserts the `topics` row for custom topics (`created_by` = Clerk id, `is_active: true`, `is_finite: false`, `placeholders: {}`, no categories) and all `topic_items` (`source: 'organiser'`, `is_canonical: false`, `review_status: 'pending_review'`). For canonical topics, organiser additions are inserted into `topic_items` and linked as `event_poll_items` via the `addedItems` field on `PollInput`. No orphan rows — nothing is written until publish. Guest-added items use `source: 'guest'`, `review_status: 'pending_review'`. The admin contributions queue (`apps/admin/app/contributions/`) filters on `'pending_review'`. In `TopicItemsDialog`, added-items chips use a plain `<div>` (not `<Chip>`) to avoid the button-in-button HTML violation — `Chip` renders as `<button>` and nesting the remove `<button>` inside it causes a React hydration error. Exit warning fires when `isCustom || customLabels.length > 0` with copy "You have unsaved changes. Leave without publishing?" **TODO (deferred):** cross-session `localStorage` recovery for an abandoned draft — currently, if the user closes the tab before publishing, the draft in `sessionStorage` is lost.

- **No hint line on PollHeading.** The protagonist hint ("— Is it the same as [Name]'s?") has been removed. The reveal is the only mechanic for disclosing the protagonist's favourite — shown after pledging. `getPollHint` and the `pledged` prop on `PollHeading` are gone.

- **New event entry point is a wizard page.** Clicking any "New event" button navigates to `/events/new` (signed-out users are redirected to `/sign-in`). `/events/new` is a server-rendered page that fetches wizard data (charities, topics, categories) and renders `NewEventWizard` — a client component with 3 steps (Honour → Love → Charity). On desktop: two-column layout (static icon + tense-aware prompt left; step content right); on mobile: single column. The topic picker (step 2) and charity picker (step 3) open as `ResponsiveOverlay` sheets when the chip trigger is clicked. Step 2 shows a compact item summary below the selected topic chip — rendered as readonly `Chip` components (existing canonical options in muted style; organiser additions in brand purple; overflow as "+N more") — with a "View & add" button that opens `TopicItemsDialog`; canonical topics without additions redirect via `topicId` + `topicTitle`; topics with any additions (or new custom topics) redirect via `draftAdditions=1` + sessionStorage (see item management decision). The `event-flow/` step components (`HonourStep`, `LoveStep`, `CharityStep`) are used by both `NewEventWizard` and `CommandPanel`.

- **Onboarding for first-time organisers.** On desktop, `PreviewPanel` shows `OnboardingPanel` when no occasion is selected. On mobile, `EventFormV2` renders `OnboardingInterstitial` (fixed inset-0 overlay). Both use `localStorage.favpoll_show_onboarding` (`'0'` = dismissed, `'1'` = re-show). "How favpoll works →" link sets `'1'` to re-open.

- **Toast notifications via sonner.** `<Toaster position="bottom-center" />` is wired in `app/layout.tsx`. Use `toast.warning()` with explicit `style: { background, color, border }` props — do not rely on `classNames.warning` or CSS variables on `<Toaster>` as sonner's inline styles override them.

- **Command panel + one-action publish.** The floating `CommandPanel` (`fixed bottom-4 right-4 w-72` desktop; full-width bottom bar mobile) replaces the former left panel and fixed publish bar. Clicking Publish creates/updates the event immediately — the event is live at its URL at that instant. `is_listed` is a post-publish-flippable property; toggling it via the Listed/Unlisted switch before publishing sets the initial value. `form-panel.tsx` is deleted; its content is fully absorbed into `CommandPanel`.

- **Listed/Unlisted model.** `events.is_listed` (boolean, default `true`). Listed → appears on the `/events` live events page. Unlisted → reachable by URL only, not shown on `/events`. **All events feed the record regardless of `is_listed`** — rankings query `topic_items.all_time_pledged` directly, not through `events`. `remembering` register defaults to `is_listed = false`; organisers can override with the switch before publishing. The `/events` query filters `.eq("is_listed", true)` in addition to `.eq("is_private", false)`. `is_private` (access control) and `is_listed` (discoverability) are orthogonal.

- **opening_line is organiser-editable.** Shown as placeholder text in the form (from `PREFIXES[occasion]`) — not pre-filled. Organiser may type their own. Stored in DB. Preview falls back to `PREFIXES[occasion]` when field is empty. Never derive it purely from occasion at render time.

- **Field character limits.** name: 40, context: 40, opening_line: 50, about: 300, personal_reveal: 280. Enforced via Zod max(), HTML maxLength, and CSS overflow (line-clamp-2 on name heading, truncate on context and opening line). Limits chosen to prevent layout breakage in the event preview.

- **Admin app auth.** All routes protected by Clerk. Non-admin authenticated users → `/access-denied`. `createAdminClient()` uses service role key, bypasses RLS.

- **Seed command.** `pnpm seed` from root runs `scripts/seed.ts` via `apps/web` filter. To seed staging: `cd apps/web && NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm tsx ../../scripts/seed.ts`. Topic placeholders are stored **register-keyed** (5 keys per topic); no occasion→register routing at write time. The six `scripts/placeholders-regenerated*.ts` batch files are the source of truth — `scripts/apply-placeholders.ts` (run with `tsx`) merges them into the inline `topics` array when batch files change. `seed.ts` imports all six batches at startup (duplicate title → throw). **`applyAllPlaceholders()`** runs after all topic rows exist: iterates every entry in `combinedPlaceholders`, fetches topic rows by title, writes `placeholders` to each — covering all ~118 topics regardless of which seed path created the row. Throws listing any map title with no DB row. **`assertAllTopicsHavePlaceholders()`** then validates every active topic in the map has all 5 register keys non-empty in the DB, providing a bidirectional fail-loud guard. `celebrating_many` placeholder entries carry `group: "pair"` (default) or `group: "set"` (sport cluster, defined in `scripts/celebrating-many-groups.ts`); group tagging is applied inside `combinedPlaceholders` at seed startup.

- **Preview example name.** When the organiser hasn't typed a name, the preview renders a greyed persona-matched example name (e.g. "Eleanor" for she-persona, "Joan & Arthur" for a pair) selected stably by djb2 hash of the topic title via `getExampleName(topicTitle, pronouns, grouping: EventGrouping, register)` in `lib/registers.ts`. `grouping === "couple"` → pair pool, `grouping === "group"` → set pool. Name substitution into persona `about`/`reveal` prose is explicitly NOT a feature. `contextExamples` in `registers.ts` is register-keyed (`Record<Register, string>`) and used as the greyed context-line placeholder.

- **Chip vs pickerfield threshold.** Under 12 canonical items → render as chips. 12 or over → render as pickerfield (searchable combobox). Threshold stored as named constant `PICKERFIELD_THRESHOLD = 12`. Applies to guest pledge view (infinite topics) and organiser form item preview. Organiser form item _addition_ always uses ItemAddField pickerfield regardless of count.

- **Pledge panel draft state.** Selections are not committed until the user clicks Done. Opening the Sheet/Dialog initialises `draftIds` from the current `selectedIds`. Closing/dismissing without Done discards the draft. This prevents partial selections appearing in the trigger display.

- **Pledge card visibility.** `showPledgeCard` in `useEventContent` is `!isClosed && !!pollWithItems && !pledgeConfirmed && pollView === "pledge"`. `pollView` is initialised from `hasPledged || isClosed` and updated via `onViewChange` callback from `PollSection`. No `!hasPledged` check — Reset Pledge correctly re-shows the card for previously-pledged users who switch back to pledge view.

- **Mobile breakpoint is `md` (768px) throughout.** All responsive grid/layout changes use `md:` prefix. Do not introduce new `lg:` breakpoints for layout (only for spacing/typography if needed).

- **iOS input zoom prevention.** `globals.css` applies `font-size: max(16px, 1em)` to all `input, textarea, select` globally. Inputs below 16px font size trigger iOS auto-zoom. Do not set `text-sm` or smaller on any focusable input element.

- **`scripts/seed-events.ts` behaviour.** Owns all rows via `created_by = 'user_seed_scale'` (organisers `user_seed_001`–`008` for guest pledges). Tops up to `TARGET_EVENTS = 40` idempotently; never deletes. Inserting `pledge_allocations` fires the record trigger, so each run **shifts staging's `all_time_pledged` / `all_time_count`** — relevant when building the `/rankings` data threshold logic, which will be tested against synthetic numbers. `event_count` / `total_pledge_count` are intentionally left at 0 (no trigger; reserved for future inclusion-promotion). Cleanup: `delete from events where created_by = 'user_seed_scale';` (cascades to polls, items, pledges, allocations, pots).

---

## Outstanding TODO

- **Webhooks not configured** — `CLERK_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET` are blank in Vercel. Configure endpoints at Clerk and Stripe dashboards.
- **Clerk production keys** — using `pk_test_` on Vercel until `favpoll.com` points at the app. Swap to `pk_live_` when domain is switched.
- **Stripe Connect** — disbursement not wired. Cron has placeholder. Connect application pending approval.
- **All-time rankings** — `/rankings` exists but needs data threshold logic.
- **Event oversight admin page** — `/events` in admin app is a shell only.
- **Email templates** — currently plain text via Resend.
- **Rate limiting** on API routes.
- **Localisation next steps** — `next-intl`, string extraction, US market prep.
- **Mobile app** — future.
