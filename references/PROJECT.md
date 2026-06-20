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
- **Database:** Supabase (Postgres + Realtime). Production and staging are separate projects.
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
  category text               -- 'celebration' | 'memorial' | 'fundraiser'. Nullable for legacy rows. register is derived via deriveRegister(category, grouping).
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
  cache_key text not null unique,           -- "{register}:{topic_id}:{primary_charity_id|'none'}:{subject}"
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

The Honour step (`event-flow/honour-step.tsx`) renders two independent Radix `ToggleGroup` (`type="single"`) rows. ToggleGroup items render with `role="radio"` and `aria-checked` (not `role="button"`/`aria-pressed`) — tests must query with `getByRole("radio", { name: "..." })`.

1. **"Who are you honouring?"** (subject row): An individual / A couple / A group / **A cause** — each item has a `User` icon. Selecting a person option sets `subject='someone'` + corresponding grouping. Selecting "A cause" sets `subject='cause'` (grouping is preserved but unused). A self-honour note appears below when "An individual" is active. When "A cause" is active, a labelled text input appears ("What are you raising for?", max 60 chars, min 16px font, placeholder "e.g. 40 years of Shelter"). The Next/Set-up button is gated until this field is non-empty. The label rides the redirect as a `causeLabel` query param and hydrates into `defaultValues.causeLabel` on the details page.
2. **"How are you honouring them?"** (category row): Celebration / Memorial / Fundraiser — each item has a `Balloon` icon; always visible. Active ToggleGroupItem style: solid fill (`bg-primary text-primary-foreground`).

`register` is derived deterministically from category + grouping via `deriveRegister(cat, grp)` and set in the form. `is_listed` is auto-set to `false` when `deriveRegister` returns `"remembering"`. `subject` is set separately via `form.setValue("subject", sub)`.

### Legacy: `registerForOccasionType(occasionType)` and `occasion_type`

Kept internally for the backfill and any legacy read paths. `occasion_type` column remains on `favpolls` and is nullable. New favpolls write `category` + `grouping`; `occasion_type` is left null. `effectiveRegister` and `DEFAULT_OCCASION_TYPE` exports are removed.

### Favpoll subject

`subject` ('someone' | 'cause') is stored on the `favpolls` table — independent of register.
A fundraiser can honour a person (`subject='someone'`) or a cause (`subject='cause'`).
When `subject='cause'`: no protagonist row is created; `cause_label` is stored instead.

### Display headline matrix (from `lib/display.ts` `getFavpollHeadline`)

`getFavpollHeadline` accepts an optional `subject?: 'someone' | 'cause'` param (defaults `'someone'`).
When `subject` is not provided by a caller, name param is the protagonist name as before.
When `subject='cause'`, callers pass `cause_label` as the `name` param.

| register         | subject='someone' | subject='cause' |
| ---------------- | ----------------- | --------------- |
| remembering      | In memory of      | In memory of    |
| celebrating_one  | Celebrating       | Celebrating     |
| celebrating_many | Celebrating       | Celebrating     |
| cause            | **Honouring**     | In support of   |
| neutral          | Honouring         | Honouring       |

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
/                              -- Home: HeroDemoPanel + live favpolls carousel (bg-primary/5) + CTA
/landing-v2                    -- Alternate landing page: animated Venn hero + six-step how-it-works + CTA
/favpolls                      -- Live favpolls grid (public, no auth)
/favpolls/new                  -- New favpoll wizard (3-step page: Honour → Charity → Love)
/favpolls/new/details          -- Create favpoll form (EventFormV2); reached from wizard with pre-populated query params
/favpolls/[id]                 -- Favpoll page — guest pledge view + edit mode toggle
/favpolls/[id]/edit            -- Edit favpoll (EventFormV2)
/favpolls/[id]/manage          -- Management panel (organiser only)
/favpolls/[id]/display         -- Live display for projector screen
/my-events                     -- Organiser's created favpolls (auth required)
/rankings                      -- Global all-time rankings
/topics/[id]                   -- Individual topic rankings
/pledges/withdraw              -- Guest pledge withdrawal via token
/sign-in, /sign-up             -- Clerk auth pages

API:
/api/cron/close-events         -- Vercel cron (hourly), closes expired favpolls
/api/stripe/payment-intent     -- Creates Stripe PaymentIntent for pledge checkout
/api/webhooks/clerk            -- Clerk user sync webhook
/api/favpolls/[id]/request-extension -- Sends extension request email to admin
/api/polls/[pollId]/results    -- Ranked pledge totals for a poll (admin client)
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
    ├── favpolls/[id]/request-extension/route.ts
    └── polls/[id]/results/route.ts

