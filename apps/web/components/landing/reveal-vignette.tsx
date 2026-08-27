"use client"

import { useEffect, useState } from "react"
import { Lock } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { PollReveal } from "@/components/favpoll-card/poll-reveal"
import {
  PhoneFrame,
  PHONE_CHASSIS_HEIGHT,
} from "@/components/hero-demo-panel/phone-frame"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { MEMORIAL_SCENE } from "@/components/landing/demo-fixture"
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

// Derived, never typed — the callout names the same person and the same
// topic the card behind it does, because it reads them off the same scene.
const FIRST_NAME = (MEMORIAL_SCENE.protagonist?.name ?? "").split(/[\s&]+/)[0]
const TOPIC = MEMORIAL_SCENE.poll.topic.title.toLowerCase()

const LOCKED_MS = 2600
const TYPE_TARGET_MS = 2100
const HOLD_MS = 5200

// THE PHONE VARIANT (founder, 2026-08-27): "Show the same display as the
// hero but with the Reveal magnified, even extending outside of the iphone
// frame."
//
// So it is literally the hero's still — the same PhoneFrame, the same
// DemoCard at phase "reveal", the same memorial accent — at half the size,
// with the reveal lifted out of it and blown up. The device at the top of
// /memorials and the device here are ONE OBJECT at two scales, which is the
// visual continuity this page was rebuilt around ("the continuity should be
// visual as well"). A first pass drew its own screen instead: an eyebrow and
// a quote, centred on a blank phone, which the founder called correctly —
// "doesn't look realistic". It was a lookalike of the hero, not the hero.
//
// BREAKING THE FRAME is what makes it a magnification rather than a second
// phone. Held inside the bezel the callout is just a bigger font; crossing
// the edge, it reads as the reveal pulled forward off the screen — and it
// buys the width to set the quote at a size that can actually be read, which
// no amount of care inside a 414px screen at half scale can.
//
// STILL. No lock, no blur, no typing — the founder's standing call on this
// page ("i'm not sure there is any need to animate these vignettes"). The
// card variant below keeps the locked-then-given arc for /features, where
// that arc IS the feature being described.
//
// MAGNIFY scales the WHOLE callout rather than its text, so the padding, the
// border radius, the shadow and PollReveal's own rule down the left edge all
// grow together. Authored at 1/MAGNIFY of its final width, which is what
// makes the transform land on exactly the intended box.
const MAGNIFY = 5 / 3

// The composition, at natural size: the phone's chassis, and a callout that
// starts inside its right edge and finishes clear of it.
const SCENE_W = 740
const SCENE_H = PHONE_CHASSIS_HEIGHT
const CALLOUT = { left: 300, top: 340, width: 264 }

export function RevealVignettePhone() {
  return (
    <Vignette className="flex justify-center">
      {/* Fixed box per breakpoint, scale inside — the pack and keepsake
          idiom. 0.28 / 0.42 / 0.5 of 740 x 868 give the sizes below; lg is
          two thirds of the hero's own 0.75 at xl, so this reads as the same
          handset further away. */}
      <div
        data-artefact-box
        className="h-[243px] w-[207px] sm:h-[365px] sm:w-[311px] lg:h-[434px] lg:w-[370px]"
      >
        <div
          className="relative origin-top-left scale-[0.28] sm:scale-[0.42] lg:scale-[0.5]"
          style={{ width: SCENE_W, height: SCENE_H }}
        >
          <PhoneFrame className="absolute top-0 left-0">
            <DemoCard
              scene={MEMORIAL_SCENE}
              phase="reveal"
              barWidths={MEMORIAL_SCENE.results.map((r) => r.widthPercent)}
              prefersReducedMotion
              device="phone"
              accentVar="memorial"
              className="rounded-none border-0"
            />
          </PhoneFrame>

          <div
            className="absolute rounded-xl border border-border bg-background p-4 shadow-2xl"
            style={{
              left: CALLOUT.left,
              top: CALLOUT.top,
              width: CALLOUT.width,
              transform: `scale(${MAGNIFY})`,
              transformOrigin: "top left",
            }}
          >
            <p className="text-[11px] font-medium tracking-widest text-primary uppercase">
              {FIRST_NAME}&apos;s favourite {TOPIC}
            </p>
            <div className="mt-3">
              <PollReveal personalReveal={REVEAL} />
            </div>
          </div>
        </div>
      </div>
    </Vignette>
  )
}

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
