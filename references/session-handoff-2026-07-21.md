# Session handoff — 2026-07-21

For the next Fable session. State at close: **clean** — `main` at `2f1f035`
(#315), all tests green (1,113 web), no open PRs, nothing uncommitted.

Covers PRs **#304–#315** (12 merges since the 2026-07-20 handoff). Two arcs:
finishing the money-truth work in production (§1–§2), then the full Tier-2 /
hygiene sweep from the 2026-07-20 architecture survey (§3). The survey's
follow-up list is now **done** except the items parked deliberately (§5).

---

## 1. Money truth part 2 — the loop closed in production

- **#306 — live display item source.** The display read the whole topic
  canon (27 rows) instead of the poll's curated list (11). Now uses the
  shared `lib/poll-items` `fetchPollItems` (finite → topic's closed set;
  infinite → visible `favpoll_poll_favourites`). Measured before/after.
- **#307 — atomic close + reconciliation.** Close cron reordered so
  disbursements upsert FIRST (`onConflict: "favpoll_id,charity_id"`,
  `ignoreDuplicates`) and `closed_at` only stamps after — a crash mid-cron
  can no longer close a favpoll without disbursements. Plus the
  charged-but-unrecorded window: `/api/webhooks/stripe` records every
  `payment_intent.succeeded` into `stripe_payment_events` (migration
  `20260721100000`; 503 without `STRIPE_WEBHOOK_SECRET`; 500 on write
  failure so Stripe retries), and an hourly `reconcile-payments` cron marks
  events off against pledges/pot_topups (30-min grace) and reports any
  charged-but-unrecorded payment. **Verified end-to-end in production**:
  real test pledge → verified `pi_…` on the pledge row → webhook event →
  cron `{"reconciled":1,"unmatched":0}`.

## 2. Production untangled (#308) + real-device fixes

`references/outstanding-tasks-2026-07.md` §1b holds the launch checklist.
The topology (also in auto-memory `project_prod_environment.md`):

- **Prod is a deliberate staging mirror**: prod had been pointing at the
  bare `favpoll` Supabase project (zero migrations — every page silently
  empty via the swallowed-error habit) with LIVE Stripe keys (test cards
  declined; real cards would have charged). Now prod → staging Supabase +
  FavPoll-sandbox test keys until launch, when §1b flips everything.
- **CRON_SECRET had never been set in prod** — every scheduled cron 401'd
  silently since day one. Set now. `CLERK_WEBHOOK_SECRET` had been stored
  EMPTY by the Vercel CLI (54.7.1 `env add` writes empty values — never
  trust it; set via REST API and verify with `vercel env pull`).
- The Stripe webhook destination was first created in the wrong Stripe
  environment (main account vs the "FavPoll sandbox" the app's keys belong
  to — sandboxes are isolated; diagnosed from account fragments in
  `we_`/`pi_` ids). Recreated in the sandbox, secret set.
- **#309 — iOS hydration mismatch.** Safari rewrites digit runs ("Charity
  no. 1082947") into `tel:` links BEFORE hydration → guaranteed mismatch on
  real devices. `formatDetection: { telephone/address/email: false }` in
  root layout metadata.
- **#310 — /record links hidden** (header, footer, about) with
  restore-at-launch comments; topics-page breadcrumb kept. The landing's
  record vignette says "Coming soon" — nav no longer contradicts it.
- **#305** — Josh Radford (Goodstack) emailed 20 July; contact log +
  chase trigger (~27 July → Henry Ludlam → CAF) in the references.

## 3. The Tier-2 / hygiene sweep (#311–#315)

Five PRs, in dependency order, each merged before the next began:

- **#311 — pagination (correctness, money).** PostgREST silently caps
  every select at 1,000 rows. New `lib/supabase/paginate` `fetchAllRows`
  pages via `.range()` and **throws** on error (loud beats the app's
  £0-on-swallowed-error habit). Applied to all 9 unbounded money reads:
  poll-standings (both queries), **close cron settlement totals**,
  reconcile cron backlog (500 behaviour preserved), poll page totals +
  rank history, live totals, topic allocations, keepsake ×3. The bug class
  is invisible below 1,000 pledges — unit tests prove the paging; a bulk
  seed for real scale testing is parked (founder wants it eventually).
- **#312 — query waterfalls.** Poll page ~11 sequential round trips → 4
  staged `Promise.all` batches; live display and keepsake likewise. The
  keepsake's double-read deduped (pledge timeline with joined labels feeds
  both standings and rank history — amounts verified byte-identical).
  Also gated every poll-scoped query on the poll id existing: the old
  `.eq("favpoll_poll_id", "")` fallback is an invalid uuid, which #311's
  loud errors would have turned into a crash for poll-less favpolls.
- **#313 — currency formatters.** 20 files with private formatters → three
  families in `lib/i18n`: `formatPounds` (£1,300), `formatPoundsExact`
  (£12.00, payment surfaces), `formatPoundsCompact` (— / £1.2K, topic
  tables), plus `formatCount`. Pence-based `formatCurrency` unchanged.
  ranking-list's `£1.2K` and record's lowercase `£1.2m` stay as deliberate
  local styles. Gotcha found: ICU versions disagree on compact-suffix case
  ("£1.3K" local vs "£1.3k" CI) — tests must not pin the case.
