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
// pages' own heroes, and back/next wear the hero's own outline idiom.
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
import { useEffect, useState, useSyncExternalStore } from "react"
import { Balloon, Flower2, Medal, type LucideIcon } from "lucide-react"
import { LandingHero } from "@/components/landing/hero"
import {
  FUNDRAISER_SCENE,
  WEDDING_SCENE,
} from "@/components/landing/demo-fixture"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { t } from "@/lib/i18n"

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
  /** The wizard's own register glyphs (event-step.tsx), so the hero's
   *  buttons and the Event step agree on what a register looks like. */
  icon: LucideIcon
  hero: React.ComponentProps<typeof LandingHero>
}> = [
  {
    palette: "memorial",
    label: t("home.router.memorials.title"),
    icon: Flower2,
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
    icon: Balloon,
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
    icon: Medal,
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
  const at = (by: 1 | -1) => (index + by + SLIDES.length) % SLIDES.length
  const step = (by: 1 | -1) => {
    setIndex(at(by))
    setEpoch((e) => e + 1)
  }

  return (
    <div
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
              {/* px-6 on top of the register's own band classes: room for
                  the side buttons. The hero's content rail becomes 48px on
                  home against 24px on the register pages — the one visible
                  departure from "exactly as they are". */}
              <LandingHero
                {...slide.hero}
                bandClassName="bg-primary px-6 text-primary-foreground"
              />
            </div>
          )
        })}
      </div>

      {/* Back and next AT THE SIDES (founder, 2026-10-15: "where they
          belong"): one at each edge of the band, vertically centred, in the
          hero's outline idiom. Each wears the glyph of the register it LEADS
          TO rather than a chevron — so the button is a door, not an arrow:
          you can see which register is behind it before you press. On hover
          or keyboard focus the circle widens into a pill and the register's
          NAME opens inside it (founder, same day: inside the button, not a
          tooltip), each growing INTO the band — label after the glyph on the
          left, before it on the right. Touch has no hover, so there it stays
          a glyph; the aria-label carries direction and name for everyone.
          48px circle, 24px glyph: at the Button default of 16 the glyphs
          read as dots (founder).
          The buttons overlay the band, not the content — the section carries
          px-6 (see bandClassName above) so the hero's own rail steps in to
          48px and a 40px button at 8px from the edge never touches a
          headline or the phone. */}
      {(
        [
          ["Previous", -1, "left-2"],
          ["Next", 1, "right-2"],
        ] as const
      ).map(([direction, by, side]) => {
        const target = SLIDES[at(by)]
        const Icon = target.icon
        const label = (
          <span
            aria-hidden="true"
            className={cn(
              "max-w-0 overflow-hidden text-sm font-medium whitespace-nowrap opacity-0 transition-all duration-300",
              "group-hover/button:max-w-40 group-hover/button:opacity-100 group-focus-visible/button:max-w-40 group-focus-visible/button:opacity-100",
              by === 1
                ? "group-hover/button:mr-2 group-focus-visible/button:mr-2"
                : "group-hover/button:ml-2 group-focus-visible/button:ml-2"
            )}
          >
            {target.label}
          </span>
        )
        return (
          <div
            key={direction}
            className={cn("absolute inset-y-0 z-10 flex items-center", side)}
          >
            <Button
              type="button"
              variant="ghost"
              aria-label={`${direction}: ${target.label}`}
              onClick={() => step(by)}
              className="h-12 gap-0 rounded-full border border-primary-foreground/30 px-3 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              {by === 1 && label}
              <Icon aria-hidden="true" className="size-6" />
              {by === -1 && label}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
