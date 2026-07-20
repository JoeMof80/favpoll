# Session handoff — 2026-07-20

For the next Fable session. State at close: **clean** — `main` at `ec3c40f`
(#303), all tests green (1086 web), no open PRs, nothing uncommitted.

Covers PRs **#248–#303** (55 merges since the 2026-07-10 handoff). Grouped by
theme, not chronology. §6 (the security arc) was the closing day's work.

---

## 1. The landing reached its current form

The page now reads: purple hero → How It Works (tint) → custom-topic vignette
(white) → Watch-it-live room (tint) → **the record vignette (white)** → live
shelf (`bg-muted`) → purple closer.

- **Hero** (#252, #271, #275, #285, #287): one fixed triad headline —
  "Pick your favourite. Pledge its worth. Reveal its standing."
  (`landing.headline`); eyebrow retired; kind chips are single nouns
  (Memorial · Celebration · Fundraiser · Cause); one demo scene per kind. On
  mobile the whole hero is one centred block (container-width constraint, not
  per-element), demo before stats.
- **The vignette cast** was deliberately recast for age/register balance
  (#289, #290): the Watch room is now **Jess's 30th** (dog-mad birthday —
  Favourite Dog Breed, Dogs Trust; the About page's canonical exemplar); the
  custom-topic dialogs type **"Favourite Grandad story"** ("The wheelbarrow
  incident" · "The time he met Elvis" · "The allotment feud"). Cast now runs
  Poppy (16) → Jess (30) → Marcus (mid-life) → Belinda (memorial) + Grandad
  (old subject, young tellers). Meeting-room exemplar retired as
  corporate-cold.
- **The record vignette** (#250 → #297 → #298): the record first receded to a
  principle line (#250), then grew into the landing's fourth scripted
  illustration — a tight pile of six favpoll cards (each with its own local
  ranking; Shortbread leads the wedding, Party Ring leads Rosa's 50th) around
  one record card, all "Favourite Biscuit". Pledges land one per card; the +£
  pill appears on the favpoll's item AND the record's same item; both bar
  fills pulse in primary while both cards glow (synced "energising" effect);
  pledge four tips Jaffa Cake past Custard Cream and the record re-ranks
  live. Arithmetic discipline: every record movement equals a visible pledge.
  Copy (#298): "Every pledge makes an eternal mark by feeding the record —
  all-time rankings for favpoll topics." with a quiet uppercase **Coming
  soon** (no link; key `landing.record.status`). Header/footer still link
  `/record` — known tension, undecided.
- **The shelf convention** (#291): real favpoll cards always sit on the brand
  pastel — the landing live section joined `/favpolls` (`bg-muted`); watch
  room's floor gradient kept `from-primary/10` after a dissolve experiment
  left the phone "stranded" (reverted); the record section is the white
  breath between room and shelf.
- **Watch room mechanics** (#284, #287): fixed `w-80` display, stacked
  telethon lines so the frame never resizes (constant 270px), perspective
  deepened to `perspective(900px) rotateY(-20deg)`, topic heading on bars.
- Mobile menu (#286): dropdown under the header (logo + hamburger stay), blur
  scrim, theme switch + Clerk account rows (`openUserProfile`/`signOut`);
  avatar desktop-only.

## 2. Cards + the money/standings model (the week's big correctness arc)

#292–#295 untangled a three-layer confusion; the settled doctrine is in
`references/GLOSSARY.md` (new entries) and the auto-memory:

- **Poll surfaces show THIS poll's pledge sums.** `lib/poll-standings.ts`
  overlays per-poll sums/counts onto items' `all_time_*` fields on the poll
  page, `/live/[slug]`, the `/favpolls` unlocked-card prefetch, and
  `/api/polls/[id]/results`. Bars must sum to the favpoll's raised figure
  (the demo card and Watch room teach this). Record numbers appear ONLY on
  `/record` and topic pages.
- **`favpolls.total_raised` is a settlement figure** (close cron only).
  Live surfaces overlay real sums via the `favpoll_live_totals(uuid[])` RPC
  (migration `20260719120000`, service-role-only, `charity_stats` idiom)
  through `lib/live-totals.ts` — /favpolls cards, landing carousel, and the
  hero's "raised by open favpolls" stat.
- **List card** (#292–#294): eyebrow derived via shared
  `lib/favpoll-eyebrow.ts` (cause → "For a cause" → category → opening
  line); pledge dialog controlled so the topic banner AND a full-area lock
  button open it; stretched-link makes the whole card navigate (poll body
  excepted); hover unified with the summary card (lift + shadow);
  protagonist photos flow through both cards; value row under the header
  ("£X raised" / "Be the first to pledge" + `ClosingLabel` countdown).
- Dark-mode pill fix (#288): never `text-white` on `bg-primary` — use
  `text-primary-foreground` (dark mode flips `--primary` to near-white).

## 3. Wizard / cause path (#254–#257)

The honour step forks: a cause favpoll needs no type; type row stays live on
the cause path; cause rows carry `category=null` and `deriveRegister` is
subject-first; covered by a cause wizard→publish e2e spec that ASSERTS the
cause favpoll is listed (inverse of the memorial spec).

## 4. Infra / dev / e2e

- **E2E débris handling** (#296 + one-off cleanup): a Playwright
  `globalTeardown` unlists every E2E-named favpoll after each run (unlist,
  not delete — the wizard specs assert listing behaviour mid-run). A one-off
  SQL cleanup on 2026-07-19 deleted 218 historical E2E favpolls (311
  pledges, 113 protagonists) before a reseed. The seed writes some pledges
  under the founder's dev Clerk user — ~18 cards render unlocked for them.
- Dev tunnels: `allowedDevOrigins` for pinggy/ngrok (#283) after the Next
  16.2.10 upgrade (#267) enabled cross-origin HMR blocking. Dev heap at 8GB
  (#266); React deduped via pnpm catalog (#249). The founder's dev server
  still degrades over long sessions — warm with curl, never restart it
  yourself.
- Seed (#273): ten new topics, Car canon, canonicality doctrine (in the seed
  skill).

## 5. About / chrome / misc

About page definition + FAQ (#274, #281 — native `<details>`, two-column);
site chrome tidy (#264: The record in the header, footer sitemap); footer
social row (#263); my-favpolls expandable rows (#269) + shared
filtering/sorting (#270); QR centre logo as bare canonical mark (#265);
theme-toggle hydration fix (#251).

## In Joe's court

- **Goodstack**: Leo Chandler + Elani Buchan messaged (LinkedIn), no reply as
  of 2026-07-19; Josh Radford email drafted
  (`references/disbursement-enquiries-2026-07.md`) — plan was schedule-send
  Monday ~9:30; chase trigger ~24 July if silent.
- Real-device pass over the new mobile hero/menu.
- Decide: hide header/footer `/record` links while the landing says Coming
  soon?

## Parked (code)

- Featured tiles on /favpolls (wider closing-soon/top-raised cards) — judge
  against real photo'd data first.
- Landing copy sweep into `t()` / per-market exemplar packs (see
  `references/LOCALISATION.md` — current and consistent).
- Single-charity duplication on cards (value row total = footer share) — one
  card in view will show it; drop footer amount if it grates.
- Pledge-step "worth" framing; close-favpoll from edit; tip collection
  post-ledger; /favpolls pagination past 60.

## 6. The security arc (2026-07-20, PRs #300–#303)

Three parallel architecture surveys (condensed in
`references/audits/architecture-survey-2026-07-20.md`) found the Tier-1
money/trust holes; all three were fixed the same day:

- **#301 — payment verification.** There was NO Stripe webhook and payment
  truth was client-side: the pledge actions recorded whatever the client
  claimed. Now /api/stripe/payment-intent computes the charge server-side
  from parts (pledge + tip + top-up) and stamps them into PI metadata;
  `lib/stripe-verify` retrieves the PI at save time (succeeded, GBP,
  poll-bound, amounts equal); `pledges.payment_intent_id` + partial unique
  index make each payment recordable exactly once (migration
  `20260720120000`). All three client flows thread the PI id. Proven with a
  real Stripe test payment (reveal-after-pledge E2E) and the recorded
  pledge's `pi_…` id in the DB.
- **#302 — results API gate.** /api/polls/[id]/results now enforces the
  reveal route's exact entitlement (closed public; open requires a
  non-withdrawn pledge via cookie auth or guest token — the card threads
  the token). Anonymous curl of an open poll → 403, live-verified.
- **#303 — atomic, verified fund money.** `pot_topups` mini-ledger (unique
  payment_intent_id; seed of the eventual transactions ledger) +
  `pot_top_up`/`pot_allocate`/`pot_deallocate` RPCs (migration
  `20260720140000`); `verifyTopUpPayment` gates both top-up flows (for
  guests the verified payment IS the authorisation); `pledgeFromFund` no
  longer trusts a client-supplied allocated figure and cannot oversell the
  fund. `rpc()` support added to the shared supabase test mock.
- **#300** — the founder's `h-174` hero tweak, committed at last.

**Deliberate follow-ups (not yet built):** webhook reconciliation for the
charged-but-unrecorded window; the close-cron's non-atomic close→disburse;
the survey's Tier-2 bugs (live display's infinite-topic item source,
poll-standings 1,000-row truncation risk, sequential poll-page queries) and
the Tier-3 hygiene sweeps. All catalogued in the audit doc.

Also fixed this day (not favpoll code): the founder's recurring macOS
keychain prompt — Xcode's system gitconfig forced the osxkeychain helper;
now reset in ~/.gitconfig with `gh auth setup-git` serving credentials.
