# favpoll — Ubiquitous Language Glossary

This glossary is the canonical definition of every domain concept in favpoll.
All code, database schemas, UI copy, documentation, and conversation should use
these terms consistently. When in doubt, consult this document.

---

## Core principle

A term should mean the same thing everywhere it appears — in a variable name,
a database column, a UI label, a code comment, and a conversation between
developers. Where the UI uses a different word for legitimate brand reasons
(e.g. "favpoll" for a topic), this is documented explicitly below.

---

## Terms

### Protagonist
**What it is:** The individual, couple, or group being honoured in an event.
May be a single person (memorial, birthday), a couple (wedding, anniversary),
a group (sports achievement, work milestone), or a baby (christening). Has a
name (free text — can be "Sarah & Tom" or "The 2024 Sales Team").

**Code:** `protagonists` table; `protagonist_id` on events
**UI:** shown by name only — never labelled "protagonist" or "person"
**Not:** person, subject, honouree, deceased, user

---

### Event
**What it is:** The top-level entity in favpoll. An occasion created by an
organiser to honour a protagonist — a memorial, birthday, retirement, wedding,
etc. Contains polls, charities, and a shared fund. Has a closing date and a
hard close date.

**Code:** `events` table
**UI:** "event" in organiser-facing contexts; not labelled directly in guest view
**Not:** life event, occasion, poll, collection, page

---

### Topic
**What it is:** A canonical question category — "Colour", "Season",
"Comfort food", etc. Exists independently of any event. Has a title (no
"Favourite" prefix), a list of items, and a finite/infinite flag. Topics are
curated by favpoll; they are not created per-event.

**Code:** `topics` table
**UI:** "favpoll" in the topic picker (brand term for the concept in organiser
flow). In the event page the topic title is shown directly: "Favourite colour".
**Not:** poll, question, category, template

---

### Event poll
**What it is:** A topic activated within a specific event. Carries a personal
framing, a reveal, and a curated list of items. The join between an event and
a topic.

**Code:** `event_polls` table
**UI:** not labelled — shown by topic title and personal framing
**Not:** poll instance, question, event topic

---

### Topic item
**What it is:** A single answer option within a topic — "Purple", "Autumn",
"Beans on toast". Items belong to a topic, not to an event. An event poll
references items via `event_poll_items`. Items carry data that contributes
to the record.

**Code:** `topic_items` table
**UI:** shown as a selectable pill in the guest pledge flow
**Not:** option, choice, answer, candidate

---

### Event poll item
**What it is:** The association between an event poll and a topic item. Records
whether the item was guest-added and who added it. Used to curate which items
appear in a given event poll.

**Code:** `event_poll_items` table
**UI:** not surfaced directly
**Not:** pinned item, event item

---

### Pledge
**What it is:** A guest's financial commitment against one or more topic items
in an event poll. Has a total amount, a fee, and one or more pledge
allocations. May be made by a signed-in user or a guest (email only).

**Code:** `pledges` table
**UI:** "pledge" — never "donation", "vote", or "contribution"
**Not:** donation, payment, vote, contribution, bet

---

### Pledge allocation
**What it is:** How a pledge is split across topic items. A pledge of £10 split
60/40 across two items creates two pledge allocations of £6 and £4. The sum
of allocations equals the pledge total amount.

**Code:** `pledge_allocations` table
**UI:** not shown directly — guests see the result as ranking bar proportions
**Not:** split, vote weight, item allocation

---

### Personal framing
**What it is:** The organiser-written question shown above the poll items,
before the guest pledges. Withholds the protagonist's favourite to set up the
reveal. E.g. "Belinda had a colour she returned to all her life — what's yours?"

**Code:** `event_polls.personal_framing`
**UI:** shown as body text above the item list. Label in edit mode: "Question"
**Not:** description, subtitle, prompt, question text

---

### Reveal
**What it is:** The organiser-written disclosure shown to each guest after they
pledge. Contains the protagonist's answer. May be first person (will-directed
events) or third person (organiser-written). E.g. "Mine was purple. I wore it
to every occasion that mattered."

**Code:** `event_polls.personal_reveal`
**UI:** shown in a purple-tinted card post-pledge. Label in edit mode:
"The reveal (shown after pledging)"
**Not:** quote, secret, answer, personal_quote (old column name — renamed)

⚠️ **Migration note:** This column was previously named `personal_quote` in
the database. It was renamed `personal_reveal` to match ubiquitous language.
Any references to `personal_quote` in code are outdated and must be updated.

---

### Shared fund
**What it is:** A communal pot of money deposited by the event organiser (or
generous guests) so that others — children, guests without means — can
participate without paying from their own pocket. Separate from direct pledges.

**Code:** `event_pots` table
**UI:** "shared fund" — shown as a secondary panel on the event page
**Not:** pot, pool, communal fund, donation pool, organiser fund

---

### Pot allocation
**What it is:** An allocation of shared fund money to a specific guest, enabling
them to pledge using that allocation. Created when a guest chooses to use the
shared fund.

**Code:** `pot_allocations` table
**UI:** not shown directly — privacy is preserved
**Not:** grant, gift, fund draw, allocation

---

### Live display
**What it is:** A full-screen view of an event's real-time rankings, designed
to be shown on a projector or large screen at a physical gathering. No pledge
panel — guests use their phones while watching the display.

