"use client"

import { useEffect, useRef, useState } from "react"
import { LockCardContent } from "@/components/lock-card-content"
import { FavpollLogo } from "@/components/favpoll-logo"
import {
  FavpollMarkGlyph,
  MonogramWash,
} from "@/components/landing/hero-texture"
import { Chip } from "@/components/ui/chip"
import { PHONE_SAFE_AREA_TOP } from "./phone-frame"
import { CharityRow } from "@/components/charity-row"
import { PledgeConfirmedHead } from "@/components/pledge-receipt"
import { GoalProgress } from "@/components/goal-progress"
import { buildMechanicSteps } from "@/lib/mechanic-steps"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { paletteForSceneKind } from "@/lib/register-palette"
import { Button } from "@/components/ui/button"
import { RankingBar } from "@/components/ui/ranking-bar"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { PollNote } from "@/components/favpoll-card/poll-note"
import {
  NoteSkeleton,
  StandingsSkeleton,
} from "@/components/standings-skeleton"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import {
  getFavpollHeadline,
  heroNameMobileSizeClass,
  protagonistShortName,
} from "@/lib/display"
import {
  PickerHeader,
  PickerPills,
} from "@/components/pledge-dialog/step-pick-favourites"
import {
  StepAmount,
  StepAmountHeader,
} from "@/components/pledge-dialog/step-amount"
import { PollHeading } from "@/components/poll-heading"
import type { Favourite } from "@favpoll/types"
import type { HeroScene, Phase } from "./scenes"
import { FAST } from "./variants"
import { PAGE_TURN, PAGE_TURN_MS } from "@/components/landing/fade-in"
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
  // Leaves on an even curve: the quintic ease the sheet rises on puts
  // nearly all its travel in the first 100ms, which on the way DOWN read
  // as a cut (founder, 2026-10-18, twice: "the transition from the
  // confirmation to the disclosure is still strange").
  exit: {
    y: "100%",
    transition: { duration: 0.6, ease: "easeInOut" as const },
  },
}

