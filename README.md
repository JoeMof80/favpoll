# favpoll

A charitable polling platform where guests share their favourite things while pledging donations to charity. Organisers create events for special occasions — memorials, birthdays, retirements, weddings — each with a customised poll question. Guests pledge money and split it across their favourite answers, building a permanent record of what people love most while raising funds for good causes.

---

## How it works

1. **Organiser creates an event** — chooses an occasion, uploads a photo, writes a short bio, selects up to 3 charities, and sets up a poll (e.g. "What was Belinda's favourite film?")
2. **Guests receive a link** — they browse the event, pick their favourites, and pledge an amount split across their choices
3. **Donations flow to charity** — all pledges go directly to the selected charities with no platform cut
4. **Rankings persist** — every pledge contributes to all-time global rankings, creating a lasting tribute

---

## Tech stack

| Layer           | Technology                         |
| --------------- | ---------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack) |
| Language        | TypeScript 5                       |
| Styling         | Tailwind CSS v4, shadcn/ui         |
| Auth            | Clerk                              |
| Database        | Supabase (PostgreSQL)              |
| Payments        | Stripe                             |
| Email           | Resend                             |
| Package manager | pnpm                               |

---

## Project structure

```
app/
  api/
    stripe/payment-intent/   POST — creates Stripe PaymentIntent
    webhooks/clerk/          POST — syncs Clerk users to Supabase
  events/
    new/                     Create event (canvas form)
    [id]/                    View event (public or private)
    [id]/edit/               Edit event (organiser only)
    [id]/manage/             Organiser dashboard
  pledges/
    withdraw/                Guest pledge withdrawal (token-based)
  rankings/                  All-time global favourites
  topics/[id]/               Per-topic leaderboard with dual ranking toggle
  sign-in/, sign-up/         Clerk auth pages

components/
  canvas/                    Sub-components used only by event-canvas
    canvas-sidebar.tsx         Charity, date, privacy, shared fund settings
    poll-editor.tsx            Topic picker and poll framing editor
    share-screen.tsx           Post-publish share link screen
    topic-picker.tsx           Browse and select topics by category
  event-canvas/              Full create/edit form
    index.tsx                  JSX — occasion tabs, hero, poll editors, sidebar
    use-canvas.ts              All form state, validation, and submit logic
    utils.ts                   CanvasState type, newPoll factory, MAX_CHARITIES
  event-content/             Event view page composition
    index.tsx                  JSX — two-column layout wiring all sub-components
    use-event-content.ts       pledgeAmount, pollSelections, addItemHandler
  pledge-card/               Pledge confirmation card (right sidebar)
    index.tsx                  JSX — amount input, breakdown, confirm button
    use-pledge.ts              All pledge state, validation, and submit handlers
    amount-input.tsx           £-prefixed numeric input
    amount-presets.tsx         Quick-select amount buttons
    pledge-breakdown.tsx       Itemised cost breakdown
    utils.ts                   GBP formatter, fund colour constants, formatCharityLabel
  poll-section/              Individual poll with pledge/results toggle
    index.tsx                  JSX — ranking toggle, RankingList, PledgePanel
    use-poll-section.ts        view state, rankingView state, hasPledged transition
  ranking-list/              Sorted ranking bars with live updates
    index.tsx                  JSX — ordered list with animated bars
    use-ranking-items.ts       Supabase real-time subscription and re-sort logic
    utils.ts                   rankItems, formatAmount, RankedItem type
  ui/                        shadcn/ui primitives
    button.tsx, tabs.tsx, popover.tsx, toggle.tsx, …
  charity-banner.tsx         Charity logos with per-charity raised amount
  event-hero.tsx             Person photo, name, years, bio (view + edit modes)
  pledge-panel.tsx           Item selection chips and allocation display
  stripe-checkout.tsx        Stripe Elements payment modal
  pot-banner.tsx             Shared donation pot display
  countdown.tsx              Live closing countdown
  home-carousel.tsx          Homepage event showcase

lib/
  email.ts                   Resend — pledge confirmation emails
  occasions.ts               OCCASION_LABELS, OCCASION_PLACEHOLDERS
  supabase/                  Admin and browser Supabase clients
  utils.ts                   cn() and shared utilities

types/
  index.ts                   All TypeScript types

scripts/
  seed.ts                    Populates charities and topics
```

---

## Database schema

### Core tables

**`persons`** — the person being celebrated
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| bio | text | |
| birth_year | int | |
| death_year | int | |
| photo_url | text | |
| created_by | text | Clerk user ID |

**`events`** — the main event record
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| person_id | uuid | FK → persons |
| occasion | text | memorial / birthday / retirement / wedding / other |
| created_by | text | Clerk user ID |
| closes_at | timestamptz | |
| is_private | bool | |

