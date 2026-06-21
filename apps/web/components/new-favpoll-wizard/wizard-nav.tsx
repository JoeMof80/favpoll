"use client"

import { Button } from "@/components/ui/button"

type Props = {
  isFirst: boolean
  isLast: boolean
  nextDisabled: boolean
  onBack: () => void
  onNext: () => void
  onFinish: () => void
}

export function WizardNav({
  isFirst,
  isLast,
  nextDisabled,
  onBack,
  onNext,
  onFinish,
}: Props) {
  return (
    <div className="mt-10 flex items-center justify-end gap-2 border-t border-border pt-2">
      {!isFirst ? (
        <Button variant="ghost" size="lg" onClick={onBack}>
          Back
        </Button>
      ) : (
        <span />
      )}
      {isLast ? (
        <Button size="lg" disabled={nextDisabled} onClick={onFinish}>
          Set up my favpoll
        </Button>
      ) : (
        <Button size="lg" disabled={nextDisabled} onClick={onNext}>
          Next
        </Button>
      )}
    </div>
  )
}
