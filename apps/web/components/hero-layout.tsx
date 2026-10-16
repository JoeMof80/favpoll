"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useScrollRoot } from "@/components/shell-scroller"
import { FavpollLogo } from "@/components/favpoll-logo"

type HeroLayoutProps = {
  eyebrowText: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  avatar?: React.ReactNode
  about?: React.ReactNode
  /** The band PINS at the scroller's top with its photo (founder,
   *  2026-10-15/16); everything else scrolls until the poll heading pins
   *  beneath. Off for the screen in the room, which nobody scrolls
   *  (founder, 2026-09-30). */
  pins?: boolean
  /** THE MICRO BANNER (founder, 2026-10-16): a line above the band, on the
   *  phone only, that the caller passes only as the favpoll approaches its
   *  close — "only visible as the favpoll approaches its deadline". Hidden
   *  from lg, where the rail has the countdown. */
  banner?: React.ReactNode
}

// THE STACKED HEADER (founder, 2026-10-15/16). A LinkedIn profile header
// was the reference, variant A of three mocked at /dev/header, then "aren't
// we doing the band at all sizes?", "lets align the photo to the right",
// "move the hero up so the opening line lines up with the bottom of the
// photo", and — after a version where the opening line and photo scrolled
// up first — "it only saves a few pixels. don't bother".
//
// A register-tinted band bleeding across the column's gutters — THE PAGE'S
// TOP ROW, the site header's 56px, with the mark on it (#1061: the favpoll
// page has no site header); the square photo hanging off its right end,
// taking no height of its own, straddling the band's edge 40/40 and its
// bottom level with the opening line's text; then the opening line, and
// the name and the context at the FULL width of the column — the name's
// line length is the column, not the column minus a photo, and the photo
// can never squeeze it (the feedback loop fixed earlier the same day, when
// the photo was sized from the name block's height).
//
// PINNING IS ONE STICKY BOX at every width: the band with its photo (and
// the banner above it, when there is one). Pure sticky — nothing changes
// size — so the settle's overflow loop (#965's shudder, in the shell's own
// scroller) cannot start. The opening line, the name and the About all
// scroll beneath, and the poll heading pins directly under the band
// (founder, 2026-10-16: "if the photo is fixed, do we need the name to
// stick anyway?" — no: the photo is the
// identity mid-page, and the docking name said it twice). This retires, in
// order: the settle (2026-09-05 → 2026-10-15: the avatar shrinking into
// the name block, --hero-collapse, the subtitle clip), the slide-in
// identity bar, and the phone's shrinking name (2026-10-16, one day: the
// scale transform, the measured dock, the inner-height feedback — where
// that day's bugs lived).
//
// What pins beneath (the poll heading, the lock card) reads the pinned
// block's bottom from --hero-stuck-bottom, published here from constants.

// GEOMETRY, px.
const BAND = 56 // h-14: THE HEADER'S HEIGHT (founder, 2026-10-16)
/** The photo: 80 at every width, its top where the header's mark sits
 *  (16 into the 56 row) — a ⋮ at the band's right was tried and dropped
 *  (founder, 2026-10-16: a guest needs nothing from it that the mark and
 *  the organiser's own button don't already give). */
const PHOTO = 80
const PHOTO_TOP = 16
/** Air under the band, OUTSIDE the sticky box — a painted strip there
 *  read as "a white band below the band" once scrolled (founder,
 *  2026-10-16). The content scrolls up to the band's own edge; the poll
 *  heading pins at it with its own top padding (poll-section) clearing
 *  the photo, which hangs PHOTO/2 below. */
const STRIP = 16
/** The micro banner's row, above the band on the phone — in the band's
 *  own tone, so the header stays one colour (founder, 2026-10-16: "I
 *  don't like how the countdown makes the header two tone"). */
const BANNER = 28
/** The phone: the document scrolls from the very top — no site header. */
const PHONE_HEADER = 0

