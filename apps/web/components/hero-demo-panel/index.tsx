"use client"

import { useEffect, useRef, useState } from "react"
import { Chip } from "@/components/ui/chip"
import type { Phase } from "./scenes"
import { SCENES, OCCASION_CHIPS } from "./scenes"
import { HeroPitchColumn } from "./hero-pitch-column"
import { DemoCard } from "./demo-card"

export function HeroDemoPanel() {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const [sceneIndex, setSceneIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>(
    prefersReducedMotion ? "reveal" : "arriving"
  )
  const [barWidths, setBarWidths] = useState<number[]>(
    prefersReducedMotion ? SCENES[0].results.map((r) => r.widthPercent) : SCENES[0].results.map(() => 0)
  )
  const [fading, setFading] = useState(false)

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])
  const clearAll = () => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
  }
  const addT = (fn: () => void, ms: number) =>
    timeouts.current.push(setTimeout(fn, ms))

  useEffect(() => {
    if (prefersReducedMotion) return
    clearAll()

    const scene = SCENES[sceneIndex]
    // Wait for all options to stagger in (300ms start + 80ms per item) then give
    // 1.5s viewing time before auto-selecting, so long lists don't feel rushed.
    const optionStaggerMs = 300 + (scene.poll.topic.topic_items.length - 1) * 80
    const selectedAt = optionStaggerMs + 1500

    addT(() => setPhase("selected"), selectedAt)
    addT(() => setPhase("pledge-panel"), selectedAt + 2000)
    addT(() => setPhase("amount-picked"), selectedAt + 3800)
    addT(() => setPhase("pledging"), selectedAt + 5200)
    addT(() => setPhase("confirmed"), selectedAt + 5500)
    addT(() => setPhase("clearing"), selectedAt + 6800)
    addT(() => setPhase("reveal"), selectedAt + 7400)

    scene.results.forEach((result, i) => {
      addT(
        () =>
          setBarWidths((prev) => {
            const next = [...prev]
            next[i] = result.widthPercent
            return next
          }),
        selectedAt + 8000 + i * 200
      )
    })

    addT(() => setFading(true), selectedAt + 16000)
    addT(() => {
      const nextIndex = (sceneIndex + 1) % SCENES.length
      setPhase("arriving")
      setBarWidths(SCENES[nextIndex].results.map(() => 0))
      setFading(false)
      setSceneIndex(nextIndex)
    }, selectedAt + 16500)

    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneIndex])

  const handleOccasionClick = (index: number) => {
    if (index === sceneIndex) return
    clearAll()
    setFading(true)
    setTimeout(() => {
      setPhase("arriving")
      setBarWidths(SCENES[index].results.map(() => 0))
      setFading(false)
      setSceneIndex(index)
    }, 400)
  }

  const scene = SCENES[sceneIndex]

  const showOptions = phase === "arriving" || phase === "selected"
  const showPledgePanel =
    phase === "pledge-panel" ||
    phase === "amount-picked" ||
    phase === "pledging" ||
    phase === "confirmed"
  const showToast = phase === "confirmed"
  const showReveal = phase === "reveal"

  const stepLabels: Record<Phase, string> = {
    arriving: "Choose your favourite",
    selected: "Your choice",
    "pledge-panel": "Choose an amount",
    "amount-picked": "Ready to pledge",
    pledging: "Pledging…",
    confirmed: "Pledged ✓",
    clearing: "",
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
            {/* Occasion chips */}
            <div className="mb-3 flex shrink-0 flex-wrap gap-1.25">
              {OCCASION_CHIPS.map(({ label, index }) => (
                <Chip
                  key={label}
                  selected={index === sceneIndex}
                  onClick={() => handleOccasionClick(index)}
                  className="py-1 text-[11px]"
                >
                  {label}
                </Chip>
              ))}
            </div>

            <span className="sr-only">
              Animated demonstration of how favpoll works, showing a{" "}
              {scene.occasion_label.toLowerCase()} event. The demonstration cycles
              through occasion types automatically. Use the buttons above to
              jump to a specific occasion.
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
