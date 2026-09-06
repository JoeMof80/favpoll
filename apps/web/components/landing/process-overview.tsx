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
import Link from "next/link"
import {
  REGISTER_LINK_HOVER,
  REGISTER_LINK_INK,
} from "@/components/register-link"
import { paletteForSceneKind } from "@/lib/register-palette"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { TvFrame } from "@/components/hero-demo-panel/tv-frame"
import {
  PhoneFrame,
  PHONE_CHASSIS_WIDTH,
  PHONE_CHASSIS_HEIGHT,
  PHONE_SCALE,
} from "@/components/hero-demo-panel/phone-frame"
import { PackCard } from "@/components/print-pack/pack-card"
import {
  DEMO_SCENE as SCENE,
  DEMO_QR_URL,
  DEMO_PACK_DATA as PACK_DATA,
  DEMO_PACK_STEPS as PACK_STEPS,
  DEMO_KEEPSAKE_WALKTHROUGH_DATA,
} from "@/components/landing/demo-fixture"
import { KeepsakeSheet } from "@/components/keepsake/keepsake-sheet"
import {
  DisplayStill,
  DISPLAY_STILL_ROOM,
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

// FIRST MENTIONS LINK TO THE REFERENCE (founder, 2026-09-03, extending
// the triad/ideas doctrine to the homepage walkthrough): the terms that
// NAME a feature link to its /features section, first occurrence per
// beat, quiet ink. Only naturally-occurring names — "shared fund" and
// "printed stationery" — are in the table; the reveal, room and
// keepsake beats carry no clean term in their bodies and stay plain
// rather than force one. Structural: the founder's copy strings are
// untouched.
const LINK_TERMS: { term: string; href: string }[] = [
  { term: "shared fund", href: "/features#shared-fund" },
  { term: "printed stationery", href: "/features#stationery" },
]

function linkifyTerms(body: string): React.ReactNode {
  for (const { term, href } of LINK_TERMS) {
    const at = body.indexOf(term)
    if (at === -1) continue
    return (
      <>
        {body.slice(0, at)}
        <Link
          href={href}
          className="text-primary underline-offset-4 hover:underline"
        >
          {term}
        </Link>
        {body.slice(at + term.length)}
      </>
    )
  }
  return body
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
const CARD_SCALE = "scale-[0.75] lg:scale-100 xl:scale-[1.15]"
// ROOM MODE (founder, 2026-08-31: "update the live screen on the homepage to
// be more realistic, like we did on the register pages"). The beat used to
// show the tall 1120px still; it now shows what /memorials and /celebrations
// show — the real 16:9 screen, the brand mark in the corner, the way the
// display fills a TV. 1920 wide plus the bezel is 1960, so the column widths
// above (273 / 376 / 478) give these scales; the TV stands 1120 tall
// unscaled, which at every stop sits inside the well the phone sets.
const DISPLAY_SCALE = "scale-[0.139] lg:scale-[0.19] xl:scale-[0.243]"

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
  display: { w: DISPLAY_STILL_ROOM.w + 40, h: DISPLAY_STILL_ROOM.h + 40 },
  keepsake: { w: 794, h: 1123 },
}

// EXPANDED IS FILL-THE-COLUMN, nothing more (founder, 2026-08-18: "keepsake
// expands too much"). It was a legibility scale — 0.7 — which put the sheet
// at 556 wide and panning, and a document you have to drag sideways to read
// on a marketing page is a worse answer than a small one you can see whole.
// So expanding just lifts the thumbnail cap: the phone goes 215 -> 342, the
// keepsake 238 -> 342. Nothing pans anywhere now.

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
// Width ~270 / ~373 / ~453 against a ~273 / ~376 / ~478px column; the xl step
// is held at 0.57 rather than 0.60 so the 1123 of height stays inside the
// 651px well rather than overflowing it by 23px.
const KEEPSAKE_SCALE = "scale-[0.34] lg:scale-[0.47] xl:scale-[0.57]"

// The "click Next" token is gone with the copy that carried it (founder,
// 2026-08-18). Step 3 now ends "Can't decide? Give to the shared fund
// instead", so there is no control to name and nothing to weight — the
// {next} placeholder, NEXT_TOKEN and withNextToken went with it.

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
        data-register={paletteForSceneKind(SCENE.kind)}
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
      // TRIBUTE: the walkthrough runs on a scene with a protagonist now, so
      // the sheet leads on the person rather than on what was raised — the
      // keepsake at its fullest rather than its second telling.
      //
      // The paper mount, the load-bearing shrink-0 and the explicit A4 box
      // now live in KeepsakeSheet, shared with the /memorials Ideas section
      // (2026-08-27). The reasoning for each is recorded there.
      <div data-register={paletteForSceneKind(SCENE.kind)} className="contents">
        <KeepsakeSheet
          data={DEMO_KEEPSAKE_WALKTHROUGH_DATA}
          variant="tribute"
          orientation="portrait"
          className={cn(!bare && KEEPSAKE_SCALE)}
        />
      </div>
    )
  }
  if (medium.kind === "display") {
    return (
      <div
        data-register={paletteForSceneKind(SCENE.kind)}
        // theme-light: a screen in a TV keeps light mode whatever the page's
        // theme (founder, 2026-08-31) — see register-tokens.css.
        className={cn("theme-light shrink-0", !bare && DISPLAY_SCALE)}
      >
        <TvFrame>
          {/* The screen itself, 16:9 — what the projector shows, not a cropped
              page (room mode, 2026-08-31). */}
          <div style={{ width: DISPLAY_STILL_ROOM.w }}>
            <DisplayStill scene={SCENE} qrUrl={DEMO_QR_URL} room />
          </div>
        </TvFrame>
      </div>
    )
  }
  return (
    <div
      // theme-light: a phone in a frame keeps light mode whatever the page's
      // theme (founder, 2026-08-31) — see register-tokens.css.
      className={cn("theme-light shrink-0", !bare && PHONE_SCALE)}
    >
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
// The mobile medium: measured off its own column, and nothing else.
//
// NO EXPAND CONTROL (founder, 2026-08-18): "the user can just pinch their
// screen to view any of the elements properly, right?" Right — the served
// viewport is width=device-width, initial-scale=1 with no maximum-scale and
// no user-scalable=no, so pinch works, and these are real DOM elements rather
// than images, so zooming re-rasterises the type crisply instead of blurring
// it. A toggle was doing, with a button and a state machine, what the
// platform already does with a gesture everybody has.
//
// The deeper correction is worth keeping: on a homepage nobody needs to READ
// a demo keepsake's standings. The seven paragraphs carry the argument and
// the media only have to say that the thing is real and physical. Legibility
// was accepted as a requirement here and never was one.
//
// The scale is MEASURED off the column rather than tuned per breakpoint: see
// NATURAL. It fills the column at any width, so the same code serves a 320px
// phone and a 430px one with nothing to keep in sync — which is what the
// hand-tuned constants that preceded it could not do, three bugs running.
function MobileWell({ beat }: { beat: Beat }) {
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
  // SHADOW_ROOM off the column before fitting, so the object sits ON the band
  // rather than butting against its edges.
  const fit = columnWidth ? (columnWidth - SHADOW_ROOM * 2) / natural.w : 0
  const cap = COLLAPSED_CAP[beat.medium.kind]
  const scale = cap ? Math.min(fit, cap) : fit
  const width = natural.w * scale
  const height = natural.h * scale

  return (
    <div ref={ref} data-beat-well="" className="relative w-full">
      {/* NOT a clipping box. It was overflow-hidden while an expanded medium
          could be wider than the column and needed to pan; with the toggle
          gone nothing ever exceeds its box, and the clipping was only cutting
          the drop-shadows off square — top and bottom especially, where the
          reserved height is the medium's exact height and left no room at all.
          The shadow is how these read as objects resting on the band rather
          than pasted rectangles, so it is allowed out. */}
      <div
        data-beat-media=""
        aria-hidden="true"
        className="pointer-events-none mx-auto select-none"
        style={{ width: width || undefined, height: height || undefined }}
      >
        {/* The natural width is set HERE, not left to the box. A scaled
            element lays out first and scales after, so this has to be as wide
            as the object really is or the object is laid out into the shrunken
            box instead — which is what clipped the display's 900px screen
            inside its own bezel and left a ~100px sliver of a TV. */}
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
                  {linkifyTerms(beat.body)}
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
                  {mounted && !isDesktop && <MobileWell beat={beat} />}
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
