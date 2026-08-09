"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import type { Charity } from "@favpoll/types"
import { CharityBanner } from "@/components/charity-banner"
import { Vignette } from "@/components/landing/vignette"
import { DEMO_SCENE } from "@/components/landing/demo-fixture"

// The pledge goal, filling.
//
// CharityBanner is the REAL component — the same charity row, the same
// right-aligned total, the same understated 1.5px bar. Nothing here is drawn:
// the bar animates because the banner's own transition-[width] does, so the
// vignette shows the easing the guest page shows.
//
// It goes PAST the goal, deliberately, and keeps going. A goal is a milestone
// rather than a finish line — the favpoll stays open until its closing date
// and every pledge after it still counts — and a bar that stops at 100% would
// quietly say the opposite. The bar caps at full; the total above it does not.

const GOAL = 900
const STOPS = [180, 340, 505, 690, 855, 1040]
const STEP_MS = 1400
const HOLD_MS = 3800

// The scene carries only the fields the demo card renders, so the columns
// CharityBanner never shows are filled in here rather than widened there.
const CHARITY: Charity = {
  ...DEMO_SCENE.charities[0],
  description: null,
  created_at: "",
}

export function GoalVignette() {
  const reduced = useReducedMotion()
  const [i, setI] = useState(reduced ? STOPS.length - 1 : 0)

  useEffect(() => {
    if (reduced) return
    const last = i === STOPS.length - 1
    const id = setTimeout(
      () => setI(last ? 0 : i + 1),
      last ? HOLD_MS : STEP_MS
    )
    return () => clearTimeout(id)
  }, [i, reduced])

  return (
    <Vignette>
      <div className="mx-auto max-w-sm">
        <CharityBanner
          charities={[CHARITY]}
          totalRaised={STOPS[i]}
          goalAmount={GOAL}
        />
      </div>
    </Vignette>
  )
}
