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
// PINNING, from lg, is PURE STICKY — no transforms, nothing changes size.
// This retires the settle (2026-09-05 → 2026-10-15: the avatar shrinking
// into the name block, --hero-collapse, the subtitle clip): that mechanic
// collapsed the band as you scrolled, which in the shell's own scroller
// removed its own overflow and oscillated (the shudder #965 reserved
// spare height against). Sticky elements keep their height, so the loop
// cannot start, and the shell's reservation is now zero. Two sticky boxes:
//
//   wrapper  (band · 16px strip · eyebrow row, the photo hanging at the
//             right)  sticky top-0, z-20
//   name     sticky at the eyebrow's line (wrapper height − eyebrow row),
//             z-30, own background — so as the page scrolls the name
//             rises over the eyebrow and takes its place beside the photo
//
// What pins beneath (the poll heading, the lock card) reads the pinned
// header's bottom from --hero-stuck-bottom, measured here: the name box's
// pinned top plus its height. A STATIC hero (the room) publishes the
// scroller's top alone.
//
// Geometry, in Tailwind's 4px units. The eyebrow is the hero's own
// SectionEyebrow: h-8 with mb-2, a 40px row.
const BAND = 24 // h-24
const STRIP = 4 // h-4 — the air between the band and the eyebrow
// (the eyebrow row, h-8 + mb-2 = 10 units, is the wrapper's own last child
// and needs no constant)
const NO_BAND_TOP = 6 // pt-6 — a cause without a photo

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

  // Where the pinned name box's TOP sits, in px: the eyebrow's line.
  const nameTop = ((avatar ? BAND + STRIP : NO_BAND_TOP) + 0) * 4

  // --hero-stuck-bottom: the pinned header's bottom, for what pins beneath.
  // Measured on layout changes only (name wrap, breakpoint), never during
  // scroll — the value is scroll-invariant by construction.
  useEffect(() => {
    const name = nameRef.current
    const set = () => {
      const bottom = pins
        ? headerInset + nameTop + (name?.offsetHeight ?? 0)
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
  }, [pins, headerInset, nameTop])

  const wrapperTop = headerInset === 0 ? "lg:top-0" : "lg:top-14"

  return (
    <>
      {/* The pinned wrapper: band, strip, eyebrow row; the photo hanging
          at the right, its bottom level with the eyebrow's text. */}
      <div
        className={[
          "relative bg-background",
          avatar ? "" : "pt-6",
          pins ? `lg:sticky lg:z-20 ${wrapperTop}` : "",
        ].join(" ")}
      >
        {avatar && (
          <>
            <div
              className="-mx-6 h-24 bg-muted lg:-mr-8 lg:-ml-16"
              aria-hidden="true"
            />
            <div className="h-4" aria-hidden="true" />
            {/* bottom-2: the eyebrow row is h-8 + mb-2, so 8px above the
                wrapper's bottom is the eyebrow's own bottom edge. */}
            <div className="absolute right-0 bottom-2 size-24 overflow-hidden rounded-xl border-4 border-background bg-background shadow-sm">
              {avatar}
            </div>
          </>
        )}
        {/* pr-28 keeps a long opening line clear of the hanging photo. */}
        <div className={avatar ? "pr-28" : undefined}>{eyebrowText}</div>
      </div>

      {/* The name: pins at the eyebrow's line and covers it. pr-28 from lg
          only when pinning beside a photo — at rest the name starts clear
          of the photo's bottom, but pinned it sits beside the photo, and
          the photo lives in the wrapper beneath it. */}
      <div
        ref={nameRef}
        className={[
          "bg-background pb-4",
          pins ? "lg:sticky lg:z-30" : "",
          pins && avatar ? "lg:pr-28" : "",
        ].join(" ")}
        style={pins ? { top: `${headerInset + nameTop}px` } : undefined}
      >
        {title}
      </div>

      {subtitle && <div className="w-full">{subtitle}</div>}

      {/* About — ordinary flow; it passes beneath the pinned name. */}
      <div className="mt-2 mb-3 lg:mt-6 lg:mb-6">{about}</div>
    </>
  )
}