components/
├── ui/
│   ├── button.tsx, card.tsx, input.tsx, field.tsx
│   ├── chip.tsx                  -- Selectable pill toggle; min-w-0 shrink whitespace-normal to allow truncation
│   ├── toggle-group.tsx          -- shadcn ToggleGroup + ToggleGroupItem; type="single" renders items as role="radio"/aria-checked; used in HonourStep and CommandPanel
│   ├── toggle.tsx                -- shadcn Toggle primitive
│   ├── sheet.tsx                 -- shadcn Sheet (SlideOver drawer); used by pledge-panel on mobile
│   ├── responsive-overlay.tsx    -- Sheet (mobile <768px) / Dialog (desktop) dual primitive; useIsMobile() hook init false (no hydration flash); props: open, onOpenChange, title, description?, header?, footer?, children. When `header` is set, it renders above the body divider and `title` goes `sr-only`; use this pattern for search/text inputs at the top of overlays.
│   ├── occasion-tag.tsx
│   ├── section-eyebrow.tsx
│   ├── ranking-bar.tsx           -- labelSuffix prop for inline Hide/Show toggle
│   ├── reveal-quote.tsx
│   ├── tooltip.tsx
│   └── tooltip-icon-button.tsx   -- Ghost icon button with tooltip; used by event-card and poll-heading
├── new-event-button.tsx          -- Client button that navigates to /favpolls/new; redirects signed-out users to /sign-in; accepts onBeforeOpen callback (used by header to close menu)
├── new-event-wizard/             -- 3-step wizard (Honour → Charity → Love); refactored from monolith into a directory
│   ├── index.tsx                 -- Thin orchestrator (`NewEventWizard`); imports all sub-components and `useWizardState`; all session-storage and router logic lives in the hook
│   ├── use-wizard-state.ts       -- All wizard state, derived values, and handlers: step/category/grouping/subject/causeLabel/topics/charityIds/overlay-opens, `nextDisabled`, `handleNext/Back/Finish` (writes sessionStorage, calls `router.push`). Exports `DRAFT_ADDITIONS_KEY`, `STEPS`, `STEP_LABELS`, `WizardData` type
│   ├── wizard-triad-rail.tsx     -- Desktop left column: `bg-primary/10` tinted rail (`h-full`, `justify-around`), Award/Gift/Heart icons at `h-6 w-6`, `text-lg` labels, `opacity-60` for past/future; Props: `{ currentStep, copy }`
│   ├── wizard-progress-strip.tsx -- Mobile `<ol>` segmented progress strip: coloured fill + HONOUR/CHARITY/LOVE text, `aria-label "Step N of 3: <Label>"`; Props: `{ currentStep }`
│   ├── wizard-nav.tsx            -- Navigation row: Back (ghost) + Next/Set-up-my-event; Props: `{ isFirst, isLast, nextDisabled, onBack, onNext, onFinish }`
│   ├── wizard-charity-card.tsx   -- Receipt card for selected charities: logo/initial, name, charity no., Edit+Remove buttons, "+ Pick another" link (hidden at max 3); Props: `{ charities, onEdit, onRemove(id), onPickAnother }`
│   ├── wizard-topic-card.tsx     -- Topic card: topic label header, Edit+Remove buttons, chips (existing canonical + purple custom), "+ Add" / "+N more" overflow chip, "Add at least…" hint for custom topics with < 2 labels; Props: `{ topic, sortedExistingItems, customLabels, showItemsSection, onEdit, onRemove, onOpenItemsDialog }`
│   ├── wizard-step-shell.tsx     -- Step wrapper: centred `h2` title + guidance paragraph; consumed by each wizard step; Props: `{ title, guidance, children }`
│   ├── *.stories.tsx             -- Storybook stories for each sub-component (5 story files)
│   └── __tests__/use-wizard-state.test.ts -- Hook unit tests: `nextDisabled` gates, step navigation, `causeLabel` URL param, sessionStorage writes
├── event-form-v2/                -- Canonical create/edit form; preview panel full-width + floating command panel
│   ├── index.tsx                 -- EventFormV2 (outer, router + form) + FormInner; preview panel full-width; CommandPanel floated fixed. No Settings overlay. initialClosesAt prop (ISO string) carries existing closes_at for edit mode; closesAt is not a form field — captured locally in the publish overlay (create) or passed through from initialClosesAt (edit). isPrivate always false; potAmount always null. After createEvent: sets seedEventId state → renders SeedFundModal instead of redirecting immediately. Generation is opt-in: no auto-call on mount. handleRegenerate() fires safeGenerateDraft on demand (via the "Generate a suggestion →" prompt or the Regenerate button in the About overlay), pre-fills about for both modes and reveal for cause favpolls, sets personRevealExample for person favpolls (never commits); manual-edit confirmation before overwrite; shows error toast when result is null.
│   ├── seed-fund-modal.tsx       -- Post-publish shared fund seeding modal. Props: eventId, onComplete. States: amount (number), clientSecret, error, submitting. Preset buttons £10/£25/£50 set amount. "Seed fund" button (disabled when no amount) → POST /api/stripe/payment-intent with pot_top_up metadata → StripeCheckout. On success: topUpFund() then onComplete(). topUpFund failure swallowed. Cancel: returns to modal with error. "Skip for now" link calls onComplete() immediately. hideCloseButton on ResponsiveOverlay (no × button).
│   ├── command-panel.tsx         -- Floating command panel: fixed bottom-4 right-4 w-72 on desktop, full-width bottom bar on mobile. Create mode: missing list checks Name/Cause only; Publish opens `CloseDateOverlay` pre-filled via `suggestClosingDate(category)`. Edit mode: missing list checks Occasion/Charity/Topic; Save calls `onSubmit()` directly. Both modes: Listed/Unlisted Switch; no chips or overlay sheets in edit mode — fields are edited via the preview panel's editable sub-components.
│   ├── preview-panel.tsx         -- ~90-line coordinator; composes EditableHero + EditablePollArea + EditableCountdown + CharityBanner + PledgeCard. Shows OnboardingPanel when no occasion selected. Always visible on mobile (stacks below command bar; pb-52 clears command bar).
│   ├── edit-helpers.tsx          -- Shared helpers used by editable sub-components: `EDIT_BTN` className string (ghost Button base), `EditBadge` (pencil badge positioned at corner), `CharCounter` (remaining count with colour), `overlayFooter(onSave, onCancel)` (Save/Cancel footer for all overlays). Also exports `INPUT_GROUP_CLS` (h-auto rounded-none border-0 ring-0 shared across all field overlay InputGroups) and `FIELD_OVERLAY_PROPS` (hideCloseButton/headerClassName/dialogClassName spread onto all field `ResponsiveOverlay` instances).
│   ├── editable-hero.tsx         -- Hero editing: name/context/photo/opening-line/about overlays for person favpolls; cause-label overlay for cause favpolls. Uses `useFormContext<EventFormValues>()` internally. Each overlay: shadcn `Input`/`Textarea` in `header` prop with border-stripping className; Save/Cancel in `footer`. Photo overlay is a three-state inline crop dialog: no-file (Upload icon, "No file chosen") → cropping (inline `Cropper` with zoom slider, rounded-rect `cropShape="rect"`, "Crop" footer) → avatar preview ("Current photo" + Trash, "Save" footer). `dialogPhotoUrl` staging state decouples dialog visual state from committed form state so delete takes immediate effect without writing to form. `getCroppedBlob` function does canvas-based crop to JPEG Blob. "Generate a suggestion →" prompt (`text-sm text-muted-foreground`) shown below the About placeholder when about is empty, not generating, and the topic is canonical — clicking fires `onRegenerate`; prompt hides once about is filled or generation is in flight.
│   ├── editable-poll-area.tsx    -- Poll area editing: topic label, pre/post-reveal Switch toggle, reveal edit overlay (Textarea in `header`), PledgePanel (pre-reveal) or PollResults (post-reveal). Uses `useFormContext<EventFormValues>()` internally.
│   ├── editable-countdown.tsx    -- Countdown widget wrapper: when `closesAt` is set (edit mode), renders `<Countdown closesAt={...} />` in a clickable card that opens `CloseDateOverlay`; when absent (create mode), renders `<Countdown />` placeholder only (no edit affordance).
│   ├── occasion-overlay.tsx      -- All occasion types grouped under register-labelled section headers (no register chip prerequisite); free-text input always shown; Switch shown only for celebrating_one; Footer: Done + Clear; controlled-open
│   ├── onboarding-panel.tsx      -- Desktop: three-section panel (Honour/Love/Charity) with labelled form mockups; accepts onHowItWorks callback
│   ├── onboarding-interstitial.tsx -- Mobile-only: fixed inset-0 full-screen overlay for first-time organisers; same localStorage key as onboarding-panel
│   ├── schema.ts                 -- Zod schema + EventFormValues; subject/causeLabel fields + superRefine (name required iff subject='someone', causeLabel required iff subject='cause')
│   ├── constants.ts              -- PickerSize, INPUT_SIZE, TEXTAREA_SIZE, CHIP_IN_INPUT_* maps
│   ├── date-helpers.ts           -- Shared date utilities: `addDays(date, n)`, `ordinalSuffix(n)`, `CLOSE_DATE_PRESETS` (Tomorrow/3d/1w/2w/1m/6w/3m/6m label+days array); consumed by `CloseDateOverlay`
│   ├── close-date-overlay.tsx    -- Shared `CloseDateOverlay` component used by both `editable-countdown` and `command-panel`; props: `open, onOpenChange, title?, initialDate, saveLabel?, submitting?, onSave`; `prevOpenRef` pattern prevents re-init on every render when `initialDate` is a new object reference each render
│   ├── date-time-picker.tsx      -- Side-by-side date button (opens calendar) + time InputGroup; button width hardcoded to CALENDAR_WIDTH = 220
│   ├── topic-picker-field.tsx    -- ResponsiveOverlay (internal open state); search input + filter buttons + topic chips; Enter creates custom topic
│   ├── item-add-field.tsx        -- ResponsiveOverlay (internal open state); disabled state unchanged; NOT used in form pillar 2
│   ├── charity-field.tsx         -- ResponsiveOverlay (internal open state); search input + charity chip grid; max 3
│   ├── photo-crop-modal.tsx      -- react-easy-crop circular 1:1 crop → JPEG Blob (superseded — inline crop logic now lives in `editable-hero.tsx`; this file is unused)
│   └── __tests__/generate-draft-prefill.test.tsx  -- 9 tests: empty-on-mount, shimmer→fill after generate trigger, person vs cause pre-fill, skip for custom/edit mode, silent failure, subject derivation; subject passed as prop (not derived from register)
├── pledge-panel.tsx              -- Still used by editable-poll-area.tsx in the create/edit form preview (organiser only). No longer on the guest event page — picker is now step 1 of PledgeDialog.
├── pledge-card/
│   ├── index.tsx                 -- PledgeCard dispatcher → PreviewPledgeCard (prePublish, fully interactive except pledge) | LivePledgeCard; all inputs text-base (iOS zoom fix). LivePledgeCard is no longer rendered on the guest event page — superseded by PledgeDialog.
│   ├── use-pledge.ts, amount-input.tsx
│   ├── amount-presets.tsx, pledge-breakdown.tsx, utils.ts
│   └── __tests__/pledge-card.test.tsx, use-pledge.test.ts, utils.test.ts
├── pledge-dialog/                -- Unified 3-step pledge dialog replacing the separate PledgePanel + PledgeCard surfaces on the guest event page.
│   ├── index.tsx                 -- PledgeDialog: self-contained trigger button + ResponsiveOverlay; step 1 = pick favourites, step 2 = amount + breakdown, step 3 = inline Stripe payment.
│   ├── use-pledge-dialog.ts      -- Wraps usePledge (step 2/3 state) + own draft state (step 1). Auto-advances to step 3 when pledgeClientSecret is set. Back from step 3 clears it.
│   ├── step-pick-favourites.tsx  -- PickerHeader (chip+search field) + PickerItems (chip grid); extracted from pledge-panel.tsx.
│   ├── step-amount.tsx           -- AmountInput + AmountPresets + per-favourite breakdown (primary) + per-charity collapsible (secondary, 2+ charities only) + shared fund toggle + fee/total line.
│   ├── step-pay.tsx              -- Inline StripeCheckout (inline prop) for step 3.
│   ├── pledge-dialog.stories.tsx -- Stories: SignedIn, WithSharedFund, TwoCharities, Guest, InfinitePoll.
│   └── __tests__/use-pledge-dialog.test.ts  -- 17 tests: step nav, draft state, breakdowns, shared fund path, payment success.
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
│   ├── index.tsx             -- grid md:grid-cols-[1fr_300px]; branches on subject: cause → CauseHero, person → EventHero; PledgeDialog (self-contained) in right column (desktop) and below PollSection (mobile); charity carousel fixed bottom mobile
│   └── use-event-content.ts  -- pollView state tracks pledge/results view; showPledgeCard = !isClosed && !!pollWithItems && !pledgeConfirmed && pollView==="pledge"; no longer manages pledgeAmount/pollSelections (dialog-owned)
├── hero-demo-panel/
│   ├── index.tsx, scenes.ts, variants.ts
│   ├── hero-pitch-column.tsx, demo-card.tsx
├── cause-hero.tsx               -- view-only: cause favpoll hero; shows getFavpollHeadline prefix + cause_label as h1 + favpolls.description as body; no avatar, no protagonist fields
├── event-hero.tsx               -- view-only: event + protagonist props, hideAvatar?, aboutPlaceholder? (renders grey when about is blank); requires non-null protagonist
├── event-card.tsx
├── event-card/
│   ├── use-event-card-pledge.ts, event-card-results.tsx
│   └── event-card-charity-carousel.tsx  -- also used as fixed bottom mobile bar on event page
├── event-summary-card.tsx        -- Compact read-only card (no pledge UI): FavpollHeader + Countdown + SectionLabel + EventCardCharityCarousel. Used on landing carousel and /my-events grid.
├── live-events-carousel.tsx
├── favpoll-mark.tsx              -- Symbol-only mark (no wordmark); exports FavpollMarkGlyph (<g> of paths) + default FavpollMark SVG
├── honour-charity-love-venn.tsx  -- Animated Venn SVG (three rotating rings); uses FavpollMarkGlyph at centroid
├── landing-v2/
│   ├── example.ts               -- Belinda Hartley thread: EXAMPLE data + OCCASIONS list
│   ├── occasion-eyebrow.tsx     -- Client: cycles occasion names every 2.8s with framer-motion fade
│   ├── honour-charity-love-venn.tsx  -- See root-level; this is the landing-v2-scoped variant (baked SVG label paths)
│   ├── honour-charity-love-venn.stories.tsx
│   ├── how-it-works.tsx         -- Six-step timeline (Create/Share/Reveal phases) with mini preview cards
│   └── favpoll-mark.tsx         -- landing-v2-scoped FavpollMark with native design-source coordinates
├── charity-banner.tsx, countdown.tsx
├── header.tsx                   -- "use client"; hamburger menu on mobile (md:hidden); click-outside closes; uses NewEventButton (passes onBeforeOpen={close} in mobile menu)
├── poll-heading.tsx             -- view-only: topicTitle, reveal, protagonistFirstName?; onResetPledge/onViewResults render TooltipIconButton; no hint line
├── stripe-checkout.tsx, pot-banner.tsx

