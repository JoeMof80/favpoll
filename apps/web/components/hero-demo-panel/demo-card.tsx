"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Lock } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RankingBar } from "@/components/ui/ranking-bar"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
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
import { FAST } from "./variants"

const RESULTS_SHOWN = 5

// Mirrors the live favpoll page's lock-card copy verbatim.
const LOCK_CARD_COPY =
  "Pledge to see the reveal — and how the pledges are landing."

// Mirrors CharityRow's GBP formatting (favpoll-card/charity-row.tsx).
const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
})

type Props = {
  scene: HeroScene
  phase: Phase
  barWidths: number[]
  prefersReducedMotion: boolean
}

// Types `text` out character by character while `active`; shows full text
// otherwise. `targetMs` is the rough total duration, so short and long strings
// both finish in a similar, controlled window.
function useTyped(
  text: string,
  active: boolean,
  reduced: boolean,
  targetMs: number
) {
  const [shown, setShown] = useState(() => (active && !reduced ? "" : text))
  useEffect(() => {
    if (!active || reduced) {
      setShown(text)
      return
    }
    setShown("")
    const speed = Math.max(
      12,
      Math.min(40, Math.round(targetMs / Math.max(1, text.length)))
    )
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) window.clearInterval(id)
    }, speed)
    return () => window.clearInterval(id)
  }, [text, active, reduced, targetMs])
  return shown
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

