# Session handoff — 2026-08-31

The extended-wizard day: a 41-round founder-refined prototype became the
verdict, the plan, and four shipped phases — the six-step wizard is now
the ONLY way a favpoll is created or edited, and the in-place edit
system is deleted. Register routes went singular alongside.

## Merged to main (in order)

1. **Prototype rounds 9–41** (branch `prototype/extended-wizard`, PR
   #600 — closed absorbed, branch deleted). Landed the shape: six steps
   (Event · Charity · Topic · Info · Story · Details), NO live preview,
   label|field rows, quiet `*` for required (only Name + About),
   register-aware ghosts that follow the who selection, who axis as an
   icon dropdown on the Name field (Mars/Venus/NonBinary + the
   founder-drawn Pair/Group from `components/icons/people.tsx`, Ribbon
   for Cause; neutral UserRound until chosen; NEVER inferred from the
   name), in-field CharCounters, info popovers carrying the old dialogs'
   helper copy, real photo crop, compact date dropdown WITH preset
   chips, £-prefixed goal field, rail that tracks answers (ticks +
   one-line summaries). Verdict + generation design in the PR's
   NOTES.md history.
2. **#601** — `references/extended-wizard-plan.md` (the four phases).
3. **#602 — Phase 1, the wizard publishes.** `/favpolls/new` calls
   `createFavpoll` directly (details handoff + DRAFT_ADDITIONS bridge
   gone from the create path), SeedFundModal before landing, one-click
   `safeGenerateDraft` calibrated by register+charity+topic+name+
   context+who (no dialog). `STEPS`/`STEP_LABELS` moved to
   `lib/wizard-copy.ts` so stories never pull server actions. Listed
   parity restored: `isListed = register !== "remembering"` until the
   switch is touched. Both e2e wizard specs rewritten for the six-step
   flow and PASSING against branch previews (they publish real favpolls
   on staging — today's E2E rows are dated 2026-08-31). Also fixed:
   `wall-of-favourites` setMounted-in-effect → `useSyncExternalStore`
   (was failing the newly-enforced lint rule on main).
4. **#603 — singular register routes, alphabetical order.**
   `/memorial` `/celebration` `/fundraiser` (permanent redirects from
   the plurals in `next.config.mjs`). The triad reads Celebration ·
   Fundraiser · Memorial in: header (labels singular now), home router
   cards, footer explore, See-it-for, demo tap-to-jump nav (Cause stays
   last — it answers who, not what kind), wizard Event chips. Footer
   phrases stay "For memorials" etc. (natural English); i18n keys keep
   their plural names (`home.router.memorials.*`) — cosmetic, unrenamed.
5. **#604 — Phase 2, the wizard edits.** `/favpolls/[id]/edit` renders
   the wizard prefilled (`WizardEditConfig`); every existing Edit link
   converts automatically. Clickable rail, Save → `updateFavpoll`, no
   fund modal. LOCKING: any pledge or `favpoll_pots.total_deposited > 0`
   → Event/Charity/Topic render read-only ("Locked — guests have already
   pledged.") AND `updateFavpoll` refuses category/charity/topic changes
   server-side (previously entirely unguarded). Cause label prefills
   into the Name field; who derives from subject/grouping/pronoun.
6. **#605 — Phase 3, the in-place edit system retired.** Deleted:
   `/favpolls/new/details`, FavpollForm/FormInner/CommandPanel, the
   seven field overlays, EditableHero/EditablePollArea/EditableCountdown,
   EditableField, GenerateExampleDialog, edit-mode-context (+ layout
   provider), ten test files, three story files. Who helpers →
   `lib/who.ts`. Survivors in `components/favpoll-form/`: seed-fund-modal,
   hero-photo-overlay, edit-helpers, date-helpers, date-time-picker
   (grew a `presets` prop), schema, constants, item-add-field — all live
   dependencies. The favpoll page was already pure guest view. tsc was
   clean on the FIRST pass after deletion; suite 1201 green (down from
   1289 = exactly the deleted suites).
7. **Phase 4** — #600 closed, prototype branch deleted. Plan complete.

## State of the world

- main = `c32f800` + this handoff. Tests 1201 green; all 8 checks green
  on every merge, advisory e2e included.
- **Dev server**: Joseph's terminal process died mid-day (redirect-loop
  wedge — symptom: ERR_TOO_MANY_REDIRECTS on `/`, WebSocket CLOSING
  spam, hydration-less pages). It was restarted from the Claude session
  with the repo caps intact (they live in `package.json` dev script +
  `next.config.mjs`, so plain `pnpm dev` is safe) — that background
  process dies with the session: **restart `pnpm dev` from apps/web
  next session.**
- PROJECT.md updated through Phase 3 (routes, directory listing, the
  2026-08-31 revision block). Auto-memory updated: extended wizard
  SHIPPED; event-form-v2 / wizard-state memories superseded.

## Deferred / worth a look

- **Colour rollout remainders** (pre-wizard backlog, still open):
  "goal reached" said in words on fundraiser pages (green-on-green);
  OG card palette per register (`lib/og/palette.ts` mirrors still
  purple); `lib/email.ts` link colour.
- **Wizard follow-ups**: mobile polish pass (strip is bars-only —
  deliberate, but untested on device); the reveal field's ghost lost
  the old instructional line ("Guests see this only after they pledge…"
  — now only in the info popover); occasion machinery
  (`lib/occasions.ts` `occasionsForRegister`) may be create-path dead
  code now the Generate dialog is gone — sweep before deleting (other
  consumers possible); edit-mode topic CHANGE while unlocked runs
  `upsertPollForFavpoll`'s delete-and-reinsert — sanity-check
  guest-added items behaviour if that path ever fires in anger.
- **Superseded memory files** (`project_event_form_v2`,
  `project_wizard_state`, `project_wizard_register_rework`) describe
  deleted code — prune next session.
- Staging accumulates the e2e-published favpolls (identifiable: "E2E
  Wizard Test 2026-08-31", "E2E Cause Test 2026-08-31").

## Gotchas earned today

- `InputGroupAddon` inline-end shifts `-0.3rem` right when it directly
  holds a `<button>` (`has-[>button]:mr-[-0.3rem]`) — pin `!mr-0` when
  a badge follows a button (plain `mr-0` loses on `:has()` specificity).
- Playwright vs the rail: the summaries echo the charity/topic names —
  `getByText("Marie Curie")` matches twice; use `.first()`.
- Component tests that import the wizard pull `use-wizard-state` →
  server-action modules; `SeedFundModal`'s chain constructs Resend at
  module scope — CI has no key. Mock the modal (and both action
  modules) in any jsdom test that renders the wizard.
- `deriveRegister` speaks register vocabulary: memorial → "remembering".
