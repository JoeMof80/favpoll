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
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { DemoFrame } from "@/components/hero-demo-panel/demo-frame"
import { PhoneFrame } from "@/components/hero-demo-panel/phone-frame"
import { SCENES } from "@/components/hero-demo-panel/scenes"
import { PackCard, buildPackSteps } from "@/components/print-pack/pack-card"
import { DisplayStill } from "@/components/landing/display-still"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { PackData } from "@/components/print-pack/pack-card"
import type { Phase } from "@/components/hero-demo-panel/scenes"

// The CAUSE scene (founder, 2026-08-06), not the memorial one. This is the
// most neutral of the four — no protagonist, so the guest arc reads as the
// mechanic itself rather than as one register's story — and the register
// cards in the hero above have already covered the protagonist-shaped types.
// Its reveal is an impact line rather than someone's favourite, which is what
// a cause favpoll actually shows.
const SCENE = SCENES.find((s) => s.kind === "cause") ?? SCENES[0]

// A demo short link, in the real /p/<code> form the pack's QR encodes — 12
// hex characters, which is what keeps the printed code at 33x33 rather than
// the 49x49 the old /favpolls/<uuid> URL forced.
const DEMO_QR_URL = "https://favpoll.com/p/a1b2c3d4e5f6"

const PACK_DATA: PackData = {
  prefix: SCENE.eyebrow ?? "A cause",
  name: SCENE.heading ?? "",
  isCause: true,
  topicTitle: SCENE.poll.topic.title,
  hasReveal: !!SCENE.poll.personal_reveal,
  charityNames: SCENE.charities.map((c) => c.name),
  qrUrl: DEMO_QR_URL,
}
const PACK_STEPS = buildPackSteps(PACK_DATA)

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
//   display — 900 x 596, wide enough to keep the display's md: two-column
//             banner (below it the layout collapses to its mobile form and
//             stops reading as a screen in a room)
// Scales are per-breakpoint and fixed rather than computed: the column is
// ~273 / ~376 / ~478 px at md / lg / xl, and the phone is the tallest, so it
// sets the well height at each stop.
const WELL = "h-[451px] lg:h-[608px] xl:h-[651px]"
const PHONE_SCALE = "scale-[0.52] lg:scale-[0.70] xl:scale-[0.75]"
const CARD_SCALE = "scale-[0.75] lg:scale-100 xl:scale-[1.15]"
const DISPLAY_SCALE = "scale-[0.30] lg:scale-[0.41] xl:scale-[0.53]"

function BeatMedium({ medium }: { medium: Medium }) {
  if (medium.kind === "card") {
    return (
      // .paper pins the light token values, exactly as the print pack does.
      // Without it a dark-mode visitor gets the card's forced bg-white under
      // dark-mode ink — the blank-card failure #535 fixed on the pack, which
      // this still would otherwise reintroduce on the homepage.
      // Tilted a couple of degrees: an object resting on a table, not a
      // screenshot of one.
      <div className={cn("paper drop-shadow-xl", CARD_SCALE, "-rotate-2")}>
        <PackCard data={PACK_DATA} steps={PACK_STEPS} scale="wallet" />
      </div>
    )
  }
  if (medium.kind === "display") {
    return (
      <div className={DISPLAY_SCALE}>
        <div className="h-[596px] w-[900px]">
          <DemoFrame>
            {/* Cropped, not scrolled: a projected display shows its leaders
                and never scrolls. */}
            <div className="h-[560px] overflow-hidden">
              <DisplayStill scene={SCENE} qrUrl={DEMO_QR_URL} />
            </div>
          </DemoFrame>
        </div>
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
    // Tinted band, swapped with the Create/Share/Watch section below (founder,
    // 2026-08-06). That section and RegisterMatrix were BOTH bg-primary/5, so
    // the page ran two tinted bands back to back; the swap restores the
    // alternation (purple · tint · white · tint · white).
    <section className="w-full bg-primary/5">
      <div className="mx-auto w-full max-w-330 px-6 py-16">
        {/* 5 columns, not 3 (2026-08-06): the display still is a 900px-wide
            desktop layout, and the old third-column width put its ranking
            labels near 6px. Two of five gives the media ~478px at 1280 and
            costs the text nothing — it is max-w-md either way. */}
        <div className="grid gap-6 md:grid-cols-5">
          {/* Text column — pinned headline, then the SCROLLING beat texts */}
          <div className="md:col-span-3">
            {/* Pinned header (the Goodstack stills): solid backdrop so the
                scrolling step texts vanish beneath it, not through it. */}
            <div className="relative z-10 bg-band-tint pb-6 before:absolute before:inset-x-0 before:bottom-full before:h-14 before:bg-band-tint after:absolute after:inset-x-0 after:top-full after:h-20 after:bg-gradient-to-b after:from-band-tint after:to-transparent md:sticky md:top-28">
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
          </div>

          {/* Media column — pinned, bare, one frame per beat */}
          <div
            className="relative hidden md:col-span-2 md:block"
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
