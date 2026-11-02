# The hero banner — a wide image for cause favpolls

**Decided 2026-10-29/30, founder-led, from a prototype on the real favpoll
page (`?variant=`). Shape settled; the build is not started.**

## The problem

The hero has one image slot and it is an 80px square. That shape assumes a
face or a mark. A cause favpoll's subject almost never is one: Wistaston
Memorial Hall is a wide building, a band is a wide row of people, a food
bank is a room. Every cause favpoll was cropping a wide subject into a
small square, which is why the hall photograph never found a home on the
five Wistaston favpolls and why the founder's reading of the page was "the
image is too small".

The same conclusion had already been reached elsewhere, a month earlier:
`charity-profiles-2026-09-27.md` records that most charity og:images are
1200x630 hero photos, that "a photo shrunk into the 132px logo box is a
strip in a field of whitespace", and that each kind should go "where its
shape works". That ruling never reached favpolls.

## The decision

**A banner is an optional wide image on a cause favpoll. The band stays at
the top; the photograph sits immediately beneath it; the hero's text sits
beneath the photograph. Text is never drawn over the image.**

Cost: the text moves down about 136px on a phone. **That offset belongs to
the banner, not to the hero** — with no banner it is zero and the page is
exactly today's, which is why the empty state needs no design of its own.
A constant applied unconditionally leaves a hole on every favpoll without
a banner.

