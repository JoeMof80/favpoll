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
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { TvFrame } from "@/components/hero-demo-panel/tv-frame"
import { PhoneFrame } from "@/components/hero-demo-panel/phone-frame"
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
const CARD_SCALE =
  "scale-[0.80] min-[380px]:scale-100 md:scale-[0.75] lg:scale-100 xl:scale-[1.15]"
// Down from the browser-framed version: the TV bezel adds 20px each way
// (940 overall), and at xl the old 0.53 already sat within a pixel of the
// column's width.
const DISPLAY_SCALE =
  "scale-[0.23] min-[380px]:scale-[0.29] md:scale-[0.23] lg:scale-[0.32] xl:scale-[0.41]"

// MOBILE WELLS (2026-08-17). A transform-scaled element keeps its UNSCALED
// layout box, which is why every medium needs a fixed well to sit in rather
// than being allowed to size itself. These are the base scales above applied
// to each object's real size: phone 868 x 0.52, card 204 x 0.75, display
// 580 x 0.28, rounded up for the drop shadow and the card's 2° tilt.
//
// They only hold because EVERY medium is shrink-0 (see BeatMedium). The wells
// are row-direction flex boxes and each medium carries an explicit width — the
// phone its chassis, the display a w-[900px] child, the keepsake its A4 page —
// so without it flex squeezes the box narrower than its content, the content
// wraps and grows taller than the well, and it spills over the beats either
// side. That is what broke Watch it live on mobile: a 940-wide TV crushed into
// a phone's width, rendering ~680px tall inside a 184px well.
//
// WIDTH IS THE OTHER HALF, and it was missing (2026-08-18). The unscaled box
// is as wide as it is tall — phone 414, keepsake 794, TV 940 — and while it
// sat in normal flow it set the text column's MIN-CONTENT width. A grid item
// cannot shrink below that, so the column took the widest thing max-w-lg would
// allow, 512px, inside a 342px track: every beat's text then wrapped at 512
// and ran 146px past the right edge, where the section's overflow-x-clip cut
// it off mid-word rather than scrolling. Measured at 390px: text column 512,
// body right edge 536, grid scrollWidth 726 against a 342 track.
//
// So the medium is ABSOLUTELY POSITIONED in the well now. Out of flow, it
// contributes no width at all, and the well is free to be w-full. Centring is
// left-1/2 with -translate-x-1/2: the translate resolves against the medium's
// own unscaled width and the scale runs about its centre, so both land on the
// same point and the scaled object sits centred. No per-medium width constants
// — the visual widths (card ~251, phone ~215, display ~263, keepsake ~270)
// would have to be re-derived every time a scale changed.
// display was h-[184px] and the TV rendered 340 (2026-08-18) — 78px spilling
// out of each end of the well and landing on the beat above and the heading
// below. The 184 came from the note above: 580 unscaled x 0.28. But the still
// is not 580 tall any more and has not been for some time — it is content-
// sized on purpose ("No crop", see BeatMedium), and it has since gained the
// goal bar, the charity row, six ranking rows, the QR and the wall. A derived
// constant with nothing checking it goes stale in exactly this silent way, so
// the mobile spec now asserts every medium fits inside its own well.
const MOBILE_WELL: Record<Medium["kind"], string> = {
  phone: "h-[451px]",
  card: "h-[176px] min-[380px]:h-[220px]",
  // Both LANDSCAPE since 2026-08-18, so both cost a fraction of the height
  // they did: the display renders 1160 x 697 at 0.23 (160 tall, was 340) and
  // the keepsake 1123 x 794 at 0.24 (191, was 390). Measured, not derived —
  // the mobile spec asserts the medium fits its well, and these were 90 and
  // 100px too tall when the shapes changed under them.
  display: "h-[168px] min-[380px]:h-[210px]",
  keepsake: "h-[200px] min-[380px]:h-[248px]",
}

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
const A4_LANDSCAPE = { w: 1123, h: 794 }
// Width ~270 / ~373 / ~453 against a ~273 / ~376 / ~478px column; the xl step
// is held at 0.57 rather than 0.60 so the 1123 of height stays inside the
// 651px well rather than overflowing it by 23px.
const KEEPSAKE_SCALE =
  "scale-[0.24] min-[380px]:scale-[0.30] md:scale-[0.24] lg:scale-[0.33] xl:scale-[0.42]"

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

function BeatMedium({ medium }: { medium: Medium }) {
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
          CARD_SCALE,
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
          KEEPSAKE_SCALE
        )}
        style={{ width: A4_LANDSCAPE.w, height: A4_LANDSCAPE.h }}
      >
        <KeepsakeDocument
          data={DEMO_KEEPSAKE_WALKTHROUGH_DATA}
          variant="tribute"
          orientation="landscape"
        />
      </div>
    )
  }
  if (medium.kind === "display") {
    return (
      <div className={cn("shrink-0", DISPLAY_SCALE)}>
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
    <div className={cn("shrink-0", PHONE_SCALE)}>
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
          <div className="md:col-span-3 md:pb-[30vh]">
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
                    <div
                      aria-hidden="true"
                      data-beat-well=""
                      className={cn(
                        "pointer-events-none relative w-full select-none",
                        MOBILE_WELL[beat.medium.kind]
                      )}
                    >
                      <div
                        data-beat-media=""
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      >
                        <BeatMedium medium={beat.medium} />
                      </div>
                    </div>
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
