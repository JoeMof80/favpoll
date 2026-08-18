"use client"

// Sixth shape, per founder correction (2026-08-04): the step TEXT
// SCROLLS on the left (Goodstack's ghosting titles — real scroll, not a
// swap-in-place), while the image sits pinned in the media column,
// larger and bare (no tinted panel), updating to whichever step's text
// crosses the viewport middle. Columns follow the page grid; mobile
// stacks statically.
//
// End to end (founder, 2026-08-06). The arc now runs PAPER → PHONE → ROOM,
// and the frame changes with it, because only the middle four beats happen
// on a phone: the wallet card is an object on a table, and the live display
// is a browser page an organiser casts to a screen. One chassis around all
// six would have stated something false about both ends.
//
// ALL SIX ARE NUMBERED (founder rewrite, 2026-08-09). They were not: the
// card and the screen were treated as the organiser's and left unnumbered,
// on the reasoning that numbering all six would mix two actors in one list.
// The rewrite reframes the section as one GUEST journey, and it is right —
// a guest scans the card and a guest watches the screen. Every beat is
// something they do.

import { useEffect, useRef, useState } from "react"
import { Maximize2, Minimize2 } from "lucide-react"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { TvFrame } from "@/components/hero-demo-panel/tv-frame"
import {
  PhoneFrame,
  PHONE_CHASSIS_WIDTH,
  PHONE_CHASSIS_HEIGHT,
} from "@/components/hero-demo-panel/phone-frame"
import { PackCard } from "@/components/print-pack/pack-card"
import {
  DEMO_SCENE as SCENE,
  DEMO_QR_URL,
  DEMO_PACK_DATA as PACK_DATA,
  DEMO_PACK_STEPS as PACK_STEPS,
  DEMO_KEEPSAKE_WALKTHROUGH_DATA,
} from "@/components/landing/demo-fixture"
import { KeepsakeDocument } from "@/components/keepsake/keepsake-document"
import {
  DisplayStill,
  DISPLAY_STILL_WIDTH,
} from "@/components/landing/display-still"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { Phase } from "@/components/hero-demo-panel/scenes"

type Medium =
  | { kind: "card" }
  | { kind: "phone"; phase: Phase }
  | { kind: "display" }
  | { kind: "keepsake" }

type Beat = {
  key: string
  label: string
  body: string
  medium: Medium
}

const BEATS: Beat[] = [
  {
    key: "card",
    label: t("landing.how.card.label"),
    body: t("landing.how.card.body"),
    medium: { kind: "card" },
  },
  {
    // The state a guest ARRIVES in (founder, 2026-08-06): "arriving" is a
    // locked phase, so the card shows blurred decoy bars and the reveal lock —
    // the withholding the rest of the arc then resolves. Without it the
    // sequence opened mid-story, on a picker already in use.
    key: "arriving",
    label: t("landing.how.arrive.label"),
    body: t("landing.how.arrive.body"),
    medium: { kind: "phone", phase: "arriving" },
  },
  {
    key: "selected",
    label: t("landing.how.pick.label"),
    body: t("landing.how.pick.body"),
    medium: { kind: "phone", phase: "selected" },
  },
  {
    key: "amount-picked",
    label: t("landing.how.pledge.label"),
    body: t("landing.how.pledge.body"),
    medium: { kind: "phone", phase: "amount-picked" },
  },
  {
    key: "reveal",
    label: t("landing.how.reveal.label"),
    body: t("landing.how.reveal.body"),
    medium: { kind: "phone", phase: "reveal" },
  },
  {
    key: "room",
    label: t("landing.how.room.label"),
    body: t("landing.how.room.body"),
    medium: { kind: "display" },
  },
  {
    // SEVENTH BEAT (founder, 2026-08-17). The arc ended at the event, leaving
    // "and then what?" unanswered — the one question a walkthrough of a thing
    // that CLOSES has to answer. It also returns the medium to PAPER, so the
    // arc now runs paper → phone → room → paper and shuts where it opened.
    //
    // It strains the 2026-08-09 principle that every beat is something a
    // GUEST does, since the sheet is the organiser's to print. Written
    // passively for that reason — what the day BECOMES, not who prints it —
    // so the reader stays the guest all seven beats. That is the whole
    // section's rule (founder, 2026-08-17): "you" is the guest throughout,
    // never the organiser, because a reader cannot be both and the beats
    // before this one are unambiguously the guest's.
    key: "keepsake",
    label: t("landing.how.keepsake.label"),
    body: t("landing.how.keepsake.body"),
    medium: { kind: "keepsake" },
  },
]

