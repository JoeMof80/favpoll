---
name: favpoll-context
description: >
  Complete project context for the FavPoll application. Use this skill at the
  start of every Claude Code session working on FavPoll, or whenever you need
  to understand the project architecture, database schema, design decisions,
  or conventions. Trigger whenever the user mentions FavPoll, asks about the
  schema, asks about a component, or begins any task on this codebase. Also
  use when the user asks to update the project document itself.
---

# FavPoll Project Context

Read `references/PROJECT.md` for the full project document before doing
anything else. It contains the complete schema, stack, design system,
conventions, and outstanding work.

## How to use this skill

1. On session start: read PROJECT.md, confirm you understand the current state
2. Before writing any code: check the schema section matches what is in Supabase
3. Before creating any UI: check the design system section
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

## Key conventions to always follow

- Use shadcn `Button` component, never raw `<button>`
- All editable fields in edit mode: `border-b border-[#AFA9EC]` persistent underline
- Guest view: no underlines, no placeholders, no edit controls
- `aria-live="polite"` on all live-updating values
- Supabase browser client from `@/lib/supabase/client`
- Supabase server client from `@/lib/supabase/server`
- Admin/webhook routes: `createClient` directly from `@supabase/supabase-js`
  with `SUPABASE_SERVICE_ROLE_KEY`
- Topic titles have no "Favourite" prefix in the database
- Colour items rendered using `item.label.toLowerCase()` as CSS colour — no hex stored
- pnpm only, never npm or yarn
- American spelling in code (color, organize), UK English in UI copy strings

## Seed script

Run with `pnpm seed` → `scripts/seed.ts`
Never delete data — the script is additive and idempotent.
