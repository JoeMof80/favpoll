"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { STEPS, STEP_LABELS, type WizardStep } from "@/lib/wizard-copy"
import { STEP_ICONS } from "./wizard-step-rail"

// The phone's slice of the rail (restyled 2026-09-02 to match the
// rail's settled station grammar): the icons are the buttons — filled
// primary = you are here, primary border with no fill = been there
// (tap to return), bare faded ghost = not yet — strung on one primary
// hairline. LIMITED by design: no value lists (the rail carries the
// favpoll at a glance); stations and labels only, one colour.
//
// The line runs centre-to-centre: with six equal columns that is 1/12
// in from each edge; the solid bg-background discs behind the buttons
// break it at every station (the outline faces are transparent).
type Props = {
  currentStep: WizardStep
  done: Record<WizardStep, boolean>
  /** Segments the canJump gate allows become live station buttons. */
  onStepClick?: (step: WizardStep) => void
  /** Which steps a click may open (create mode: passed or done). */
  canJump?: (step: WizardStep) => boolean
}

export function WizardProgressStrip({
  currentStep,
  done,
  onStepClick,
  canJump,
}: Props) {
  return (
    <ol
      role="list"
      aria-label="Wizard steps"
      className="relative -mx-6 mb-10 flex md:hidden"
    >
      <span
        aria-hidden="true"
        className="absolute top-[13.5px] right-[8.333%] left-[8.333%] h-px bg-primary"
      />
      {STEPS.map((s, i) => {
        const Icon = STEP_ICONS[s]
        const isActive = s === currentStep
        const clickable = !!onStepClick && (canJump ? canJump(s) : true)
        return (
          <li
            key={s}
            role="listitem"
            aria-label={`Step ${i + 1} of ${STEPS.length}: ${STEP_LABELS[s]}${done[s] ? " (done)" : ""}`}
            aria-current={isActive ? "step" : undefined}
            className="relative flex min-w-0 flex-1 flex-col items-center gap-1"
          >
            <span className="relative shrink-0 rounded-full bg-background">
              <Button
                type="button"
                size="icon-sm"
                variant={isActive ? "default" : clickable ? "outline" : "ghost"}
                disabled={isActive || !clickable}
                onClick={clickable ? () => onStepClick?.(s) : undefined}
                aria-label={`${STEP_LABELS[s]} step`}
                className={cn(
                  "relative h-7 w-7 rounded-full disabled:opacity-100",
                  clickable &&
                    !isActive &&
                    "border-primary bg-transparent hover:bg-primary/10"
                )}
              >
                <Icon className={cn("h-4 w-4", !isActive && "text-primary")} />
              </Button>
            </span>
            <span className="max-w-full truncate text-[10px] tracking-wide text-primary uppercase">
              {STEP_LABELS[s]}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
