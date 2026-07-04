# Growth ideas — boosting Honour, Charity, Love (July 2026)

Working document from a strategy discussion on 2026-07-04. Nothing here is
built; most items are advice and proposals awaiting decisions — except
where marked **Decided** (currently §4, the no-caps record principle).

---

## Assessments of the proposed ideas

### 1. Top-pledger + charity cards on topic pages

**Split verdict.**

- **Charity half — do it.** "Purple has raised £2,340 for Marie Curie, Mind
  and Shelter" ties the record to real-world impact. Low risk, high brand
  value.
- **People half — reshape it.** A global "biggest spenders" board pushes
  toward gamified philanthropy (the brand doc explicitly says favpoll is
  never a gamified experience), and money-leaderboards sit badly with the
  memorial register.

**The same impulse done in-register:** a **guest wall per favpoll** — names
(and optional short messages) of those who pledged, like the cards on
funeral flowers. Families genuinely want this. Honour-boosting rather than
wallet-boosting.

### 2. Anonymity — proposed model

Borrowing what works from JustGiving, tuned to favpoll's registers:

| Rule | Default | Rationale |
| --- | --- | --- |
| Display name shown publicly | **On**, with a "give anonymously" tick-box | At memorials people *want* to be seen to have given — like signing the condolence book |
| Amount shown publicly | **Off** by default | Keeps the wall about presence, not size |
| Organiser/family sees names | **Always**, even for "anonymous" pledges | Bereaved families send thank-yous |
| Anonymous pledges in the record | **Count fully** | The record measures conviction, not identity |

Practical note: guests currently give only an email — this needs an
optional display-name field at pledge time.

### 3. "By User" tab on results

**Skip it.** The product's rankings are of *favourites*; ranking *people*
on the results surface dilutes the metaphor. The guest wall covers the
"who" question in the right register.

### 4. Outliers skewing the record

**Decision (founder, 2026-07-04): no caps, no damping — legibility instead
of suppression.**

A per-pledger record cap was proposed and rejected, rightly: repeated
pledging on a favourite *is* conviction — the purest expression of "every
data point cost someone something" — and the record was never
one-person-one-vote; it is weighted by sacrifice by design. Nothing may
block, cap, or discount devoted giving (nor would the charities want it).

The credibility concern (a summit visibly bought by one actor makes the
whole record read as purchasable) is handled by **breadth visibility**,
not weighting. Polymarket doesn't cap whales either — markets have a
counter-force (the crowd trades back); favpoll's counter-force is
transparency:

- Show **distinct pledgers** alongside amount everywhere the record
  appears: "Blue — £12,400 · backed by 214 people". A bought summit
  exposes itself (£10,000 · 3 people); a genuine groundswell looks even
  stronger. (`all_time_count` exists; distinct-pledger count needs
  deriving from pledges.)
- Keep **By pledges** as the breadth view; no user-facing outlier filters.
- **Record methodology page** survives in a simpler form: "amounts are
  amounts; we always show how many people."
- Actual manipulation (commercial astroturfing, pushing offensive items)
  is a **terms-of-service matter**, never math that punishes devotion.

### 5. Rewards for high pledgers

**No.** Two reasons beyond the gamification clash:

- **Gift Aid:** donor benefits above HMRC thresholds void Gift Aid claims —
  a future problem worth not creating (Gift Aid belongs on the roadmap;
  see below).
- Recognition instead of rewards: a quiet annual "your year of giving"
  recap; keepsakes tied to *participation*, not amount.

### 6. Pledge goal

