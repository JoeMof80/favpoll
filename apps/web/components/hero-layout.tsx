"use client"

import { useEffect, useRef } from "react"
import { useScrollRoot } from "@/components/shell-scroller"

type HeroLayoutProps = {
  eyebrowText: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  avatar?: React.ReactNode
  about?: React.ReactNode
  /** The header PINS from lg (founder, 2026-10-15): the band with its
   *  photo, the opening line and the name stick at the scroller's top as
   *  one block; the context and the About pass beneath. Off for the
   *  screen in the room, which nobody scrolls (founder, 2026-09-30), and
   *  never below lg, where the slide-in identity bar does this job. */
  pins?: boolean
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
// the subtitle clip), and the shell's reservation is now zero. Below lg
// nothing pins: the slide-in identity bar does that job. (The name
// shrinking onto a sticky band on the phone was built and tried on
// 2026-10-16: "the sliding header was better".)
//
// What pins beneath (the poll heading, the lock card) reads the pinned
// block's bottom from --hero-stuck-bottom, measured here.

// GEOMETRY, px. The band is 80 (the photo's gap above it equals the shell's
// 32 at its right); a 16px strip; the opening line is a 32px row with an
// 8px trailing margin; the 96px photo hangs so its bottom is level with
// the opening line's text (128 from the top).
const BAND = 80
const STRIP = 16
const EYEBROW_ROW = 40
const NAME_TOP = BAND + STRIP + EYEBROW_ROW // 136: the name's own row

export function HeroLayout({
  eyebrowText,
  title,
  subtitle,
  avatar,
  about,
  pins = false,
}: HeroLayoutProps) {
  // headerInset = 56 (the h-14 header) when the document scrolls, 0 inside
  // the shell's scroller, whose box starts below it. Pinning is lg-only
  // and lg is the shell, so in practice 0.
  const { headerInset } = useScrollRoot()
  const nameRef = useRef<HTMLDivElement>(null)

  // --hero-stuck-bottom: the pinned block's bottom, for what pins beneath
  // (the poll heading, the lock card): the name's row bottom — its pinned
  // top plus its box. Measured on layout changes only, never during
  // scroll. A static hero (the room) publishes the scroller's top alone;
  // the phone's offsets come from the identity bar, not from this.
  useEffect(() => {
    const name = nameRef.current
    const set = () => {
      const bottom = pins
        ? headerInset + NAME_TOP + (name?.offsetHeight ?? 0)
        : headerInset
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
  }, [pins, headerInset])

  return (
    <>
      {/* THE BAND, pinned at the scroller's top from lg: the tint bleeding
          across the column's gutters, a 16px strip, and the photo hanging
          off the band's bottom edge at the right. z-30: above the opening
          line (z-20), which pins beneath it and had once painted over the
          photo. A cause without a photo: 24px of top padding and nothing
          to hang. */}
      <div
        className={[
          "relative bg-background",
          pins ? "lg:sticky lg:z-30" : "",
        ].join(" ")}
        style={pins ? { top: `${headerInset}px` } : undefined}
      >
        {avatar ? (
          <>
            <div
              className="-mx-6 h-20 bg-muted lg:-mr-8 lg:-ml-16"
              aria-hidden="true"
            />
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
        style={pins ? { top: `${headerInset + BAND + STRIP}px` } : undefined}
      >
        {eyebrowText}
      </div>

      {/* The name: its own row, pinned under the opening line from lg, on
          the page's background with painted air beneath (pb-4 — the
          context takes it back below, so the one gap is its own mt-4). */}
      <div
        ref={nameRef}
        className={["bg-background pb-4", pins ? "lg:sticky lg:z-40" : ""].join(
          " "
        )}
        style={pins ? { top: `${headerInset + NAME_TOP}px` } : undefined}
      >
        {title}
      </div>

      {subtitle && <div className="-mt-4 w-full">{subtitle}</div>}

      {/* About — ordinary flow; it passes beneath the pinned block. */}
      <div className="mt-2 mb-3 lg:mt-6 lg:mb-6">{about}</div>
    </>
  )
}