export function DemoCard({
  scene,
  phase,
  barWidths,
  prefersReducedMotion,
}: Props) {
  const favourites = scene.poll.topic.favourites
  const selected = favourites[scene.selectedIndex]
  const items = favourites.map(toFavourite)
  const topicTitle = scene.poll.topic.title
  const charity = scene.charities[0]
  const charityName = charity.name
  const raisedNum = Number(scene.total.replace(/[^0-9.]/g, "")) || 0
  const amountNum = Number(scene.pledgeAmount.replace(/[^0-9.]/g, "")) || 0
  const amountStr = String(amountNum)
  const firstName = scene.protagonist.name.split(" ")[0]
  const revealText = scene.poll.personal_reveal
  const aboutText = scene.protagonist.about ?? ""
  const results = scene.results.slice(0, RESULTS_SHOWN)

  const headline = getFavpollHeadline({
    occasionType: scene.occasion_type,
    name: scene.protagonist.name,
    dateLabel: scene.protagonist.context,
    openingLine: scene.opening_line,
    subject: "someone",
  })

  // ── Phase flags ───────────────────────────────────────────────────────────
  const triggerHover = phase === "trigger-hover"
  const triggerPressed = phase === "triggering"

  const pickerOpen =
    phase === "picking" ||
    phase === "selected" ||
    phase === "next-hover" ||
    phase === "next-pressed"
  const chipSelected =
    phase === "selected" || phase === "next-hover" || phase === "next-pressed"
  const nextHover = phase === "next-hover"
  const nextPressed = phase === "next-pressed"
  const nextEnabled = chipSelected
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

  // Locked = pre-pledge (blurred reveal + lock card, blurred decoy bars).
  // Unlocked = disclosure: the dialog has closed; the reveal types out and the
  // ranking bars climb from zero.
  const unlocked =
    phase === "clearing" || phase === "results" || phase === "reveal"
  const locked = !unlocked

  // About types on arrival; the reveal types at disclosure. They never overlap.
  const aboutShown = useTyped(aboutText, locked, prefersReducedMotion, 2200)
  const revealActive = phase === "clearing" || phase === "results"
  const revealShown = useTyped(
    revealText,
    revealActive,
    prefersReducedMotion,
    1900
  )

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
        tabIndex={-1}
        variant={enabled ? "default" : "secondary"}
        className={cn(
          "pointer-events-none w-full text-base transition-all duration-150",
          enabled && hover && !pressed
            ? "ring-2 ring-primary/30 brightness-105"
            : "",
          pressed ? "scale-[0.98] brightness-95" : ""
        )}
      >
        Pledge
      </Button>
    </div>
  )

  const renderRankings = (animate: boolean) => (
    <ol className="space-y-2.5" aria-label="Current rankings">
      {results.map((result, i) => (
        <li key={result.label}>
          <RankingBar
            label={result.label}
            amount={result.amount}
            widthPercent={barWidths[i] ?? 0}
            barStyle={{
              background: i === 0 ? "#534AB7" : "#AFA9EC",
              transition:
                animate && !prefersReducedMotion
                  ? `width ${700 + i * 80}ms ease-out`
                  : "none",
            }}
          />
        </li>
      ))}
    </ol>
  )

  // Charity row mirrors CharityRow (favpoll-card/charity-row.tsx) — pinned to
  // the card bottom and always visible (not part of the gated reveal/results).
  const charityRow = (
    <div className="flex items-center gap-3">
      {charity.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={charity.logo_url}
          alt={charity.name}
          className="h-8 w-8 rounded object-contain"
        />
      ) : (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary"
          aria-hidden="true"
        >
          {charity.name.charAt(0)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {charity.name}
        </p>
        {charity.registered_number && (
          <p className="text-xs text-muted-foreground">
            Charity no. {charity.registered_number}
          </p>
        )}
      </div>
      {raisedNum > 0 && (
        <p className="shrink-0 text-sm font-medium text-primary">
          {GBP.format(raisedNum)}
        </p>
      )}
    </div>
  )

  // ── Measurer ──────────────────────────────────────────────────────────────
  const measureRef = useRef<HTMLDivElement>(null)
  const [dialogH, setDialogH] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (measureRef.current) setDialogH(measureRef.current.offsetHeight)
  }, [scene.poll.id, amountStr, charityName, selected.label])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background p-5">
      {/* Hidden measurer — same width as where the dialog renders. */}
      <div
        ref={measureRef}
        inert
        aria-hidden="true"
        className="pointer-events-none invisible absolute inset-x-4 top-0 -z-10 flex flex-col"
      >
        {renderAmountStep(amountNum, amountStr)}
        {renderPledgeFooter(true, false, false)}
      </div>

      {/* ── Hero + poll heading. No per-element entrance — the whole card
          cross-fades on scene change so nothing pops in first. ── */}
      <div className="flex-1 space-y-4 overflow-hidden">
        {/* Hero */}
        <div className="relative">
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
          {aboutText && (
            <div className="relative mt-2">
              {/* Reserve full height so the typewriter doesn't shift the layout */}
              <p
                className="invisible line-clamp-4 text-base leading-relaxed wrap-break-word"
                aria-hidden="true"
              >
                {aboutText}
              </p>
              <p className="absolute inset-0 line-clamp-4 text-base leading-relaxed wrap-break-word text-[#5F5E5A]">
                {aboutShown || "\u00A0"}
              </p>
            </div>
          )}
          <div className="absolute top-0 right-0 origin-top-right scale-[0.8]">
            <ProtagonistAvatar
              name={scene.protagonist.name}
              photoUrl={scene.protagonist.photo_url}
            />
          </div>
        </div>

        {/* "FAVOURITE {topic}" pill — merged header + pledge trigger. */}
        <div>
          <Button
            type="button"
            tabIndex={-1}
            className={cn(
              "pointer-events-none w-full tracking-[0.09em] uppercase transition-all duration-150",
              triggerHover && !triggerPressed
                ? "ring-2 ring-primary/30 brightness-105"
                : "",
              triggerPressed ? "scale-[0.98] brightness-95" : ""
            )}
            aria-hidden="true"
          >
            Favourite {topicTitle}
          </Button>
        </div>

        {/* ── Reveal — lock card sits on top of it while locked; types out on
            disclosure. ── */}
        <div className="relative">
          {locked ? (
            <div className="blur-xs" aria-hidden="true">
              <PollReveal
                personalReveal={revealText}
                protagonistFirstName={firstName}
              />
            </div>
          ) : (
            <div className="relative">
              {/* Reserve final height so typing doesn't push results down */}
              <div className="invisible" aria-hidden="true">
                <PollReveal
                  personalReveal={revealText}
                  protagonistFirstName={firstName}
                />
              </div>
              <div
                className="absolute inset-0"
                role="status"
                aria-live="polite"
              >
                <PollReveal
                  personalReveal={revealShown || "\u00A0"}
                  protagonistFirstName={firstName}
                />
              </div>
            </div>
          )}

          {/* Lock card — centered over the reveal; fades out as it types. */}
          <AnimatePresence>
            {locked && (
              <motion.div
                key="lockcard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={prefersReducedMotion ? FAST : { duration: 0.4 }}
                className="absolute inset-0 z-[1] flex items-center justify-center"
                aria-hidden="true"
              >
                <div className="flex max-w-[90%] flex-col items-center gap-2 rounded-xl border border-border bg-background/95 px-5 py-4 text-center shadow-sm">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm leading-snug text-muted-foreground">
                    {LOCK_CARD_COPY}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Results — blurred decoy while locked; real bars climb from 0 on
            disclosure. (Charity row is pinned to the card bottom, below.) ── */}
        {locked ? (
          <div
            key="decoy-results"
            className="space-y-3 blur-xs"
            aria-hidden="true"
          >
            {renderRankings(false)}
          </div>
        ) : (
          <div key="real-results" className="space-y-3">
            {renderRankings(true)}
          </div>
        )}
      </div>

      {/* Charity row — anchored to the card bottom so the expanding reveal +
          climbing bars can't push it out of view. Gated (blurred) while locked,
          like the rest of the reveal/results. */}
      <div
        className={cn(
          "shrink-0 border-t border-border pt-3 transition-[filter] duration-500",
          locked ? "blur-xs" : ""
        )}
        aria-hidden={locked ? "true" : undefined}
      >
        {charityRow}
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
                      {/* draftIds intentionally empty here so the selected chip
                          does NOT appear in the search bar; the grid below still
                          highlights the selection. */}
                      <PickerHeader
                        search=""
                        onSearchChange={() => {}}
                        onAdd={() => {}}
                        draftIds={[]}
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
                        tabIndex={-1}
                        variant={nextEnabled ? "default" : "secondary"}
                        className={cn(
                          "pointer-events-none w-full text-base transition-all duration-150",
                          nextEnabled && nextHover && !nextPressed
                            ? "ring-2 ring-primary/30 brightness-105"
                            : "",
                          nextPressed ? "scale-[0.98] brightness-95" : ""
                        )}
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
                    {renderPledgeFooter(
                      amountActive,
                      pledgeHover,
                      pledgePressed
                    )}
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
