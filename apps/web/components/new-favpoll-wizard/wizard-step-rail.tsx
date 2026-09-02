"use client"

import {
  BookOpen,
  Calendar,
  Check,
  Gift,
  Settings2,
  Shapes,
  UserRound,
} from "lucide-react"
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
const STEP_SLOTS: Record<WizardStep, number> = {
  event: 1,
  charity: 2,
  topic: 1,
  info: 3,
  story: 2,
  details: 3,
}

type Props = {
  currentStep: WizardStep
  /** Per step: its entered answers, one line each, pre-clipped to
   * STEP_SLOTS by the wizard state. */
  summary: Record<WizardStep, string[]>
  done: Record<WizardStep, boolean>
  /** Entries the canJump gate allows become buttons that jump to their step. */
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
  return (
    <div className="hidden h-full flex-col gap-6 bg-primary/10 p-6 md:flex">
      <div className="flex flex-1 flex-col justify-around gap-5">
        {STEPS.map((s) => {
          const Icon = STEP_ICONS[s]
          const isActive = s === currentStep
          const clickable = !!onStepClick && (canJump ? canJump(s) : true)
          const Entry = clickable ? "button" : "div"
          return (
            <Entry
              key={s}
              {...(clickable
                ? { type: "button" as const, onClick: () => onStepClick?.(s) }
                : {})}
              className={cn(
                "min-w-0 space-y-1 text-left transition-opacity",
                isActive || done[s] ? "opacity-100" : "opacity-60",
                clickable && "cursor-pointer hover:opacity-100"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <p
                  className={cn(
                    "text-base font-medium tracking-widest uppercase",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {STEP_LABELS[s]}
                </p>
                {done[s] && (
                  <Check
                    aria-label="Done"
                    className="h-4 w-4 shrink-0 text-primary"
                  />
                )}
              </div>
              {Array.from({ length: STEP_SLOTS[s] }, (_, i) => (
                <p
                  key={i}
                  title={summary[s][i] || undefined}
                  className={cn(
                    "truncate pl-7.5 text-sm text-muted-foreground",
                    !summary[s][i] && "invisible"
                  )}
                >
                  {summary[s][i] || " "}
                </p>
              ))}
            </Entry>
          )
        })}
      </div>
    </div>
  )
}
