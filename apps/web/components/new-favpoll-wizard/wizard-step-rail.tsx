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
// a person, a book; Settings wears its own glyph. The rail tracks the answers
// as they accumulate (extended-wizard prototype, round 25): each step
// shows a tick once its content is in, and the chosen thing itself as a
// one-line summary beneath the label.
export const STEP_ICONS: Record<WizardStep, React.ElementType> = {
  event: Calendar,
  charity: Gift,
  topic: Shapes,
  info: UserRound,
  story: BookOpen,
  details: Settings2,
}

// The heavier steps (founder, 2026-09-02): Header and Story hold more
// answers than the rest, so they reserve a SECOND summary line — the
// opening line, and the reveal. Reserved statically (invisible when
// empty) exactly like the first line, so the no-reflow invariant holds.
const EXTRA_STEPS: ReadonlySet<WizardStep> = new Set(["info", "story"])

type Props = {
  currentStep: WizardStep
  summary: Record<WizardStep, string>
  done: Record<WizardStep, boolean>
  /** Second summary line for the heavier steps (EXTRA_STEPS only). */
  extra?: Partial<Record<WizardStep, string>>
  /** Entries the canJump gate allows become buttons that jump to their step. */
  onStepClick?: (step: WizardStep) => void
  /** Which steps a click may open (create mode: passed steps only). */
  canJump?: (step: WizardStep) => boolean
}

export function WizardStepRail({
  currentStep,
  summary,
  done,
  extra,
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
              {/* Always rendered — an empty summary keeps its line so the
                  rail never reflows as answers accumulate (justify-around
                  would otherwise redistribute every entry). The avatar-chip
                  variant (option B) was tried and reverted same day —
                  founder: text facts only ("the idea of A"). */}
              <p
                title={summary[s] || undefined}
                className={cn(
                  "truncate pl-7.5 text-sm text-muted-foreground",
                  !summary[s] && "invisible"
                )}
              >
                {summary[s] || " "}
              </p>
              {EXTRA_STEPS.has(s) && (
                <p
                  title={extra?.[s] || undefined}
                  className={cn(
                    "truncate pl-7.5 text-sm text-muted-foreground",
                    !extra?.[s] && "invisible"
                  )}
                >
                  {extra?.[s] || " "}
                </p>
              )}
            </Entry>
          )
        })}
      </div>
    </div>
  )
}
