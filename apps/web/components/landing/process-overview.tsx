"use client"

// The Goodstack-style overview, third iteration (founder, 2026-08-04):
// rows are the STEPS, not the registers — Pick / Pledge / Reveal, each
// with text left and a STATIC frame of the real DemoCard frozen at that
// step right (never a screenshot, never animated — founder call).
// Registers live in the hero router cards; this section teaches the
// process with still images.

import { useEffect, useState } from "react"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { SCENES } from "@/components/hero-demo-panel/scenes"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { t } from "@/lib/i18n"
import type { Phase } from "@/components/hero-demo-panel/scenes"

const SCENE = SCENES[0] // Belinda — the flagship story

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
  // The mid-flow phases ("selected", "amount-picked") were never
  // SSR-rendered before and hydrate dirty — the frames are decorative
  // and aria-hidden, so mount them client-only.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <section className="w-full">
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <SectionEyebrow className="mb-2 text-center">
          {t("home.overview.eyebrow")}
        </SectionEyebrow>
        <h2 className="mb-12 text-center text-3xl font-light tracking-tight text-foreground md:text-4xl">
          {t("home.overview.headline")}
        </h2>
        <div className="space-y-12">
          {STEPS.map((step, i) => (
            <div
              key={step.phase}
              className="grid items-center gap-8 md:grid-cols-[1fr_20rem]"
            >
              <div>
                <p className="mb-2 text-xs font-medium tracking-widest text-primary uppercase">
                  {i + 1}. {step.label}
                </p>
                <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
              {/* The step, as a still of the real card */}
              <div
                aria-hidden="true"
                className="pointer-events-none flex justify-center overflow-hidden rounded-xl bg-primary/5 p-6 select-none"
              >
                <div className="h-[24rem] w-[17.2rem]">
                  <div className="h-174 w-125 origin-top-left scale-[0.55]">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
