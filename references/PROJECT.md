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
- **CI:** GitHub Actions (`.github/workflows/ci.yml`) — Test and Typecheck jobs on push/PR to main
- **Branch:** `main` (renamed from `master`)
- **Localisation:** UK-first (`en-GB`). `messages/en-GB.json` holds UI strings. `lib/i18n.ts` provides `formatCurrency()`, `t()`, and `MARKET_DEFAULTS`. `next-intl` planned when a second market launches.

---

## Environments

| Environment | Web URL | Admin URL | Supabase | Clerk |
|---|---|---|---|---|
| Production | favpoll-web-gamma.vercel.app | [admin vercel URL] | production project | pk_test_ keys until domain swap |
| Preview (PRs) | auto-generated vercel URL | auto-generated vercel URL | staging (eotqyintgusvzidymumb) | pk_test_ keys |
| Development | localhost:3000 | localhost:3001 | production or staging | pk_test_ keys |

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
  placeholders jsonb default '{}',  -- Keyed about+reveal pairs by occasion
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
  occasion text not null,           -- OccasionType value
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
20260527000000_rename_suffix_to_context.sql
20260527000001_rename_occasion_label_to_opening_line.sql
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
Guest-added items land with `source = 'guest'`, `is_canonical = false`,
`review_status = 'pending_review'`. Admin reviews at `apps/admin/app/contributions/`.

---

## Application Routes

### apps/web

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
/api/polls/[pollId]/results    -- Ranked pledge totals for a poll (admin client)
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
│   ├── new/page.tsx, actions.ts
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
│   ├── chip.tsx                  -- Selectable pill toggle
│   ├── occasion-tag.tsx
│   ├── section-eyebrow.tsx
│   ├── ranking-bar.tsx           -- labelSuffix prop for inline Hide/Show toggle
│   ├── reveal-quote.tsx
│   ├── picker-field.tsx
│   └── tooltip.tsx
├── canvas/
│   ├── poll-editor.tsx, topic-picker.tsx, topic-priority-editor.tsx
│   ├── custom-topic-options.tsx, share-screen.tsx
│   └── canvas-sidebar/
│       ├── index.tsx, charity-picker.tsx, closing-date.tsx
│       ├── privacy-toggle.tsx, shared-fund.tsx
├── event-form-v2/                -- Replacement for EventCanvas (in progress)
│   ├── index.tsx                 -- EventFormV2: Cancel button, lifted photoFileName state
│   ├── form-panel.tsx            -- 5-step form, size prop (sm/md/lg), StepSection
│   ├── preview-panel.tsx         -- Live preview panel
│   ├── schema.ts                 -- Zod schema + EventFormValues
│   ├── constants.ts              -- PickerSize, INPUT_SIZE, TEXTAREA_SIZE, CHIP_IN_INPUT_* maps
│   ├── date-time-picker.tsx      -- Trigger Button with size prop, no hover bg, conditional text opacity
│   ├── occasion-picker-field.tsx -- Click-to-clear chip, no X button
│   ├── topic-picker-field.tsx    -- Click-to-clear chip, Enter creates topic, dropdown stays open
│   ├── item-add-field.tsx        -- isFinite (view-only) + disabled (no topic) props; Enter adds item; popover stays open after add
│   ├── charity-field.tsx         -- Click-to-toggle chips, no X button
│   └── photo-crop-modal.tsx      -- react-easy-crop circular 1:1 crop → JPEG Blob
├── pledge-card/
│   ├── index.tsx, use-pledge.ts, amount-input.tsx
│   ├── amount-presets.tsx, pledge-breakdown.tsx, utils.ts
├── ranking-list/
│   ├── index.tsx, use-ranking-items.ts, utils.ts
├── favpoll-card/
│   ├── poll-title.tsx, poll-framing.tsx (retired), poll-reveal.tsx
│   ├── poll-options.tsx, poll-results.tsx, favpoll-card.tsx
├── poll-section/
│   ├── index.tsx, use-poll-section.ts
├── hero-demo-panel/
│   ├── index.tsx, scenes.ts, variants.ts
│   ├── hero-pitch-column.tsx, demo-card.tsx
├── event-canvas/use-canvas.ts   -- reads topic.placeholders[occasion].about
├── event-hero.tsx
├── event-card.tsx
├── event-card/
│   ├── use-event-card-pledge.ts, event-card-results.tsx
│   └── event-card-charity-carousel.tsx
├── live-events-carousel.tsx
├── charity-banner.tsx, countdown.tsx
├── header.tsx, poll-heading.tsx
├── stripe-checkout.tsx, pot-banner.tsx
└── theme-provider.tsx, menu-button.tsx  -- TODO: move to packages/ui/

