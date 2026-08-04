"use client"

// The Goodstack scroll pattern, built from the founder's 13 stills
// (2026-08-04): the WHOLE section pins for its scroll duration —
// eyebrow + big headline fixed top-left, the step text in ONE slot
// below them (content swaps in place, slide + fade), and a large
// rounded panel pinned right that crossfades per step, each step with
// its own house tint. An invisible 300vh track provides the runway;
// scroll position only selects the active step. Mobile (< sm) falls
// back to simple stacked text + frames.

import { useEffect, useRef, useState } from "react"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { SCENES } from "@/components/hero-demo-panel/scenes"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { Phase } from "@/components/hero-demo-panel/scenes"

const SCENE = SCENES[0] // Belinda — one coherent story across the steps

const STEPS: {
  phase: Phase
  label: string
  body: string
  /** The panel's per-step house tint (Goodstack recolours per product) */
  panel: string
}[] = [
  {
    phase: "selected",
    label: t("landing.how.pick.label"),
    body: t("landing.how.pick.body"),
    panel: "bg-primary/10",
  },
  {
    phase: "amount-picked",
    label: t("landing.how.pledge.label"),
    body: t("landing.how.pledge.body"),
    panel: "bg-success/10",
  },
  {
    phase: "reveal",
    label: t("landing.how.reveal.label"),
    body: t("landing.how.reveal.body"),
    panel: "bg-warning-muted",
  },
]

export function ProcessOverview() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const node = trackRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const stepH = (rect.height - window.innerHeight) / STEPS.length
      if (stepH <= 0) return
      const idx = Math.min(
        STEPS.length - 1,
        Math.max(0, Math.floor(-rect.top / stepH))
      )
      setActive(idx)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <section className="w-full">
      {/* Desktop: the pinned screen over a 300vh track */}
      <div ref={trackRef} className="relative hidden h-[300vh] sm:block">
        <div className="sticky top-0 flex h-screen items-center">
          <div className="mx-auto grid w-full max-w-330 items-center gap-6 px-6 sm:grid-cols-2">
            <div>
              <SectionEyebrow className="mb-2">
                {t("home.overview.eyebrow")}
              </SectionEyebrow>
              <h2 className="mb-16 max-w-md text-3xl font-light tracking-tight text-foreground md:text-4xl">
                {t("home.overview.headline")}
              </h2>
              {/* ONE text slot — steps swap in place */}
              <div className="relative min-h-40 max-w-md">
                {STEPS.map((step, i) => (
                  <div
                    key={step.phase}
                    className={cn(
                      "absolute inset-x-0 top-0 transition-all duration-500",
                      i === active
                        ? "translate-y-0 opacity-100"
                        : i < active
                          ? "-translate-y-4 opacity-0"
                          : "translate-y-4 opacity-0"
                    )}
                  >
                    <p className="mb-2 text-xs font-medium tracking-widest text-primary uppercase">
                      {i + 1}. {step.label}
                    </p>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
              {/* Step dots */}
              <div className="mt-8 flex gap-2" aria-hidden="true">
                {STEPS.map((step, i) => (
                  <span
                    key={step.phase}
                    className={cn(
                      "h-1 w-8 rounded-full transition-colors duration-300",
                      i === active ? "bg-primary" : "bg-border"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* The pinned panel — per-step tint, frame crossfading */}
            <div
              className="pointer-events-none relative h-[70vh] max-h-[44rem] min-h-96 select-none"
              aria-hidden="true"
            >
              {STEPS.map((step, i) => (
                <div
                  key={step.phase}
                  className={cn(
                    "absolute inset-0 flex items-center justify-center rounded-2xl transition-opacity duration-500",
                    step.panel,
                    i === active ? "opacity-100" : "opacity-0"
                  )}
                >
                  <div className="h-[24rem] w-[17.2rem]">
                    <div className="h-174 w-125 origin-top-left scale-[0.55] drop-shadow-xl">
                      {mounted && (
                        <DemoCard
                          scene={SCENE}
                          phase={step.phase}
                          barWidths={SCENE.results.map((r) => r.widthPercent)}
                          prefersReducedMotion
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: simple stacked steps, no pinning */}
      <div className="mx-auto w-full max-w-330 px-6 py-16 sm:hidden">
        <SectionEyebrow className="mb-2">
          {t("home.overview.eyebrow")}
        </SectionEyebrow>
        <h2 className="mb-10 text-3xl font-light tracking-tight text-foreground">
          {t("home.overview.headline")}
        </h2>
        <div className="space-y-10">
          {STEPS.map((step, i) => (
            <div key={step.phase}>
              <p className="mb-2 text-xs font-medium tracking-widest text-primary uppercase">
                {i + 1}. {step.label}
              </p>
              <p className="leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
