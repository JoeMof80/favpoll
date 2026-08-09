"use client"

import { useEffect, useState } from "react"
import { Lock } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { PollReveal } from "@/components/favpoll-card/poll-reveal"
import { Vignette } from "@/components/landing/vignette"

// The personal reveal, locked and then given.
//
// PollReveal is the REAL component — the same blockquote, the same rule down
// its left edge, the same reveal-foreground token — under the same blurred
// decoy the guest page uses before a pledge lands. Both halves of the arc,
// because the reveal only means anything against what preceded it.
//
// The MEMORIAL scene, not the cause one the rest of the page uses. A personal
// reveal needs a person: the cause scene has no protagonist, so its reveal is
// a fact about hospices, which is a fine reveal and a poor illustration of
// this feature. Belinda and purple is the exemplar the whole site uses.
const REVEAL =
  "Belinda said: My favourite colour was purple. I wore it to every occasion that mattered."

// The decoy — real text, blurred past reading, exactly as poll-section does
// it. Never the actual reveal: a blur is a picture, not a lock, and anyone
// can lift it.
const DECOY =
  "Pledge to reveal her favourite. Pledge to reveal her favourite. Pledge to reveal her favourite."

const LOCKED_MS = 2600
const TYPE_TARGET_MS = 2100
const HOLD_MS = 5200

export function RevealVignette() {
  const reduced = useReducedMotion()
  const [typed, setTyped] = useState(reduced ? REVEAL.length : -1)

  // -1 = locked; 0..length = typing; length = held
  useEffect(() => {
    if (reduced) return
    if (typed < 0) {
      const id = setTimeout(() => setTyped(0), LOCKED_MS)
      return () => clearTimeout(id)
    }
    if (typed < REVEAL.length) {
      const id = setTimeout(
        () => setTyped(typed + 1),
        Math.max(12, Math.round(TYPE_TARGET_MS / REVEAL.length))
      )
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => setTyped(-1), HOLD_MS)
    return () => clearTimeout(id)
  }, [typed, reduced])

  const locked = typed < 0

  return (
    <Vignette>
      <div className="mx-auto max-w-md rounded-xl border border-border bg-background p-5 shadow-lg">
        <p className="text-xs font-medium tracking-widest text-primary uppercase">
          Belinda&apos;s favourite colour
        </p>

        {/* Fixed height across both states: the card must not resize when the
            reveal lands, or the whole page below it jumps. Sized to the
            typed reveal at its longest, which is the taller of the two. */}
        <div className="relative mt-3 h-24">
          <AnimatePresence initial={false} mode="wait">
            {locked ? (
              <motion.div
                key="locked"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                <div className="pointer-events-none blur-[5px] select-none">
                  <PollReveal personalReveal={DECOY} />
                </div>
                {/* The lock line — an invitation, never a toll. "waiting for
                    you", not "unlock": the reveal is a gift, not a gate. */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1.5 text-sm text-foreground shadow-sm">
                    <Lock className="h-3.5 w-3.5 text-primary" />
                    Pledge, and Belinda&apos;s is waiting for you
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="revealed"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                <PollReveal personalReveal={REVEAL.slice(0, typed)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Vignette>
  )
}
