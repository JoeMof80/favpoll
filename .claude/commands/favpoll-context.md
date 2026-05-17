---
name: favpoll-context
description: >
  Complete project context for the favpoll application. Use this skill at the
  start of every Claude Code session working on favpoll, or whenever you need
  to understand the project architecture, database schema, design decisions,
  ubiquitous language, or conventions. Trigger whenever the user mentions
  favpoll, asks about the schema, asks about a component, asks about naming,
  or begins any task on this codebase. Also use when the user asks to update
  the project document itself.
---

# favpoll Project Context

Read `references/PROJECT.md` for the full project document before doing
anything else. It contains the complete schema, stack, design system,
conventions, and outstanding work.

Read `references/GLOSSARY.md` for the canonical domain vocabulary. Use these
terms consistently in all code, comments, variable names, and UI copy.

## How to use this skill

1. On session start: read PROJECT.md and GLOSSARY.md
2. Before writing any code: check schema section matches Supabase, check term
   names against the glossary
3. Before creating any UI: check the design system section and brand skill
4. After significant changes: update PROJECT.md to reflect what changed

## Updating the project document

When the user asks to update the project document, or after completing a
significant feature:

1. Read the current `references/PROJECT.md`
2. Identify what has changed — schema additions, new components, new decisions,
   resolved TODOs, new environment variables
3. Update only the affected sections — do not rewrite sections that have not changed
4. Add new TODOs for anything left incomplete
5. Keep the document factual and concise — it is a reference, not a narrative

## Ubiquitous language — quick reference

Use this table when naming variables, functions, types, and UI copy.
Full definitions in `references/GLOSSARY.md`.

| Domain concept           | Code name             | UI label                    |
|--------------------------|-----------------------|-----------------------------|
| Individual/couple/group honoured | `protagonist`  | shown by name only          |
| Top-level occasion       | `event`               | "event"                     |
| Question category        | `topic`               | "favpoll" (picker UI)       |
| Topic in an event        | `event_poll`          | shown by topic title        |
| Answer option            | `topic_item`          | shown as pill               |
| Item in event poll       | `event_poll_item`     | not labelled                |
| Financial commitment     | `pledge`              | "pledge"                    |
| Pledge split             | `pledge_allocation`   | not shown                   |
| Organiser's question     | `personal_framing`    | "Question"                  |
| Post-pledge secret       | `personal_reveal`     | "The reveal"                |
| Communal pot             | `event_pot`           | "shared fund"               |
| Fund draw                | `pot_allocation`      | not shown                   |
| Projector screen         | `live_display`        | "Live display"              |
| Fixed item list          | `finite` (topic)      | "Finite" (filter)           |
| Open item list           | `infinite` (topic)    | "Infinite" (filter)         |
| Item joins canonical list | `inclusion`          | not shown                   |
| Whether item is canonical | `is_canonical`       | not shown                   |
| Max closure date         | `hard_close`          | not shown directly          |
| Scheduled closure        | `auto_close`          | "Poll closes in…"           |
| Aggregate pledge data    | `all_time_pledged` / `all_time_count` | "the record" |

### Critical naming rules
- `persons` table renamed to `protagonists` — never use `persons` or `person`
- `event_polls.personal_quote` renamed to `personal_reveal` — never use `personal_quote`
- `graduate_topic_items()` renamed to `include_topic_items()`
- `topic_items.is_master` renamed to `topic_items.is_canonical`
- Topic titles have no "Favourite" prefix — stored as "Colour" not "Favourite colour"
- The product is always "favpoll" lowercase — never FavPoll in code or UI
- "pledge" not "donation" or "vote" in all UI copy
- "the record" not "all-time ranking" in all UI copy

### Terms that must never appear in UI copy
`topic`, `event_poll`, `topic_item`, `pledge_allocation`, `pot_allocation`,
`event_pot`, `hard_close`, `inclusion`, `is_canonical`, `is_finite`,
`all_time_pledged`, `clerk_user_id`, `guest_token`, `protagonist`

## Key conventions to always follow

- Use shadcn `Button` component, never raw `<button>`
- All editable fields in edit mode: `border-b border-[#AFA9EC]` persistent underline
- Guest view: no underlines, no placeholders, no edit controls
- `aria-live="polite"` on all live-updating values
- Supabase browser client from `@/lib/supabase/client`
- Supabase server client from `@/lib/supabase/server`
- Admin/webhook routes: `createClient` directly from `@supabase/supabase-js`
  with `SUPABASE_SERVICE_ROLE_KEY`
- Colour items rendered using `item.label.toLowerCase()` as CSS colour — no hex stored
- pnpm only, never npm or yarn
- American spelling in code (color, organize), UK English in UI copy strings

## Seed script

Run with `pnpm seed` → `scripts/seed.ts`
Never delete data — the script is additive and idempotent.
