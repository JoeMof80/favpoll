"use client"

type Props = {
  title: string
  guidance: string
  children: React.ReactNode
}

export function WizardStepShell({ title, guidance, children }: Props) {
  return (
    <div className="flex flex-col gap-3 py-6">
      <h3 className="text-lg font-medium tracking-tight text-foreground">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{guidance}</p>
      {children}
    </div>
  )
}
