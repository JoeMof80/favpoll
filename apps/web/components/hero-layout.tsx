"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

type HeroLayoutProps = {
  eyebrowText: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  avatar?: React.ReactNode
  about?: React.ReactNode
}

// Rebuilt after the #423 revert (founder direction, 2026-07-29). The name
// does not animate at all. Two animations survive, each deliberately
// single-channel so nothing can desync:
//   - subtitle (context) fades via opacity AND collapses its height —
//     the reserved space of an invisible line was still holding the
//     stuck band ~30px open (founder screenshot #2, 2026-07-29). The
//     max-height is real layout, measured below; if either channel
//     fails the line merely stays visible or keeps its space and the
//     ribbon pins lower — nothing can overlap
//   - avatar shrinks via PURE LAYOUT (width/height, one animated value) —
//     never the #395 transform + compensating-margin pair, where two
//     channels had to agree and visibly didn't on the founder's devices.
//     The ResizeObserver below measures the avatar's REAL box, so the
//     pinned ribbon tracks truth: if the animation fails the band merely
//     stays open (ribbon pins lower), it can never pin into the photo.
// The avatar shrink is what lets the stuck ribbon rise level with the
// right rail's charity card on md+ (founder screenshot, 2026-07-29): the
// unshrunk 132px box was holding the band open with 48px of dead air.
// The var settles early (avatar by 48px, text by 120px of scroll) — before the ribbon
// or pledge pill reach their pin positions — so pinned pieces still hold
// one position in practice.
export function HeroLayout({
  eyebrowText,
  title,
  subtitle,
  avatar,
  about,
}: HeroLayoutProps) {
  const { scrollY } = useScroll()

  // The var is the SETTLED band bottom, derived from geometry that is
  // scroll-invariant (the name block's offset within the pinned band):
  // never mutated during scroll — restored fully, 2026-09-05, after the
  // about-clip's collapse made whole-band measurement rewrite the var
  // every frame and everything pinned to it stuttered (founder: "i'm
  // seeing glitching"). Rects, not offsetTop (the relative row is the
  // offsetParent). Content changes (name wrap, breakpoint) still
  // re-measure via the RO; scroll recomputes the same value.
  const boxRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    // pb-4 — the founder-tuned air under the name (2026-07-29).
    const BAND_PB = 16
    const set = () => {
      const settledEl = settledRef.current
      if (!settledEl) return
      const inset =
        settledEl.getBoundingClientRect().bottom -
        el.getBoundingClientRect().top
      document.documentElement.style.setProperty(
        "--hero-stuck-bottom",
        `${Math.round(56 + inset + BAND_PB)}px` // 56 = the h-14 header
      )
    }
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => {
      ro.disconnect()
      document.documentElement.style.removeProperty("--hero-stuck-bottom")
    }
  }, [])

  // THE REDESIGN'S CORE (founder, 2026-09-05): the avatar's endpoints
  // are MEASURED, not stamped. Rest = the full text stack (eyebrow +
  // name + context), so the photo's bottom sits level with the context
  // line at any name length; settled = eyebrow + name alone, so a
  // two-line name settles a taller image. Both read by ResizeObserver
  // on LAYOUT changes only — never during scroll — the same
  // measure-the-real-box philosophy as --hero-stuck-bottom. The old
  // constants (104/132, founder-tuned 2026-07-30) are the SSR fallback
  // classes until mount.
  const textRef = useRef<HTMLDivElement>(null)
  const settledRef = useRef<HTMLDivElement>(null)
  const [avatarCfg, setAvatarCfg] = useState({ rest: 132, settled: 84 })
  // Style binding waits for mount: SSR + first client paint use the CSS
  // size classes, so server and client markup can't disagree.
  const [avatarMounted, setAvatarMounted] = useState(false)
  // useLayoutEffect, not useEffect: the cover height and avatar
  // endpoints are PAINT values — measured post-paint, the first frame
  // wore the 999 fallback (caught at w390 in the breakpoint sweep),
  // and a Fast-Refreshed tab kept a stale height until some resize.
  useLayoutEffect(() => {
    const text = textRef.current
    const settledEl = settledRef.current
    if (!text || !settledEl) return
    const set = () => {
      const rest = text.offsetHeight
      const settled = settledEl.offsetHeight
      if (rest > 0 && settled > 0) setAvatarCfg({ rest, settled })
    }
    set()
    setAvatarMounted(true)
    const ro = new ResizeObserver(set)
    ro.observe(text)
    ro.observe(settledEl)
    return () => ro.disconnect()
  }, [])

  const t = [0, 120]
  const subtitleOpacity = useTransform(scrollY, t, [1, 0])
  // The line rides the SCROLL, 1:1 (founder, 2026-09-05: "move the
  // Context at the same pace as the About so the space between them
  // remains constant") — the collapse alone moved it at maxHeight's
  // rate (0.4x), so the about visibly gained on it. A transform inside
  // the clip, so layout never depends on it: if it fails the line
  // merely sits still and clips as before.
  const subtitleY = useTransform(scrollY, t, [0, -120])
  // Collapses to 0 (the old design kept a 12px sliver of air; that job
  // is now done by the band's static pb-3).
  const subtitleMaxHeight = useTransform(scrollY, t, [48, 0])
  // The shrink window = the measured delta (floored at 48px), so the
  // image gives up its extra height at ~scroll pace and the About
  // scrolls the whole way to the settled edge before passing under.
  const avatarDelta = Math.max(avatarCfg.rest - avatarCfg.settled, 48)
  const avatarSize = useTransform(
    scrollY,
    [0, avatarDelta],
    [avatarCfg.rest, avatarCfg.settled]
  )

  return (
    <>
      {/* pb-4 is load-bearing twice over: the poll ribbon's opaque
          backdrop reaches 12px above its own top (-top-3) to seal the
          slit between the two sticky boxes — that overlap must land on
          padding, or it paints over the subtitle's descenders. The other
          4px is the founder-tuned air between the name and the stuck
          ribbon (bisected on-device: pb-3 high, pb-6 low, pb-4.5 barely
          low; 2026-07-29). */}
      <div
        ref={boxRef}
        // z-30: above the poll ribbon (z-20) and the lock card's sticky
        // overlay (z-10), which otherwise painted over the hero name when
        // scrolling (founder-caught, 2026-08-02)
        // The before-cover seals the 56px header zone above the band:
        // iOS Safari intermittently drops the app header's sticky,
        // letting the about scroll visibly over that gap (founder-caught
        // on-device, 2026-08-02). Under a working header (z-40) the
        // cover is invisible.
        // FULLY OPAQUE AGAIN (2026-09-05, ending the transparent-zone
        // experiment): a see-through lower band could not tell the
        // about from the reveal, decoy and standings streaming after it
        // — everything ghosted through (founder screenshots ×2). The
        // about now lives INSIDE the band as a third collapsing clip
        // (below), so the band hides poll content at its bottom exactly
        // as the original design did.
        className="sticky top-14 z-30 bg-background pt-6 pb-4 before:absolute before:inset-x-0 before:-top-14 before:h-14 before:bg-background md:pt-16"
      >
        {/* min-h = the settled avatar size (0.9×80 / 0.635×132): heroes
            WITHOUT an avatar (causes) otherwise settle a few px higher
            than person heroes, whose shrunken avatar outgrows the
            eyebrow+name block (founder: cause ribbon "too high" next to
            a person page, on-device 2026-07-30). */}
        <div className="relative flex min-h-18 items-start gap-4 md:min-h-21 md:gap-6">
          <div ref={textRef} className="min-w-0 flex-1">
            <div ref={settledRef}>
              {eyebrowText}
              {title}
            </div>
            {subtitle && (
              /* items-end (founder, 2026-09-05): top-anchored text in a
                 bottom-up clip lost its LOWER half first, so mid-scroll
                 the about read as covering the context. Bottom-anchored,
                 the shrinking box clips the TOP first and the line slides
                 up behind the name instead. Still one animated value —
                 anchoring is static layout, the doctrine holds. */
              <motion.div
                className="flex items-end overflow-hidden"
                style={{
                  opacity: subtitleOpacity,
                  maxHeight: subtitleMaxHeight,
                }}
              >
                <motion.div style={{ y: subtitleY }}>{subtitle}</motion.div>
              </motion.div>
            )}
          </div>
          {avatar && (
            <motion.div
              className="h-26 w-26 shrink-0 md:h-33 md:w-33"
              style={
                avatarMounted
                  ? { width: avatarSize, height: avatarSize }
                  : undefined
              }
            >
              {avatar}
            </motion.div>
          )}
        </div>
      </div>

      {/* About — ORDINARY FLOW, on purpose (2026-09-05, ending the
          third-clip experiment): collapsing the band 1:1 with the about
          made everything below approach at 2x, and the ribbon dived
          under the band's opaque bottom before its pin (founder
          screenshot). With the avatar settling to the name-block height,
          the band's bottom IS the name edge — so plain flow content
          vanishes exactly there, no animation needed. */}
      <div className="relative z-0 mt-4 mb-5 md:mb-10">{about}</div>
    </>
  )
}
