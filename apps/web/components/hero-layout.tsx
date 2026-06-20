"use client"

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

  const t = [0, 120]
  const nameScale = useTransform(scrollY, t, [1, 0.9])
  const avatarScale = useTransform(scrollY, t, [1, 0.635])
  const suffixOpacity = useTransform(scrollY, t, [1, 0])

  return (
    <>
      <div className="sticky top-14 z-10 bg-background pt-6 md:pt-16">
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
