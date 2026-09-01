# Session handoff — 2026-09-01

The shop-window day: one overnight session, thirty-three PRs
(#607–#639), every one verified live against the dev server before its
merge. The arc started with "is /favpolls a bit pointless?" and ended
with the founder's answer built: it is a SHOP WINDOW, and the list card
is now a flip card — story front, mechanic back — calibrated through
roughly ten founder rounds. Around that arc: the colour rollout
finished, the keepsake grew its first stationery-roadmap feature, and
the wizard took a day of polish.

## Merged to main (grouped, in order)

1. **#607–#610 — cards wear their register; Mary Whitfield.** List and
   summary cards set `data-register` via `paletteForFavpoll`
   (charity-page select gained `category`); charity dialog pills sized
   to match the topic dialog; the date picker fills its row, presets
   keep the calendar open and navigate the month; the memorial ghost
   renamed Margaret→Mary Whitfield.
2. **#611–#615 — the hero quietens.** #611 hit the DEMO card by mistake
   and was reverted inside #612: the ROUTER cards brand only the title
   line and ranking bars (body/footer neutral in light; dark untouched —
   its near-white card needs the ink scheme). #613: bar text no longer
   matches the bars (the rankings column re-points --primary-foreground
   to neutral in light). #614: topic headers break after "Favourite" on
   all three cards, quieter first line; charity avatar in the footer.
   #615: favpoll card eyebrows wear register ink — the shelf cards were
   scoped but visually monochrome.
3. **#616 — colour rollout COMPLETE.** "Goal reached" said in words
   (charity banner + mobile footer captions); OG share cards per
   register (`OG_PALETTES`, hexes computed from the generator's own
   oklch→sRGB recipe — the old mirrors were still pre-rebrand purple);
   email links → `#0058A8`.
4. **#617 — keepsake: export image, reached goal, pinwheel corners.**
   `html-to-image` snapshots the rendered sheet at 2× (the download IS
   the on-screen certificate; filename shares the CSV slug). A reached
   goal prints (fundraiser: its own line; tribute: a clause in the one
   money sentence; unmet goals print NOTHING — a finished sheet must
   not read as a shortfall). Corners rotate TR 90°/BR 180°/BL 270° in
   square 20×20 boxes; every side's frame rules re-derived to continue
   the adjacent glyph's poll lines (long 10px in, short 14px, 22/26 end
   insets) — verified with 3× corner screenshots.
5. **#618–#620 — singular labels; wizard photo UI.** Hero card titles
   and register-page metadata went singular (header went in #603; "For
   memorials" prose stays). The photo button IS the avatar (rounded-xl,
   outline hover only); the crop overlay's picker is the image itself
   ("Tap the photo to choose an image"), re-pick under the zoom slider
   while cropping.
6. **#621–#625 — the shelf teaches, then flips.** #621: compact
   `LockCardContent` on the shelf cards (a `compact` prop on the shared
   component; content-free reveal flags derived server-side —
   `personal_reveal` joins the /favpolls select and is STRIPPED before
   the client). #622: the flip card v1. #623: v2 — body-only flip,
   avatar right, lock-pill affordance. #624: v3 — step dots + named
   actions. #625: the about wraps the avatar, header thumb retired.
