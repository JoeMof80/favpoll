"use client"

// Landing hero: purple band with monogram shimmer texture (eyebrow retired
// carrying the breadth (any occasion, or none), one fixed universal headline
// naming the mechanic the demo enacts, a kind nav to jump the demo, and the
// live animated demo card in a browser-style frame (traffic lights signal that
// it's a demo). The card renders at full logical size and is optically scaled
// to 80%. Register/occasion signals live in the kind nav + the demo content —
// nothing in the pitch column cycles.
import Link from "next/link"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { NAV_TABS } from "@/components/hero-demo-panel/scenes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatCurrency, MARKET_DEFAULTS, t } from "@/lib/i18n"
import { useDemoLoop, beatForPhase } from "./use-demo-loop"
import { CountUp } from "./count-up"
import { HeroTexture } from "./hero-texture"

const BEATS = ["Pick", "Pledge", "Reveal"] as const

type Props = {
  liveCount: number
  totalLive: number
}

export function LandingHero({ liveCount, totalLive }: Props) {
  const { scene, phase, barWidths, fading, prefersReducedMotion, goToScene } =
    useDemoLoop()
  const beat = beatForPhase(phase)

  return (
    <section className="relative bg-primary text-primary-foreground">
      <HeroTexture />
      <div className="relative mx-auto grid max-w-330 gap-8 px-6 py-10 md:grid-cols-[1fr_25rem] md:grid-rows-[auto_auto] md:items-center md:gap-x-12 md:gap-y-8 md:py-20">
        {/* Left — pitch (headline + CTA). Stats are a separate cell below,
            so on mobile the demo comes right after the pitch. */}
        <div className="md:col-start-1 md:row-start-1">
          {/* Single, register-agnostic headline — names the three-beat
              mechanic the demo plays out; the subheader carries the soul.
              Each sentence takes its own line so the triad never wraps
              mid-beat. */}
          <h1 className="mb-6 max-w-xl text-4xl leading-[1.12] font-light tracking-tight md:text-5xl">
            {t("landing.headline")
              .split(". ")
              .map((sentence, i, all) => (
                <span key={sentence} className="block">
                  {sentence}
                  {i < all.length - 1 ? "." : ""}
                </span>
              ))}
          </h1>
          <p className="mb-8 max-w-md text-lg leading-relaxed opacity-80">
            {t("landing.subheader")}
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <Button asChild size="lg" variant="secondary">
              <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
            </Button>
          </div>
        </div>

        {/* Right — live demo in a browser-style frame. Rendered at full
            logical size (nothing cropped — the real experience) and optically
            scaled: 80% on md+, 68% on phones so the same card fits a
            ~360px-wide screen. On mobile it stacks directly under the pitch,
            before the stats, so the demo is the first thing a visitor scrolls
            to. */}
        <div className="mx-auto md:col-start-2 md:row-span-2 md:row-start-1 md:mx-0">
          <span className="sr-only">
            Animated demonstration of how favpoll works. It cycles through the
            different kinds of favpoll automatically; use the buttons below to
            jump to one.
          </span>
          {/* Kind nav — jump the demo to a kind of favpoll, disrupting the
              auto-cycle so a visitor doesn't wait for their kind to come round. */}
          <div
            className="mb-4 flex flex-wrap justify-center gap-2"
            role="group"
            aria-label="Preview a kind of favpoll"
          >
            {NAV_TABS.map((tab) => {
              const active = tab.kind === scene.kind
              return (
                <Button
                  key={tab.label}
                  type="button"
                  size="sm"
                  variant={active ? "secondary" : "ghost"}
                  aria-pressed={active}
                  onClick={() => goToScene(tab.sceneIndex)}
                  className={cn(
                    "rounded-full",
                    !active &&
                      "border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  )}
                >
                  {tab.label}
                </Button>
              )
            })}
          </div>
          <div
            className="transition-opacity duration-400"
            style={{ opacity: fading ? 0 : 1 }}
            aria-live="polite"
          >
            <div className="h-108 w-[19.4rem] sm:h-[34.8rem] sm:w-100">
              <div className="h-[43.5rem] w-125 origin-top-left scale-[0.62] text-foreground sm:scale-80">
                <div className="flex h-full flex-col rounded-xl shadow-2xl">
                  {/* Traffic-light window bar — signals this is a demo */}
                  <div
                    className="flex h-9 shrink-0 items-center gap-1.5 rounded-t-xl border border-b-0 border-border bg-muted px-3.5"
                    aria-hidden="true"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    <span className="flex-1 text-center text-xs text-muted-foreground">
                      favpoll.com · demo
                    </span>
                    {/* Balance the dots so the label centres optically */}
                    <span className="w-9" />
                  </div>
                  <DemoCard
                    scene={scene}
                    phase={phase}
                    barWidths={barWidths}
                    prefersReducedMotion={prefersReducedMotion}
                    className="rounded-t-none border-t-0"
                  />
                </div>
              </div>
            </div>
            {/* Beat indicator: which of the three beats the loop is in */}
            <div
              className="mt-3 flex w-[19.4rem] items-center justify-center gap-4 sm:w-100"
              aria-hidden="true"
            >
              {BEATS.map((label, i) => (
                <span
                  key={label}
                  className={`flex items-center gap-1.5 text-xs font-medium tracking-[0.07em] uppercase transition-opacity duration-300 ${
                    i === beat ? "opacity-90" : "opacity-40"
                  }`}
                >
                  <span
                    className={`h-1 w-6 rounded-full transition-colors duration-300 ${
                      i === beat
                        ? "bg-primary-foreground"
                        : "bg-primary-foreground/30"
                    }`}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <dl className="flex flex-wrap gap-x-14 gap-y-6 border-t border-primary-foreground/20 pt-8 md:col-start-1 md:row-start-2">
          <div>
            <dt className="text-xs font-medium tracking-widest uppercase opacity-70">
              Open favpolls
            </dt>
            <dd className="mt-1 text-3xl font-light tabular-nums">
              <CountUp
                value={liveCount}
                format={(n) => String(Math.round(n))}
              />
            </dd>
          </div>
          {totalLive > 0 && (
            <div>
              <dt className="text-xs font-medium tracking-widest uppercase opacity-70">
                Raised by open favpolls
              </dt>
              <dd className="mt-1 text-3xl font-light tabular-nums">
                <CountUp
                  value={totalLive}
                  format={(n) =>
                    formatCurrency(Math.round(n), MARKET_DEFAULTS["en-GB"])
                  }
                />
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium tracking-widest uppercase opacity-70">
              Reaches charity
            </dt>
            <dd className="mt-1 text-3xl font-light tabular-nums">
              <CountUp value={100} format={(n) => `${Math.round(n)}%`} />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
