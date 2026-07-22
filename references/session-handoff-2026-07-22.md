# Session handoff — 2026-07-22

For the next Fable session. State at close: **clean** — `main` at #335,
suite 1,113 green, no open PRs, nothing uncommitted. Continues
`session-handoff-2026-07-21.md` (+ its addendum), which covers #304–#324.

Covers PRs **#325–#335** — a design-language day plus the first editorial
review since Fable. Everything screenshot- or DOM-verified before merge.

---

## 1. The list-page design language (#325–#328, #332, #335)

The filter/sort subheader (record, /favpolls, my-favpolls) was rebuilt
around the **topic-select dialog's vocabulary** — founder-driven,
iterated live over four PRs:

- **Band**: white slab → `bg-muted/85 backdrop-blur` (the mobile-menu
  scrim idiom); **search first**, controls second, chips rail last (the
  dialog's hierarchy). Rhythm pt-3/pb-2.5/pb-3.
- **DOCTRINE (worth keeping)**: **solid purple = chips that act**
  (pledge, demo); **soft purple = view filters**
  (`border-primary bg-primary/5 text-primary`, the dialog's exact
  selected state). The black `bg-foreground` toggle (pre-token-pass) is
  dead. Idle pills/inputs went `bg-background` — they vanish on the
  muted band otherwise.
- Eyebrows: desktop-only FILTERS (rail) / STATUS (segments) / SORT,
  `tracking-widest` uppercase. Sort stays a **native select**
  (iOS wheel + free a11y) with an `appearance-none` + chevron trigger;
  pills are the fallback if the founder still dislikes it.
- Sort tabs read **Amount | Pledges** (#325 — icons considered and
  rejected: the tabs teach that bars are pounds).
- `PollHeading`'s card ribbon truncates (shadcn button base is
  `whitespace-nowrap`; long topics like "Favourite Regional or dialect
  word" overflowed both card edges).
- Topic page's bare back arrow → labelled "← Back to the record"
  (the keepsake's idiom) (#332).
- **Pointer cursor restored** (#335): Tailwind v4 removed v3's
  `cursor:pointer` on buttons; links kept theirs, so buttons read as
  not-clickable. One **unlayered** rule in globals.css — the layered
  version got swallowed (gotcha: unlayered author CSS beats all layers;
  use it for must-win affordance rules).

## 2. Record cards + money display (#329, #333)

- Record TopicCards hover like favpoll cards (border-strong + shadow +
  lift, **no bg tint**); the leading favourite gets quiet prominence —
  medium label, full-ink amount — via an opt-in `emphasis` prop on
  RankingBar (default off; no other surface changes).
- **Pence padding** (#333): whole amounts stay "£1,300"; anything
  fractional pads to two digits ("£92.50", never "£92.5") across
  formatPounds / formatPoundsCompact / formatCurrency. Deliberate
  exception: abbreviated forms ("£3.7k", "£1.2K") keep one decimal —
  they're idioms, not exact money.

## 3. Editorial — first category/topic review since Fable (#330, #331)

- **Animals** category split out of Nature (9 creature topics — the
  highest-sentiment territory was hiding behind Weather and Tree);
  **Literature → Books & Arts** (it already held Famous painting,
  Painter or artist, Play); a stray active topic titled **"Things"**
  (test debris, browsable on prod) deactivated. Rail: 10 → 11 chips.
  **Seed gotcha**: categories match by label with insert-if-missing —
  renames must UPDATE the DB row first or the seed inserts a duplicate;
  the seed never deletes stale topic_categories links (sweep by SQL).
- **Seven Tier-1 topics** (#331), canon 128 → **135**: Sound (26) ·
  Name for a grandparent (20) · **Beatle (finite, 4)** · **James Bond
  (finite, 6 Eon actors)** · Soap (18, The Archers included) ·
  Fairground ride (16) · Curry (24). Placeholders in
  `scripts/placeholders-regenerated-8.ts` (five registers, persona-
  varied, IP reveals persona-relationship only); all 35 reveals
  programmatically verified against lint-topics' matching rules.
  **Tier-2 parked list** (pre-vetted, build on demand): Soup · Pub game
  · First dance song · **Doctor Who** (completes the finite-icons trio)
  · Ice lolly · Train journey · Lucky number.

## 4. The scale-seed testbed's third catch (#334)

The Actor bump chart (40 canon items, all pledged by the seed) rendered
a ~2,000px SVG that burst its dialog. Chart now caps at **top 15 by
final standing** (dips clamp to a floor row; caption appends "Top 15
shown."), wider label gutter, dialog got defensive max-h + scroll.
Running tally for the seeded cohort: URL explosion, missing FK indexes,
chart blowout — **three real bugs**. Recommendation drifting toward
KEEP as a standing testbed rather than wipe.

## 5. Operational notes

- The founder's dev server (up since Sunday) wedged twice; SIGTERM was
  ignored, needed SIGKILL + fresh start (now running detached via
  nohup — his original terminal command is dead).
- Playwright screenshot loops against the dev server: warm the pages
  with curl first; `networkidle` never settles on polling pages — use
  `domcontentloaded` + settle timeout.

## 6. Unchanged since the last handoff

Leo Chandler DM is the live Goodstack thread (Gift Aid question
deployed); Josh chase ~27 July only if Leo stays silent. Launch flip =
§1b (now incl. 4b wallet re-registration). Close-cron first-sweep and
Clerk webhook URL checks still unverified. Hooks-warning debt 28.