lib/
├── occasions.ts                  -- getAboutPlaceholder(occasion) fallback
├── display.ts                    -- formatAmount, formatRelativeDate, getEventHeadline
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
scripts/seed.ts                   -- pnpm seed — additive, idempotent
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
├── occasion-editor.tsx
├── charity-list.tsx
├── theme-provider.tsx            -- TODO: move to packages/ui/
└── menu-button.tsx               -- TODO: move to packages/ui/

lib/
├── supabase/admin.ts             -- createAdminClient() — service role, bypasses RLS
└── actions/
    ├── placeholders.ts           -- getTopics, updatePlaceholder, addOccasion, deleteOccasion
    ├── contributions.ts          -- getPendingContributions, acceptContribution, rejectContribution
    └── charities.ts              -- getCharities, createCharity, updateCharity, deactivateCharity, reactivateCharity
```

---

## Atomic UI Components

| Component | Props | Usage |
|---|---|---|
| `OccasionTag` | `label, className?` | Small uppercase occasion label, brand purple |
| `SectionEyebrow` | `children, className?, variant?` | `variant="brand"` or `variant="muted"` |
| `RankingBar` | `label, amount, widthPercent, ..., labelSuffix?` | `labelSuffix` renders inline after label — used for Hide/Show toggle |
| `RevealQuote` | `text, ...` | Left-bordered italic blockquote |
| `Chip` | `selected?, readOnly?, size?: "sm"\|"md"\|"lg", ...buttonProps` | Selectable pill. Default bg: `bg-muted`. `readOnly`: `bg-background pointer-events-none`. Never use for amount presets. |

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

All tests must pass before committing. Current counts: ~426 web, ~22 admin.

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

- **Topic-aware about placeholders.** `protagonists.about` (renamed from `bio`). Canvas reads `topic.placeholders[occasion].about`, falls back to `getAboutPlaceholder(occasion)`. `lib/topic-bio-placeholders.ts` deleted.

- **Localisation foundations.** `events.market` default `'en-GB'`, `topic_items.markets` default `['en-GB']`. `formatCurrency()` in `lib/i18n.ts`. `next-intl` deferred. See `references/LOCALISATION.md`.

- **Guest item moderation.** Guest items land immediately (pledge works without review). `review_status` on `topic_items` governs canonical promotion only. Organisers hide/show via `event_poll_items.is_hidden`. `acceptContribution` must set both `is_canonical = true` AND `review_status = 'accepted'`.

- **Results ranking sort order.** Primary: `all_time_pledged` desc. Secondary: `localeCompare` alphabetical for ties. Items in all views sorted alphabetically — `display_order` and `is_prioritized` removed from `event_poll_items`.

- **`events_occasion_check` constraint.** Must match `OCCASION_LIST` in `lib/occasions.ts`. All 16 occasion values currently included including `promotion`.

- **opening_line is organiser-editable.** Pre-populated from PREFIXES[occasion] on occasion select but freely editable. Stored in DB. Never derive it purely from occasion at render time.

- **Field character limits.** name: 40, context: 40, opening_line: 60, about: 400, personal_reveal: 280. Enforced via Zod max(), HTML maxLength, and CSS overflow (line-clamp-2 on name heading, truncate on context and opening line). Limits chosen to prevent layout breakage in the event preview.

- **Admin app auth.** All routes protected by Clerk. Non-admin authenticated users → `/access-denied`. `createAdminClient()` uses service role key, bypasses RLS.

- **Seed command.** `pnpm seed` from root runs `scripts/seed.ts` via `apps/web` filter. To seed staging: `cd apps/web && NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm tsx ../../scripts/seed.ts`

- **Chip vs pickerfield threshold.** Under 12 canonical items → render as chips. 12 or over → render as pickerfield (searchable combobox). Threshold stored as named constant `PICKERFIELD_THRESHOLD = 12`. Applies to guest pledge view (infinite topics) and organiser form item preview. Organiser form item *addition* always uses ItemAddField pickerfield regardless of count.

---

## Outstanding TODO

- **Webhooks not configured** — `CLERK_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET` are blank in Vercel. Configure endpoints at Clerk and Stripe dashboards.
- **Clerk production keys** — using `pk_test_` on Vercel until `favpoll.com` points at the app. Swap to `pk_live_` when domain is switched.
- **Stripe Connect** — disbursement not wired. Cron has placeholder. Connect application pending approval.
- **All-time rankings** — `/rankings` exists but needs data threshold logic.
- **Event oversight admin page** — `/events` in admin app is a shell only.
- **Email templates** — currently plain text via Resend.
- **Rate limiting** on API routes.
- **`home-carousel.tsx`** — unused, remove or repurpose.
- **`theme-provider.tsx` and `menu-button.tsx`** — duplicated in apps/web and apps/admin. TODO: extract to `packages/ui/`.
- **Localisation next steps** — `next-intl`, string extraction, US market prep.
- **Mobile app** — future.