**Code:** `/events/[id]/display` route — `src/app/events/[id]/display/page.tsx`
**UI:** "Live display" in the organiser's manage panel
**Not:** projector view, screen mode, display mode, kiosk

---

### Finite topic
**What it is:** A topic with a fixed, canonical list of items that cannot be
added to by organisers or guests. Examples: Colour, Season, Day of the week.
Preserves the integrity of the record.

**Code:** `topics.is_finite = true`
**UI:** not labelled in guest view; shown as "Finite" in the topic picker filter
**Not:** closed poll, locked topic, fixed topic

---

### Infinite topic
**What it is:** A topic with an open list of items. Organisers can pin and
reorder items; guests can suggest new items. Examples: Film, Song, Comfort food.

**Code:** `topics.is_finite = false`
**UI:** not labelled in guest view; shown as "Infinite" in the topic picker filter
**Not:** open poll, custom topic, flexible topic

---

### Inclusion
**What it is:** The process by which a non-canonical topic item is included in
the master list after appearing in a sufficient number of independent events
(current threshold: 3). Inclusion means the item permanently joins the
canonical list and contributes to the record.

Analogous to a company being included in the S&P 500 — a threshold is crossed,
status is conferred, and the inclusion is permanent.

**Code:** `include_topic_items()` Postgres function;
`topic_items.is_canonical`, `topic_items.event_count`
**UI:** not shown to users
**Not:** graduation, promotion, approval, elevation, graduation

⚠️ **Migration note:** The function was previously named `graduate_topic_items()`
and the column `is_master`. Both have been renamed to match ubiquitous language.

---

### Hard close
**What it is:** The immutable maximum closing date for an event — set to 90
days after creation and never changeable. When this date is reached the event
closes automatically regardless of the organiser's chosen closing date.

**Code:** `events.hard_close_at`
**UI:** not shown directly; referenced in the extension limit warning
**Not:** deadline, expiry, maximum date, final close

---

### Auto-close
**What it is:** The automatic closure of an event when `closes_at` or
`hard_close_at` is reached, triggered by the hourly Vercel cron job. On
auto-close, `closed_at` is set, `total_raised` is recorded, and the charity
disbursement is triggered.

**Code:** `src/app/api/cron/close-events/route.ts`; `events.closed_at`
**UI:** "Poll closes in…" countdown; "Poll closed on…" after closure
**Not:** expiry, timeout, scheduled close

---

### The record
**What it is:** The aggregate of all pledged amounts and pledge counts across
all events for every topic item — favpoll's permanent, financially-weighted
measure of what people love. Updated in real time via Postgres trigger on
`pledge_allocations`. The long-term data asset of favpoll.

Not a leaderboard or a competition. A record — authoritative, cumulative,
built through acts of generosity at life's most significant moments.

**Code:** `topic_items.all_time_pledged`, `topic_items.all_time_count`;
trigger `on_pledge_allocation_change`
**UI copy:** "the record" — "every pledge contributes to the record"
**Page name (future):** "the favpoll index"
**Not:** all-time ranking, leaderboard, global ranking, historical data,
all-time scores

---

### Organiser
**What it is:** The person who creates and manages an event. May be a family
member, friend, colleague, or executor acting on will instructions. Has full
edit access to their events.

**Code:** `events.created_by` (Clerk user ID)
**UI:** "organiser" in internal/admin contexts; not labelled in guest view
**Not:** admin, creator, host, owner

---

### Guest
**What it is:** Anyone who views and pledges in an event. May be signed in
(Clerk account) or anonymous (email only). The term covers both.

**Code:** `pledges.clerk_user_id` (nullable) or `pledges.guest_email`
**UI:** "guests" in organiser-facing contexts ("43 guests have pledged")
**Not:** user, donor, participant, voter, attendee

---

## Intentional divergences

These are cases where the UI deliberately uses a different term from the code
for brand or clarity reasons. Both usages are correct in their context.

| Code term | UI term | Reason |
|---|---|---|
| `topic` | "favpoll" (in picker) | Brand term — "topic" is too technical for the organiser flow |
| `protagonist` | shown by name only | Never labelled in UI |
| `event_polls.personal_framing` | "Question" (edit label) | Shorter and clearer in UI context |
| `event_polls.personal_reveal` | "The reveal" (edit label) | More evocative than "reveal" alone |
| `closes_at` | "favpoll closes" | Branded phrasing |
| `topic_items` | options / pills | Never labelled in UI — shown as interactive elements |
| `all_time_pledged` / `all_time_count` | "the record" | Removes competitive framing |

---

## Terms that must never appear in UI copy

These are internal/technical terms that should stay in code and documentation:

`topic`, `event_poll`, `topic_item`, `pledge_allocation`, `pot_allocation`,
`event_pot`, `hard_close`, `inclusion`, `is_canonical`, `is_finite`,
`all_time_pledged`, `clerk_user_id`, `guest_token`, `protagonist`

---

## Field naming in UI copy

- Never use "suffix" or "occasion label" in UI copy
- The `context` DB column → "Context" in labels
- The `opening_line` DB column → "Opening line" in labels
- Code variable names are unaffected by these UI conventions
