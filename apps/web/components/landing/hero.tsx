"use client"

// Landing hero: purple band with monogram shimmer texture (eyebrow retired
// carrying the breadth (any occasion, or none), one fixed universal headline
// naming the mechanic the demo enacts, a kind nav to jump the demo, and the
// live animated demo card in a browser-style frame (traffic lights signal that
// it's a demo). The card renders at full logical size and is optically scaled
// to 80%. Register/occasion signals live in the kind nav + the demo content —
// nothing in the pitch column cycles.
import Link from "next/link"
import { useMemo } from "react"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { NAV_TABS, SCENES } from "@/components/hero-demo-panel/scenes"
import type { SceneKind } from "@/components/hero-demo-panel/scenes"
import { Button } from "@/components/ui/button"
import { RankingBar } from "@/components/ui/ranking-bar"
import { cn } from "@/lib/utils"
import { formatCurrency, MARKET_DEFAULTS, t } from "@/lib/i18n"
import { useDemoLoop, beatForPhase } from "./use-demo-loop"
import { CountUp } from "./count-up"
import { HeroTexture } from "./hero-texture"

const BEATS = ["Pick", "Pledge", "Reveal"] as const

type Props = {
  liveCount?: number
  totalLive?: number
  /** Register pages: the stats row is home-flavoured — hide it. */
  hideStats?: boolean
  /** Optional eyebrow above the headline (home has none). */
  eyebrow?: string
  /** Register landing v2 (2026-08-03): play ONLY this kind's scenes on a
   *  loop and hide the kind nav — the page IS the kind. Home omits it. */
  sceneKind?: SceneKind
  /** Copy overrides — literal strings (t() stays statically typed at the
   *  call site). Defaults = the home landing's keys. */
  headline?: string
  subheader?: string
  ctaLabel?: string
  /** Band override, e.g. "bg-memorial text-memorial-foreground". */
  bandClassName?: string
  /**
   * REVERSIBLE V1 (founder, 2026-08-04): the Goodstack-style register
   * router replaces the demo column — the demos now live on the register
   * pages. Remove the prop on the home page to restore the demo hero.
   */
  router?: boolean
}

const ROUTER_CARDS = [
  {
    kind: "memorial" as const,
    href: "/memorials",
    accent: "border-t-memorial",
    eyebrow: "text-memorial",
    bar: "bg-memorial",
    title: t("home.router.memorials.title"),
    body: t("home.router.memorials.body"),
  },
  {
    kind: "celebration" as const,
    href: "/celebrations",
    accent: "border-t-warning",
    eyebrow: "text-warning",
    bar: "bg-warning",
    title: t("home.router.celebrations.title"),
    body: t("home.router.celebrations.body"),
  },
  {
    kind: "fundraiser" as const,
    href: "/fundraisers",
    accent: "border-t-success",
    eyebrow: "text-success",
    bar: "bg-success",
    title: t("home.router.fundraisers.title"),
    body: t("home.router.fundraisers.body"),
  },
] as const

