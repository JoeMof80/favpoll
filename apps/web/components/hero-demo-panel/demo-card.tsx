"use client"

import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RankingBar } from "@/components/ui/ranking-bar"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { SectionLabel } from "@/components/favpoll-card/section-label"
import { PollReveal } from "@/components/favpoll-card/poll-reveal"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { getFavpollHeadline } from "@/lib/display"
import {
  PickerHeader,
  PickerItems,
} from "@/components/pledge-dialog/step-pick-favourites"
import { StepAmount } from "@/components/pledge-dialog/step-amount"
import type { Favourite } from "@favpoll/types"
import type { HeroScene, Phase } from "./scenes"
import { fadeUp, FAST, MEDIUM, DELIBERATE } from "./variants"

const RESULTS_SHOWN = 5
const REVEAL_LINE_HEIGHT = 29 // ~18px text, leading-relaxed

type Props = {
  scene: HeroScene
  phase: Phase
  barWidths: number[]
  typing: boolean
  prefersReducedMotion: boolean
}

function toFavourite(f: { id: string; label: string }): Favourite {
  return {
    id: f.id,
    topic_id: "demo",
    label: f.label,
    all_time_pledged: 0,
    all_time_count: 0,
    is_canonical: true,
    source: "seed",
    markets: ["en-GB"],
    favpoll_count: 0,
    total_pledge_count: 0,
    created_at: "",
  }
}

const sheetVariant = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
}

const scrimVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const magicalReveal = {
  initial: { opacity: 0, y: 14, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(4px)" },
}

// Skeleton mirrors the reveal's shape: one bar per measured line, last short,
// at the same line rhythm, with a full-height border to match the blockquote.
function RevealSkeleton({ lines }: { lines: number }) {
  return (
    <div className="flex h-full flex-col border-l-[2.5px] border-[#7F77DD]/40 pl-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="flex items-center"
          style={{ height: REVEAL_LINE_HEIGHT }}
        >
          <div
            className="h-3.5 animate-pulse rounded bg-muted"
            style={{ width: i === lines - 1 ? "55%" : "100%" }}
          />
        </div>
      ))}
    </div>
  )
}

function TypedReveal({
  text,
  active,
  prefersReducedMotion,
  firstName,
}: {
  text: string
  active: boolean
  prefersReducedMotion: boolean
  firstName: string
}) {
  const [shown, setShown] = useState(() =>
    active && !prefersReducedMotion ? "" : text
  )

  useEffect(() => {
    if (!active || prefersReducedMotion) {
      setShown(text)
      return
    }
    setShown("")
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) window.clearInterval(id)
    }, 30)
    return () => window.clearInterval(id)
  }, [active, text, prefersReducedMotion])

  return (
    <PollReveal
      personalReveal={shown.length ? shown : "\u00A0"}
      protagonistFirstName={firstName}
      role="status"
      aria-live="polite"
    />
  )
}

