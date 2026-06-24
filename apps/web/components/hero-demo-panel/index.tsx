"use client"

import { useEffect, useRef, useState } from "react"
import type { Phase } from "./scenes"
import { SCENES } from "./scenes"
import { HeroPitchColumn } from "./hero-pitch-column"
import { DemoCard } from "./demo-card"

export function HeroDemoPanel() {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const [sceneIndex, setSceneIndex] = useState(0)

  // Start in the resolved state so the reveal is visible on first paint.
  // The loop then replays the withhold → pick → pledge → results → reveal
  // arc for visitors who stay, without holding the payoff hostage.
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

  // isFirstRun tracks whether this is the initial mount; the first run holds
  // on the reveal state briefly before starting the loop, subsequent scene
  // changes go straight into "arriving".
  const isFirstRun = useRef(true)

  useEffect(() => {
    if (prefersReducedMotion) return
    clearAll()

    const INITIAL_HOLD = isFirstRun.current ? 2500 : 0
    isFirstRun.current = false

    const scene = SCENES[sceneIndex]
    // Wait for all options to stagger in (300ms start + 80ms per item) then
    // give 1.2s viewing time before auto-selecting.
    const optionStaggerMs = 300 + (scene.poll.topic.favourites.length - 1) * 80
    const selectedAt = optionStaggerMs + 1200

    // Transition to the withholding state, then replay the full arc.
    addT(() => {
      setPhase("arriving")
      setBarWidths(SCENES[sceneIndex].results.map(() => 0))
    }, INITIAL_HOLD)

    addT(() => setPhase("selected"), INITIAL_HOLD + selectedAt)
    addT(() => setPhase("pledge-panel"), INITIAL_HOLD + selectedAt + 1500)
    addT(() => setPhase("amount-picked"), INITIAL_HOLD + selectedAt + 2800)
    addT(() => setPhase("pledging"), INITIAL_HOLD + selectedAt + 3800)
    addT(() => setPhase("confirmed"), INITIAL_HOLD + selectedAt + 4000)
    addT(() => setPhase("clearing"), INITIAL_HOLD + selectedAt + 5000)

    // Results beat — bars climb before the reveal lands.
    addT(() => setPhase("results"), INITIAL_HOLD + selectedAt + 5600)
    scene.results.forEach((result, i) => {
      addT(
        () =>
          setBarWidths((prev) => {
            const next = [...prev]
            next[i] = result.widthPercent
            return next
          }),
        INITIAL_HOLD + selectedAt + 6200 + i * 200
      )
    })

    // Reveal lands after bars have populated.
    addT(() => setPhase("reveal"), INITIAL_HOLD + selectedAt + 8500)

    // Hold on the reveal — it's the emotional payoff, not a frame to rush past.
    addT(() => setFading(true), INITIAL_HOLD + selectedAt + 14000)
    addT(
      () => {
        const nextIndex = (sceneIndex + 1) % SCENES.length
        setPhase("arriving")
        setBarWidths(SCENES[nextIndex].results.map(() => 0))
        setFading(false)
        setSceneIndex(nextIndex)
      },
      INITIAL_HOLD + selectedAt + 14500
    )

    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex])

  const scene = SCENES[sceneIndex]

  const showOptions = phase === "arriving" || phase === "selected"
  const showPledgePanel =
    phase === "pledge-panel" ||
    phase === "amount-picked" ||
    phase === "pledging" ||
    phase === "confirmed"
  const showToast = phase === "confirmed"
  // Results (ranking bars) appear in both the results beat and the reveal phase.
  const showResults = phase === "results" || phase === "reveal"
  // The personal reveal only shows in the final phase.
  const showReveal = phase === "reveal"

  const stepLabels: Record<Phase, string> = {
    arriving: "Choose your favourite",
    selected: "Your choice",
    "pledge-panel": "Choose an amount",
    "amount-picked": "Ready to pledge",
    pledging: "Pledging…",
    confirmed: "Pledged ✓",
    clearing: "",
    results: "Guests' picks",
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
                showOptions={showOptions}
                showPledgePanel={showPledgePanel}
                showToast={showToast}
                showResults={showResults}
                showReveal={showReveal}
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
