import type { Transition } from "framer-motion"

export const fadeUp = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

// Reveal slides up from below and settles — heavier than other transitions
export const revealVariant = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
}

export const FAST: Transition = { duration: 0.2 }
export const MEDIUM: Transition = { duration: 0.3, ease: "easeInOut" }
export const SLOW: Transition = { duration: 0.45, ease: "easeInOut" }
// For the reveal moment — deliberate, settled, unhurried
export const DELIBERATE: Transition = {
  duration: 0.65,
  ease: [0.16, 1, 0.3, 1],
}
