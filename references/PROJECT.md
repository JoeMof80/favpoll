# FavPoll — Project Document

## What is FavPoll?

FavPoll is a charitable polling platform for life events — memorials, birthdays, retirements, weddings, and more. An organiser creates an event honouring a person, selects one or more charities, picks poll topics (favourite colour, favourite biscuit, etc.), and shares a link with guests. Guests pledge real money against their favourite options. The rankings update in real time. All proceeds go to the chosen charities.

Every pledge also feeds a permanent all-time universal ranking of human favourites — a collectively funded, financially weighted record of what people love most, built through acts of generosity.

---

## The Core Idea

- **Events** honour a person on a specific occasion
- **Topics** are canonical questions — Colour, Season, Biscuit, Film, etc.
- **Event polls** activate a topic within an event, with a personal framing ("Belinda's favourite colour was purple — what's yours?") and an optional quote
- **Pledges** are financial commitments against specific topic items, contributing to both the event ranking and the all-time universal ranking
- **Pledge allocations** split a single pledge across multiple items (e.g. 60% Purple, 40% Blue)
- **Shared fund** allows generous donors to top up a communal pot so others (e.g. children) can participate without paying

---

## Stack

- **Framework:** Next.js 15, App Router, TypeScript — no `src/` prefix, files live at root level (`app/`, `components/`, `lib/`, `types/`, `scripts/`)
- **UI:** shadcn/ui with Base UI (preset b0), Tailwind 4, Lucide icons
- **Auth:** Clerk (`@clerk/nextjs`) — login is optional for guests
- **Database:** Supabase (Postgres + Realtime)
- **Payments:** Stripe (marketplace model — FavPoll collects, disburses to charities)
- **Email:** Resend (`lib/email.ts`)
- **Package manager:** pnpm only — never npm or yarn
- **Hosting:** Vercel
- **Cron:** Vercel cron (`vercel.json`) — hourly `POST /api/cron/close-events`

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
  label text not null,              -- Nature, Music, Film & TV, Food & Drink, Places, Sport, Literature, Everyday life, Childhood, Time
  description text,
  created_at timestamptz
)

topics (
  id uuid primary key,
  title text not null,              -- Short title, no "Favourite" prefix: "Colour", "Season"
  description text,
  is_finite boolean default false,
  is_active boolean default true,   -- false = not shown to guests (unvetted custom topics)
  placeholders jsonb default '{}',  -- per-occasion { framing, quote } pairs keyed by occasion slug
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
  is_master boolean default true,
  source text default 'seed',       -- 'seed' | 'organiser' | 'guest'
  event_count integer default 0,
  total_pledge_count integer default 0,
  created_at timestamptz
)

persons (
  id uuid primary key,
  name text not null,
  date_label text,                  -- Free-text date string, e.g. "1940–2024" or "Turning 40"
  bio text,
  photo_url text,
  created_by text references users(id),
  created_at timestamptz
)

events (
  id uuid primary key,
  person_id uuid references persons(id),
  occasion text not null,           -- see Occasion Types below
  occasion_label text,              -- custom override, e.g. "In loving memory of"
  created_by text references users(id),
  description text,
  closes_at timestamptz not null,
  original_closes_at timestamptz,   -- set at creation = closes_at, never updated
  hard_close_at timestamptz,        -- set at creation = closes_at + 90 days, immutable
  extension_count integer default 0,
  closed_at timestamptz,            -- set by cron when closes_at passes
  total_raised numeric default 0,   -- stamped by cron at close
  is_private boolean default false,
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
  personal_framing text,
  personal_quote text,
  created_at timestamptz
)

