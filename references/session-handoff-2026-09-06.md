# Session handoff — 2026-09-06 (the small hours)

The appeals surfaces took their final shape, the charity/appeal/favpoll
page family unified under one grammar, and a settings audit closed
three real integrity holes. #717–#730 ALL MERGED (#729 landed last, bbae9aa).

## Merged to main (by arc)

1. **Appeal surfaces neutral (#717)** — appeal page + form off the
   fundraiser palette; PALETTE DOCTRINE settled: registers belong to
   OCCASIONS — charity/appeal surfaces are brand-neutral, register
   colours live on the member/favpoll cards. Same PR: the appeal form
   rebuilt in the wizard Info-step grammar with the REAL wizard
   controls (HeroPhotoOverlay + uploadPersonPhoto on submit,
   DateTimePicker + clear-to-evergreen link, in-field CharCounters).
2. **The page family unified (#718–#721)** — charity + appeal pages
   moved onto the favpoll page's own bones: first the extracted sheet,
   then PageLayout itself (a `rightSticky={false}` prop added) with
   the hero's exact text classes — slot mapping on charity: eyebrow
   "Charity" / name / reg-number as the Context line / description in
   the About's voice; on appeal: "An appeal for {charity}" / name /
   close date as Context / blurb as About. Facts card = avatar-height
   (md:h-33) rail card, in-flow on mobile. Appeals + shelf on
   full-width 3-up rows below the header columns; dashed create-door
   tiles lead both grids (primary-fill audition REVERTED — founder
   preferred dashed); site footer removed from /charities; appeal
   members render as FavpollSummaryCards, alphabetical, no money on
   cards (not-a-leaderboard doctrine); PageSheet deleted after one PR
   of life.
3. **Topic-row bug (#720)** — favpoll_polls is a TO-ONE join:
   PostgREST returns an OBJECT; indexing [0] silently nulled the
   topic and cards hid their PollHeading row. Probed against staging.
   BIT TWICE this session — mapping now guards both shapes.
4. **Appeal cards in the favpoll card grammar (#726)** — APPEAL
   eyebrow (neutral ink beside register-coloured occasion eyebrows),
   three bordered rows: name header / count + ClosingLabel /
   right-aligned £ footer; blurb dropped (cards are identity, not
   story). Iterated live with the founder through footer-pinning and
   row-splitting; flex-col + flex-1 header absorbs grid stretch.
5. **Wizard lock parity (#722, #724)** — locked steps show their REAL
   UI: charity card with lock icon + reason ("Locked — part of
   {appeal}." / "Locked — guests have already pledged."), Event cards
   disabled with reason beneath, Topic card with lock + quieted add
   affordances. "part of" won over "set by" for charity (membership
   brings it); close date keeps "set by" (earned). Founder asked
   about an alert-style reason — advised against (locks aren't
   alerts; proximity beats prominence); one-time wizard-level notice
   offered as the visibility lever if wanted.
6. **Validation + audit hardening (#723, #725)** — the nameless
   favpoll bug: appeal seeds mark Details railDone at birth, rail
   forward-jumps allowed landing past unfilled steps, and Publish
   only checked the current step. Fixed at three layers (whole-form
   handleFinish validation with jump-to-first-gap, every-step-done
   rail jumps, server name guards). Then the settings audit closed:
   closed favpolls refuse ALL edits (updateFavpoll + updateClosesAt +
   edit-page redirect to manage); close-date SHORTENING refused once
   money moved; subject/grouping joined the money-moved lock (who
   dropdown goes pronoun-only client-side — misgendering stays
   fixable). The nameless test favpoll deleted from staging via the
   app's own delete order.
7. **Mobile favpoll page (#727, #728, #730)** — standings vanish
   behind an opaque Amount/Pledges shelf (ribbon's panel idiom,
   -top-12 seal; z-10 NOT z-20 — first attempt painted over the topic
   header); the organiser FAB retargeted at MANAGE (Settings2, shows
   on closed favpolls too — keepsake home); About line-clamp-4
   removed from both heroes (fixed-height-era relic); the mobile
   charity footer gained the "Part of {appeal}" strip — the rail's
   line had NO mobile surface (the pledge-goal hole class).
8. **Settings step labels (#729, landing)** — the four hand-rolled
   rows became real WizardFields (inline labels sat flush on mobile);
   hints through the hint prop, pt-3 ≡ the old items-center math.

## Decisions & doctrine established

- Palette: occasions get registers; organisations/drives are neutral.
- Charity/appeal pages are PRODUCT surfaces (favpoll grammar, no
  marketing footer, no close bands, no carousels — "inventory, not
  showcase"), and appeal creation stays a PAGE, not tabs (founder
  accepted grid/no-tabs/no-carousel pushback).
- Appeal shelf policy PINNED deliberately: the charity shelf includes
  appeal members iff LISTED; unlisted members route via the appeal
  card. Changing that means changing the member visibility default,
  not a shelf exception.
- Appeal members may be ANY event type — the seed touches only
  charity, close date, visibility default.
- Appeal cards vs favpoll cards confusion risk assessed: fine while
  appeals only appear under their own section header; revisit with a
  stronger differentiator if they ever hit mixed listings.
- FAB cluster stays unconsolidated (Share is the 5x lever, guests max
  at two circles; pledge-again is a GUEST action — founder corrected
  my sorting).

## State of the world

- main = bbae9aa (#729, the last of the session); ZERO open PRs;
  tree clean; serve on main. Watcher discipline held all session (one race: #719 merged
  under a late push — cherry-pick re-land as #720; racing PRs need
  gh pr update-branch, twice for #729).
- Memories updated: appeals-concept (design settlement + to-one
  gotcha), organizer-console-hub (manage FAB), legal/hero/register
  unchanged.
- Staging: nameless favpoll deleted; midnight-walk appeal healthy
  (1 member, Marcus Bell).

## Deferred / founder-side

- ONE SERVE RESTART still owed for APPEALS_ADMIN_USER_IDS (the env
  glue repair) — without it the founder sees no Create-appeal door or
  Manage buttons. Same var still to add to favpoll-web on Vercel.
- Production appeals DDL at the launch flip (in the migration file).
- updateClosesAt is a DEAD EXPORT (no callers — in-place edit relic),
  now guarded anyway; delete when convenient.
- Pre-existing: "Poll closed" cards sitting on the OPEN shelf
  (closes_at passed, closed_at not yet stamped between cron runs) —
  flagged, not chased.
- Parked from earlier sessions: regulator/qLegal replies, charity
  portal trigger (first claim-mailto answer), stationery/print
  roadmap, my-copy items awaiting founder polish.

## Gotchas earned

- favpoll_polls is a TO-ONE join (object, not array) — bit twice.
- python-in-zsh-heredoc STILL doesn't abort the chain on assert
  death (empty branch + failed PR create this session). Remedy that
  worked: grep-guard the edit landed (`grep -q || exit 1`) between
  python and the git steps.
- Equal z-index sticky boxes: the LATER one in the DOM paints on
  top — an upward-extended backdrop needs the lower layer (z-10).
- `a[href^='/favpolls/']` matches the create door — scope or filter
  /favpolls/new (bit again).
- Playwright is signed-out: wizard/locked-state/post-pledge views
  need a closed favpoll (tabs render for everyone) or the founder's
  eyes.
