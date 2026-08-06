"use client"

// Sixth shape, per founder correction (2026-08-04): the step TEXT
// SCROLLS on the left (Goodstack's ghosting titles — real scroll, not a
// swap-in-place), while the image sits pinned in the THIRD column,
// larger and bare (no tinted panel), updating to whichever step's text
// crosses the viewport middle. Columns follow the page grid; mobile
// stacks statically.

import { useEffect, useRef, useState } from "react"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { DemoFrame } from "@/components/hero-demo-panel/demo-frame"
import { SCENES } from "@/components/hero-demo-panel/scenes"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { Phase } from "@/components/hero-demo-panel/scenes"

// The CAUSE scene (founder, 2026-08-06), not the memorial one. This is the
// most neutral of the four — no protagonist, so the guest arc reads as the
// mechanic itself rather than as one register's story — and the register
// cards in the hero above have already covered the protagonist-shaped types.
// Its reveal is an impact line rather than someone's favourite, which is what
// a cause favpoll actually shows.
const SCENE = SCENES.find((s) => s.kind === "cause") ?? SCENES[0]

const STEPS: { phase: Phase; label: string; body: string }[] = [
  {
    // The state a guest ARRIVES in (founder, 2026-08-06): "arriving" is a
    // locked phase, so the card shows blurred decoy bars and the reveal lock —
    // the withholding the rest of the arc then resolves. Without it the
    // sequence opened mid-story, on a picker already in use.
    phase: "arriving",
    label: t("landing.how.arrive.label"),
    body: t("landing.how.arrive.body"),
  },
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
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [active, setActive] = useState(0)
  const blockRefs = useRef<(HTMLDivElement | null)[]>([])
  // Plain scroll math, not IntersectionObserver — percentage rootMargins
  // proved unreliable across browsers/zoom (founder's tab never advanced
  // the frames). Active = the last step whose block top has crossed 45%
  // of the viewport.
  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.45
      let idx = 0
      blockRefs.current.forEach((node, i) => {
        if (node && node.getBoundingClientRect().top <= line) idx = i
      })
      setActive(idx)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    // Tinted band, swapped with the Create/Share/Watch section below (founder,
    // 2026-08-06). That section and RegisterMatrix were BOTH bg-primary/5, so
    // the page ran two tinted bands back to back; the swap restores the
    // alternation (purple · tint · white · tint · white).
    <section className="w-full bg-primary/5">
      <div className="mx-auto w-full max-w-330 px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Cols 1–2 — pinned headline, then the SCROLLING step texts */}
          <div className="md:col-span-2">
            {/* Pinned header (the Goodstack stills): solid backdrop so the
                scrolling step texts vanish beneath it, not through it. */}
            <div className="relative z-10 bg-band-tint pb-6 before:absolute before:inset-x-0 before:bottom-full before:h-14 before:bg-band-tint after:absolute after:inset-x-0 after:top-full after:h-20 after:bg-gradient-to-b after:from-band-tint after:to-transparent md:sticky md:top-28">
              <SectionEyebrow className="mb-2">
                {t("home.overview.eyebrow")}
              </SectionEyebrow>
              <h2 className="max-w-md text-3xl font-light tracking-tight text-foreground md:text-4xl">
                {t("home.overview.headline")}
              </h2>
            </div>
            {STEPS.map((step, i) => (
              <div
                key={step.phase}
                ref={(node) => {
                  blockRefs.current[i] = node
                }}
                className={cn(
                  "flex max-w-md flex-col justify-center transition-opacity duration-300 md:min-h-[50vh]",
                  "max-md:mt-10",
                  i === active ? "md:opacity-100" : "md:opacity-30"
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

          {/* Col 3 — the pinned image, larger and bare */}
          <div className="relative hidden md:block" aria-hidden="true">
            <div className="sticky top-28 flex justify-center">
              <div className="pointer-events-none relative h-[34.8rem] w-100 max-w-full select-none">
                {mounted &&
                  STEPS.map((step, i) => (
                    <div
                      key={step.phase}
                      className={cn(
                        "absolute inset-0 transition-opacity duration-500",
                        i === active ? "opacity-100" : "opacity-0"
                      )}
                    >
                      <div className="h-174 w-125 origin-top-left scale-[0.8]">
                        <DemoFrame>
                          <DemoCard
                            scene={SCENE}
                            phase={step.phase}
                            barWidths={SCENE.results.map((r) => r.widthPercent)}
                            prefersReducedMotion
                            className="rounded-t-none border-t-0"
                          />
                        </DemoFrame>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Mobile — a single static frame beneath the texts */}
          <div
            className="pointer-events-none flex justify-center select-none md:hidden"
            aria-hidden="true"
          >
            {mounted && (
              <div className="h-[24rem] w-[17.2rem]">
                <div className="h-174 w-125 origin-top-left scale-[0.55]">
                  <DemoFrame>
                    <DemoCard
                      scene={SCENE}
                      phase="reveal"
                      barWidths={SCENE.results.map((r) => r.widthPercent)}
                      prefersReducedMotion
                      className="rounded-t-none border-t-0"
                    />
                  </DemoFrame>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
