# Architecture survey — 2026-07-20

Three parallel deep-reads of the codebase (app routes + data flow, admin +
payments + infra, component architecture), run 2026-07-20. Condensed here;
findings tiered by severity. Items marked ✅ were fixed the same session
(PRs #301–#303).

## Tier 1 — launch-gating (money & trust)

- ✅ **Payment truth was client-side; no Stripe webhook exists at all.**
  The pledge actions recorded whatever amount the client claimed, never
  touching Stripe; no `payment_intent_id` was stored. Fixed in #301:
  server-computed charges, PI metadata binding, verification at save,
  unique PI per pledge. **Remaining:** webhook reconciliation for the
  charged-but-unrecorded window (client dies after `confirmPayment`) — the
  stale comment about a "webhook-driven savePledge" described a route that
  was never built.
- ✅ **`/api/polls/[pollId]/results` was unauthenticated** — anyone could
  curl an open poll's standings past the pledge lock. Fixed in #302 (the
  reveal route's exact entitlement gate; guest token threaded).
- ✅ **Fund money moved non-atomically and unverified** — racy
  read-modify-write increments, unauthenticated guest top-up,
  client-supplied allocated figure. Fixed in #303 (`pot_topups` ledger +
  `pot_top_up`/`pot_allocate`/`pot_deallocate` RPCs + `verifyTopUpPayment`).
- **No RLS anywhere.** Zero policies across all migrations; every server
  page uses the service-role client; the anon SSR/browser clients are dead
  code (only `.storybook/main.ts` imports one). Security is entirely
  hand-rolled checks at the app layer — a deliberate posture now, but each
  page is one missing `created_by`/entitlement check from a leak, and any
  future anon-key query would read every table unrestricted. Document or
  revisit before opening any anon surface.
- **close-favpolls cron is non-atomic**: `closed_at` is written before the
  disbursements insert; a ledger failure silently drops a charity payout
  with no retry (the favpoll is never re-selected).

## Tier 2 — real bugs

- **Live display sources items from the whole topic canon** (`favourites`
  by `topic_id` only, no epf branch) — wrong list for infinite /
  guest-curated topics on the big screen.
- **`poll-standings` unbounded queries** — pledges/allocations `.in()` with
  no limit; PostgREST's 1,000-row default cap silently truncates standings
  on a popular poll.
- **Poll detail page runs ~8 queries strictly sequentially** (worst page;
  `live/[slug]` similar). Easy `Promise.all` wins.
- `keepsake` double-queries the same pledge rows; guest-wall name
  resolution (pledges → users lookup) is copy-pasted ×3.
- `pledges.fee` is dead (always inserted 0, never read).

## Tier 3 — hygiene / duplication (high volume, low risk)

- **Currency formatting forked 10+ ways** (canonical: `lib/i18n.formatCurrency`
  - `pledge-card/utils` GBP; hand-rolled `Intl.NumberFormat` blocks and
    ad-hoc `£${n}` formatters everywhere, incl. 3 near-identical compact
    formatters).
- **Finite-vs-epf item sourcing forked ×5** (`app/page`, `favpolls/page`
  twice, poll page, results API — live page is the buggy 6th). One
  `sourceItems(poll)` helper would collapse them.
- Register→occasion-type filter builder duplicated verbatim twice in
  `favpolls/page.tsx`; Raw\* types + the big favpoll SELECT duplicated
  across 3 pages; `DECOY_WIDTHS` ×3; card-shell hover class ×2; the two
  card prop shapes ~90% overlapping and cast back to `@favpoll/types` via
  `as unknown as`.
- **Dead code**: `PledgePanel` + both picker files (alive only for
  `computePledgeAllocations` — move it, delete them); unused
  `FavpollCardProps`/`PollData` types.
- **Web↔admin drift**: duplicated `cn()`, supabase admin client, UI
  primitives (`button`/`badge`/logo have already diverged); `@favpoll/ui`
  exports only the theme shim.
- **CI gaps**: no ESLint job (both apps define `lint`, CI never runs it);
  Prettier checked on web only (why admin drifted); E2E advisory.
- ~74% of components carry `"use client"`; several pure-presentational
  wrappers are needlessly client.

## Structural bottom line

Independently-authored server pages share three thin helper libs but no
favpoll query/data-access layer. A `getFavpollForCard`/`getFavpollDetail`
module + one `sourceItems` helper + one money formatter would collapse most
of Tier 3.
