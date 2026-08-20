"use client"

// The live section's artefact: the REAL display, with pledges landing on it.
//
// FAITHFUL, NOT A DRAWING OF ONE (founder, 2026-08-20): "how about we abandon
// the phone and make the live display much more faithful to the real
// experience. Maybe even reuse the display from 'How it works'. It needs to
// represent the content that describes it, above ... That is the most
// important thing."
//
// So it is DisplayStill — the same component the homepage walkthrough uses,
// which is DisplayScreen itself with live={false}. Nothing is drawn a second
// time, which means this artefact cannot drift from the product the way a
// hand-built lookalike does. The page's charter has always demanded real
// components and never lookalikes; this was the last section not obeying it.
//
// WHAT CAME BEFORE, so nobody rebuilds it. A room in perspective was tried
// first: the display sat small on a far wall and its 10px labels rendered at
// 4.3px, so the one thing this section claims — standings moving as pledges
// land — could not be seen at all. A magnified wall callout beside it was
// bolted on and rejected. Then a bespoke phone-and-screen pair, drawn by hand,
// which took four rounds of corrections: a phone shaped like a watch, a screen
// shaped like a letterbox, a missing QR, a layout "nothing like the real
// thing". Every one of those was a fidelity bug that could only exist because
// the thing was a drawing.
//
// THE PHONE IS GONE. It was there to supply the other end of the exchange, but
// the display already shows it — money arrives, the standings move, a name
// appears on the wall. Beside the screen it was a second object competing for
// the width the screen needed in order to be legible at all.
//
// THE BEAT IS DRIVEN THROUGH THE SCENE, not painted on top. Bumping a
// favourite's amount moves the standings AND the total, because DisplayStill
// derives the total from the pledges — so the sync is a property of the data
// rather than two animations somebody has to keep in step. The wall grows a
// name with it, which is the one thing the still could not do until it took a
// wallNames prop.
//
// SAME WIDTH AS EVERY OTHER VIGNETTE (founder, 2026-08-09, and still in
// force): "it was the one section that sat wider, which read as a mistake
// rather than as emphasis." Vignette's `wide` was tried here and reversed on
// finding that note — it buys the still 896px instead of 672, and with it 11.7
// px of type instead of 8.6, which is a real gain and not mine to take.
//
// SCALED TO ITS COLUMN, measured rather than tuned. The still is authored at
// 1120 plus the TV's bezel, and its frame is ~294 wide on a phone against
// ~750 at 1280 — so the scale is read off the container at runtime and the box
// reserves the scaled height. No breakpoint to keep true, and nothing to go
// stale, which is how the previous constants failed three times.
import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { TvFrame } from "@/components/hero-demo-panel/tv-frame"
import {
  DisplayStill,
  DISPLAY_STILL_WIDTH,
} from "@/components/landing/display-still"
import { DEMO_SCENE, DEMO_QR_URL } from "@/components/landing/demo-fixture"
import { Vignette } from "@/components/landing/vignette"
import type { HeroScene } from "@/components/hero-demo-panel/scenes"

/** The still's own width plus TvFrame's 20px bezel each side. */
const NATURAL_W = DISPLAY_STILL_WIDTH + 40

/** Wall entries, in arrival order. null renders as "Someone". */
const WALL: (string | null)[] = ["Priya", "Tom", null, "Aisha", "Dan"]

/** The pledges that land: which favourite takes the money, and how much. */
const PLEDGES: { index: number; amount: number }[] = [
  { index: 1, amount: 50 },
  { index: 0, amount: 20 },
]

// 0: as the room finds it · 1: £50 lands on the runner-up · 2: £20 lands on
// the leader, so the screen reads as live rather than as waiting for you.
const STEP_MS = [2600, 3000, 3400]
const LAST = STEP_MS.length - 1

function parseGBP(amount: string): number {
  return parseInt(amount.replace(/[^0-9]/g, ""), 10) || 0
}

/** The scene as it stands once the first `n` pledges have landed. */
function sceneAfter(n: number): HeroScene {
  if (n === 0) return DEMO_SCENE
  const results = DEMO_SCENE.results.map((r, i) => {
    const added = PLEDGES.slice(0, n)
      .filter((p) => p.index === i)
      .reduce((sum, p) => sum + p.amount, 0)
    return added ? { ...r, amount: `£${parseGBP(r.amount) + added}` } : r
  })
  return { ...DEMO_SCENE, results }
}

const SCENES = [sceneAfter(0), sceneAfter(1), sceneAfter(2)]

export function LiveVignette() {
  const reduced = useReducedMotion()
  const [step, setStep] = useState(reduced ? LAST : 0)

  const boxRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)
  const [naturalH, setNaturalH] = useState(0)

  useEffect(() => {
    if (reduced) return
    const id = setTimeout(
      () => setStep((s) => (s >= LAST ? 0 : s + 1)),
      STEP_MS[step]
    )
    return () => clearTimeout(id)
  }, [step, reduced])

  useEffect(() => {
    const box = boxRef.current
    const inner = innerRef.current
    if (!box || !inner) return
    const update = () => {
      setWidth(box.getBoundingClientRect().width)
      // The still is content-sized, so its height is READ rather than assumed.
      // The constant it would otherwise need went stale three times.
      setNaturalH(inner.offsetHeight)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(box)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [])

  const scale = width ? width / NATURAL_W : 0
  const wallNames = WALL.slice(0, 3 + step)

  return (
    <Vignette>
      <div ref={boxRef} aria-hidden="true" className="w-full">
        {/* A transform does not change the layout box, so the scaled height is
            reserved explicitly — the class of bug that once put a 940px TV in
            a 184px well and spilled it over the beats either side. */}
        <div
          className="overflow-hidden"
          style={{ height: naturalH && scale ? naturalH * scale : undefined }}
        >
          <div
            ref={innerRef}
            className="origin-top-left"
            style={{
              width: NATURAL_W,
              transform: scale ? `scale(${scale})` : undefined,
            }}
          >
            <TvFrame>
              <DisplayStill
                scene={SCENES[step]}
                qrUrl={DEMO_QR_URL}
                wallNames={wallNames}
              />
            </TvFrame>
          </div>
        </div>
      </div>
    </Vignette>
  )
}
