"use client"

import { useEffect, useRef, useState } from "react"

// A TICKER for one line that may not fit (founder, 2026-09-30, for the
// room's person line: "a ticker is still the best option, wrapping is
// worse"). It does nothing until the line actually overflows its box:
// a line that fits is plain text, still. Overflowing, the line scrolls
// left at a slow constant pace and loops, a second copy following the
// first after a gap, the edges faded. Under prefers-reduced-motion the
// line is truncated instead — motion is the one thing that setting
// forbids, and a room screen is still a screen.
//
// Web Animations API rather than CSS keyframes: the distance is the
// measured width, and a keyframe per instance would need a stylesheet.

type Props = {
  children: React.ReactNode
  /** What the trailing copy renders — defaults to `children`. Pass a
   *  copy without landmarks (an h1, say) so the page keeps one of each. */
  shadow?: React.ReactNode
  /** Pixels per second. */
  speed?: number
  /** Gap between the copies, in pixels. */
  gap?: number
  className?: string
}

export function Ticker({
  children,
  shadow,
  speed = 30,
  gap = 48,
  className = "",
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null)
  const itemRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [overflows, setOverflows] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])

  // Does the line fit? Re-asked whenever the box or the line changes
  // size (a refresh may bring a longer context; the rail may expand).
  useEffect(() => {
    const box = boxRef.current
    const item = itemRef.current
    if (!box || !item) return
    const check = () => setOverflows(item.scrollWidth > box.clientWidth + 1)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(box)
    ro.observe(item)
    return () => ro.disconnect()
  }, [])

  const animate = overflows && !reduced

  useEffect(() => {
    const track = trackRef.current
    const item = itemRef.current
    if (!animate || !track || !item) return
    // offsetWidth already carries the gap (it is the copy's padding), so
    // one copy's width IS the loop's distance — adding the gap again made
    // every loop jump 48px (found 2026-10-01).
    const distance = item.offsetWidth
    const animation = track.animate(
      [
        { transform: "translateX(0)" },
        { transform: `translateX(-${distance}px)` },
      ],
      {
        duration: (distance / speed) * 1000,
        iterations: Infinity,
        easing: "linear",
      }
    )
    return () => animation.cancel()
  }, [animate, gap, speed, overflows])

  return (
    <div
      ref={boxRef}
      className={`min-w-0 overflow-hidden whitespace-nowrap ${
        animate
          ? "[mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)]"
          : "truncate"
      } ${className}`}
    >
      {/* The copies are divs, not spans: a heading may ride inside (the
          room's person line carries the page's h1), and a heading in a
          span is invalid HTML that a parser may restructure. */}
      <div ref={trackRef} className="inline-flex will-change-transform">
        <div
          ref={itemRef}
          className="shrink-0"
          style={animate ? { paddingRight: gap } : undefined}
        >
          {children}
        </div>
        {animate && (
          <div
            aria-hidden="true"
            className="shrink-0"
            style={{ paddingRight: gap }}
          >
            {shadow ?? children}
          </div>
        )}
      </div>
    </div>
  )
}
