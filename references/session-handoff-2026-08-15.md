# Session handoff — 2026-08-15 (PRs #555–#558)

Four PRs, all merged and green on the five CI signals. Suite now **1212 tests in
120 files** (last recorded in a handoff: 1199 in 117, on 2026-08-06).

> **Reminder about the file count.** `.stories.tsx` files run as tests via the
> Storybook vitest plugin. Two of this session's three new files are stories —
> writing a story adds a test file, which is why the count moves without anyone
> writing a `.test.tsx`.

**Handoff gap: #538–#554 (7–12 Aug) have no handoff document.** That run built
the features page, the homepage closing sequence, the guest-arc vignettes, QR
download, and the whole plain-paper/Avery print pack. If you need that history,
read the PR bodies — they are unusually full — rather than assuming the chain
from `session-handoff-2026-08-06.md` is continuous. This document covers 13–15
Aug only.

One theme runs through the session and is worth reading first: **§6, scope
leaks** — three separate bugs where a wrapper was placed higher in the tree than
the thing it was describing.

---

## 1. The print workspace — one shell, two surfaces (#558)

`components/print-workspace/index.tsx` is new and is now the page chrome for
both printable surfaces: the pack and the keepsake. Props: `children`,
`leading`, `toolbar`, `widestPx`, `tallestPx`, `calm`.

The founder's framing was **"a desktop drawing application in a draggable,
scalable window"** — paper on a desk rather than a document in a scrolling page.
What shipped keeps the paper and drops the dragging, and the reasoning is in the
file header: **free panning is the expensive half** (pan state, scroll conflicts,
touch, keyboard reach, "where did my sheet go") **and it only earns its keep
when you are COMPOSING a layout.** These pages review fixed pages before
printing. Paper reads as paper from the page shape, the shadow, the surface and
the zoom.

**Zoom is the part of the metaphor that pays.** An A4 at 100% is 794 × 1123px,
so on most screens you cannot see a whole sheet. Presets are `Fit / 50 / 75 /
100`; `calm` reduces to `Fit / 100` and the keepsake uses it, because a
tool-heavy canvas around a memorial reads cold.

Two things about `Fit` that were each wrong once:

- **Fit means a whole page, both axes.** Fitting width alone left a landscape A4
  at 100% with its bottom third below the fold — the exact thing the control
  exists to prevent.
- **Fit sizes the SELECTED sheet, not the pack's envelope** (fixed at the very
  end of the session). It had been given `1123` for both axes — the largest each
  axis ever reaches — so every sheet was fitted to a square that no sheet is.
  Measured at 1440×950, height budget 730px:

  | sheet                  | before    | after          |
  | ---------------------- | --------- | -------------- |
  | poster (landscape)     | 730 × 516 | **1032 × 730** |
  | table cards (portrait) | 516 × 730 | 516 × 730      |
  | postcards (landscape)  | 730 × 516 | **1032 × 730** |

  Portrait sheets were always correct, which is why it went unnoticed for so
  long: the constraint they legitimately hit was the one being over-applied to
  everything else.

**Transforms do not affect layout**, so the scaled box reserves the scaled
height explicitly. Without it a zoomed-out sheet leaves a hole beneath it.

**No desk.** A tinted card holding the paper on a tinted page is two surfaces
doing one job. The page background is the desk (`bg-muted`, the same token
`ToolbarBand` uses, so band and desk are one surface) and the paper has the
white and the shadow.

**No borders on sheets, either.** White paper on a muted desk separates on its
own; an outline as well drew the sheet as a UI card. Square corners for the same
reason — _"It doesn't make sense for the pages to have curved corners since the
paper they represent wont have"_ (founder). Printed CARDS keep their radius:
those are a design, not the stock.

## 2. The keepsake (#558)

`app/favpolls/[id]/keepsake/` — the sheet an organiser prints after a favpoll
closes. Rebuilt this session from a portrait list into a **landscape A4**.

- **Landscape because the document is.** `TOP_N = 10`, `CHART_LANES = 5`,
  `CHART_HIGHLIGHT = 5`, `MAX_NAMES = 26`. Header band → two columns
  (`grid-cols-[1fr_1.15fr]`, words left / numbers right) → footer band.
- **Two tellings, not two documents.** `tribute` / `fundraiser`, defaulted from
  the register and overridable, remembered per favpoll at
  `favpoll:keepsake-variant:${favpollId}`. Deliberately the same shape as the
  live display's presenter override: _the register is a guess about the day and
  the organiser was there._