// Each medium is laid out at its OWN natural size and scaled to fit the
// media column, because each is a different real object:
//   phone   — 414 x 868, the iPhone chassis around a 390px guest viewport
//   card    — 85.6 x 54 mm, the wallet card at its printed size
//   display — 900 x 560 inside a TV bezel (920 x 580 overall), wide enough to
//             keep the display's md: two-column banner — below it the layout
//             collapses to its mobile form and stops reading as a screen in
//             a room
// Scales are per-breakpoint and fixed rather than computed: the column is
// ~273 / ~376 / ~478 px at md / lg / xl, and the phone is the tallest, so it
// sets the well height at each stop.
const WELL = "h-[451px] lg:h-[608px] xl:h-[651px]"
// NOT scaled to fill the mobile column, unlike the three below (founder,
// 2026-08-18: "broken but also ridiculous"). Filling it means 0.80, which is a
// 331 x 694 phone — and there are FOUR of them, so the section went from 4.6
// screens to 5.9 and read as a stack of giant handsets. The other three media
// are landscape or small and cost 40-50px each to enlarge; the phone costs 243
// each. It stays a thumbnail here, and its detail belongs behind a tap.
const PHONE_SCALE = "scale-[0.52] lg:scale-[0.70] xl:scale-[0.75]"
const CARD_SCALE = "scale-[0.75] lg:scale-100 xl:scale-[1.15]"
// Down from the browser-framed version: the TV bezel adds 20px each way
// (940 overall), and at xl the old 0.53 already sat within a pixel of the
// column's width.
const DISPLAY_SCALE = "scale-[0.23] lg:scale-[0.32] xl:scale-[0.41]"

// MOBILE IS MEASURED, NOT TUNED (2026-08-18).
//
// Every mobile size in this section used to be a hand-derived constant: a
// well height per medium, and a scale per breakpoint. Three separate bugs in
// one night came from those going stale — the TV reserved 184px and rendered
// 340; the keepsake and display wells were 90 and 100px too tall the moment
// their shapes changed; and the mobile scales turned out to have been sized
// for the DESKTOP column all along, 273px against the 342 they were in.
//
// So the mobile path now measures the column it is actually in and derives
// everything from it. There is nothing left to drift: collapsed always fills
// the column exactly, and the well is always the height the medium actually
// renders at.
//
// Each medium's natural (unscaled) size, which IS fixed — these are real
// objects at real dimensions, not layout choices:
//   card     — 85.6 x 54mm at 96dpi, plus the 2° tilt's bounding box
//   phone    — the chassis around a 390 x 844 guest viewport
//   display  — the still's render width plus 20px of TV bezel each side
//   keepsake — A4 landscape at 96dpi
const NATURAL: Record<Medium["kind"], { w: number; h: number }> = {
  card: { w: 332, h: 215 },
  phone: { w: PHONE_CHASSIS_WIDTH, h: PHONE_CHASSIS_HEIGHT },
  display: { w: DISPLAY_STILL_WIDTH + 40, h: 697 },
  keepsake: { w: 794, h: 1123 },
}

// EXPANDED IS FILL-THE-COLUMN, nothing more (founder, 2026-08-18: "keepsake
// expands too much"). It was a legibility scale — 0.7 — which put the sheet
// at 556 wide and panning, and a document you have to drag sideways to read
// on a marketing page is a worse answer than a small one you can see whole.
// So expanding just lifts the thumbnail cap: the phone goes 215 -> 342, the
// keepsake 238 -> 342. Nothing pans anywhere now.

// ONLY THESE TWO CARRY A TOGGLE (founder, 2026-08-18): "there's no need for
// the live screen to expand if it is already full width, so make it full
// width. Likewise for the QR code stationery."
//
// Exactly right, and it is the rule the other two fail: a control that grows
// something already filling its column is a control that does nothing worth
// doing. The card and the display are landscape and fill the width at a size
// their own copy survives — the card is life-size and the display's total and
// topic read at a glance. The phone and the keepsake are PORTRAIT, so filling
// the width would cost 717 and 483px of scroll apiece; they stay thumbnails
// and open on a tap.
const EXPANDABLE = new Set<Medium["kind"]>(["phone", "keepsake"])

