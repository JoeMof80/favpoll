"use client"

import { cn } from "@/lib/utils"
import { STEPS, STEP_LABELS, type WizardStep } from "@/lib/wizard-copy"
import { STEP_ICONS } from "./wizard-step-rail"

// The phone's slice of the rail (was bars only, prototype round 10;
// upgraded 2026-08-31): each step wears its rail icon and a 10px label
// over its bar — the six short labels fit a phone row at that size where
// the rail's full type does not. The bars carry position (filled up to
// the current step); the icons carry content (primary once the step's
// answer is in, like the rail's ticks). Summaries stay rail-only.
type Props = {
  currentStep: WizardStep
  /** The rail's done map — a step's icon lights once its content is in. */
  done: Record<WizardStep, boolean>
  /** Segments the canJump gate allows become buttons that jump to their step. */
  onStepClick?: (step: WizardStep) => void
  /** Which steps a click may open (create mode: passed steps only). */
  canJump?: (step: WizardStep) => boolean
}

export function WizardProgressStrip({
  currentStep,
  done,
  onStepClick,
  canJump,
}: Props) {
  const stepIndex = STEPS.indexOf(currentStep)
  return (
    <ol
      role="list"
      aria-label="Wizard steps"
      className="mb-10 flex gap-1.5 md:hidden"
    >
      {STEPS.map((s, i) => {
        const Icon = STEP_ICONS[s]
        const isActive = s === currentStep
        const clickable = !!onStepClick && (canJump ? canJump(s) : true)
        const Inner = clickable ? "button" : "div"
        return (
          <li
            key={s}
            role="listitem"
            aria-label={`Step ${i + 1} of ${STEPS.length}: ${STEP_LABELS[s]}${done[s] ? " (done)" : ""}`}
            aria-current={isActive ? "step" : undefined}
            className="min-w-0 flex-1"
          >
            <Inner
              {...(clickable
                ? { type: "button" as const, onClick: () => onStepClick?.(s) }
                : {})}
              className={cn(
                "flex w-full min-w-0 flex-col items-center gap-1",
                clickable && "cursor-pointer"
              )}
            >
              <Icon
                aria-hidden
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive || done[s]
                    ? "text-primary"
                    : "text-muted-foreground/60"
                )}
              />
              <span
                className={cn(
                  "max-w-full truncate text-[10px] tracking-wide uppercase transition-colors",
                  isActive
                    ? "font-medium text-primary"
                    : "text-muted-foreground/80"
                )}
              >
                {STEP_LABELS[s]}
              </span>
              <span
                className={cn(
                  "block h-1 w-full rounded-full transition-colors",
                  i <= stepIndex ? "bg-primary" : "bg-muted"
                )}
              />
            </Inner>
          </li>
        )
      })}
    </ol>
  )
}
