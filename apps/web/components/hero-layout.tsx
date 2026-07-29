"use client"

import { useEffect, useRef, useState } from "react"
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

  // The avatar starts at 80px on mobile (132px on md+), so the scroll
  // shrink must not go as deep there — 0.635 of 80px is a 51px stamp
  // (founder: "shrinks too small", on-device 2026-07-26).
  const [avatarCfg, setAvatarCfg] = useState({ end: 0.635, size: 132 })
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    // Mobile: 0.9 of the 80px avatar = 72px, matching the stuck
    // eyebrow + name block; 0.635 suits the 132px md+ avatar.
    const set = () =>
      setAvatarCfg(
        mq.matches ? { end: 0.635, size: 132 } : { end: 0.9, size: 80 }
      )
    set()
    mq.addEventListener("change", set)
    return () => mq.removeEventListener("change", set)
  }, [])
  const avatarEnd = avatarCfg.end

  const t = [0, 120]
  const nameScale = useTransform(scrollY, t, [1, 0.9])
  const avatarScale = useTransform(scrollY, t, [1, avatarEnd])
  // scale is visual only — the avatar's LAYOUT box would keep its full
  // height and hold the stuck hero open (48px of phantom space on md+,
  // where the 132px avatar, not the text, drives the hero's height; the
  // ribbon then stuck too low on desktop). A negative bottom margin
  // shrinks the layout in step with the visual, and the ResizeObserver
  // republishes --hero-stuck-bottom.
  const avatarMarginBottom = useTransform(scrollY, t, [
    0,
    -avatarCfg.size * (1 - avatarEnd),
  ])
  const suffixOpacity = useTransform(scrollY, t, [1, 0])
  // The faded subtitle must also give up its HEIGHT — opacity alone left
  // ~36px of invisible dead space inside the stuck hero, pushing the
  // ribbon (offset from the hero's measured box) too far down. As the
  // height collapses, the hero's ResizeObserver republishes
  // --hero-stuck-bottom and the ribbon rides up with it.
  // Collapses to 12px, not 0 — a sliver of air keeps the stuck ribbon
  // from crowding the name (founder-tuned).
  const suffixMaxHeight = useTransform(scrollY, t, [48, 12])

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
              <motion.div
                className="overflow-hidden"
                style={{ opacity: suffixOpacity, maxHeight: suffixMaxHeight }}
              >
                {subtitle}
              </motion.div>
            )}
          </div>

          {/* Avatar */}
          {avatar && (
            <motion.div
              style={{
                scale: avatarScale,
                transformOrigin: "top right",
                marginBottom: avatarMarginBottom,
              }}
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
