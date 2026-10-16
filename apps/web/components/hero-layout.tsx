"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useScrollRoot } from "@/components/shell-scroller"

type HeroLayoutProps = {
  eyebrowText: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  avatar?: React.ReactNode
  about?: React.ReactNode
  /** The header PINS from lg (founder, 2026-10-15): the band with its
   *  photo, the opening line and the name stick at the scroller's top as
   *  one block; the context and the About pass beneath. Below lg the band
   *  and photo pin and the NAME SHRINKS onto the band as you scroll. Off
   *  for the screen in the room, which nobody scrolls (founder,
   *  2026-09-30). */
  pins?: boolean
  /** The band's own line on the phone — the countdown or the closed date,
   *  as the old slide-in bar carried it: at the band's top, with the name
   *  pinning in its lower half beneath. Hidden from lg (the rail has the
   *  countdown there). */
  strip?: React.ReactNode
}

// THE STACKED HEADER (founder, 2026-10-15/16). A LinkedIn profile header
// was the reference, variant A of three mocked at /dev/header, then "aren't
// we doing the band at all sizes?", "lets align the photo to the right",
// "move the hero up so the opening line lines up with the bottom of the
// photo", "make the band and photo sticky, make the name sticky too", and —
// after a version where the opening line and photo scrolled up first —
// "it only saves a few pixels. don't bother".
//
// A register-tinted band bleeding across the column's gutters; the square
// photo hanging off its right end, taking no height of its own, its top 32
// into the 80px band (the shell's own gap at its right) and its bottom
// level with the opening line's text; then the opening line, and the name
// and the context at the FULL width of the column — the name's line
// length is the column, not the column minus a photo, and the photo can
// never squeeze it (the feedback loop fixed earlier the same day, when the
// photo was sized from the name block's height).
//
// PINNING, from lg, is PURE STICKY — three sticky boxes (band with the
// photo; opening line; name) that keep their height and pin as one block,
// so the settle's overflow loop (#965's shudder, in the shell's own
// scroller) cannot start. This retires the settle (2026-09-05 →
// 2026-10-15: the avatar shrinking into the name block, --hero-collapse,
// the subtitle clip), and the shell's reservation is now zero.
//
// BELOW lg (founder, 2026-10-16, replacing the slide-in identity bar, then
// settled across several passes: "the name text should animate. the
// countdown should be lower"): the band and photo pin under the fixed
// header; the countdown sits low in the band; the opening line scrolls
// under the band; and the NAME TRAVELS — sticky, it shrinks from the first
// pixel of scroll and docks directly under the band at the old bar's
// size, its background shrinking with it so the About passes beneath and
// the poll heading pins right under. The scale and the box height are
// the scroll-linked values; the height is proportional to the scale, so
// the page beneath drifts up by a few px over the whole travel and never
// jumps.
//
// What pins beneath (the poll heading, the lock card) reads the pinned
// block's bottom from --hero-stuck-bottom, measured here.

// GEOMETRY, px. The band is 80 (the photo's gap above it equals the shell's
// 32 at its right); a 16px strip; the opening line is a 32px row with an
// 8px trailing margin; the 96px photo hangs so its bottom is level with
// the opening line's text (128 from the top).
const BAND = 80
/** The phone's band: the 80px photo straddles its edge 40/40, and 24 above
 *  the photo's top is the phone's own gutter (founder, 2026-10-16: "the
 *  image top padding matches the right padding"). */
const PHONE_BAND = 64
const STRIP = 16
const EYEBROW_ROW = 40
const NAME_TOP = BAND + STRIP + EYEBROW_ROW // 136: the name's own row
/** The phone: the fixed header the document scrolls under. */
const PHONE_HEADER = 56
/** The phone's name shrinks to this on its way to the band (text-3xl at
 *  30 → ~22; the old bar's 18 read too small — founder, 2026-10-16). */
const PHONE_NAME_SCALE = 0.75
/** …and docks this far under the band's edge ("fixed slightly too high"). */
const PHONE_DOCK_GAP = 8
/** The countdown fades in over this much scroll as the name docks. */
const PHONE_DOCK = 24

