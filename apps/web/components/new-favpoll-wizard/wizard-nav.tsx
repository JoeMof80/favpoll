"use client"

import { Button } from "@/components/ui/button"

type Props = {
  isFirst: boolean
  isLast: boolean
  nextDisabled: boolean
  submitting?: boolean
  finishLabel?: string
  submittingLabel?: string
  onBack: () => void
  onNext: () => void
  onFinish: () => void
}

export function WizardNav({
  isFirst,
  isLast,
  nextDisabled,
  submitting = false,
  finishLabel = "Publish",
  submittingLabel = "Publishing…",
  onBack,
  onNext,
  onFinish,
}: Props) {
  return (
    <div className="mt-10 flex items-center justify-end gap-2 border-t border-border pt-2">
      {!isFirst ? (
        <Button
          variant="ghost"
          size="lg"
          className="h-11 px-6 md:text-base"
          disabled={submitting}
          onClick={onBack}
        >
          Back
        </Button>
      ) : (
        <span />
      )}
      {isLast ? (
        <Button
          size="lg"
          className="h-11 px-6 md:text-base"
          disabled={nextDisabled || submitting}
          onClick={onFinish}
        >
          {submitting ? submittingLabel : finishLabel}
        </Button>
      ) : (
        <Button
          size="lg"
          className="h-11 px-6 md:text-base"
          disabled={nextDisabled}
          onClick={onNext}
        >
          Next
        </Button>
      )}
    </div>
  )
}