export function DemoCard({
  scene,
  phase,
  barWidths,
  typing,
  prefersReducedMotion,
}: Props) {
  const favourites = scene.poll.topic.favourites
  const selected = favourites[scene.selectedIndex]
  const items = favourites.map(toFavourite)
  const topicTitle = scene.poll.topic.title
  const charityName = scene.charities[0].name
  const amountNum = Number(scene.pledgeAmount.replace(/[^0-9.]/g, "")) || 0
  const amountStr = String(amountNum)
  const firstName = scene.protagonist.name.split(" ")[0]
  const revealText = scene.poll.personal_reveal
  const results = scene.results.slice(0, RESULTS_SHOWN)

  const headline = getFavpollHeadline({
    occasionType: scene.occasion_type,
    name: scene.protagonist.name,
    dateLabel: scene.protagonist.context,
    openingLine: scene.opening_line,
    subject: "someone",
  })

  // ── Phase flags ───────────────────────────────────────────────────────────
  const showTrigger =
    phase === "arriving" || phase === "trigger-hover" || phase === "triggering"
  const triggerHover = phase === "trigger-hover"
  const triggerPressed = phase === "triggering"

  const pickerOpen =
    phase === "picking" ||
    phase === "selected" ||
    phase === "next-hover" ||
    phase === "next-pressed"
  const chipSelected =
    phase === "selected" ||
    phase === "next-hover" ||
    phase === "next-pressed"
  const nextHover = phase === "next-hover"
  const nextPressed = phase === "next-pressed"
  const draftIds = chipSelected ? [selected.id] : []

  const amountOpen =
    phase === "pledge-panel" ||
    phase === "amount-picked" ||
    phase === "pledge-hover" ||
    phase === "pledging"
  const amountActive =
    phase === "amount-picked" ||
    phase === "pledge-hover" ||
    phase === "pledging"
  const pledgeHover = phase === "pledge-hover"
  const pledgePressed = phase === "pledging"

  const confirmedInDialog = phase === "confirmed"
  const sheetOpen = pickerOpen || amountOpen || confirmedInDialog

  const showResults = phase === "results" || phase === "reveal"
  const showRevealSkeleton = phase === "results"
  const showReveal = phase === "reveal"
  const showRevealSlot = showRevealSkeleton || showReveal

  // Amount currently shown in the dialog (0 until a preset is picked).
  const dispAmount = amountActive ? amountNum : 0
  const dispAmountStr = amountActive ? amountStr : ""

  const renderAmountStep = (amt: number, amtStr: string) => (
    <StepAmount
      pledgeAmount={amtStr}
      updatePledgeAmount={() => {}}
      useSharedFund={false}
      hasFund={false}
      ownBreakdown={{
        lines: [{ label: charityName, amount: amt }],
        total: { label: "Total", amount: amt },
      }}
      fundBreakdown={null}
      favouriteBreakdown={[{ label: selected.label, amount: amt }]}
      toggleFund={() => {}}
      isListed={false}
    />
  )

  const renderPledgeFooter = (
    enabled: boolean,
    hover: boolean,
    pressed: boolean
  ) => (
    <div className="shrink-0 px-4 py-3">
      <Button
        type="button"
        className={cn(
          "w-full text-base transition-all duration-150",
          !enabled ? "opacity-50" : "",
          enabled && hover && !pressed
            ? "ring-2 ring-primary/30 brightness-105"
            : "",
          pressed ? "scale-[0.98] brightness-95" : ""
        )}
        disabled
      >
        Pledge
      </Button>
    </div>
  )

  // ── Measurers ─────────────────────────────────────────────────────────────
  // Dialog height: the pledge step's natural height (so no leftover space).
  const measureRef = useRef<HTMLDivElement>(null)
  const [dialogH, setDialogH] = useState<number | undefined>(undefined)
  // Reveal height + line count: so the slot reserves the exact final size and
  // the skeleton mirrors the reveal's shape.
  const revealRef = useRef<HTMLDivElement>(null)
  const [revealH, setRevealH] = useState<number | undefined>(undefined)
  const [revealLines, setRevealLines] = useState(2)

  useEffect(() => {
    if (measureRef.current) setDialogH(measureRef.current.offsetHeight)
    if (revealRef.current) {
      const h = revealRef.current.offsetHeight
      setRevealH(h)
      setRevealLines(Math.max(1, Math.round(h / REVEAL_LINE_HEIGHT)))
    }
  }, [scene.poll.id, amountStr, charityName, selected.label, revealText, firstName])

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-background p-5">
      {/* Hidden measurers — same width as where each element renders. */}
      <div
        ref={measureRef}
        inert
        aria-hidden="true"
        className="pointer-events-none invisible absolute inset-x-4 top-0 -z-10 flex flex-col"
      >
        {renderAmountStep(amountNum, amountStr)}
        {renderPledgeFooter(true, false, false)}
      </div>
      <div
        ref={revealRef}
        inert
        aria-hidden="true"
        className="pointer-events-none invisible absolute inset-x-5 top-0 -z-10"
      >
        <PollReveal
          personalReveal={revealText}
          protagonistFirstName={firstName}
        />
      </div>

      {/* ── Hero + poll heading (always present; sits behind the dialog) ── */}
      <div className="space-y-4">
        {/* Hero — avatar absolutely positioned top-right (out of flow) so the
            About sits directly under the Context, like the live page. */}
        <motion.div
          key={`protagonist-${scene.protagonist.name}`}
          {...fadeUp}
          transition={prefersReducedMotion ? FAST : { ...MEDIUM, delay: 0.08 }}
          className="relative"
        >
          <div className="pr-24">
            <SectionEyebrow
              variant="muted"
              className="flex h-8 items-center truncate wrap-break-word"
            >
              {headline.prefix}
            </SectionEyebrow>
            <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight wrap-break-word text-[#2C2C2A]">
              {scene.protagonist.name}
            </h1>
            {headline.suffix && (
              <p className="mt-2 truncate text-xl font-normal whitespace-normal text-[#534AB7]">
                {headline.suffix}
              </p>
            )}
          </div>
          {scene.protagonist.about && (
            <p className="mt-2 line-clamp-4 text-base leading-relaxed wrap-break-word text-[#5F5E5A]">
              {scene.protagonist.about}
            </p>
          )}
          <div className="absolute top-0 right-0 origin-top-right scale-[0.8]">
            <ProtagonistAvatar
              name={scene.protagonist.name}
              photoUrl={scene.protagonist.photo_url}
            />
          </div>
        </motion.div>

        {/* Poll topic heading */}
        <motion.div
          key={`title-${topicTitle}`}
          {...fadeUp}
          transition={prefersReducedMotion ? FAST : { ...MEDIUM, delay: 0.2 }}
        >
          <SectionLabel title={topicTitle} />
        </motion.div>

        {/* Trigger — hover then press */}
        <AnimatePresence>
          {showTrigger && (
            <motion.div
              key="trigger"
              {...fadeUp}
              exit={{ opacity: 0, y: 4 }}
              transition={prefersReducedMotion ? FAST : MEDIUM}
            >
              <Button
                type="button"
                variant="secondary"
                className={cn(
                  "w-full transition-all duration-150",
                  triggerHover && !triggerPressed
                    ? "ring-2 ring-foreground/15 brightness-105"
                    : "",
                  triggerPressed ? "scale-[0.97] brightness-95" : ""
                )}
                disabled
                aria-hidden="true"
              >
                Pledge favourites
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reveal slot — reserves the exact final height; skeleton mirrors the
            reveal's shape; nothing shifts. */}
        {showRevealSlot && (
          <div className="relative" style={{ height: revealH }}>
            <AnimatePresence mode="wait">
              {showRevealSkeleton && (
                <motion.div
                  key="reveal-skeleton"
                  className="h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={prefersReducedMotion ? FAST : { duration: 0.25 }}
                >
                  <RevealSkeleton lines={revealLines} />
                </motion.div>
              )}
              {showReveal && (
                <motion.div
                  key="reveal"
                  {...magicalReveal}
                  transition={prefersReducedMotion ? FAST : DELIBERATE}
                >
                  <TypedReveal
                    text={revealText}
                    active={typing}
                    prefersReducedMotion={prefersReducedMotion}
                    firstName={firstName}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Rankings + charity/total — five results, no fade, charity accented */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              key="rankings"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion ? FAST : { ...MEDIUM, delay: 0.15 }
              }
              className="space-y-3"
            >
              <ol className="space-y-2.5" aria-label="Current rankings">
                {results.map((result, i) => (
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

              <div className="flex items-baseline justify-between border-t border-border pt-2.5">
                <span className="text-sm font-medium text-[#534AB7]">
                  {charityName}
                </span>
                <span className="text-xs text-muted-foreground">
                  <span className="font-medium text-[#534AB7]">
                    {scene.total}
                  </span>{" "}
                  raised
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mimicked pledge dialog ── */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            key="scrim"
            {...scrimVariant}
            transition={prefersReducedMotion ? FAST : { duration: 0.25 }}
            className="absolute inset-0 z-10 rounded-xl bg-foreground/15"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            key="sheet"
            {...sheetVariant}
            transition={
              prefersReducedMotion ? FAST : { duration: 0.2, ease: "easeOut" }
            }
            style={{ height: dialogH }}
            className="absolute inset-x-4 bottom-4 z-20 flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
            aria-hidden="true"
          >
            <div inert className="flex min-h-0 flex-1 flex-col">
              <AnimatePresence mode="wait">
                {confirmedInDialog ? (
                  <motion.div
                    key="confirmed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1D9E75]">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-base font-medium text-foreground">
                      Pledge confirmed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {scene.pledgeAmount} for {charityName}
                    </p>
                  </motion.div>
                ) : pickerOpen ? (
                  <motion.div
                    key="picker"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <div className="shrink-0 px-4 py-3">
                      <PickerHeader
                        search=""
                        onSearchChange={() => {}}
                        onAdd={() => {}}
                        draftIds={draftIds}
                        items={items}
                        onDeselect={() => {}}
                        topicTitle={topicTitle}
                        showCreate={false}
                        addingItem={false}
                      />
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
                      <PickerItems
                        filteredItems={items}
                        draftIds={draftIds}
                        showCreate={false}
                        search=""
                        isInfinite={false}
                        hasAddItem={false}
                        onToggle={() => {}}
                        addError={null}
                      />
                    </div>
                    <div className="shrink-0 px-4 py-3">
                      <Button
                        type="button"
                        className={cn(
                          "w-full text-base transition-all duration-150",
                          nextHover && !nextPressed
                            ? "ring-2 ring-primary/30 brightness-105"
                            : "",
                          nextPressed ? "scale-[0.98] brightness-95" : ""
                        )}
                        disabled
                      >
                        Next →
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="amount"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <div className="min-h-0 flex-1 overflow-y-auto">
                      {renderAmountStep(dispAmount, dispAmountStr)}
                    </div>
                    {renderPledgeFooter(amountActive, pledgeHover, pledgePressed)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
