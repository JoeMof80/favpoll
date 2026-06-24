"use client"

import { Check } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RankingBar } from "@/components/ui/ranking-bar"
import { RevealQuote } from "@/components/ui/reveal-quote"
import type { HeroScene, Phase } from "./scenes"
import { PLEDGE_AMOUNTS } from "./scenes"
import { fadeUp, fadeIn, revealVariant, FAST, MEDIUM, SLOW } from "./variants"

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

type Props = {
  scene: HeroScene
  phase: Phase
  barWidths: number[]
  prefersReducedMotion: boolean
  showOptions: boolean
  showPledgePanel: boolean
  showToast: boolean
  showReveal: boolean
}

export function DemoCard({
  scene,
  phase,
  barWidths,
  prefersReducedMotion,
  showOptions,
  showPledgePanel,
  showToast,
  showReveal,
}: Props) {
  const topicItems = scene.poll.topic.favourites
  const topicTitle = scene.poll.topic.title

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-background p-5">
      <div className="space-y-4">
        {/* Protagonist avatar + name + about */}
        <motion.div
          key={`protagonist-${scene.protagonist.name}`}
          {...fadeUp}
          transition={prefersReducedMotion ? FAST : { ...MEDIUM, delay: 0.08 }}
          className="flex items-start gap-4 border-b pb-4"
        >
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-medium text-white"
            style={{ backgroundColor: scene.avatarColor }}
            aria-hidden="true"
          >
            {getInitials(scene.protagonist.name)}
          </div>
          <div className="min-w-0">
            <p className="text-xl leading-tight font-medium tracking-tight text-foreground">
              {scene.protagonist.name}
            </p>
            <p className="mt-1 text-sm leading-snug text-muted-foreground">
              {scene.about}
            </p>
          </div>
        </motion.div>

        {/* Topic title */}
        <motion.div
          key={`title-${topicTitle}`}
          {...fadeUp}
          transition={prefersReducedMotion ? FAST : { ...MEDIUM, delay: 0.2 }}
        >
          <h2 className="text-2xl font-medium tracking-tight text-foreground">
            {topicTitle}
          </h2>
        </motion.div>

        {/* Poll options */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              key="options"
              {...fadeIn}
              exit={{ opacity: 0 }}
              transition={prefersReducedMotion ? FAST : MEDIUM}
              className="flex flex-wrap gap-1.5"
            >
              {topicItems.map((opt, i) => (
                <motion.div
                  key={opt.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale:
                      phase === "selected" && i === scene.selectedIndex
                        ? 1.02
                        : 1,
                  }}
                  transition={
                    prefersReducedMotion
                      ? FAST
                      : {
                          ...MEDIUM,
                          delay: phase === "arriving" ? 0.3 + i * 0.08 : 0,
                        }
                  }
                  className={cn(
                    "h-auto rounded-full border px-3 py-1.5 text-xs transition-all duration-200",
                    phase !== "arriving" && i === scene.selectedIndex
                      ? "border-[#534AB7] bg-[#534AB7] font-medium text-white"
                      : "border-border bg-background font-normal text-muted-foreground shadow-none"
                  )}
                >
                  {opt.label}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pledge panel — amounts + button */}
        <AnimatePresence>
          {showPledgePanel && (
            <motion.div
              key="pledge-panel"
              {...fadeUp}
              exit={{ opacity: 0, y: 4 }}
              transition={
                prefersReducedMotion ? FAST : { ...MEDIUM, delay: 0.3 }
              }
              className="space-y-3"
            >
              <div className="flex gap-1.5">
                {PLEDGE_AMOUNTS.map((amt, i) => (
                  <motion.div
                    key={amt}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      prefersReducedMotion
                        ? FAST
                        : { ...MEDIUM, delay: 0.06 * i }
                    }
                    className={cn(
                      "flex h-6 flex-1 items-center justify-center rounded-md px-2 text-xs transition-colors duration-200",
                      amt === scene.pledgeAmount &&
                        (phase === "amount-picked" ||
                          phase === "pledging" ||
                          phase === "confirmed")
                        ? "bg-primary font-medium text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {amt}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  prefersReducedMotion
                    ? FAST
                    : {
                        ...MEDIUM,
                        delay: 0.18 + PLEDGE_AMOUNTS.length * 0.06,
                      }
                }
              >
                <Button
                  className={cn(
                    "w-full transition-all duration-150",
                    phase === "pledging" ? "scale-[0.97] opacity-80" : "",
                    phase === "pledge-panel"
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  )}
                  disabled={phase === "pledge-panel"}
                  aria-hidden="true"
                >
                  Pledge favourites
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reveal quote */}
        <AnimatePresence>
          {showReveal && (
            <motion.div
              key="reveal"
              {...revealVariant}
              transition={prefersReducedMotion ? FAST : SLOW}
            >
              <RevealQuote
                text={scene.poll.personal_reveal}
                aria-live="polite"
                role="status"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rankings */}
        <AnimatePresence>
          {showReveal && (
            <motion.div
              key="rankings"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion ? FAST : { ...MEDIUM, delay: 0.3 }
              }
            >
              <ol className="space-y-2.5" aria-label="Current rankings">
                {scene.results.map((result, i) => (
                  <li key={result.label}>
                    <RankingBar
                      label={result.label}
                      amount={result.amount}
                      widthPercent={barWidths[i] ?? 0}
                      barStyle={{
                        background: i === 0 ? "#534AB7" : "#AFA9EC",
                        transition: prefersReducedMotion
                          ? "none"
                          : `width ${700 + i * 80}ms ease-out`,
                      }}
                    />
                  </li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom fade — fades ranking bars into the charity line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent" />

      {/* Charity / total — pinned to card bottom, always visible in reveal */}
      <AnimatePresence>
        {showReveal && (
          <motion.div
            key="charity-total"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={
              prefersReducedMotion ? FAST : { ...MEDIUM, delay: 0.35 }
            }
            className="absolute inset-x-5 bottom-5 flex items-baseline justify-between bg-background pt-2"
          >
            <span className="text-[11px] text-muted-foreground">
              Total raised
            </span>
            <span className="text-[14px] font-medium text-[#534AB7]">
              {scene.total}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast — absolute bottom of card */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={prefersReducedMotion ? FAST : MEDIUM}
            className="absolute inset-x-4 bottom-4 flex items-center gap-2 rounded-lg border border-[#1D9E75]/30 bg-[#E1F5EE] px-3 py-2 shadow-sm"
          >
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1D9E75]">
              <Check className="h-2.5 w-2.5 text-white" />
            </div>
            <p className="text-[12px] text-[#1D9E75]">
              <strong>Pledge confirmed</strong> · {scene.pledgeAmount} for{" "}
              {scene.charities[0].name}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
