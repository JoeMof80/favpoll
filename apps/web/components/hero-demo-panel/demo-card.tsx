"use client"

import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"
import { LockCardContent } from "@/components/lock-card-content"
import { HeaderBar } from "@/components/header-bar"
import { PHONE_SAFE_AREA_TOP } from "./phone-frame"
import { CharityRow } from "@/components/charity-row"
import { buildMechanicSteps, isQuoteReveal } from "@/lib/mechanic-steps"
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
import { tipOptionsFor } from "@/components/pledge-card/utils"
import { PollHeading } from "@/components/poll-heading"
import type { Favourite } from "@favpoll/types"
import type { HeroScene, Phase } from "./scenes"
import { FAST } from "./variants"
import { formatPounds } from "@/lib/i18n"

// Eight, not five (founder, 2026-08-09): the reveal beat left a band of
// empty phone below the bars. Measured to fill without spilling.
const RESULTS_SHOWN = 8

type Props = {
  scene: HeroScene
  phase: Phase
  barWidths: number[]
  prefersReducedMotion: boolean
  className?: string
  /**
   * Which medium this card is being shown in.
   *
   * "phone" makes it behave the way the real app does on a handset: a blank
   * safe-area strip above the header, and the pledge overlay as a FULL-SCREEN
   * sheet with its navigation in a top bar, not a centred dialog.
   *
   * It has to be told, because it cannot ask. The real dialog switches on
   * useIsMobile(), a VIEWPORT-keyed hook — inside a 390px phone drawn on a
   * desktop page it would report "desktop" and render the wrong shape. Same
   * trap as the display's gutter QRs and its type ramp.
   */
  device?: "browser" | "phone"
  /**
   * Register accent for the LEADER bar only (founder, 2026-08-05): the
   * register pages wear standard purple/white branding, and the accent
   * survives as small marks — a bar, a rule, a dot — the way the home
   * router cards do it. Omitted = brand purple.
   */
  accentBarClassName?: string
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

// A handset sheet rises from the bottom edge; the browser dialog fades in
// at the centre. Kept apart so neither borrows the other's motion.
const phoneSheetVariant = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
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
  className,
  accentBarClassName,
  device = "browser",
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
  const revealText = scene.poll.personal_reveal
  const results = scene.results.slice(0, RESULTS_SHOWN)

  // A scene may honour a person (remembering / celebrating) or no one at all
  // (cause / standalone). With no protagonist, the h1 comes from the scene's
  // own heading, the eyebrow is the register label, and the avatar + the
  // person-named reveal lock fall away.
  const protagonist = scene.protagonist
  const firstName = protagonist ? protagonist.name.split(/[\s&]+/)[0] : null
  const aboutText = protagonist?.about ?? scene.blurb ?? ""

  // Instructions for the lock card, from the same builder the guest page and
  // the print pack use — so all three teach the mechanic identically.
  const lockSteps = buildMechanicSteps({
    topicTitle,
    charityLine: charityName,
    firstName,
    isCause: !protagonist,
    hasReveal: Boolean(scene.poll.personal_reveal),
    revealIsQuote: isQuoteReveal(scene.poll.personal_reveal),
  })

  const headline = protagonist
    ? getFavpollHeadline({
        occasionType: scene.occasion_type,
        name: protagonist.name,
        dateLabel: protagonist.context,
        openingLine: scene.opening_line,
        subject: "someone",
      })
    : null

  const title = protagonist ? protagonist.name : (scene.heading ?? "")
  const cardPrefix = protagonist ? headline!.prefix : (scene.eyebrow ?? "")
  // Causes get their context line in the same slot a protagonist's dates use.
  const cardSuffix = protagonist ? headline!.suffix : (scene.context ?? null)

  // ── Phase flags ───────────────────────────────────────────────────────────

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
  const isPhone = device === "phone"
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

  // The pledge step, shown WHOLE (founder, 2026-08-09). The demo used to
  // withhold onFundStep and pass showTip={false}, hiding both optional rows —
  // so the one beat about deciding what to give showed neither decision.
  // Showing the shared fund but not the contribution was the odder halfway
  // house: the brand's rule is to state the optional contribution plainly and
  // never apologetically, and hiding it from the demo is a quiet apology.
  //
  // £10 pledge, £2 moved to the shared fund, £1 contribution — the preselected
  // suggestion for this tier, since tipOptionsFor(10) is [0, 0.5, 1, 2] and
  // defaultTipFor takes the third. Favourite ticks down to £8 and the total
  // pledge is unchanged at £10; the fund money reaches the charity too, which
  // is why one charity line covers both. £11 is charged.
  const FUND_PART = 2
  const TIP = 1

  const renderAmountStep = (amt: number, amtStr: string) => (
    <StepAmount
      pledgeAmount={amtStr}
      updatePledgeAmount={() => {}}
      useSharedFund={false}
      hasFund
      ownBreakdown={{
        // "To <charity>" and "Total charged" are the real labels — the demo
        // had "<charity>" and "Total".
        lines: [{ label: `To ${charityName}`, amount: amt }],
        total: { label: "Total charged", amount: amt + TIP },
      }}
      fundBreakdown={null}
      favouriteBreakdown={[
        { label: selected.label, amount: Math.max(0, amt - FUND_PART) },
      ]}
      fundPart={FUND_PART}
      onFundStep={() => {}}
      toggleFund={() => {}}
      tipAmount={TIP}
      setTipAmount={() => {}}
      tipOptions={tipOptionsFor(amt)}
      showTip
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
            barClassName={
              i === 0 ? (accentBarClassName ?? "bg-primary") : "bg-chart-3"
            }
            barStyle={{
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

  // The REAL CharityRow (2026-08-07). This was a hand-copy whose own comment
  // said it "mirrors CharityRow (favpoll-card/charity-row.tsx)" — a path that
  // had since moved, which is the drift the copy invited. Scene charities
  // carry what a demo needs; Charity also wants description and created_at,
  // neither of which this row renders.
  const charityRow = (
    <CharityRow
      charity={{
        ...charity,
        description: null,
        created_at: "2024-01-01T00:00:00Z",
      }}
      amountRaised={raisedNum}
    />
  )

  // ── Measurer ──────────────────────────────────────────────────────────────
  const measureRef = useRef<HTMLDivElement>(null)
  const [dialogH, setDialogH] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (measureRef.current) setDialogH(measureRef.current.offsetHeight)
  }, [scene.poll.id, amountStr, charityName, selected.label])

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background p-5",
        className
      )}
    >
      {isPhone && (
        <div
          className="-mx-5 -mt-5 shrink-0"
          style={{ height: PHONE_SAFE_AREA_TOP }}
          aria-hidden="true"
        />
      )}

      {/* The app header, as a guest actually meets the page: logo and menu
          above the hero, with the rule under it. Full-bleed past the card's
          p-5, and the real HeaderBar rather than a lookalike — the version
          Header itself renders, minus the Clerk-aware hamburger. */}
      <div className={cn("-mx-5 mb-4 shrink-0", isPhone ? "" : "-mt-5")}>
        <HeaderBar staticMenu />
      </div>

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
          <div className={protagonist ? "pr-24" : ""}>
            <SectionEyebrow
              variant="muted"
              className="flex h-8 items-center truncate wrap-break-word"
            >
              {cardPrefix}
            </SectionEyebrow>
            <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight wrap-break-word text-foreground">
              {title}
            </h1>
            {cardSuffix && (
              <p className="mt-2 truncate text-xl font-normal whitespace-normal text-primary">
                {cardSuffix}
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
              <p className="absolute inset-0 line-clamp-4 text-base leading-relaxed wrap-break-word text-muted-foreground">
                {aboutShown || "\u00A0"}
              </p>
            </div>
          )}
          {protagonist && (
            <div className="absolute top-0 right-0 origin-top-right scale-[0.8]">
              <ProtagonistAvatar
                name={protagonist.name}
                photoUrl={protagonist.photo_url}
              />
            </div>
          )}
        </div>

        {/* "FAVOURITE {topic}" header — a ribbon, not a button, matching
            the real page (the lock card is the pre-pledge CTA there;
            founder, 2026-08-02). */}
        <div aria-hidden="true">
          {/* size="lg" — the DEFAULT, which is what the real guest page uses
              (poll-section renders <PollHeading inert /> with no size). The
              demo had been a step down at "md" (15px against the real 17px),
              so the card under-sold the question it is built around. */}
          <PollHeading topicTitle={topicTitle} size="lg" inert />
        </div>

        {/* Reveal + results share ONE grid cell with the lock card, exactly
            as poll-section does it (2026-08-06). The lock used to be an
            absolute overlay on the REVEAL alone and vertically centred, so it
            floated up over the About text and the topic ribbon. On the real
            page it is top-aligned (pt-4) over the whole blurred block, which
            is what a guest actually sees. */}
        <div className="grid">
          <div className="space-y-4 [grid-area:1/1]">
            {locked ? (
              <div className="blur-xs" aria-hidden="true">
                <PollReveal
                  personalReveal={revealText}
                  protagonistFirstName={firstName ?? undefined}
                />
              </div>
            ) : (
              <div className="relative">
                {/* Reserve final height so typing doesn't push results down */}
                <div className="invisible" aria-hidden="true">
                  <PollReveal
                    personalReveal={revealText}
                    protagonistFirstName={firstName ?? undefined}
                  />
                </div>
                <div
                  className="absolute inset-0"
                  role="status"
                  aria-live="polite"
                >
                  <PollReveal
                    personalReveal={revealShown || "\u00A0"}
                    protagonistFirstName={firstName ?? undefined}
                  />
                </div>
              </div>
            )}

            {/* ── Results — blurred decoy while locked; real bars climb from 0
              on disclosure. (Charity row is pinned to the card bottom.) ── */}
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

          {/* Lock card — same cell as the blurred block, top-aligned. */}
          <AnimatePresence>
            {locked && (
              <motion.div
                key="lockcard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={prefersReducedMotion ? FAST : { duration: 0.4 }}
                className="z-[1] flex flex-col items-center pt-4 [grid-area:1/1]"
                aria-hidden="true"
              >
                {/* The SAME card the guest page shows (LockCardContent) —
                    it had been a bare pill here, so the landing advertised a
                    simpler product than the one it links to. The wrapper
                    mirrors poll-section's Button chrome; the demo is inert, so
                    it is a div rather than a button. */}
                <div className="w-full max-w-sm flex-col items-stretch overflow-hidden rounded-xl bg-background/95 text-left shadow-xl ring-1 ring-border">
                  <LockCardContent steps={lockSteps} topicTitle={topicTitle} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Charity row — anchored to the card bottom so the expanding reveal +
          climbing bars can't push it out of view.
          NOT gated. It used to blur while locked, "like the rest of the
          reveal/results", but the real guest page shows this bar crisp before
          any pledge — charity, number and running total all legible, which is
          the point of it. Corrected 2026-08-07 against a photograph of the
          real thing; what the lock withholds is the standings, never who the
          money goes to. */}
      <div className="shrink-0 border-t border-border pt-3">{charityRow}</div>

      {/* ── Mimicked pledge dialog ──
          Scrim mirrors the real DialogOverlay (bg-black/50). It carries no
          radius of its own — the card's overflow-hidden clips it to the card
          shape (square top under the browser frame, rounded bottom). */}
      <AnimatePresence>
        {sheetOpen && !isPhone && (
          <motion.div
            key="scrim"
            {...scrimVariant}
            transition={prefersReducedMotion ? FAST : { duration: 0.25 }}
            className="absolute inset-0 z-10 bg-black/50"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            key="sheet"
            {...(isPhone ? phoneSheetVariant : sheetVariant)}
            transition={
              prefersReducedMotion ? FAST : { duration: 0.2, ease: "easeOut" }
            }
            style={
              isPhone
                ? // The real SheetContent carries paddingTop:
                  // env(safe-area-inset-top), so its action bar clears the
                  // status bar. Without it the bar ran under the island.
                  { paddingTop: PHONE_SAFE_AREA_TOP }
                : { height: dialogH, y: "-50%" }
            }
            className={cn(
              "absolute z-20 flex flex-col overflow-hidden bg-background",
              isPhone
                ? // The real thing on a handset: ResponsiveOverlay renders a
                  // bottom Sheet at 100dvh, so it takes the whole screen with
                  // no radius, no border and nothing showing behind it.
                  "inset-0"
                : "inset-x-4 top-1/2 rounded-2xl border border-border shadow-xl"
            )}
            aria-hidden="true"
          >
            {/* Top action bar — ResponsiveOverlay's fullscreen shape:
                back/cancel, the step title, and the primary action. On a
                handset the NAVIGATION LIVES HERE, and the consumer's footer
                is dropped entirely (`footer && !mobileSave`), which is why
                the picker's Next and the amount step's Pledge move up here
                rather than sitting at the bottom of the sheet. */}
            {isPhone && !confirmedInDialog && (
              // border-t as well as -b: the sheet's own top edge, which the
              // photograph shows as a rule under the status bar. Without it
              // the safe-area strip and the bar were one undivided white
              // block and the sheet had no visible beginning.
              <div className="flex shrink-0 items-center justify-between gap-2 border-y border-border px-2 py-1.5">
                <Button
                  type="button"
                  tabIndex={-1}
                  variant="ghost"
                  className="pointer-events-none"
                >
                  {pickerOpen ? "Cancel" : "Back"}
                </Button>
                <p className="min-w-0 truncate py-1.5 text-base font-medium">
                  {pickerOpen
                    ? `Pick your favourite ${topicTitle.toLowerCase()}`
                    : "Your pledge"}
                </p>
                <Button
                  type="button"
                  tabIndex={-1}
                  variant={
                    (pickerOpen ? nextEnabled : amountActive)
                      ? "default"
                      : "secondary"
                  }
                  className={cn(
                    "pointer-events-none transition-all duration-150",
                    pickerOpen
                      ? nextEnabled && nextHover && !nextPressed
                        ? "ring-2 ring-primary/30 brightness-105"
                        : nextPressed
                          ? "scale-[0.98] brightness-95"
                          : ""
                      : amountActive && pledgeHover && !pledgePressed
                        ? "ring-2 ring-primary/30 brightness-105"
                        : pledgePressed
                          ? "scale-[0.98] brightness-95"
                          : ""
                  )}
                >
                  {pickerOpen ? "Next" : "Pledge"}
                </Button>
              </div>
            )}
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
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-success">
                      <Check className="h-5 w-5 text-success-foreground" />
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
                    {/* No wrapper padding — PickerHeader's InputGroup owns its
                        own since the block-start eyebrow landed (#381) */}
                    <div className="shrink-0">
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
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">
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
                    {/* Bottom Next only in the browser dialog — on a
                        handset it lives in the top bar above. */}
                    <div
                      className={cn("shrink-0 px-5 py-3", isPhone && "hidden")}
                    >
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
                    {!isPhone &&
                      renderPledgeFooter(
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
