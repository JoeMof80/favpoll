"use client"

// The heading wears the RAIL'S TYPE — uppercase, tracking-widest,
// primary. The guidance line under it retired with the extended wizard
// (founder, prototype round 13: "they feel glib") — the heading and the
// fields say it all. `action` sits on the heading row's right (the
// Story step's Generate button).
type Props = {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function WizardStepShell({ title, action, children }: Props) {
  return (
    <div className="flex flex-col gap-5 py-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-medium tracking-widest text-primary uppercase">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  )
}
