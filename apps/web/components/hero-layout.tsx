"use client"

import { useEffect, useRef } from "react"

type HeroLayoutProps = {
  eyebrowText: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  avatar?: React.ReactNode
  about?: React.ReactNode
}

// STATIC by design (founder call, 2026-07-29): the previous version ran
// five interlocking scroll animations (name scale, subtitle fade+collapse,
// avatar shrink) all feeding the measured offset — and kept desyncing in
// the wild. With the name standardised at the compact size the band is
// small enough to pin AS-IS, so nothing animates and nothing can disagree.
//
// The poll section's sticky pieces (topic ribbon, lock pill, sort tabs)
// pin BELOW this hero. The hero's height still varies with name wrapping,
// so the measured CSS var stays — set on layout changes only, never
// mutated during scroll.
export function HeroLayout({
  eyebrowText,
  title,
  subtitle,
  avatar,
  about,
}: HeroLayoutProps) {
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

  return (
    <>
      <div
        ref={boxRef}
        className="sticky top-14 z-10 bg-background pt-6 md:pt-10"
      >
        <div className="flex items-start gap-4 md:gap-6">
          <div className="min-w-0 flex-1">
            {eyebrowText}
            {title}
            {subtitle}
          </div>
          {avatar && <div className="shrink-0">{avatar}</div>}
        </div>
      </div>

      {/* About — scrolls away beneath the pinned hero */}
      <div className="relative z-0 mt-4 mb-5 md:mb-10">{about}</div>
    </>
  )
}
