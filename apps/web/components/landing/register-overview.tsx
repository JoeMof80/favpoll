"use client"

// The Goodstack-style "Platform overview" body section (founder,
// 2026-08-04): eyebrow + headline, then one row per register — text left
// (title, one-liner, Explore →), and the register's REAL DemoCard frozen
// at its resolved payoff as the LARGE visual right (never a screenshot;
// the too-small hero-card vignettes moved here at readable scale). Each
// visual sits on its register's muted band.

import Link from "next/link"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { SCENES } from "@/components/hero-demo-panel/scenes"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
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
                {/* The register's frozen story, at readable scale */}
                <div
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none overflow-hidden rounded-xl p-6 select-none",
                    row.band
                  )}
                >
                  <div className="h-80 overflow-hidden rounded-lg shadow-lg">
                    <div className="h-174 w-125 origin-top-left scale-[0.7]">
                      <DemoCard
                        scene={scene}
                        phase="reveal"
                        barWidths={scene.results.map((r) => r.widthPercent)}
                        prefersReducedMotion
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
