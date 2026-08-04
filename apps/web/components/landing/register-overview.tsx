"use client"

// The Goodstack-style "Platform overview" body section (founder,
// 2026-08-04): eyebrow + headline, then one row per register — text left
// (title, one-liner, Explore →), and the register's REAL DemoCard as the
// LARGE visual right (never a screenshot). LIVE, not frozen (founder,
// same day, after Goodstack's animation): each card walks the full
// pick → pledge → reveal arc via the single-scene demo loop — but only
// while its row is in view (IntersectionObserver), so at most the rows
// on screen animate and off-screen rows hold the resolved payoff.
// Reduced motion stays static via the loop's own path.

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { SCENES } from "@/components/hero-demo-panel/scenes"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { useDemoLoop } from "@/components/landing/use-demo-loop"
import { cn } from "@/lib/utils"
import { t } from "@/lib/i18n"

const ROWS = [
  {
    kind: "memorial" as const,
    href: "/memorials",
    band: "bg-memorial-muted",
    eyebrow: "text-memorial",
    title: t("home.router.memorials.title"),
    body: t("home.router.memorials.body"),
  },
  {
    kind: "celebration" as const,
    href: "/celebrations",
    band: "bg-warning-muted",
    eyebrow: "text-warning",
    title: t("home.router.celebrations.title"),
    body: t("home.router.celebrations.body"),
  },
  {
    kind: "fundraiser" as const,
    href: "/fundraisers",
    band: "bg-success/5",
    eyebrow: "text-success",
    title: t("home.router.fundraisers.title"),
    body: t("home.router.fundraisers.body"),
  },
]

function LiveDemo({ scene }: { scene: (typeof SCENES)[number] }) {
  const { phase, barWidths, prefersReducedMotion } = useDemoLoop([scene])
  return (
    <DemoCard
      scene={scene}
      phase={phase}
      barWidths={barWidths}
      prefersReducedMotion={prefersReducedMotion}
    />
  )
}

export function RegisterOverview() {
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
          {ROWS.map((row) => {
            const scene = SCENES.find((sc) => sc.kind === row.kind)!
            return (
              <div
                key={row.kind}
                className="grid items-center gap-8 md:grid-cols-[1fr_24rem]"
              >
                <div>
                  <p
                    className={cn(
                      "mb-2 text-xs font-medium tracking-widest uppercase",
                      row.eyebrow
                    )}
                  >
                    {row.title}
                  </p>
                  <p className="mb-4 max-w-md text-lg leading-relaxed text-muted-foreground">
                    {row.body}
                  </p>
                  <Link
                    href={row.href}
                    className="group text-sm font-medium text-primary"
                  >
                    {t("home.router.explore")}{" "}
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </div>
                <OverviewVisual band={row.band} scene={scene} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/** The row's visual: live demo while in view, resolved payoff otherwise. */
function OverviewVisual({
  band,
  scene,
}: {
  band: string
  scene: (typeof SCENES)[number]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none flex justify-center overflow-hidden rounded-xl p-6 select-none",
        band
      )}
    >
      {/* Full card, uncropped — the walkthrough's pledge steps happen
          mid-card, so nothing can be cut off. 0.55 scale = 275×383. */}
      <div className="h-[24rem] w-[17.2rem]">
        <div className="h-174 w-125 origin-top-left scale-[0.55]">
          {inView ? (
            <LiveDemo scene={scene} />
          ) : (
            <DemoCard
              scene={scene}
              phase="reveal"
              barWidths={scene.results.map((r) => r.widthPercent)}
              prefersReducedMotion
            />
          )}
        </div>
      </div>
    </div>
  )
}
