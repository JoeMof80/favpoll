"use client"

// PROTOTYPE — split-variant hero: purple band with monogram shimmer texture,
// cycling occasion eyebrow + per-occasion headline (synced to the demo
// scene), live animated DemoCard rendered full-size and optically scaled to
// 80%, count-up stats. NOTE: per-occasion headlines contradict the brand
// skill's "never change the headline" rule — if this wins, the brand doc and
// landing.headline i18n key both need updating on fold-in.
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { SCENE_EYEBROWS } from "@/components/hero-demo-panel/scenes"
import { Button } from "@/components/ui/button"
import { formatCurrency, MARKET_DEFAULTS, t } from "@/lib/i18n"
import { useDemoLoop, beatForPhase } from "./use-demo-loop"
import { CountUp } from "./count-up"
import { HeroTexture } from "./hero-texture"

const BEATS = ["Choose", "Pledge", "Reveal"] as const

// One headline per scene (Memorial, Birthday, Retirement, Engagement,
// Leaving do, Graduation) — same rhythm, the verb carries the register.
// Index 0 is the canonical brand headline, unchanged.
const SCENE_HEADLINES = [
  "Honour them through what they loved — for the causes they cared about.",
  "Celebrate them through what they love — for the causes they care about.",
  "Thank them through what they love — for the causes they care about.",
  "Toast them through what they love — for the causes they care about.",
  "Send them off with what they love — for the causes they care about.",
  "Cheer them on through what they love — for the causes they care about.",
]

type Props = {
  liveCount: number
  totalLive: number
}

export function SplitHero({ liveCount, totalLive }: Props) {
  const { scene, sceneIndex, phase, barWidths, fading, prefersReducedMotion } =
    useDemoLoop()
  const beat = beatForPhase(phase)

  return (
    <section className="relative bg-primary text-primary-foreground">
      <HeroTexture />
      <div className="relative mx-auto grid max-w-330 items-center gap-12 px-6 py-16 md:grid-cols-[1fr_25rem] md:py-20">
        {/* Left — pitch */}
        <div>
          <div className="mb-4 h-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={`eyebrow-${sceneIndex}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-xs font-medium tracking-widest uppercase opacity-80"
              >
                {SCENE_EYEBROWS[sceneIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
          <h1 className="mb-6 min-h-[10.5rem] max-w-xl text-5xl leading-[1.12] font-light tracking-tight">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`headline-${sceneIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="block"
              >
                {SCENE_HEADLINES[sceneIndex]}
              </motion.span>
            </AnimatePresence>
          </h1>
          <p className="mb-8 max-w-md text-lg leading-relaxed opacity-80">
            {t("landing.subheader")}
          </p>
          <div className="mb-12 flex flex-wrap items-center gap-3.5">
            <Button asChild size="lg" variant="secondary">
              <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/favpolls">See live favpolls →</Link>
            </Button>
          </div>
          <dl className="flex flex-wrap gap-x-14 gap-y-6 border-t border-primary-foreground/20 pt-8">
            <div>
              <dt className="text-xs font-medium tracking-widest uppercase opacity-70">
                Live favpolls
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
                  Raised by live favpolls
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
                <CountUp value={95} format={(n) => `${Math.round(n)}%`} />
              </dd>
            </div>
          </dl>
        </div>

        {/* Right — live demo card on the purple stage (desktop only).
            Rendered at its full size (31.25rem × 41.25rem — the real card
            experience, nothing cropped) and optically scaled to 80%. */}
        <div className="hidden md:block">
          <span className="sr-only">
            Animated demonstration of how favpoll works. The demonstration
            cycles through different occasions automatically.
          </span>
          <div
            className="transition-opacity duration-400"
            style={{ opacity: fading ? 0 : 1 }}
            aria-live="polite"
          >
            <div className="h-[33rem] w-100">
              <div className="h-[41.25rem] w-125 origin-top-left scale-80 text-foreground">
                <div className="flex h-full flex-col rounded-xl shadow-2xl">
                  <DemoCard
                    scene={scene}
                    phase={phase}
                    barWidths={barWidths}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                </div>
              </div>
            </div>
            {/* Beat indicator: which of the three beats the loop is in */}
            <div
              className="mt-3 flex w-100 items-center justify-center gap-4"
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
      </div>
    </section>
  )
}
