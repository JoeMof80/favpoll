# Session handoff — 2026-07-10

For the next Fable session. State at close: **clean** — `main` at `54fc4af`,
all tests green (1021 web / 56 admin), nothing uncommitted, no open PRs.

---

## What the closing session shipped (PRs #242–#246, all merged)

- **#242 — iPhone pledge sheet no longer summons the keyboard on open.**
  Two causes, both fixed: explicit `autoFocus` on picker-style inputs (now
  gated by `hasFinePointer()` in `apps/web/lib/pointer.ts`) AND Radix Sheet's
  own open-autofocus (prevented via `onOpenAutoFocus` on `ResponsiveOverlay`'s
  mobile branch). Writing-first overlays (About, opening line) deliberately
  keep unconditional autofocus — the keyboard is the task there.
- **#243 — live page actually updates when a pledge lands.** Root cause:
  Supabase realtime is structurally dead browser-side — `pledges`/`favourites`
  have RLS enabled with **zero policies**, so all `postgres_changes` are
  silently filtered before reaching the anon subscriber. Do **not** add anon
  SELECT policies (row-level, not column-level → would leak guest
  emails/tokens via PostgREST). Fix: `DisplayScreen` runs `router.refresh()`
  every 5s; `wasOpenAtMount` anchors the typed finale so a post-close refresh
  can't cut it off mid-sentence.
- **#244 — dead realtime code removed + landing hydration fix.** Founder
  decided the **event page does not need live updates** (transactional
  surface; spectating is the live display's job). Removed: `useRankingItems`
  channel (aria-live mover announcements now fire on fresh `initialItems`),
  the `useLiveWall` hook, and the `/api/favpolls/[id]/wall` endpoint (hook was
  its only consumer). Hydration: `GuestWall`'s new `RelativeTime` keeps server
  text through hydration (`suppressHydrationWarning`) and corrects after
  mount — clock-dependent text vs statically prerendered HTML.
- **#245 — PROJECT.md Live mode chapter**; stale realtime claims reconciled
  (route entry, stack line, key-files tree).
- **#246 — Goodstack chase drafts** recorded in
  `references/disbursement-enquiries-2026-07.md`.

## In Joe's court

- **Real-iPhone test** of the pledge sheet (#242) and a live pledge test of
  `/live/[slug]` (#243) against the deployed main.
- **Send the Goodstack chase** — email + LinkedIn drafts ready in
  `references/disbursement-enquiries-2026-07.md` (verify the sales address on
  goodstack.io; fill the LinkedIn `{name}`). Demo request of 6 July has had
  **zero response** as of 10 July. If still silent by **~17 July**, treat as
  signal and warm the CAF fallback. Gift Aid pass-through by the Goodstack
  Impact Foundation (charity 1192508) is THE open payments question.
- **`CONTACT_EMAIL`** env var in Vercel (contact form delivery).

## Parked (rough priority order)

1. **E2E advisory hardening** — known flake: first assertion of
   `e2e/reveal-after-pledge.spec.ts:86` (lock-button visibility) times out on
   cold previews. Fix: warm-up ping + longer first-expect timeout. Advisory
   only; never blocks.
2. **React version dedupe** — 19.2.4 vs 19.2.6 peers split `.pnpm` into
   duplicate package instances (caused the next-themes dual-instance bug;
   patched by re-exporting `useTheme` from `@favpoll/ui` — dedupe is the real
   fix).
3. **Hero headline wording** — "Turn what you love into what you give" stands
   but Joe dislikes the "love" repetition against the brand statement;
   alternatives so far rejected.
4. **Record section reframe** — threshold-gated (£500 / ≥3 items).

## Sharp edges

- **Merge discipline:** verify `gh pr view N --json state` = `MERGED` before
  deleting any branch — deleting the head of an unmerged PR closes it
  (happened twice, #208/#216).
- **Prettier only from `apps/web`** (`pnpm --filter @favpoll/web exec
  prettier`) — repo root strips TS generics in `.tsx`.
- **Design tokens only** — `pnpm lint:colors` blocks bracketed hexes, even
  inside data URIs (BrandedQR builds its SVG from resolved tokens).
- **Dev server on :3000 is Joe's ngrok-exposed instance** — it hot-reloads
  your edits; warm with curl before Playwright (compiles run 15–35s under
  load).
- **grep/rg output sometimes mangles words locally** (e.g. favpoll→favln) —
  verify suspicious matches with a real file read.
- **Migrations:** staging via Supabase MCP; production only via Joe's
  `/db-migrate`. `live_slug` and disbursement migrations are applied to both;
  the rate-limiting migration (`20260705160000`) is staging-only (see
  Outstanding TODO in PROJECT.md).
- **Never** resolve favpoll id → `live_slug` on legacy routes (defeats the
  capability slug); anonymity ("Someone") is absolute on every surface; no
  fee language anywhere; recipient is always a registered charity (no
  crowdfunding).

## Where the durable context lives

- `references/PROJECT.md` — schema, routes, key files, decisions, **new Live
  mode chapter** (freshness model, reveal rule, goal-as-milestone).
- `references/GLOSSARY.md` — vocabulary incl. live (realtime) vs open
  (accepting pledges).
- `references/disbursement-enquiries-2026-07.md` — Goodstack status, chase
  drafts, call brief, Swiftaid fallback.
- Auto-memory index (`MEMORY.md`) — includes `project_realtime_dead.md`
  (never re-add postgres_changes; server-broadcast is the sanctioned push
  path) and `project_legal_entity_payments.md` (Goodstack timeline).