export function LandingHero({
  liveCount = 0,
  totalLive = 0,
  hideStats = false,
  eyebrow,
  sceneKind,
  headline,
  subheader,
  ctaLabel,
  bandClassName,
  router = false,
}: Props) {
  const scenes = useMemo(
    () => (sceneKind ? SCENES.filter((s) => s.kind === sceneKind) : SCENES),
    [sceneKind]
  )
  const { scene, phase, barWidths, fading, prefersReducedMotion, goToScene } =
    useDemoLoop(scenes)
  const beat = beatForPhase(phase)

  return (
    <section
      className={cn(
        // Full-screen band (founder, 2026-08-05): the hero fills the
        // viewport below the h-14 nav, content vertically centred —
        // min-h, not h, so short phones never clip.
        "relative flex min-h-[calc(100vh-3.5rem)] items-center",
        bandClassName ?? "bg-primary text-primary-foreground"
      )}
    >
      <HeroTexture />
      <div className="relative mx-auto grid w-full max-w-87 gap-8 px-0 py-10 sm:max-w-100 md:max-w-330 md:grid-cols-[1fr_44rem] md:grid-rows-[auto_auto] md:items-center md:gap-x-12 md:gap-y-8 md:px-6 md:py-20">
        {/* Left — pitch (headline + CTA). Stats are a separate cell below,
            so on mobile the demo comes right after the pitch. */}
        <div className="md:col-start-1 md:row-start-1">
          {/* Single, register-agnostic headline — names the three-beat
              mechanic the demo plays out; the subheader carries the soul.
              Each sentence takes its own line so the triad never wraps
              mid-beat. */}
          {eyebrow && (
            <p className="mb-4 text-xs font-medium tracking-widest uppercase opacity-80">
              {eyebrow}
            </p>
          )}
          <h1 className="mb-6 max-w-xl text-4xl leading-[1.12] font-light tracking-tight md:text-5xl">
            {(headline ?? t("landing.headline"))
              .split(". ")
              .map((sentence, i, all) => (
                <span key={sentence} className="block">
                  {sentence}
                  {i < all.length - 1 ? "." : ""}
                </span>
              ))}
          </h1>
          <p className="mb-8 max-w-md text-lg leading-relaxed opacity-80">
            {subheader ?? t("landing.subheader")}
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            {/* The hero's only conversion action under a display headline —
                poster-scale, not form-scale (founder call, 2026-07-28) */}
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-11 px-6 text-base"
            >
              <Link href="/favpolls/new">
                {ctaLabel ?? t("landing.cta.primary")}
              </Link>
            </Button>
          </div>
        </div>

        {/* Right — live demo in a browser-style frame. Rendered at full
            logical size (nothing cropped — the real experience) and optically
            scaled: 80% on md+, 68% on phones so the same card fits a
            ~360px-wide screen. On mobile it stacks directly under the pitch,
            before the stats, so the demo is the first thing a visitor scrolls
            to. */}
        <div className="md:col-start-2 md:row-span-2 md:row-start-1">
          {router ? (
            /* Register router — one card per register, its accent as the
               top rule; the demo lives on the page each card opens. */
            <nav
              aria-label="Explore favpoll by occasion"
              className="grid gap-4"
            >
              {ROUTER_CARDS.map((card) => (
                <Link
                  key={card.kind}
                  href={card.href}
                  className={cn(
                    "group block rounded-xl border-t-4 bg-background p-5 text-foreground shadow-lg transition-all hover:shadow-xl motion-safe:hover:-translate-y-0.5",
                    card.accent
                  )}
                >
                  {/* Two columns inside the card (founder, 2026-08-05):
                      the register's text one side, its poll — the
                      product's core — the other. Scene-sourced, accent
                      bars, charity + total beneath. */}
                  <div className="grid items-center gap-5 sm:grid-cols-[1fr_1.3fr]">
                    <div>
                      <p
                        className={cn(
                          "mb-1 text-xs font-medium tracking-widest uppercase",
                          card.eyebrow
                        )}
                      >
                        {card.title}
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {card.body}
                      </p>
                    </div>
                    {(() => {
                      const scene = SCENES.find((sc) => sc.kind === card.kind)!
                      return (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none space-y-1.5 select-none"
                        >
                          <p className="text-xs font-medium tracking-[0.09em] text-muted-foreground uppercase">
                            Favourite {scene.poll.topic.title}
                          </p>
                          {scene.results.slice(0, 3).map((r) => (
                            <RankingBar
                              key={r.label}
                              label={r.label}
                              amount={r.amount}
                              widthPercent={r.widthPercent}
                              barClassName={card.bar}
                            />
                          ))}
                          {/* Where it all goes — charity + running total */}
                          <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
                            <span className="text-muted-foreground">
                              {scene.charities[0].name}
                            </span>
                            <span className="font-medium text-primary">
                              {scene.total}
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </Link>
              ))}
            </nav>
          ) : (
            <>
              <span className="sr-only">
                Animated demonstration of how favpoll works. It cycles through
                the different kinds of favpoll automatically; use the buttons
                below to jump to one.
              </span>
              {/* Kind nav — jump the demo to a kind of favpoll, disrupting the
              auto-cycle so a visitor doesn't wait for their kind to come round. */}
              {!sceneKind && (
                <div
                  className="mb-4 flex flex-wrap justify-start gap-2 md:justify-center"
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
              )}
              <div
                className="transition-opacity duration-400"
                style={{ opacity: fading ? 0 : 1 }}
                aria-live="polite"
              >
                <div className="h-108 w-[19.4rem] sm:h-[34.8rem] sm:w-100">
                  <div className="h-174 w-125 origin-top-left scale-[0.62] text-foreground sm:scale-80">
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
                  className="mt-3 flex w-[19.4rem] items-center justify-start gap-4 sm:w-100 md:justify-center"
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
            </>
          )}
        </div>

        {!hideStats && (
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
        )}
      </div>
    </section>
  )
}