Person favpolls are untouched. The avatar is right for a face, and the
hero is settled and hard-won (#1056, #1061).

## What was rejected, and why it matters

Six variants were built and looked at. Five put the text ON the photograph:
a flat veil behind the whole hero; a banner above the band; the LinkedIn
shape with an enlarged avatar overlapping; a gradient clearing the text
zone; and finally the gradient with a white halo on the ink, which bought
back 80px of phone screen and was the founder's favourite for an hour.

They were all rejected for one reason. **They work on a photograph you
chose and none of them can be trusted on one you have not seen.** The
organiser uploads the photo and nobody vets it. A veil tuned for a bright
hall on a cloudy day fails on a dark one; a halo tuned for the name fails
on a small muted eyebrow.

The check that settled it: text over an image is normal **only where
somebody art-directs the image** — streaming key art with deliberate empty
space, editorial photo essays. Every product that takes an uploaded photo
puts the text underneath it. LinkedIn, the reference the founder started
from, does exactly that: banner, then the name below it. JustGiving's cover
photo sits at the top of the page with the title set separately.

Legibility therefore stops being a thing to tune and becomes a thing that
cannot go wrong.

## Two mechanical findings worth keeping

**A background on the left column is painted against the SCROLLER.** The
column is the scroll container, and a scroll container paints its
background against its own border box, not its content. The photograph
stood still while the text scrolled up over it, straight into the part the
gradient had not cleared. `background-attachment: local` ties the two
together. Any future full-bleed background on that column has this bug
waiting in it.

**The offset must move the text, never the band.** Padding on the column
pushes the band off the top of the sheet and leaves a white strip above it.
The eyebrow's wrapper is the first thing below the band and is what moves.

Also measured, and relevant to the next person who tries to shrink the gap
between the About and the topic heading: it is **52px at every width**,
settled 2026-10-17, and **all of it is load-bearing when the heading is
pinned** — 40px of `pt-10` clearing the hanging photo and painting the
curtain, plus the heading row's own 12px. There is no slack in it.

## Open

- The banner belongs inside `CauseHero` and `HeroLayout` as a prop. The
  prototype reaches in with selectors (`div.pr-28`, `.h-14.bg-muted`) and
  hardcodes one image URL.
- The wizard needs a second, **optional** image. It must never be
  mandatory: the protagonist photo became mandatory on 2026-10-29 and one
  required crop is enough.
- **Appeal fallback, undecided and worth deciding deliberately**: a member
  favpoll with no banner of its own could fall back to its appeal's photo.
  The five Wistaston societies would share the hall for free, and the
  appeal would read as one thing.
- The pinned state is **unverified**. Moving the text down may move what
  `--hero-stuck-bottom` is measured against, which is the same constant
  the poll heading and the lock card's two `+6.75rem` offsets depend on.
  Needs a scroll on a real device.
- `apps/web/lib/image-veil.ts` (+ 9 tests) measures the veil a photograph
  needs to carry dark text, computed from the dark end and the busyness of
  the band the text covers. **Unused by this decision.** Kept for a surface
  where the frame IS controlled — a share card, the live display.

## 2026-10-30, later — the banner IS the band (supersedes "The decision" above)

Built, then revised on sight. Four of the founder's screenshots changed
the shape in one evening, and the section above is kept as the record of
where it started.

**Either band or banner, never both** (founder: "how about either band
or banner (not both)? if banner, it becomes the band when scrolling").
Stacking the tinted band above the photograph read as two pieces of
chrome. Now a favpoll with a banner has no tint at all: the photograph
sits in the band's place inside the pinned box.

**It collapses to the band on scroll — one CSS offset, no script.** The
pinned box is `position: sticky` with a NEGATIVE top of
`-(imageHeight - 56)`, read from the image's own height by the same
ResizeObserver pattern the box already used. It scrolls until its last
56px reach the top, then stops. What stays pinned is the photograph's
bottom 56px with the avatar hanging 40 below — **the band's exact
geometry** — so `--hero-stuck-bottom` is 56 either way and the poll
heading's `pt-10` and the lock card's two `+6.75rem` offsets stay true
without knowing a banner exists. Measured on the page: banner pinned at
−160→56 (desktop) and −74→56 (phone), avatar 16→96 at both, poll heading
pinned at 56 on the phone with its text starting at 96.

The cost: with a banner the box is sticky at EVERY width, where the
plain band is `fixed` below the shell breakpoint because of iOS
overscroll (#850). Accepted on purpose — a fixed box cannot collapse —
and **not yet seen on the founder's phone.** That is the one open
verification.

**No edge fade — but a scroll fade, added last.** The mask that dissolved
the photograph's bottom third came out; the photograph ends as itself.
Then (founder: "can the banner fade into the band when scrolled?") a
different fade went in: the muted tint is painted BEHIND the photograph
and a CSS scroll-driven animation runs the photograph's opacity 1 → 0
over exactly the collapse distance (`globals.css`, `hero-banner-fade`;
`animation-timeline: scroll()`, `animation-range: 0 var(--hero-banner-collapse)`,
the variable set inline from the measured height). So what is pinned is
the band — tint, avatar, mark — the same band a favpoll without a banner
has. No script, no layout; the browser samples it off the main thread.
Measured: opacity 1 at rest, 0.5 at half the collapse, 0 pinned, both
widths; range 0–160px desktop, 0–74px phone. Guarded by
`@supports (animation-timeline: scroll())`: where unsupported the
collapse still happens and the photograph's last 56px stay pinned,
which is the earlier behaviour, not a broken one. Safari shipped the
timeline in 26; older iPhones get the collapse without the fade.

A finding on the way: the rule was on disk and absent from the served
stylesheet — zero mentions of the class or its keyframes — until
`globals.css` was touched by hand, after which it appeared. The file had
been edited by a script while the dev server ran, not pulled in by git,
so this is CLAUDE.md's stale-stylesheet trap with a trigger it does not
yet list.

**The crop is what the page shows.** A fixed 144px height re-framed the
organiser's 3:1 crop at every width (4.5:1 desktop, 2.7:1 phone) and
`object-cover` trimmed the rest — founder: "this is the image i uploaded
after being cropped". The banner is drawn at the crop's ratio; height
follows the column (130px phone, 216px desktop).

**The crop box sizes itself.** A fixed `cropSize` made react-easy-crop fit
the IMAGE to the container and float a 288×96 box on it, so minimum zoom
could only reach the middle of a large photograph (founder: "scaling
down images that are too large"). With no size the image COVERS the box
and zoom 1 is the whole width. The square kept its 132, the avatar's
size, for one more day: the same cut showed on a square logo (founder,
2026-10-30, "is this the same scaling problem as with the banner?" —
yes), so no crop passes a size now and the square's box fills its 160px
surface. The box's size on screen never touched what was saved, which
is read in the image's own pixels. The crop surface takes the crop's
shape, and the overlay takes a `label` so the banner's says "Banner"
and previews wide.

**The avatar hangs off the banner's lower edge**, not the band's — off
the band it landed 40px onto the roofline the organiser had just framed.

**The mark gets a frosted pill over a banner** (`bg-background/70` +
`backdrop-blur-sm`, the toolbar band's idiom, #996). The photograph is
the one surface anything is drawn over, and the mark is that thing; on
the brick doorway it was barely there.

Manage: the Banner row runs full width at 3:1, matching the fields above
it, with Remove. Wizard: an optional Banner control on the info step,
cause favpolls only; its File waits for an account like the photo's.

Tests: `components/__tests__/hero-layout-banner.test.tsx`, 7 — the
collapse itself is not among them, because jsdom lays nothing out and
the negative top is read from a measured height; it is verified by
Playwright measurement, above.

## 2026-10-30, last — band kept, banner beneath (supersedes the section above)

Founder, on sight of the collapse and the fade: "change of plan. keep the
band. banner underneath. no need to put the brandmark in a pill."

So the shape is the one first built that evening, with everything learned
since kept and the two mechanisms withdrawn:

- **The band stays on top**, tinted, pinned, one shape — fixed below the
  shell breakpoint, sticky from it — exactly as a favpoll without a
  banner. Nothing about pinning changed after all.
- **The banner sits beneath it in ordinary flow**, drawn at the crop's
  3:1, no edge fade, and scrolls away under the band.
- **The avatar hangs off the banner's lower edge**, not the band's, so it
  stays off the roofline. It therefore scrolls away with the banner; the
  pinned band is the mark alone. The poll heading's `pt-10` clears
  nothing in that state — 40px of air, only while scrolled — accepted.
- **No pill on the mark**: it is back on the tint, where it reads.
- The rail handle stays at `z-40` (page-layout): the banner still bleeds
  across the column boundary at the handle's height.

Withdrawn, and kept above as the record: the sticky negative-top
collapse, and the scroll-driven opacity fade into the band. Both worked
as measured; the founder preferred the stack.

Kept from the same evening: the crop's ratio is what the page draws; the
crop box sizes itself from the container; the overlay takes a `label`
and previews wide; the manage Banner row runs full width with Remove;
the wizard's optional Banner control.

Tests: `components/__tests__/hero-layout-banner.test.tsx` — the band is
present with a banner and precedes it; the box keeps its fixed shape;
the avatar hangs off the banner and not the band; the empty state renders
nothing in the banner's place.

### …and the avatar pins (same night, after the section above)

Founder: "can we pin the avatar so scrolling achieves the effect of no
banner?" It does now. The avatar is a sticky sibling after the banner
block — `top` at the band's avatar line (16px), `z-30`, margins of −40
above and below so its height in flow is zero — rather than a child of
the banner. At rest it is where it was, overlapping the banner's lower
edge; as the banner slides under the band it rises to 16px and holds,
and from there the page is the no-banner page to the pixel, poll
heading clearance included. The "pinned band is the mark alone" line
above is superseded.

Why a sibling: a sticky element is confined to its parent's box, and
the hero's fragment renders into the column's content wrapper (page-
layout, `max-shell:contents` / `shell:flex-col`) — the containing block
the band already relies on to "stay until the whole column has passed".
Inside the banner's wrapper it would have peeled off as soon as the
banner did. On the phone the window scrolls, so it rides iOS overscroll
where the fixed band does not; the banner makes the same trade.

### …and both images open in a dialog (same night)

Founder: "how about we make the image and banner open in dialog on
click?" On the guest page (`pins`) the avatar and the banner are real
buttons — "View photo", "View banner" — opening one `Dialog` with the
image at up to `max-w-3xl` and 85vh, an sr-only title naming it. The
room's screen gets no tap targets. What is stored is the crop, so the
dialog shows the crop larger: clearly worth it for an 80px avatar, and
marginal for the banner on a phone, where it is already full width.
Storing the uncropped original — a second upload and a second column —
was offered and held; it is what would make the banner tap worthwhile.

Measured and fixed on the way: after Escape, focus landed on `<body>`,
not the opening button, because the dialog is controlled from plain
buttons rather than a DialogTrigger. The trigger is remembered on click
and restored in `onCloseAutoFocus`; a test covers it.

## Related

- `charity-profiles-2026-09-27.md` — decision 2, the 1.91:1 banner and the
  private-surfaces-only rule for a charity's own image
- `project_stacked_header` / #1056, #1061 — the band, the pin, the
  geometry this sits on