// COLLAPSED is fill-the-column for the landscape media and a thumbnail for the
// two portrait ones, which would otherwise cost 717px (phone) and 483px
// (keepsake) of scroll each — four phones at full width took the section past
// six screens, the state that was called ridiculous.
const COLLAPSED_CAP: Partial<Record<Medium["kind"], number>> = {
  phone: 0.52,
  keepsake: 0.3,
}

// Room for the drop shadows, taken off the column before anything is fitted.
const SHADOW_ROOM = 14

// A4 AT 96dpi, which is what the keepsake page actually is: 794 x 1123
// portrait, 1123 x 794 landscape. 1644 x 1123 was used here first and was
// wrong — that is the FAN box the features vignette uses to hold TWO sheets
// side by side, so a single sheet rendered into it came out at the wrong
// aspect and read as a long thin slip rather than a sheet of paper.
//
// LANDSCAPE (founder, 2026-08-18: "we should make the keepsake landscape as
// well, maybe and don't truncate"). It had been portrait since 08-17, on the
// reasoning that a portrait sheet fills a tall well while a landscape one
// leaves most of it empty. That reasoning was about the DESKTOP column, which
// is 451-651px of height looking for something to spend it on. On a phone the
// scarce dimension is the opposite one: a portrait sheet needs 390px of the
// scroll to show 794px of paper at a size nobody can read, where landscape
// fills the column's width and costs 191. The desktop scale drops to match, so
// the sheet reads the same there.
const A4_PORTRAIT = { w: 794, h: 1123 }
// Width ~270 / ~373 / ~453 against a ~273 / ~376 / ~478px column; the xl step
// is held at 0.57 rather than 0.60 so the 1123 of height stays inside the
// 651px well rather than overflowing it by 23px.
const KEEPSAKE_SCALE = "scale-[0.34] lg:scale-[0.47] xl:scale-[0.57]"

// WEIGHT, NOT CHROME (founder, 2026-08-17). This was drawn as a miniature of
// the real button, copying the ADD_TOKEN trick from love-step and the topic
// vignette. That trick earns its keep there and not here: those hints sit
// INSIDE the dialog, a few centimetres from the real Add and at nearly its
// size, so matching chrome helps you spot the control. This is a marketing
// page in 20-24px body copy, naming a button the reader meets on another
// surface minutes or days later — the recognition payoff is small, the cost
// is a solid primary pill pulling the eye to a footnote in a section whose
// other six beats are plain sentences. It could not be faithful anyway: at
// 0.8em of 24px type the token outgrew the real 14px button.
//
// Medium weight does the one job the chrome genuinely earned — in a NUMBERED
// list of steps, "click Next" could be read as "go to the next step", and the
// weight plus the capital marks it as the name of a control instead.
const NEXT_TOKEN = <span className="font-medium">Next</span>

// The copy stays a single string in messages/ with a {next} placeholder,
// rather than being split into JSX here, so a locale pass still sees one
// whole sentence.

function withNextToken(body: string) {
  const parts = body.split("{next}")
  if (parts.length === 1) return body
  return parts.flatMap((part, i) =>
    i === 0 ? [part] : [<span key={i}>{NEXT_TOKEN}</span>, part]
  )
}

