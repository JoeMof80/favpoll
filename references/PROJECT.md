# favpoll — Project Document

## What is favpoll?

favpoll is a charitable polling platform for life events — memorials, funerals, birthdays, retirements, weddings, and more. An organiser creates a favpoll honouring a person, selects one or more charities, picks a poll topic (favourite colour, favourite biscuit, etc.), and shares a link with guests. Guests pledge real money against their favourite options. The rankings update in real time. All proceeds go to the chosen charities.

Every pledge also feeds a permanent all-time universal ranking of human favourites — a collectively funded, financially weighted record of what people love most, built through acts of generosity.

---

## The Core Idea

- **Favpolls** honour a person (protagonist) on a specific occasion
- **Topics** are canonical questions — Colour, Season, Biscuit, Film, etc.
- **Favpoll polls** activate a topic within a favpoll, with an optional personal reveal (shown after pledging). The reveal is the sole mechanic for disclosing the protagonist's favourite — no hint line is shown before pledging.
- **Pledges** are financial commitments against specific favourites, contributing to both the favpoll ranking and the all-time universal ranking
- **Pledge allocations** split a single pledge across multiple favourites (e.g. 60% Purple, 40% Blue)
- **Shared fund** allows generous donors to top up a communal pot so others (e.g. children) can participate without paying

---

## Stack

- **Monorepo:** pnpm workspace — `apps/web` (Next.js main app), `apps/admin` (Next.js admin panel), `packages/types` (shared domain types as `@favpoll/types`)
- **Framework:** Next.js 15, App Router, TypeScript
- **UI:** shadcn/ui with Base UI (preset b0), Tailwind 4, Lucide icons, Framer Motion, Embla Carousel
- **Component catalogue:** Storybook (`@storybook/nextjs-vite`), co-located `.stories.tsx` files
- **Auth:** Clerk (`@clerk/nextjs`) — login is optional for guests. Admin app requires `publicMetadata.role === 'admin'` on the Clerk user.
- **Database:** Supabase (Postgres). Production and staging are separate projects. Realtime is NOT usable browser-side (RLS with no policies filters all postgres_changes — see Live mode); live surfaces poll server data instead.
- **Payments:** Stripe (marketplace model — favpoll collects, disburses to charities via Stripe Connect Express). Connect application submitted, pending approval.
- **Image cropping:** react-easy-crop (inline crop within photo dialog, rounded-rect 1:1, JPEG output)
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

favourites (
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
  pronoun text CHECK (pronoun IN ('he', 'she', 'they')),  -- null for cause favpolls and legacy rows
  created_by text references users(id),
  created_at timestamptz
)

favpolls (
  id uuid primary key,
  protagonist_id uuid references protagonists(id),  -- null for cause favpolls
  subject text not null default 'someone'     -- 'someone' | 'cause'; independent of register
    CHECK (subject IN ('someone','cause')),
  cause_label text,                 -- required when subject='cause'; up to 60 chars
  occasion_type text,               -- Legacy: free-text occasion. Kept for backward compat; superseded by category.
  category text               -- 'celebration' | 'memorial' | 'fundraiser'. Nullable: legacy rows AND all cause favpolls created from 2026-07-13 (a cause has no type; cause rows created before then carry a legacy 'fundraiser'). register is derived via deriveRegister(category, grouping, subject) — subject-first, so subject='cause' → cause register regardless of category.
    CHECK (category IN ('celebration','memorial','fundraiser')),
  grouping text not null default 'individual'
    CHECK (grouping IN ('individual','couple','group')),
  opening_line text,
  market text not null default 'en-GB',
  created_by text references users(id),
  description text,
  closes_at timestamptz not null,
  is_private boolean default false,
  closed_at timestamptz,
  total_raised numeric default 0,
  goal_amount numeric,              -- optional pledge goal in pounds; CHECK > 0; null = no goal
  extension_count integer default 0,
  original_closes_at timestamptz,
  hard_close_at timestamptz,        -- created_at + 90 days, immutable
  is_listed boolean not null default true,  -- discoverability only; false = URL-accessible but not on /favpolls
  created_at timestamptz
)

favpoll_charities (
  id uuid primary key,
  favpoll_id uuid references favpolls(id) on delete cascade,
  charity_id uuid references charities(id),
  display_order integer default 0,
  created_at timestamptz
)

favpoll_polls (
  id uuid primary key,
  favpoll_id uuid references favpolls(id) on delete cascade,  -- UNIQUE(favpoll_id) enforced
  topic_id uuid references topics(id),
  personal_framing text,            -- Retired; column kept but app no longer reads or writes it
  personal_reveal text,             -- Disclosed after pledging
  created_at timestamptz
)

favpoll_poll_favourites (
  id uuid primary key,
  favpoll_poll_id uuid references favpoll_polls(id) on delete cascade,
  favourite_id uuid references favourites(id),
  is_guest_added boolean default false,
  is_hidden boolean default false,   -- Organiser can hide guest-added items from results
  hidden_at timestamptz,
  hidden_by text,                    -- Clerk user ID of organiser who hid it
  added_by text references users(id),
  created_at timestamptz
)

pledges (
  id uuid primary key,
  favpoll_poll_id uuid references favpoll_polls(id) on delete cascade,
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
  favourite_id uuid references favourites(id),
  amount numeric not null check (amount > 0)
)

favpoll_pots (
  id uuid primary key,
  favpoll_id uuid references favpolls(id) on delete cascade,
  created_by text references users(id),
  total_deposited numeric not null,
  total_allocated numeric default 0,
  created_at timestamptz
)

pot_allocations (
  id uuid primary key,
  pot_id uuid references favpoll_pots(id) on delete cascade,
  allocated_to text references users(id),
  amount numeric not null,
  created_at timestamptz
)

favpoll_invites (
  id uuid primary key,
  favpoll_id uuid references favpolls(id) on delete cascade,
  email text not null,
  created_at timestamptz
)

item_flags (
  id uuid primary key,
  favourite_id uuid references favourites(id) on delete cascade,
  clerk_user_id text references users(id),
  reason text,
  created_at timestamptz
)

charity_topics (
  charity_id uuid references charities(id) on delete cascade,
  topic_id   uuid references topics(id) on delete cascade,
  primary key (charity_id, topic_id)
)