export function HeroLayout({
  eyebrowText,
  title,
  subtitle,
  avatar,
  about,
  pins = false,
  banner,
}: HeroLayoutProps) {
  // headerInset = 56 (the h-14 header) when the document scrolls, 0 inside
  // the shell's scroller, whose box starts below it. The favpoll page has
  // no header at any width now, so in practice 0 everywhere.
  const { headerInset } = useScrollRoot()

  // Below lg the document scrolls (the hook reports the shell's 0 there)
  // and the banner, when passed, takes its row above the band.
  const [isPhone, setIsPhone] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)")
    setIsPhone(mq.matches)
    const h = (e: MediaQueryListEvent) => setIsPhone(e.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])
  const inset = isPhone ? PHONE_HEADER : headerInset
  const bannerHeight = isPhone && banner ? BANNER : 0

  // --hero-stuck-bottom: the pinned box's bottom — the band's edge — for
  // what pins beneath (the poll heading, the lock card). Constants, never
  // a measurement. A static hero (the room) publishes the scroller's top.
  useEffect(() => {
    const bottom = pins ? inset + bannerHeight + BAND : inset
    document.documentElement.style.setProperty(
      "--hero-stuck-bottom",
      `${bottom}px`
    )
    // The settle's reservation, kept at zero for page-layout's calc until
    // that calc is retired with it.
    document.documentElement.style.setProperty("--hero-collapse", "0px")
    document.documentElement.style.setProperty("--hero-settle", "0px")
    return () => {
      document.documentElement.style.removeProperty("--hero-stuck-bottom")
      document.documentElement.style.removeProperty("--hero-collapse")
      document.documentElement.style.removeProperty("--hero-settle")
    }
  }, [pins, inset, bannerHeight])

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <>
      {/* THE BAND, pinned at the scroller's top at every width: the banner
          (phone, when passed) and the tint bleeding across the column's
          gutters, one tone; the photo hanging off the band's bottom edge
          at the right. z-30: above the poll heading (z-20), which pins
          beneath. A cause without a photo: the band alone. */}
      <div
        className={["relative", pins ? "sticky z-30" : ""].join(" ")}
        style={pins ? { top: `${inset}px` } : undefined}
      >
        {/* THE OVERSCROLL (founder, 2026-10-16: "pulling the screen down
            can create this white space between the muted header and safe
            area"): iOS rubber-bands the document past its top and paints
            the page's white there. A screen's worth of the band's tone
            above the box rides with it and fills that gap. Phone only —
            the shell's scroller clips it from lg. */}
        <div
          className="pointer-events-none absolute -inset-x-6 bottom-full h-screen bg-muted lg:hidden"
          aria-hidden="true"
        />
        {banner && (
          <div
            className="-mx-6 flex items-center justify-center bg-muted px-6 text-xs text-muted-foreground lg:hidden"
            style={{ height: BANNER }}
          >
            {banner}
          </div>
        )}
        <div
          className="relative -mx-6 h-14 bg-muted lg:-mr-8 lg:-ml-16"
          aria-hidden={avatar ? undefined : true}
        />
        {avatar && (
          /* 80px at every width, its top on the mark's line (16 into the
             56 row). Size and position inline as well as by class: a stale
             stylesheet once drew it full width over the name (iOS,
             2026-10-16). */
          <div
            className="absolute right-0 size-20 overflow-hidden rounded-xl border-4 border-background bg-background shadow-sm"
            style={{
              width: PHOTO,
              height: PHOTO,
              right: 0,
              top: bannerHeight + PHOTO_TOP,
            }}
          >
            {avatar}
          </div>
        )}
      </div>

      {/* THE MARK, on the band at the header's own spot (fixed, the h-14
          row, px-6 — the room's chrome geometry), under the banner when
          there is one. It is the page's only chrome: a ⋮ menu at the right
          was tried and dropped the same day — a guest needs nothing from
          it, and the organiser has the manage button; light and dark live
          in the poll heading's own menu. */}
      {pins &&
        mounted &&
        createPortal(
          /* Portalled to the body: the sheet's drop-shadow filter would
             otherwise pin this to the column's edge rather than the
             viewport's. */
          <div
            className="pointer-events-none fixed left-0 z-40 flex h-14 items-center px-6"
            style={{ top: bannerHeight }}
          >
            <Link
              href="/"
              aria-label="favpoll home"
              className="pointer-events-auto"
            >
              <FavpollLogo />
            </Link>
          </div>,
          document.body
        )}

      <div style={{ height: STRIP }} aria-hidden="true" />

      {/* The opening line, beside the hanging photo (pr-28 keeps it clear),
          its text level with the photo's bottom. */}
      <div className={avatar ? "pr-28" : ""}>{eyebrowText}</div>

      {/* The name at the full width of the column, with painted air beneath
          (pb-4 — the context takes it back below, so the one gap is its
          own mt-4). Ordinary flow: it scrolls under the band. */}
      <div className="pb-4">{title}</div>

      {subtitle && <div className="-mt-4 w-full">{subtitle}</div>}

      {/* About — ordinary flow. On the pinning page the poll heading's own
          top padding is the gap beneath; the room's heading has none, so
          the About keeps a margin there. */}
      <div className={pins ? "mt-2 lg:mt-6" : "mt-2 mb-3 lg:mt-6 lg:mb-6"}>
        {about}
      </div>
    </>
  )
}
