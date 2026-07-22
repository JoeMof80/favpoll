"use client"

import { useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

type HeroLayoutProps = {
  eyebrowText: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  avatar?: React.ReactNode
  about?: React.ReactNode
  scrollContainerRef?: React.RefObject<HTMLElement | null>
}

export function HeroLayout({
  eyebrowText,
  title,
  subtitle,
  avatar,
  about,
  scrollContainerRef,
}: HeroLayoutProps) {
  // Use provided scroll container (for preview panels) or default to window (for live views)
  const { scrollY } = useScroll(
    scrollContainerRef ? { container: scrollContainerRef } : undefined
  )

  // The poll section's sticky pieces (topic ribbon, lock pill, sort tabs)
  // pin BELOW this hero. Their offsets can't be fixed numbers — a wrapping
  // protagonist/cause name makes the hero taller and fixed offsets pin the
  // ribbon through the name's second line (found on-device). Publish the
  // hero's stuck bottom edge as a CSS var; consumers calc() from it.
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

  const t = [0, 120]
  const nameScale = useTransform(scrollY, t, [1, 0.9])
  const avatarScale = useTransform(scrollY, t, [1, 0.635])
  const suffixOpacity = useTransform(scrollY, t, [1, 0])

  return (
    <>
      <div
        ref={boxRef}
        className="sticky top-14 z-10 bg-background pt-6 md:pt-16"
      >
        <div className="flex items-start gap-4 md:gap-6">
          <div className="min-w-0 flex-1">
            {/* Eyebrow */}
            {eyebrowText}

            {/* Title */}
            <motion.div
              style={{ scale: nameScale, transformOrigin: "top left" }}
            >
              {title}
            </motion.div>

            {/* Subtitle */}
            {subtitle && (
              <motion.div style={{ opacity: suffixOpacity }}>
                {subtitle}
              </motion.div>
            )}
          </div>

          {/* Avatar */}
          {avatar && (
            <motion.div
              style={{ scale: avatarScale, transformOrigin: "top right" }}
            >
              {avatar}
            </motion.div>
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="relative z-0 mt-4 mb-5 md:mb-10">{about}</div>
    </>
  )
}
