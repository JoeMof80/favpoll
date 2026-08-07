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
// The bookends are deliberately UNNUMBERED. The four guest beats are things
// a guest does; the card and the screen are the organiser's. Numbering all
// six 1–6 would have mixed the two actors in one list.

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { TvFrame } from "@/components/hero-demo-panel/tv-frame"
import { PhoneFrame } from "@/components/hero-demo-panel/phone-frame"
import { PackCard } from "@/components/print-pack/pack-card"
import {
  DEMO_SCENE as SCENE,
  DEMO_QR_URL,
  DEMO_PACK_DATA as PACK_DATA,
  DEMO_PACK_STEPS as PACK_STEPS,
} from "@/components/landing/demo-fixture"
import { DisplayStill } from "@/components/landing/display-still"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { Phase } from "@/components/hero-demo-panel/scenes"

type Medium =
  | { kind: "card" }
  | { kind: "phone"; phase: Phase }
  | { kind: "display" }

type Beat = {
  key: string
  label: string
  body: string
  medium: Medium
  /** Guest beats are numbered; the organiser's bookends are not. */
  numbered: boolean
}

const BEATS: Beat[] = [
  {
    key: "card",
    label: t("landing.how.card.label"),
    body: t("landing.how.card.body"),
    medium: { kind: "card" },
    numbered: false,
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
    numbered: true,
  },
  {
    key: "selected",
    label: t("landing.how.pick.label"),
    body: t("landing.how.pick.body"),
    medium: { kind: "phone", phase: "selected" },
    numbered: true,
  },
  {
    key: "amount-picked",
    label: t("landing.how.pledge.label"),
    body: t("landing.how.pledge.body"),
    medium: { kind: "phone", phase: "amount-picked" },
    numbered: true,
  },
  {
    key: "reveal",
    label: t("landing.how.reveal.label"),
    body: t("landing.how.reveal.body"),
    medium: { kind: "phone", phase: "reveal" },
    numbered: true,
  },
  {
    key: "room",
    label: t("landing.how.room.label"),
    body: t("landing.how.room.body"),
    medium: { kind: "display" },
    numbered: false,
  },
]

// Running 1–4 across the numbered beats only.
const NUMBERS = BEATS.reduce<(number | null)[]>((acc, beat) => {
  const used = acc.filter((n) => n !== null).length
  acc.push(beat.numbered ? used + 1 : null)
  return acc
}, [])

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
const PHONE_SCALE = "scale-[0.52] lg:scale-[0.70] xl:scale-[0.75]"
const CARD_SCALE = "scale-[0.75] lg:scale-100 xl:scale-[1.15]"
// Down from the browser-framed version: the TV bezel adds 20px each way
// (940 overall), and at xl the old 0.53 already sat within a pixel of the
// column's width.
const DISPLAY_SCALE = "scale-[0.28] lg:scale-[0.39] xl:scale-[0.50]"

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
          "paper paper-screen drop-shadow-xl",
          CARD_SCALE,
          "-rotate-2"
        )}
      >
        <PackCard data={PACK_DATA} steps={PACK_STEPS} scale="wallet" />
      </div>
    )
  }
  if (medium.kind === "display") {
    return (
      <div className={DISPLAY_SCALE}>
        <TvFrame>
          {/* No crop: the still shows its leaders and ends where they do — a
              fixed height cut the last bar in half and read as a broken
              screenshot rather than a screen. */}
          <div className="w-[900px]">
            <DisplayStill scene={SCENE} qrUrl={DEMO_QR_URL} />
          </div>
        </TvFrame>
      </div>
    )
  }
  return (
    <div className={PHONE_SCALE}>
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
    // WHITE band (founder reorder, 2026-08-08). It was tinted in #536 to keep
    // the page alternating; moving Create/Share/Watch to the closing sequence
    // removed a white band from between this and RegisterMatrix, which flipped
    // the parity of everything after it. Flipping this one back costs two
    // changes; flipping RegisterMatrix instead cascaded into five.
    // overflow-x-clip, not -hidden: the TV's vignette is authored oversized so
    // it survives being scaled down, and in the right-hand column its spill
    // ran 34px past the page edge and put the whole document into horizontal
    // scroll. `clip` contains it WITHOUT creating a scroll container — which
    // `hidden` would, re-anchoring the sticky column to this section and
    // killing the pinned media (the display screen uses clip for the same
    // reason).
    <section className="w-full overflow-x-clip">
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
            {/* Backdrop follows the band: bg-background now this section is
                white. --band-tint stays defined for the next tinted band that
                needs an opaque header — it is the composite of bg-primary/5
                over the page, measured, and getting it wrong is what left
                this header transparent for its whole life before 2026-08-06. */}
            {/* pb-8 and a 36-deep fade, up from pb-6/h-20: the headline runs
                to two lines now, so beats reached the fade sooner and their
                text was legible THROUGH it rather than dissolving under it.
                The solid backdrop has to clear the header's own descenders
                before the gradient starts doing the work. */}
            <div className="relative z-10 bg-background pb-8 before:absolute before:inset-x-0 before:bottom-full before:h-14 before:bg-background after:absolute after:inset-x-0 after:top-full after:h-36 after:bg-gradient-to-b after:from-background after:via-background/80 after:to-transparent md:sticky md:top-28">
              <SectionEyebrow className="mb-2">
                {t("home.overview.eyebrow")}
              </SectionEyebrow>
              <h2 className="max-w-md text-3xl font-light tracking-tight text-foreground md:text-4xl">
                {t("home.overview.headline")}
              </h2>
            </div>
            {BEATS.map((beat, i) => (
              <div
                key={beat.key}
                ref={(node) => {
                  blockRefs.current[i] = node
                }}
                className={cn(
                  "flex max-w-md flex-col justify-center transition-opacity duration-300 md:min-h-[50vh]",
                  "max-md:mt-10",
                  i === active ? "md:opacity-100" : "md:opacity-30"
                )}
              >
                <p
                  className={cn(
                    "mb-2 text-xs font-medium tracking-widest uppercase",
                    // The bookends are the organiser's, and read quieter for
                    // it — same rhythm, no number, muted.
                    beat.numbered ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {NUMBERS[i] !== null && `${NUMBERS[i]}. `}
                  {beat.label}
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {beat.body}
                </p>
              </div>
            ))}

            {/* ONE link, at the end of the arc. The temptation was a link per
                beat, pointing at a features section each — but this is a
                narrative whose whole mechanic is continuous downward scroll,
                and six exits mid-story turn it into a menu. Six anchors held
                in step with another page's headings would also be one more
                thing defined twice. */}
            <div className="max-w-md pt-4 max-md:mt-10">
              <Link
                href="/features"
                className="text-base font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("home.overview.more")}
              </Link>
            </div>
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

          {/* Mobile — a single static frame beneath the texts */}
          <div
            className="pointer-events-none flex justify-center select-none md:hidden"
            aria-hidden="true"
          >
            {mounted && (
              <div className="flex h-[451px] items-center justify-center">
                <BeatMedium medium={{ kind: "phone", phase: "reveal" }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
