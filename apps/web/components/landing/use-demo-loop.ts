"use client"

// The hero demo animation loop: a timeout state machine that walks DemoCard
// through the 15-phase choose → pledge → reveal arc across the six scenes.
import { useEffect, useRef, useState } from "react"
import type { Phase } from "@/components/hero-demo-panel/scenes"
import { SCENES } from "@/components/hero-demo-panel/scenes"

const DECOY_WIDTHS = [85, 62, 48, 33, 19]

export function useDemoLoop() {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const [sceneIndex, setSceneIndex] = useState(0)
  // Start resolved so the payoff is visible on first paint.
  const [phase, setPhase] = useState<Phase>("reveal")
  const [barWidths, setBarWidths] = useState<number[]>(
    SCENES[0].results.map((r) => r.widthPercent)
  )
  const [fading, setFading] = useState(false)

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])
  const clearAll = () => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
  }
  const addT = (fn: () => void, ms: number) =>
    timeouts.current.push(setTimeout(fn, ms))

  const isFirstRun = useRef(true)

  const decoyFor = (scene: (typeof SCENES)[number]) =>
    scene.results.map((_, i) => DECOY_WIDTHS[i] ?? 12)

  useEffect(() => {
    if (prefersReducedMotion) return
    clearAll()

    const HOLD = isFirstRun.current ? 2500 : 0
    isFirstRun.current = false

    const scene = SCENES[sceneIndex]

    addT(() => {
      setPhase("arriving")
      setBarWidths(decoyFor(scene))
    }, HOLD)

    addT(() => setPhase("trigger-hover"), HOLD + 2400)
    addT(() => setPhase("triggering"), HOLD + 2700)
    addT(() => setPhase("picking"), HOLD + 3050)
    addT(() => setPhase("selected"), HOLD + 4250)
    addT(() => setPhase("next-hover"), HOLD + 4950)
    addT(() => setPhase("next-pressed"), HOLD + 5250)
    addT(() => setPhase("pledge-panel"), HOLD + 5600)
    addT(() => setPhase("amount-picked"), HOLD + 6600)
    addT(() => setPhase("pledge-hover"), HOLD + 7500)
    addT(() => setPhase("pledging"), HOLD + 7800)
    addT(() => setPhase("confirmed"), HOLD + 8100)

    addT(() => {
      setPhase("clearing")
      setBarWidths(scene.results.map(() => 0))
    }, HOLD + 9300)
    scene.results.forEach((result, i) => {
      addT(
        () =>
          setBarWidths((prev) => {
            const next = [...prev]
            next[i] = result.widthPercent
            return next
          }),
        HOLD + 9400 + i * 180
      )
    })

    addT(() => setPhase("results"), HOLD + 9800)
    addT(() => setPhase("reveal"), HOLD + 11200)

    addT(() => setFading(true), HOLD + 13700)
    addT(() => {
      const nextIndex = (sceneIndex + 1) % SCENES.length
      setPhase("arriving")
      setBarWidths(decoyFor(SCENES[nextIndex]))
      setFading(false)
      setSceneIndex(nextIndex)
    }, HOLD + 14200)

    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex])

  return {
    scene: SCENES[sceneIndex],
    sceneIndex,
    phase,
    barWidths,
    fading,
    prefersReducedMotion,
  }
}

// Which of the three beats a phase belongs to — drives the segment indicator.
export function beatForPhase(phase: Phase): 0 | 1 | 2 {
  if (
    phase === "arriving" ||
    phase === "trigger-hover" ||
    phase === "triggering" ||
    phase === "picking" ||
    phase === "selected" ||
    phase === "next-hover" ||
    phase === "next-pressed"
  )
    return 0
  if (
    phase === "pledge-panel" ||
    phase === "amount-picked" ||
    phase === "pledge-hover" ||
    phase === "pledging" ||
    phase === "confirmed"
  )
    return 1
  return 2
}