function BeatMedium({
  medium,
  bare = false,
}: {
  medium: Medium
  /**
   * Drop the per-breakpoint scale classes. The mobile path measures its
   * column and supplies a scale numerically, so the class-based ones would
   * compound with it and shrink everything twice.
   */
  bare?: boolean
}) {
  if (medium.kind === "card") {
    return (
      // .paper pins the light token values, exactly as the print pack does.
      // Without it a dark-mode visitor gets the card's forced bg-white under
      // dark-mode ink — the blank-card failure #535 fixed on the pack, which
      // this still would otherwise reintroduce on the homepage.
      // Tilted a couple of degrees: an object resting on a table, not a
      // screenshot of one.
      // .paper-screen puts the border back to the app's: .paper darkens it
      // for ink that survives a domestic printer, which on screen just draws
      // a hard outline round every row of the card.
      <div
        className={cn(
          "paper paper-screen shrink-0 drop-shadow-xl",
          !bare && CARD_SCALE,
          "-rotate-2"
        )}
      >
        <PackCard data={PACK_DATA} steps={PACK_STEPS} scale="l7418" />
      </div>
    )
  }
  if (medium.kind === "keepsake") {
    return (
      // .paper for the same reason the wallet card needs it: the sheet forces
      // a light background, so without the light tokens pinned a dark-mode
      // visitor gets dark ink on dark paper (#535).
      // TRIBUTE: the walkthrough runs on a scene with a protagonist now, so
      // the sheet leads on the person rather than on what was raised — the
      // keepsake at its fullest rather than its second telling.
      // shrink-0 IS LOAD-BEARING. Every well is a row-direction flex box, and
      // this is the only medium with an explicit width — so flex-shrink was
      // squashing the 794 down toward the column's own width BEFORE the
      // transform ran, and the sheet came out at roughly 0.59:1 instead of
      // A4's 0.707:1. The others escape it by having no width of their own.
      <div
        className={cn(
          "paper paper-screen shrink-0 drop-shadow-xl",
          !bare && KEEPSAKE_SCALE
        )}
        style={{ width: A4_PORTRAIT.w, height: A4_PORTRAIT.h }}
      >
        <KeepsakeDocument
          data={DEMO_KEEPSAKE_WALKTHROUGH_DATA}
          variant="tribute"
          orientation="portrait"
        />
      </div>
    )
  }
  if (medium.kind === "display") {
    return (
      <div className={cn("shrink-0", !bare && DISPLAY_SCALE)}>
        <TvFrame>
          {/* No crop: the still shows its leaders and ends where they do — a
              fixed height cut the last bar in half and read as a broken
              screenshot rather than a screen. */}
          <div style={{ width: DISPLAY_STILL_WIDTH }}>
            <DisplayStill scene={SCENE} qrUrl={DEMO_QR_URL} />
          </div>
        </TvFrame>
      </div>
    )
  }
  return (
    <div className={cn("shrink-0", !bare && PHONE_SCALE)}>
      <PhoneFrame>
        <DemoCard
          scene={SCENE}
          phase={medium.phase}
          barWidths={SCENE.results.map((r) => r.widthPercent)}
          prefersReducedMotion
          device="phone"
          className="rounded-none border-0"
        />
      </PhoneFrame>
    </div>
  )
}

