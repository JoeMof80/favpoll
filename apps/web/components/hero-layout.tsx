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
  // Until measured, 999 = a fully opaque band (today's behaviour) —
  // the fail-safe direction: too much cover, never a see-through band.
  const [coverH, setCoverH] = useState(999)
  const [avatarMounted, setAvatarMounted] = useState(false)
  useEffect(() => {
    const text = textRef.current
    const settledEl = settledRef.current
    if (!text || !settledEl) return
    const set = () => {
      const rest = text.offsetHeight
      const settled = settledEl.offsetHeight
      if (rest > 0 && settled > 0) setAvatarCfg({ rest, settled })
      // The opaque cover ends at the NAME's bottom edge. RECT
      // DIFFERENCE against the band root, not offsetTop — the row is
      // position:relative, so it is the offsetParent and offsetTop
      // silently lost the band's top padding (measured: an 85px cover
      // against the needed 149, the about ghosting through the name
      // zone). Same-frame rects cancel scroll.
      const band = boxRef.current
      if (band) {
        const bottom = Math.round(
          settledEl.getBoundingClientRect().bottom -
            band.getBoundingClientRect().top
        )
        if (bottom > 0) setCoverH(bottom)
      }
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
        // THE PAINT STOPS AT THE NAME (founder, 2026-09-05: "can't it
        // disappear directly under the Name, like Context does?"). The
        // band's BOX keeps its full height — the measured var, the
        // ribbon pin and the fail-open doctrine are untouched — but the
        // background moves onto an inner cover that ends at the name's
        // bottom edge. Below that line the band is transparent: the
        // about stays visible until it slides under the name (and under
        // the photo, opaque by itself). Safe against the context
        // because #704's 1:1 ride keeps the two at a constant gap.
        className="sticky top-14 z-30 pt-6 pb-4 before:absolute before:inset-x-0 before:-top-14 before:h-14 before:bg-background md:pt-16"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 bg-background"
          style={{ height: coverH }}
        />
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

      {/* About — scrolls away beneath the pinned hero */}
      <div className="relative z-0 mt-4 mb-5 md:mb-10">{about}</div>
    </>
  )
}
