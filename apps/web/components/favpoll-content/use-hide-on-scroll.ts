"use client"

import { useEffect, useState } from "react"

/** X-style bottom-bar behaviour (founder, 2026-09-09): hide on scroll
 * down, return on scroll up, always shown near the top. The consumer
 * animates with a TRANSFORM only — the footer keeps publishing its
 * height, so page padding and the FABs never reflow with scroll
 * (layout never depends on animation). lastY only advances when a
 * threshold is crossed, so slow scrolling accumulates instead of
 * slipping under it. */
export function useHideOnScrollDown(threshold = 6, topReveal = 80) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY
      if (y < topReveal) {
        setHidden(false)
        lastY = y
        return
      }
      if (delta > threshold) setHidden(true)
      else if (delta < -threshold) setHidden(false)
      else return
      lastY = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold, topReveal])

  return hidden
}