// The mobile well. A phone beat is a BUTTON that opens the viewer; every
// other medium is inert, exactly as before.
//
// The affordance is a small chip rather than a caption. This is a marketing
// page and the media are already the loudest thing in the column — "Tap to
// enlarge" set beneath each of four phones would be four more lines of
// instruction on a section that was called an instruction manual once
// already. The chip sits on the object it acts on and says the same thing.
// The mobile medium: fills its column, and opens on a tap.
//
// TOGGLE IN PLACE, not a dialog (founder, 2026-08-18: "it would be better to
// just toggle expanding the image when it is clicked"). A fullscreen overlay
// was built first and this is better — no focus trap, no scroll lock, no
// second surface, and the beat's text stays on screen beside the thing it
// describes, which was the one thing the overlay had to re-render to keep.
//
// The scale is MEASURED off the column rather than tuned per breakpoint: see
// NATURAL. Collapsed fills the column exactly at any width, so the same code
// serves a 320px phone and a 430px one with nothing to keep in sync.
function MobileWell({
  beat,
  expanded,
  onToggle,
}: {
  beat: Beat
  expanded: boolean
  onToggle: () => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [columnWidth, setColumnWidth] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const update = () => setColumnWidth(node.getBoundingClientRect().width)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(node)
    return () => ro.disconnect()
  }, [])

  const natural = NATURAL[beat.medium.kind]
  // SHADOW_ROOM off the column before fitting. Every medium carries a
  // drop-shadow and the card is tilted 2° on top of that, so fitting the raw
  // column width put the shadow outside the box and the scroller cut it off
  // square — "QR code card shadow is truncated". The shadow is how these read
  // as objects rather than pasted rectangles, so it gets its own space.
  const fit = columnWidth ? (columnWidth - SHADOW_ROOM * 2) / natural.w : 0
  const expandable = EXPANDABLE.has(beat.medium.kind)
  const cap = COLLAPSED_CAP[beat.medium.kind]
  const collapsed = cap ? Math.min(fit, cap) : fit
  // Never SHRINK on expand: the card and the two documents already fill the
  // column collapsed, and a toggle that made something smaller would be absurd.
  const scale = expandable && expanded ? fit : collapsed
  const width = natural.w * scale
  const height = natural.h * scale
  const pans = width > columnWidth + 1

  return (
    <div ref={ref} data-beat-well="" className="relative w-full">
      {/* The scroller is the crop. It is only scrollable when the medium is
          genuinely wider than the column — otherwise a stray horizontal drag
          on a page that does not scroll sideways feels broken. */}
      <div
        data-beat-scroller=""
        className={cn(
          "w-full",
          pans ? "overflow-x-auto" : "overflow-hidden",
          // A transform does not change the layout box, so the height is
          // reserved explicitly. This is the whole class of bug that the old
          // hand-tuned well heights kept reintroducing.
          "transition-[height] duration-300"
        )}
        style={{ height: height || undefined }}
      >
        <div
          aria-hidden="true"
          data-beat-media=""
          className="pointer-events-none mx-auto select-none"
          style={{ width: width || undefined, height: height || undefined }}
        >
          {/* THE NATURAL WIDTH IS SET HERE, not left to the box. A scaled
              element lays out FIRST and scales after, so this div has to be
              as wide as the object really is or the object is laid out into
              the shrunken box instead.
              The display is the one that proved it: TvFrame clips to its
              bezel, so with this div at the column's 342 it clipped the
              900px screen inside it and then scaled the remains down to
              ~100px — a sliver of a TV with dead space beside it. The other
              three carry explicit widths of their own (the phone its chassis,
              the keepsake its A4 page, the card its printed size), which is
              why only the display broke. */}
          <div
            className="origin-top-left"
            style={{
              width: natural.w,
              transform: scale ? `scale(${scale})` : undefined,
            }}
          >
            <BeatMedium medium={beat.medium} bare />
          </div>
        </div>
      </div>

      {/* The trigger is a SIBLING laid over the medium, never a wrapper around
          it. The phone renders the real DemoCard, which has fifteen buttons of
          its own — "Pledge your favourite" among them — and a <button> inside
          a <button> is invalid HTML that React reports as a hydration error.
          The medium is pointer-events-none, so every tap lands here.
          Sticky-top so the chip stays reachable on an expanded medium that
          is taller than the screen. */}
      {expandable && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          // The media are aria-hidden decoration everywhere else in this
          // section, so this carries the whole accessible name — the beat's
          // label plus what tapping does, since "Read the instructions" alone
          // does not say that anything happens.
          aria-label={
            expanded
              ? `${beat.label} — show less`
              : `${beat.label} — see this larger`
          }
          className="absolute inset-0 flex cursor-pointer items-start justify-end p-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {/* SOLID, not a tint (founder, 2026-08-18: "barely visible"). It was
              bg-foreground/75 with a blur behind it, which over the white of a
              screen or a sheet came out as pale grey text on pale grey — the
              one thing a control announcing an interaction cannot be. Full
              opacity, a shadow to lift it off whatever it sits on, and the
              same treatment whatever is behind it.
              ICON ONLY (founder, 2026-08-18). The words were doing the work of
              an affordance on four phones and a sheet — five captions of
              instruction on a section that has been called an instruction
              manual once already. The glyph is the convention and it carries
              on its own. Nothing is lost to a screen reader: the button's
              aria-label was always the whole name, because the media it sits
              on are aria-hidden.
              AT THE TOP (founder, same day). Bottom-anchored it sat on the
              foot of the sheet and the charity row of the phone — the parts
              carrying each one's closing line — and on an expanded medium
              taller than the screen you had to scroll past the whole thing to
              find the way back. sticky keeps it in reach either way. */}
          <span className="sticky top-0 flex size-9 items-center justify-center rounded-full bg-foreground text-background shadow-lg">
            {expanded ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </span>
        </button>
      )}
    </div>
  )
}

