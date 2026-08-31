# Extended wizard — implementation plan (2026-08-31)

The prototype verdict (apps/web/app/prototype/wizard, 41 founder rounds,
draft PR #600 — reference only, never merged): **the six-step wizard is
the create AND edit surface**. Event · Charity · Topic · Info · Story ·
Details, single column, no live preview — the payoff is the real page
after Publish. The favpoll page becomes pure guest-view; the in-place
edit system retires.

## Phase 1 — the wizard publishes (create)

1. **Steps.** `lib/wizard-copy.ts` `WizardStep` grows to six:
   `event | charity | topic | info | story | details`. Labels: Event /
   Charity / Topic / Info / Story / Details. Rail: icon + label only
   (Calendar, Gift, Shapes, UserRound, BookOpen, ClipboardList), no
   subtext; each completed step shows a tick and a one-line summary of
   its answer (the chosen charity's name, the topic, the name, About's
   first line, the Details roll-up).
2. **State.** `use-wizard-state` grows the new fields: openingLine,
   name, context, photo, about, reveal, who (`WhoValue`), goalAmount,
   closesAt, isListed. Gates: info → name, story → about; everything
   else optional. `who` commits grouping/subject via `groupingForWho` /
   `subjectForWho` the moment it changes (register recolours live).
3. **Step bodies** become real components in
   `components/new-favpoll-wizard/` (info-step, story-step,
   details-step), porting the prototype's apparatus:
   - label | field rows (180px column; stacked below `sm`), `*` marks
     the two required fields, "— optional" nowhere;
   - register-aware ghost text; the Name ghost follows the who
     selection (exactly what Generate would write);
   - who icon-dropdown on the Name field (Mars/Venus/NonBinary, the
     founder-drawn Pair/Group from `components/icons/people.tsx`,
     Ribbon; neutral UserRound until chosen; label flips to "Cause");
   - CharCounters suffixed in-field (NB: inline-end addons shift
     `-0.3rem` right when they hold a button — pin with `!mr-0`);
   - info popovers carrying the edit dialogs' helper sentences;
   - photo row → `HeroPhotoOverlay` on a scoped form context;
   - close date → `DateTimePicker` with a new `presets` prop (upstream
     the prototype's preset column into the shared component);
   - goal presets + flex-1 custom field with a fixed £ addon.
4. **Publish.** `handleFinish` calls `createFavpoll` directly — it
   already accepts the full payload. The `details?params` handoff and
   the `DRAFT_ADDITIONS_KEY` sessionStorage bridge are deleted.
   Redirect to `/favpolls/[id]` (append `?fund=1` to auto-open the
   shared-fund top-up dialog, dismissable — the wizard never asks about
   the fund; a head start is a payment and payments need the page).
   Photo upload reuses the existing storage-upload path the form uses
   before passing photoUrl.
5. **Generation.** One click, no dialog: `safeGenerateDraft` calibrated
   by register + charity + topic + name + context + who.
   `GenerateExampleDialog` retires (its who axis moved to the Name
   field; occasion derives from register + context).
6. **Tests.** Extend `new-favpoll-wizard` unit tests; a full create
   e2e walk; suite stays green.

Phase 1 ships alone — `/favpolls/new/details` remains as a fallback
until Phase 3.

## Phase 2 — the wizard edits

1. `/favpolls/[id]/edit` renders the same wizard prefilled (the server
   page already loads everything the form needed).
2. Rail entries become buttons — jump to any step. Final button: Save
   (→ `updateFavpoll` / `updateClosesAt`).
3. **Locking (the open design item):** once a favpoll has any pledge,
   Event / Charity / Topic lock — their steps render the summary
   read-only with one explanatory line. Enforce server-side in the
   update actions (currently unguarded — add the guards regardless of
   UI).
4. The favpoll page gains the owner's Edit affordance; in-place editing
   entry points are removed.

## Phase 3 — retire the in-place edit system

- The favpoll page renders the guest view for everyone; owners get Edit
  + owner chrome only.
- Delete: edit-mode paths in `EditableHero` / `EditablePollArea`, the
  field overlays (hero-name/opening-line/context/about/cause-label,
  goal-overlay, close-date-overlay if unused once presets move),
  `generate-example-dialog`, CommandPanel edit hooks, favpoll-form
  create mode, `/favpolls/new/details`. Keep what the wizard reuses:
  `hero-photo-overlay`, `edit-helpers` (CharCounter), `date-helpers`.
- PROJECT.md + test sweep.

## Phase 4 — cleanup

- Delete `apps/web/app/prototype/wizard`; close PR #600 unmerged.
- Mobile pass (progress strip exists; overlays already fullscreen on
  mobile).

## Sequencing & risks

One PR chain per phase. Risks: photo upload timing at create (upload
before `createFavpoll` or accept a file in the action); who→pronoun
persistence (`protagonists.pronoun` exists); locking semantics for
"pledges exist" (include shared-fund top-ups); the details-page fallback
must keep working through Phase 1–2.