/** One band of the confirmed sheet: a short rise, no overshoot. */
const NOTE_BAND = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0 },
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
  device = "browser",
}: Props) {
  const favourites = scene.poll.topic.favourites
  const selected = favourites[scene.selectedIndex]
  const items = favourites.map(toFavourite)
  const topicTitle = scene.poll.topic.title
  const charity = scene.charities[0]
  const charityName = charity.name
  const raisedNum = Number(scene.total.replace(/[^0-9.]/g, "")) || 0
  const goal = scene.goal_amount
  const amountNum = Number(scene.pledgeAmount.replace(/[^0-9.]/g, "")) || 0
  const amountStr = String(amountNum)
  const noteText = scene.poll.personal_note
  const results = scene.results.slice(0, RESULTS_SHOWN)

  // A scene may honour a person (remembering / celebrating) or no one at all
  // (cause / standalone). With no protagonist, the h1 comes from the scene's
  // own heading, the eyebrow is the register label, and the avatar + the
  // person-named reveal lock fall away.
  const protagonist = scene.protagonist
  const firstName = protagonist ? protagonistShortName(protagonist.name) : null
  const aboutText = protagonist?.about ?? scene.blurb ?? ""

  // Instructions for the lock card, from the same builder the guest page and
  // the print pack use — so all three teach the mechanic identically.
  const lockSteps = buildMechanicSteps({
    topicTitle,
    charityLine: charityName,
    // Every demo scene carries a note — the lock card should teach the
    // same step 3 a real note-bearing poll shows (2026-09-17)
    hasNote: !!noteText,
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
  // A cause's prefix is its opening line when it has one — what the real
  // page shows (getFavpollHeadline) — and the register label otherwise.
  const cardPrefix = protagonist
    ? headline!.prefix
    : (scene.opening_line ?? scene.eyebrow ?? "")
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
  const selectedIds = chipSelected ? [selected.id] : []

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

  // Locked = pre-pledge: the lock card, with skeleton note and bars behind
  // it in the BROWSER frame only — as poll-section draws it from the shell
  // breakpoint (#911, #1045), and not on a phone (#1055: "skeletons seem
  // pointless on mobile", and founder 2026-10-16 on the phone vignette:
  // "lets remove the skeletons"). The blurred decoy is gone everywhere.
  // Unlocked = disclosure: the dialog has closed; the reveal types out and the
  // ranking bars climb from zero. THE ORDER (founder, 2026-10-18, three
  // notes on the home hero's beat): at "clearing" the lock card is already
  // gone — it leaves in 0.25s under the sheet — and the page beneath is
  // ALREADY ALIVE: the standings fade in with the bars climbing and the
  // note ALREADY TYPED while the sheet slides down to reveal them, as a
  // real sheet reveals an updated page. A cut that held an empty page for a
  // second before the standings arrived was built and felt worse.
  //
  // The 2026-10-18 ruling said "and the note typing"; only that clause has
  // changed (2026-10-22). The note is read on the sheet now, so what the
  // sliding sheet reveals is a page that already holds it — the page is
  // still alive underneath, which is the part of the ruling that mattered.
  const unlocked =
    phase === "clearing" || phase === "results" || phase === "note"
  const locked = !unlocked
  const disclosed = unlocked

  // About types on arrival; the note types ON THE SHEET at "confirmed". They
  // never overlap.
  const aboutShown = useTyped(aboutText, locked, prefersReducedMotion, 2200)
  // THE NOTE MOVED ONTO THE SHEET (2026-10-22), following the real page
  // rather than leading it. It used to type on the page beneath, during
  // "clearing" and "results" — beside climbing bars — and the product now
  // reads it out on the sheet, alone, before the page is revealed at all
  // (components/pledge-dialog/step-confirmed.tsx, whose own note says the
  // reason: "the note had to compete with climbing bars when both landed in
  // one commit; here there is nothing to compete with"). Same divergence as
  // the receipt the demo drew before the product had one, and the bars it
  // climbed before the real ones did.
  //
  // ONE typed value serves both surfaces, which is what keeps them honest:
  // useTyped returns the full text whenever it is not active, so the moment
  // the sheet leaves the page simply HAS the note — no second typing, which
  // is exactly what the real page does once noteAlreadyRead is set.
  const revealShown = useTyped(
    noteText,
    confirmedInDialog,
    prefersReducedMotion,
    1900
  )

  // Amount currently shown in the dialog (0 until a preset is picked).
  const dispAmount = amountActive ? amountNum : 0
  const dispAmountStr = amountActive ? amountStr : ""

  // TWO-PART ENTRY (founder, 2026-09-09: "the artefact needs updating to
  // show the real experience"): the beat mounts what a guest actually
  // meets — the FAVOURITE / SHARED POT figures, the rebalance slider,
  // the presets, the re-pricing list. Same REAL components as the dialog
  // (StepAmountHeader + StepAmount), demo-frozen via no-op handlers; the
  // fund tabs stay off, as on a favpoll whose pot holds nothing.
  const renderAmountStep = (amt: number, amtStr: string) => (
    <>
      <StepAmountHeader
        pledgeAmount={amtStr}
        updatePledgeAmount={() => {}}
        fundAmount="0"
        onFundAmountChange={() => {}}
        favouriteCount={1}
      />
      <StepAmount
        pledgeAmount={amtStr}
        updatePledgeAmount={() => {}}
        useSharedFund={false}
        hasFund={false}
        toggleFund={() => {}}
        favouriteBreakdown={[{ label: selected.label, amount: amt }]}
        fundPart={0}
        onFavShare={() => {}}
      />
    </>
  )

  // The real dialog's footer twins (#887/#889): ghost secondary + primary,
  // no arrows, on EVERY viewport — the phone no longer has a top action bar.
  const renderPledgeFooter = (
    enabled: boolean,
    hover: boolean,
    pressed: boolean,
    secondaryLabel = "Back",
    primaryLabel = "Next"
  ) => (
    <div className="flex shrink-0 gap-3 px-4 py-3">
      <Button
        type="button"
        tabIndex={-1}
        variant="ghost"
        className="pointer-events-none h-11 flex-1 text-base"
      >
        {secondaryLabel}
      </Button>
      <Button
        type="button"
        tabIndex={-1}
        className={cn(
          "pointer-events-none h-11 flex-1 text-base transition-all duration-150",
          // Held back until there is something to go on with, as the real
          // button is disabled.
          !enabled && "opacity-50",
          enabled && hover && !pressed
            ? "ring-2 ring-primary/30 brightness-105"
            : "",
          pressed ? "scale-[0.98] brightness-95" : ""
        )}
      >
        {primaryLabel}
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
            widthPercent={disclosed ? (barWidths[i] ?? 0) : 0}
            barClassName={i === 0 ? "bg-primary" : "bg-chart-3"}
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
      // The goal under the total, as the guest page's mobile footer shows it
      // (2026-08-29): one figure, the goal beneath, the bar under the row.
      amountCaption={goal ? `of the ${formatPounds(goal)} goal` : undefined}
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
      // The card wears its scene's palette, header and logo included — the
      // register IS the palette (2026-08-30), so a memorial card is purple on
      // a blue home page and a celebration card is magenta beside it.
      data-register={paletteForSceneKind(scene.kind)}
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background p-5",
        className
      )}
    >
      {/* The safe area wears the band's tone (founder, 2026-10-16: "the
          top should be muted too"): the band is the page's top row, so
          it runs up behind the island as it would on the device. */}
      {isPhone && (
        <div
          className="-mx-5 -mt-5 shrink-0 bg-muted"
          style={{ height: PHONE_SAFE_AREA_TOP }}
          aria-hidden="true"
        />
      )}

      {/* THE BAND IS THE PAGE'S TOP ROW (#1061, founder 2026-10-16: the
          favpoll page has no site header; its band is the header's 56px,
          with the mark on it). So no site header here any more: the band
          opens the card, the mark at its left where the header's sat, and
          the photo hangs off its right end, straddling its edge 40/40, at
          the content's right edge (the card's p-5 = 20). Outside the
          content box below — that box is overflow-hidden for the typewriter
          and clipped the band's bleed (founder: "the band should extend the
          full width"). Size and position inline as well as by class — the
          hero's lesson. */}
      <div className={cn("relative -mx-5 shrink-0", isPhone ? "" : "-mt-5")}>
        <div className="h-14 bg-muted" aria-hidden="true" />
        <div className="absolute inset-y-0 left-0 flex items-center px-5">
          <FavpollLogo />
        </div>
        {/* A protagonist's photo, or a faceless cause's own (the product
            renders favpolls.photo_url in the same slot — CauseHero). */}
        {(protagonist || scene.photo_url) && (
          <div
            className="absolute top-4 size-20 overflow-hidden rounded-xl border-4 border-background bg-background shadow-sm"
            style={{ width: 80, height: 80, top: 16, right: 20 }}
          >
            <ProtagonistAvatar
              name={protagonist ? protagonist.name : title}
              photoUrl={protagonist ? protagonist.photo_url : scene.photo_url!}
              className="h-full w-full md:h-full md:w-full lg:h-full lg:w-full"
            />
          </div>
        )}
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
      {/* -mx-5 px-5: this box clips, and it was exactly the lock card's
          width, so the card's side shadow was cut off at its own edges
          (founder, 2026-10-18: "i can't see left or right shadow"). Widened
          by the card's own padding, it clips at the card's edge instead,
          as the real page clips at the viewport's. */}
      <div className="-mx-5 flex-1 space-y-4 overflow-hidden px-5">
        {/* Hero — THE STACKED HEADER, as the favpoll page draws it since
            2026-10-16 (#1056): the register-tinted band bleeding past the
            card's p-5 as the page's top row; the square photo hanging off
            the band's right end, straddling its bottom edge 40/40; then
            the opening line (clear of the photo), the name at the full
            width, the context, the About. One geometry at both frames
            since #1061 (band 56, photo 80), as the page has. No clamp on
            the name: the page never truncates it. */}
        <div className="relative pt-4">
          <div className={protagonist || scene.photo_url ? "pr-24" : ""}>
            <SectionEyebrow
              variant="muted"
              className="flex h-8 items-center truncate wrap-break-word"
            >
              {cardPrefix}
            </SectionEyebrow>
          </div>
          {/* The app's own ramp is heroNameSizeClass = "text-3xl
              sm:text-4xl" (lib/display.ts): a real phone gets text-3xl.
              This card renders at a fixed 390px inside whatever window the
              page has, so it keeps the small-screen half of the shared ramp
              and swaps only the upper step (2026-08-26). */}
          <h1
            className={cn(
              "leading-tight font-medium tracking-tight wrap-break-word text-foreground",
              device === "phone" ? heroNameMobileSizeClass(title) : "text-4xl"
            )}
          >
            {title}
          </h1>
          {cardSuffix && (
            <p className="mt-2 truncate text-xl font-normal whitespace-normal text-primary">
              {cardSuffix}
            </p>
          )}
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
              /* The real page renders NoteSkeleton only when a note exists;
                 every scene has one, but the guard keeps the two in step. */
              noteText && !isPhone ? (
                <div aria-hidden="true">
                  <NoteSkeleton />
                </div>
              ) : null
            ) : (
              <div className="relative">
                {/* Reserve final height so typing doesn't push results down */}
                <div className="invisible" aria-hidden="true">
                  <PollNote
                    personalNote={noteText}
                    protagonistFirstName={firstName ?? undefined}
                  />
                </div>
                {/* Plain div, not role="status": this is the looping
                    demo's reveal, not the guest's (a11y audit, 2026-10-19). */}
                <div className="absolute inset-0">
                  <PollNote
                    personalNote={revealShown || "\u00A0"}
                    protagonistFirstName={firstName ?? undefined}
                  />
                </div>
              </div>
            )}

            {/* ── Results — skeleton bars while locked (one row per
              favourite the reveal will show, so the card's height barely
              moves at disclosure); real bars climb from 0 on disclosure.
              (Charity row is pinned to the card bottom.) ── */}
            {locked ? (
              isPhone ? null : (
                <div key="skeleton-results" aria-hidden="true">
                  <StandingsSkeleton rows={results.length} />
                </div>
              )
            ) : (
              <motion.div
                key="real-results"
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: disclosed ? 1 : 0 }}
                transition={prefersReducedMotion ? FAST : { duration: 0.45 }}
              >
                {renderRankings(true)}
              </motion.div>
            )}
          </div>

          {/* Lock card — same cell as the skeleton block, top-aligned. */}
          <AnimatePresence>
            {locked && (
              <motion.div
                key="lockcard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                // Leaves quickly: it goes under the closing sheet, and must
                // be gone before the sheet is.
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                transition={prefersReducedMotion ? FAST : { duration: 0.7 }}
                className="z-[1] flex flex-col items-center pt-4 [grid-area:1/1]"
                aria-hidden="true"
              >
                {/* The SAME card the guest page shows (LockCardContent) —
                    it had been a bare pill here, so the landing advertised a
                    simpler product than the one it links to. The wrapper
                    mirrors poll-section's Button chrome; the demo is inert, so
                    it is a div rather than a button. */}
                {/* Pressed at "triggering" (founder, 2026-10-18: "make it
                    seem like the pledge card has been clicked"): the same
                    press the trigger button wears — a touch smaller, a
                    touch darker, its shadow pulled in — for the beat
                    before the picker opens. */}
                <div
                  className={cn(
                    "w-full max-w-sm flex-col items-stretch overflow-hidden rounded-xl bg-background text-left ring-1 ring-border transition-[transform,box-shadow,filter] duration-150",
                    phase === "triggering"
                      ? "scale-[0.98] shadow-md brightness-95"
                      : "shadow-xl"
                  )}
                >
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
      {/* THE PHONE'S FOOTER IS THE BAND'S PARTNER (#1061, founder
          2026-10-16: "match the footer background color to the header"):
          muted, no hairline, bleeding to the card's edges as the page's
          fixed footer does. The browser frame keeps white with the rule —
          at lg the rail footer is a slab beside a 56px strip, and the
          matching tone was tried and reverted there the same day. */}
      <div
        className={cn(
          "shrink-0",
          isPhone
            ? "-mx-5 -mb-5 bg-muted px-5 pt-3 pb-5"
            : "border-t border-border pt-3"
        )}
      >
        {charityRow}
        {goal ? (
          <GoalProgress
            totalRaised={raisedNum}
            goalAmount={goal}
            className="mt-2 h-1"
          />
        ) : null}
      </div>

      {/* ── Mimicked pledge dialog ──
          Scrim mirrors the real DialogOverlay (bg-black/50). It carries no
          radius of its own — the card's overflow-hidden clips it to the card
          shape (square top under the browser frame, rounded bottom). */}
      {/* SLOWER AND SOFTER (founder, 2026-10-18, on the home hero's
          still beat: "the transitions are too fast and harsh"): these
          were dialog-speed cuts (0.18–0.4s). The sheet eases out over
          0.6s, its panes crossfade over 0.45s, the lock card over 0.7s.
          Reduced motion still snaps (FAST). */}
      <AnimatePresence>
        {sheetOpen && !isPhone && (
          <motion.div
            key="scrim"
            {...scrimVariant}
            transition={prefersReducedMotion ? FAST : { duration: 0.5 }}
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
              prefersReducedMotion
                ? FAST
                : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
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
              "absolute z-20 flex flex-col overflow-hidden",
              // The ceremony wears the band on the SHEET, so the notch
              // padding above it is band-coloured too (founder, 2026-10-24:
              // "resolve white safe area").
              confirmedInDialog
                ? "on-band bg-primary text-primary-foreground"
                : "bg-background",
              isPhone
                ? // The real thing on a handset: ResponsiveOverlay renders a
                  // bottom Sheet at 100dvh, so it takes the whole screen with
                  // no radius, no border and nothing showing behind it.
                  "inset-0"
                : "inset-x-4 top-1/2 rounded-2xl border border-border shadow-xl"
            )}
            aria-hidden="true"
          >
            {/* No top action bar (#887/#889): the real dialog leads with
                its header slot's eyebrow on every viewport and commits in
                the bottom footer twins — the phone photograph shows the
                same shape as the browser dialog now. */}
            <div inert className="flex min-h-0 flex-1 flex-col">
              <AnimatePresence mode="wait">
                {confirmedInDialog ? (
                  <motion.div
                    key="confirmed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    {/* THE SAME COMPOSITION the guest's sheet ends on
                        (components/pledge-dialog/step-confirmed.tsx): the
                        confirmation at the top, the topic in PollHeading's
                        grammar, and the note on a monogram wash at the
                        optical centre — balanced by an invisible copy of the
                        head, exactly as the real sheet balances it.

                        NO RECEIPT ROWS (founder, 2026-10-23). They were here
                        from 2026-10-19 and reached the product on the 22nd;
                        both lost them on the 23rd, when a real pledge on a
                        phone showed the note was unheld rather than
                        uncrowded. Texture holds it now.

                        The demo composes the pieces rather than rendering
                        StepConfirmed itself: that one owns its own clock and
                        ends by dismissing a real sheet, where this is driven
                        by the beat in landing/hero.tsx. */}
                    {/* THE NOTE IS THE MOST CRAFTED MOMENT ON THE PAGE
                        (2026-10-23). Everything used to arrive at once with
                        the sheet. Now the three bands settle in reading
                        order on the page-turn curve, 90ms apart: the
                        confirmation answers "did my card work", the topic
                        frames what is coming, and only then does the note
                        begin. It is the same stagger the landing's type
                        uses, spent on the beat that matters most.

                        Reduced motion collapses it: FAST is a 0.2s cut and
                        staggerChildren goes to zero, so the composition
                        simply appears. */}
                    <motion.div
                      // The band surface, as the real sheet wears it
                      // (step-confirmed.tsx, founder 2026-10-24).
                      className="relative flex min-h-0 flex-1 flex-col"
                      initial="hidden"
                      animate="shown"
                      variants={{
                        hidden: {},
                        shown: {
                          transition: {
                            staggerChildren: prefersReducedMotion ? 0 : 0.09,
                          },
                        },
                      }}
                    >
                      <motion.div
                        className="shrink-0 px-6 pt-6"
                        variants={NOTE_BAND}
                        transition={
                          prefersReducedMotion
                            ? FAST
                            : { duration: PAGE_TURN_MS, ease: PAGE_TURN }
                        }
                      >
                        <PledgeConfirmedHead onBand />
                      </motion.div>
                      <div className="relative flex min-h-0 flex-1 flex-col justify-center gap-4 px-6 py-4">
                        <MonogramWash id="demo-ceremony-note" onBand />
                        <motion.div
                          className="relative"
                          variants={NOTE_BAND}
                          transition={
                            prefersReducedMotion
                              ? FAST
                              : { duration: PAGE_TURN_MS, ease: PAGE_TURN }
                          }
                        >
                          <PollHeading topicTitle={topicTitle} />
                        </motion.div>
                        {/* Reserve the final height so the note does not walk
                            up the sheet as it types. */}
                        <div className="relative">
                          <div className="invisible" aria-hidden="true">
                            <PollNote
                              personalNote={noteText}
                              protagonistFirstName={firstName ?? undefined}
                            />
                          </div>
                          <div className="absolute inset-0">
                            <PollNote
                              personalNote={revealShown || "\u00A0"}
                              protagonistFirstName={firstName ?? undefined}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className="invisible shrink-0 px-6 pb-6"
                        aria-hidden="true"
                      >
                        <PledgeConfirmedHead onBand />
                      </div>
                    </motion.div>
                  </motion.div>
                ) : pickerOpen ? (
                  <motion.div
                    key="picker"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    {/* border-b: the step-1 separators hairline */}
                    <div className="shrink-0 border-b border-border px-5 pt-4 pb-3">
                      <PickerHeader
                        search=""
                        onSearchChange={() => {}}
                        topicTitle={topicTitle}
                      />
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-2">
                      <PickerPills
                        filteredItems={items}
                        selectedIds={selectedIds}
                        search=""
                        isInfinite={false}
                        hasAddItem={false}
                        canAdd={false}
                        onToggle={() => {}}
                        onEnterAdd={() => {}}
                      />
                    </div>
                    {/* The real step-1 footer's primary says "Give without
                        picking" until a chip is chosen (#889). Not here
                        (founder, 2026-10-19: "accurate but … adds noise in
                        that context"): the demo has one idea on this screen,
                        so the button is "Next", held back until the pick. */}
                    {renderPledgeFooter(
                      nextEnabled,
                      nextHover,
                      nextPressed,
                      "Cancel",
                      "Next"
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="amount"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
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
