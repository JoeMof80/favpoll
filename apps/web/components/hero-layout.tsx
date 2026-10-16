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
  /** The header PINS from lg (founder, 2026-10-15): the band and photo
   *  stick at the scroller's top, the name slides up to the eyebrow's
   *  line and sticks there, everything else passes beneath. Off for the
   *  screen in the room, which nobody scrolls (founder, 2026-09-30), and
   *  never below lg, where the slide-in identity bar does this job. */
  pins?: boolean
}

// THE STACKED HEADER (founder, 2026-10-15). A LinkedIn profile header was
// the reference, variant A of three mocked at /dev/header, then "aren't we
// doing the band at all sizes?", "lets align the photo to the right",
// "move the hero up so the opening line lines up with the bottom of the
// photo", and "make the band and photo sticky, make the name sticky too
// when it reaches the position of the opening line".
//
// A register-tinted band bleeding across the column's gutters; the square
// photo hanging off its right end, taking no height of its own; the
// eyebrow beside the photo's lower half, ending level with its bottom
// edge; then the name and the context at the FULL width of the column —
// the name's line length is the column, not the column minus a photo, and
// the photo can never squeeze it (the feedback loop fixed earlier the same
// day, when the photo was sized from the name block's height).
//
// PINNING is PURE STICKY for position — three sticky boxes (band with the
// photo; opening line, from lg; name) that keep their height, so the
// settle's overflow loop (#965's shudder, in the shell's own scroller)
// cannot start. From lg the three pin as one block: band · photo ·
// opening line · name on its own row. On the PHONE the opening line
// scrolls under the band and the name pins INSIDE it, shrinking on the
// way (a transform — the one scroll-linked value) until it reads as the
// old slide-in identity bar, now built from the hero's own parts.
//
// What pins beneath (the poll heading, the lock card) reads the pinned
// header's bottom from --hero-stuck-bottom, measured here: the name box's
// pinned top plus its height. A STATIC hero (the room) publishes the
// scroller's top alone.
//

// GEOMETRY, px. The band is 80 (the photo's gap above it equals the shell's
// 32 at its right); a 16px strip; the eyebrow is a 32px row with an 8px
// trailing margin; the 96px photo hangs so its bottom is level with the
// eyebrow's text (128 from the top).
const BAND = 80
const STRIP = 16
const EYEBROW_ROW = 40
const NAME_TOP = BAND + STRIP + EYEBROW_ROW // 136: the name's own row
/** On the phone the name pins INSIDE the band, this far from its top: low
 *  in the band, level with the photo's top, as the founder's mock of
 *  2026-10-16 has it. */
const PHONE_NAME_TOP = 40
/** …at this scale (text-3xl → the bar's text-lg: 18/30). */
const PHONE_NAME_SCALE = 0.6
/** The scroll over which it shrinks, ending as it arrives on the band. */
const PHONE_RAMP = 96

