"use client"

// Once-only entrance when scrolled into view. Opacity and transform only,
// and under prefers-reduced-motion the shift is dropped so it is a plain
// fade.
//
// CALM, NOT BRISK (2026-10-23). It was 12px over 450ms on `easeOut` — the
// default any component gets when nobody chose, and it read as a widget
// arriving rather than a page turning. Now: a SHORTER distance over a
// LONGER time on a long-tailed curve, which is what makes motion feel
// considered rather than eager. The curve below is the one a sheet settles
// on — most of the travel early, then a long quiet arrival, with no
// overshoot anywhere (favpoll is used at funerals; nothing bounces).
import { motion, useReducedMotion } from "framer-motion"
import type { Transition } from "framer-motion"

/** The page-turn curve. Shared so every entrance on the landing agrees. */
export const PAGE_TURN: Transition["ease"] = [0.32, 0.72, 0, 1]
export const PAGE_TURN_MS = 0.6
/** Type arrives line by line, close enough to read as one movement. */
const STAGGER_S = 0.08

type Props = {
  children: React.ReactNode
  className?: string
  delay?: number
  /** Stagger the direct children, each wrapped in <FadeInItem>. */
  stagger?: boolean
}

export function FadeIn({ children, className, delay = 0, stagger }: Props) {
  const reduced = useReducedMotion()
  const shift = reduced ? 0 : 8

  if (stagger) {
    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: {},
          shown: {
            transition: {
              delayChildren: delay,
              staggerChildren: reduced ? 0 : STAGGER_S,
            },
          },
        }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: shift }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: PAGE_TURN_MS, delay, ease: PAGE_TURN }}
    >
      {children}
    </motion.div>
  )
}

/** One staggered line inside a <FadeIn stagger>. */
export function FadeInItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : 8 },
        shown: { opacity: 1, y: 0 },
      }}
      transition={{ duration: PAGE_TURN_MS, ease: PAGE_TURN }}
    >
      {children}
    </motion.div>
  )
}