**Yes, unreservedly.** Best-evidenced conversion mechanic in fundraising.
Natural for causes; fine for memorials if understated ("The family's goal:
£500 for Marie Curie" with a quiet progress bar). Directly lifts totals,
which lifts the 5% fee. **The quickest pure win on the list.**

### 7. Display page — live polling + rename

**Yes to both halves.**

- The glossary already calls it `live_display`, so `/favpolls/[id]/live`
  aligns the URL with the ubiquitous language (redirect from `/display`).
- Realtime: the page already updates the *total* via Supabase Realtime,
  but the ranking rows need checking — full live rankings may need wiring
  to the same channel `RankingList` uses. Do it together with the rename.

### 8. Charity Commission API

**Yes for data, no for images.** The register API (England & Wales;
Scotland/OSCR and NI/CCNI are separate) provides names, numbers, status
and activities — **no logos**. Use it to:

- auto-verify charity numbers (a "verified" badge is cheap credibility)
- pre-fill admin entries
- periodically re-validate (a deregistered charity on the platform would
  be a trust disaster)

**The bigger strategic question behind it:** letting organisers pick *any*
registered charity instead of the curated list. That's the growth unlock,
but it needs per-charity payout rails — either Stripe Connect onboarding
per charity (slow) or routing via **PayPal Giving Fund**, which covers
most UK charities without individual onboarding. Worth investigating
seriously.

### 9. Rank-over-time chart ("Purple rising 5th → 1st", Polymarket-like)

**Worthwhile — but as a bump chart (rank over time), not a Polymarket
price chart.**

Why not the market form:

- Price-chart aesthetics (green/red, percentages) read as *speculation* —
  betting-adjacent, a bad neighbour for the memorial register.
- Market charts need continuous volume; a typical favpoll has tens of
  pledges, so an amount-over-time line is flat-with-cliffs — it *reveals
  thinness*. And on quiet polls, each step's height leaks the individual
  pledge amount, colliding with the amounts-private default in §2.

Why the bump-chart form works:

- Rank positions over time is literally the story ("5th → 1st"), hides
  amounts entirely (ordinal only), stays honest at low volume, and reads
  as narrative — "the story of the poll" — styled in the purple ramp with
  human annotations ("Purple took the lead", "poll closed").

Two surfaces, in priority order:

1. **Post-close keepsake** — "the story of the day" chart; pure honour
   value; strengthens the paid print version.
2. **Topic/record pages** — "Blue has led since March; Purple closing"
   gives the record the followable, come-back-and-check quality central
   to the record-becomes-the-homepage vision. (The checking habit is the
   genuinely Polymarket-like thing worth borrowing — not the aesthetic.)

Cost of deferral: **zero** — pledges and allocations are already
timestamped, so full rank history is derivable retroactively; no snapshot
table needed yet. Gate charts on a minimum pledge count (same philosophy
as the record threshold) so sparse polls don't show sparse charts.

---

## Additional ideas, by pillar

### Honour

- **Post-close keepsake** — free PDF of the final rankings, reveal,
  messages and total; **paid print version** (feeds the stationery
  direction).
- **Anniversary re-opening** — memorial favpolls reopen a year on
  ("light a candle"): re-engagement plus more giving.
- Photo memories attached to pledges (moderated).

### Charity

- **Impact statements** at pledge time, admin-curated per charity
  ("£20 funds an hour of nursing care") — conversion gold.
- **Public charity pages** (`/charities/[id]`): total raised via favpoll,
  live favpolls supporting them — charities then market favpoll for you.
- **Gift Aid** — the single biggest UK lever: +25% on eligible donations
  at zero donor cost. Complex to operationalise; platforms routinely take
  a small handling percentage. Long lead time → start early.

### Love (the record)

- **Record methodology page** (pairs with the outlier cap).
- Shareable "record movement" cards for social.
- Per-favourite detail pages (Purple's page: total raised, top charities,
  consented reveal quotes).

### Revenue beyond the 5%

1. Core compounding: goals + impact statements + guest walls lift totals →
   lift the fee.
2. Print/keepsake products (per the stationery direction already in
   PROJECT.md).
3. **B2B partner tier for funeral directors and celebrants** — white-label
   live display, printed QR packs, simple dashboard. They pay for
   differentiation, they're the distribution channel, and it compounds
   with the "in lieu of flowers" stationery insight. *Strongest near-term
   revenue line beyond the fee.*
4. Gift Aid handling percentage.
5. Charity partnership tier (careful with donor-data ethics).

**Not recommended:** ads, selling data, pay-to-unlock for guests (breaks
the gift framing).

---

## Suggested prioritisation

| Horizon | Items |
| --- | --- |
| Quick wins | Pledge goals · `/live` rename + full realtime · Charity Commission verification |
| Medium build, highest brand value | Guest wall + the anonymity model above · rank-over-time bump chart (build with the keepsake; zero cost to defer — history already captured) |
| Strategic investigations (long lead — start early) | Gift Aid · open charity register via PayPal Giving Fund / Stripe Connect · B2B partner tier |

**Decisions proposed here, pending founder sign-off:** the anonymity model
(§2), no pledger rewards (§5).

**Decided (founder, 2026-07-04):** §4 — no record caps or damping ever;
breadth visibility (distinct-pledger counts) + methodology transparency
instead; manipulation handled via terms of service.
