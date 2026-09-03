# Session handoff — 2026-09-03

The organiser-console marathon: /my-favpolls became a scannable console,
a manage hub became the organiser's ONE door to everything, guest
additions joined the wizard, the toolbars took the register wash, and
/features settled into stills of real components. Thirty-odd PRs
(#645–#682) merged across the run; the legal track advanced in
parallel (qLegal application sent, Fundraising Regulator enquiry
drafted and ready).

## Merged to main (by arc)

1. **Flip cards & pledge dialog (#645–#650)** — whole card clickable
   except buttons; pledged → standings default; portal-bubbling
   outside-click fix (`!e.currentTarget.contains(e.target)`); header
   chevron gone; pledge dialog themed per favpoll (ResponsiveOverlay
   `dataRegister`); Listed switch out of the seed-fund modal.
2. **The wizard rail settled (#657–#673)** — after many auditions: the
   favpoll at a glance as a series of lists; station icon-buttons on one
   measured primary hairline; uniform slots with min-h-5 floors (the
   no-shift invariant); mobile strip mirrors it; close date mandatory;
   stations aligned to the logo glyph. Doctrine lives in
   `wizard-step-rail.tsx` comments + auto-memory.
3. **Form standard & generate split (#664–#665, #669–#670)** — 44px
   controls (`h-11 md:text-base`) across form surfaces (toolbars
   exempt); who/pronoun menu became the `[▾who | ✦ Generate]` split
   button; exemplar-name ghosts; visibility-once-seen on the rail.
4. **How-It-Works triad (#676)** — headers above columns, founder copy
   verbatim, pill counts balanced (13 memorial / 11 celebration).
5. **Organiser console + manage hub (#677, #678)** — ConsoleRow rows
   (identity triple `name · topic · charity`, no pledge count) open
   `/favpolls/[id]/manage`: the complete record in the favpoll's own
   anatomy (Header/Story/Topic cards, one Edit door) plus the operation
   (Charities, Money, wall — un-nested, it draws its own card) under a
   ToolbarBand carrying visibility (3-way, new `setFavpollVisibility`),
   guest-additions switch, fused View|Edit|Delete ButtonGroup (new
   `components/ui/button-group.tsx`), Stationery (renamed from pack),
   Keepsake, and Share as a 220px popover (QR 180 over de-schemed
   links). #678 follow-ups: `lib/organizer-favpolls.ts` is the ONE
   column list + base mapper for both surfaces; the old OrganizerRow
   accordion and `setFavpollListed` are deleted.
6. **Guest additions in the wizard** — Details-step Switch (default on)
   plumbed `allowGuestItems` through `CanvasSubmitData` → create/update;
   rail line "Guest additions on/off" behind the seen-or-touched gate;
   STEP_SLOTS 3 → 4. Manage toolbar stays the mid-event override.
7. **Register theming sweep** — ToolbarBand = bg-primary/20 wash over
   bg-background (sticky needs the opaque base); stationery select
   gained category/grouping; **keepsake had a real bug**: it called
   `deriveRegister(occasion_type, name, subject)` against the
   `(category, grouping, subject)` signature — every person favpoll
   derived as celebrating_many (wrong palette AND memorials opened as
   fundraiser, not tribute). Stationery/keepsake back links → Manage;
   the live display's menu item → "Manage favpoll".
8. **Edit-prefill topic rescue** — legacy homemade topics can sit
   `is_active=false`; getWizardData filters those, so the Topic step
   showed "—". The edit page now fetches the poll's own topic directly
   when the wizard list lacks it (save-safe: unchanged id no-ops).
9. **Features stills (#679–#682)** — every artefact de-animated:
   completed topic dialog (`still`), screen-in-a-room display
   (`still room`), fund dialog filled at £25 with the preset selected,
   and the reveal settled on the register pages' magnified phone
   (`RevealVignettePhone` reused verbatim; six candidates auditioned on
   a throwaway /dev-reveal page — pair, locked-phone, card arcs, real
   lock surface, two hybrids — simplicity won). Vignette lost its
   visible chrome (border/tint/radius/overflow-hidden) keeping width +
   inert + the e2e hook; /features clips sideways bleed at the viewport
   (`overflow-x-clip` — the advisory e2e caught TvFrame's atmosphere
   reaching scrollWidth at 320px, verified fixed locally).

## Legal track (no code)

- **qLegal application SENT** (founder, 2026-09-02) — as-sent record in
  `references/qlegal-application-SENT-2026-09-02.md`; reply awaited.
- **Fundraising Regulator registration enquiry** drafted into Apple
  Mail, ready to send (`references/fundraising-regulator-registration-
enquiry-DRAFT.md`, v2 — the 12-month operating-record question;
  recipient registration@fundraisingregulator.org.uk). Oliver's
  voicemail digested: PF/CP needs legal advice; Code 6.2.1 expects
  written agreements; non-charity registration possible.

## State of the world

- main = `190f035` + this handoff; working tree clean, serve on main.
  All required checks green on every merge.
- Auto-memory current: `project_organizer_console_hub` (new),
  `project_wizard_rail_doctrine` (STEP_SLOTS=4, guest-additions line),
  `project_fundraising_regulator`.
- Merge workflow that finally stuck: settle-then-judge background
  watcher (wait until NO pending, then evaluate fails, then
  `gh pr merge --squash`) + `gh pr update-branch` when behind. Repo
  disallows `--auto`.

## Deferred / worth a look

- **Send the regulator email** (sitting in Apple Mail); chase qLegal if
  quiet; solicitor PF/CP advice is the follow-on.
- Vignette inner `px-6 py-10` is now invisible spacing — the one knob
  if /features sections feel airy or artefacts oddly indented.
- Live display's menu → manage is owner-gated: a non-owner presenter
  bounces to /my-favpolls. Fine for the organiser; revisit if venue AV
  staff become a real operator.
- ConsoleRow's `NEXT_PUBLIC_BASE_URL || window.location.origin` pattern
  is safe there (handler-only) but is the same shape that caused the
  manage hydration bug — resolve origins in effects if it ever renders.
- Manage page DRAFT-era ideas parked: activity feed, standings in the
  hub, duplicate-as-template for B2B.
- #677's squash commit kept the old "DRAFT —" title (retitle raced the
  merge queue) — cosmetic history blemish only.

## Gotchas earned today

- **zsh heredoc python is not atomic**: a SyntaxError mid-script leaves
  `set -e` unbothered and the chain marches on (one commit attempt ran
  on an unedited tree). Anchors go stale after prettier. The remedy that
  stuck: assert-guarded replaces, and Read + Edit-tool for anything
  delicate.
- **Advisory e2e failures can be REAL**: the vignette-chrome PR's
  overflow failure was a genuine catch (decoration reaching scrollWidth
  once its clip died). Classify before merging past them.
- `overflow-hidden` does double duty: Vignette's was cutting the TV
  atmosphere (bad) AND containing decorative bleed (load-bearing).
  Removing a clip needs a containment plan — `overflow-x-clip` at the
  page keeps glow without a scroll container.
- Fused ButtonGroup: collapse doubled borders with `border-l-0`, never
  negative margins — Button's `bg-clip-padding` paints overlap as a
  seam. Kit classes anticipated the group (`in-data-[slot=button-group]`).
- react-compiler: a component defined inside a component ("Cannot
  create components during render") is a lint ERROR — hoist to module
  scope once it closes over nothing.
- `deriveRegister` has ONE signature — (category, grouping, subject).
  A stale positional call compiles happily and mis-registers everything
  (the keepsake bug). Grep call sites when a signature changes.
- Legacy rows lie: homemade topics predating the create path sit
  `is_active=false`. Data fetched by a filtered list is not the same as
  the row a foreign key points at.
- `window.location.origin` read during render = hydration mismatch
  under any tunnel; resolve in an effect from an env-seeded state.