export function HeroLayout({
  eyebrowText,
  title,
  subtitle,
  avatar,
  about,
  pins = false,
}: HeroLayoutProps) {
  // headerInset = 56 (the h-14 header) when the document scrolls, 0 inside
  // the shell's scroller, whose box starts below it.
  const { headerInset } = useScrollRoot()
  const nameRef = useRef<HTMLDivElement>(null)

  // Below lg the document scrolls (the shell is lg+), and the name shrinks
  // onto the band as it arrives; from lg it keeps its own row.
  const [isPhone, setIsPhone] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)")
    setIsPhone(mq.matches)
    const h = (e: MediaQueryListEvent) => setIsPhone(e.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])

  // THE INSET: where the scroller's top is. In the shell (lg+) the column
  // is its own scroller starting below the header, so 0; on the phone the
  // DOCUMENT scrolls under the fixed h-14 header, so 56 — the hook reports
  // the shell's 0 there too, which pinned everything 56px too high on
  // the first phone test (2026-10-16).
  const inset = isPhone ? 56 : headerInset

  // --hero-stuck-bottom: the pinned header's bottom, for what pins beneath
  // (the poll heading, the lock card). From lg: the name's row bottom (its
  // pinned top plus its box). On the phone: the BAND's bottom alone — the
  // name is up on the band, the context and About scroll straight up
  // beneath it, and the photo hangs over whatever passes (the founder's
  // mock, 2026-10-16). Measured on layout changes only, never during
  // scroll. A static hero (the room) publishes the scroller's top alone.
  useEffect(() => {
    const name = nameRef.current
    const set = () => {
      const bottom = !pins
        ? inset
        : isPhone
          ? inset + BAND
          : inset + NAME_TOP + (name?.offsetHeight ?? 0)
      document.documentElement.style.setProperty(
        "--hero-stuck-bottom",
        `${Math.round(bottom)}px`
      )
    }
    set()
    const ro = name ? new ResizeObserver(set) : null
    if (name) ro!.observe(name)
    // The settle's reservation, kept at zero for page-layout's calc until
    // that calc is retired with it.
    document.documentElement.style.setProperty("--hero-collapse", "0px")
    document.documentElement.style.setProperty("--hero-settle", "0px")
    return () => {
      ro?.disconnect()
      document.documentElement.style.removeProperty("--hero-stuck-bottom")
      document.documentElement.style.removeProperty("--hero-collapse")
      document.documentElement.style.removeProperty("--hero-settle")
    }
  }, [pins, inset, isPhone])

  // THE PHONE'S SHRINK (founder, 2026-10-16: "only on mobile, where we have
  // less space, have the Name scroll up on top of the band and reduce in
  // size so it resembles the slide in header"). Sticky carries the name
  // up and pins it inside the band; this scales it on the way, ending at
  // the bar's size as it arrives. The ONE scroll-linked value, and a
  // transform, so no layout moves with scroll — and it is the document
  // scrolling here, not the shell's own column, so the overflow loop the
  // settle fell into cannot start. The pin scroll is measured from the
  // name's rest position on layout changes, never during scroll.
  const { scrollY } = useScroll()
  const [pinScroll, setPinScroll] = useState(1e6)
  useLayoutEffect(() => {
    const name = nameRef.current
    if (!name || !pins || !isPhone) return
    const measure = () => {
      const rest = name.getBoundingClientRect().top + window.scrollY
      setPinScroll(Math.max(0, rest - (inset + PHONE_NAME_TOP)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [pins, isPhone, inset])
  const nameScale = useTransform(
    scrollY,
    [pinScroll - PHONE_RAMP, pinScroll],
    isPhone && pins ? [1, PHONE_NAME_SCALE] : [1, 1]
  )

  return (
    <>
      {/* THE BAND, pinned at the scroller's top: the tint bleeding across the
          column's gutters, a 16px strip, and the photo hanging off the
          band's bottom edge at the right (its top 32 into the band, its
          bottom level with the eyebrow's text). A cause without a photo:
          24px of top padding and nothing to hang. */}
      <div
        // z-30: above the opening line (z-20), which pins beneath it from lg
        // and had been painting over the hanging photo.
        className={["relative bg-background", pins ? "sticky z-30" : ""].join(
          " "
        )}
        style={pins ? { top: `${inset}px` } : undefined}
      >
        {avatar ? (
          <>
            <div
              className="-mx-6 h-20 bg-muted lg:-mr-8 lg:-ml-16"
              aria-hidden="true"
            />
            <div className="h-4" aria-hidden="true" />
            <div
              className="absolute top-8 right-0 size-24 overflow-hidden rounded-xl border-4 border-background bg-background shadow-sm"
              style={{ width: 96, height: 96 }}
            >
              {avatar}
            </div>
          </>
        ) : (
          <div className="h-6" aria-hidden="true" />
        )}
      </div>

      {/* The opening line. From lg it pins too, under the strip, so the
          desktop's block is band · photo · opening line · name (the
          founder's "don't bother" of 2026-10-16). On the phone it scrolls
          under the band and the name takes the band. pr-28 keeps it clear
          of the hanging photo. */}
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
          the page's background with painted air beneath. On the phone:
          sticky INSIDE the band (z-30 over it, no background of its own),
          shrinking to the bar's size as it arrives — the slide-in header's
          picture, built from the hero's own parts. */}
      <motion.div
        ref={nameRef}
        className={[
          "origin-top-left pb-4 lg:bg-background",
          // z-40: above the band on the phone, where it pins inside it.
          pins ? "sticky z-40" : "",
        ].join(" ")}
        style={{
          scale: nameScale,
          ...(pins
            ? {
                top: `${inset + (isPhone ? PHONE_NAME_TOP : NAME_TOP)}px`,
              }
            : {}),
        }}
      >
        {title}
      </motion.div>

      {subtitle && <div className="w-full">{subtitle}</div>}

      {/* About — ordinary flow; it passes beneath the pinned name. */}
      <div className="mt-2 mb-3 lg:mt-6 lg:mb-6">{about}</div>
    </>
  )
}
