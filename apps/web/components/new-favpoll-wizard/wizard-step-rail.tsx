"use client"

import { Calendar, Gift, Shapes } from "lucide-react"
import { cn } from "@/lib/utils"
import { STEPS, STEP_LABELS } from "./use-wizard-state"
import type { WizardStep } from "@/lib/wizard-copy"
import type { WizardCopy } from "@/lib/wizard-copy"

// Concrete objects, all three — a calendar, a gift, an assortment. A list
// or a grid would drop interface furniture into a set of real things.
//
// Heart marked this step when it was the Love step, and it said affection
// for a PERSON — which the wizard deliberately no longer knows, since
// Cause moved to the Generate control (2026-08-25). Shapes says what a
// topic actually is: different things to pick among, which holds for an
// infinite topic as well as a finite one.
const STEP_ICONS: Record<WizardStep, React.ElementType> = {
  event: Calendar,
  charity: Gift,
  topic: Shapes,
}

type Props = {
  currentStep: WizardStep
  copy: WizardCopy
}

export function WizardStepRail({ currentStep, copy }: Props) {
  const stepIndex = STEPS.indexOf(currentStep)
  return (
    <div className="hidden h-full flex-col gap-10 bg-primary/10 p-6 md:flex">
      <div className="flex flex-1 flex-col justify-around gap-8">
        {STEPS.map((s) => {
          const Icon = STEP_ICONS[s]
          const isActive = s === currentStep
          const isPast = STEPS.indexOf(s) < stepIndex
          return (
            <div
              key={s}
              className={cn(
                "space-y-1.5 transition-opacity",
                isActive ? "opacity-100" : isPast ? "opacity-60" : "opacity-60"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "h-6 w-6 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <p
                  className={cn(
                    "text-lg font-medium tracking-widest uppercase",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {STEP_LABELS[s]}
                </p>
              </div>
              <p className="pl-8.5 text-sm leading-relaxed text-muted-foreground">
                {copy.rail[s]}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