event_poll_items (
  id uuid primary key,
  event_poll_id uuid references event_polls(id) on delete cascade,
  topic_item_id uuid references topic_items(id),
  is_guest_added boolean default false,
  added_by text references users(id),
  display_order integer default 0,
  is_prioritized boolean default false,
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
```

---

## Occasion Types

```
'memorial' | 'tribute' | 'birthday' | 'retirement' |
'wedding' | 'anniversary' | 'leaving' | 'graduation' |
'christening' | 'achievement' | 'recovery' | 'award' |
'promotion' | 'celebration' | 'other'
```

### Default display headline prefixes (from `lib/display.ts`)

```
memorial   → "In memory of"
tribute    → "A tribute to"
birthday   → "Happy birthday"
retirement → "Celebrating the retirement of"
wedding    → "Congratulations to"
anniversary→ "Happy anniversary"
leaving    → "Farewell"
graduation → "Congratulations"
christening→ "Welcome"
achievement→ "Well done"
recovery   → "Cheering on"
award      → "Congratulations to"
promotion  → "Congratulations to"
celebration→ "Celebrating"
other      → "Honouring"
```

The organiser can override the prefix with a custom `occasion_label` stored on the event.

---

## Topic Types

### Finite (`is_finite = true`) — fixed answer set
Colour, Season, Day of the week, Meal of the day, Time of day, Decade, and others.

### Infinite (`is_finite = false`) — open answer set
Organiser can pin/prioritise items. Guests can suggest additions (flagged for review). Custom organiser topics are created with `is_active = false`.

### Canonical colour list (CSS named colours, no hex stored)
Red, Orange, Yellow, Green, Blue, Purple, Pink, Brown, Black, White, Grey
Rendered as: `<div style={{ backgroundColor: item.label.toLowerCase() }} />`

### Topic placeholders
Each topic has a `placeholders` JSONB column with entries keyed by occasion slug:
```json
{
  "memorial": { "framing": "Belinda always loved...", "quote": "She always said..." },
  "birthday":  { "framing": "...", "quote": "..." },
  ...
  "default":   { "framing": "...", "quote": "..." }
}
```
Used to pre-fill the event poll framing/quote fields in the canvas. All 15 occasion keys + `default` should be present on every topic.

---

## Key Application Files

```
app/
├── layout.tsx
├── page.tsx                              -- Landing page / home carousel
├── events/
│   ├── page.tsx                          -- Organiser's event list
│   ├── actions.ts                        -- deleteEvent server action
│   ├── delete-event-button.tsx
│   ├── new/
│   │   ├── page.tsx                      -- Create event (EventCanvas in create mode)
│   │   └── actions.ts                    -- createEvent server action
│   └── [id]/
│       ├── page.tsx                      -- Public event page
│       ├── display/page.tsx              -- Live display for projector
│       ├── manage/page.tsx               -- Organiser dashboard
│       ├── actions.ts                    -- Per-event server actions
│       └── edit/
│           ├── page.tsx                  -- Edit event (EventCanvas in edit mode)
│           └── actions.ts               -- updateEvent server action
├── topics/[id]/page.tsx                  -- Topic detail / all-time rankings
├── rankings/page.tsx                     -- All-time rankings browse
├── pledges/withdraw/
│   ├── page.tsx
│   └── actions.ts
├── api/
│   ├── webhooks/clerk/route.ts
│   ├── stripe/payment-intent/route.ts
│   ├── events/[id]/request-extension/route.ts
│   └── cron/close-events/route.ts
├── sign-in/ and sign-up/

components/
├── ui/                                   -- shadcn primitives
├── event-canvas/                         -- EventCanvas + useCanvas + utils (create/edit)
├── canvas/                               -- Sub-components: PollEditor, CanvasSidebar, TopicPicker, etc.
│   └── canvas-sidebar/                   -- ClosingDate, CharityPicker, SharedFund, PrivacyToggle
├── event-content/                        -- EventContent + useEventContent (public view)
├── poll-section/                         -- PollSection + usePollSection
├── pledge-card/                          -- PledgeCard + usePledge + helpers
├── ranking-list/                         -- RankingList component
├── display-screen/                       -- LiveDisplay component
├── event-hero.tsx
├── event-subheader.tsx                   -- Organiser bottom bar (edit / share results)
├── charity-banner.tsx
├── countdown.tsx
├── favpoll-logo.tsx
├── header.tsx
├── home-carousel.tsx
└── poll-heading.tsx

lib/
├── supabase/
│   ├── client.ts                         -- Browser client (use in client components)
│   ├── server.ts                         -- Server client (use in server components/actions)
│   └── admin.ts                          -- Service role client (use in API routes / cron)
├── occasions.ts                          -- OCCASION_LIST, OCCASION_LABELS, NAME_LABELS, OCCASION_PLACEHOLDERS
├── display.ts                            -- getEventHeadline, formatEventDate, ordinal
├── email.ts                              -- sendPledgeConfirmation, sendEventClosed, sendExtensionRequest
├── edit-mode-context.tsx
└── utils.ts

types/index.ts                            -- All shared TypeScript types
scripts/seed.ts                           -- pnpm seed — idempotent, additive only
```

---

## Design System

### Brand colours
```
Primary:   #534AB7
Mid:       #7F77DD
Light:     #EEEDFE
Border:    #AFA9EC
Green:     #1D9E75
```

### Edit mode field treatment
- Filled editable field: `border-b-[1.5px] border-[#AFA9EC] pb-0.5`
- Focused: `border-[#534AB7]`
- Placeholder: `text-muted-foreground italic`
- Guest view: no underlines, no placeholders, no edit controls

### Button conventions
- Never use raw `<button>` — always use shadcn `Button`
- Primary: `<Button>` — solid purple
- Quiet secondary: `<Button variant="ghost" size="sm">`

### Other conventions
- `aria-live="polite"` on all live-updating values
- American spelling in code (color, organize), UK English in UI copy strings
- Colour items rendered using `item.label.toLowerCase()` as CSS colour — no hex stored

---

## Poll Closing Rules

- Closing date required at creation; no suggested default shown
- `original_closes_at` = `closes_at` at creation, never updated
- `hard_close_at` = `closes_at` + 90 days at creation, immutable
- **Extension count = 0**: standard date picker, no warning
- **Extension count = 1**: date picker + quiet note "One extension remaining after this."
- **Extension count ≥ 2**: picker disabled; organiser must submit a request form → `POST /api/events/[id]/request-extension` → Resend email to `SUPPORT_EMAIL`
- **Auto-close**: Vercel cron runs hourly, closes events where `closes_at <= now` and `closed_at IS NULL`, stamps `closed_at` and `total_raised`, emails organiser
- Cannot reopen a closed event
- Closed event UI: summary card (closed date + total raised) replaces pledge panel; "Poll closed" replaces countdown; edit button hidden; organiser sees "Share results" (copies link)

---

## Multiple Charities

- Up to 3 per event (enforced in application logic)
- Stored in `event_charities` join table with `display_order`
- Proceeds split equally on disbursement (Stripe TODO)

---

## Auth — Guest Pledging

- Login optional for guests
- Guest pledges: `clerk_user_id = null`, `guest_email` required
- `guest_token`: UUID for withdrawal link, nulled after use
- Signed-in users: withdraw from profile page
- Duplicate check: `guest_email + event_poll_id + withdrawn_at IS NULL`

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
RESEND_FROM_EMAIL                         -- From address for all outbound email
SUPPORT_EMAIL                             -- Receives extension requests
NEXT_PUBLIC_BASE_URL
CRON_SECRET                               -- Bearer token checked by /api/cron/close-events
```

---

## Claude Code Skills (`.claude/commands/`)

| Skill | Purpose |
|---|---|
| `/seed` | Check seed.ts diff, run `pnpm seed`, flag anomalies |
| `/add-placeholders` | Write/update placeholder blocks for one or more topics |
| `/new-topic` | Scaffold a complete new TopicSeed object with all 15 occasion keys |
| `/db-migrate` | Audit schema vs types, generate safe `ADD COLUMN IF NOT EXISTS` SQL |
| `/favpoll-context` | Load full project context at session start |

---

## Outstanding TODO

- Stripe Connect — charity disbursement on close (cron has placeholder)
- Stripe Checkout — payment flow in pledge card
- User profile / donor history page
- All-time rankings browse page (`/rankings` exists but may be incomplete)
- Email templates — currently plain HTML strings, no design
- Rate limiting on API routes
- Analytics