- Adopted from `localStorage` **after mount**, never in initial state — the
  server render knows nothing of it and seeding directly hydrates against
  different markup.

**A design mistake worth remembering.** The standings list was cut 10 → 8 → 6 to
make it fit before anyone noticed the answer was two columns. That is _shaving
the thing a keepsake is FOR to fit the thing it is decorated with._ If a
keepsake ever needs trimming again, check the layout first.

## 3. Toolbars standardised (#558)

Prompted by the founder: _"WHy not standardise how we use toolbars? we could
also make these storybook components"_. Three surfaces had grown their own copy
— the public favpolls list, the organiser's list, and the print workspace — and
had drifted on padding, and the print one was not full-bleed at all.

Two new components, both with stories:

- **`components/ui/toolbar-band.tsx`** — sticky at `top-14` (the site header's
  height), full-bleed with contents in the same `max-w-330` column as the page
  beneath, plus a `below` slot (the favpolls occasion rail uses it to scroll
  edge to edge). **A page using this must not wrap it in its own max-width
  container.**
- **`components/ui/segmented-control.tsx`** — exports `SegmentedControl` (generic
  over the value type) and `ToolbarLabel`. Use it when options are few and worth
  seeing without opening anything. **More than about four, or long labels, wants
  a dropdown** — the pack's eight sheets went that way for exactly that reason.

Tool names and shapes were normalised in the same pass: _way back → labelled
control per decision → actions_.

```
pack:     Back | ZOOM | SHEET | CUT LINES | Download code | Before you print | Print
keepsake: Back | ZOOM | STYLE | Export CSV | Print
```

("Print this sheet" → "Print"; the keepsake's variant `Tabs` → `SegmentedControl`;
every raw `Label` → `ToolbarLabel`.)

## 4. Guest-add, decoupled and made explicit (#556)

Founder: _"I'm wondering if we should decouple the Custom Topic functionality in
the wizard… maybe we should make the option to add a missing favourite more
explicit on the favpoll pledge dialog."_ Both, as block-ends for consistency
with other dialogs.

- Guests can add a missing favourite from the pledge dialog. Copy is the
  founder's own: **"Is yours missing? Type it and click Add"**.
