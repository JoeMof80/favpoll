"use client"

import { cn } from "@/lib/utils"
import { STEPS, STEP_LABELS } from "./use-wizard-state"
import type { WizardStep } from "@/lib/wizard-copy"

type Props = {
  currentStep: WizardStep
}

export function WizardProgressStrip({ currentStep }: Props) {
  const stepIndex = STEPS.indexOf(currentStep)
  return (
    <ol
      role="list"
      aria-label="Wizard steps"
      className="mb-10 flex gap-2 md:hidden"
    >
      {STEPS.map((s, i) => {
        const isActive = s === currentStep
        const isPast = STEPS.indexOf(s) < stepIndex
        return (
          <li
            key={s}
            role="listitem"
            aria-label={`Step ${i + 1} of ${STEPS.length}: ${STEP_LABELS[s]}`}
            aria-current={isActive ? "step" : undefined}
            className="flex flex-1 flex-col gap-1.5"
          >
            <span
              className={cn(
                "h-1 rounded-full transition-colors",
                isActive || isPast ? "bg-[#534AB7]" : "bg-muted"
              )}
            />
            <span
              className={cn(
                "text-[11px] font-medium tracking-widest uppercase transition-colors",
                isActive ? "text-[#534AB7]" : "text-muted-foreground"
              )}
            >
              {STEP_LABELS[s]}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
