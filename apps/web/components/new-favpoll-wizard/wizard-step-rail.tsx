"use client"

import {
  BookOpen,
  Calendar,
  Check,
  ClipboardList,
  Gift,
  Shapes,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { STEPS, STEP_LABELS, type WizardStep } from "@/lib/wizard-copy"

// Concrete objects, not interface furniture — a calendar, a gift, an
// assortment, a person, a book, a clipboard. The rail tracks the answers
// as they accumulate (extended-wizard prototype, round 25): each step
// shows a tick once its content is in, and the chosen thing itself as a
// one-line summary beneath the label.
const STEP_ICONS: Record<WizardStep, React.ElementType> = {
  event: Calendar,
  charity: Gift,
  topic: Shapes,
  info: UserRound,
  story: BookOpen,
  details: ClipboardList,
}

type Props = {
  currentStep: WizardStep
  summary: Record<WizardStep, string>
  done: Record<WizardStep, boolean>
  /** Edit mode: rail entries become buttons that jump to their step. */
  onStepClick?: (step: WizardStep) => void
}

export function WizardStepRail({
  currentStep,
  summary,
  done,
  onStepClick,
}: Props) {
  return (
    <div className="hidden h-full flex-col gap-6 bg-primary/10 p-6 md:flex">
      <div className="flex flex-1 flex-col justify-around gap-5">
        {STEPS.map((s) => {
          const Icon = STEP_ICONS[s]
          const isActive = s === currentStep
          const Entry = onStepClick ? "button" : "div"
          return (
            <Entry
              key={s}
              {...(onStepClick
                ? { type: "button" as const, onClick: () => onStepClick(s) }
                : {})}
              className={cn(
                "min-w-0 space-y-1 text-left transition-opacity",
                isActive || done[s] ? "opacity-100" : "opacity-60",
                onStepClick && "cursor-pointer hover:opacity-100"
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
              {summary[s] && (
                <p className="truncate pl-7.5 text-sm text-muted-foreground">
                  {summary[s]}
                </p>
              )}
            </Entry>
          )
        })}
      </div>
    </div>
  )
}
