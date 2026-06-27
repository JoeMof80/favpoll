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

    // Locked: blurred decoy bars hold arbitrary widths behind the lock card.
    addT(() => {
      setPhase("arriving")
      setBarWidths(decoyFor(scene))
    }, HOLD)

    addT(() => setPhase("trigger-hover"), HOLD + 900) // pill hover
    addT(() => setPhase("triggering"), HOLD + 1200) // pill press
    addT(() => setPhase("picking"), HOLD + 1550) // picker opens, browsing
    addT(() => setPhase("selected"), HOLD + 2750) // a favourite is selected
    addT(() => setPhase("next-hover"), HOLD + 3450) // Next hover
    addT(() => setPhase("next-pressed"), HOLD + 3750) // Next pressed
    addT(() => setPhase("pledge-panel"), HOLD + 4100) // amount step, Pledge off
    addT(() => setPhase("amount-picked"), HOLD + 5100) // preset picked, Pledge on
    addT(() => setPhase("pledge-hover"), HOLD + 6000) // Pledge hover
    addT(() => setPhase("pledging"), HOLD + 6300) // Pledge pressed
    addT(() => setPhase("confirmed"), HOLD + 6600) // confirmation in dialog

    // Pledge confirmed → dialog closes, the blur lifts, and the decoy bars
    // climb to their real widths — the disclosure, all in one motion.
    addT(() => setPhase("clearing"), HOLD + 7800)
    scene.results.forEach((result, i) => {
      addT(
        () =>
          setBarWidths((prev) => {
            const next = [...prev]
            next[i] = result.widthPercent
            return next
          }),
        HOLD + 7900 + i * 180
      )
    })

    addT(() => setPhase("results"), HOLD + 8300) // bars mid-climb
    addT(() => setPhase("reveal"), HOLD + 9400) // settled

    addT(() => setFading(true), HOLD + 12800)
    addT(
      () => {
        const nextIndex = (sceneIndex + 1) % SCENES.length
        setPhase("arriving")
        setBarWidths(decoyFor(SCENES[nextIndex]))
        setFading(false)
        setSceneIndex(nextIndex)
      },
      HOLD + 13300
    )

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
    clearing: "Unlocking…",
    results: "Unlocking…",
    reveal: `${scene.protagonist.name.split(" ")[0]}'s reveal`,
  }

  return (
    <section id="how-it-works" className="border-b border-border bg-muted">
      <div className="mx-auto max-w-330">
        <div className="mx-auto flex h-176 w-full max-w-330">
          {/* Left — pitch copy */}
          <HeroPitchColumn sceneIndex={sceneIndex} />

          {/* Right — demo card (desktop only) */}
          <div
            className="hidden h-176 flex-col p-5 md:flex"
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
