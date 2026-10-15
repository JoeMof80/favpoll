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
// pages' own heroes, and the pills are the kind nav the looping demo had.
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
// - IT STOPS THE MOMENT SOMEONE TOUCHES IT. A pill click ends the rotation
//   for good; hover or focus pauses it; a hidden tab skips the tick; reduced
//   motion never starts it. Auto-advance exists so a visitor who does nothing
//   still reads all three scenarios — the thing Gary needed — not to take the
//   choice away from one who does.
import { useEffect, useState, useSyncExternalStore } from "react"
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
  // A click is a decision, and the rotation respects it permanently; hover
  // and focus are attention, and only hold it while they last.
  const [stopped, setStopped] = useState(false)
  const [held, setHeld] = useState(false)
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false
  )

  useEffect(() => {
    if (stopped || held || prefersReducedMotion) return
    const id = window.setInterval(() => {
      // A background tab does not read; let it come back to the slide it
      // left rather than three registers further on.
      if (document.visibilityState !== "visible") return
      setIndex((i) => (i + 1) % SLIDES.length)
    }, DWELL_MS)
    return () => window.clearInterval(id)
  }, [stopped, held, prefersReducedMotion])

  const active = SLIDES[index]

  return (
    <div
      // The ACTIVE register's palette for everything that is not a slide —
      // the pills' ink and hover wash — so the controls match the band they
      // sit on, and follow it when it changes.
      data-register={active.palette}
      className="relative"
      aria-roledescription="carousel"
      aria-label="A favpoll for each kind of occasion"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          setHeld(false)
      }}
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
              {/* pb-16 under the register's own band classes: the pills
                  overlay the band's bottom edge, and on a short phone the
                  hero's content reaches it. The padding reserves that strip
                  so nothing ever sits under a pill. */}
              <LandingHero
                {...slide.hero}
                bandClassName="bg-primary pb-16 text-primary-foreground"
              />
            </div>
          )
        })}
      </div>

      {/* The kind nav, as it was on the looping demo (same Button variants,
          same pill): on the hero's own left rail, over the bottom of the
          band. pointer-events are off on the overlay and back on for the
          pills, so the band under the empty part of the strip stays
          clickable through to nothing — it is band. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <div className="mx-auto w-full px-6 pb-6 md:max-w-330">
          <div
            role="group"
            aria-label="Pick a kind of favpoll"
            className="pointer-events-auto flex flex-wrap gap-2"
          >
            {SLIDES.map((slide, i) => {
              const isActive = i === index
              return (
                <Button
                  key={slide.palette}
                  type="button"
                  size="sm"
                  variant={isActive ? "secondary" : "ghost"}
                  aria-pressed={isActive}
                  onClick={() => {
                    setIndex(i)
                    setStopped(true)
                  }}
                  className={cn(
                    "rounded-full",
                    !isActive &&
                      "border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  )}
                >
                  {slide.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