- **#314 — dead code.** PledgePanel trio deleted (~500 lines; nothing
  rendered it); its live `computePledgeAllocations` + tests rehomed to
  `lib/pledge-allocations`. `favpoll-card/types.ts` lost its dead closed
  loop (PollData/CardCharity/FavpollCardProps/PollStep). `DECOY_WIDTHS`
  (5 copies) → `lib/decoys`.
- **#315 — ESLint gate.** New CI Lint job (web + admin), both apps at
  **zero errors** (from 136 + 30). Policy in both `eslint.config.mjs`:
  `any` allowed in tests/mocks/stories; the React-Compiler hooks rules
  demoted to warnings as counted debt (do NOT silence hits individually);
  `^_` unused-ignore pattern. The unused-vars pass found real bugs:
  DisplayScreen carried 3 props nothing used; **both form pages fetched
  `categories` and threaded it to a dead end** (chain + queries removed);
  the edit page fetched the pot it never read. 46 stories imported from
  `@storybook/react` instead of `@storybook/nextjs-vite`.

## 4. Operational gotchas learned this session

- **Vercel branch-name DNS limit**: the preview alias
  `favpoll-web-git-<branch>-favpoll` must stay ≤63 chars — the #313 branch
  name made it 64, so the alias never resolved and the advisory E2E job
  died on curl exit 6. Keep branch names short.
- The advisory E2E is otherwise healthy again (#315's run passed).
- gh merge states: `BLOCKED` = required check pending/failing; `UNSTABLE` =
  only a non-required check failing (mergeable without `--admin`).

## 5. Parked / founder's court

- **Add "Lint" to branch protection's required checks** — until then a red
  lint job doesn't block merges (founder's Settings task).
- **Bulk seed** (1000s of favpolls) for scale testing — wanted, unscoped.
- **fetchPollItems adoption** in the home/`/favpolls` list pages: skipped
  deliberately (they batch items in one nested select across favpolls; the
  helper would multiply queries). Migrate as touched.
- The react-hooks warning debt: 27 web + 1 admin, visible in every lint run.
- **Goodstack chase ~27 July** → Henry Ludlam → CAF (see contact log).
- Launch flip checklist: `references/outstanding-tasks-2026-07.md` §1b.
- Header/footer no longer link /record (#310) — the "known tension" from
  the last handoff is resolved until launch restores them.

---

## Addendum — the evening of 21 July (PRs #316–#323)

Written at close, 2026-07-22 ~00:45 UTC. `main` at #323, suite 1,113
green, no open PRs, nothing uncommitted.

- **#317 — scale seed + the two launch-blockers it caught.**
  `pnpm seed:scale` (deterministic cohort, `--wipe` teardown, whales at
  1,500/2,600/5,200 pledges). Within minutes it exposed (1) the
  `pollSetStandings` URL explosion — `.in()` over every pledge id →
  ~55KB URL → 500; rewritten as an embedded-join query chunked at 100
  poll ids (keepsake's guest-name `.in()` chunked too), and (2) **no FK
  indexes on any money table** — migration `20260722100000_fk_indexes`
  (applied to staging) took the 5,200-pledge poll page from statement
  timeout to 1.7s. Whale totals penny-exact on every surface.
  **The cohort is still live in the shared DB** (decision pending:
  testbed vs wipe; open seeds start closing ~30 days out; the founder's
  £2 test pledge rides on a seeded poll so wipe sweeps it).
- **#318 — shelf 60-cap parked** (shop-window vs finder question first).
- **#319/#320 — pledge.to evaluated; Leo Chandler thread opened.**
  Pledge: not a rail (5% non-US, no Gift Aid), validates the tip model.
  **Leo (Goodstack trustee) accepted the 11 July LinkedIn connection on
  21 July — first Goodstack response signal on any channel**; follow-up
  DM sent same day WITH the Gift Aid question (trustee = governance
  question, not deal detail). Leo's DM is the live thread; the ~27 July
  Josh chase fires only if he stays silent.
- **#321/#322 — wallet payments live.** PaymentElement was already
  wallet-ready; work = association file in `public/.well-known/` +
  domain registration (apple_pay + google_pay ACTIVE). **Apple Pay
  device-verified** by the founder and money-loop-proven (£2: verified
  `pi_` → webhook → reconciled by the scheduled cron). Google Pay is
  API-active but never device-tested (no Android) — folded into the
  §1b step-8 launch smoke test. Step 4b = live-domain re-registration.
- **#323 — iOS grid blowout.** /record clipped at the left edge on
  a real iPhone: card grids declared columns only from `sm` up, so the
  implicit mobile track honoured content min-content (a nowrap truncate
  label = 456px card on a 393px viewport). `grid-cols-1` on all four
  card grids (record ×2, charities ×2). Device-confirmed fixed.
- **Operational notes:** the Vercel CLI token in
  `~/Library/Application Support/com.vercel.cli/auth.json` has expired
  (env-var API reads now 403 — re-auth with `vercel login` before the
  launch flip). Vercel cron start jitter (~40s) means a grace-window
  boundary can land either side of :30 — don't predict, watch.
- **Still unverified from the week:** the first close-favpolls :00
  sweep after CRON_SECRET was fixed (stale-backlog close + emails) and
  the Clerk dashboard webhook endpoint URL check.