export function ProcessOverview() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // ONE BRANCH OF MEDIA, NOT BOTH (2026-08-17). The desktop column pins all
  // six media and cross-fades them; mobile now shows each beat's own beneath
  // its text. Left to CSS alone (`md:hidden` / `hidden md:block`) BOTH sets
  // mount — twelve PackCard/PhoneFrame/TvFrame trees, half of them
  // display:none — which would land the whole desktop column's weight on the
  // phone, the exact device this change is meant to serve. So the branch is
  // chosen in JS. Safe to do here and nowhere else: the media are already
  // client-only behind `mounted` and aria-hidden, so there is no server
  // markup to mismatch and nothing for a crawler to lose.
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return
    const mq = window.matchMedia("(min-width: 768px)")
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  // The beat whose medium is expanded, or null. ONE AT A TIME: the point of
  // collapsing by default is a section that is 4.8 screens rather than 5.9,
  // and four expanded media would be worse than never having collapsed them.
  // Mobile only — the desktop column pins its media and never needed a tap.
  const [expandedBeat, setExpandedBeat] = useState<string | null>(null)

  const [active, setActive] = useState(0)
  const blockRefs = useRef<(HTMLDivElement | null)[]>([])
  // Plain scroll math, not IntersectionObserver — percentage rootMargins
  // proved unreliable across browsers/zoom (founder's tab never advanced
  // the frames). Active = the last step whose block top has crossed 45%
  // of the viewport.
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.45
      let idx = 0
      blockRefs.current.forEach((node, i) => {
        if (node && node.getBoundingClientRect().top <= line) idx = i
      })
      setActive(idx)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    // TINTED again (founder, 2026-08-09 — they preferred it that way, and it
    // was tinted from #536 until the 08-08 reorder forced a parity flip).
    // Retiring Create/Share/Watch freed a band, so the whole page now runs
    // purple · tint · white · muted · white · tint · purple with no two pale
    // bands touching — bg-muted and --band-tint are close enough that adjacent
    // they read as one.
    // overflow-x-clip, not -hidden: the TV's vignette is authored oversized so
    // it survives being scaled down, and in the right-hand column its spill
    // ran 34px past the page edge and put the whole document into horizontal
    // scroll. `clip` contains it WITHOUT creating a scroll container — which
    // `hidden` would, re-anchoring the sticky column to this section and
    // killing the pinned media (the display screen uses clip for the same
    // reason).
    // id="how" is the hero's secondary CTA target (2026-08-17): the home hero
    // asks a visitor to "Create a favpoll" before anything has said what a
    // favpoll IS, so it now offers this section as the other path. scroll-mt-14
    // = 56px = the header's exact height, the same figure /features uses.
    <section
      id="how"
      className="w-full scroll-mt-14 overflow-x-clip bg-primary/5"
    >
      <div className="mx-auto w-full max-w-330 px-6 py-16">
        {/* 5 columns, not 3 (2026-08-06): the display still is a 900px-wide
            desktop layout, and the old third-column width put its ranking
            labels near 6px. Two of five gives the media ~478px at 1280 and
            costs the text nothing — it is max-w-md either way. */}
        <div className="grid gap-6 md:grid-cols-5">
          {/* Text column — pinned headline, then the SCROLLING beat texts.
              The bottom padding is travel for the sticky media, not spacing:
              without it the column ran out exactly as the LAST beat became
              active, so the TV — the payoff of the whole arc — pinned for a
              moment and then scrolled away under the nav. */}
          {/* min-w-0 is load-bearing. A grid item will not shrink below its
              min-content, and the media inside are 414-1160px wide objects, so
              without it the column takes the widest thing max-w-lg allows —
              512px inside a 342px track — and every beat's text wraps at 512
              and runs off the right of the phone. That was the first bug of
              this whole run and it comes straight back the moment the media
              are in normal flow, which panning requires them to be. */}
          <div className="min-w-0 md:col-span-3 md:pb-[30vh]">
            {/* Pinned header (the Goodstack stills): solid backdrop so the
                scrolling step texts vanish beneath it, not through it. */}
            {/* Backdrop follows the band: bg-band-tint, the measured opaque
                composite of bg-primary/5 over the page. Getting this wrong is
                what left the header transparent for its whole life before
                2026-08-06. */}
            {/* EYEBROW ONLY, no headline (founder, 2026-08-09, after five
                attempts none of which landed). This column is STICKY — it
                stays pinned for the ~300vh it takes to scroll six beats, so
                by dwell time it is the most-looked-at line on the page. A
                merely-fine heading becomes irritating at that duration, which
                is the bar nothing cleared. It is also the third piece of
                framing on a section whose six beats are already labelled and
                numbered. The capability grid and "Open right now" are both
                eyebrow-only for the same reason.

                Rendered as the h2 so the beat labels below do not skip a
                level. The solid backdrop and its fade still have to clear the
                text's descenders before the gradient does the work, or the
                scrolling beats read THROUGH the header rather than under it. */}
            {/* THE SCRIM IS md: ONLY (2026-08-18). The backdrop and its fade
                exist so the scrolling beats vanish UNDER a pinned header —
                which only happens at md:, where the header is sticky. On a
                phone it is position:relative and nothing scrolls beneath it,
                but the ::after gradient rendered anyway: 144px of band-tint
                fading down over whatever followed. Beat 1's label sits 48px
                below the header, so the first beat of the section was always
                greyed out, and looked like the desktop opacity treatment
                leaking onto mobile. It was not — the beat's own opacity was 1
                the whole time, it was being painted over. */}
            <div className="relative z-10 bg-band-tint pb-8 md:sticky md:top-28 md:before:absolute md:before:inset-x-0 md:before:bottom-full md:before:h-14 md:before:bg-band-tint md:after:absolute md:after:inset-x-0 md:after:top-full md:after:h-36 md:after:bg-gradient-to-b md:after:from-band-tint md:after:via-band-tint/80 md:after:to-transparent">
              <SectionEyebrow as="h2">
                {t("home.overview.eyebrow")}
              </SectionEyebrow>
            </div>
            {BEATS.map((beat, i) => (
              <div
                key={beat.key}
                data-beat={beat.key}
                ref={(node) => {
                  blockRefs.current[i] = node
                }}
                className={cn(
                  "flex max-w-lg flex-col justify-center transition-opacity duration-300 md:min-h-[50vh]",
                  "max-md:mt-12",
                  i === active ? "md:opacity-100" : "md:opacity-30"
                )}
              >
                <p className="mb-2 text-sm font-medium tracking-widest text-primary uppercase">
                  {i + 1}. {beat.label}
                </p>
                {/* Up from text-lg (founder, 2026-08-17). On desktop this
                    column is sticky for the ~300vh the six beats take, so it
                    is the longest-dwelt copy on the site; on mobile it is the
                    only thing carrying the explanation. max-w-lg with it, or
                    24px type in a 28rem column runs to ~30 characters a line
                    and reads as a narrow ribbon. */}
                <p className="text-xl leading-relaxed text-muted-foreground md:text-2xl">
                  {withNextToken(beat.body)}
                </p>
                {/* MOBILE: this beat's OWN medium, under its text (founder,
                    2026-08-17). The section used to stack six texts on mobile
                    and then show ONE phone still at the very bottom, so the
                    arc's two ends — the printed card a guest scans, and the
                    display in the room — were desktop-only, and the card that
                    carries the instructions was never seen on the device most
                    visitors are holding. Same six media the desktop column
                    pins; no extra components mounted. */}
                <div className="mt-6 md:hidden">
                  {mounted && !isDesktop && (
                    <MobileWell
                      beat={beat}
                      expanded={expandedBeat === beat.key}
                      onToggle={() =>
                        setExpandedBeat((k) =>
                          k === beat.key ? null : beat.key
                        )
                      }
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Media column — pinned, bare, one frame per beat */}
          {/* z-20, above the pinned header's z-10 backdrop. The header has to
              paint over the scrolling step TEXT, but it is opaque and spans
              its own column, so it was also slicing the TV's vignette off in
              a straight vertical line at the column boundary. The two never
              overlap horizontally except for that soft bleed, which should
              pass over the header, not under it. */}
          <div
            className="relative z-20 hidden md:col-span-2 md:block"
            aria-hidden="true"
          >
            <div className="sticky top-28">
              <div
                className={cn(
                  "pointer-events-none relative w-full select-none",
                  WELL
                )}
              >
                {mounted &&
                  isDesktop &&
                  BEATS.map((beat, i) => (
                    <div
                      key={beat.key}
                      className={cn(
                        "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
                        i === active ? "opacity-100" : "opacity-0"
                      )}
                    >
                      <BeatMedium medium={beat.medium} />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* No trailing mobile frame: each beat now carries its own, above. */}
        </div>
      </div>
    </section>
  )
}
