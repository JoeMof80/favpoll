"use client"

import { Check } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { RankingBar } from "@/components/ui/ranking-bar"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { SectionLabel } from "@/components/favpoll-card/section-label"
import { PollReveal } from "@/components/favpoll-card/poll-reveal"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import type { HeroScene, Phase } from "./scenes"
import { PLEDGE_AMOUNTS } from "./scenes"
import {
  fadeUp,
  fadeIn,
  revealVariant,
  FAST,
  MEDIUM,
  DELIBERATE,
} from "./variants"

type Props = {
  scene: HeroScene
  phase: Phase
  barWidths: number[]
  prefersReducedMotion: boolean
  showOptions: boolean
  showPledgePanel: boolean
  showToast: boolean
  showResults: boolean
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
  showResults,
  showReveal,
}: Props) {
  const topicItems = scene.poll.topic.favourites
  const topicTitle = scene.poll.topic.title
  const firstName = scene.protagonist.name.split(" ")[0]

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-background p-5">
      <div className="space-y-4">
        {/* Hero — mirrors BaseFavpollHero / HeroLayout: text LEFT, avatar RIGHT */}
        <motion.div
          key={`protagonist-${scene.protagonist.name}`}
          {...fadeUp}
          transition={prefersReducedMotion ? FAST : { ...MEDIUM, delay: 0.08 }}
          className="border-b pb-4"
        >
          <div className="flex items-start gap-4 md:gap-6">
            <div className="min-w-0 flex-1">
              <SectionEyebrow variant="muted" className="flex h-8 items-center">
                {scene.heroEyebrow}
              </SectionEyebrow>
              <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight text-[#2C2C2A]">
                {scene.protagonist.name}
              </h1>
            </div>
            <ProtagonistAvatar
              name={scene.protagonist.name}
              photoUrl={scene.protagonist.photo_url}
            />
          </div>
          {scene.about && (
            <p className="mt-4 text-base leading-relaxed text-[#5F5E5A]">
              {scene.about}
            </p>
          )}
        </motion.div>

        {/* Poll topic heading */}
        <motion.div
          key={`title-${topicTitle}`}
          {...fadeUp}
          transition={prefersReducedMotion ? FAST : { ...MEDIUM, delay: 0.2 }}
        >
          <SectionLabel title={topicTitle} />
        </motion.div>

        {/* Poll options — real Chip components */}
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
                >
                  <Chip
                    size="md"
                    selected={phase !== "arriving" && i === scene.selectedIndex}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {opt.label}
                  </Chip>
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

        {/* Reveal — real PollReveal; slides up and settles */}
        <AnimatePresence>
          {showReveal && (
            <motion.div
              key="reveal"
              {...revealVariant}
              transition={prefersReducedMotion ? FAST : DELIBERATE}
            >
              <PollReveal
                personalReveal={scene.poll.personal_reveal}
                protagonistFirstName={firstName}
                role="status"
                aria-live="polite"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rankings — appear in the results beat, dim when the reveal lands */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              key="rankings"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: showReveal ? 0.4 : 1, y: 0 }}
              transition={
                prefersReducedMotion
                  ? FAST
                  : showReveal
                    ? { duration: 0.5, ease: "easeInOut" }
                    : { ...MEDIUM, delay: 0.2 }
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

      {/* Charity / total — visible throughout the results beat and reveal */}
      <AnimatePresence>
        {showResults && (
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