lib/
├── occasions.ts                  -- shortTopicLabel (DATE_LABEL_PLACEHOLDERS removed)
├── registers.ts                  -- Register type, deriveRegister(), suggestClosingDate(), getExampleName(), registerForOccasionType() (legacy), OCCASION_TYPES_BY_REGISTER (legacy)
├── display.ts                    -- charityNames, formatAmount, ordinal, formatRelativeDate, formatEventDate, getFavpollHeadline (accepts optional subject?: 'someone'|'cause' param; subject-aware prefix matrix — see Registers section for the full matrix)
├── wizard-copy.ts                -- `getWizardCopy(subject: FavpollSubject)` → `{ leftPrompt, rail: { honour, charity, love }, charityGuidance, loveGuidance }`; branches on subject ('someone' | 'cause'); used by NewEventWizard to drive all step copy
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
scripts/seed-favpolls.ts          -- scale-test seed: generates 40 favpolls across all occasions/topics. Run with ALLOW_EVENT_SEED=1 or against a staging URL.
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

All tests must pass before committing. Current counts: 755 web, 56 admin.
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
```

---

## Decisions locked in

- **One poll per favpoll.** `UNIQUE(favpoll_id)` on `favpoll_polls`. All types use singular `poll`. Do not build multi-poll support without explicit instruction.

- **`personal_framing` retired.** Column kept but never read/written. Auto-generated hint line replaces it.

- **Topic-aware about placeholders, keyed by effective register.** `protagonists.about`. EventFormV2 preview panel reads `topic.placeholders[effReg].about/reveal` for grey placeholder text when fields are blank. `deriveRegister(category, grouping)` in `lib/registers.ts` resolves the register from `category` + `grouping`. `lib/shape-prompts.ts` deleted (replaced by register-keyed topic placeholders). `topics.placeholders` stores exactly 5 keys: `remembering`, `celebrating_one`, `celebrating_many`, `cause`, `neutral`.

- **Static `topics.placeholders` About is charity-free.** The static placeholder `about` strings (stored in `topics.placeholders`) are shared across all charities, so per-(register × topic × charity) sets are not viable. Placeholder `about` teases the topic domain only — no charity references. Charity weaving belongs in the organiser's own words (their free-text `about`) and in per-favpoll exemplars only. Exemplars keep their charity weaving unchanged. **This applies only to the static placeholder hints.** Generated About (produced by `generateDraft`) is separately charity-aware — for cause favpolls the LLM prompt receives the charity name and description, and the generated copy gestures at the cause. See the generation decision for full details.

- **Localisation foundations.** `favpolls.market` default `'en-GB'`, `favourites.markets` default `['en-GB']`. `formatCurrency()` in `lib/i18n.ts`. `next-intl` deferred. See `references/LOCALISATION.md`.

- **Guest item moderation.** Guest items land immediately (pledge works without review). `review_status` on `favourites` governs canonical promotion only. Organisers hide/show via `favpoll_poll_favourites.is_hidden`. `acceptContribution` must set both `is_canonical = true` AND `review_status = 'accepted'`.

- **Results ranking sort order.** Primary: `all_time_pledged` desc. Secondary: `display_order asc nulls last` for finite topics, then `localeCompare` alphabetical for ties. `favourites.display_order` (nullable integer) set only for finite topics via admin `DisplayOrderEditor`; null = alphabetical sort.

- **`favpolls.category` + `favpolls.grouping` are the canonical occasion model.** `category` ∈ {celebration, memorial, fundraiser} (nullable for legacy rows). `grouping` ∈ {individual, couple, group} (default: individual). `register` is never stored — always derived via `deriveRegister(category, grouping)`. `occasion_type` and `is_plural` columns remain on the `favpolls` table for backward compatibility with legacy rows but are not written by new code.

- **Shared fund is mandatory.** Every favpoll gets a `favpoll_pots` row on creation, seeded at `total_deposited: 0` if the organiser doesn't specify an initial amount. Never gate pot creation on `potAmount > 0`. The "Add to the shared fund" top-up input in `LivePledgeCard` is always rendered. `topUpFund` creates the pot lazily for favpolls that predate this decision.

- **Item management — organiser additions from the wizard (canonical and custom).** Organisers add poll items post-publish on the event page (`addOrganizerItem` server action). In the wizard (step 2), both canonical and new/custom topics expose a **"View & add"** chip trigger that opens `TopicItemsDialog` (`event-flow/topic-items-dialog.tsx`) — a search-and-add sheet. Canonical topics: existing items are shown read-only; organisers can add their own on top. New/custom topics: no existing items; ≥2 items required before the wizard can proceed. The draft is carried via `sessionStorage` key `favpoll_draft_additions` (`{ topicRef: { kind: 'new', title } | { kind: 'existing', id }, addedItems: string[] }`), with `&draftAdditions=1` as the SSR-safe URL signal; `FormInner` hydrates from `sessionStorage` on mount via `useEffect`. Legacy key `favpoll_new_topic_draft` (`{ title, items }`) is still supported as a fallback for old links. Canonical topics with **no** additions skip `sessionStorage` entirely and pass `topicId` + `topicTitle` directly in the URL. At publish, `createEvent` inserts the `topics` row for custom topics (`created_by` = Clerk id, `is_active: true`, `is_finite: false`, `placeholders: {}`, no categories) and all `favourites` (`source: 'organiser'`, `is_canonical: false`, `review_status: 'pending_review'`). For canonical topics, organiser additions are inserted into `favourites` and linked as `favpoll_poll_favourites` via the `addedItems` field on `PollInput`. No orphan rows — nothing is written until publish. Guest-added items use `source: 'guest'`, `review_status: 'pending_review'`. The admin contributions queue (`apps/admin/app/contributions/`) filters on `'pending_review'`. In `TopicItemsDialog`, added-items chips use a plain `<div>` (not `<Chip>`) to avoid the button-in-button HTML violation — `Chip` renders as `<button>` and nesting the remove `<button>` inside it causes a React hydration error. Exit warning fires when `isCustom || customLabels.length > 0` with copy "You have unsaved changes. Leave without publishing?" **TODO (deferred):** cross-session `localStorage` recovery for an abandoned draft — currently, if the user closes the tab before publishing, the draft in `sessionStorage` is lost.

- **No hint line on PollHeading.** The protagonist hint ("— Is it the same as [Name]'s?") has been removed. The reveal is the only mechanic for disclosing the protagonist's favourite — shown after pledging. `getPollHint` and the `pledged` prop on `PollHeading` are gone.

- **New favpoll entry point is a wizard page.** Clicking any "New event" button navigates to `/favpolls/new` (signed-out users are redirected to `/sign-in`). `/favpolls/new` is a server-rendered page that fetches wizard data (charities, topics, categories, and `charity_topics` suggestions map) via `getWizardData()` in `app/favpolls/new/wizard-data.ts` and renders `NewEventWizard` — a client component with 3 steps (Honour → **Charity** → Love). **Charity-suggested topics:** admin curates a `charity_topics` join table; `getWizardData` fetches all rows in one query and builds `suggestedTopicIds: Record<charity_id, topic_id[]>`. On the Love step, `LoveStep` receives `suggestedTopics?: TopicWithMeta[]` and `primaryCharityName?: string` derived from the primary (first) charity. When suggestions exist and no search is active, a "Suggested for {charity}" section appears above the full topic chip list. If no suggestions → picker unchanged (additive only, no gate). Admin manages suggestions per charity via the "Suggested topics" expandable section in `CharityRow` (searchable, checkboxes, save → `setCharityTopics` replace-set). Command-panel picker **does not** show suggested topics (deferred). **Full-page two-column layout** (no contained card): `md:grid md:grid-cols-[280px_1fr]`, left column = persistent triad rail with tense-aware `leftPrompt` + step labels/subtext/icons/opacity tiers, separated from step content by spacing (no `border-r`). On mobile: left column hidden, existing step-dot `<ol>` is the only progress widget (no second widget). Subject-aware copy is driven by `getWizardCopy(subject)` from `lib/wizard-copy.ts`. The wizard's selected-charity and selected-topic states are displayed via `WizardCharityCard` / `WizardTopicCard` (card components with Edit+Remove affordances); when nothing is selected, a ghost "Pick a charity" / "Pick a topic" button opens the overlay. `WizardStepShell` wraps each step with a centred title and guidance paragraph. The topic picker (step 3) and charity picker (step 2) open as `ResponsiveOverlay` sheets; search input lives in the overlay `header` prop (title goes `sr-only`) so it is always visible above the body divider. `CharityStep` accepts a controlled `search?: string` prop and renders no search input of its own. `LoveStep` accepts `search?`/`onSearchChange?` props — when provided, its own search input is hidden and the wizard drives the value. Both overlays reset search on close. Step 3 shows a compact item summary below the selected topic chip — rendered as readonly `Chip` components (existing canonical options in muted style; organiser additions in brand purple; overflow as "+N more") — with a "View & add" button that opens `TopicItemsDialog`; canonical topics without additions redirect via `topicId` + `topicTitle`; topics with any additions (or new custom topics) redirect via `draftAdditions=1` + sessionStorage (see item management decision). The `event-flow/` step components (`HonourStep`, `LoveStep`, `CharityStep`) are used by both `NewEventWizard` and `CommandPanel`. The triad order — Honour → Charity → Love — is reflected app-wide: wizard, missing-field list in CommandPanel, and Venn component names.

- **Onboarding for first-time organisers.** On desktop, `PreviewPanel` shows `OnboardingPanel` when no occasion is selected. On mobile, `EventFormV2` renders `OnboardingInterstitial` (fixed inset-0 overlay). Both use `localStorage.favpoll_show_onboarding` (`'0'` = dismissed, `'1'` = re-show). "How favpoll works →" link sets `'1'` to re-open.

- **Toast notifications via sonner.** `<Toaster position="bottom-center" />` is wired in `app/layout.tsx`. Use `toast.warning()` with explicit `style: { background, color, border }` props — do not rely on `classNames.warning` or CSS variables on `<Toaster>` as sonner's inline styles override them.

- **Command panel + publish flow.** The floating `CommandPanel` (`fixed bottom-4 right-4 w-72` desktop; full-width bottom bar mobile). In **create mode**: the wizard pre-sets Occasion/Charity/Topic; those are shown as read-only text in the panel. Clicking Publish opens a `ResponsiveOverlay` with a `DateTimePicker` pre-filled via `suggestClosingDate(category)` (30 days for memorial, 14 days otherwise). The overlay footer has a "Publish" button (calls `createEvent`) and a "Back" link that dismisses. `is_listed` is set via the Listed/Unlisted switch before publishing. `is_private` is always `false`; `potAmount` is always `null`. In **edit mode**: chips are clickable (open Honour/Charity/Love overlays); Save calls `updateEvent` immediately; `closesAt` is passed through unchanged from `initialClosesAt` prop. Settings overlay and sharedFund input are removed entirely. `form-panel.tsx` is deleted.
- **Post-publish shared fund seeding (`SeedFundModal`).** After `createEvent` succeeds in create mode, `EventFormV2` renders `SeedFundModal` (instead of immediately redirecting) — `seedEventId` state holds the new event ID. The modal (`event-form-v2/seed-fund-modal.tsx`) shows headline "Give guests a head start", body copy, three preset buttons (£10/£25/£50), a number `<input aria-label="Amount in pounds">`, and a "Skip for now" plain text link (no × close button — `hideCloseButton` on `ResponsiveOverlay`). "Seed fund" button (disabled until amount > 0) calls `POST /api/stripe/payment-intent` with `metadata: { type: 'pot_top_up', event_id }`, then shows `StripeCheckout`. On payment success: calls `topUpFund(eventId, amount)` then redirects to `/favpolls/[id]`. `topUpFund` failures are swallowed — redirect always fires. On payment cancel: returns to the modal with "Payment was cancelled." inline error; "Skip for now" still available. Edit mode is unchanged (modal never shown on save).

- **Listed/Unlisted model.** `favpolls.is_listed` (boolean, default `true`). Listed → appears on the `/favpolls` live favpolls page. Unlisted → reachable by URL only, not shown on `/favpolls`. **All favpolls feed the record regardless of `is_listed`** — rankings query `favourites.all_time_pledged` directly, not through `favpolls`. `remembering` register defaults to `is_listed = false`; organisers can override with the switch before publishing. The `/favpolls` query filters `.eq("is_listed", true)` in addition to `.eq("is_private", false)`. `is_private` (access control) and `is_listed` (discoverability) are orthogonal.

- **opening_line is organiser-editable.** Shown as placeholder text in the form (from `PREFIXES[occasion]`) — not pre-filled. Organiser may type their own. Stored in DB. Preview falls back to `PREFIXES[occasion]` when field is empty. Never derive it purely from occasion at render time.

- **Field character limits.** name: 40, context: 40, opening_line: 50, about: 300, personal_reveal: 280. Enforced via Zod max(), HTML maxLength, and CSS overflow (line-clamp-2 on name heading, truncate on context and opening line). Limits chosen to prevent layout breakage in the favpoll preview.

- **Admin app auth.** All routes protected by Clerk. Non-admin authenticated users → `/access-denied`. `createAdminClient()` uses service role key, bypasses RLS.

- **Seed command.** `pnpm seed` from root runs `scripts/seed.ts` via `apps/web` filter. To seed staging: `cd apps/web && NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm tsx ../../scripts/seed.ts`. Topic placeholders are stored **register-keyed** (5 keys per topic); no occasion→register routing at write time. The six `scripts/placeholders-regenerated*.ts` batch files are the source of truth — `scripts/apply-placeholders.ts` (run with `tsx`) merges them into the inline `topics` array when batch files change. `seed.ts` imports all six batches at startup (duplicate title → throw). **`applyAllPlaceholders()`** runs after all topic rows exist: iterates every entry in `combinedPlaceholders`, fetches topic rows by title, writes `placeholders` to each — covering all ~118 topics regardless of which seed path created the row. Throws listing any map title with no DB row. **`assertAllTopicsHavePlaceholders()`** then validates every active topic in the map has all 5 register keys non-empty (`about`/`reveal` only — no `pronouns` check; none of the six placeholder batch files populate it) in the DB, providing a bidirectional fail-loud guard. `celebrating_many` placeholder entries carry `group: "pair"` (default) or `group: "set"` (sport cluster, defined in `scripts/celebrating-many-groups.ts`); group tagging is applied inside `combinedPlaceholders` at seed startup.

- **Preview example name.** When the organiser hasn't typed a name, the preview renders a greyed persona-matched example name (e.g. "Elizabeth" for she-persona, "Joan & Arthur" for a pair) selected stably by djb2 hash of the topic title via `getExampleName(topicTitle, pronouns, grouping: FavpollGrouping, register)` in `lib/registers.ts`. `grouping === "couple"` → pair pool, `grouping === "group"` → set pool. Name substitution into persona `about`/`reveal` prose is explicitly NOT a feature. `contextExamples` in `registers.ts` is register-keyed (`Record<Register, string>`) and used as the greyed context-line placeholder.

- **Chip vs pickerfield threshold.** Under 12 canonical items → render as chips. 12 or over → render as pickerfield (searchable combobox). Threshold stored as named constant `PICKERFIELD_THRESHOLD = 12`. Applies to guest pledge view (infinite topics) and organiser form item preview. Organiser form item _addition_ always uses ItemAddField pickerfield regardless of count.

- **Pledge panel draft state.** Selections are not committed until the user clicks Done. Opening the Sheet/Dialog initialises `draftIds` from the current `selectedIds`. Closing/dismissing without Done discards the draft. This prevents partial selections appearing in the trigger display.

- **Pledge card visibility.** `showPledgeCard` in `useEventContent` is `!isClosed && !!pollWithItems && !pledgeConfirmed && pollView === "pledge"`. `pollView` is initialised from `hasPledged || isClosed` and updated via `onViewChange` callback from `PollSection`. No `!hasPledged` check — Reset Pledge correctly re-shows the dialog trigger for previously-pledged users who switch back to pledge view.
- **Unified pledge dialog.** The guest pledge flow is one self-contained 3-step `ResponsiveOverlay` (`pledge-dialog/`): step 1 = pick favourites (chip picker), step 2 = amount + breakdown + funding path selector, step 3 = inline Stripe payment. A single "Pledge favourites" button replaces the old separate `PledgePanel` trigger and `PledgeCard`. `PledgePanel` is kept for the organiser form preview; `PledgeCard`/`LivePledgeCard` are kept but no longer rendered on the guest event page. `StripeCheckout` gained an `inline` prop (no fixed overlay) for embedding in step 3.

- **Pledge dialog funding paths.** Step 2 shows a "Pay with card / Use shared fund" tab selector at the top of the body when `hasFund` is true (pot exists, available > 0, user signed in). Path A = card payment, advances to step 3 (Stripe). Path C = shared fund, calls `pledgeFromFund` directly with no Stripe step. Guest email capture is deferred to step 3 (Stripe form) via `showEmailCapture` prop on `StripeCheckout`; step 2 no longer shows an email field. `handlePledgePaymentSuccess` accepts optional `email?: string` (from Stripe form) and passes it to `createGuestPledge`. A listed-favpoll notice is shown in step 2 right column when `useSharedFund && isListed`.

- **Guest shared fund contribution (Path B).** `EventContent` right column shows a "Help others take part" card when `!isClosed && pot.total_deposited > 0`. Clicking "Add to the shared fund" opens `SeedFundModal` with `variant="guest"`. `SeedFundModal` gains `variant?: "organiser"|"guest"`, `isListed?: boolean`, and `onCancel?: () => void` props. The guest variant uses different copy, shows "No thanks" cancel instead of "Skip for now", and calls `topUpFundAsGuest` (no-auth server action). `topUpFundAsGuest` in `app/favpolls/[id]/actions.ts` requires no auth and updates an existing pot's `total_deposited` only — it never creates a new pot row (pot is always present per the mandatory-fund decision).

- **Mobile breakpoint is `md` (768px) throughout.** All responsive grid/layout changes use `md:` prefix. Do not introduce new `lg:` breakpoints for layout (only for spacing/typography if needed).

- **iOS input zoom prevention.** `globals.css` applies `font-size: max(16px, 1em)` to all `input, textarea, select` globally. Inputs below 16px font size trigger iOS auto-zoom. Do not set `text-sm` or smaller on any focusable input element.

- **Charity-aware About/Reveal generation (`generateDraft`).** `apps/web/lib/actions/generate-draft.ts` is a server action that returns `{ about, reveal, fromCache }` copy pre-filled into the Set-up form's About and Reveal fields. Cache key = `"{register}:{topic_id}:{primary_charity_id|'none'}:{subject}"` (unique, stored on `generated_drafts`). Cache read always precedes any LLM call. Person favpolls (`subject: 'someone'`) use `'none'` for the charity segment — About is charity-agnostic so one entry covers all charities, but the LLM prompt is told the favpoll raises funds for charity (without naming it) so the About gestures at giving. Cause favpolls (`subject: 'cause'`) key on the primary (first-listed) charity — Reveal is grounded in `charity.description`. Charity is fetched for both subjects when `primaryCharityId` is present. **About never names a specific charity** in either mode. Person Reveal MUST name a real `topic_item` label (validated via `revealNamesRealItem()`; retried once on failure — runtime equivalent of `scripts/lint-topics.mjs`). Cause Reveal must not contain invented statistics (`hasFabricatedStats()` guard; retried once on failure). Model id is read from `LLM_MODEL_ID` env (default `claude-haiku-4-5-20251001`); key from `ANTHROPIC_API_KEY`; call is server-side only. Rate-limited 5 calls / 5-minute window per organiser (in-memory; TODO: graduate to middleware-level rate limiting). **Counter increments only on a successful LLM generation** — cache hits and failed calls (auth error, API key missing, timeout, bad JSON) cost nothing against the limit. **Generation is opt-in, not automatic.** Fields load empty with static `topics.placeholders[register]` hint text. A quiet "Generate a suggestion →" prompt (`text-sm text-muted-foreground`) appears below the About placeholder in the preview panel when about is empty and the topic is canonical; clicking fires `handleRegenerate` in `FormInner`. The Regenerate button (RefreshCw icon) inside the About overlay handles subsequent generations. **Generation is non-blocking and non-fatal via `safeGenerateDraft`**: all callers invoke `safeGenerateDraft` (not raw `generateDraft`) — the wrapper catches any server-side throw (auth error, rate limit, LLM failure, missing API key), logs `"generateDraft failed, using fallback: <reason>"` to the server console, and returns `null`. Since `safeGenerateDraft` never throws, Next.js never returns a 500 for generation failures. On failure (null result) the form stays with empty fields; on explicit regeneration failure a toast informs the organiser they can write their own copy. `generateDraft` remains exported for direct use in tests that need to exercise the raw error paths. Static `topics.placeholders` are **not** replaced — they remain as instant fallback hints in the UI. **Person Reveal is rendered as a greyed example only** — never auto-committed — because a real person's favourite cannot be known; Cause Reveal and both Abouts pre-fill the editable fields on generate. The dirty-flag / confirm-before-overwrite guard applies when regenerating over existing text. Admin curation surface for `generated_drafts` is live at `/generated-drafts` in the admin app (PR C).

- **`favpolls.description` — cause About storage.** For cause favpolls (`subject='cause'`), the generated or edited About text is stored in `favpolls.description` (existing nullable column; no migration needed). `onSubmit` passes `description: isCause ? values.about?.trim() || null : null` for both create and edit modes. The edit page pre-fills `about` from `event.description` for cause favpolls. Person favpolls do not use `favpolls.description`. **`CauseHero` reads `event.description` for the body** — write location and read location are both `favpolls.description`.
- **Cause favpoll page rendering.** The published favpoll page (`/favpolls/[id]`) renders `CauseHero` (not `EventHero`) when `event.subject === 'cause'`. `FavpollWithDetails.protagonists` is typed `Protagonist | null` — null for cause favpolls, non-null for person favpolls. `EventHero` is passed `event.protagonists!` (always safe because the branch only reaches `EventHero` when `subject` is `'someone'`). Cause Reveal is stored as `favpoll_polls.personal_reveal` (the same column as person reveal) and surfaces post-pledge via `PollSection` → `PollHeading` → `PollReveal` — no separate column or path needed.

- **`scripts/seed-favpolls.ts` behaviour.** Owns all rows via `created_by = 'user_seed_scale'` (organisers `user_seed_001`–`008` for guest pledges). Tops up to `TARGET_FAVPOLLS = 40` idempotently; never deletes. Inserting `pledge_allocations` fires the record trigger, so each run **shifts staging's `all_time_pledged` / `all_time_count`** — relevant when building the `/rankings` data threshold logic, which will be tested against synthetic numbers. `event_count` / `total_pledge_count` are intentionally left at 0 (no trigger; reserved for future inclusion-promotion). Cleanup: `delete from favpolls where created_by = 'user_seed_scale';` (cascades to polls, items, pledges, allocations, pots). The `favpolls` insert must never set a `register` field — that column was dropped by `20260607140000_derive_register.sql`; `register` is local-variable-only inside this script (used for `closingDays`/`aboutFor`/the result summary), never written to the DB. `loadReferenceData()` paginates the `favourites` fetch via `.range()` in 1000-row pages — PostgREST caps an unranged `.select()` at 1000 rows, and `favourites` now holds ~3300 rows after the full topic-library seed, so a plain select would silently starve `itemsByTopic` for most topics and `createOneFavpoll()` would skip them with no logged error (its `allItems.length === 0` early-return is silent by design, unlike its sibling error sites).

- **Dialog header input pattern.** When an overlay needs a primary text input (search, name, long-form field), place it in the `header` prop of `ResponsiveOverlay`; the `title` goes `sr-only`. The body holds secondary content (description, char counter, regenerate button). Use shadcn `Input` for single-line with `className="h-auto rounded-none border-0 px-0 py-0 text-base shadow-none focus-visible:ring-0"` and shadcn `Textarea` for multi-line with `className="min-h-0 rounded-none border-0 px-0 py-0 text-base shadow-none focus-visible:ring-0"`. Never switch to raw `<input>`/`<textarea>` when using this pattern — the shadcn components are required so that global theming and accessibility plumbing are preserved. The pledge-dialog step-1 picker header (`pledge-dialog/step-pick-favourites.tsx`) and pledge-panel are canonical examples of this pattern.

- **`Countdown.closesAt` is optional.** When `closesAt` is absent, `Countdown` renders a `--` placeholder in the same variant layout with `text-muted-foreground`. The `useEffect` guard skips the timer when `closesAt` is undefined. Use `<Countdown />` (no prop) for the create-mode preview (date not yet set); use `<Countdown closesAt={iso} />` for the live widget.

- **`preview-panel` is a coordinator.** The create/edit form preview panel (`event-form-v2/preview-panel.tsx`) is a ~90-line orchestrator that composes four focused sub-components: `EditableHero` (hero text + photo editing), `EditablePollArea` (poll topic, reveal toggle, reveal editing), `EditableCountdown` (countdown placeholder / live countdown wrapper), and the shared `CharityBanner`/`PledgeCard`. Sub-components read form state via `useFormContext<EventFormValues>()` — no prop-drilling of form values. Only truly external deps (topics array, isGenerating, callbacks) are props. Each sub-component is independently testable and storybookable.

---

- **Ubiquitous-language rename: `events` → `favpolls`.** favpoll is both the brand name and the top-level entity, so the `events` table, `topic_items` table, and every dependent column/trigger/RLS policy/route/type were renamed to match (`events`→`favpolls`, `topic_items`→`favourites`, `event_polls`→`favpoll_polls`, `event_poll_items`→`favpoll_poll_favourites`, `event_charities`→`favpoll_charities`, `event_pots`→`favpoll_pots`, `event_invites`→`favpoll_invites`, `event_category`/`event_grouping`/`event_subject`→`category`/`grouping`/`subject`). Pure rename — no behaviour change. All data was junk pre-rename, so the migration truncates everything and the live project was reseeded via `pnpm seed`. File/component names that predate the rename (`event-form-v2/`, `event-card.tsx`, `event-hero.tsx`, `cause-hero.tsx`, the `/my-events` route, the `close-events` cron folder name) were deliberately left as-is — they're file/job names, not the renamed domain concept. See `references/GLOSSARY.md` for the full updated vocabulary, including the new intentional divergence (`favpolls` table → "favpoll" in UI, replacing the old `topic`→"favpoll" divergence).

## Outstanding TODO

- **Webhooks not configured** — `CLERK_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET` are blank in Vercel. Configure endpoints at Clerk and Stripe dashboards.
- **Clerk production keys** — using `pk_test_` on Vercel until `favpoll.com` points at the app. Swap to `pk_live_` when domain is switched.
- **Stripe Connect** — disbursement not wired. Cron has placeholder. Connect application pending approval.
- **All-time rankings** — `/rankings` exists but needs data threshold logic.
- **Favpoll oversight admin page** — `/favpolls` in admin app is a shell only.
- **Email templates** — currently plain text via Resend.
- **Rate limiting** on API routes.
- **Localisation next steps** — `next-intl`, string extraction, US market prep.
- **Mobile app** — future.
