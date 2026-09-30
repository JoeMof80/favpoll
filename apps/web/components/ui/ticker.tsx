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
  const itemRef = useRef<HTMLSpanElement>(null)
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
    const distance = item.offsetWidth + gap
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
      <div ref={trackRef} className="inline-flex will-change-transform">
        <span ref={itemRef} style={animate ? { paddingRight: gap } : undefined}>
          {children}
        </span>
        {animate && (
          <span aria-hidden="true" style={{ paddingRight: gap }}>
            {shadow ?? children}
          </span>
        )}
      </div>
    </div>
  )
}
