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
//   band     (band · 16px strip)  sticky top-0, z-20
//   photo    a zero-height sticky holder at the strip's bottom, the photo
//             hanging 64px above it: it rides up with the eyebrow and parks
//             straddling the band's bottom edge, at the right (sticky
//             top-22, z-30) — at the same scroll the name pins (24px: the
//             instant the eyebrow's lettering is covered)
//   name     sticky at the eyebrow's line (band + strip), z-30, own
//             background, FULL WIDTH — the photo is up in the band by then
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
  const nameTop = (avatar ? BAND + STRIP : NO_BAND_TOP) * 4

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

  // GEOMETRY, in px. The eyebrow is a 32px row of uppercase lettering that
  // ends ~22px in, so the row's last 10px are empty. The pin follows the
  // GLYPHS (founder, 2026-10-15/16: "as soon as the opening line text is
  // obscured"): the name's sticky box starts at the glyph line — 10px up
  // into the row's empty tail, which it may paint over, there being no
  // descenders — and carries 18px of lead (that 10 + the eyebrow's old 8px
  // trailing margin) so the name's text sits where it always did. Pinned,
  // the box's top meets the band's strip with no slit, and the lead is
  // where the parked photo's bottom overlaps (the photo stacks above).
  const PIN = avatar ? BAND * 4 + STRIP * 4 : NO_BAND_TOP * 4 // 112 | 24
  const GLYPH_TAIL = 10
  const LEAD = GLYPH_TAIL + 8
  const PHOTO_REST_TOP = 48 // hanging: bottom level with the eyebrow row's bottom
  const PHOTO_HANG = PIN - PHOTO_REST_TOP // the holder sits at PIN
  const PIN_SCROLL = 32 - GLYPH_TAIL // 22: the glyphs reach the strip
  const at = (y: number) => `${headerInset + y}px`

  return (
    <>
      {/* The band and its 16px strip (a cause without a photo: 24px of
          top padding instead), pinned at the scroller's top. */}
      <div
        className={["bg-background", pins ? "lg:sticky lg:z-20" : ""].join(" ")}
        style={pins ? { top: at(0) } : undefined}
      >
        {avatar ? (
          <>
            <div
              className="-mx-6 h-24 bg-muted lg:-mr-8 lg:-ml-16"
              aria-hidden="true"
            />
            <div className="h-4" aria-hidden="true" />
          </>
        ) : (
          <div className="h-6" aria-hidden="true" />
        )}
      </div>

      {/* THE PHOTO RIDES UP WITH THE OPENING LINE, THEN PARKS IN THE BAND
          (founder, 2026-10-15: "scroll the photo up with the opening line
          and then make it sticky"). A zero-height holder in flow at the
          strip's bottom; the photo is absolute inside it, hanging so its
          bottom is level with the eyebrow row's bottom at rest. The holder
          is sticky where the photo's top lands at the pin scroll, so photo
          and name stop together, the photo straddling the band's bottom
          edge at the right. z-40: above the name's box, whose painted
          lead overlaps the photo's bottom at rest. With the photo up
          there, the pinned NAME beneath has nothing beside it: full
          width, always. */}
      {avatar && (
        <div
          className={["relative h-0", pins ? "lg:sticky lg:z-40" : ""].join(
            " "
          )}
          style={
            pins
              ? { top: at(PHOTO_HANG + PHOTO_REST_TOP - PIN_SCROLL) }
              : undefined
          }
        >
          <div
            className="absolute right-0 size-24 overflow-hidden rounded-xl border-4 border-background bg-background shadow-sm"
            style={{ top: -PHOTO_HANG }}
          >
            {avatar}
          </div>
        </div>
      )}

      {/* The eyebrow row; pr-28 keeps it clear of the hanging photo. It
          scrolls up under the band; the name takes its place. -mb-2
          cancels its own trailing margin — the name's lead carries it. */}
      <div className={avatar ? "-mb-2 pr-28" : "-mb-2"}>{eyebrowText}</div>

      {/* The name: its box starts at the eyebrow's glyph line and pins at
          the strip's bottom, full width. */}
      <div
        ref={nameRef}
        className={["bg-background pb-4", pins ? "lg:sticky lg:z-30" : ""].join(
          " "
        )}
        style={{
          marginTop: -GLYPH_TAIL,
          paddingTop: LEAD,
          ...(pins ? { top: at(PIN) } : {}),
        }}
      >
        {title}
      </div>

      {subtitle && <div className="w-full">{subtitle}</div>}

      {/* About — ordinary flow; it passes beneath the pinned name. */}
      <div className="mt-2 mb-3 lg:mt-6 lg:mb-6">{about}</div>
    </>
  )
}
