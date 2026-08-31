"use client"

import { cn } from "@/lib/utils"
import { STEPS, STEP_LABELS, type WizardStep } from "@/lib/wizard-copy"

// Bars only — six labelled bars don't fit a phone row, and the step
// heading directly below names the current step (extended-wizard
// prototype, round 10).
type Props = {
  currentStep: WizardStep
}

export function WizardProgressStrip({ currentStep }: Props) {
  const stepIndex = STEPS.indexOf(currentStep)
  return (
    <ol
      role="list"
      aria-label="Wizard steps"
      className="mb-10 flex gap-1.5 md:hidden"
    >
      {STEPS.map((s, i) => (
        <li
          key={s}
          role="listitem"
          aria-label={`Step ${i + 1} of ${STEPS.length}: ${STEP_LABELS[s]}`}
          aria-current={s === currentStep ? "step" : undefined}
          className="flex-1"
        >
          <span
            className={cn(
              "block h-1 rounded-full transition-colors",
              i <= stepIndex ? "bg-primary" : "bg-muted"
            )}
          />
        </li>
      ))}
    </ol>
  )
}
