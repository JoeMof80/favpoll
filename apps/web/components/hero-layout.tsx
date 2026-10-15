"use client"

import { useEffect, useRef } from "react"
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
// PINNING, from lg, is PURE STICKY — one block (band, photo, eyebrow,
// name) at the scroller's top, nothing changing size. This retires the
// settle (2026-09-05 → 2026-10-15: the avatar shrinking into the name
// block, --hero-collapse, the subtitle clip): that mechanic collapsed the
// band as you scrolled, which in the shell's own scroller removed its own
// overflow and oscillated (the shudder #965 reserved spare height
// against). A sticky block keeps its height, so the loop cannot start, and
// the shell's reservation is now zero. (A version where the eyebrow and
// photo scrolled up first and the name pinned on the eyebrow's line was
// built and dropped the next morning: "it only saves a few pixels".)
//
// What pins beneath (the poll heading, the lock card) reads the pinned
// header's bottom from --hero-stuck-bottom, measured here: the name box's
// pinned top plus its height. A STATIC hero (the room) publishes the
// scroller's top alone.
//

/** How far the photo hangs below the band, in px. */
const HANG = 32

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
  const pinnedRef = useRef<HTMLDivElement>(null)

  // --hero-stuck-bottom: the pinned block's bottom, for what pins beneath
  // (the poll heading, the lock card). Measured on layout changes only
  // (name wrap, breakpoint), never during scroll — nothing here changes
  // size with scroll. A static hero (the room) publishes the scroller's
  // top alone.
  useEffect(() => {
    const el = pinnedRef.current
    const set = () => {
      const bottom = pins
        ? headerInset + (el?.offsetHeight ?? 0) + (avatar ? HANG : 0)
        : headerInset
      document.documentElement.style.setProperty(
        "--hero-stuck-bottom",
        `${Math.round(bottom)}px`
      )
    }
    set()
    const ro = el ? new ResizeObserver(set) : null
    if (el) ro!.observe(el)
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
  }, [pins, headerInset, avatar])

  return (
    <>
      {/* THE TEXT ON THE BAND (founder, 2026-10-16: "I was thinking it would
          look the same as the slide in header, with the text on top of the
          band"). One block, the same at rest and pinned, so nothing changes
          size: the register-tinted band bleeding across the column's
          gutters carries the opening line and the name; the photo hangs
          off the band's bottom edge at the right; the context and the
          About sit on the page beneath and pass under the block as it
          pins. The block's published bottom includes the photo's hang, so
          what pins beneath clears the photo. */}
      <div
        ref={pinnedRef}
        className={[
          "relative",
          // EXPERIMENT (founder, 2026-10-16: "instead of sliding the header
          // in on mobile, should we achieve the effect by making the band
          // and image and name sticky?" — "try it"): sticky at EVERY width,
          // the slide-in identity bar switched off (favpoll-content). Was
          // lg:sticky lg:z-30; revert both if the height or iOS's sticky
          // bothers him.
          pins ? "sticky z-30" : "",
        ].join(" ")}
        style={pins ? { top: `${headerInset}px` } : undefined}
      >
        <div
          className={[
            "-mx-6 bg-muted px-6 pt-5 pb-4 lg:-mr-8 lg:-ml-16 lg:pr-8 lg:pl-16",
            avatar ? "pr-28 lg:pr-32" : "",
          ].join(" ")}
        >
          {eyebrowText}
          {title}
        </div>
        {avatar && (
          /* 96px, hanging HANG below the band at the right; the size inline
             as well as by class (a stale stylesheet once drew it full
             width). */
          <div
            className="absolute right-0 size-24 overflow-hidden rounded-xl border-4 border-background bg-background shadow-sm"
            style={{ width: 96, height: 96, bottom: -HANG }}
          >
            {avatar}
          </div>
        )}
      </div>

      {subtitle && <div className="w-full">{subtitle}</div>}

      {/* About — ordinary flow; it passes beneath the pinned name. */}
      <div className="mt-2 mb-3 lg:mt-6 lg:mb-6">{about}</div>
    </>
  )
}
