# favpoll — Project Document

## What is favpoll?

favpoll is a charitable polling platform for life events — memorials, funerals, birthdays, retirements, weddings, and more. An organiser creates an event honouring a person, selects one or more charities, picks a poll topic (favourite colour, favourite biscuit, etc.), and shares a link with guests. Guests pledge real money against their favourite options. The rankings update in real time. All proceeds go to the chosen charities.

Every pledge also feeds a permanent all-time universal ranking of human favourites — a collectively funded, financially weighted record of what people love most, built through acts of generosity.

---

## The Core Idea

- **Events** honour a person (protagonist) on a specific occasion
- **Topics** are canonical questions — Colour, Season, Biscuit, Film, etc.
- **Event polls** activate a topic within an event, with an optional personal reveal (shown after pledging). A hint line — "Is it the same as [Name]'s?" — is shown to guests before pledging, derived automatically from the protagonist's name.
- **Pledges** are financial commitments against specific topic items, contributing to both the event ranking and the all-time universal ranking
- **Pledge allocations** split a single pledge across multiple items (e.g. 60% Purple, 40% Blue)
- **Shared fund** allows generous donors to top up a communal pot so others (e.g. children) can participate without paying

---

## Stack

- **Framework:** Next.js 15, App Router, TypeScript
- **UI:** shadcn/ui with Base UI (preset b0), Tailwind 4, Lucide icons, Framer Motion, Embla Carousel
- **Component catalogue:** Storybook (`@storybook/nextjs-vite`), co-located `.stories.tsx` files
- **Auth:** Clerk (`@clerk/nextjs`) — login is optional for guests
- **Database:** Supabase (Postgres + Realtime)
- **Payments:** Stripe (marketplace model — favpoll collects, disburses to charities)
- **Email:** Resend
- **Package manager:** pnpm
- **Hosting:** Vercel
- **Domain:** favpoll.com
- **Localisation:** UK-first (`en-GB`). `messages/en-GB.json` holds UI strings. `lib/i18n.ts` provides `formatCurrency()`, `t()`, and `MARKET_DEFAULTS`. `next-intl` planned when a second market launches.

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
  placeholders jsonb default '{}',  -- Keyed about+reveal pairs by occasion, used for canvas placeholders
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
  markets text[] not null default array['en-GB'],  -- Market filter
  event_count integer default 0,
  total_pledge_count integer default 0,
  created_at timestamptz
)

protagonists (
  id uuid primary key,
  name text not null,
  date_label text,                  -- e.g. "1940 – 2024", "Turning 35"
  about text,
  photo_url text,
  created_by text references users(id),
  created_at timestamptz
)

events (
  id uuid primary key,
  protagonist_id uuid references protagonists(id),
  occasion text not null,           -- OccasionType value
  occasion_label text,              -- Optional organiser override of display label
  market text not null default 'en-GB',  -- Market identifier
  created_by text references users(id),
  description text,
  closes_at timestamptz not null,
  is_private boolean default false,
  closed_at timestamptz,
  total_raised numeric default 0,
  extension_count integer default 0,
  original_closes_at timestamptz,
  hard_close_at timestamptz,        -- created_at + 90 days, immutable
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
  event_id uuid references events(id) on delete cascade,
  topic_id uuid references topics(id),
  personal_framing text,            -- Retired; column kept but app no longer reads or writes it
  personal_reveal text,             -- Disclosed after pledging
  created_at timestamptz
)