export function HeroLayout({
  eyebrowText,
  title,
  subtitle,
  avatar,
  about,
  pins = false,
  strip,
}: HeroLayoutProps) {
  // headerInset = 56 (the h-14 header) when the document scrolls, 0 inside
  // the shell's scroller, whose box starts below it. Pinning is lg-only
  // and lg is the shell, so in practice 0.
  const { headerInset } = useScrollRoot()
  const nameRef = useRef<HTMLDivElement>(null)

  // Below lg the document scrolls under the fixed header (the hook reports
  // the shell's 0 there), and the name shrinks onto the band.
  const [isPhone, setIsPhone] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)")
    setIsPhone(mq.matches)
    const h = (e: MediaQueryListEvent) => setIsPhone(e.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])
  const inset = isPhone ? PHONE_HEADER : headerInset

  // --hero-stuck-bottom: the pinned block's bottom, for what pins beneath
  // (the poll heading, the lock card). From lg: the name's row bottom —
  // its pinned top plus its box. On the phone: the band plus the docked
  // name's row at its shrunken height.
  // Measured on layout changes only, never during scroll. A static hero
  // (the room) publishes the scroller's top alone.
  useEffect(() => {
    const name = nameRef.current
    const set = () => {
      const bottom = !pins
        ? inset
        : isPhone
          ? inset +
            PHONE_BAND +
            PHONE_DOCK_GAP +
            (name?.scrollHeight ?? 0) * PHONE_NAME_SCALE
          : inset + NAME_TOP + (name?.offsetHeight ?? 0)
      document.documentElement.style.setProperty(
        "--hero-stuck-bottom",
        `${Math.round(bottom)}px`
      )
    }
    set()
    const ro = new ResizeObserver(set)
    if (name) ro.observe(name)
    // The settle's reservation, kept at zero for page-layout's calc until
    // that calc is retired with it.
    document.documentElement.style.setProperty("--hero-collapse", "0px")
    document.documentElement.style.setProperty("--hero-settle", "0px")
    return () => {
      ro.disconnect()
      document.documentElement.style.removeProperty("--hero-stuck-bottom")
      document.documentElement.style.removeProperty("--hero-collapse")
      document.documentElement.style.removeProperty("--hero-settle")
    }
  }, [pins, inset, isPhone])

  // THE DOCK: the scroll at which the name's row reaches the band's bottom,
  // measured from its rest position on layout changes, never during
  // scroll. The name shrinks over [0, dock]; its box height follows the
  // scale; the countdown fades in over the last PHONE_DOCK px.
  const { scrollY } = useScroll()
  const [dockScroll, setDockScroll] = useState(1e6)
  const [nameRest, setNameRest] = useState(0)
  useLayoutEffect(() => {
    const name = nameRef.current
    if (!name || !pins || !isPhone) return
    const measure = () => {
      const rect = name.getBoundingClientRect()
      setDockScroll(
        Math.max(
          1,
          rect.top + window.scrollY - (inset + PHONE_BAND + PHONE_DOCK_GAP)
        )
      )
      setNameRest(name.scrollHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [pins, isPhone, inset])
  const phone = isPhone && pins
  const nameScale = useTransform(
    scrollY,
    [0, dockScroll],
    phone ? [1, PHONE_NAME_SCALE] : [1, 1]
  )
  const nameHeight = useTransform(nameScale, (k) =>
    phone && nameRest ? nameRest * k : "auto"
  )
  const dockOpacity = useTransform(
    scrollY,
    [Math.max(0, dockScroll - PHONE_DOCK), dockScroll],
    phone ? [0, 1] : [1, 1]
  )

  return (
    <>
      {/* THE BAND, pinned at the scroller's top at every width: the tint bleeding
          across the column's gutters, a 16px strip, and the photo hanging
          off the band's bottom edge at the right. z-30: above the opening
          line (z-20), which pins beneath it and had once painted over the
          photo. A cause without a photo: 24px of top padding and nothing
          to hang. */}
      <div
        className={[
          // lg:bg-background, not bg-background: the strip under the band only
          // needs paint on desktop, where the opening line pins beneath it.
          // On the phone it painted the page colour over the context as it
          // passed, so the text looked cut off 16px short of the band
          // (founder, 2026-10-16).
          "relative lg:bg-background",
          pins ? "sticky z-30" : "",
        ].join(" ")}
        style={pins ? { top: `${inset}px` } : undefined}
      >
        {avatar ? (
          <>
            <div className="relative -mx-6 h-16 bg-muted lg:-mr-8 lg:-ml-16 lg:h-20">
              {strip && (
                <motion.div
                  className="absolute inset-x-0 bottom-1.5 px-6 text-xs text-muted-foreground lg:hidden"
                  style={{ opacity: dockOpacity }}
                >
                  {strip}
                </motion.div>
              )}
            </div>
            <div className="h-4" aria-hidden="true" />
            {/* The size inline as well as by class: a stale stylesheet once
                drew this full width over the name (iOS, 2026-10-16). */}
            {/* 80px below lg, 96 from it (founder, 2026-10-16: "is the photo
                slightly too big on mobile?" — yes: a quarter of a phone's
                column). Either way it straddles the band's bottom edge
                equally. Size and position are inline as well as by class:
                iOS once drew it full width at the left. */}
            <div
              className="absolute right-0 overflow-hidden rounded-xl border-4 border-background bg-background shadow-sm [--photo:80px] lg:[--photo:96px]"
              style={{
                // The size through a variable the classes set per
                // breakpoint, with the PHONE size as the inline fallback:
                // a stale stylesheet (the tunnel on his phone, twice on
                // 2026-10-16) then draws 80, never the image's natural size.
                width: "var(--photo, 80px)",
                height: "var(--photo, 80px)",
                right: 0,
                // Centred on the band's bottom edge, half above and half
                // below (founder, 2026-10-16: "it should be divided by the
                // bottom of the band"): its bottom sits half its height
                // below the band, i.e. half its height minus the strip below
                // this wrapper.
                bottom: `calc(var(--photo, 80px) / -2 + ${STRIP}px)`,
              }}
            >
              {avatar}
            </div>
          </>
        ) : (
          <div className="h-6" aria-hidden="true" />
        )}
      </div>

      {/* The opening line, pinned under the strip from lg, so the block is
          band · photo · opening line · name. pr-28 keeps it clear of the
          hanging photo. */}
      <div
        className={[
          "bg-background",
          avatar ? "pr-28" : "",
          pins ? "lg:sticky lg:z-20" : "",
        ].join(" ")}
        style={pins ? { top: `${inset + BAND + STRIP}px` } : undefined}
      >
        {eyebrowText}
      </div>

      {/* The name. From lg: its own row, pinned under the opening line, on
          the page's background with painted air beneath (pb-4 — the
          context takes it back below, so the one gap is its own mt-4). On
          the phone: sticky too, docking directly under the band, shrinking
          on the way with its box (overflow visible: the scaled text is
          smaller than the box it lays out in, and the box follows). */}
      <motion.div
        ref={nameRef}
        className={[
          "origin-top-left bg-background pb-4",
          // z-20 on the phone: BELOW the band's wrapper (z-30), so the photo
          // hanging off the band paints over the docked name's white box
          // rather than being cut by it ("white bar obscuring image"); z-40
          // from lg, above the pinned opening line.
          pins ? "sticky z-20 lg:z-40" : "",
        ].join(" ")}
        style={{
          height: nameHeight,
          ...(pins
            ? {
                top: `${inset + (isPhone ? PHONE_BAND + PHONE_DOCK_GAP : NAME_TOP)}px`,
              }
            : {}),
        }}
      >
        <motion.div className="origin-top-left" style={{ scale: nameScale }}>
          {title}
        </motion.div>
      </motion.div>

      {subtitle && <div className="-mt-4 w-full">{subtitle}</div>}

      {/* About — ordinary flow; it passes beneath the pinned block. */}
      <div className="mt-2 mb-3 lg:mt-6 lg:mb-6">{about}</div>
    </>
  )
}
