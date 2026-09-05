"use client"

import { useEffect, useRef, useState } from "react"
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

  // The hero's height still varies with CONTENT (wrapping name, subtitle
  // presence), so the measured CSS var stays — set on layout changes only,
  // never mutated during scroll.
  const boxRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const set = () =>
      document.documentElement.style.setProperty(
        "--hero-stuck-bottom",
        `${56 + el.offsetHeight}px` // 56 = the h-14 site header above
      )
    set()
    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => {
      ro.disconnect()
      document.documentElement.style.removeProperty("--hero-stuck-bottom")
    }
  }, [])

  // Mobile rest size 104px = the eyebrow + name + context stack beside it,
  // so the photo's bottom sits level with the context line (founder,
  // on-device 2026-07-30). The settled stamp stays at the founder-tuned
  // 72px ("shrinks too small" below that, 2026-07-26) — which also keeps
  // the settled band height, and every pinned offset, unchanged.
  const [avatarCfg, setAvatarCfg] = useState({ end: 0.635, size: 132 })
  // Style binding waits for mount: SSR + first client paint use the CSS
  // size classes, so server and client markup can't disagree.
  const [avatarMounted, setAvatarMounted] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const set = () =>
      setAvatarCfg(
        mq.matches ? { end: 0.635, size: 132 } : { end: 72 / 104, size: 104 }
      )
    set()
    setAvatarMounted(true)
    mq.addEventListener("change", set)
    return () => mq.removeEventListener("change", set)
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
  // The avatar settles in the FIRST 48px of scroll (founder, 2026-09-05:
  // the About met the band mid-shrink, with everything moving at once —
  // the seam reads calmer once the composition is settled early). The
  // text channels keep their 120px window.
  const avatarT = [0, 48]
  const avatarSize = useTransform(scrollY, avatarT, [
    avatarCfg.size,
    avatarCfg.size * avatarCfg.end,
  ])

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
        // The after-strip is the SEAM MASK (founder, 2026-09-05): the about
        // used to guillotine mid-glyph against the band's bottom edge; a
        // 16px background→transparent gradient hanging below the band
        // dissolves it instead. h-4 exactly matches the about's mt-4, so
        // at rest the gradient dies precisely where the text begins and
        // nothing is veiled.
        className="sticky top-14 z-30 bg-background pt-6 pb-4 before:absolute before:inset-x-0 before:-top-14 before:h-14 before:bg-background after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-gradient-to-b after:from-background after:to-transparent md:pt-16"
      >
        {/* min-h = the settled avatar size (0.9×80 / 0.635×132): heroes
            WITHOUT an avatar (causes) otherwise settle a few px higher
            than person heroes, whose shrunken avatar outgrows the
            eyebrow+name block (founder: cause ribbon "too high" next to
            a person page, on-device 2026-07-30). */}
        <div className="flex min-h-18 items-start gap-4 md:min-h-21 md:gap-6">
          <div className="min-w-0 flex-1">
            {eyebrowText}
            {title}
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

      {/* About — scrolls away beneath the pinned hero */}
      <div className="relative z-0 mt-4 mb-5 md:mb-10">{about}</div>
    </>
  )
}
