# Session handoff — 2026-08-18 (PRs #564–#567)

Four PRs. Suite **1215 tests in 120 files** (1212/120 at the last handoff, on
2026-08-15). One of the four is a security fix; one is why your laptop stopped
crashing; the other two are the /features and How It Works rework and the long
mobile fight that followed it.

**Read §5 first.** Nearly every wrong turn in this session shares one shape, and
it is not a CSS shape.

> **Handoff gap: #559–#563 (15–16 Aug) have no document.** That run rebuilt the
> keepsake as a certificate (#560), put it on /features (#563), and pinned
> `turbopack.root` (#562). The PR bodies are full; read them rather than
> assuming the chain from `session-handoff-2026-08-15.md` is continuous.

---

## 1. The session began with a crash, not a task

Two whole-machine crashes on 16 Aug, ten minutes apart — macOS recorded
hardware watchdog resets (`Boot faults: wdog`), with 8.6 GB of file-backed
memory dirtied at 14–42 MB/s in the minutes before each.

The dev script asked for `--max-old-space-size=8192` on an 8 GB machine, which
**removes the OOM backstop entirely**: instead of the dev server dying with a
harmless out-of-memory error, it swaps until the kernel stops responding.
Turbopack's native allocation was unbounded on top of that.

- heap ceiling 8192 → **3072**
- `experimental.turbopackMemoryLimit` = 3 GB, bounding the Rust side the Node
  flag does not govern

**If dev ever OOMs again, reduce what is being compiled — never raise these
back.** (#564, and already in memory.)

## 2. The security fix (#565)

`removeFavpollPollFavourite` checked only that **somebody** was signed in, then
hard-deleted any `favpoll_poll_favourites` row by id using the admin client,
which bypasses RLS. No ownership check at all — compare the hide path beside it,
which calls `verifyOrganiser` first.

Nothing in the UI called it, but **"unused" is not "unreachable"**: exported
server actions are addressable by id from any client, so any signed-in user
could delete a favourite from anyone's favpoll and orphan the pledge
allocations pointing at it — real money, pointed at a row that no longer
exists.

Deleted rather than gated: the product moderates by **hiding**, which is
reversible and preserves the pledges. Nothing needs a hard delete.

It was found by splitting a branch, not by looking for it. Worth repeating that
exercise on the other `actions.ts` files.

## 3. Splitting a branch is a review technique

Four commits sat unpushed on one branch after the crash. Splitting them into
four PRs exposed two things inspection had not:

- the **rename commit did not typecheck on its own**. It renamed
  `guest-wall-vignette.tsx` but left `app/features/page.tsx` importing the old
  path and the telethon string stale — both silently fixed by a later commit,
  so the branch tip was green while its middle was broken.
- the security hole above, in a commit that was only ever going to be read as
  part of a larger diff.

The split was verified lossless: recombining all four branches reproduced the
original tree byte for byte.

## 4. What actually shipped on mobile (#567)

The section is **4.8 phone screens** and every medium sits inside the viewport
at 320 / 390 / 430.

- **Text was being clipped 146px off the right edge**, cut mid-word. The media
  are 414–1160px objects; in normal flow they set the text column's min-content
  width, a grid item cannot shrink below that, and `max-w-lg` capped it at
  512px inside a 342px track. `overflow-x-clip` then hid the overflow instead
  of scrolling, so nothing threw and the copy was simply sliced. **`min-w-0` on
  the text column is the fix and it is load-bearing** — it came back the moment
  the media returned to normal flow later in the session.
- **Beat one was greyed out** by the pinned header's 144px scrim, which only
  has a job at `md:` where the header is sticky. Its own opacity was 1 the
  whole time; it was being painted over.
- **`DisplayScreen` described its own box with viewport breakpoints** — 37
  `md:` and an `lg:` — so the still, rendered at a fixed width inside whatever
  window the visitor has, collapsed to its stacked form on a phone: 900 × 1176
  **portrait** against 900 × 657 landscape on desktop. The "TV in a room" was a
  tall slab. They are container queries now (`@3xl` is 48rem, exactly what `md`
  was; `@5xl` is 64rem, exactly what `lg` was), and the still renders at 1120
  so it can reach its own two-column form. **This is a change to the component
  behind the live display** — see §7.
- **Mobile media are measured, not tuned.** Every size here used to be a
  hand-derived constant and three separate bugs came from them going stale (the
  TV reserved 184px and rendered 340; two wells were 90 and 100px too tall the
  moment their shapes changed; and the mobile scales turned out to have been
  sized for the **273px desktop column** all along). The well measures its own
  column with a `ResizeObserver` and derives the rest.

## 5. The defect class of the day: solving the wrong problem, well

Four things were built and then deleted in the same session — a crop with a
fade, a fullscreen viewer, an expand toggle, an icon button — and the reason is
one sentence from the founder at the end: *"the user can just pinch their
screen to view any of the elements properly, right?"*

They can. The served meta is `width=device-width, initial-scale=1` with no
`maximum-scale` and no `user-scalable=no`, and these are DOM elements rather
than images, so zooming re-rasterises the type crisply.

The chain started when "the images aren't readable on mobile" was accepted as a
**requirement**. It is not one. On a homepage nobody needs to read a demo
keepsake's standings — the seven paragraphs carry the argument and the media
only have to say the thing is real and physical. Everything downstream of that
mistaken requirement was competent and wasted: filling the column (which made
four 694px handsets — "ridiculous"), cropping to a legible band, a dialog, a
toggle, panning.

**The lesson is not "ask more questions".** It is that when a complaint is
about a symptom, the first move is to ask what the surface is FOR, and whether
the symptom matters at all. Two of the four rebuilds would have been skipped.

What survived is the defect work, which pinch could never have fixed: the
clipped text, the scrim, the overlap, the portrait live display, the
desktop-sized scales.

## 6. Method notes that earned their keep

- **A stale stylesheet does not degrade, it vanishes.** Three "it's broken"
  reports in a row came from editing **arbitrary Tailwind values**
  (`scale-[0.34]` → `scale-[0.24]`). A class that does not exist yet applies
  nothing at all, so the layout falls back to something far worse than the old
  value — full-size media, colliding. Force a hard reload after such an edit.
- **The dev server itself went bad.** After ~15 edits it emitted
  `ChunkLoadError` on **fresh** loads, not just to a long-lived tab. That, not
  the browser, was the real cause of the recurring "broken" reports. `rm -rf
  .next` and restart before diagnosing anything that looks impossible.
- **Test WebKit, not just Chromium.** Every report came from iOS Safari and
  every measurement here is now confirmed on both engines. WebKit is what
  proved three of the reports were stale renders — and, once, that one was not.
- **Measure the laid-out box, not through a transform.** A parent's rect does
  not shrink for a child's transform, and a transformed child's rect is not the
  laid-out box: at 430px it reported 440 inside a 382 box, and 64 for the TV at
  320. Both broke a spec that was otherwise correct.
- **A scaled element lays out first and scales after.** The div carrying a
  transform must be given the object's natural width or the object lays out
  into the shrunken box — this clipped the display's 900px screen inside its
  own bezel and left a ~100px sliver.
- **String-replace edits fail silently.** Prettier had reordered a class list,
  so an exact-match replace matched nothing and reported success. The screenshot
  caught it. **Check the file, not the exit code.**
- **Select test elements by name, never by index.** An expanded trigger renamed
  itself and left the list, shifting every position after it — the test passed
  against the wrong beat.
- **The E2E job races the preview deploy.** Every E2E failure this session was a
  cold or not-yet-deployed preview and passed on re-run. Pre-existing.
- Vercel deploy failures all pointed at **cron-job pricing** — three crons
  across two `vercel.json` files hitting a plan limit when several previews
  queue at once. Worth resolving before launch.

## 7. Carried forward

Highest first.

- **`/live/[slug]` needs eyes on a real screen.** #567 changed `DisplayScreen`
  to container queries. Thresholds are preserved exactly (`@3xl` = 48rem = the
  old `md`; `@5xl` = 64rem = the old `lg`) and the suite passes, but this is the
  component behind the live display and it shipped inside a marketing PR.
- **#567 had no CI for most of its life.** `ci.yml` triggers on
  `pull_request: branches: [main, staging]`, so a PR targeting another branch
  runs only Vercel. A stacked PR gets no Actions checks until it is retargeted,
  and retargeting fires `edited`, which is **not** in the default trigger types
  — it needs a push or a close/reopen to run.
- **PayPal Giving Fund UK and CAF enquiries — still unsent.** Carried across
  many sessions now; the only item with launch risk.
- **Goodstack nudge — overdue.**
- The celebration scene's **"Ice cream" is not a real topic**.
- Everything still open in `session-handoff-2026-08-15.md` §8, in particular the
  **register-pages heavy rework** and the **horizontal page scroll** on all
  three register pages.
- `references/outstanding-tasks-2026-07.md` §1b still holds the **production
  launch flip**.

## Suggested skills for the next session

- **`favpoll-context`** — always, at session start.
- **`favpoll-brand`** — any user-facing copy.
- **`diagnose`** — it earned its keep here: the feedback loop (Playwright +
  `getBoundingClientRect` at real phone widths) is what separated the four real
  defects from the three stale renders.