event_poll_items (
  id uuid primary key,
  event_poll_id uuid references event_polls(id) on delete cascade,
  topic_item_id uuid references topic_items(id),
  display_order int not null default 0,
  is_prioritized boolean not null default false,
  is_guest_added boolean default false,
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

## Occasion Types

```typescript
type OccasionType =
  | 'memorial' | 'tribute'    | 'birthday'    | 'retirement'
  | 'wedding'  | 'engagement' | 'anniversary' | 'leaving'
  | 'graduation' | 'christening' | 'achievement' | 'recovery'
  | 'award'    | 'promotion'  | 'celebration' | 'other'
```

### Display headline prefixes (from `lib/display.ts` PREFIXES)

```
memorial    → 'In memory of'
tribute     → 'In honour of'
birthday    → 'Happy birthday'
retirement  → 'Celebrating the retirement of'
wedding     → 'Congratulations to'
engagement  → 'Congratulations to'
anniversary → 'Happy anniversary'
leaving     → 'Farewell'
graduation  → 'Congratulations to'
christening → 'Welcome'
achievement → 'Well done'
recovery    → 'Wishing a speedy recovery to'
award       → 'Congratulations to'
promotion   → 'Congratulations to'
celebration → 'Celebrating'
other       → 'Honouring'
```

Full closing defaults and placeholder data in `lib/occasions.ts`.

### Default poll closing period by occasion

| Occasion | Days until close |
|---|---|
| memorial | 30 |
| tribute, retirement, anniversary | 21 |
| All others | 14 |

---

## Topic Types

### Finite (`is_finite = true`) — fixed list, no guest additions
Colour, Season, Day of the week, Meal of the day, Time of day, Decade

### Infinite (`is_finite = false`) — open list
Organiser can pin/reorder (not remove) items. Guests can suggest additions.

### Canonical colour list (CSS named colours, no hex stored)
Red, Orange, Yellow, Green, Blue, Purple, Pink, Brown, Black, White, Grey
Rendered as: `<div style={{ backgroundColor: item.label.toLowerCase() }} />`

---

## Application Routes

```
/                              -- Home: HeroDemoPanel + live events carousel + CTA
/events                        -- Live events grid (public, no auth)
/events/new                    -- Create event (EventCanvas)
/events/[id]                   -- Event page — guest pledge view + edit mode toggle
/events/[id]/edit              -- Edit event (EventCanvas edit mode)
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
/api/polls/[pollId]/results  -- Returns ranked pledge totals for a specific event poll (admin client, bypasses RLS)
```

---

## Key Files

```
app/
├── layout.tsx                        -- Root layout (Clerk, theme, header)
├── page.tsx                          -- Home page (server component)
├── events/
│   ├── page.tsx                      -- Live events listing
│   ├── actions.ts                    -- Shared event server actions
│   ├── new/
│   │   ├── page.tsx                  -- EventCanvas (create)
│   │   └── actions.ts
│   └── [id]/
│       ├── page.tsx                  -- Event view + pledge flow
│       ├── actions.ts                -- Pledge/reveal/close actions
│       ├── display/page.tsx          -- Live display
│       ├── edit/page.tsx             -- EventCanvas (edit)
│       ├── edit/actions.ts
│       └── manage/page.tsx           -- Organiser management
├── my-events/page.tsx
├── rankings/page.tsx
├── topics/[id]/page.tsx
└── api/polls/[id]/results/route.ts   -- Ranked pledge results for a poll (admin client)

components/
├── ui/                               -- Atoms (shadcn + custom)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── field.tsx                     -- Form field wrapper (vertical/horizontal)
│   ├── chip.tsx                      -- Selectable pill toggle (border-based, built on Button)
│   ├── occasion-tag.tsx              -- Small uppercase occasion label (brand purple)
│   ├── section-eyebrow.tsx           -- Small uppercase section label (brand | muted variants)
│   ├── ranking-bar.tsx               -- Label + amount + progress bar row
│   ├── reveal-quote.tsx              -- Left-bordered italic blockquote
│   ├── picker-field.tsx              -- Reusable input+Popover+Chip grid (searchable or read-only display mode)
│   └── tooltip.tsx                   -- Radix tooltip wrapper (content, side props)
├── canvas/                           -- Event creation/editing UI
│   ├── poll-editor.tsx
│   ├── topic-picker.tsx
│   ├── topic-priority-editor.tsx
│   ├── custom-topic-options.tsx
│   ├── share-screen.tsx
│   └── canvas-sidebar/
│       ├── index.tsx
│       ├── charity-picker.tsx        -- Multi-select charity input; delegates input+popover to PickerField
│       ├── closing-date.tsx
│       ├── privacy-toggle.tsx
│       └── shared-fund.tsx
├── pledge-card/                      -- Pledge flow components
│   ├── index.tsx                     -- Main pledge card (uses usePledge hook)
│   ├── use-pledge.ts                 -- All pledge logic + Stripe state
│   ├── amount-input.tsx              -- £-prefixed number input
│   ├── amount-presets.tsx            -- Preset amount button row
│   ├── pledge-breakdown.tsx          -- Line items + total row
│   └── utils.ts                      -- GBP formatter
├── ranking-list/
│   ├── index.tsx                     -- Realtime ranking list
│   ├── use-ranking-items.ts          -- Supabase realtime subscription
│   └── utils.ts
├── favpoll-card/                     -- Shared poll rendering primitives (not a self-contained card)
│   ├── poll-title.tsx                -- Topic eyebrow label (11px uppercase purple, no built-in margin)
│   ├── poll-framing.tsx              -- Framing paragraph — unused in production; personal_framing retired
│   ├── poll-reveal.tsx               -- Post-pledge reveal blockquote (18px italic #26215C, left border)
│   ├── poll-options.tsx              -- Item selection UI
│   ├── poll-results.tsx              -- Results display
│   └── favpoll-card.tsx              -- Assembled card (stories only — not used in production)
├── poll-section/
│   ├── index.tsx                     -- Poll UI: PollHeading + pledge/results views
│   └── use-poll-section.ts
├── hero-demo-panel/                  -- Animated homepage demo (no props, self-contained)
│   ├── index.tsx                     -- Orchestrator: state, effects, section layout, occasion chips
│   ├── scenes.ts                     -- HeroScene type, Phase type, SCENES data, OCCASION_CHIPS, PLEDGE_AMOUNTS, SCENE_EYEBROWS
│   ├── variants.ts                   -- Framer Motion variants and timing constants
│   ├── hero-pitch-column.tsx         -- Left column: animated eyebrow, headline, supporting text, CTA buttons
│   └── demo-card.tsx                 -- Card: protagonist header, topic title, poll options, pledge panel, reveal quote, rankings, charity total, toast
├── event-canvas/                     -- Event creation/editing canvas
│   └── use-canvas.ts                 -- Canvas state — reads topic.placeholders[occasion].about for topic-aware about placeholder; falls back to getAboutPlaceholder(occasion)
├── event-hero.tsx                    -- Event header with protagonist info
├── event-card.tsx                    -- Fully interactive card for live events listings (5-stage pledge flow)
├── event-card/                       -- EventCard sub-components and hook
│   ├── use-event-card-pledge.ts      -- State machine hook: idle→ready→paying→pledged + resetPledge/viewResults
│   ├── event-card-results.tsx        -- Post-pledge ranking bars (RankingBar list)
│   └── event-card-charity-carousel.tsx -- Embla y-axis auto-rotating charity footer (1 charity = static)
├── event-card-empty.tsx              -- Empty state card
├── home-carousel.tsx                 -- Embla carousel for all-time data (unused — see live-events-carousel)
├── live-events-carousel.tsx          -- Embla carousel for homepage live events (client component, loop + autoplay)
├── charity-banner.tsx                -- Charity names + logos
├── countdown.tsx                     -- Closing countdown display
├── header.tsx                        -- App header (nav + auth)
├── poll-heading.tsx                  -- Poll topic heading with hint line and reveal
├── stripe-checkout.tsx               -- Stripe Elements checkout wrapper
└── pot-banner.tsx                    -- Shared fund banner

lib/
├── occasions.ts                      -- OccasionType list, labels, defaults, placeholders; exports getAboutPlaceholder(occasion) — occasion-level fallback only
├── display.ts                        -- formatAmount, formatRelativeDate, getEventHeadline, getPollHint
├── i18n.ts                           -- formatCurrency(), t(), MARKET_DEFAULTS, Market type
├── email.ts                          -- Resend email helpers
├── edit-mode-context.tsx             -- React context for organiser edit mode
├── utils.ts                          -- cn(), misc helpers
└── supabase/
    ├── client.ts                     -- Browser client
    ├── server.ts                     -- Server component client (SSR)
    └── admin.ts                      -- Service role client for webhooks/cron

messages/
└── en-GB.json                        -- UI strings for en-GB market

types/index.ts                        -- All domain types + composite query types
scripts/seed.ts                       -- pnpm seed — additive, idempotent
.storybook/
├── main.ts                           -- Stories glob: components/**/*.stories.tsx
└── preview.tsx                       -- globals.css, brand backgrounds, layout: centered
```

---

## Atomic UI Components

Shared atoms in `components/ui/` extracted from duplicated inline patterns:

| Component | Props | Usage |
|---|---|---|
| `OccasionTag` | `label, className?` | Small uppercase occasion label, brand purple, opacity 70 |
| `SectionEyebrow` | `children, className?, variant?` | Section label; `variant="brand"` (purple, default) or `variant="muted"` (gray) |
| `RankingBar` | `label, amount, widthPercent, barClassName?, barStyle?, className?` | Label + amount + coloured progress bar |
| `RevealQuote` | `text, className?, role?, aria-label?, aria-live?` | Left-bordered italic blockquote for reveal text |
| `Chip` | `selected?, className?, ...buttonProps` | Selectable pill — border-based toggle; selected: brand purple fill; unselected: `border-border bg-background` |

`Chip` is used for occasion selectors, topic pickers, category filters, and charity selection. Built on `Button`; accepts all button props. Use `className` for size overrides. Do not use for amount presets — use `Button` directly.

`SectionEyebrow` with framer-motion: wrap with `motion()` as needed — see `hero-demo-panel/index.tsx`.

---

## Storybook

Configured with `@storybook/nextjs-vite`. Run with `pnpm storybook`. Story files co-located alongside components.

Font fix: `.storybook/preview-head.html` loads Plus Jakarta Sans from Google Fonts and sets `--font-sans` — required because `next/font` only runs through the Next.js layout, not Storybook.

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
- Typeface: Plus Jakarta Sans
- Weights: 400 regular, 500 medium only (never 600/700)
- Reveal/quote: 18px, italic, `leading-relaxed`, `text-[#26215C]`, `border-l-[2.5px] border-[#7F77DD]`
- Section eyebrow (brand): 11px, medium, `tracking-widest`, uppercase, `text-[#534AB7]`
- Section eyebrow (muted): `text-xs`, medium, `tracking-widest`, uppercase, `text-muted-foreground`

### Edit mode field treatment
- Editable field: absolute underline pattern — `peer` on input/textarea, zero-height sibling div with `border-b-2 border-dotted border-border transition-colors peer-focus:border-primary/40`
- Placeholder: `placeholder:text-muted-foreground/40`
- Guest view: no underlines, no placeholders, no edit controls

### Button conventions
- Primary: `<Button>` — solid purple, one per panel
- Ghost: `<Button variant="ghost">` — secondary actions
- Never use raw `<button>` — always use shadcn `Button`

---

## Poll Close / Extension Rules

- Required at creation, `lib/occasions.ts suggestClosingDate()` provides defaults
- Max duration: 90 days from creation (`hard_close_at`, immutable)
- 1st extension: free
- 2nd extension: inline warning
- 3rd extension: blocked — must request via form (emails `FAVPOLL_ADMIN_EMAIL`)
- Auto-close: Vercel cron (hourly), closes events where `closes_at <= now`
- Disbursement: Stripe TODO — placeholder in cron
- Cannot reopen closed events

---

## Multiple Charities

- Up to 3 per event (enforced in `canvas-sidebar/charity-picker.tsx`)
- Stored in `event_charities` join table with `display_order`
- Proceeds split equally on disbursement

---

## Auth — Guest Pledging

- Login optional for guests
- Guest pledges: `clerk_user_id = null`, `guest_email` required
- `guest_token`: UUID for withdrawal link, nulled after use
- Signed-in users: withdraw from `/my-events`
- Duplicate check: `guest_email + event_poll_id + withdrawn_at is null`

---

## Testing

Run with `pnpm test:run`. **419 tests must pass** before committing.

Tests are co-located in `__tests__/` directories alongside their subjects:

| Area | File |
|---|---|
| display helpers | `lib/__tests__/display.test.ts` |
| occasions helpers | `lib/__tests__/occasions.test.ts` |
| pledge utils | `components/pledge-card/__tests__/utils.test.ts` |
| usePledge hook | `components/pledge-card/__tests__/use-pledge.test.ts` |
| useRankingItems hook | `components/ranking-list/__tests__/use-ranking-items.test.ts` |
| usePollSection hook | `components/poll-section/__tests__/use-poll-section.test.ts` |
| cron route | `app/api/cron/close-events/__tests__/route.test.ts` |
| Clerk webhook | `app/api/webhooks/clerk/__tests__/route.test.ts` |
| event actions | `app/events/[id]/__tests__/actions.test.ts` |
| pledge withdraw | `app/pledges/withdraw/__tests__/actions.test.ts` |
| Storybook smoke | auto-generated via `@storybook/addon-vitest` (chromium) |

`vitest.config.ts` uses array alias format — the specific `@/app/events/new/actions` mock alias must come before the generic `@` alias.

---

## Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RESEND_API_KEY
NEXT_PUBLIC_BASE_URL
FAVPOLL_ADMIN_EMAIL
CRON_SECRET
```

---

## Decisions locked in

- **One poll per event — enforced at DB level.** `event_polls` has a `UNIQUE(event_id)` constraint (migration `20260523000000_enforce_single_poll_per_event.sql`). All types, hooks, and server actions use singular `poll` (not `polls[]`). Do not build multi-poll support without explicit instruction.

- **`personal_framing` retired.** Column kept in database but app no longer reads or writes it. The auto-generated hint line `"Is it the same as [Name]'s?"` replaces it in all guest-facing views.

- **Topic-aware about placeholders.** `protagonists.about` (renamed from `bio`). The canvas `protagonistAbout` textarea shows a placeholder from the selected topic's `placeholders` JSONB (`topic.placeholders[occasion].about`), falling back to `getAboutPlaceholder(occasion)` from `lib/occasions.ts`. The per-topic placeholder data lives in the seed and is stored in the DB — `lib/topic-bio-placeholders.ts` has been deleted. Placeholder updates live as the organiser picks a topic.

- **Localisation foundations in place.** Market field on `events` (default `'en-GB'`), markets array on `topic_items` (default `['en-GB']`). Currency rendering via `formatCurrency()` in `lib/i18n.ts`. UI strings in `messages/en-GB.json` via `t()` helper. Full `next-intl` migration deferred until a second market launches. See `references/LOCALISATION.md`.

---

## Outstanding TODO

- **Localisation next steps:** install `next-intl`, complete string extraction, add `country_code` and `tax_deductible` to `charities`, seed US-market topic items, write US tone guidance in brand skill, add market-aware topic filtering, Gift Aid (UK) and 501(c)(3) copy (US)
- `EventCard initialResults` only pre-populated for authenticated users — guest returning-visitor pledge detection not yet implemented
- `home-carousel.tsx` is unused — remove or repurpose for all-time rankings browse
- Stripe Connect — charity disbursement (cron has placeholder; `api/stripe/payment-intent` creates PaymentIntents but Connect payout not wired)
- All-time rankings browse page (`/rankings` exists but needs data threshold logic)
- User profile / donor history page
- Email templates (currently plain text via Resend)
- Rate limiting on API routes
- Analytics
- Mobile app
