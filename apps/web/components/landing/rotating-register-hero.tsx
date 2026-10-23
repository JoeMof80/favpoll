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
//   ASKED AGAIN AND DECLINED AGAIN on 2026-10-21, this time scoped to the
//   handset rather than the band: a pause still serves only the visitor who
//   is already served (the chevrons are right there), the paused state is
//   invisible so resuming reads as a glitch, and a parked pointer stops the
//   rotation without meaning to. The want behind it was real and separate —
//   there is not enough time to READ THE LOCK CARD before the beat presses
//   it — and that is a question for STILL_BEAT in hero.tsx, not for the
//   dwell. FIXED 2026-10-21 by holding step 1 to 7000ms (STILL_BEAT), not
//   by pausing anything.
// - THE DOTS SAY HOW MANY. Three indicators at the band's foot, added
//   2026-10-21; the rationale is on the element.
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
// 23.5s since 2026-10-21: the still's five-step beat (hero.tsx STILL_BEAT)
// runs ~19.75s with the note typed, and the slide should rest on the result
// before it turns — 3.75s here, as close to the old 3.6 as a round number
// gets. The beat grew because step 1 is a READING beat and was the shortest
// in the table; the reasoning is on STILL_BEAT.
//
// A LONG CYCLE IS NOT THE COST IT LOOKS (founder, 2026-10-21: "is it a
// problem that each cycle takes a long time?"). The only real cost of a slow
// rotation was that a visitor might leave before slide 2 and never learn
// favpoll is not only for funerals — and the dots now say "three of these"
// in half a second, so the rotation does not have to. Nobody watches three
// slides anyway: tuning the CYCLE tunes for a visitor who does not exist,
// where tuning the one slide they do watch is the job. A chevron or a dot
// restarts the dwell, so nobody impatient is kept waiting either.
//
// Was 19s (2026-10-18), 8s before that with frozen stills.
export const DWELL_MS = 23500

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

  // Every manual move goes through here: it sets the slide and bumps the
  // epoch, which restarts the dwell from the slide the visitor asked for AND,
  // passed down as `stillEpoch`, replays that slide's beat. The second half is
  // what makes pressing the LIT dot mean "show me that again" rather than
  // "stand on the finished frame for another 23.5 seconds", which is what it
  // did when only the dwell restarted. `step` is the relative case — a
  // chevron — and the dots are absolute.
  const goTo = (to: number) => {
    setIndex(to)
    setEpoch((e) => e + 1)
  }
  const step = (by: 1 | -1) =>
    goTo((index + by + SLIDES.length) % SLIDES.length)

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
                // THE THREE REGISTERS ENTER GENTLY (2026-10-23). It was a
                // 700ms opacity crossfade on the default curve — correct but
                // characterless, and these three cards are the first thing
                // anyone sees. Now 900ms on the page-turn curve with a 6px
                // rise, so the arriving register settles rather than simply
                // appears. The slides are stacked in ONE grid cell, so the
                // transform moves nothing but itself and the band's height
                // never depends on it (the hero's layout-never-depends-on-
                // animation invariant holds).
                "col-start-1 row-start-1",
                "motion-safe:transition-[opacity,transform] motion-safe:duration-900 motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)]",
                isActive
                  ? "opacity-100 motion-safe:translate-y-0"
                  : "pointer-events-none opacity-0 motion-safe:translate-y-1.5"
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
                stillEpoch={epoch}
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

      {/* WHERE YOU ARE IN THE THREE (founder, 2026-10-21: "i'm also wondering
          if we need indicators to track each demo slide"). The chevrons say
          the band can move; they never said how far, and at a 19-second dwell
          a visitor who does not know two more registers are coming can leave
          believing favpoll is a funeral product. The slides already ANNOUNCE
          the count — each group is labelled "Memorial (1 of 3)" — so this only
          gives the eye what the accessibility tree always had.

          THREE BARE DOTS in the chevrons' own grammar (band ink, dimmed until
          they matter, no circle, no label): the quietest form that still reads
          as "three". BOTTOM-CENTRE, inside the band's own py — the chevrons
          keep the sides, where the founder put them ("where they belong"), and
          a row of controls under the phone was built for them and reverted the
          same hour ("move the chevrons back!!!!").

          The row is pointer-events-none and the buttons take their own back, so
          the full-width strip never swallows a tap meant for the CTA pair that
          sits beneath it on a phone. CLICKABLE, not decoration: a dot that
          looks like a control and is not reads as broken, and it puts the third
          register one tap away instead of two. The 24px box around an 8px dot
          is the tap target (WCAG 2.5.8), not the mark.

          bottom-2, MEASURED (2026-10-21). On a 390px phone the band overflows
          its min-height, so its py-10 is the only room under the CTA pair that
          `ctaAfterMedia` puts at the band's foot: at bottom-3 the dot row's
          24px box came within 4px of "See how it works" — close enough to
          steal a tap aimed at the button's bottom edge. bottom-2 puts 8px
          between the boxes and 20px between the button and the visible dot,
          and costs nothing above sm, where there is ~200px of empty band under
          the CTAs either way. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1">
        {SLIDES.map((slide, i) => (
          <Button
            key={slide.palette}
            type="button"
            size="icon"
            variant="ghost"
            aria-label={`Show ${slide.label}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => goTo(i)}
            className="pointer-events-auto size-6 rounded-full p-0 hover:bg-transparent"
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full bg-primary-foreground motion-safe:transition-opacity",
                i === index ? "opacity-100" : "opacity-40"
              )}
            />
          </Button>
        ))}
      </div>
    </div>
  )
}