7. **#626–#629 — the Favourite eyebrow, calibrated.** PollHeading
   splits "Favourite" onto its own line on every surface, deleting the
   three-step shrink-and-truncate table. Same-size + opacity (#626) →
   smaller full-ink (#627) → reverted to same-size + opacity (#629,
   recorded in the component comment: don't re-litigate without a
   screenshot). #628 gave the summary cards the same heading.
8. **#630–#632 — the step row settles.** Entitled cards flip too
   (standings are the back body and the DEFAULT face; "Back to the
   story" survives pledging); hidden faces need pointer-events-none AS
   WELL AS inert (inert discards clicks rather than passing them
   through — found via Playwright's interception log); closing label
   top-aligned to the eyebrow. #631's gift-in-the-countdown-slot lost
   to #632: links or nothing — "Pledge ›" forward, "‹ Story" back,
   gift beside it on step 2 only, dots and inert labels retired.
9. **#633 — Visibility = SegmentedControl** (the /favpolls STATUS
   filter's own component; the founder pointed at it not knowing it was
   ours). Earlier in the arc the wizard's three-notch visibility
   (Listed · Link only · Private) became the first UI able to set
   `is_private`.
10. **#634–#638 — the height saga.** Clamp-6 + standings fill →
    fill uncapped blew up on a 40-favourite poll (grid items' auto
    min-height is their CONTENT) → max-h cap → heights still varied →
    the founder's optimum: FIXED h-52 body (tallest teaching card
    measured 147px + breath) with ABSOLUTE faces so content can never
    size the card; the about SCROLLS (clamp retired at 4, 6 and 10
    lines — all lost); standings fill flush (legacy pt dropped). Every
    card uniform — measured 375px across the grid.
11. **#639 — the Safari flip fix.** iOS Safari showed the hidden
    face's link mirrored through the visible one; Playwright's WebKit
    blended whole faces. WebKit does not reliably honour
    backface-visibility: the hidden face now ALSO fades to opacity-0,
    delayed to the rotation's midpoint (edge-on, nothing readable).
    Confirmed fixed on the founder's iPhone.

## State of the world

- main = this handoff's parent; tree clean; every PR merged with all
  checks green (two advisory-e2e flakes re-run: auth-setup timeout +
  `reveal-after-pledge.spec.ts`, both staging-side, neither related to
  the diffs under test).
- PROJECT.md updated: 2026-09-01 revision block, flip-card and
  PollHeading directory entries, goal-reached and colour-rollout items
  resolved, wizard route entry renamed Header/Settings.
- Auto-memory: `project_favpolls_card_flip.md` (the settled design,
  the REJECTED affordances list, the WebKit lesson); the three
  superseded wizard memories pruned.
- **Dev server**: background instances from this session die with it —
  restart `pnpm dev` from apps/web. `pnpm install` mid-session wiped
  node_modules under the running server once (hoist-pattern change);
  a wedged old server needed `kill` before a fresh one would bind.
- Playwright **webkit** is now installed — use it for any flip/3D
  verification; chromium hides the backface bugs.

## Gotchas earned

- **inert ≠ pass-through**: an inert element still swallows clicks.
  Overlapping faces need `pointer-events-none` on the hidden one, and
  a transformed sibling traps its z-index in its own stacking context.
- **Grid-stacked faces size their row by content** (auto min-height =
  min-content). Fixed-height container + absolute faces is the only
  arrangement where content truly cannot size the card.
- **WebKit + backface-visibility is not a contract.** Opacity-swap at
  the flip midpoint is the reliable idiom; keep backface as
  enhancement.
- **line-clamp coexists with an exterior float** (the -webkit-box does
  respect the avatar's float) — verified live before relying on it,
  and then retired anyway for scroll.
- **prettier/tsc/vitest must run from apps/web** — the session cwd
  kept resetting to the repo root after `git checkout` chains and
  `pnpm exec` then fails with "command not found" (root has no dev
  deps). Also: piping `gh pr checks --watch` into `tail` eats its exit
  code — #607 merged with a red Format check that way; write
  `--watch >/dev/null && merge` instead.
- **Satori hexes**: `lib/og/palette.ts` values are computed from
  `generate-register-tokens.mjs`'s PALETTES + the same oklch→sRGB
  maths (a scratch script; re-run it if a palette is re-tuned).

## Deferred / worth a look

- **Staging's close cron has never run**: every "closed" favpoll has
  `closed_at: null`, so the Closed filter shows cards that present as
  open, and keepsakes only exist for the three genuinely-closed rows.
- **Organizer-row's Listed toggle** still speaks the old two-state
  language; the wizard now has three notches (is_private). Align when
  next in there.
- **The entitled front face's "Standings ›" label** was never
  founder-reviewed with real pledged data (staging can't show it to an
  anonymous browser) — check it on a pledged card.
- **favpoll.com serves a static holding page from 11 Aug** — the real
  app is not deployed to the apex; noticed while chasing a phantom.
- **Keepsake arc continues**: export images shipped; next per the
  stationery roadmap are plain A4 templates, then Avery-matched.
