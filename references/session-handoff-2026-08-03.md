# Session handoff — 2026-08-03 (PRs #427–#483)

Covers the long window 2026-07-30 → 2026-08-03. Everything below is
merged to main; suite green at 1189 tests. Details of each area live in
PROJECT.md (updated this window) — this is the map, not the territory.

## 1. Generate an example (was "Generate a suggestion")

Two-step house-grammar dialog (who: He/She/They/Pair/Group → occasion,
word pills, per-step titles, provenance line). Occasion is EPHEMERAL
generation input — never stored; opening_line/context derive from it
(`lib/occasions.ts`, 104 occasions, pronoun-aware contexts). Generation
quality hardened on-device: pick-IS-the-pledge mechanic, memorial past
tense, second-person About, choose→retry ban (`violatesCopyRules`).
Caches purged on both Supabase projects after every prompt change.

## 2. Publish guards

Person favpolls: block publishing unedited generated name/context/reveal.
Any About that mentions a reveal blocks while the reveal is empty.

## 3. Pledge split (total-then-split)

One total at the top; ±£1 stepper moves part to the shared fund
(`applySplit` clamps fund ≤ total−1); equal multi-favourite splits; tip
chips in the decisions zone under the stepper (memorial default tip 0 —
Joy: defaults stick, so the standard default stays elsewhere); ONE
charity receipt line backed by the residual-fund policy (residual fund
goes to the charity at settlement — founder decision); privacy note last.
Gift icon = pledge-again (standard shadcn icon button, tooltip left).

## 4. Guest clarity pass (from the Joy misread analysis)

Lock card = ONE card: primary header CTA ("Pledge your favourite" —
universal; reveal-as-bait was the quiz frame) + numbered steps from
`lib/mechanic-steps.ts` (single source with the print pack) + shared-fund
escape hatch. Topic ribbons are HEADERS everywhere; decoy has descending
bars, 60% fade, card-only clickable with hover lift. Guest wall:
max-height scroll + expand dialog; no empty card avatars.

## 5. Print pack v2

Same card at three scales: A4 rotated landscape on a portrait sheet
(scale-sandwich — pre-transform layout boxes drive print fragmentation;
always test PDFs with 12.7mm margins, zero-margin default masks
overflow), A5 pair, 8 wallet cards. Per-sheet print buttons outside the
pages; brand = real FavpollLogo treatment.

## 6. Sticky decoy saga (lesson ledger)

Four failed attempts at a constant-distance sticky decoy → clean revert
(#455) → the REAL fixes: WebKit ignores sticky inside
absolutely-positioned ancestors (shared grid cell, `[grid-area:1/1]`,
#456) + pin offset correction to +4.25rem (#457). LESSON: dual-engine
verification (chromium AND webkit) is mandatory for sticky/layout work.

## 7. Live display — the presence dial (the 2026-08-02/03 arc, #461–#481)

Fundraiser/tribute variants, register-derived default, presenter ⋮
switcher persisted per favpoll; ONE banner row with measured zero-shift
between views (shared min-h envelope + top alignment + pinned col-2
blocks); money blocks in the hero's exact type; no-goal hero = three-line
silhouette with `Countdown variant="subtitle"` as the dates line; QR
promoted to chrome (200px, both gutters, vertical centre, ≥1600px,
gutter-centred maths) with brand-tinted ink via the `--qr` token; reveal
confined to the witnessed close finale. Full detail in PROJECT.md's
/live route entry. REMAINING (TODO entry): party variant, ambient
rotation, reveal choreography.

**`--qr` token gotcha** (cost a founder bug report): custom properties
read only from JS get stripped from served CSS on cold compiles —
register in @theme AND reference from a real utility (text-qr). Dark
value is decoder-bounded: 0.92 L is the floor that machine-reads against
the brand-purple field.

## 8. Reveal shapes (#482)

No kind-selector (rejected: organiser friction + copy matrix). Helper
text teaches quote/memory/message; `isQuoteReveal` inference flips step
3 to "in their own words" as a content-free boolean.

## 9. Outreach (see celebrant + disbursement docs)

- **Joy**: clarity reply SENT Saturday (quiz misread corrected, presence
  dial in plain words, first-impressions ask = the active hook).
  Warm-pilot ask still HELD. Her network feedback becomes a
  wrong-impressions ledger routed into the clarity backlog.
- **Ethan/Goodstack**: Monday nudge → reply in 8 minutes → **call
  expected Friday 7 Aug, afternoon**. Pin a slot if no invite by
  Wednesday. Brief print-ready (fees #1). Sandbox: ask ON the call;
  engineering-support email stays held. Second confirmation: short
  same-thread email to the engaged person is the channel that works.
- **St Luke's/Angela**: held behind Joy learnings + /memorials.

## 10. Ops lessons this window

- Ship gate is a HARD `set -e` step (pnpm test:run || exit) — a
  grep-piped chain let #452 and #473 merge on flaky reds (both
  pledge-card timeouts, green on rerun; main never actually broken).
- Founder's dev server wedges under all-day live-display polling
  (~5–7GB next-server, twice on 2026-08-03) — needs founder restart;
  suggest closing idle live tabs / NODE_OPTIONS max-old-space-size.
- Playwright: always `cd apps/web` per Bash call; `domcontentloaded`
  (live pages poll); founder's :3000 server is never restarted by us.

## 11. Next up (agreed 2026-08-03)

1. **/memorials** — first register landing page (forwarding artefact
   for Joy / funeral directors / St Luke's; tribute view is its demo).
2. Register-aware topic suggestions (quick win).
3. Guest wall messages (own session; moderation/tone/anonymity design).
4. Presence dial remainders; Story/About editor still awaiting decision.
5. Launch plumbing unchanged (webhooks, cron verify, Clerk live keys,
   Stripe Connect, prod rate-limit migration).
