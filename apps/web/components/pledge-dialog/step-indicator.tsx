"use client"

type Props = {
  step: 1 | 2 | 3
}

export function StepIndicator({ step }: Props) {
  return (
    <ol role="list" aria-label="Progress" className="flex gap-1.5">
      {([1, 2, 3] as const).map((n) => (
        <li
          key={n}
          role="listitem"
          aria-label={`Step ${n} of 3`}
          aria-current={step === n ? "step" : undefined}
          className={`text-sm ${step === n ? "text-primary" : "text-muted-foreground/40"}`}
        >
          {step === n ? "●" : "○"}
        </li>
      ))}
    </ol>
  )
}
