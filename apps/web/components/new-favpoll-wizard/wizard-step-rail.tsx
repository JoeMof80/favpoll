"use client"

import { useLayoutEffect, useRef, useState } from "react"
import {
  BookOpen,
  Calendar,
  Check,
  Gift,
  Settings2,
  Shapes,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { STEPS, STEP_LABELS, type WizardStep } from "@/lib/wizard-copy"

// Concrete objects where one exists — a calendar, a gift, an assortment,
// a person, a book; Settings wears its own glyph.
export const STEP_ICONS: Record<WizardStep, React.ElementType> = {
  event: Calendar,
  charity: Gift,
  topic: Shapes,
  info: UserRound,
  story: BookOpen,
  details: Settings2,
}

// THE RAIL'S PURPOSE (founder, 2026-09-02, the fourth same-day
// calibration and the one that settled): the favpoll AT A GLANCE — a
// series of LISTS tracking everything entered so far, one line per
// answer. The noun-only audit before it "felt incomplete"; counts
// alone, avatar chips, and per-step second lines each failed earlier
// the same day. Every list line is reserved statically (invisible
// until filled), so the rail never reflows as answers accumulate —
// the one invariant every calibration kept.
// EVERY entry reserves the same three slot lines (founder, 2026-09-02:
// "each step section should be equidistant") — uniform entry heights
// make the headers evenly spaced and immovable, and values COMPACT
// top-down inside the fixed frame so none sits stranded below empty
// reserved lines ("'Listed' looks stranded").
const STEP_SLOTS = 4

type Props = {
  currentStep: WizardStep
  /** Per step: its entered answers, one line each, pre-clipped to
   * STEP_SLOTS by the wizard state. */
  summary: Record<WizardStep, string[]>
  done: Record<WizardStep, boolean>
  /** Steps the canJump gate allows become live station buttons. */
  onStepClick?: (step: WizardStep) => void
  /** Which steps a click may open (create mode: passed steps only). */
  canJump?: (step: WizardStep) => boolean
}

export function WizardStepRail({
  currentStep,
  summary,
  done,
  onStepClick,
  canJump,
}: Props) {
  // The line runs STATION CENTRE TO STATION CENTRE (founder,
  // 2026-09-02: "remove the stray bit of line at the top and bottom").
  // justify-around decides where stations sit, so the bounds are
  // MEASURED — FitLine's idiom: a layout effect reads the first and
  // last stations and sizes the line between their centres.
  const colRef = useRef<HTMLDivElement>(null)
  const firstRef = useRef<HTMLSpanElement | null>(null)
  const lastRef = useRef<HTMLSpanElement | null>(null)
  const [line, setLine] = useState({ top: 0, height: 0 })

  useLayoutEffect(() => {
    const col = colRef.current
    if (!col) return
    const update = () => {
      const first = firstRef.current
      const last = lastRef.current
      if (!first || !last) return
      const c = col.getBoundingClientRect()
      const f = first.getBoundingClientRect()
      const l = last.getBoundingClientRect()
      const top = f.top + f.height / 2 - c.top
      setLine({ top, height: l.top + l.height / 2 - c.top - top })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(col)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="hidden h-full flex-col gap-6 bg-primary/10 p-6 md:flex">
      <div
        ref={colRef}
        className="relative flex flex-1 flex-col justify-around gap-5"
      >
        {/* THE SPINE (founder, 2026-09-02): one primary hairline
            through the station column binds the six steps into one
            journey. Paint only — absolutely positioned at the station
            centre (the 28px button's half − 1px = 13px inside the p-6)
            — it can never move an entry. A measured progress fill was
            auditioned and cut with the one-colour decision. */}
        <span
          aria-hidden="true"
          style={{ top: line.top, height: line.height }}
          className="absolute left-[11.5px] w-px bg-primary"
        />
        {STEPS.map((s) => {
          const Icon = STEP_ICONS[s]
          const isActive = s === currentStep
          const clickable = !!onStepClick && (canJump ? canJump(s) : true)
          return (
            <div key={s} className="min-w-0 space-y-1">
              {/* Chrome alignment, remeasured (founder, 2026-09-02:
                  "don't quite line up with the logo mark and text").
                  The station shifts left 2px (-ml-0.5) so the 28px
                  button's CENTRE sits at 36px — the logo glyph's own
                  centre — and gap-1.5 lands the label back on the
                  wordmark's 56px line with breathing room. */}
              <div className="flex items-center gap-1.5">
                {/* THE ICONS ARE THE BUTTONS (founder, 2026-09-02,
                    settled spec): NO differentiation by colour — the
                    line, labels and glyphs are consistently primary,
                    and state lives in SHAPE alone, with emphasis
                    following presence ("the active step should be more
                    emphatic"): the ACTIVE station is the FILLED primary
                    button; COMPLETED/reachable stations are the quieter
                    outline; UNREACHABLE stations are bare ghosts. */}
                {/* The backdrop wears the rail's own colour
                    (background + primary/10), so the track breaks at
                    every station while a disabled ghost still LOOKS
                    background-less — "no background" and "no line
                    through the icons" reconciled. */}
                <span
                  ref={
                    s === STEPS[0]
                      ? firstRef
                      : s === STEPS[STEPS.length - 1]
                        ? lastRef
                        : undefined
                  }
                  className="relative -ml-0.5 shrink-0"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-background"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-primary/10"
                  />
                  <Button
                    type="button"
                    size="icon-sm"
                    variant={
                      isActive ? "default" : clickable ? "outline" : "ghost"
                    }
                    disabled={isActive || !clickable}
                    onClick={clickable ? () => onStepClick?.(s) : undefined}
                    aria-label={`${STEP_LABELS[s]} step`}
                    aria-current={isActive ? "step" : undefined}
                    className={cn(
                      "relative h-7 w-7 shrink-0 rounded-full disabled:opacity-100",
                      // Completed stations wear the old active dress —
                      // primary border, no fill (founder: "i don't like
                      // the white background") — with a tint on hover.
                      clickable &&
                        !isActive &&
                        "border-primary bg-transparent hover:bg-primary/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        // The filled active station inherits the white
                        // foreground; everything else is primary.
                        !isActive && "text-primary"
                      )}
                    />
                  </Button>
                </span>
                <p className="text-base font-medium tracking-widest text-primary uppercase">
                  {STEP_LABELS[s]}
                </p>
                {done[s] && (
                  <Check
                    aria-label="Done"
                    className="h-4 w-4 shrink-0 text-primary"
                  />
                )}
              </div>
              {Array.from({ length: STEP_SLOTS }, (_, i) => (
                <p
                  key={i}
                  title={summary[s][i] || undefined}
                  className={cn(
                    // min-h-5: an EMPTY slot renders a lone space, which
                    // CSS collapses to 0px — the line only gained its
                    // height when its value arrived, pushing everything
                    // below down (founder, 2026-09-02, with the
                    // before/after screenshots). The floor makes every
                    // entry's height constant from first paint;
                    // measurement-verified stable across fill states.
                    "min-h-5 truncate pl-8 text-sm text-muted-foreground",
                    !summary[s][i] && "invisible"
                  )}
                >
                  {summary[s][i] || " "}
                </p>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
