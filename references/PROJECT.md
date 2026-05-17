# favpoll — Project Document

## What is favpoll?

favpoll is a charitable polling platform for life events — memorials, funerals, birthdays, retirements, weddings, and more. An organiser creates an event honouring a person, selects one or more charities, picks poll topics (favourite colour, favourite biscuit, etc.), and shares a link with guests. Guests pledge real money against their favourite options. The rankings update in real time. All proceeds go to the chosen charities.

Every pledge also feeds a permanent all-time universal ranking of human favourites — a collectively funded, financially weighted record of what people love most, built through acts of generosity.

---

## The Core Idea

- **Events** honour a person on a specific occasion
- **Topics** are canonical questions — Colour, Season, Biscuit, Film, etc.
- **Event polls** activate a topic within an event, with a personal framing ("Rebecca's favourite colour was purple — what's yours?") and an optional quote
- **Pledges** are financial commitments against specific topic items, contributing to both the event ranking and the all-time universal ranking
- **Pledge allocations** split a single pledge across multiple items (e.g. 60% Purple, 40% Blue)
- **Shared fund** allows generous donors to top up a communal pot so others (e.g. children) can participate without paying

---

## Stack

- **Framework:** Next.js 15, App Router, TypeScript, `src/` directory
- **UI:** shadcn/ui with Base UI (preset b0), Tailwind 4, Lucide icons
- **Auth:** Clerk (`@clerk/nextjs`) — login is optional for guests
- **Database:** Supabase (Postgres + Realtime)
- **Payments:** Stripe (marketplace model — favpoll collects, disburses to charities)
- **Email:** Resend
- **Package manager:** pnpm
- **Hosting:** Vercel
- **Domain:** favpoll.com

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
  source text default 'seed',
  event_count integer default 0,
  total_pledge_count integer default 0,
  created_at timestamptz
)

protagonists (
  id uuid primary key,
  name text not null,
  created_by text references users(id),
  created_at timestamptz
)

events (
  id uuid primary key,
  protagonist_id uuid references persons(id),
  occasion text not null,
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
  personal_framing text,
  personal_reveal text,
  created_at timestamptz
)

event_poll_items (
  id uuid primary key,
  event_poll_id uuid references event_polls(id) on delete cascade,
  topic_item_id uuid references topic_items(id),
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

```
'memorial' | 'funeral' | 'birthday' | 'retirement' |
'wedding' | 'anniversary' | 'leaving_do' | 'inclusion' |
'christening' | 'bar_bat_mitzvah' | 'get_well_soon' |
'sports_achievement' | 'work_milestone' | 'just_because' | 'other'
```

### Fields shown per occasion

| Field | Occasions |
|---|---|
| Birth year | memorial, funeral, birthday, christening |
| Death year | memorial, funeral (required) |
| Description | all (required for sports_achievement, work_milestone, just_because, other) |

### Display headline prefixes

```
memorial / funeral → 'In memory of'
birthday           → 'Happy birthday'
retirement         → 'Celebrating the retirement of'
wedding            → 'Congratulations to'
anniversary        → 'Happy anniversary'
leaving_do         → 'Farewell'
inclusion         → 'Congratulations'
christening        → 'Welcome'
bar_bat_mitzvah    → 'Mazel tov'
get_well_soon      → 'Get well soon'
sports_achievement → 'Well done'
work_milestone     → 'Celebrating'
just_because       → 'For'
other              → 'Honouring'
```

---

## Topic Types

### Finite (is_finite = true) — fixed list, no additions
Colour, Season, Day of the week, Meal of the day, Time of day, Decade

### Infinite (is_finite = false) — open list
Organiser can pin/reorder (not remove) items. Guests can suggest additions.

### Canonical colour list (CSS named colours, no hex stored)
Red, Orange, Yellow, Green, Blue, Purple, Pink, Brown, Black, White, Grey
Rendered as: `<div style={{ backgroundColor: item.label.toLowerCase() }} />`

---

## Key Application Files

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                       -- Landing page
│   ├── events/
│   │   ├── new/page.tsx               -- Create event (in-place editing)
│   │   └── [id]/
│   │       ├── page.tsx               -- Event page (guest + edit mode)
│   │       └── display/page.tsx       -- Live display for projector
│   ├── pledges/withdraw/page.tsx      -- Guest withdrawal via token
│   └── api/
│       ├── webhooks/clerk/route.ts
│       ├── topics/[id]/check-duplicate/route.ts
│       ├── events/[id]/request-extension/route.ts
│       └── cron/close-events/route.ts
├── components/
│   ├── ui/
│   ├── event-hero.tsx
│   ├── charity-banner.tsx
│   ├── pot-banner.tsx
│   ├── poll-section.tsx
│   ├── ranking-list.tsx
│   ├── pledge-panel.tsx
│   └── shared-fund-pledge.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── display.ts                     -- getEventHeadline, formatEventDate, ordinal
│   └── utils.ts
├── types/index.ts
└── scripts/seed.ts                    -- pnpm seed
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
- Guest view: no underlines, no placeholders

### Button conventions
- Primary: `<Button className="w-full">` — solid purple, full width
- Quiet secondary: `<Button variant="ghost" size="sm">`
- Never use raw `<button>` — always use shadcn Button

---

## Poll End Date Rules

- Required at creation, no suggested default
- Organiser can extend freely up to hard_close_at (created_at + 90 days, immutable)
- 1st extension: free
- 2nd extension: inline warning
- 3rd extension: blocked, must request via form (emails FAVPOLL_ADMIN_EMAIL)
- Auto-close: Vercel cron hourly, closes events where closes_at <= now
- Disbursement: automatic on close (Stripe TODO)
- Cannot reopen closed events

---

## Multiple Charities

- Up to 3 per event (enforced in application logic)
- Stored in event_charities join table
- Proceeds split equally on disbursement

---

## Auth — Guest Pledging

- Login optional for guests
- Guest pledges: clerk_user_id = null, guest_email required
- guest_token: UUID for withdrawal link, nulled after use
- Signed-in users: withdraw from profile page
- Duplicate check: guest_email + event_poll_id + withdrawn_at is null

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

## Outstanding TODO

- Stripe Connect — charity disbursement (cron has placeholder)
- Stripe Checkout — payment in pledge panel
- User profile / donor history page
- All-time rankings browse page
- Email templates (currently plain text)
- Localisation (UI copy is UK English, code uses American spelling)
- Mobile app
- Rate limiting on API routes
- Analytics
