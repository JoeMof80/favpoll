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

export function WizardStepShell({
  title,
  action,
  children,
  visibleTitle = false,
}: Props & {
  /** Show the heading. The wizard leaves it off — the rail (desktop)
   *  and the progress strip (phone) already name the step (founder,
   *  2026-09-30: headers "are carried in the nav"); the manage page
   *  turns it on for the one heading worth keeping. */
  visibleTitle?: boolean
}) {
  return (
    <div className="flex flex-col gap-5 py-6">
      {visibleTitle || action ? (
        <div className="flex items-center justify-between gap-4">
          <h3
            className={
              visibleTitle
                ? "text-lg font-medium tracking-widest text-primary uppercase"
                : "sr-only"
            }
          >
            {title}
          </h3>
          {action}
        </div>
      ) : (
        <h3 className="sr-only">{title}</h3>
      )}
      {children}
    </div>
  )
}