**`event_charities`** — up to 3 charities per event
| Column | Type | Notes |
|---|---|---|
| event_id | uuid | FK → events |
| charity_id | uuid | FK → charities |
| display_order | int | |

**`charities`**
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| description | text | |
| logo_url | text | |
| registered_number | text | |

**`topics`** — poll questions (curated or organiser-created)
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| title | text | e.g. "Favourite biscuit" |
| is_finite | bool | finite = fixed options; infinite = open-ended |
| created_by | text | |

**`topic_items`** — options within a topic
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| topic_id | uuid | FK → topics |
| label | text | e.g. "Custard Cream" |
| is_master | bool | curated vs. user-added |
| all_time_pledged | numeric | running total across all events |
| all_time_count | int | times selected across all events |

**`event_polls`** — a topic attached to an event with optional personal framing
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| event_id | uuid | FK → events |
| topic_id | uuid | FK → topics |
| personal_framing | text | e.g. "Belinda's favourite was always the Lake District — what's yours?" |
| personal_quote | text | |

**`event_poll_items`** — curated item selection for infinite topics
| Column | Type | Notes |
|---|---|---|
| event_poll_id | uuid | FK → event_polls |
| topic_item_id | uuid | FK → topic_items |
| is_guest_added | bool | |
| added_by | text | Clerk user ID |

**`pledges`**
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| event_poll_id | uuid | FK → event_polls |
| clerk_user_id | text | null for guest pledges |
| guest_email | text | null for signed-in pledges |
| guest_token | uuid | one-time withdrawal token; nulled after use |
| total_amount | numeric | in GBP |
| fee | numeric | 3% processing fee |
| withdrawn_at | timestamptz | null if active |

Check constraint: `clerk_user_id IS NOT NULL OR guest_email IS NOT NULL`

**`pledge_allocations`** — how a pledge is split across items
| Column | Type | Notes |
|---|---|---|
| pledge_id | uuid | FK → pledges |
| topic_item_id | uuid | FK → topic_items |
| amount | numeric | |

**`event_pots`** — optional shared donation pool
| Column | Type | Notes |
|---|---|---|
| event_id | uuid | FK → events |
| total_deposited | numeric | |
| total_allocated | numeric | |

**`pot_allocations`** — amounts assigned to individual guests
| Column | Type | Notes |
|---|---|---|
| pot_id | uuid | FK → event_pots |
| allocated_to | text | Clerk user ID |
| amount | numeric | |

---

## Topic types

**Finite topics** have a fixed, pre-curated list of options (e.g. colours, seasons). All items come from `topic_items` where `is_master = true`.

**Infinite topics** have an open-ended list (e.g. films, songs, holiday destinations). Organisers curate a starting set when setting up the poll; guests can add their own during pledging. Items are stored in `event_poll_items` joined to `topic_items`.

---

## Environment variables

Create `.env.local` at the project root:

```bash
# Clerk — https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase — https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe — https://dashboard.stripe.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Resend — https://resend.com
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

## Local development

```bash
# Install dependencies
pnpm install

# Start the dev server (Turbopack)
pnpm dev
```

App runs at [http://localhost:3000](http://localhost:3000).

---

## Database seeding

The seed script populates the initial charity and topic data:

```bash
pnpm seed
```

This inserts:

- **12 UK charities** — Age UK, Alzheimer's Society, British Heart Foundation, Cancer Research UK, Crisis, Dogs Trust, Macmillan Cancer Support, Marie Curie, Mind, RNLI, Shelter, St Mungo's, The Trussell Trust
- **Curated topics** — a starter set of finite and infinite poll topics with pre-populated options

Run seed once after setting up the database. Re-running is safe (uses upsert).

---

## Authentication

Clerk handles all auth. Protected routes call `auth()` from `@clerk/nextjs/server` and redirect to `/sign-in` if there is no session.

**Webhook sync** — `POST /api/webhooks/clerk` receives `user.created`, `user.updated`, and `user.deleted` events from Clerk and mirrors the user record into Supabase. Configure the webhook endpoint in the Clerk dashboard pointing to `/api/webhooks/clerk`.

---

## Payment flow

1. Guest selects poll options and enters a pledge amount
2. Frontend calls `POST /api/stripe/payment-intent` with the amount in GBP
3. Server creates a `PaymentIntent` and returns the `clientSecret`
4. Stripe Elements renders the payment form; guest confirms
5. On success, `createPledge` server action records the pledge and allocations in Supabase and updates `all_time_pledged` on the relevant `topic_items`

A 3% processing fee is added on top of the pledged amount and shown to the guest before confirmation.

---

## Other scripts

```bash
pnpm build       # Production build
pnpm start       # Start production server
pnpm lint        # ESLint
pnpm typecheck   # tsc --noEmit
pnpm format      # Prettier (all .ts/.tsx files)
```
