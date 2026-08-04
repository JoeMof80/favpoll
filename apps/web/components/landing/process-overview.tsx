"use client"

// The Goodstack-style process walkthrough, fourth iteration (founder,
// 2026-08-04): STILL images of the demo steps, animated BETWEEN — the
// visual column is sticky while the step texts scroll past, and the
// frame crossfades to the active step (that scroll choreography is the
// "animation" the reference shows; the cards themselves never animate).
// Columns and type match the page's other feature sections: the house
// band inner (max-w-330 px-6 py-16), sm:grid-cols-2, max-w-md text,
// text-3xl font-light h2 in the left column.

import { useEffect, useRef, useState } from "react"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { SCENES } from "@/components/hero-demo-panel/scenes"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { Phase } from "@/components/hero-demo-panel/scenes"

const SCENE = SCENES[0] // Belinda — one coherent story across the steps

const STEPS: { phase: Phase; label: string; body: string }[] = [
  {
    phase: "selected",
    label: t("landing.how.pick.label"),
    body: t("landing.how.pick.body"),
  },
  {
    phase: "amount-picked",
    label: t("landing.how.pledge.label"),
    body: t("landing.how.pledge.body"),
  },
  {
    phase: "reveal",
    label: t("landing.how.reveal.label"),
    body: t("landing.how.reveal.body"),
  },
]

export function ProcessOverview() {
  // Client-only frames: the mid-flow phases were never SSR-rendered and
  // hydrate dirty; decorative + aria-hidden, so no SEO cost.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [active, setActive] = useState(0)
  const blockRefs = useRef<(HTMLDivElement | null)[]>([])
  useEffect(() => {
    const observers = blockRefs.current.map((node, i) => {
      if (!node) return null
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(i)
        },
        // A band across the viewport's middle: the step whose text
        // crosses it owns the frame.
        { rootMargin: "-40% 0px -40% 0px" }
      )
      obs.observe(node)
      return obs
    })
    return () => observers.forEach((o) => o?.disconnect())
  }, [])

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-330 px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Left — h2 in-column (the house grammar), then the scrolling
              step texts that drive the sticky frame */}
          <div>
            <h2 className="mb-4 text-3xl font-light tracking-tight text-foreground">
              {t("home.overview.headline")}
            </h2>
            {STEPS.map((step, i) => (
              <div
                key={step.phase}
                ref={(node) => {
                  blockRefs.current[i] = node
                }}
                className="flex min-h-[45vh] max-w-md flex-col justify-center last:min-h-[30vh]"
              >
                <p
                  className={cn(
                    "mb-2 text-xs font-medium tracking-widest uppercase transition-opacity duration-300",
                    i === active ? "text-primary" : "text-primary/50"
                  )}
                >
                  {i + 1}. {step.label}
                </p>
                <p
                  className={cn(
                    "text-lg leading-relaxed text-muted-foreground transition-opacity duration-300",
                    i === active ? "opacity-100" : "opacity-50"
                  )}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          {/* Right — sticky frame, crossfading to the active step */}
          <div className="relative hidden sm:block" aria-hidden="true">
            <div className="sticky top-[calc(50vh-12rem)] flex justify-center">
              <div className="pointer-events-none relative h-[24rem] w-[17.2rem] select-none">
                {mounted &&
                  STEPS.map((step, i) => (
                    <div
                      key={step.phase}
                      className={cn(
                        "absolute inset-0 transition-opacity duration-500",
                        i === active ? "opacity-100" : "opacity-0"
                      )}
                    >
                      <div className="h-174 w-125 origin-top-left scale-[0.55]">
                        <DemoCard
                          scene={SCENE}
                          phase={step.phase}
                          barWidths={SCENE.results.map((r) => r.widthPercent)}
                          prefersReducedMotion
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
