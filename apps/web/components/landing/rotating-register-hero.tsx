"use client"

// THE HOME HERO IS THE THREE REGISTER HEROES, ROTATED (founder, 2026-10-15).
//
// Gary's cold read of the home page (references/linkedin-feedback-concept-
// clarity-2026-09-23.md) was "what is the vote poll thing about?", and his
// "Got it" came from three SPECIFIC scenarios read in sequence. Two reworks
// of the home hero tried to fix that in place — scenario copy on the router
// cards, then the register pages' still phones in the cards' row — and both
// were rejected on sight. The founder's diagnosis: "the hero content is too
// vague because it tries to cover everything. the register heroes are more
// specific. why not just rotate those exactly as they are, on the homepage?"
//
// So this is exactly that. /memorial, /celebration and /fundraiser each open
// on `LandingHero` configured for their register — eyebrow, headline,
// subheader, CTA pair, one still phone — and this component renders those
// three configurations, unchanged, stacked in one grid cell, and crossfades
// between them. Nothing here is a new idiom: the slides are the register
// pages' own heroes, and back/next are chevrons in the hero's outline idiom.
//
// The mechanics that matter:
// - EACH SLIDE IS ITS OWN REGISTER. `data-register={palette}` (the element-
//   scoped selector in register-tokens.css) recolours the band, ink and
//   buttons per slide. NOT `RegisterScope`: that sets `data-register-page`,
//   which `:root:has()` lifts to the whole document, and three of them on one
//   page would fight for the header and footer.
// - LAYOUT NEVER DEPENDS ON THE ANIMATION. All three slides are always laid
//   out (one grid cell, `col-start-1 row-start-1`), so the band is as tall as
//   the tallest at every width and nothing reflows when the slide changes.
//   Only opacity moves. Inactive slides are `inert` and `aria-hidden`, so the
//   tab order and the accessibility tree see one hero, not three.
// - IT KEEPS TURNING. Back and next move it by hand and restart the dwell
//   from that slide, so the one you asked for gets its full read; a hidden
//   tab skips the tick; reduced motion never starts it. NO HOVER PAUSE: the
//   band fills the viewport, so on a desktop the pointer is almost always
//   over it, and "pause on hover" meant "never rotate" (founder saw exactly
//   that on the first preview, 2026-10-15). Auto-advance exists so a visitor
//   who does nothing still reads all three scenarios — the thing Gary needed.
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { LandingHero } from "@/components/landing/hero"
import {
  FUNDRAISER_SCENE,
  WEDDING_SCENE,
} from "@/components/landing/demo-fixture"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { t } from "@/lib/i18n"
import { setHeroRegister } from "@/lib/hero-register-store"

/** How long each register holds before the next fades in. Long enough to
 *  read a two-sentence headline and glance at the phone; the loop's own
 *  scenes ran ~9s each and nobody asked for faster. */
export const DWELL_MS = 8000

type Palette = "memorial" | "celebration" | "fundraiser"

/** The three register pages' hero calls, verbatim — if one of those pages
 *  changes its hero, change it here too (or, better, lift the props to a
 *  shared constant then). Order is the registers' listing order. */
const SLIDES: ReadonlyArray<{
  palette: Palette
  label: string
  hero: React.ComponentProps<typeof LandingHero>
}> = [
  {
    palette: "memorial",
    label: t("home.router.memorials.title"),
    hero: {
      sceneKind: "memorial",
      still: true,
      eyebrow: t("memorials.eyebrow"),
      headline: t("memorials.headline"),
      subheader: t("memorials.subheader"),
      ctaLabel: t("memorials.cta.primary"),
      ctaHref: "/favpolls/new?category=memorial",
      ctaSecondaryLabel: t("memorials.cta.secondary"),
      hideStats: true,
    },
  },
  {
    palette: "celebration",
    label: t("home.router.celebrations.title"),
    hero: {
      sceneKind: "celebration",
      scene: WEDDING_SCENE,
      still: true,
      eyebrow: t("celebrations.eyebrow"),
      headline: t("celebrations.headline"),
      subheader: t("celebrations.subheader"),
      ctaLabel: t("celebrations.cta.primary"),
      ctaHref: "/favpolls/new?category=celebration",
      ctaSecondaryLabel: t("celebrations.cta.secondary"),
      hideStats: true,
    },
  },
  {
    palette: "fundraiser",
    label: t("home.router.fundraisers.title"),
    hero: {
      sceneKind: "fundraiser",
      scene: FUNDRAISER_SCENE,
      still: true,
      eyebrow: t("fundraisers.eyebrow"),
      headline: t("fundraisers.headline"),
      subheader: t("fundraisers.subheader"),
      ctaLabel: t("fundraisers.cta.primary"),
      ctaHref: "/favpolls/new?category=fundraiser",
      ctaSecondaryLabel: t("fundraisers.cta.secondary"),
      hideStats: true,
    },
  },
]

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function subscribeReducedMotion(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {}
  const mq = window.matchMedia(REDUCED_MOTION)
  mq.addEventListener?.("change", onChange)
  return () => mq.removeEventListener?.("change", onChange)
}

function readReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_MOTION).matches
  )
}

export function RotatingRegisterHero() {
  const [index, setIndex] = useState(0)
  // Bumped by every manual move: the interval effect re-runs on it, which
  // is what restarts the dwell from the slide the visitor chose.
  const [epoch, setEpoch] = useState(0)
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false
  )

  useEffect(() => {
    if (prefersReducedMotion) return
    const id = window.setInterval(() => {
      // A background tab does not read; let it come back to the slide it
      // left rather than three registers further on.
      if (document.visibilityState !== "visible") return
      setIndex((i) => (i + 1) % SLIDES.length)
    }, DWELL_MS)
    return () => window.clearInterval(id)
  }, [epoch, prefersReducedMotion])

  const active = SLIDES[index]

  // THE HEADER FOLLOWS (founder, 2026-10-15): publish the register on show
  // while at least a third of the band is in view; null once it is mostly
  // scrolled past, so the header fades back to blue — a third, not the
  // band's last pixel, which would flicker as a reader scrolls around it.
  // Unmount withdraws it entirely (undefined): the next page's header is
  // its own.
  const root = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.intersectionRatio >= 0.33),
      { threshold: [0, 0.33] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    setHeroRegister(inView ? active.palette : null)
  }, [inView, active.palette])
  useEffect(() => () => setHeroRegister(undefined), [])

  const at = (by: 1 | -1) => (index + by + SLIDES.length) % SLIDES.length
  const step = (by: 1 | -1) => {
    setIndex(at(by))
    setEpoch((e) => e + 1)
  }

  return (
    <div
      ref={root}
      // The ACTIVE register's palette for everything that is not a slide —
      // the buttons' ink and hover wash — so the controls match the band they
      // sit on, and follow it when it changes.
      data-register={active.palette}
      className="relative"
      aria-roledescription="carousel"
      aria-label="A favpoll for each kind of occasion"
    >
      <div className="grid">
        {SLIDES.map((slide, i) => {
          const isActive = i === index
          return (
            <div
              key={slide.palette}
              data-register={slide.palette}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slide.label} (${i + 1} of ${SLIDES.length})`}
              aria-hidden={!isActive}
              inert={!isActive}
              className={cn(
                "col-start-1 row-start-1 motion-safe:transition-opacity motion-safe:duration-700",
                isActive ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            >
              {/* THE RAIL MEETS THE WORDMARK'S INK (founder, 2026-10-15:
                  "set the margin to the brand text so the content lines up
                  too"). Measured, not computed: the box maths said 56px
                  (24 header padding + 24 mark + 8 gap) but the founder's
                  screenshots at 2x put the wordmark's first stroke at 54,
                  and the hero's eyebrow sits on its rail with no bearing of
                  its own — so the band carries 30px on top of the
                  container's 24. Holds below ~1400px, where the page's
                  1320px column meets the edge; above it the column is
                  centred with every section beneath — the founder's call,
                  twice (a left-anchored column at every width was built and
                  rejected: "it's only at lower resolution that we need the
                  content to line up with the wordmark"). NOT ON PHONES:
                  below sm the band adds nothing and the rail is the
                  container's own 24 — the 54px version was built and
                  reverted the same day ("it wastes too much space"). */}
              <LandingHero
                {...slide.hero}
                stillActive={isActive}
                ctaAfterMedia
                bandClassName="bg-primary text-primary-foreground sm:px-[30px]"
              />
            </div>
          )
        })}
      </div>

      {/* Back and next AT THE SIDES (founder, 2026-10-15: "where they
          belong"): one at each edge of the band, vertically centred. BARE
          CHEVRONS, LARGE, NO CIRCLE, NO LABEL (founder, 2026-10-15, after
          outline circles and register glyphs were both tried): a 40px
          arrow in band ink, dimmed until hovered. ON THE MARK'S LINE, INK
          TO INK (founder, same day: "the chevrons don't quite align with
          the brandmark either. they should"): lucide's chevron stroke
          starts 15px into its 40px box, so the box sits 9px in and the
          stroke begins at 24 — where the header's mark begins — and the
          box ends at 49, inside the 54px rail. Mirrored on the right. AT
          EVERY WIDTH: a row of both under the phone was built for phones
          and reverted the same hour ("move the chevrons back!!!!"). Below
          sm the rail is 24, so the boxes sit at the edge and the stroke
          (15–25) lives in the gutter. */}
      {(
        [
          ["Previous kind of favpoll", -1, ChevronLeft, "left-0 sm:left-[9px]"],
          ["Next kind of favpoll", 1, ChevronRight, "right-0 sm:right-[9px]"],
        ] as const
      ).map(([label, by, Icon, side]) => (
        <div
          key={label}
          className={cn("absolute inset-y-0 z-10 flex items-center", side)}
        >
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={label}
            onClick={() => step(by)}
            className="size-10 rounded-md p-0 text-primary-foreground/70 hover:bg-transparent hover:text-primary-foreground"
          >
            <Icon aria-hidden="true" className="size-10" strokeWidth={1.5} />
          </Button>
        </div>
      ))}
    </div>
  )
}