- **Anonymous adds are allowed** (founder: _"I think we have to allow anonymous
  adds, don't you?"_), rate-limited by IP.
- Migration `supabase/migrations/20260813100000_favpoll_allow_guest_items.sql`,
  **applied to both projects** — staging `eotqyintgusvzidymumb` and prod
  `kgwkpibkoecvwcundqtm`.

Two component traps found here, both worth knowing:

- **`Chip`'s `readOnly` overrides `selected`** — the guest's own chosen
  favourite rendered as unpicked.
- **`InputGroupButton` defaults to `variant="ghost"`** — so every "Add" was bare
  text, and a hint reading "click Add" pointed at something that did not look
  clickable. Fixed by styling both to match.

## 5. The vignettes (#555, #556)

The custom-topics vignette was rebuilt to **step through uniform dialogs** rather
than fan them, after: _"the steps are too fast to track. Also, should the
vignettes more closely match the actual dialogs? They look a bit cartoonish"_.

The cartoonish read was diagnosed as **fields having no chrome** — not colour,
not scale. Vignettes that depict a real dialog should be built from the same
input components, or they read as a drawing of the product rather than the
product.

#555 also fanned the pack vignette's sheets and defused a **time-bomb test**:
`organizer-row` pinned `closes_at: "2026-08-12"` and began failing permanently
on the 13th. Now relative, with the expected label derived from the same date.

## 6. The defect class of the day: scope leaks

Three bugs, one shape — **a wrapper placed higher in the tree than the thing it
describes.**

1. **`.paper` wrapped the whole print pack.** `.paper` pins light token values so
   printed artefacts survive a dark-mode organiser (the #535 fix). But it sat on
   the pack's outermost div, so the **toolbar was inside it too**: its bottom
   rule inherited the darker paper `--border`, and in dark mode the entire band
   rendered near-white — measured `lab 95` against the keepsake's `lab 25`.
   Moved down onto the sheets, where the paper is.
2. **The QR export's `.paper` scope wrapped its own trigger and menu.** Same
   consequence for those controls. `download()` only ever reads `--foreground`
   from it, so it is now a hidden probe (`<div hidden className="paper" />`).
   Custom properties compute on a `display:none` element — verified: the probe
   still resolves the pinned near-black `lab 7` in dark mode while the button
   follows the theme.
3. **`.paper` was incomplete rather than absent** on the keepsake. It pinned only
   what a pack CARD uses, so the keepsake leaked `--reveal-foreground` (its name
   rendered near-white on white) and `--muted` (dark standings tracks).
   **Anything printed on paper needs its whole palette pinned, not the subset the
   first artefact happened to touch.**

Related, same family: the global print rule hid the keepsake's own `<header>` and
`<footer>` because it selected by ELEMENT. It is now scoped by attribute —
`[data-site-chrome]` — set on `header-bar.tsx` and `site-footer.tsx`.

### An unresolved one, stated honestly

A React key warning (`"Check the render method of KeepsakeView. It was passed a
child from KeepsakePage"`) was **bisected to the `exportCsv` element prop** — the
server page built `<ExportCsvButton>` and handed it to the client component. The
fix is sound (the component already receives `data`, so it renders the button
itself and the prop is gone), but **the mechanism is not pinned down: the pack
passes `qrExport` in exactly the same shape and has never warned.** Do not
propagate "server page hands a client element across" as an established rule —
it is not one. The caveat is recorded in the code at the call site.

## 7. Repo hygiene (#557)

`.claude/commands/favpoll-brand.pdf` had been committed by accident — `git add
-A` **from the repo root** instead of scoping to `apps/web`. Untracked and
gitignored. The real cause is worth naming: it had been filtered out of `git
status` output for two days rather than resolved.

**Stage explicit paths on this repo.** Scratch harnesses and export artefacts
land in the working tree constantly.

## 8. Carried forward

Highest first.

- **PayPal Giving Fund UK and CAF enquiries — still unsent.** Repeatedly flagged
  across several sessions. **This is the only carried item with launch risk.**
- **Goodstack nudge — overdue.** Post-call note is in
  `references/goodstack-call-brief-2026-07.md` / the #541 body.
- The celebration scene's **"Ice cream" is not a real topic**.
- Everything still open in `session-handoff-2026-08-06.md` §8 — in particular
  the **register-pages heavy rework** (don't polish them meanwhile), the
  **horizontal page scroll at 1180/1024/768** on all three register pages, and
  the **cause card's missing scene photo** (`public/demo/`).
- `references/outstanding-tasks-2026-07.md` §1b still holds the **production
  launch flip**; prod currently mirrors staging (staging Supabase + FavPoll
  sandbox Stripe).

## 9. Method notes that earned their keep

- **A passing test proved nothing twice.** The pledge-dialog hint was rendered
  inside `externalSearch === undefined`, a config the wizard never uses — so the
  test passed while the feature rendered **nowhere**. The founder reported it
  twice (_"i still don't see the hint"_) before it was found. **Assert against
  the configuration the app actually ships.**
- **Verify print at a real margin.** An early PDF check used `margin: 0` — the
  one setting that cannot reproduce a margin bug — and masked A6 fragmentation.
  Verify at 10mm and 15mm.
- **Count pages AND assert geometry.** A page-count check passed while the whole
  document rendered at 0.685 scale in a corner. Scaling-to-fit is not
  fragmenting, and only one of those two checks can tell.
- **Verify print from a DARK-mode browser.** Both surfaces were confirmed at one
  page, 10mm, dark ink on white, with `colorScheme: "dark"` — which is the state
  that broke them before.
- **`min-h-screen` resolves to the viewport in print** and forces an extra page.
  Hit on both surfaces.
- **`break-after-page` on a lone visible element leaves a blank trailing page** —
  i.e. every per-sheet print, since sheets print one at a time.
- **Inline `repeat(n, 1fr)` has an implicit `auto` minimum.** It grew Avery rows
  from 90mm to 106mm. Use `minmax(0, 1fr)` — which is what Tailwind's
  `grid-rows-*` emits.
- **Rebuild whole render blocks rather than patching JSX by slicing.** Several
  edits left duplicate fragments; rebuilding was faster every time.
- **A JSX comment cannot be a sibling of the returned root element** — use a `//`
  comment above it. Cost a typecheck round trip.
- Avery templates: **headless Chrome with a normal UA reads avery.co.uk**
  (WebFetch gets 403), and `template-<code>` pages count **panels** while product
  pages count **cards** — 2 panels per folded card.

## Suggested skills for the next session

- **`favpoll-context`** — always, at session start.
- **`favpoll-brand`** — any user-facing copy. Carries the headline history, the
  withhold/reveal pattern, and the register-sensitivity rules.
- **`diagnose`** — if the React key warning in §6 is picked up, or the
  register-page horizontal scroll.
- **`db-migrate`** — only if new schema work starts; this session's migration is
  applied to both projects.