generated_drafts (
  id uuid primary key,
  cache_key text not null unique,           -- "{register}:{topic_id}:{primary_charity_id|'none'}:{subject}:{pronoun|'none'}" (5-segment as of PR #138)
  register text,
  topic_id uuid references topics(id) on delete cascade,
  primary_charity_id uuid references charities(id) on delete cascade,  -- null for person favpolls
  subject text,                             -- 'someone' | 'cause'
  about text,
  reveal text,
  model text,
  status text default 'generated',         -- 'generated' | 'curated' | 'rejected'
  created_at timestamptz default now()
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
20260527000002_restore_topic_item_display_order.sql    -- favourites.display_order integer nullable
20260604000000_fix_review_status_pending.sql           -- corrects review_status 'pending' → 'pending_review' for existing rows
20260604120000_add_guest_pledge_columns.sql            -- guest_email, guest_token, withdrawn_at, pot_allocation_id on pledges; re-adds pledges_identity_check
20260607140000_derive_register.sql                     -- backfills occasion_type from register, then drops events.register column
20260609000000_add_is_listed.sql                       -- ADD COLUMN is_listed boolean NOT NULL DEFAULT true
20260609120000_add_category_grouping.sql         -- ADD COLUMN category + grouping; backfill from occasion_type/is_plural
20260610120000_generated_drafts.sql                    -- generated_drafts cache table for LLM-produced About/Reveal copy
20260611000000_add_subject_and_cause_label.sql   -- subject + cause_label columns; truncates generated_drafts
20260611120000_truncate_generated_drafts_prompt_update.sql -- truncate generated_drafts after person-prompt now gestures at charitable giving
20260613000000_add_charity_topics.sql                  -- charity_topics join table for admin-curated topic suggestions per charity
20260616000000_ubiquitous_language_rename.sql           -- events → favpolls, topic_items → favourites, plus every dependent FK/trigger/RLS rename; truncates all data (reseed via `pnpm seed`)
20260630000000_fix_review_status_constraint.sql         -- drops old topic_items_review_status_check constraint (retained pre-rename name); backfills any rows still holding 'pending' → 'pending_review'; re-adds as favourites_review_status_check CHECK (review_status IN ('pending_review','accepted','rejected')); sets DEFAULT 'pending_review'. DROP must precede UPDATE — the old constraint rejected 'pending_review'.
20260701000000_add_protagonist_pronoun.sql               -- ADD COLUMN pronoun text CHECK (pronoun IN ('he','she','they')) on protagonists; TRUNCATE generated_drafts (old 4-segment cache keys are orphaned by new 5-segment format)
20260704000000_add_goal_amount.sql                        -- ADD COLUMN goal_amount numeric CHECK (goal_amount IS NULL OR goal_amount > 0) on favpolls (optional pledge goal, pounds)
20260705000000_add_charity_verification.sql               -- ADD COLUMN verification_status/verified_name/verified_at on charities (Charity Commission check; null = never checked)
20260705100000_add_pledge_tip.sql                         -- ADD COLUMN tip_amount numeric NOT NULL DEFAULT 0 CHECK >= 0 on pledges (optional favpoll contribution, pounds; never charity money)
20260705120000_admin_dashboard_stats.sql                  -- admin_dashboard_stats() RPC (one-round-trip aggregates; service-role only)
20260705140000_add_pledge_identity.sql                    -- ADD COLUMN display_name/is_anonymous on pledges (guest wall + anonymity model)
20260705160000_rate_limits.sql                            -- rate_limits table + check_rate_limit() RPC (fixed-window; service-role only)
20260705180000_charity_stats.sql                          -- charity_stats(charity_id) RPC: per-charity total raised (equal-split across each favpoll's charities) + favpoll/live counts; service-role only
20260706000000_all_charity_stats.sql                      -- all_charity_stats() RPC: batch per-charity {total_raised, live_count} keyed by id (charities index; avoids N+1)
20260706020000_charity_impact_statement.sql               -- ADD COLUMN impact_statement text on charities (admin-curated pledge-time line)
20260706120000_disbursements.sql                          -- disbursements ledger: one row per (favpoll, charity) payout attempt on close; unique(favpoll_id,charity_id); service-role only. NoopProvider until Goodstack onboards.
20260708150000_live_slug.sql                              -- ADD COLUMN live_slug uuid unique default gen_random_uuid() on favpolls: capability slug for /live/[slug]
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

export type FavpollCategory = "celebration" | "memorial" | "fundraiser";
export type FavpollGrouping = "individual" | "couple" | "group";
```

### `deriveRegister(category: FavpollCategory | null, grouping: FavpollGrouping): Register`

Pure function in `lib/registers.ts`:

| category    | grouping        | register         |
| ----------- | --------------- | ---------------- |
| null        | any             | neutral          |
| memorial    | any             | remembering      |
| fundraiser  | any             | cause            |
| celebration | individual      | celebrating_one  |
| celebration | couple or group | celebrating_many |

### HONOUR step — subject + category are the inputs

The Honour step (`favpoll-flow/honour-step.tsx`) renders a forked who group and a conditional category row (redesigned 2026-07-13; both Radix `ToggleGroup` `type="single"`). ToggleGroup items render with `role="radio"` and `aria-checked` (not `role="button"`/`aria-pressed`) — tests must query with `getByRole("radio", { name: "..." })`.

**2026-07-30 revision — who moved to the Generate control.** The who
refinements (He/She/They → pronoun; Pair/Group → grouping) only shape
generated suggestions, so they moved out of the wizard into a segmented
icon strip attached to the form's "Generate a suggestion" button
(`form-inner.tsx`) — which also makes them editable after creation (the
strip renders in create AND edit mode; hidden for causes). The wizard's
honour step is now type-or-cause only: category chips + the OR fork +
"A cause"; `nextDisabled` gates on `subject !== "cause" && !category`.
The `pronoun` query param between wizard and details is no longer sent.
Changing the who strip re-derives `register` via `deriveRegister` so the
next generation uses the right grammar. The paragraphs below describe
the pre-revision wizard; the fork/any-order-answering grammar still
applies to what remains.

1. **Two complete paths, forked by an "OR" divider** (layout revised same day to the founder's second mock — the divider separates *complete answers to the step*, not options within the who question). Above the divider, the person path: five who options — **He / She / They** (`Mars`/`Venus`/`NonBinary` icons) / **Pair** (custom `PairIcon`) / **Group** (custom `GroupIcon`) — in a `grid-cols-4 sm:grid-cols-5` grid, followed by the category row. Below the divider, the cause path: **A cause** (`HeartHandshake` icon) alone. Person options set `subject='someone'` + grouping/pronoun (He/She/They → `grouping='individual'` + pronoun; couple/group → grouping + `pronoun=undefined`); "A cause" flips `subject='cause'`, `grouping='individual'`, `pronoun=undefined` with **`category=null` — a cause has no type** (`deriveRegister` is subject-first since the 2026-07-13 remodel, so no plumbing category is needed; memorial/celebration + cause was previously an allowed-but-incoherent state). The two who ToggleGroups share one selection model (selecting in one clears the other). Switching from cause back to a person starts the person path with no type chosen (cause carries `category=null` already). **No default selection** — Next is gated until a who option is chosen (`whoSelected = grouping !== "individual" || subject === "cause" || pronoun !== undefined`; the category gate is waived for cause — `(subject !== 'cause' && !category) || !whoSelected`). The wizard→details handoff omits the `category` param for a cause, and the details page's from-wizard gate is `Boolean(category) || subject === "cause"`. The cause-label input has been **removed** from the wizard — organisers enter the label on the details form instead. `pronoun` rides the redirect as a `pronoun` query param (only present for `subject='someone'`) and hydrates into `defaultValues.pronoun` on the details page.
2. **Category row** (Celebration `Balloon` / Memorial `Flower2` / Fundraiser `Medal`): **always live, never dimmed or disabled** (any-order answering is the step's grammar — founder overruled an earlier disable-on-cause design because a fresh page already lets you pick a type before a who). For a cause it shows **no selection** (`category=null` — the remodel landed 2026-07-13, superseding the interim invisible-plumbing `fundraiser`) — and **clicking a type chip hops back to the person path** (subject→'someone', cause deselects, the clicked type is kept, who empties so Next re-gates). Touch either side of the OR and you're on that side. Active ToggleGroupItem style: solid fill (`bg-primary text-primary-foreground`).

`register` is derived deterministically from category + grouping via `deriveRegister(cat, grp)` and set in the form. `is_listed` is auto-set to `false` when `deriveRegister` returns `"remembering"`. `subject` is set separately via `form.setValue("subject", sub)`.

`pronoun` is stored in `protagonists.pronoun` (null for cause favpolls and couple/group favpolls). It is passed as a 5th segment in the `generated_drafts` cache key and appended as a prompt hint in `buildPrompt` for person favpolls: `\nUse "${pronoun}" pronouns when referring to the person being honoured.`

### Legacy: `registerForOccasionType(occasionType)` and `occasion_type`

Kept internally for the backfill and any legacy read paths. `occasion_type` column remains on `favpolls` and is nullable. New favpolls write `category` + `grouping`; `occasion_type` is left null. `effectiveRegister` and `DEFAULT_OCCASION_TYPE` exports are removed.

### Favpoll subject

`subject` ('someone' | 'cause') is stored on the `favpolls` table — independent of register.
A fundraiser can honour a person (`subject='someone'`) or a cause (`subject='cause'`).
When `subject='cause'`: no protagonist row is created; `cause_label` is stored instead.

**Normalised structure (2026-07-30,
`20260730100000_favpoll_cause_photo_context.sql`, applied to staging AND
prod):** every favpoll type has an optional image and context line. For
causes these live on the favpoll row (`favpolls.photo_url`,
`favpolls.context`); for persons they stay on the protagonist. The edit
form offers the photo-upload slot and Context field for all subjects
(`EditableHero` no longer gates them on subject); the create/edit actions
route the values by subject. On PUBLIC heroes, no photo → no avatar at
all (the hatched initials placeholder appears only on the form's upload
slot); `HeroLayout`'s min-height (settled avatar size: 72px / md 84px)
keeps the stuck band height identical with or without an avatar.
`CauseHero` renders the context line as its subtitle via
`getFavpollHeadline`'s `dateLabel` and the photo through the same avatar
slot as person heroes.

### Display headline matrix (from `lib/display.ts` `getFavpollHeadline`)

`getFavpollHeadline` accepts an optional `subject?: 'someone' | 'cause'` param (defaults `'someone'`).
When `subject` is not provided by a caller, name param is the protagonist name as before.
When `subject='cause'`, callers pass `cause_label` as the `name` param.

| register | subject='someone' | subject='cause' |

| ---------------- | ----------------- | --------------- |
| remembering | In memory of | In memory of |
| celebrating_one | Celebrating | Celebrating |
| celebrating_many | Celebrating | Celebrating |
| cause | **Honouring** | In support of |
| neutral | Honouring | Honouring |

Occasion-type prefixes from `OCCASION_TYPE_PREFIXES` (e.g. "Fundraiser" → "In support of") continue
to take priority over register prefix and are NOT subject-aware.

### Default poll closing period (`suggestClosingDate(category, eventDate?)` in `lib/registers.ts`)

| FavpollCategory | Days until close |
| --------------- | ---------------- |
| memorial        | 30               |
| celebration     | 14               |
| fundraiser      | 14               |
| null            | 14               |

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
/                              -- Home. Purple hero band: LandingHero (components/landing/hero.tsx) — three register ROUTER CARDS (the `router` prop; the demo moved to the register pages in #519–#522, and the hero eyebrow is retired), fixed triad headline ("Pick your favourite. Give what it's worth. See where it stands." — landing.headline, one sentence per line; 2026-08-06), short CTA caption beside the button (landing.cta.free), monogram shimmer texture, count-up stats. Body: full-bleed alternating bands (white · bg-primary/5) — HowItWorksThreeBeat (#how), AnyoneCanAnswer (#anyone), WatchItHappen (#watch — the section itself is "the room": tint + floor gradient + overflow-hidden crop live on the section wrapper), LiveFavpollsCarousel (#live, is_listed=true only, rendered only when live favpolls exist), then the record as a ONE-LINE principle band (landing.record.* i18n keys — no headline, no tiles, quiet "The record →" link to /rankings; the RecordHolders tile section + its £500/≥3-items landing gate were removed 2026-07-11 per the concept model's "recede" decision), then the final CTA on the purple monogram band (brand statement + secondary CTA — the page closes the way it opens; the Venn was retired from the landing 2026-07-15 and lives only on /about). Section eyebrows "How it works"/"Custom favpoll"/"Live favpoll" were removed 2026-07-15 as vestigial (the sections' own headers carry them); "Open right now" remains on the carousel. The #anyone and #watch h2s live in their sections' left columns. No rail nav. SiteFooter mounts app-wide via SiteFooterMount in the root layout (money/wills trust blurbs live there, not in the body). The hero demo shows on all viewports, optically scaled (`sm:scale-80`, `scale-[0.62]` below); on mobile it stacks below the pitch/stats. Supabase query must NOT select `register` (dropped column — causes Supabase to return `{ data: null }` silently, showing "No live favpolls yet").
/landing-v2                    -- RETIRED. Route and the whole components/landing-v2/ directory are deleted (PR feat/landing-polish); the surviving Venn lives at components/landing/honour-charity-love-venn.tsx. The unused root-level honour-charity-love-venn.tsx and favpoll-mark.tsx were deleted in the same pass.
/about                         -- About page (leaned down 2026-07-08 for the three-surfaces model — audience: trust/charities/press/partners): brand-statement hero (purple band + monogram texture), Principles section (Charity·Honour·Love triad + Venn, no-fee line, record principle line linking /rankings — added 2026-07-11), contact form (ContactForm). The 2026-07-03 rich version (founding story, register sections, #money/#wills anchors) is gone — footer trust blurbs now link to /about plain. Server component; copy in the favpoll-brand voice.
/favpolls                      -- Live favpolls grid (public, no auth)
/favpolls/new                  -- New favpoll wizard (3-step page: Honour → Charity → Love)
/favpolls/new/details          -- Create favpoll form (FavpollForm); reached from wizard with pre-populated query params
/favpolls/[id]                 -- Favpoll page — guest pledge view + edit mode toggle
/favpolls/[id]/edit            -- Edit favpoll (FavpollForm)
/favpolls/[id]/opengraph-image -- The favpoll's share card (next/og, 1200×630 PNG), drawn by lib/og/cards.tsx from lib/og/favpoll-og-data.ts. Photo (or initials / the mark), eyebrow + name, "Pick your favourite <topic>" (closed: "Favourite <topic> — closed"), "Every pound goes to <charities>", wordmark. Private favpolls and unknown ids get the site card — this route has no sign-in gate in front of it. Cache-Control s-maxage=3600 (NOT ImageResponse's immutable default: the name and photo are editable). Nested routes (keepsake, pack) inherit it.
/opengraph-image               -- The site card (wordmark, the three-beat headline one beat per line, brand statement, the mark). Static; every page without a nearer card inherits it.
/live/[slug]                   -- Live display for projector screen, behind an UNGUESSABLE capability slug (favpolls.live_slug, 2026-07-08) — possession of the link is the authorisation (wall labels always shown; standings full). Old /favpolls/[id]/live and /favpolls/[id]/display permanentRedirect to the PUBLIC guest page (deliberately NOT resolving id→slug, which would defeat the slug). Cause-aware (cause_label shown when subject='cause'). Freshness via interval router.refresh() — NOT realtime (see Live mode chapter). Organiser copies the /live/{slug} URL from OrganizerCard.
/my-favpolls                     -- Organiser's favpoll management surface (auth required). OrganizerPageClient handles filter (All/Active/Closed) and sort (Closing soonest / Recently created / Highest raised) client-side. Each OrganizerCard shows: identity row + status badge (amber warning ≤7 days), total raised, poll topic row, shared fund row, Listed/Unlisted toggle, QR + share link block, charity footer + Live display button. Manage page (/favpolls/[id]/manage) was retired — this card is the single management surface. WARNING_THRESHOLD_DAYS = 7.
/rankings                      -- Global all-time rankings
/topics/[id]                   -- Individual topic rankings
/pledges/withdraw              -- Guest pledge withdrawal via token
/sign-in, /sign-up             -- Clerk auth pages

API:
/api/cron/close-favpolls         -- Vercel cron (hourly), closes expired favpolls
/api/stripe/payment-intent     -- Creates Stripe PaymentIntent for pledge checkout
/api/webhooks/clerk            -- Clerk user sync webhook
/api/favpolls/[id]/request-extension -- Sends extension request email to admin
/api/polls/[pollId]/results    -- Ranked pledge totals for a poll (admin client)
/api/polls/[pollId]/reveal     -- Gated: returns real personal_reveal + favourites with real amounts. Verifies Clerk userId or guest_token has a non-withdrawn pledge, or poll is closed. 403 otherwise.
NOTE: /api/exemplar removed (PR-B) — example pane replaced by grey placeholder preview
```

### apps/admin

```
/placeholders                  -- Topic placeholder editor (about + reveal per occasion)
/placeholders/[topicId]        -- Per-topic editor
/contributions                 -- Guest item review queue (pending/accepted/rejected)
/charities                     -- Charity management (add/edit/deactivate)
/favpolls                      -- Favpoll oversight (shell only — not yet built)
/access-denied                 -- Shown to authenticated non-admin users
```

---

## Key Files

### apps/web

```
app/
├── layout.tsx
├── page.tsx
├── favpolls/
│   ├── page.tsx
│   ├── actions.ts
│   ├── delete-favpoll-button.tsx
│   ├── new/page.tsx, actions.ts, wizard-data.ts
│   └── new/details/page.tsx
│   └── [id]/
│       ├── page.tsx
│       ├── actions.ts
│       ├── display/page.tsx      -- permanentRedirect → guest page (legacy; live moved to /live/[slug])
│       └── edit/page.tsx, actions.ts
├── live/[slug]/page.tsx          -- live display: lookup by live_slug, renders DisplayScreen
├── my-favpolls/page.tsx
├── rankings/page.tsx
├── topics/[id]/page.tsx
└── api/
    ├── cron/close-favpolls/route.ts
    ├── stripe/payment-intent/route.ts
    ├── webhooks/clerk/route.ts
    ├── favpolls/[id]/request-extension/route.ts
    └── polls/[id]/results/route.ts

components/
├── ui/
│   ├── button.tsx, card.tsx, input.tsx, field.tsx
│   ├── badge.tsx                 -- shadcn Badge (cva variants: default/secondary/outline/destructive, rounded-full text-xs); use for pills like the "Example" card badge — never a raw styled <span>
│   ├── chip.tsx                  -- Selectable pill toggle; min-w-0 shrink whitespace-normal to allow truncation. `onRemove?: () => void` + `removeLabel?: string` (default "Remove") props: when provided, renders as `div` wrapper (not `Button`) containing a `<span>` + `<button aria-label={removeLabel}>` with `X className="h-3 w-3"` inside a `h-4 w-4` hit target. Avoids nested-button HTML violation. Storybook: `Removable` story added.
│   ├── toggle-group.tsx          -- shadcn ToggleGroup + ToggleGroupItem; type="single" renders items as role="radio"/aria-checked; used in HonourStep and CommandPanel
│   ├── toggle.tsx                -- shadcn Toggle primitive
│   ├── sheet.tsx                 -- shadcn Sheet (SlideOver drawer); used by pledge-panel on mobile
│   ├── responsive-overlay.tsx    -- Sheet (mobile <768px) / Dialog (desktop) dual primitive; useIsMobile() hook init false (no hydration flash); props: open, onOpenChange, title, description?, header?, footer?, children. When `header` is set, it renders above the body divider and `title` goes `sr-only`; use this pattern for search/text inputs at the top of overlays.
│   ├── occasion-tag.tsx
│   ├── section-eyebrow.tsx
│   ├── ranking-bar.tsx           -- labelSuffix prop for inline Hide/Show toggle
│   ├── reveal-quote.tsx
│   ├── tooltip.tsx
│   └── tooltip-icon-button.tsx   -- Ghost icon button with tooltip; used by favpoll-list-card and poll-heading
├── new-favpoll-button.tsx          -- Client button that navigates to /favpolls/new; redirects signed-out users to /sign-in; accepts onBeforeOpen callback (used by header to close menu)
├── new-favpoll-wizard/             -- 3-step wizard (Honour → Charity → Love); refactored from monolith into a directory
│   ├── index.tsx                 -- Thin orchestrator (`NewFavpollWizard`); imports all sub-components and `useWizardState`; all session-storage and router logic lives in the hook. Love overlay header: controlled search `<input>` + an `InputGroupButton` "Add" that appears when `loveShowCreate` is true (trimmed search is non-empty and doesn't match any existing topic title). `handleCreateLoveTopic` sets the topic to `{ topicId: "", title, isCustom: true }` and closes the overlay. This duplicates LoveStep's own create-button logic because LoveStep suppresses its body input (and Add button) when controlled search props are passed.
│   ├── use-wizard-state.ts       -- All wizard state, derived values, and handlers: step/category/grouping/subject/pronoun/topics/charityIds/overlay-opens, `nextDisabled`, `handleNext/Back/Finish` (writes sessionStorage, calls `router.push`). `pronoun: Pronoun | undefined` replaces the old `causeLabel` state; `whoSelected` gate = `grouping !== "individual" || subject === "cause" || pronoun !== undefined`. Exports `DRAFT_ADDITIONS_KEY`, `STEPS`, `STEP_LABELS`, `WizardData` type
│   ├── wizard-triad-rail.tsx     -- Desktop left column: `bg-primary/10` tinted rail (`h-full`, `justify-around`), Award/Gift/Heart icons at `h-6 w-6`, `text-lg` labels, `opacity-60` for past/future; Props: `{ currentStep, copy }`
│   ├── wizard-progress-strip.tsx -- Mobile `<ol>` segmented progress strip: coloured fill + HONOUR/CHARITY/LOVE text, `aria-label "Step N of 3: <Label>"`; Props: `{ currentStep }`
│   ├── wizard-nav.tsx            -- Navigation row: Back (ghost) + Next/Set-up-my-event; Props: `{ isFirst, isLast, nextDisabled, onBack, onNext, onFinish }`
│   ├── wizard-charity-card.tsx   -- Receipt card for selected charities: logo/initial, name, charity no., Edit+Remove buttons, "+ Pick another" link (hidden at max 3); Props: `{ charities, onEdit, onRemove(id), onPickAnother }`
│   ├── wizard-topic-card.tsx     -- Topic card: topic label header, Edit+Remove buttons, chips (existing canonical + purple custom), "+ Add" / "+N more" overflow chip, "Add at least…" hint for custom topics with < 2 labels; Props: `{ topic, sortedExistingItems, customLabels, showItemsSection, onEdit, onRemove, onOpenItemsDialog }`
│   ├── wizard-step-shell.tsx     -- Step wrapper: centred `h2` title + guidance paragraph; consumed by each wizard step; Props: `{ title, guidance, children }`
│   ├── *.stories.tsx             -- Storybook stories for each sub-component (5 story files)
│   └── __tests__/use-wizard-state.test.ts -- Hook unit tests: `nextDisabled` gates, step navigation, `causeLabel` URL param, sessionStorage writes
├── favpoll-form/                -- Canonical create/edit form; preview panel full-width + floating command panel
│   ├── index.tsx                 -- FavpollForm (outer, router + form) + FormInner; preview panel full-width; CommandPanel floated fixed. No Settings overlay. initialClosesAt prop (ISO string) carries existing closes_at for edit mode; closesAt is not a form field — captured locally in the publish overlay (create) or passed through from initialClosesAt (edit). isPrivate always false; potAmount always null. After createEvent: sets seedEventId state → renders SeedFundModal instead of redirecting immediately. Generation is opt-in: no auto-call on mount. handleRegenerate() fires safeGenerateDraft on demand (via the "Generate a suggestion →" prompt or the Regenerate button in the About overlay), pre-fills about for both modes and reveal for cause favpolls, sets personRevealExample for person favpolls (never commits); manual-edit confirmation before overwrite; shows error toast when result is null.
│   ├── seed-fund-modal.tsx       -- Post-publish shared fund seeding modal. Props: eventId, onComplete. States: amount (number), clientSecret, error, submitting. Preset buttons £10/£25/£50 set amount. "Seed fund" button (disabled when no amount) → POST /api/stripe/payment-intent with pot_top_up metadata → StripeCheckout. On success: topUpFund() then onComplete(). topUpFund failure swallowed. Cancel: returns to modal with error. "Skip for now" link calls onComplete() immediately. hideCloseButton on ResponsiveOverlay (no × button).
│   ├── command-panel.tsx         -- Publish/Save FAB (2026-07-03, replaces the old panel with Cancel + missing list): fixed bottom-right rounded-full primary Button, Send icon (create → opens `CloseDateOverlay` pre-filled via `suggestClosingDate(category)`) or Check icon (edit → `onSubmit()` directly). Never disabled for missing fields — clicking with required fields missing raises a warning toast naming them (`TOAST_WARNING_STYLE`); submit errors surface as error toasts (the FAB has no panel to print into). Cancel is gone — browser back + the `beforeunload` unsaved-draft guard in index.tsx cover it. Create-mode gate: Name/Cause; edit-mode gate: Occasion/Charity/Topic too.
│   ├── preview-panel.tsx         -- ~90-line coordinator; composes EditableHero + EditablePollArea + EditableCountdown + CharityBanner. PledgeCard removed from the form preview. Always visible on mobile (stacks below command bar; pb-52 clears command bar).
│   ├── edit-helpers.tsx          -- Shared helpers used by editable sub-components: `EDIT_BTN` className string (ghost Button base), `EditBadge` (pencil badge positioned at corner), `CharCounter` (remaining count with colour), `overlayFooter(onSave, onCancel)` (Save/Cancel footer for all overlays). Also exports `INPUT_GROUP_CLS` (h-auto rounded-none border-0 ring-0 shared across all field overlay InputGroups) and `FIELD_OVERLAY_PROPS` (hideCloseButton/headerClassName/dialogClassName spread onto all field `ResponsiveOverlay` instances).
│   ├── editable-hero.tsx         -- Hero editing: static layout (no Framer Motion, no BaseFavpollHero); renders its own JSX so it owns both form state and edit overlays. Each `EditableField` has a named `open*()` function that seeds the draft from the current form value before opening, preventing stale-draft bugs. Overlays: name/context/photo/opening-line/about for person favpolls; cause-label for cause favpolls. Uses `useFormContext<FavpollFormValues>()` internally. Each overlay: shadcn `Input`/`Textarea` in `header` prop with border-stripping className; Save/Cancel in `footer`. Photo overlay is a three-state inline crop dialog: no-file (Upload icon, "No file chosen") → cropping (inline `Cropper` with zoom slider, rounded-rect `cropShape="rect"`, "Crop" footer) → avatar preview ("Current photo" + Trash, "Save" footer). `dialogPhotoUrl` staging state decouples dialog visual state from committed form state so delete takes immediate effect without writing to form. `getCroppedBlob` function does canvas-based crop to JPEG Blob. "Generate a suggestion →" prompt (`text-sm text-muted-foreground`) shown below the About placeholder when about is empty, not generating, and the topic is canonical — clicking fires `onRegenerate`; prompt hides once about is filled or generation is in flight.
│   ├── editable-poll-area.tsx    -- Poll area editing: PollHeading rendered as non-interactive SectionLabel (no `onPledge` — clicking does nothing in edit mode; a previewPill variant was tried and reverted 2026-07-04), reveal edit Button (left-bordered italic when set, muted placeholder when empty), Tabs (amount/count), PollResults — all always visible, no blur/toggle. Uses `useFormContext<FavpollFormValues>()` internally. No showReveal/onToggleReveal props.
│   ├── editable-countdown.tsx    -- Countdown widget wrapper: when `closesAt` is set (edit mode), renders `<Countdown closesAt={...} />` in a clickable card that opens `CloseDateOverlay`; when absent (create mode), renders `<Countdown />` placeholder only (no edit affordance).
│   ├── schema.ts                 -- Zod schema + FavpollFormValues; subject/causeLabel fields + superRefine (name required iff subject='someone', causeLabel required iff subject='cause')
│   ├── constants.ts              -- PickerSize, INPUT_SIZE, TEXTAREA_SIZE, CHIP_IN_INPUT_* maps
│   ├── date-helpers.ts           -- Shared date utilities: `addDays(date, n)`, `ordinalSuffix(n)`, `CLOSE_DATE_PRESETS` (Tomorrow/3d/1w/2w/1m/6w/3m/6m label+days array); consumed by `CloseDateOverlay`
│   ├── close-date-overlay.tsx    -- Shared `CloseDateOverlay` component used by both `editable-countdown` and `command-panel`; props: `open, onOpenChange, title?, initialDate, saveLabel?, submitting?, onSave`; `prevOpenRef` pattern prevents re-init on every render when `initialDate` is a new object reference each render
│   ├── date-time-picker.tsx      -- Side-by-side date button (opens calendar) + time InputGroup; button width hardcoded to CALENDAR_WIDTH = 220
│   ├── item-add-field.tsx        -- ResponsiveOverlay (internal open state); item addition for edit-mode topic management; NOT used in create wizard (wizard uses TopicItemsDialog)
│   └── __tests__/generate-draft-prefill.test.tsx  -- 9 tests: empty-on-mount, shimmer→fill after generate trigger, person vs cause pre-fill, skip for custom/edit mode, silent failure, subject derivation; subject passed as prop (not derived from register)
├── pledge-panel.tsx              -- Still used by editable-poll-area.tsx in the create/edit form preview (organiser only). No longer on the guest event page — picker is now step 1 of PledgeDialog. Also exports computePledgeAllocations() utility used by pledge-card/use-pledge.ts and pledge-dialog/use-pledge-dialog.ts.
├── pledge-card/
│   ├── index.tsx                 -- ⚠ No production importers — PledgeCard/LivePledgeCard/PledgeCardWrapper superseded by PledgeDialog; files retained for reference and test coverage.
│   ├── use-pledge.ts             -- ✓ Used by pledge-dialog/use-pledge-dialog.ts
│   ├── pledge-breakdown.tsx      -- ✓ Used by pledge-dialog/step-amount.tsx
│   ├── utils.ts                  -- ✓ Used by pledge-dialog/step-amount.tsx (GBP, FUND_GREEN/AMBER/RED)
│   ├── amount-input.tsx, amount-presets.tsx  -- ⚠ No production importers; amount/presets now inline in step-amount.tsx
│   └── __tests__/pledge-card.test.tsx, use-pledge.test.ts, utils.test.ts
├── pledge-dialog/                -- Unified 3-step pledge dialog replacing the separate PledgePanel + PledgeCard surfaces on the guest event page.
│   ├── index.tsx                 -- PledgeDialog: self-contained trigger button + ResponsiveOverlay; step 1 = pick favourites, step 2 = amount + breakdown, step 3 = inline Stripe payment.
│   ├── use-pledge-dialog.ts      -- Wraps usePledge (step 2/3 state) + own draft state (step 1). Auto-advances to step 3 when pledgeClientSecret is set. Back from step 3 clears it.
│   ├── step-pick-favourites.tsx  -- PickerHeader (chip+search field) + PickerItems (chip grid); extracted from pledge-panel.tsx.
│   ├── step-amount.tsx           -- AmountInput + AmountPresets + per-favourite breakdown (primary) + per-charity collapsible (secondary, 2+ charities only) + shared fund toggle + fee/total line.
│   ├── step-pay.tsx              -- Inline StripeCheckout (inline prop) for step 3.
│   ├── pledge-dialog.stories.tsx -- Stories: SignedIn, WithSharedFund, TwoCharities, Guest, InfinitePoll.
│   └── __tests__/use-pledge-dialog.test.ts  -- 17 tests: step nav, draft state, breakdowns, shared fund path, payment success.
├── display-screen/               -- the live page (see Live mode chapter)
│   ├── index.tsx                 -- DisplayScreen: framed card + telethon banner + columns; interval router.refresh() every 5s; localClosed timer; wasOpenAtMount anchors the finale
│   ├── display-chrome.tsx        -- fixed corner strip mirroring header geometry (logo + presenter ⋮ dropdown: event page / theme / fullscreen); rendered OUTSIDE the card (drop-shadow filter would capture fixed positioning)
│   └── display-poll-section.tsx  -- PollHeading + reveal only when closed (TypedReveal finale if witnessed) + RankingList size="display"
├── guest-wall.tsx                -- names + "backed X" + RelativeTime (server text kept through hydration, corrected after mount — clock-dependent text mismatches statically prerendered HTML); animate/maxEntries/teaseBacked props
├── branded-qr.tsx                -- styled QR (qr-code-styling): theme tokens resolved at render, MutationObserver re-resolves on theme flip; heart logo built from --primary (no hex anywhere). `colorVar` prop (default --foreground; display passes --qr). GOTCHA (2026-08-03): a token read ONLY from JS gets stripped from served CSS — --qr survives because it's registered in @theme (--color-qr) AND referenced by the scan labels' text-qr; dark values are decoder-bounded (0.85 L failed jsQR against the brand-purple field; 0.92 is the floor)
├── header-mount.tsx              -- suppresses the app Header on /live/[slug] (pathname regex)
├── ranking-list/
│   ├── index.tsx, use-ranking-items.ts, utils.ts  -- useRankingItems has NO subscription: re-ranks + announces movers when fresh initialItems stream in (router.refresh)
├── favpoll-card/
│   ├── section-label.tsx             -- Generic small-caps brand-purple section label (`text-primary-muted uppercase tracking-[0.09em]`); used across cards, wizard steps, form preview, rankings
│   ├── poll-reveal.tsx
│   ├── poll-results.tsx
├── poll-section/
│   ├── index.tsx             -- permanent blur/reveal layout: pre-pledge shows pixel-perfect blurred decoy (blur-xs, aria-hidden, not interactive) — real PollReveal placeholder + RankingBar rows with arbitrary DECOY_WIDTHS so blurred shape reveals nothing about true ranking — with absolute lock-card overlay button (Lock icon + fixed "Pledge to see the reveal — and how the pledges are landing." visible text; aria-label names protagonist first name or generic fallback for cause). Post-pledge renders TypedReveal (if personalReveal set) + Tabs + RankingList. RankingList NOT mounted pre-pledge (standings stay hidden until entitled). Props: entitled, personalReveal, initialItems, isCause, onOpenPledgeDialog, pledgeJustConfirmed.
│   ├── typed-reveal.tsx      -- thin client wrapper: when pledgeJustConfirmed=true types personal_reveal character-by-character (~1900ms total); when false delegates to PollReveal directly (SSR-safe). Animated path: aria-hidden typed blockquote + sr-only role="status" aria-live="polite" for AT. Respects prefers-reduced-motion. Interval deps [text, shouldType] — no re-type on RankingList realtime re-renders.
│   ├── use-poll-section.ts   -- fires onViewChange on mount (initial view) and all view transitions
│   ├── __tests__/poll-section.test.tsx  -- overlay copy (name in aria-label, cause fallback, no-handler), interaction (click, keyboard, entitled hides overlay), decoy aria-hidden; TypedReveal integration (pledgeJustConfirmed=true/false paths)
│   ├── __tests__/typed-reveal.test.tsx  -- 12 tests: active=false non-animated, active=true animated (fakeTimers, per-char and full-advance assertions), reduced motion fallback
├── favpoll-content/
│   ├── index.tsx             -- grid md:grid-cols-[1fr_300px]; PledgeDialog controlled (pledgeDialogOpen state); passes localEntitled/effectiveReveal/effectiveItems/isCause to PollSection
│   └── use-favpoll-content.ts  -- localEntitled state (syncs from server entitled prop); handlePledgeSuccess(guestToken?): signed-in → router.refresh(); guest → /api/polls/[pollId]/reveal fetch → setLocalReveal/setLocalItems/setLocalEntitled; effectiveReveal/effectiveItems fall back to server values for signed-in
├── hero-demo-panel/              -- demo card + scene data only (the old two-column HeroDemoPanel index.tsx and hero-pitch-column.tsx retired in the landing fold-in; the loop lives in landing/use-demo-loop.ts)
│   ├── demo-card.tsx             -- accepts className (landing hero passes rounded-t-none border-t-0 under the traffic-light frame); scenes.ts (SCENES, SCENE_EYEBROWS, photo_url → /demo/*.jpg portraits); variants.ts
│   ├── demo-card.stories.tsx     -- static phase snapshots: Locked/PickerOpen/AmountStep/Confirmed/Reveal with prefersReducedMotion forced
├── cause-hero.tsx               -- view-only: cause favpoll hero; shows getFavpollHeadline prefix + cause_label as h1 + favpolls.description as body; no avatar, no protagonist fields
├── favpoll-hero.tsx               -- view-only: favpoll + protagonist props, hideAvatar?, aboutPlaceholder? (renders grey when about is blank); requires non-null protagonist; no isEdit prop (edit mode is handled entirely by editable-hero.tsx)
├── heroes/
│   └── base-favpoll-hero.tsx      -- read-only hero layout shared by favpoll-hero.tsx; no Framer Motion; no edit props (isEdit/formValues/isGenerating/onRegenerate all removed — PR #112). HeroLayout (Framer Motion scroll animations) is a separate component used only on the live favpoll page. register is not a prop — headline derived from occasion_type via getFavpollHeadline. Never select the dropped `register` column from Supabase (removed by migration 20260607140000_derive_register.sql; selecting it causes Supabase to return `{ data: null }` silently).
├── favpoll-list-card.tsx               -- List card used on /favpolls. Props: size, event, className, clerkUserId (optional), initialResults. Constructs FavpollPollWithItems inline from card-query data. Renders PledgeDialog (multi-step) or FavpollListCardResults; hasPledged toggle controlled locally. On pledge success: fetches /api/polls/[pollId]/results and shows results view. No PledgePanel or AmountInput — those live inside PledgeDialog. (Homepage carousel uses FavpollSummaryCard instead.)
├── favpoll-list-card/
│   ├── use-favpoll-list-card-pledge.ts, favpoll-list-card-results.tsx
│   └── favpoll-list-card-charity-carousel.tsx  -- also used as fixed bottom mobile bar on event page
├── favpoll-summary-card.tsx        -- Compact read-only card (no pledge UI): FavpollHeader + Countdown + SectionLabel + FavpollListCardCharityCarousel. Used on the landing live grid (FavpollSummaryCard). Cause-aware: `protagonist` is `{ name } | null`; when `subject === 'cause'` the `cause_label` is shown as the name (a live cause favpoll used to crash the landing here). + .stories.tsx
├── organizer-card/
│   ├── index.tsx                 -- OrganizerCard: rich management card used on /my-favpolls. Client component. Renders identity + status badge, total raised, poll row, shared fund row, Listed/Unlisted switch (calls setFavpollListed), QR code (qrcode.react QRCodeSVG), share link + copy button, footer with charity carousel + Live display ExternalLink button. Status badge turns amber when ≤7 days remaining (WARNING_THRESHOLD_DAYS). Closed cards render at opacity-70.
│   ├── utils.ts                  -- OrganizerCardFavpoll type, StatusFilter, SortKey, WARNING_THRESHOLD_DAYS=7, isFavpollClosed(), daysRemaining(), filterAndSort() (pure functions, fully tested)
│   └── __tests__/               -- organizer-card.test.tsx + utils.test.ts (37 tests total)
├── live-favpolls-carousel.tsx    -- + .stories.tsx
├── landing/                      -- the home page's components (promoted from the prototype at fold-in)
│   ├── hero.tsx                  -- LandingHero: purple band, HeroTexture, static eyebrow (landing.eyebrow) + fixed triad headline (landing.headline), demo card in traffic-light frame (scale-[0.62], sm:scale-80), count-up stats, Pick/Pledge/Reveal beat indicator. Since 2026-08-05 the band is full-screen (min-h-[calc(100vh-3.5rem)], centred) and home passes `router` — the demo slot becomes three register cards, each two columns (text | that register's scene poll). Register pages pass sceneKind/copy/band props. See the register-landing-pages entry in Outstanding TODO for the full prop set and the reversibility note
│   ├── use-demo-loop.ts          -- the 15-phase demo timeline as a hook (useDemoLoop + beatForPhase); reduced motion → static reveal state
│   ├── hero-texture.tsx          -- FavpollMarkGlyph (the favpoll logo, currentColor) tiled as a lattice in all four orientations (founder's design 2026-07-05, replaced the interlocked-pair monogram): vertical hearts 0/180 in one column set, horizontal 90/270 in offset columns at midpoint rows, dots at remaining crossings; slow masked shimmer sweep; glyph/tiles self-contained for future merch
│   ├── anyone-can-answer.tsx     -- #anyone section: h2 "Create or curate your favpoll" in the left column; scripted loop replays BOTH real custom-topic dialogs in sequence — the wizard's "Pick a topic" overlay (question typed into "Search topics…", canonical chips filter away to "No matching topics — add your own", Add presses) then TopicItemsDialog sliding in front (answers typed, chips land under "Added by you"). Reduced motion → final frame with both dialogs
│   ├── watch-it-happen.tsx       -- #watch section: "the room" in first person — straight iPhone (island, side buttons, top half rising from the section's bottom edge, Pledge button visible) making a £50 pledge in the near foreground; the live display small/widescreen/perspective-tilted (rotateY -16°) across the room. Loop: pick £50 → press → confirmation (reveal's gift framing: "Belinda's favourite is waiting for you") → the display answers: bar grows, total crosses the £900 goal in success green ("goal reached — every pledge still counts"), then Amara's £20 arrives unprompted, ending on £925 (figures agree with the How It Works Watch card; bars sum exactly to totals). Depth = pure CSS (scale + perspective + shadow + floor gradient); the room chrome (tint/floor/crop) lives on the #watch section wrapper in page.tsx. Reduced motion → goal-reached frame static. Two earlier approaches (full telethon-banner miniature; flat tile strip) were rejected 2026-07-15 as too big / off-style
│   ├── site-footer.tsx           -- brand statement, Explore/Your account links (incl. About favpoll and, since 2026-08-05, the three register pages — the footer is how the register trio cross-links beyond home; the register pages themselves were added to the mount allowlist in #511), money+wills blurbs (headings link to /about — the old #money/#wills anchors died with the 2026-07-08 about lean-down), © + Stripe bar. Mounted app-wide via components/site-footer-mount.tsx ("use client", usePathname) in the root layout — a pathname check rather than route groups because the excluded /favpolls/[id]/live projector route is nested inside favpolls/[id]/; add new full-screen routes to its EXCLUDED list
│   ├── register-matrix.tsx       -- "What fits the occasion" (home, since 2026-08-05, PRs #512–#518): seven features × three registers, every cell a PHRASE saying how the feature lives in that register — never ticks, nothing ever crossed out. Shine cells carry the register's accent dot + foreground ink, "works" cells sit muted; each feature row is led by a lucide icon in primary-muted (Tv/Quote/Target/QrCode/ListChecks/Users/HeartHandshake) and hover-tints; the three register columns wear muted accent washes so they read as territories, and their heads deep-link to the register pages in accent. The closing italic no-rules line IS the section's message ("every favpoll can use every feature. This is just what tends to work"). Copy in messages/en-GB.json under home.matrix.*. Rejected route worth not re-walking: shine-only accent columns on home with the full grid moved to /about (#514) — stripped of the feature labels the phrases lost their referent ("between the courses" of WHAT?), so the matrix returned to home and was warmed with icons + hover instead (#515); components/landing/register-shines.tsx was deleted
│   ├── count-up.tsx, fade-in.tsx -- in-view count-up stat / once-only fade-up (both reduced-motion aware)
│   ├── honour-charity-love-venn.tsx  -- Rotating three-ring Venn SVG (currentColor, text-primary; slow 16/24/22s rotations + staggered stroke-opacity breathing; labels scaled 1.5×); /about Principles section only (retired from the landing's closing section 2026-07-15); + .stories.tsx
│   └── how-it-works-three-beat.tsx   -- #how section: Create · Share · Watch in the wizard rail's grammar (icon + tracked uppercase label, no subtext), three columns, each demonstrated by real components in miniature on a centred 22rem canvas (never screenshots — they rot and don't theme). Create = the wizard's field dialogs stacked in creation order (Pick a charity → Pick a topic → Name → About with a caret-blink "freshly typed" box); Share = printed table card around BrandedQR, hover straightens it into an iPhone-camera QR detection (warning-token brackets + "Open favpoll.com" pill); Watch = deck of live surfaces (rankings centred + countdown/guest-wall peeks + charity card with pledge goal in front) whose hover surges the bars and tips the £900 goal over into success-green "goal reached". All hover motion motion-safe:, vignette content inert; + .stories.tsx
│       (deleted 2026-07-11: record-holders.tsx + types.ts — record tiles receded to a principle line, concept model 2026-07; rail-nav.tsx — dead since the fold-in; reveal-mechanic-demo.tsx died in the 2026-07-08 artifact-first pass)
├── charity-banner.tsx, countdown.tsx
├── header.tsx                   -- "use client"; REGISTER LINKS (2026-08-31): Memorials · Celebrations · Fundraisers beside the mark on desktop via HeaderBar's `nav` slot, the active one `text-primary` (= the page's own palette since #585) with aria-current; on mobile the section label stays beside the mark and the three links head the menu. Hamburger menu on mobile (md:hidden); click-outside closes. The "New favpoll" button was removed from both desktop header and mobile menu (founder, 2026-07-15) — creation entry points are the landing CTAs and /favpolls
├── poll-heading.tsx             -- topicTitle + optional onPledge + inert. onPledge renders the shadcn primary Button (still used by hero demo / pledge dialog contexts); `inert` renders a text HEADER — primary uppercase type at the button's exact h-9 so sticky offsets hold (2026-08-02: guest page + list cards + edit preview all use inert; the lock card is the single pre-pledge CTA). Long titles step down in size before truncating. Fallback with neither prop: SectionLabel.
├── stripe-checkout.tsx

lib/
├── occasions.ts                  -- shortTopicLabel (DATE_LABEL_PLACEHOLDERS removed)
├── registers.ts                  -- Register type, deriveRegister(), suggestClosingDate(), getExampleName(), registerForOccasionType() (legacy), OCCASION_TYPES_BY_REGISTER (legacy)
├── display.ts                    -- charityNames, formatAmount, ordinal, formatRelativeDate, formatFavpollDate, getFavpollHeadline (accepts optional subject?: 'someone'|'cause' param; subject-aware prefix matrix — see Registers section for the full matrix)
├── wizard-copy.ts                -- `getWizardCopy(subject: FavpollSubject)` → `{ leftPrompt, rail: { honour, charity, love }, charityGuidance, loveGuidance }`; branches on subject ('someone' | 'cause'); used by NewFavpollWizard to drive all step copy
├── i18n.ts                       -- formatCurrency(), t(), MARKET_DEFAULTS
├── email.ts                      -- Resend helpers
├── edit-mode-context.tsx
├── utils.ts                      -- cn()
└── supabase/client.ts, server.ts, admin.ts

lib/actions/
├── favpoll-poll-favourites.ts    -- hideFavpollPollFavourite, showFavpollPollFavourite
├── generate-draft.ts             -- generateDraft (raw server action) + safeGenerateDraft (safe wrapper, never throws — returns null on any failure, logs server-side); reads subject from GenerateDraftInput — NOT derived from register
└── generate-draft-utils.ts       -- Non-async exports: RateLimitError, checkRateLimit, revealNamesRealItem, hasFabricatedStats, buildCacheKey, _rateLimitStore (extracted to satisfy Turbopack "use server" constraint)

__mocks__/
├── supabase-client.ts            -- Storybook stub for @/lib/supabase/client (no-op channel/removeChannel/from)
└── stripe.ts                     -- Storybook stub for @stripe/stripe-js (loadStripe returns null)

.storybook/main.ts                -- viteFinal aliases __mocks__/supabase-client and __mocks__/stripe for browser test isolation

messages/en-GB.json
packages/types/index.ts           -- All domain types (@favpoll/types)
packages/ui/                      -- @favpoll/ui: ThemeProvider + MenuButton (shared between apps/web and apps/admin)
scripts/seed.ts                   -- pnpm seed — additive, idempotent
scripts/seed-favpolls.ts          -- scale-test seed: generates 40 favpolls across all occasions/topics. Run with ALLOW_FAVPOLL_SEED=1 or against a staging URL.
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
├── generated-drafts/page.tsx     -- LLM draft curation: list by status filter; editable About/Reveal; Curate/Reject per row. Status change does not affect what favpolls receive — cache serves first-generated copy regardless.
├── favpolls/page.tsx             -- Shell only
└── access-denied/page.tsx

components/
├── sidebar.tsx
├── occasion-editor.tsx           -- 5 register rows per topic (remembering/celebrating_one/celebrating_many/cause/neutral); about + reveal textarea each
├── display-order-editor.tsx      -- Per-item number inputs for finite topic display_order; shown above OccasionEditor
├── charity-list.tsx
└── draft-row.tsx                 -- Client component: editable About/Reveal textareas (per-field Save) + Curate/Reject buttons (generated rows only)

lib/
├── supabase/admin.ts             -- createAdminClient() — service role, bypasses RLS
└── actions/
    ├── placeholders.ts           -- getTopics, updatePlaceholder, getTopicItems, updateItemDisplayOrder
    ├── contributions.ts          -- getPendingContributions, acceptContribution, rejectContribution
    ├── charities.ts              -- getCharities, createCharity, updateCharity, deactivateCharity, reactivateCharity, getCharityTopics, setCharityTopics
    ├── topics.ts                 -- getTopics (active topics for admin use)
    └── generated-drafts.ts      -- getGeneratedDrafts(filter?), updateGeneratedDraft(id, {about?,reveal?}), setGeneratedDraftStatus(id, status)
```

---

## Atomic UI Components

| Component        | Props                                                           | Usage                                                                                                                   |
| ---------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `OccasionTag`    | `label, className?`                                             | Small uppercase occasion label, brand purple                                                                            |
| `SectionEyebrow` | `children, className?, variant?`                                | `variant="brand"` or `variant="muted"`                                                                                  |
| `RankingBar`     | `label, amount, widthPercent, ..., labelSuffix?`                | `labelSuffix` renders inline after label — used for Hide/Show toggle                                                    |
| `RevealQuote`    | `text, ...`                                                     | Left-bordered italic blockquote                                                                                         |
| `Chip`           | `selected?, readOnly?, size?: "sm"\|"md"\|"lg", onRemove?(), removeLabel?, ...buttonProps` | Selectable pill. Default bg: `bg-muted`. `readOnly`: `bg-background pointer-events-none`. When `onRemove` is set, renders as `div` wrapper (not `Button`) with an inner × button (`h-3 w-3` icon, `h-4 w-4` hit target); `removeLabel` is its `aria-label` (default "Remove"). Never use for amount presets. |

---

## Design System

### Colour tokens

**Never hardcode hex colours** — all colours are design tokens (`@theme inline` maps `--color-*` to `--*` in `globals.css`). CI enforces this via `node scripts/check-hex-colors.mjs` (`pnpm lint:colors`). Use the Tailwind utility (`text-primary`, `bg-secondary`, …); for inline `style` props (rare — dynamic values only), use `var(--token)`. The one allowlisted exception is `apps/web/lib/og/palette.ts` (Satori cannot read oklch or CSS variables).

**The colour system is four generated palettes from one recipe (2026-08-30 — the register-palette decision).** favpoll carries a flexible identity, Premier-League style: one mark, wordmark, type and voice, and a palette per register. `apps/web/scripts/generate-register-tokens.mjs` holds four numbers per palette (hue, chroma, primary lightness, dark-page lightness) and the recipe — the original purple tokens expressed as functions of those numbers — and writes `apps/web/app/register-tokens.css` (`pnpm tokens`; a vitest guards that the file matches). `globals.css` keeps only hue-free tokens (white surfaces, the status trio, radius).

| Palette | Wears it | h / c / primary L / dark L |
| --- | --- | --- |
| **default — blue** | every surface that is not one favpoll's: home, `/favpolls`, `/record`, `/about`, neutral favpolls | 252 / 0.15 / 0.46 / 0.43 |
| **memorial — purple** | `remembering` (the original brand hue, unchanged) | 278 / 0.18 / 0.44 / 0.44 |
| **celebration — magenta** | `celebrating_one`, `celebrating_many` | 345 / 0.17 / 0.50 / 0.41 |
| **fundraiser — green** | `cause` (a person's fundraiser and a faceless cause alike) | 160 / 0.13 / 0.50 / 0.41 |

Each palette sets the full ramp in both themes: `--primary`, `--primary-muted`, `--secondary`/`--muted`, `--accent`, `--border`/`--border-strong`, `--reveal-foreground`, `--qr`, `--ring`, `--chart-1…5`, the sidebar set and `--band-tint` (a measured sRGB composite, kept as `rgb()`). In light the brand colour is `--primary` on white; in dark the brand colour IS the page and `--primary` flips to near-white so the logo reads. **One `--primary` is both a fill under white text and text on white** (links, totals, the wordmark), so a primary must sit at L ≲ 0.55 — the constraint that ruled gold out for celebrations (amber, ochre and old gold all read as bronze or olive; the prototype is in PR #584's history).

**How a page takes a palette.** `lib/register-palette.ts` → `paletteForRegister` / `paletteForFavpoll` / `paletteForSceneKind`. `components/register-scope.tsx` renders `<div data-register-page="…" class="contents">`; `:root:has([data-register-page])` in `register-tokens.css` lifts it to the whole document — header, footer, logo — server-rendered, no flash, no script. Every favpoll-bound page wraps itself (favpoll page, keepsake, pack, edit, `/live/[slug]`), and each register landing page wears its own. A single element on a mixed surface takes `data-register="…"` directly and recolours only its subtree: the home router cards, `DemoCard` (per scene kind), the reveal vignette's artefact box.

**The register accent system is retired** (was 2026-08-03 → 08-30: forget-me-not `--memorial`, the `*-on-band` gold/green/blue variants, `accentVar` on DemoCard/LandingHero, `accentBarClassName`, `accentClassName` on IdeasSection). The register IS the palette; there is no gold anywhere. Marks that sat on the band (the router cards' dot and bars) are the card's own `--chart-4`.

**Status colours are not brand colours:** `--success` (shared fund healthy, pledge confirmations), `--warning` (+ `-muted`, `-strong`: closing ≤ 7 days, fund near limit), `--destructive` (+ `-muted`, `-strong`). A fundraiser page's brand green is one hue-step from `--success`, so "goal reached" has to be a state said in words there, not a green fill — open item.

Ranking bars: pass `barClassName` to `RankingBar` (never `barStyle` background). Toast styling: import `TOAST_ERROR_STYLE` / `TOAST_WARNING_STYLE` from `lib/toast-styles.ts` (styles must stay inline per toast call — see toast decision). Fund-bar colours: `FUND_GREEN/AMBER/RED` in `pledge-card/utils.ts` are `var(--success)`/`var(--warning)`/`var(--destructive)`.

### Typography

- Typeface: Plus Jakarta Sans, weights 400/500 only (never 600/700)
- Reveal/quote: 18px italic `leading-relaxed text-reveal-foreground border-l-[2.5px] border-primary-muted`
- Section eyebrow (brand): 11px medium `tracking-widest uppercase text-primary`

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

## Live mode (the projector surface)

The favpoll's third surface (guest page = pledge, landing = prospect, live =
the room). Built 2026-07-08/09 across PRs #219–#241; freshness model settled
in #243/#244 (2026-07-10).

**Access.** `/live/[slug]` where slug = `favpolls.live_slug` (uuid, unique,
`gen_random_uuid()` default; migration `20260708150000`, applied staging +
production). A capability URL: possession authorises the surface, so the wall
shows backed-labels and standings are full. Legacy `/favpolls/[id]/live` and
`/display` permanentRedirect to the PUBLIC guest page — deliberately never
resolving id→slug, which would defeat the slug. The organiser gets the URL
from OrganizerCard (copy button + printed pack QR points at the guest page,
not this).

**Anatomy** (`components/display-screen/`). Event-page frame at broadcast
width: tinted `bg-primary/5` surround, floating `max-w-6xl bg-background`
card with `md:drop-shadow-lg`. App Header suppressed (`header-mount.tsx`);
`DisplayChrome` renders OUTSIDE the card (its drop-shadow filter would become
the containing block for fixed positioning) as a corner strip mirroring
header geometry — logo top-left, presenter ⋮ dropdown top-right (event page /
light–dark via `useTheme` re-exported from `@favpoll/ui`, same-instance
requirement / fullscreen toggle). Rebuilt 2026-08-02/03 (PRs #461–#481)
around the **presence dial**: `DisplayVariant = "fundraiser" | "tribute"`,
default derived from register in the route (`remembering` → tribute),
presenter-switchable from the chrome ⋮ menu (check on active), persisted per
favpoll in localStorage. ONE banner row (`mb-8 border-b pb-6`, shared
`md:min-h-33` = avatar height so views swap with ZERO shift — banner box,
eyebrow text, headline and charity card all measured pixel-identical across
variants; both col 1s `md:items-start`, col 2 upper blocks pinned
`md:min-h-14`): **fundraiser** = money block left in the HERO's exact type
(SectionEyebrow muted in the h-8 band + `heroNameSizeClass` figure —
"Pledge goal £X of £Y" + progressbar; no goal → "Raised so far £X" with the
countdown as the hero-subtitle line via `Countdown variant="subtitle"`
[figures full size, "Closes in"/units text-sm/base at 70% ink, ml-3 between
components, seconds only inside the final day]; closed → "Poll closed £X"),
col 2 = compact identity (photo-gated avatar RIGHT of the name, no context
line, eyebrow mb-2) above CharityRow rows. **tribute** = the favpoll hero's
exact grammar as col 1 (eyebrow / name / dates line, 26/33 photo-gated
avatar right), col 2 = inline Countdown (default md — the favpoll page's
ramp) above a hairline + CharityRow rows; no goal figure/bar/shout. QR is
CHROME, not content: pinned fixed at the vertical centre of BOTH tinted
gutters (occlusion redundancy) at 200px from `min-[1600px]`
(`left/right-[calc((100vw-72rem)/4-100px)]` centres each in its gutter);
below 1600px an in-banner 132px QR remains; mobile stacks it under the
heading. Display QRs use brand-tinted ink via the `--qr` token
(`colorVar="--qr"`); the reveal appears ONLY as the witnessed close finale
(TypedReveal when the poll closes while the room watches — a statically
closed display shows no reveal; keepsake, not signage). Topic header is
projector-scale (`text-xl md:text-2xl`, mb-6). Below: rankings
(`RankingList size="display"` — text-lg labels, h-2 bars) beside the
`GuestWall` (animate, maxEntries 12).

**Freshness — polling, not realtime.** Supabase `postgres_changes` never
reach the anon browser: `pledges`/`favourites`/`pledge_allocations` have RLS
enabled with ZERO policies, and realtime respects RLS, so every event is
silently filtered (channels connect and hear nothing — this hid because
server renders use the service role). Never "fix" this with anon SELECT
policies: RLS is row-level, not column-level, and would expose guest
emails/tokens via PostgREST. Instead `DisplayScreen` calls `router.refresh()`
every 5s — the server re-fetches with full gating and streams fresh props:
rankings re-rank via `useRankingItems`' initialItems effect (which also fires
the aria-live mover announcements), the wall adopts fresh entries, the total
syncs from its prop. All other realtime code was removed in #244 (the
`useLiveWall` hook, the `/api/favpolls/[id]/wall` endpoint it consumed, the
`useRankingItems` channel) — the EVENT page deliberately has no live updates
(transactional surface: it refreshes after the viewer's own pledge;
spectating is this page's job). If push is ever wanted, use a server-sent
broadcast channel (bypasses table RLS), never postgres_changes.

**Reveal rule.** While the poll is open the reveal is WITHHELD entirely — no
blurred decoy on this surface; the RevealLockPill beside the name ("Pledge to
reveal {name}'s favourite") carries the intrigue. At close the reveal is the
finale: if the room witnessed the close (`localClosed` timer reaching
`closes_at`, anchored by `wasOpenAtMount` so a refresh delivering
`isClosed` can't cut it off), `TypedReveal` types it out; a page loaded after
close shows it statically.

**Goal = milestone, not stop sign.** Polls always end by date, never by
reaching the goal. Goal reached → success-green bar + "Goal reached — every
further pledge still counts". No goal → Countdown takes the centre slot.

**Vocabulary.** "Live" = updating in real time (this surface); "open" =
accepting pledges (vs closed). Never use "live" for open-ness in UI copy —
see GLOSSARY.md.

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
pnpm --filter @favpoll/web test:run     -- web tests (Vitest)
pnpm --filter @favpoll/admin test:run   -- admin tests (Vitest)
```

All tests must pass before committing. Current counts: 929 web, 56 admin.
Run `pnpm --filter @favpoll/web exec prettier --write .` from `apps/web` after changes (never from repo root — strips TS generics in .tsx).

Co-located `__tests__/` directories. Environments:

- Default (jsdom): pure functions, hooks
- `// @vitest-environment node`: server actions, API routes

Supabase mock: `makeSupabaseMock()` from `@/tests/mocks/supabase-admin`.
`vi.hoisted()` required for mock variables inside `vi.mock()` factories.
`redirect()` must throw — mock as `vi.fn().mockImplementation((url) => { throw new Error(url) })`.

---

## End-to-end testing

Playwright (`@playwright/test@^1.61.0`) installed in `apps/web`. Config: `apps/web/playwright.config.ts`. Tests live in `apps/web/e2e/`.

### Running locally

```bash
# From repo root — starts local dev server automatically (if not already running)
pnpm --filter @favpoll/web test:e2e

# Run a specific test file
pnpm --filter @favpoll/web test:e2e -- reveal-after-pledge.spec.ts

# Open HTML report
pnpm --filter @favpoll/web test:e2e:report
```

Requires `.env.local` in `apps/web/` with `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and Stripe test-mode keys. The playwright config loads `.env.local` automatically via `process.loadEnvFile`.

### CI environment decision: staging

E2E tests in CI run against the staging Vercel deployment (`PLAYWRIGHT_BASE_URL` = staging URL). **Not local Supabase.** Reasoning:

1. No local Supabase setup exists in this repo (no `supabase/config.toml`, no Docker Compose). Wiring Docker-based Supabase would be a significant CI infrastructure investment not justified by this brief.
2. Staging already has seeded reference data (Colour topic, Marie Curie charity) that the fixture setup depends on.
3. Stripe test-mode keys already work on staging.
4. Risk — shared staging state: mitigated by the test favpoll being owned by `user_e2e_playwright` (distinct, identifiable) and `is_listed: false` (invisible to real users).

Trade-off acknowledged: staging is faster to wire but means CI e2e tests share state with manual testing. If test data accumulates or conflicts with manual work, a dedicated Supabase project for CI is the next step.

### Test data convention

The global setup (`e2e/global-setup.ts`) creates a single open test favpoll once per environment via the Supabase admin client. It is **idempotent** — re-running finds the existing row by `created_by = 'user_e2e_playwright'` and reuses it. On every reuse it **extends `closes_at` to 90 days from now** so the favpoll is never stale-closed (the staging row is long-lived; if `closes_at` expires, `isClosed=true` → `onOpenPledgeDialog=undefined` → the pledge lock card is absent and `reveal-after-pledge.spec.ts` fails). The test favpoll:

- Protagonist: "E2E Playwright Test"
- Topic: Colour (finite, all canonical items linked)
- Charity: Marie Curie
- `personal_reveal`: "Cornflower blue. She kept a pot of cornflowers on the windowsill every summer."
- `closes_at`: extended to 90 days from now on every global-setup run
- `is_listed: false`

The exemplar favpolls (from `seed-exemplars.ts`) are **closed** (`closed_at` set in the past) and cannot be pledged to, which is why a separate e2e fixture is used rather than reusing Belinda Johnson.

To delete the e2e test data: `delete from favpolls where created_by = 'user_e2e_playwright';` (cascades to all child rows).

### Stripe test card convention

All e2e tests use Stripe test card `4242 4242 4242 4242`, expiry `12/34`, CVC `123`. This card always succeeds in test mode with no 3DS challenge. Do not introduce new Stripe credentials for tests — the same `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` used for development applies.

### Stripe PaymentElement fill technique

Stripe renders card inputs inside an iframe that can only be found by scanning every `stripe.com` / `stripe.network` frame for any `<input>` element — do not hardcode a frame name or title. The frame with inputs is `elements-inner-accessory-target` but this is an internal detail that can change.

Target card fields **by placeholder**, not by `nth()` position. A Link email field can appear above the card fields and shift positional indices:

```
input[placeholder="1234 1234 1234 1234"]  → card number
input[placeholder="MM / YY"]              → expiry
input[placeholder="CVC"]                  → CVC
input[placeholder="12345"]               → billing ZIP (only shown when Stripe geolocates US)
```

Use `pressSequentially()` (not `fill()`) for all Stripe inputs — Stripe's formatted inputs require real key events to trigger their formatters. `fill()` bypasses the keydown/keyup handlers and leaves fields empty or malformed.

**`payment_method_types: ["card"]`** must be set on `POST /api/stripe/payment-intent`. Without it, Stripe's adaptive payment-method selector may render Apple Pay / Google Pay buttons instead of the card form, which are incompatible with headless CI (no OS wallet, domain verification required).

### Guest email uniqueness in E2E tests

`createGuestPledge` (in `app/favpolls/[id]/actions.ts`) throws "You've already pledged" if the same email + poll combination already exists. Staging DB is persistent across CI runs, so each test attempt must use a unique email:

```typescript
await emailInput.fill(`e2e-test-${Date.now()}@playwright.test`);
```

Never hardcode a test email — it will fail on every CI run after the first.

### Covered flows (as of PR #123)

| Test                                                 | File                                | Auth            |
| ---------------------------------------------------- | ----------------------------------- | --------------- |
| Reveal appears after pledge (critical — see PR #120) | `reveal-after-pledge.spec.ts`       | None (guest)    |
| Wizard → publish → verify public page                | `wizard-publish.spec.ts`            | Clerk organiser |
| Cause wizard → publish → verify (no category; the faceless path — added after the 2026-07-13 blank-details regression shipped past unit tests; asserts is_listed=true, the inverse of the memorial spec) | `wizard-publish-cause.spec.ts` | Clerk organiser |

The organiser project's `testMatch` is `**/wizard-publish*.spec.ts` — new organiser wizard specs named `wizard-publish-*.spec.ts` are picked up automatically.

**Clerk testing tokens (2026-07-13):** Clerk's bot detection blocks headless sign-in on per-branch preview domains, so `auth.setup.ts` saved empty state and **every organiser spec silently skipped on every CI run** while the advisory job stayed green (found by reading the job logs, not the check). Fix: `global-setup.ts` calls `clerkSetup()` (`@clerk/testing`) when `CLERK_SECRET_KEY` is set, and `auth.setup.ts` applies `setupClerkTestingToken({ page })` — requires the `CLERK_SECRET_KEY` secret in the "Preview – favpoll-web" GitHub environment (same Clerk instance as the publishable key). Without the secret everything degrades to the old skip-gracefully behaviour, now with an explicit warning.

**TODO (follow-up):** Shared fund paths (Part 4 from the brief):

- Path B (guest contribute to fund via SeedFundModal guest variant)
- Path C (pledge using shared fund, no Stripe step)
- Over-allocation guard

### Organiser auth setup

The wizard test requires a signed-in Clerk organiser. The `auth.setup.ts` Playwright project navigates to `/sign-in` and signs in with credentials from `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD`. The session is saved to `e2e/.auth/user.json` (gitignored) and loaded by the wizard test project via `storageState`.

The test account must use **email + password auth** (not OAuth-only) in Clerk. Create it via the sign-up page, then add credentials to `.env.local` locally and to GitHub Actions secrets in CI. If these env vars are absent, auth setup saves an empty state and wizard tests skip gracefully.

### Advisory CI job

The `e2e` job in `.github/workflows/ci.yml` runs with `continue-on-error: true` — it is **advisory, not blocking**. A failure does not block merge. The suite was verified passing for the first time in CI on 2026-06-23 (PR #123). Promote to a required check after 5–10 successful CI runs.

Required GitHub Actions secrets (set under repo Settings → Secrets → Actions):

```
E2E_BASE_URL                    -- staging Vercel URL
E2E_SUPABASE_URL                -- staging Supabase project URL
E2E_SUPABASE_SERVICE_ROLE_KEY   -- staging service role key
E2E_STRIPE_PUBLISHABLE_KEY      -- Stripe test-mode publishable key
E2E_VERCEL_BYPASS_SECRET        -- Vercel deployment protection bypass secret (Project Settings → Security → Deployment Protection)
E2E_TEST_EMAIL                  -- Clerk test account email
E2E_TEST_PASSWORD               -- Clerk test account password
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY -- Clerk publishable key (same as dev/preview)
```

Until these are configured, the e2e CI job will skip most tests gracefully (credential guards are in global-setup.ts and auth.setup.ts). The Playwright HTML report is uploaded as a CI artifact (`playwright-report`) with 14-day retention.

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
ANTHROPIC_API_KEY                 -- Anthropic API key for generateDraft LLM calls (server-side only)
LLM_MODEL_ID                      -- model id for generateDraft; defaults to claude-haiku-4-5-20251001
```

### apps/admin

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_BASE_URL
CRON_SECRET                       -- authenticates /api/cron/verify-charities
CHARITY_COMMISSION_API_KEY        -- Register of Charities API (api-portal.charitycommission.gov.uk); sent as Ocp-Apim-Subscription-Key header
```

---

## Decisions locked in

- **One poll per favpoll.** `UNIQUE(favpoll_id)` on `favpoll_polls`. All types use singular `poll`. Do not build multi-poll support without explicit instruction.

- **`personal_framing` retired.** Column kept but never read/written. Auto-generated hint line replaces it.

- **Fixed instructional placeholders for About and Reveal.** The create/edit form (`EditableHero`, `EditablePollArea`) shows fixed instructional strings in the empty-field state — identical in style to the other form fields ("Enter opening line", "Enter Name", etc.). About (person): "Enter a short biography — tease the topic and the cause, but don't give too much away." About (cause): "What are you raising for? Tease the topic and why it matters — but don't give it all away." Reveal: "What did they love? Name it, and the detail only you'd know." `FormInner` no longer reads `topics.placeholders[effReg].about/reveal` for form placeholders; `deriveRegister` is not called in `FormInner`. `topics.placeholders` DB column, seed files, and admin editor remain in place but are now unread by the form — candidate for a future cleanup pass. `topics.placeholders` stores exactly 5 keys: `remembering`, `celebrating_one`, `celebrating_many`, `cause`, `neutral`. Dialog textareas use short prompts ("Write a few lines…", "Share something they loved…") distinct from the page-level instructional strings, so the PR #134 helper microcopy is not duplicated inside the dialog.

- **Static `topics.placeholders` About is charity-free.** The static placeholder `about` strings (stored in `topics.placeholders`) are shared across all charities, so per-(register × topic × charity) sets are not viable. Placeholder `about` teases the topic domain only — no charity references. Charity weaving belongs in the organiser's own words (their free-text `about`) and in per-favpoll exemplars only. Exemplars keep their charity weaving unchanged. **This applies only to the static placeholder hints.** Generated About (produced by `generateDraft`) is separately charity-aware — for cause favpolls the LLM prompt receives the charity name and description, and the generated copy gestures at the cause. See the generation decision for full details.

- **Localisation foundations.** `favpolls.market` default `'en-GB'`, `favourites.markets` default `['en-GB']`. `formatCurrency()` in `lib/i18n.ts`. `next-intl` deferred. See `references/LOCALISATION.md`.

- **Guest item moderation.** Guest items land immediately (pledge works without review). `review_status` on `favourites` governs canonical promotion only. Organisers hide/show via `favpoll_poll_favourites.is_hidden`. `acceptContribution` must set both `is_canonical = true` AND `review_status = 'accepted'`.

- **Results ranking sort order.** Primary: `all_time_pledged` desc. Secondary: `display_order asc nulls last` for finite topics, then `localeCompare` alphabetical for ties. `favourites.display_order` (nullable integer) set only for finite topics via admin `DisplayOrderEditor`; null = alphabetical sort.

- **`favpolls.category` + `favpolls.grouping` are the canonical occasion model.** `category` ∈ {celebration, memorial, fundraiser} (nullable for legacy rows). `grouping` ∈ {individual, couple, group} (default: individual). `register` is never stored — always derived via `deriveRegister(category, grouping)`. `occasion_type` and `is_plural` columns remain on the `favpolls` table for backward compatibility with legacy rows but are not written by new code.

- **Shared fund is mandatory.** Every favpoll gets a `favpoll_pots` row on creation, seeded at `total_deposited: 0` if the organiser doesn't specify an initial amount. Never gate pot creation on `potAmount > 0`. The "Add to the shared fund" top-up input in `LivePledgeCard` is always rendered. `topUpFund` creates the pot lazily for favpolls that predate this decision.

- **Item management — organiser additions from the wizard (canonical and custom).** Organisers add poll items post-publish on the event page (`addOrganizerItem` server action). In the wizard (step 2), both canonical and new/custom topics expose a **"View & add"** chip trigger that opens `TopicItemsDialog` (`favpoll-flow/topic-items-dialog.tsx`) — a search-and-add sheet. Canonical topics: existing items are shown read-only; organisers can add their own on top. New/custom topics: no existing items; ≥2 items required before the wizard can proceed. The draft is carried via `sessionStorage` key `favpoll_draft_additions` (`{ topicRef: { kind: 'new', title } | { kind: 'existing', id }, addedItems: string[] }`), with `&draftAdditions=1` as the SSR-safe URL signal; `FormInner` hydrates from `sessionStorage` on mount via `useEffect`. Legacy key `favpoll_new_topic_draft` (`{ title, items }`) is still supported as a fallback for old links. Canonical topics with **no** additions skip `sessionStorage` entirely and pass `topicId` + `topicTitle` directly in the URL. At publish, `createEvent` inserts the `topics` row for custom topics (`created_by` = Clerk id, `is_active: true`, `is_finite: false`, `placeholders: {}`, no categories) and all `favourites` (`source: 'organiser'`, `is_canonical: false`, `review_status: 'pending_review'`). For canonical topics, organiser additions are inserted into `favourites` and linked as `favpoll_poll_favourites` via the `addedItems` field on `PollInput`. No orphan rows — nothing is written until publish. Guest-added items use `source: 'guest'`, `review_status: 'pending_review'`. The admin contributions queue (`apps/admin/app/contributions/`) filters on `'pending_review'`. In `TopicItemsDialog` and `ItemAddField`, added-items chips use `<Chip onRemove={...} removeLabel={`Remove ${label}`}>` — the `onRemove` prop renders `Chip` as a `div` wrapper (not `<button>`), so the inner × `<button>` is valid and avoids the nested-button HTML violation. Exit warning fires when `isCustom || customLabels.length > 0` with copy "You have unsaved changes. Leave without publishing?" **TODO (deferred):** cross-session `localStorage` recovery for an abandoned draft — currently, if the user closes the tab before publishing, the draft in `sessionStorage` is lost.

- **No hint line on PollHeading.** The protagonist hint ("— Is it the same as [Name]'s?") has been removed. The reveal is the only mechanic for disclosing the protagonist's favourite — shown after pledging. `getPollHint` and the `pledged` prop on `PollHeading` are gone.

- **New favpoll entry point is a wizard page.** Clicking any "New event" button navigates to `/favpolls/new` (signed-out users are redirected to `/sign-in`). `/favpolls/new` is a server-rendered page that fetches wizard data (charities, topics, categories, and `charity_topics` suggestions map) via `getWizardData()` in `app/favpolls/new/wizard-data.ts` and renders `NewFavpollWizard` — a client component with 3 steps (Honour → **Charity** → Love). **Charity-suggested topics:** admin curates a `charity_topics` join table; `getWizardData` fetches all rows in one query and builds `suggestedTopicIds: Record<charity_id, topic_id[]>`. On the Love step, `LoveStep` receives `suggestedTopics?: TopicWithMeta[]` and `primaryCharityName?: string` derived from the primary (first) charity. When suggestions exist and no search is active, a "Suggested for {charity}" section appears above the full topic chip list. If no suggestions → picker unchanged (additive only, no gate). Admin manages suggestions per charity via the "Suggested topics" expandable section in `CharityRow` (searchable, checkboxes, save → `setCharityTopics` replace-set). Command-panel picker **does not** show suggested topics (deferred). **Full-page two-column layout** (no contained card): `md:grid md:grid-cols-[280px_1fr]`, left column = persistent triad rail with tense-aware `leftPrompt` + step labels/subtext/icons/opacity tiers, separated from step content by spacing (no `border-r`). On mobile: left column hidden, existing step-dot `<ol>` is the only progress widget (no second widget). Subject-aware copy is driven by `getWizardCopy(subject)` from `lib/wizard-copy.ts`. The wizard's selected-charity and selected-topic states are displayed via `WizardCharityCard` / `WizardTopicCard` (card components with Edit+Remove affordances); when nothing is selected, a ghost "Pick a charity" / "Pick a topic" button opens the overlay. `WizardStepShell` wraps each step with a centred title and guidance paragraph. The topic picker (step 3) and charity picker (step 2) open as `ResponsiveOverlay` sheets; search input lives in the overlay `header` prop (title goes `sr-only`) so it is always visible above the body divider. `CharityStep` accepts a controlled `search?: string` prop and renders no search input of its own. `LoveStep` accepts `search?`/`onSearchChange?` props — when provided, its own search input is hidden and the wizard drives the value. Both overlays reset search on close. Step 3 shows a compact item summary below the selected topic chip — rendered as readonly `Chip` components (existing canonical options in muted style; organiser additions in brand purple; overflow as "+N more") — with a "View & add" button that opens `TopicItemsDialog`; canonical topics without additions redirect via `topicId` + `topicTitle`; topics with any additions (or new custom topics) redirect via `draftAdditions=1` + sessionStorage (see item management decision). The `favpoll-flow/` step components (`HonourStep`, `LoveStep`, `CharityStep`) are mounted only by `NewFavpollWizard` (the stale claim that `CommandPanel` also used them was reconciled 2026-07-13 — it imports none of them). The triad order — Honour → Charity → Love — is reflected app-wide: wizard, missing-field list in CommandPanel, and Venn component names.

- **Onboarding for first-time organisers.** On desktop, `FormInner` returns `null` when no occasion is selected (no onboarding panel rendered). On mobile, `FavpollForm` renders `OnboardingInterstitial` (fixed inset-0 overlay) when `localStorage.favpoll_show_onboarding !== '0'`. "How favpoll works →" link sets `'1'` to re-open.

- **Toast notifications via sonner.** `<Toaster position="bottom-center" />` is wired in `app/layout.tsx`. Pass explicit `style` props on each toast call — do not rely on `classNames.warning` or CSS variables on `<Toaster>` as sonner's inline styles override them. Import `TOAST_ERROR_STYLE` / `TOAST_WARNING_STYLE` from `lib/toast-styles.ts` (they reference `var(--destructive-*)` / `var(--warning-*)` tokens, which resolve fine inside inline styles).

- **Publish FAB + publish flow (2026-07-03, supersedes the command panel).** `CommandPanel` is now a single floating action button (fixed bottom-right, rounded-full, primary). **Create mode**: click opens `CloseDateOverlay` (DateTimePicker pre-filled via `suggestClosingDate(category)` — 30 days memorial, 14 otherwise) whose footer Publish calls `createEvent`. **Edit mode**: click calls `updateEvent` directly. The FAB is never disabled for missing required fields — clicking raises a warning toast naming them ("Still needed before publishing: name"); submit errors surface as error toasts. Cancel is removed (browser back + the `beforeunload` unsaved-draft guard). `is_private` is always `false`; `potAmount` is always `null`. **Reverted after review (2026-07-04):** three siblings shipped with the FAB and were rolled back on the founder's call — the previewPill poll heading (inert primary pill + tooltip; back to non-interactive SectionLabel per PR #137), the hover tint on editable fields (the dotted-underline + pencil affordance stands alone; the lighter placeholders carry the empty-vs-filled signal), and pre-publish fund staging via FundPlanCard (`SeedFundModal` remains the single post-publish touchpoint — Stripe needs the favpoll id, and a "choose now, pay later" two-step risked reading as a double-ask).
- **Pledge goals (2026-07-04, growth-doc quick win).** Optional `favpolls.goal_amount` (pounds, CHECK > 0, null = no goal). Set from within `CharityBanner` in the form's right column: the banner takes an optional `onEditGoal` callback (form passes it, guest page doesn't) which renders a ghost "Set a goal" button when unset, or a pencil `icon-xs` beside the progress caption when set. It opens `GoalOverlay` (`favpoll-form/goal-overlay.tsx`, controlled `open`/`onOpenChange` from `FormInner`) — SeedFundModal-style layout: £ amount field first, presets £100/£250/£500 as outline buttons, stacked full-width footer (primary "Set/Save goal" over ghost "Remove goal"/"Not now"). A plain form field: staged in create mode and written by `createFavpoll` at publish; saved by the FAB via `updateFavpoll` in edit mode. There is deliberately no separate goal card (removed 2026-07-04 — it duplicated the banner's goal line) and no wizard step (goal is calibration, not identity — same reasoning that removed cause-label from the wizard). Displayed as **understated progress, never pressure**: `CharityBanner` gains an optional `goalAmount` prop (h-1.5 `bg-muted` track, `bg-primary` fill, caption "raised of the £500 goal", `role="progressbar"` with aria values) on the favpoll page; the live display shows the same quiet bar under the running total (`DisplayScreen.goalAmount`, optional). No goal → both surfaces unchanged. Sub-decision still flagged for review: preset values.

- **Optional contribution / tip (2026-07-05, funds the 0% model).** `pledges.tip_amount` (pounds, DEFAULT 0) — favpoll's money, strictly separate from `total_amount` (charity money): totals, `total_raised` and the record are untouched by tips. UI: a quiet "For favpoll" chip row (None / 50p / £1 / £2 — flat amounts, never percentages) on the pledge dialog's amount step, own-funds mode only (never on shared-fund pledges), caption "Optional — nothing is taken from your pledge. Contributions are what keep favpoll running." **Default: £1 preselected for all categories** (memorial None-default dropped 2026-07-31 on celebrant feedback — a None default simply stays None, and the ask wasn't read as insensitive). Tip controls sit in the amount step's decisions zone (under the shared-fund split, 2026-07-31); the receipt shows the tip as a plain line.
- **Guest-clarity pass (2026-08-02, PR #436, from the Joy misread analysis).** The pre-pledge lock overlay is ONE card: solid primary header carrying the lock CTA + three numbered mechanic steps (`lib/mechanic-steps.ts`, shared verbatim with the print pack) + the shared-fund escape hatch ("Don't have a favourite X? … you can still give to the shared fund" — honest because a pledge requires a pick; the fund accepts favourite-less givers). Topic ribbons on the favpoll page and list cards are HEADERS, not buttons — the lock card is the single pre-pledge CTA; entitled users get a standard shadcn gift icon button ("Pledge again" tooltip) at the ribbon's right edge (closed cards: none). Publish guards: person favpolls block submit while name/context/reveal still equal the generated example, and any about that mentions a reveal blocks while the reveal is empty. Generate dialog carries a provenance line ("Examples are starting points — everything published is yours to edit"). Step copy is the founder's card text: "Pick your favourite X" / "Pledge what it's worth — all money will go to {charity}" / "{First}'s favourite will be revealed along with the standings" (no-fee fact lives on poster/page microcopy). **Reveal shapes (2026-08-03, PR #482)**: no kind-selector UI (rejected — organiser friction + copy-matrix across printed packs); the Reveal field's helper teaches the three shapes ("a quote in their own words, a memory, or a message to guests — one sentence"), and quotes are INFERRED — `isQuoteReveal` (opening quotation mark) flips step 3 to "revealed in their own words" on both mechanic surfaces, travelling as a content-free boolean (pre-pledge surfaces never receive reveal text). `usePledge` gains `defaultTip` (default 1); `favpoll-content` passes `favpoll.category === "memorial" ? 0 : 1`. The tip rides the same Stripe charge (`ownCharge = pledge + topUp + tip`) and appears as a "For favpoll" breakdown line only when > 0. Also killed here: the leftover `FEE_RATE = 0.03` in the pledge actions that was still writing 3% into `pledges.fee` after the 0% pass — `fee` is now always written 0 (column retained for history).

- **Anonymity model + guest wall (2026-07-05, founder-signed).** Rules: names public by default with a hide control; amounts never on the wall; organiser always sees names (disclosed in the control's microcopy — "The organiser can always see your name for thank-yous"); anonymous pledges count fully in totals and the record. Schema: `pledges.display_name` (guest-typed; signed-in pledgers resolve via `users.display_name` instead) + `pledges.is_anonymous`. Capture UI: an "On the guest wall" block at the top of the pledge dialog's payment step — guests get an optional name Input (blank = "Someone"), everyone gets a hide Switch; fund pledges carry `is_anonymous` too. Display: `GuestWall` (`components/guest-wall.tsx`) in the favpoll page's right column under CharityBanner — name + "backed X" + relative time, max 24, SSR (refreshes via the existing `router.refresh()` after a pledge). **Standings gate**: un-entitled viewers of open polls get `labels: []` server-side (wall says "pledged", not "backed Purple") — same invariant as the per-favourite amount gating. Names never derived from emails.

- **Record threshold + breadth (2026-07-05).** `lib/record.ts` is the single source: `RECORD_MIN_PLEDGED_GBP = 500` + `RECORD_MIN_ITEMS_WITH_ACTIVITY = 3`. `isEstablishedRecord(items)` (per-topic: total ≥ £500 AND ≥3 items with any pledges — a lone big pledge is a spike, not a record) gates `/rankings` into an established grid and a muted "Still gathering" section (dimmed, shown, never hidden). `meetsCrossTopicThreshold(items)` (the landing tiles' cross-topic gate) was removed 2026-07-11 along with the tiles themselves — the landing's record presence is now an ungated one-line principle (true from pledge one, so no data threshold applies); `/rankings` remains the only thresholded surface. Display-only — every pledge always counts in full (founder §4: no caps/damping). Breadth per founder §4: each `/rankings` card shows "£X across N pledges" (`all_time_count` sum) + a methodology line ("amounts are amounts… we always show how many pledges stand behind a total"). **TODO**: N is pledge count, not distinct pledgers — true distinct-pledger derivation is a later DB task.

- **Bump chart / "the story of the poll" (2026-07-05, growth §9).** Rank-over-time, **ordinal only** (amounts never leave `lib/rank-history.ts`), so it's memorial-safe and honours the amounts-private default. `deriveRankHistory(events, labels)` reconstructs standings from timestamped `pledge_allocations` (no snapshot table): cumulative-per-favourite, dense-ranked after each event, `simplifyPoints` collapses flat runs to inflection points (a 110-pledge poll → a handful of corners). `BumpChart` (`components/bump-chart.tsx`) is a self-contained SVG — leader in `currentColor`/primary, others `var(--chart-3)` dimmed; right-edge labels; no chart lib. Surfaced on the favpoll page's **left column, closed favpolls only** (open polls gate standings behind the reveal lock — a live chart would leak them), via a dedicated unbounded chronological query in the page, gated at `RANK_HISTORY_MIN_PLEDGES = 8`. Second surface shipped 2026-07-05: **topic pages** show an all-time cross-favpoll chart via `bucketEventsByWeek` (weekly buckets → `deriveRankHistory`), a **dated x-axis** (`BumpChart.axisLabels`, ~5 ticks), gated on `isEstablishedRecord`. Presented as a right-column teaser card (`TopicChartCard`: lines-only `BumpChart compact` preview) that opens the full labelled/dated chart in a `ResponsiveOverlay` on click — the narrow column can't hold the full-width chart. Both surfaces kept. **Keepsake shipped 2026-07-05**: `/favpolls/[id]/keepsake` (closed favpolls only) is a print-optimised single sheet — monogram header, occasion framing (`getFavpollHeadline`), reveal, this-poll final standings (summed from `pledge_allocations`, not all-time), the step bump chart, total + charities, and a 'With thanks to' line from non-anonymous pledger names. `PrintButton` → `window.print()` (browser Save-as-PDF; no runtime dep, feeds the future paid print version). Global `@media print` hides the site header/footer/toaster; `SiteFooterMount` also excludes the route. Amounts appear on the sheet (post-close, everyone sees standings) but per-guest amounts never do.

- **Charity Commission verification (2026-07-05, growth-doc quick win).** Charities with a `registered_number` are checked against the Register of Charities API. Client: `apps/admin/lib/charity-commission.ts` (`verifyCharityNumber(number, name)` — never throws; API failures return status `error` so a flaky upstream can't block charity admin). Statuses: `verified` / `name_mismatch` (register name differs after lowercase-and-strip-punctuation normalisation; `verified_name` holds the register's name) / `not_found` (404) / `removed` (`reg_status != 'R'` or `date_of_removal` set) / `error`; null = never checked. Runs automatically in `createCharity`/`updateCharity` whenever the number is present/changed; clearing the number clears all three columns. Revalidation: `GET /api/cron/verify-charities` in the **admin** app (daily 03:00 via `apps/admin/vercel.json`, Bearer `CRON_SECRET`), re-checks up to 25 charities whose check is >30 days old, errored, or missing. Admin UI shows a status badge per charity (mismatch badge's title shows the register name); the guest `CharityRow` shows a small `BadgeCheck` in primary next to "Charity no. X" **only** for `verified` — other states are admin-facing only. The API provides data, not logos. Existing charities get checked on first cron run after deploy (or on next admin save).

- **Post-publish shared fund seeding (`SeedFundModal`).** After `createEvent` succeeds in create mode, `FavpollForm` renders `SeedFundModal` (instead of immediately redirecting) — `seedEventId` state holds the new event ID. The modal (`favpoll-form/seed-fund-modal.tsx`) shows headline "Give guests a head start", body copy, three preset buttons (£10/£25/£50), a number `<input aria-label="Amount in pounds">`, and a "Skip for now" plain text link (no × close button — `hideCloseButton` on `ResponsiveOverlay`). "Seed fund" button (disabled until amount > 0) calls `POST /api/stripe/payment-intent` with `metadata: { type: 'pot_top_up', event_id }`, then shows `StripeCheckout`. On payment success: calls `topUpFund(eventId, amount)` then redirects to `/favpolls/[id]`. `topUpFund` failures are swallowed — redirect always fires. On payment cancel: returns to the modal with "Payment was cancelled." inline error; "Skip for now" still available. Edit mode is unchanged (modal never shown on save).

- **Listed/Unlisted model.** `favpolls.is_listed` (boolean, default `true`). Listed → appears on the `/favpolls` live favpolls page. Unlisted → reachable by URL only, not shown on `/favpolls`. **All favpolls feed the record regardless of `is_listed`** — rankings query `favourites.all_time_pledged` directly, not through `favpolls`. `remembering` register defaults to `is_listed = false`; organisers can override with the switch before publishing. The `/favpolls` query filters `.eq("is_listed", true)` in addition to `.eq("is_private", false)`. `is_private` (access control) and `is_listed` (discoverability) are orthogonal.

- **opening_line is organiser-editable.** Shown as placeholder text in the form (from `PREFIXES[occasion]`) — not pre-filled. Organiser may type their own. Stored in DB. Preview falls back to `PREFIXES[occasion]` when field is empty. Never derive it purely from occasion at render time.

- **Field character limits.** name: 40, context: 40, opening_line: 50, about: 300, personal_reveal: 280. Enforced via Zod max(), HTML maxLength, and CSS overflow (line-clamp-2 on name heading, truncate on context and opening line). Limits chosen to prevent layout breakage in the favpoll preview.

- **Admin app auth.** All routes protected by Clerk. Non-admin authenticated users → `/access-denied`. `createAdminClient()` uses service role key, bypasses RLS.

- **Seed command.** `pnpm seed` from root runs `scripts/seed.ts` via `apps/web` filter. To seed staging: `cd apps/web && NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm tsx ../../scripts/seed.ts`. Topic placeholders are stored **register-keyed** (5 keys per topic); no occasion→register routing at write time. The six `scripts/placeholders-regenerated*.ts` batch files are the source of truth — `scripts/apply-placeholders.ts` (run with `tsx`) merges them into the inline `topics` array when batch files change. `seed.ts` imports all six batches at startup (duplicate title → throw). **`applyAllPlaceholders()`** runs after all topic rows exist: iterates every entry in `combinedPlaceholders`, fetches topic rows by title, writes `placeholders` to each — covering all ~118 topics regardless of which seed path created the row. Throws listing any map title with no DB row. **`assertAllTopicsHavePlaceholders()`** then validates every active topic in the map has all 5 register keys non-empty (`about`/`reveal` only — no `pronouns` check; none of the six placeholder batch files populate it) in the DB, providing a bidirectional fail-loud guard. `celebrating_many` placeholder entries carry `group: "pair"` (default) or `group: "set"` (sport cluster, defined in `scripts/celebrating-many-groups.ts`); group tagging is applied inside `combinedPlaceholders` at seed startup.

- **Preview example name.** When the organiser hasn't typed a name, the preview renders a greyed persona-matched example name (e.g. "Elizabeth" for she-persona, "Joan & Arthur" for a pair) selected stably by djb2 hash of the topic title via `getExampleName(topicTitle, pronouns, grouping: FavpollGrouping, register)` in `lib/registers.ts`. `grouping === "couple"` → pair pool, `grouping === "group"` → set pool. Name substitution into persona `about`/`reveal` prose is explicitly NOT a feature. `contextExamples` in `registers.ts` is register-keyed (`Record<Register, string>`) and used as the greyed context-line placeholder.

- **Chip vs pickerfield threshold.** Under 12 canonical items → render as chips. 12 or over → render as pickerfield (searchable combobox). Threshold stored as named constant `PICKERFIELD_THRESHOLD = 12`. Applies to guest pledge view (infinite topics) and organiser form item preview. Organiser form item _addition_ always uses ItemAddField pickerfield regardless of count.

- **Pledge panel draft state.** Selections are not committed until the user clicks Done. Opening the Sheet/Dialog initialises `draftIds` from the current `selectedIds`. Closing/dismissing without Done discards the draft. This prevents partial selections appearing in the trigger display.

- **Server-side data gating for un-pledged viewers.** `app/favpolls/[id]/page.tsx` computes `entitled = hasPledged || isClosed || isOrganiser`. When `!entitled`, the page nulls `personal_reveal` and zeros `all_time_pledged`/`all_time_count` on all favourites before passing to `FavpollContent`. The gated `/api/polls/[pollId]/reveal` endpoint then provides the real data post-pledge. **`RankingList` must not be mounted pre-pledge** — `useRankingItems` subscribes to Supabase Realtime (`favourites:{topicId}`), which would deliver real amounts even if the server sent zeroed values. `PollSection` enforces this: `RankingList` is only rendered when `entitled=true`; pre-pledge shows a pixel-perfect blurred decoy (static, no Realtime, `aria-hidden`) with an absolute unlock overlay button naming the reward with the protagonist's first name (cause fallback: no name). Guest entitlement: `onPledgeSuccess(guestToken?)` in `useFavpollContent` fetches `/api/polls/.../reveal?guest_token=X`, sets `localReveal`/`localItems`/`localEntitled`. Signed-in entitlement: `router.refresh()` re-runs page with `hasPledged=true`, `entitled=true` flows down via the `useEffect` sync. The unlock affordance is the shared **reveal-lock pill** (`components/reveal-lock.tsx` — solid primary button style with inline Lock icon, normalised from the landing page 2026-07-03): visible label from `revealLockLabel(firstName)` — "Pledge to see {FirstName}'s reveal" for person favpolls, "Pledge to see the reveal" for cause favpolls. The label may name the protagonist (public data) but must never contain the reveal text or reflect real standings. The accessible name (aria-label) on the unlock button names the protagonist's first name for person favpolls ("Pledge to reveal {Name}'s favourite and see the results"), or falls back to "Pledge to see the reveal and results" for cause favpolls — never the reveal text itself, which must remain server-gated. **The `/favpolls` listing card applies the same blurred-decoy + lock-hint pattern for live, un-pledged cards** (PR `feat/list-card-decoy`): `entitled = hasPledged || isClosed` on the card; when `!entitled`, a blurred `FavpollListCardResults` with `DECOY_WIDTHS` (arbitrary fixed percents) and `amountPence: 0` (renders "—") is shown under an `aria-hidden` lock hint ("Pledge to see how the pledges are landing." — no "reveal" clause because the card carries no `personal_reveal`). The `app/favpolls/page.tsx` gating is unchanged: `initialResults` is only sent for polls the signed-in viewer has pledged to. Decoy widths are never derived from real data. Closed and exemplar cards are entitled (`isClosed=true`) and never show the decoy.

- **Typewriter reveal on the live favpoll page (PR feat/page-typewriter-reveal).** On first in-session disclosure the `personal_reveal` types out rather than appearing instantly, mirroring the hero demo's concealment pattern. Implemented via `TypedReveal` (`poll-section/typed-reveal.tsx`), a thin client component that wraps `PollReveal`. The signal distinguishing "just unlocked" from "already entitled on load" is `pledgeConfirmed` in `useFavpollContent` (= `pledgeJustConfirmed` prop on `PollSection`). When `pledgeJustConfirmed=false` (returning pledger, closed poll, organiser, reload): delegates to `PollReveal` directly — no animation, SSR-safe. When `pledgeJustConfirmed=true` (first pledge this session): renders an `aria-hidden` typed `<blockquote>` (character interval, ~1900ms total) plus an `sr-only role="status" aria-live="polite"` carrying the full text immediately for AT — so assistive tech announces the reveal once, not keystroke by keystroke. Interval restarts only when `text` changes (deps: `[text, shouldType]`), so RankingList realtime re-renders don't re-type. Respects `prefers-reduced-motion`. Security unchanged — `TypedReveal` is presentation only; gating is upstream.

- **Pledge dialog triggers.** `FavpollContent` always passes `onOpenPledgeDialog` to `PollSection` on open polls (regardless of `entitled`). Two triggers: (1) the "FAVOURITE {TOPIC}" header pill — always visible, tappable before and after pledging to re-open the dialog; (2) the unlock overlay button covering the entire blurred region pre-pledge. `localEntitled` starts from the server `entitled` prop and is set true client-side after pledge success (guests) or on server refresh (signed-in).
- **Unified pledge dialog.** The guest pledge flow is one self-contained 3-step `ResponsiveOverlay` (`pledge-dialog/`): step 1 = pick favourites (chip picker), step 2 = amount + breakdown + funding path selector, step 3 = inline Stripe payment. A single "Pledge favourites" button replaces the old separate `PledgePanel` trigger and `PledgeCard`. `PledgePanel` is kept for the organiser form preview; `PledgeCard`/`LivePledgeCard` are kept but no longer rendered on the guest event page. `StripeCheckout` gained an `inline` prop (no fixed overlay) for embedding in step 3.

- **Pledge dialog funding paths.** Step 2 shows a "Pay with card / Use shared fund" tab selector at the top of the body when `hasFund` is true (pot exists, available > 0, user signed in). Path A = card payment, advances to step 3 (Stripe). Path C = shared fund, calls `pledgeFromFund` directly with no Stripe step. Guest email capture is deferred to step 3 (Stripe form) via `showEmailCapture` prop on `StripeCheckout`; step 2 no longer shows an email field. `handlePledgePaymentSuccess` accepts optional `email?: string` (from Stripe form) and passes it to `createGuestPledge`. A listed-favpoll notice is shown in step 2 right column when `useSharedFund && isListed`.

- **Guest shared fund contribution (Path B).** `FavpollContent` right column shows a "Help others take part" card when `!isClosed && pot.total_deposited > 0`. Clicking "Add to the shared fund" opens `SeedFundModal` with `variant="guest"`. `SeedFundModal` gains `variant?: "organiser"|"guest"`, `isListed?: boolean`, and `onCancel?: () => void` props. The guest variant uses different copy, shows "No thanks" cancel instead of "Skip for now", and calls `topUpFundAsGuest` (no-auth server action). `topUpFundAsGuest` in `app/favpolls/[id]/actions.ts` requires no auth and updates an existing pot's `total_deposited` only — it never creates a new pot row (pot is always present per the mandatory-fund decision).
- **Residual shared-fund policy (founder decision, 2026-07-31).** Any shared-fund money left undrawn when a favpoll closes goes to the favpoll's charity(ies) at settlement — fund money is charity money, full stop. The disbursement provider must implement this at the launch flip (it is currently the pre-launch stub). This policy is why the pledge receipt shows ONE charity line covering pledge + fund: everything the guest gives reaches the charity, either through the guests the fund helps or as residual at settlement.

- **Mobile breakpoint is `md` (768px) throughout.** All responsive grid/layout changes use `md:` prefix. Do not introduce new `lg:` breakpoints for layout (only for spacing/typography if needed).

- **iOS input zoom prevention.** `globals.css` applies `font-size: max(16px, 1em)` to all `input, textarea, select` globally. Inputs below 16px font size trigger iOS auto-zoom. Do not set `text-sm` or smaller on any focusable input element.

- **Charity-aware About/Reveal generation (`generateDraft`).** `apps/web/lib/actions/generate-draft.ts` is a server action that returns `{ about, reveal, fromCache }` copy pre-filled into the Set-up form's About and Reveal fields. Cache key = `"{register}:{topic_id}:{primary_charity_id|'none'}:{subject}:{pronoun|'none'}"` — 5 segments as of PR #138; `pronoun` segment is only meaningful for `subject='someone'` (cause favpolls always use `'none'`). The migration `20260701000000_add_protagonist_pronoun.sql` truncated `generated_drafts` because old 4-segment keys become permanently orphaned under the new format. Cache read always precedes any LLM call. Person favpolls (`subject: 'someone'`) use `'none'` for the charity segment — About is charity-agnostic so one entry covers all charities, but the LLM prompt is told the favpoll raises funds for charity (without naming it) so the About gestures at giving. Cause favpolls (`subject: 'cause'`) key on the primary (first-listed) charity — Reveal is grounded in `charity.description`. Charity is fetched for both subjects when `primaryCharityId` is present. **About never names a specific charity** in either mode. Person Reveal MUST name a real `topic_item` label (validated via `revealNamesRealItem()`; retried once on failure — runtime equivalent of `scripts/lint-topics.mjs`). Cause Reveal must not contain invented statistics (`hasFabricatedStats()` guard; retried once on failure). Model id is read from `LLM_MODEL_ID` env (default `claude-haiku-4-5-20251001`); key from `ANTHROPIC_API_KEY`; call is server-side only. Rate-limited 5 calls / 5-minute window per organiser (in-memory; TODO: graduate to middleware-level rate limiting). **Counter increments only on a successful LLM generation** — cache hits and failed calls (auth error, API key missing, timeout, bad JSON) cost nothing against the limit. **Custom topic generation.** `GenerateDraftInput.topicId` accepts an empty string `""` for organiser-created (custom) topics. When `topicId = ""`, `generateDraft` takes the custom branch: requires `topicTitle` (non-empty string) and accepts `itemLabels?: string[]` (the organiser's custom labels, may be empty). Cache lookup and write are skipped (no stable key). Charity is still fetched when `primaryCharityId` is set. Fabricated-stats retry applies for cause favpolls; item-name retry applies for person favpolls only when `itemLabels.length > 0` (no canonical list to validate against when empty). `safeGenerateDraft` is called with `topicId: ""` and `topicTitle`/`itemLabels` spread in. **Generation is opt-in, not automatic.** Fields load empty with static `topics.placeholders[register]` hint text. A quiet "Generate a suggestion →" prompt (`text-sm text-muted-foreground`) appears below the About placeholder in the preview panel when about is empty and the topic has a canonical topicId or is a custom topic with a title; clicking fires `handleRegenerate` in `FormInner`. The Regenerate button (RefreshCw icon) inside the About overlay handles subsequent generations. **Generation is non-blocking and non-fatal via `safeGenerateDraft`**: all callers invoke `safeGenerateDraft` (not raw `generateDraft`) — the wrapper catches any server-side throw (auth error, rate limit, LLM failure, missing API key), logs `"generateDraft failed, using fallback: <reason>"` to the server console, and returns `null`. Since `safeGenerateDraft` never throws, Next.js never returns a 500 for generation failures. On failure (null result) the form stays with empty fields; on explicit regeneration failure a toast informs the organiser they can write their own copy. `generateDraft` remains exported for direct use in tests that need to exercise the raw error paths. Static `topics.placeholders` are **not** replaced — they remain as instant fallback hints in the UI. **Person Reveal is rendered as a greyed example only** — never auto-committed — because a real person's favourite cannot be known; Cause Reveal and both Abouts pre-fill the editable fields on generate. The dirty-flag / confirm-before-overwrite guard applies when regenerating over existing text. Admin curation surface for `generated_drafts` is live at `/generated-drafts` in the admin app (PR C).

- **`favpolls.description` — cause About storage.** For cause favpolls (`subject='cause'`), the generated or edited About text is stored in `favpolls.description` (existing nullable column; no migration needed). `onSubmit` passes `description: isCause ? values.about?.trim() || null : null` for both create and edit modes. The edit page pre-fills `about` from `event.description` for cause favpolls. Person favpolls do not use `favpolls.description`. **`CauseHero` reads `event.description` for the body** — write location and read location are both `favpolls.description`.
- **Cause favpoll page rendering.** The published favpoll page (`/favpolls/[id]`) renders `CauseHero` (not `FavpollHero`) when `event.subject === 'cause'`. `FavpollWithDetails.protagonists` is typed `Protagonist | null` — null for cause favpolls, non-null for person favpolls. `FavpollHero` is passed `event.protagonists!` (always safe because the branch only reaches `FavpollHero` when `subject` is `'someone'`). Cause Reveal is stored as `favpoll_polls.personal_reveal` (the same column as person reveal) and surfaces post-pledge via `PollSection` → `PollHeading` → `PollReveal` — no separate column or path needed.

- **Cause favpoll listing card rendering.** `FavpollListCard` handles cause favpolls: `protagonist` is typed `{ name: string } | null`; when `subject === 'cause'`, `cause_label` is passed as the name to `FavpollHeader`. The `/favpolls` listing query (`FAVPOLL_SELECT`) selects `subject` and `cause_label` alongside `protagonist:protagonists ( name )`. Neutral-register favpolls (no `occasion_type`) have no `opening_line` set by the seed scripts — this is correct; the eyebrow is intentionally blank for unclassified occasions.

- **`scripts/seed-favpolls.ts` behaviour.** Owns all rows via `created_by = 'user_seed_scale'` (organisers `user_seed_001`–`008` for guest pledges). Tops up to `TARGET_FAVPOLLS = 40` idempotently; never deletes. Inserting `pledge_allocations` fires the record trigger, so each run **shifts staging's `all_time_pledged` / `all_time_count`** — relevant when building the `/rankings` data threshold logic, which will be tested against synthetic numbers. `event_count` / `total_pledge_count` are intentionally left at 0 (no trigger; reserved for future inclusion-promotion). Cleanup: `delete from favpolls where created_by = 'user_seed_scale';` (cascades to polls, items, pledges, allocations, pots). The `favpolls` insert must never set a `register` field — that column was dropped by `20260607140000_derive_register.sql`; `register` is local-variable-only inside this script (used for `closingDays`/`aboutFor`/the result summary), never written to the DB. `loadReferenceData()` paginates the `favourites` fetch via `.range()` in 1000-row pages — PostgREST caps an unranged `.select()` at 1000 rows, and `favourites` now holds ~3300 rows after the full topic-library seed, so a plain select would silently starve `itemsByTopic` for most topics and `createOneFavpoll()` would skip them with no logged error (its `allItems.length === 0` early-return is silent by design, unlike its sibling error sites). **Occasion model fields written:** `opening_line` is populated from a local `OPENING_LINE_PREFIXES` map (mirror of `OCCASION_TYPE_PREFIXES` in `lib/display.ts` — update both if occasion prefixes change); `category`, `grouping`, `subject`, and `is_listed` are set via a local `registerToOccasionModel()` helper using the hand-built mapping (remembering→memorial/individual/someone/unlisted; celebrating*one→celebration/individual/someone/listed; celebrating_many→celebration/couple/someone/listed; cause→fundraiser/individual/**cause**/listed; neutral→null/individual/someone/listed). **Cause-register rows follow the app's cause shape** (fixed 2026-07-03): no protagonist row is created; the name comes from `CAUSE_POOL` (appeal-style labels, never the person `NAME_POOL`) and is written to `cause_label`; the about comes from `causeAboutFor()` and is written to `favpolls.description`; `protagonist_id` is null. Before this fix the script created a protagonist for every register, so cause rows had `subject='cause'` with a protagonist and no `cause_label` (an empty CauseHero h1) — and older manually-created test rows exist with `subject='someone'` and appeal-style protagonist names, which surface as "Pledge to see The's reveal" in the reveal-lock label. **`personal_reveal`** is keyed by `register` from `topic.placeholders[register].reveal` — \_not* by `occasionType`. Bug history: the original script incorrectly used `topic.placeholders[occasionType]` (wrong key) so all reveals were null; also omitted `opening_line`/`category`/`grouping`/`subject`/`is_listed`, leaving the DB occasion model blank. Both bugs were fixed in PR #120; existing seeded rows require a re-seed (delete + re-run) to get the corrected data — no retroactive backfill was applied. **`scripts/seed-exemplars.ts`** applies the same occasion model fields. The Hargreaves Memorial Fund exemplar is seeded as a cause favpoll: no protagonist row is created, `subject='cause'`, `cause_label='The Hargreaves Memorial Fund'`, `description=ex.about`; idempotency check uses `favpolls.cause_label` instead of `protagonists.name` for this exemplar.

- **Dialog header input pattern.** When an overlay needs a primary text input (search, name, long-form field), place it in the `header` prop of `ResponsiveOverlay`; the `title` goes `sr-only`. The body holds secondary content (description, char counter, regenerate button). Use shadcn `Input` for single-line with `className="h-auto rounded-none border-0 px-0 py-0 text-base shadow-none focus-visible:ring-0"` and shadcn `Textarea` for multi-line with `className="min-h-0 rounded-none border-0 px-0 py-0 text-base shadow-none focus-visible:ring-0"`. Never switch to raw `<input>`/`<textarea>` when using this pattern — the shadcn components are required so that global theming and accessibility plumbing are preserved. The pledge-dialog step-1 picker header (`pledge-dialog/step-pick-favourites.tsx`) and pledge-panel are canonical examples of this pattern.

- **`Countdown.closesAt` is optional.** When `closesAt` is absent, `Countdown` renders a `--` placeholder in the same variant layout with `text-muted-foreground`. The `useEffect` guard skips the timer when `closesAt` is undefined. Use `<Countdown />` (no prop) for the create-mode preview (date not yet set); use `<Countdown closesAt={iso} />` for the live widget.

- **`FormInner` is the direct form host.** `favpoll-form/form-inner.tsx` owns `isGenerating` state, `handleRegenerate`, and composes `EditableHero`, `EditablePollArea`, `EditableCountdown`, and `CharityBanner` directly. A floating "Generate a suggestion" `Button` (Sparkles icon) lives in the left column after `EditablePollArea`, gated on `showSparkles = selectedTopics[0]?.isCustom ? !!selectedTopics[0]?.title : !!selectedTopics[0]?.topicId` (true for canonical topics with a topicId, or for custom topics with a non-empty title). Sub-components read form state via `useFormContext<FavpollFormValues>()`. `preview-panel.tsx` was deleted in `fix/sparkles-orphaned-host` — `FormInner` is the only rendering path.

---

- **Manage page retired.** `/favpolls/[id]/manage` was deleted. The `OrganizerCard` on `/my-favpolls` is now the single management surface — it carries everything the manage page showed (total raised, poll topic, shared fund, live display link, share link) plus Listed/Unlisted toggle and a QR code. The `LiveDisplaySection` component and `setFavpollListed` server action are both still live; `LiveDisplaySection` is no longer used (could be deleted in a future cleanup), but `setFavpollListed` is used by `OrganizerCard`. The middleware route protection for `/favpolls/:id/manage` was also removed; `/my-favpolls` was added instead.

- **Ubiquitous-language rename: `events` → `favpolls` — complete across all five passes.** favpoll is both the brand name and the top-level entity. The rename was carried out in five passes:
  - **Pass 1 — DB, types, routes:** `events`→`favpolls`, `topic_items`→`favourites`, `event_polls`→`favpoll_polls`, `event_poll_items`→`favpoll_poll_favourites`, `event_charities`→`favpoll_charities`, `event_pots`→`favpoll_pots`, `event_invites`→`favpoll_invites`, `event_category`/`event_grouping`/`event_subject`→`category`/`grouping`/`subject`. All dependent triggers/RLS/routes/types renamed. Data was junk pre-rename; migration truncates and live project reseeded via `pnpm seed`.
  - **Pass 2 — files and directories:** `event-card.tsx`→`favpoll-list-card.tsx` (collision with `favpoll-card/` resolved by choosing `favpoll-list-card`), `event-hero.tsx`→`favpoll-hero.tsx`, `event-form-v2/`→`favpoll-form/` (also dropped `-v2`), `event-flow/`→`favpoll-flow/`, `new-event-wizard/`→`new-favpoll-wizard/`, `new-event-button.tsx`→`new-favpoll-button.tsx`, `event-content/`→`favpoll-content/`, `event-summary-card.tsx`→`favpoll-summary-card.tsx`, `live-events-carousel.tsx`→`live-favpolls-carousel.tsx`, `/my-events`→`/my-favpolls`, `close-events/`→`close-favpolls/`. `cause-hero.tsx` deliberately left unchanged ("cause" ≠ event terminology).
  - **Pass 3 — internal identifiers (props, locals, private types):** `event`/`events` props on Favpoll-typed components → `favpoll`/`favpolls`; `eventPollId`→`favpollPollId`; `eventPollItemId`→`favouriteId`; `eventData`→`favpollData`; `eventUrl`→`favpollUrl`; `raisedByEvent`→`raisedByFavpoll`; `CreateEventInput`→`CreateFavpollInput`; `seedEventId`→`seedFavpollId`; `CauseEvent`→`CauseFavpoll`; admin `events` locals→`favpolls`. Pre-existing `display-screen` TS error (prop still named `eventUrl` after Pass 1) fixed here. All 811 web + 56 admin tests green; `tsc --noEmit` clean.
  - **Pass 4 — Supabase query locals:** remaining `.from("events")` / `.from("event_polls")` / `.from("topic_items")` strings in query files updated to `favpolls` / `favpoll_polls` / `favourites`. `formatEventDate`→`formatFavpollDate`, `sendEventClosed`→`sendFavpollClosed`.
  - **Pass 5 — docs and seed scripts:** `references/GLOSSARY.md`, `references/LOCALISATION.md`, `references/EXAMPLES.md`, `.claude/commands/favpoll-context.md` updated. `scripts/seed-favpolls.ts` identifiers renamed (`EventType`→`FavpollType`, `EVENT_TYPE_WEIGHTS`→`FAVPOLL_TYPE_WEIGHTS`, `pickEventType`→`pickFavpollType`, `pledgeCountForEvent`→`pledgeCountForFavpoll`, `ALLOW_EVENT_SEED`→`ALLOW_FAVPOLL_SEED`). `scripts/seed-exemplars.ts` `ALLOW_EVENT_SEED`→`ALLOW_FAVPOLL_SEED`. `README.md` and `references/COMPONENT_TREE.md` marked as outdated snapshots (both are too stale to rewrite; they point to this document as canonical). Historical handoff docs and marketing copy are explicitly excluded — "event" in those contexts is either historical record or "life event" domain language (correct usage).
  - **Documented exclusions (not renames):** `HANDOFF.md`, `references/SESSION_HANDOFF.md`, `references/session-handoff-2026-*.md` (historical records); `references/charity-pitch.md`, `founding-story.md`, `organiser-pitch.md`, `will-writers-pitch.md` ("event" = "life event" — correct domain usage); `scripts/run-migrations.ts`, `scripts/run-sql-migrations.mjs` (SQL strings reference old table names to detect pre-rename schema state — intentional); `scripts/seed.ts:281 "Sponsored event"` (legacy register key — changing would break backward compat with old DB rows); `favourites.event_count` column references (actual DB column name, not renamed).
  - Any future stray "event" reference found in the codebase should be checked against this exclusion list before assuming it is a gap. See `references/GLOSSARY.md` for the full vocabulary.

- **Per-occasion landing headlines (2026-07-03, supersedes the fixed-headline rule of 2026-06-24).** The hero headline cycles with the demo scene, in sync with the eyebrow — six variants under `landing.headline.*` in `messages/en-GB.json` (memorial/birthday/retirement/engagement/leaving_do/graduation). All share the "<verb> them … what they love — for the causes they care about." rhythm; only the memorial line (the canonical 2026-06-24 headline) is past tense and must never change. The `favpoll-brand` skill documents the set and the rhythm rule; the old single `landing.headline` key is removed and the i18n test asserts the memorial variant + rhythm across all six.

- **Landing redesign fold-in (2026-07-03, PR feat/landing-fold-in).** The "split" prototype variant became the real home page; the prototype directory, variant switcher, and losing variants (`current`/`stage`/`editorial`) were deleted (decision log lived in the prototype's NOTES.md — outcome captured here). The old two-column `HeroDemoPanel` (`hero-demo-panel/index.tsx`) and `hero-pitch-column.tsx` retired; `demo-card.tsx` + `scenes.ts` survive and are driven by `landing/use-demo-loop.ts`. The demo card sits in a traffic-light browser frame captioned "favpoll.com · demo" to signal demo-ness. Deferred from the fold-in: mobile hero treatment (demo hidden < md), app-wide footer mount (display/projector routes must opt out), about page with register sections, james.jpg portrait.

- **Hero demo card mechanics (implemented, PR feat/hero-demo-typewriter-disclosure; loop now in `landing/use-demo-loop.ts`).** The demo runs a 15-phase loop (`Phase` union in `scenes.ts`). Key mechanics:
  - **Typewriter disclosure:** `useTyped(text, active, reduced, targetMs)` types text character-by-character via `setInterval`. Returns full text immediately when `reduced=true` or `active=false`. Both About and the personal reveal use dual-render: an invisible reserve `<p>` (stable height) + absolutely-positioned typed `<p>`. The reserve always carries the full text; the typed copy animates. Tests must use `getAllByTestId("poll-reveal")` (not `getByTestId`) and assert on the first element (reserve).
  - **Lock card:** `AnimatePresence` renders the shared `RevealLockPill` (label via `revealLockLabel(scene first name)`, e.g. "Pledge to see Belinda's reveal") in all locked phases; it unmounts on entering `clearing`.
  - **Blurred decoy:** locked phases show a `blur-xs aria-hidden="true"` wrapper around both `PollReveal` and the results list. Real results are never rendered when locked.
  - **Bars climb from zero:** at `clearing`, `barWidths` resets to all-zeros; individual `setTimeout` calls then raise each bar to its real `widthPercent` over ~900 ms.
  - **Variant-based enable state:** Next and Pledge buttons use `variant="default"` (enabled) / `variant="secondary"` (disabled) with `pointer-events-none tabIndex={-1}`. No `disabled` attribute — do not assert `opacity-50`.
  - **No chip in search bar:** `PickerHeader` always receives `draftIds=[]`; `PickerItems` receives the real `draftIds` (empty or one item). The grid highlights the selection; the search bar shows no chip.
  - **CharityRow footer** is blurred (`blur-xs aria-hidden`) when locked; visible in unlocked phases.
  - Loop starts at `reveal` on first paint; under `prefers-reduced-motion` the loop never runs (static resolved state).
  - **Scene portraits:** `protagonists.photo_url`-shaped `photo_url` fields point at `public/demo/*.jpg` (founder-generated, 800px JPEG). All three protagonist scenes wired (marcus.jpg landed 2026-07-11); the cause scene is faceless by design.

- **Hero copy simplification (2026-07-11).** Three linked decisions from one session:
  - **Headline states the mechanic plainly: "Pick your favourite. Give what it's worth. See where it stands."** (`landing.headline`, 2026-08-06; rendered one sentence per line so the triad never wraps mid-beat). Supersedes "Pick your favourite. Pledge its worth. Reveal its standing." (2026-07-17 → 2026-08-06), which had been written to caption the hero demo — and the demo moved to the register pages in #519–#522. Two beats went stale with it: "Pledge its worth" is the formal product term where the hero wants an instruction, and **"Reveal its standing" was captioning a reveal animation that is no longer on the page**, so with the demo gone it drifts toward the *personal* reveal, which hero copy must never promise. The worth anchor — the amount framed as what the favourite is worth to the guest (Love pillar as pledge-value anchor) — is the part that survives, and it is why plainer alternatives that dropped it were rejected. Plain verbs also match the register cards, which all now say give/giving/gift. **Invariant for any replacement on HOME: the beats must never wrap** — each is short enough to hold one line down to 390px, which is what makes the poster; several two-beat candidates read well on desktop and broke mid-beat on a phone (measured 2026-08-06). This is home-specific, not hero-wide, and **cannot be made hero-wide by layout** (measured 2026-08-06). The h1 is now `max-w-3xl` in both modes — that buys /fundraisers a line back (4 → 3) and costs nothing — but the register two-beat headlines still wrap. Their first beats need 784 / 773 / 788px at 48px type, against a demo-layout pitch column of 821px at 1440, **795px at 1280 and 624px at 1024**; no cap fixes 624. Home's beats are 404–427px, half the width, which is why the poster works there. Holding the invariant on the register pages would be a COPY change — shorter first beats — not a layout one. Parked follow-up: carry the worth framing into the pledge step's amount copy — that's where it changes behaviour.
  - **The brand statement stays the SUBHEADER, not the headline** (tested and rejected 2026-08-06). Promoted to display size it breaks mid-clause — "for charitable / causes, in the name of those we / love." — widowing "love.", against the doc's own rule that it must never be "broken across lines differently"; at 18px it sits on one line at every desktop width, which is why it works where it is. It is also grammatically a coda (a verbless noun phrase — the shape the register closes use), and as the page's definitional line it would define favpoll by honouring someone, which is what retired the cycling honour-locked headlines on 2026-07-11.
  - **Hero CTA carries a short caption BESIDE the button**: `landing.cta.free` ("Free to create"), inside the flex row rather than beneath it. Measured 2026-08-06 — beneath, the extra line costs 16px and tips 1280×800 (which #524 worked to make fit exactly) over the fold; inside the row it sits within the button's own 44px and costs nothing at any viewport. Short form only: the 100% is already the stat row 335px below in the same band, and "Free to create · 100% goes to charity" is also the only variant that wraps at 390. The closing CTA keeps the full `landing.cta.caption`, where there is no stat row and the 100% does real work.
  - Previous: **"Pick, pledge, reveal."** (`landing.headline`). Supersedes "Turn what you love into what you give." (2026-07-07), retired for the "love" repetition against the brand-statement subheader. The headline names the mechanic; the demo enacts it; the beat chips (relabelled Choose→Pick to match) track it. The founder's reasoning: the personal reveal is optional and awkward to promise in copy, but poll results are always shown post-pledge, so the "Reveal" beat is honest in every case — the personal favourite stays a discovered gift (demo, reveal pill), never a headline promise. Do not re-promote the personal reveal into hero copy.
  - **Eyebrow is static: "For any occasion — or none at all"** (`landing.eyebrow`, new key; the six dead `landing.eyebrow.*` occasion keys and the `SCENE_EYEBROWS` array are removed). The cycling eyebrow's register-carrying job was made redundant by the kind nav tabs (2026-07-07) + the demo content itself. The line deliberately includes standalone/cause favpolls. The old "never show the headline without an eyebrow" rule stands — it's just static now.
  - **Demo scenes cut to one per visitor-facing kind** (memorial Belinda · celebration Poppy · fundraiser Marcus · cause YoungMinds), cycling in nav-tab order so a full loop shows every kind and the active tab sweeps left→right. The four cut celebration scenes (Ros, Alex & Jordan, Dave, James) were reachable only via the auto-cycle (tabs jump to the first scene of a kind) — recover from git history if ever needed. Story files that indexed the old array (`favpoll-hero`, `display-screen`, `poll-section` stories) were decoupled or rewired.

- **Cause favpolls carry category=null; deriveRegister is subject-first (2026-07-13, follow-up landed same day).** The interim "invisible plumbing" (cause auto-set `category='fundraiser'`) is gone: `deriveRegister(category, grouping, subject?)` returns `cause` whenever `subject='cause'`, so a cause needs no category at all. Changes ride through the whole path: wizard state (category gate waived for cause; `category` param omitted from the details redirect), details page (from-wizard gate is `category || subject==='cause'`; previously an empty category silently dropped the entire wizard handoff), edit page (passes subject), seed scripts' register→occasion tables (`cause` → `category: null`), and the my-favpolls summary card eyebrow (subject-first: cause rows show "For a cause", never a category badge — this also covers pre-remodel rows still carrying the legacy `'fundraiser'`, which are left in place; harmless because every reader is now subject-aware).

- **Landing polish wave two (2026-07-14/15, PRs #259–#261).** Watch-deck hover amplified to Create's energy (#259). The Custom Favpoll (#anyone) animation replays BOTH real dialogs in sequence — "Pick a topic" then TopicItemsDialog — with the h2 moved into the left column (#260). The #watch section became "the room" (#261, after two rejected passes — a full telethon-banner miniature and a flat tile strip): first-person scene, straight iPhone near / widescreen display far, pledge → goal-crossing beat; the SECTION carries the room chrome (tint, floor gradient, overflow crop). Also in #261: the final CTA moved onto the purple monogram band (Venn retired from the landing — /about only), the vestigial section eyebrows removed ("Open right now" stays), and the founder removed the header's "New favpoll" button (desktop + mobile) — creation entry points are the hero CTA, the closing band, and /favpolls. Landing figures agree everywhere: £855 rest, £900 goal, £925 reached.

- **How It Works redesigned around the rail grammar + real-component vignettes (2026-07-14, PR #258).** The #how section's numbered circles became the wizard triad rail's visual grammar (Create · Share · Watch — verbs; "It runs itself" renamed; icons PencilLine/QrCode/Eye, deliberately not the triad-bound Award/Gift/Heart), each step demonstrated by real product components in miniature — the house rule stays **no screenshots** (they rot silently and don't theme). Iterated ~8 founder rounds: dialogs-deck Create, iPhone-camera Share hover, live-surfaces Watch deck with the goal-as-milestone moment (£855→£925 over a £900 goal, success-green). Figures deliberately sum with the bars; everything reuses the Belinda · Colour · Marie Curie scene so the landing tells one story. Rode along: **the real wizard overlays retitled "Pick a charity" / "Pick a topic"** (were "Choose …") so the product follows the headline's verb and the landing previews it verbatim. Gotcha for future embedders: FavpollHero/HeroLayout is a scroll-driven organism (dates fade past 120px scroll; About slides under its sticky header) — recompose its primitives for static vignettes instead of mounting it.

- **Honour step forks on Who; a cause is a fundraiser (2026-07-13, superseded same day by the category=null remodel above).** Follows the triad territory reading (same date): step 1 is where honour's applicability gets decided, so the who row visually forks — five person chips, an "OR" divider, "A cause" alone below (founder's mock). Substantive fix riding along: selecting "A cause" auto-sets `category='fundraiser'` as invisible plumbing; the type row shows no selection (revised twice: from a hide-plus-assertion-line design that shifted layout and overclaimed "a cause is a fundraiser" in copy, then from a dim-and-disable design that broke the step's any-order grammar — final rule: all chips always live; clicking a type while on the cause path hops back to the person path) — previously the wizard let `subject='cause'` pair with memorial/celebration, which `deriveRegister` maps to protagonist-presuming registers (a faceless "remembering" favpoll was creatable). Leaving cause for a person resets category to null so the auto-set value is never inherited. Icons: cause `Ribbon`→`HeartHandshake` (ribbon read as cancer-awareness specifically), fundraiser `PiggyBank`→`Medal` (a money-storage icon on a 0%-fee platform; Medal depicts the sponsored effort — `Flag` was the interim pick, replaced for its report-content double-read).

- **Open Graph metadata (2026-08-29).** Until this there was none — a favpoll link pasted into WhatsApp or Slack previewed as a bare URL, on a product whose distribution IS a shared link. Root layout: `metadataBase` from `NEXT_PUBLIC_BASE_URL` (fallback `https://favpoll.com`), default title/description (the brand statement), `openGraph: OG_SITE` (siteName/locale/type ONLY — a layout-level og:title overrides every page's own; measured on /about), `twitter.card = summary_large_image`. Favpoll page: `generateMetadata` → `lib/og/favpoll-og.ts` `favpollMetadata()` — title `"<name> — favpoll"` (the share sheet's exact title), description `"<eyebrow> <name>. Pick your favourite <topic>, give what it's worth, and every pound goes to <charities>."` (closed: `"… This favpoll has closed. Every pound raised goes to …"`), private → generic title + `noindex,nofollow` + no name/photo anywhere, unlisted → `noindex` but full preview (by-link, not by-browsing). The description carries no amounts or standings: crawlers cache for days, and standings are the after-pledge reveal. The card photo is pre-fetched with a 4s deadline and inlined as a data URL (Satori's own fetch failing would 500 the card; a doubtful photo degrades to initials). Fonts: Plus Jakarta Sans 400/500 vendored under OFL in `apps/web/assets/fonts/` and read via `join(process.cwd(), "assets/fonts/…")` — the literal shape Next's file tracer bundles. The FavpollLogo mark's paths are exported (`FAVPOLL_MARK_PATHS`) so both cards draw the real mark. All preview copy lives in `messages/en-GB.json` under `og.*` (templates with `{name}`-style placeholders, filled by `lib/og/copy.ts` `ogCopy()`); the brand card reads `landing.headline` / `landing.subheader` directly.

- **The mobile charity footer carries the pledge goal (2026-08-29).** On a phone PageLayout's right column — CharityBanner, its goal bar, the share button — is not rendered at all (`hidden md:block`), so the fixed footer was the only charity surface and a guest on a phone never saw the goal. `MobileCharityFooter` (`components/favpoll-content/mobile-charity-footer.tsx`) now renders the carousel plus, when `goal_amount` is set, the goal caption **under the row's figure, inline with the "Charity no." line** (`£412` / `of the £900 goal` — founder's placement, via a new `amountCaption` slot on `CharityRow`, passed through the carousel) and a `GoalProgress` bar beneath the row. **With a goal the row's figure is the favpoll total, not the per-charity split** — a goal is a whole-favpoll number and "of the £500 goal" under a £300 split would read wrong; with one charity the two are the same number. Footer 61px → 73px with a goal. **The fundraiser hero scene carries `goal_amount: 1000`** (2026-08-30; `HeroScene.goal_amount` is Supabase-aligned, null on every other scene): Marcus at £810 is 81% and short on purpose, so his "If we reach the goal" reveal is a live condition and `/fundraisers`' "reach the goal" copy finally points at a number the page shows. `DemoCard` renders it exactly as the footer does (caption under the total + `GoalProgress`); `DisplayStill` uses the scene's goal with its `DEMO_GOAL` as the fallback for scenes without one. `GoalProgress` (`components/goal-progress.tsx`) is the one goal bar — green at/over the goal, capped at 100% — used by the banner and the footer (the display screen and OrganizerRow still carry their own copies; fold them in when next touched). **The footer publishes its rendered height as `--charity-footer-h` on `<html>`** (ResizeObserver, removed on unmount); the share FAB (`FavpollSubheader`, `bottom = var + 1.5rem`) and PageLayout's mobile bottom padding (`max(6rem, var + 1.5rem)`) derive from it. Before this both hardcoded the 61px footer: the goal's first cut made it 93px and the FAB sat 5px inside it, and a notched iPhone's safe-area inset would have done the same on its own. Measured at iPhone 13: FAB gap 24px in both states, padding 97px / 96px.

- **The register-palette colour system (2026-08-30, founder-led — the third time per-register colour was tried, and the one that landed).** The 08-03 and 08-05 attempts held purple as the brand and added register on top; they were rejected because the register lived only in pale surfaces and was invisible above the fold. This time the register colour IS the primary, the band changes, and the brand gets a new neutral: **blue default, purple memorials, magenta celebrations, green fundraisers; the logo recolours with the page; the accent system is retired; no gold.** Decided on a prototype of the real pages (PR #584, draft, do not merge): five ramps from one recipe under a `?variant=` switch, contrast measured — every palette clears WCAG on every measured pair except the two the original purple also fails (eyebrow `primary-muted` on white ≈ 3.7, `border-strong` on white ≈ 2.2). Gold was tried three ways (amber h74, ochre h82, old gold h90) and could only be a primary as bronze/olive, because one `--primary` is both a button fill and text on white; celebration moved to the warm family and magenta won over coral (one hue-step from `--destructive`) and rose. Ink was a strong functional neutral but "bland as a brand"; blue is "beautiful". Rollout: PR 1 (this) = tokens + derivation + accent retirement; still open — the OG palette mirrors and `lib/email.ts` hex (share cards are purple for every register until then), "goal reached" as words on green pages, the brand skill's colour table, and the retirement of the prototype branch.

## Outstanding TODO

- **Colour system, remaining rollout (2026-08-30)** — OG card palette per register (`lib/og/palette.ts` mirrors are still purple), `lib/email.ts` link colour, "goal reached" said in words on fundraiser pages (green on green), the print pack's colour, the wizard wearing the register as it is chosen, close PR #584 (prototype).
- **Webhooks not configured** — `CLERK_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET` are blank in Vercel. Configure endpoints at Clerk and Stripe dashboards.
- **Verify cron schedules fire** — both cron handlers are now GET (close-favpolls was POST until 2026-07-05, so its schedule never fired). After the next deploy, confirm a scheduled run of each in the Vercel dashboard (Cron Jobs tab), and expect the first real close-favpolls run to close any backlog of favpolls past `closes_at` in one batch (organiser emails go out per favpoll).
- **Clerk production keys** — using `pk_test_` on Vercel until `favpoll.com` points at the app. Swap to `pk_live_` when domain is switched.
- **Stripe Connect** — disbursement not wired. Cron has placeholder. Connect application pending approval.
- **Rate limiting** — DB-backed fixed-window limiter (`rate_limits` table + `check_rate_limit()` RPC, service-role only; `lib/rate-limit.ts`, **fail-open**). Applied: payment-intent (30/min + 200/hr per IP-or-user — card-testing surface, generous for a shared venue NAT), guest-item add (20/hr/user), extension-request (10/hr/user). Not applied to read routes (reveal/results) or webhooks/cron (secret-gated). Migration `20260705160000` — staging applied, production pending.
- **Transactions ledger, then shared-fund tips** — pot top-ups are counter increments on `favpoll_pots` (no per-transaction rows), so the SeedFundModal can't record a contribution yet. When disbursement accounting forces a proper transactions/contributions ledger (Stripe Connect or PPGF), add the optional contribution to the fund dialog using the same inline-breakdown grammar as the pledge step — the organiser seeding the fund is the most willing payer in the system.
- **Localisation next steps** — `next-intl`, string extraction, US market prep.
- **Printable event pack (v2, 2026-08-02; v1 2026-07-06)** — `/favpolls/[id]/pack` (non-private favpolls): an A4 poster + an A4 sheet of EIGHT wallet cards, rendered as distinct on-screen A4 sheets (bordered/shadowed; print strips the chrome, `break-after-page` splits exactly). Wallet cards are credit-card sized in real mm (85.6 × 54 — they slip into a wallet or an order of service, delivering the deferred insert), full white for printers, and follow the favpoll-card grammar: eyebrow + name header with the true FavpollLogo treatment top-right (60%-opacity accents), topic ribbon row, then the numbered mechanic steps with the QR beside them and the shared-fund escape hatch. Steps and footer come from `lib/mechanic-steps.ts` — the SINGLE source shared with the guest page's lock card, so print and page always match. Poster carries the same steps. `PrintButton` → Save-as-PDF; linked from `OrganizerCard`. QR codes across the app use `BrandedQR` (`qr-code-styling`: rounded modules + rounded finder eyes + centred heart, error-correction H). **Deferred**: per-register card variants.
- **Stationery & merch (future, physical)** — decided direction 2026-07-03: start with one hero SKU plus the print pack rather than a catalogue. Candidates ranked by brand fit: letter-of-wishes kit (productises the will-writing angle; solicitor channel), heart-mark biscuit cutter ("favourite biscuit" is core vocabulary), monogram wrapping paper/ribbon (tile is print-ready), "favourites" conversation card deck, coffee/cake stencils, die-cut stencil placemat (kids' activity variant ties to the shared fund). Distribution insight: "in lieu of flowers" cards double as funeral-director channel marketing.
- **/favpolls pagination (parked 2026-07-17)** — the page fetches 60 rows; once production listings exceed that, the "n of m" count silently lies. Agreed design when it bites: a "Load more" button (cursor-paged server fetch), NOT infinite scroll (fights the footer mounted on list pages; breaks back-button/scroll restoration). Caveat to solve then: client-side search only covers loaded rows — real scale wants server-side search. The record (curated, bounded) and my-favpolls (one organiser's rows) don't need pagination.
- **Presence dial (founder concept, 2026-08-01; first pass shipped 2026-08-02)** — favpoll's intensity at an event is a dial: **ambient** (memorial wake — QR table cards, screen in a corner at most), **moment** (celebration — a beat where the reveal is performed, then it recedes), **rally** (fundraiser — telethon-style, the room watches the total edge toward the goal). SHIPPED: the live display now has two variants (`DisplayVariant` in `components/display-screen/index.tsx`): **fundraiser** (goal figure + progress bar as the heading, compact identity + charity right) and **tribute** (person as the heading — full avatar, name, dates; money quiet in the charity rows; no goal theatre). Default derives from register (`remembering` → tribute) in `app/live/[slug]/page.tsx`; the presenter overrides live via the chrome ⋮ menu, persisted per favpoll in localStorage. The reveal was also removed from the live display except as the witnessed close finale (typed out when the poll closes while the room watches) — on a shared screen the reveal is a keepsake, not signage. REMAINING: party/quiz variant (rankings dominant, reveal-countdown intrigue; would default for celebrations), ambient rotation mode (wall/standings/QR cycling for a corner TV), organiser-triggered reveal choreography. Full notes in `references/outreach-notes.md`.
- **Register-specific landing pages** — `/memorials`, `/celebrations`, `/fundraisers` SHIPPED as v1 marketing pages (2026-08-03, PRs #485–#487) with the register accent system (purple = brand + neutral default; memorial = forget-me-not blue `--memorial`, celebration = gold `--warning`, fundraiser = green `--success`; near-triadic, lightness encodes register energy). **On-band variants (2026-08-05, #524): `--memorial-on-band` / `--warning-on-band` / `--success-on-band`.** The brand band INVERTS between themes (dark purple + white ink in light; near-white + purple ink in dark) but the base accents do not, so each one dies in one theme — measured on the hero's glass cards, memorial scored 1.04:1 in light and gold 1.31:1 in dark, and as eyebrow TEXT the accents were already failing before the glass (gold 2.14:1 on the old white card, blue 1.95:1 on dark). The on-band variants flip with the band and clear the 3:1 non-text floor in both (3.8–5.6). Use them for any accent mark sitting on the brand band; the base tokens stay correct on page surfaces. Related rule: the accent is a DOT beside full ink, never the ink itself — the register matrix's grammar, and the only version that passes contrast. **Per-register THEMING explored and rejected a second time (2026-08-05, founder-led — deliberate revisit of the 2026-08-03 rejection, not drift).** Two shapes were built on /memorials and looked at: (a) indigo + ice blue — purple's hue shifted 278 → 262 with the light end re-pitched to ~0.985/hue 250; (b) the founder's preferred framing, purple held EXACTLY and only the white end re-pitched (surfaces, borders, and the ink on purple, which also carries the logo and the monogram texture since both draw with currentColor). Both were contrast-clean (7.0–7.6:1 headline on band). Rejected on what they do, not what they break: with purple held, the register lives entirely in the LIGHT surfaces, so it reads clearly on content bands but is nearly invisible above the fold where the screen is mostly purple — the only difference from home up there is ink at 0.955 vs 0.99 lightness. Registers became something you feel as you scroll rather than something the page announces. **Conclusion: subtle accents on the standard branding, as on the home router cards — which is what already ships.** One trap recorded for anyone who tries again: a `.theme-*` class has no light-mode selector, so every token it sets leaks into dark unless the dark block restates ALL of them (the first attempt produced an ice page with ice ink). **v2 SHIPPED in part (2026-08-03/04, PRs #489–#506):** LandingHero parameterized (sceneKind filter + literal-copy props + bandClassName + hideStats/eyebrow; home = defaults); each register page mounts the REAL hero looping its own demo scene on its accent band. Home became the router: hero's demo slot = three accent-ruled register cards (reversible via the `router` prop on LandingHero — remove it to restore the demo hero). **Hero REBUILT 2026-08-05 (#518–#522, then #524):** the band fills the viewport below the nav (`min-h-[calc(100vh-3.5rem)]`, centred — min-h so short phones never clip; applies to every register hero). Home's router is now a ROW: statement on top, three cards across the bottom on the three-beat's own 2rem gutter, so they share its column edges exactly (the demo hero the register pages mount keeps the two-column shape, its card column `calc((100%-4rem)/3)` — the same 402.7px). Each card is GLASS, not white: a translucent wash of the band's own foreground with band ink throughout, which survives the theme flip automatically because the band inverts and a wash of its ink inverts with it. Each carries its OWN miniature poll (flower/cake/biscuit → Marie Curie/Barnardo's/Macmillan) rather than the register's demo scene — the scenes are authored stories whose topics serve their own reveal. The `+N more` line is deliberate: visible figures fall ~27% short of the total, and that gap is CORRECT (more items below, plus the shared fund, which takes pledges attaching to no favourite). Interior columns are a CONTAINER query (`@min-[21rem]`), not a breakpoint — plain `1fr` tracks have `min-width:auto` and burst the card by up to 69px at 768–950px and under browser zoom. A fourth "Causes" card was measured out earlier (1020px against an 844px viewport) and causes folded into the fundraiser card — **fundraiser and cause are ONE register at the marketing layer** (one audience, one intent; split only if a distinct channel emerges); note the label now reads just "Fundraisers", so the word "causes" appears nowhere on home. Also on home since 2026-08-05: `RegisterMatrix` (feature × register in phrases, never ticks — catalogued under components/landing/ above) and a register-neutral reassurance band (`home.assure.*`: free / 100% to charity / no favourite needed / no app); new `ProcessOverview` (components/landing/process-overview.tsx) = the Goodstack scroll section (pinned eyebrow+headline at top-28 with h-14 solid mask above + gradient fade below, scrolling step texts, third-column bare DemoCard stills at 0.8 crossfading via SCROLL MATH — IntersectionObserver percentage rootMargins silently failed in the founder's browser; active = last block top past 45% viewport). The #how band keeps ONLY the Create/Share/Watch organiser vignettes (the Pick/Pledge/Reveal strip duplicated ProcessOverview and was removed, #505/#506). ORIGINAL v2 direction (still open for the deeper sections): The home landing's copy is too abstract because it must span all registers; each register page should reproduce the REAL landing (hero demo loop, three-beat, AnyoneCanAnswer, WatchItHappen, carousel, close) with register copy, then add/subtract sections per register. Architecture: PARAMETERIZE, don't fork — sections take a register config (i18n namespace, accent token, scene set; home = default config). Demo-loop scenes per register are the biggest de-abstraction lever (scenes.ts is already data — memorial plays a Stanley-shaped story). The v1 pages' sections (wake/presence/reassurances/gatekeeper) become the bottom halves. Memorial subtracts the record band (competition reads wrong); fundraiser keeps it + telethon Watch; celebration keeps quiz-energy intrigue.
- **Page architecture principle (founder + assistant, 2026-08-04)** — three layers: (1) IN-PRODUCT surfaces (favpoll page, lock card, table cards) teach GUESTS — guests arrive via QR/links, never via marketing pages; (2) HOME serves the undecided organiser and the validator/gatekeeper — it demonstrates favpoll THROUGH THE GUEST'S EYES because the organiser's key belief is "my guests will get this", plus universal trust facts and the register router; (3) REGISTER PAGES serve decided-occasion organisers and their gatekeepers, in the register's voice. Deliberately not strict: register pages carry their own compact mechanic (forwarded links are first touches), and universal features may persuade best in a register's voice (the no-cash line lives on /memorials).
- **Register-aware topic suggestions** — memorial organisers should see memorial-suited topics first in the wizard's topic picker (field-requested via Joy's awkwardness concern, 2026-07-31).
- **Guest wall messages (founder, 2026-08-02)** — let guests attach a short message with their pledge, shown on the guest wall (and the keepsake). Strengthens the expanded-wall dialog: more content than names alone. Sensitivities to design for: moderation/organiser removal, memorial register tone, anonymity interplay.
- **Mobile app** — future.
