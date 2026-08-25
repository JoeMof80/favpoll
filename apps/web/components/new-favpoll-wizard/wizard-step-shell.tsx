"use client"

// No heading: the step is already named by the rail (desktop) and the
// progress strip (mobile), both of which name ALL THREE steps at once.
// A per-step h3 repeated the current one a second time on the same
// screen, under a second, differently-worded question (founder,
// 2026-08-25). The guidance stays — it is the prompt the step's own
// controls answer, and TypeStep in particular has no heading of its own.
type Props = {
  guidance: string
  children: React.ReactNode
}

export function WizardStepShell({ guidance, children }: Props) {
  return (
    <div className="flex flex-col gap-3 py-6">
      <p className="text-sm text-muted-foreground">{guidance}</p>
      {children}
    </div>
  )
}
