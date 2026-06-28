"use client"

import { useEffect, useRef, useState } from "react"
import type { Phase } from "./scenes"
import { SCENES } from "./scenes"
import { HeroPitchColumn } from "./hero-pitch-column"
import { DemoCard } from "./demo-card"

// Arbitrary, varied widths for the blurred decoy bars — they reveal nothing
// about the true ranking (mirrors the live page's DECOY_WIDTHS).
const DECOY_WIDTHS = [85, 62, 48, 33, 19]

export function HeroDemoPanel() {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const [sceneIndex, setSceneIndex] = useState(0)

  // Start resolved — results populated + reveal unblurred — so the payoff is
  // visible on first paint. The loop then replays the full arc from locked.
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

    // Locked: blurred decoy bars + lock card; About types out on arrival.
    addT(() => {
      setPhase("arriving")
      setBarWidths(decoyFor(scene))
    }, HOLD)

    addT(() => setPhase("trigger-hover"), HOLD + 2400) // (About has typed)
    addT(() => setPhase("triggering"), HOLD + 2700) // pill press
    addT(() => setPhase("picking"), HOLD + 3050) // picker opens, browsing
    addT(() => setPhase("selected"), HOLD + 4250) // a favourite is selected
    addT(() => setPhase("next-hover"), HOLD + 4950) // Next hover (now enabled)
    addT(() => setPhase("next-pressed"), HOLD + 5250) // Next pressed
    addT(() => setPhase("pledge-panel"), HOLD + 5600) // amount step, Pledge off
    addT(() => setPhase("amount-picked"), HOLD + 6600) // preset picked, Pledge on
    addT(() => setPhase("pledge-hover"), HOLD + 7500) // Pledge hover
    addT(() => setPhase("pledging"), HOLD + 7800) // Pledge pressed
    addT(() => setPhase("confirmed"), HOLD + 8100) // confirmation in dialog

    // Disclosure: dialog closes → reveal types out + bars climb from zero.
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

    addT(() => setPhase("results"), HOLD + 9800) // bars mid-climb
    addT(() => setPhase("reveal"), HOLD + 11200) // settled — reveal fully typed

    addT(() => setFading(true), HOLD + 13700)
    addT(() => {
      const nextIndex = (sceneIndex + 1) % SCENES.length
      // New scene fades in already locked — no reveal/results glimpse.
      setPhase("arriving")
      setBarWidths(decoyFor(SCENES[nextIndex]))
      setFading(false)
      setSceneIndex(nextIndex)
    }, HOLD + 14200)

    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex])

  const scene = SCENES[sceneIndex]

  const stepLabels: Record<Phase, string> = {
    arriving: "Choose your favourite",
    "trigger-hover": "Choose your favourite",
    triggering: "Choose your favourite",
    picking: "Choose your favourite",
    selected: "A favourite is picked",
    "next-hover": "A favourite is picked",
    "next-pressed": "A favourite is picked",
    "pledge-panel": "Choose an amount",
    "amount-picked": "Ready to pledge",
    "pledge-hover": "Ready to pledge",
    pledging: "Pledging…",
    confirmed: "Pledged ✓",
    clearing: `${scene.protagonist.name.split(" ")[0]}'s reveal`,
    results: `${scene.protagonist.name.split(" ")[0]}'s reveal`,
    reveal: `${scene.protagonist.name.split(" ")[0]}'s reveal`,
  }

  return (
    <section id="how-it-works" className="border-b border-border bg-muted">
      <div className="mx-auto max-w-330">
        <div className="mx-auto flex h-158 w-full max-w-330">
          {/* Left — pitch copy */}
          <HeroPitchColumn sceneIndex={sceneIndex} />

          {/* Right — demo card (desktop only) */}
          <div
            className="hidden h-158 flex-col p-5 md:flex"
            style={{ flex: "0.95" }}
          >
            <span className="sr-only">
              Animated demonstration of how favpoll works. The demonstration
              cycles through different occasions automatically.
            </span>

            <div
              className="flex min-h-0 flex-1 flex-col transition-opacity duration-400"
              style={{ opacity: fading ? 0 : 1 }}
              aria-live="polite"
            >
              <DemoCard
                scene={scene}
                phase={phase}
                barWidths={barWidths}
                prefersReducedMotion={prefersReducedMotion}
              />
              <p className="mt-2.5 h-3.5 shrink-0 text-center text-[10px] font-medium tracking-[0.07em] text-muted-foreground uppercase">
                {stepLabels[phase]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
