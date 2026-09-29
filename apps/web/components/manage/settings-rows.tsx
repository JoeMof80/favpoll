import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// THE SETTINGS GRAMMAR for the manage page (founder, 2026-09-29: "a
// better layout for the manage favpoll page would be something more
// like [the Claude app's settings]"; then "this should become where we
// change things in place"). Groups of rows: the label and a one-line
// explanation on the left, the control — or, until a field edits in
// place, its value — on the right, hairlines between. A group is one
// bordered card with its heading above, so the rows read as a table
// of decisions rather than a pile of cards.
//
// `stacked` rows put the content UNDER the label at full width: long
// text (the About, the note), chips, a QR. Short values sit right.

export function SettingsGroup({
  title,
  description,
  children,
}: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-base font-medium text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="divide-y divide-border rounded-xl border border-border bg-background px-5">
        {children}
      </div>
    </section>
  )
}

export function SettingsRow({
  label,
  description,
  children,
  stacked = false,
  className,
}: {
  label: React.ReactNode
  description?: React.ReactNode
  /** The control, or the value until the field edits in place. */
  children?: React.ReactNode
  /** Content under the label at full width (long text, chips, a QR). */
  stacked?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "py-4",
        stacked ? "grid gap-3" : "flex items-center justify-between gap-6",
        className
      )}
    >
      <div className="min-w-0">
        {/* A div, not a p: a label can be a whole row (the charity row). */}
        <div className="text-sm text-foreground">{label}</div>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children !== undefined && children !== null && (
        // WRAP, NOT TRUNCATE (founder, 2026-09-14): this page IS the
        // record — a truncated value hides the very data it exists to
        // show. A short value sits right and wraps at 60%.
        <div
          className={
            stacked
              ? "min-w-0"
              : "max-w-[60%] min-w-0 shrink-0 text-right text-sm break-words text-foreground"
          }
        >
          {children}
        </div>
      )}
    </div>
  )
}

export type ManageSection = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
}

/** Desktop: the left column of sections. */
export function SectionNav({
  sections,
  active,
  href,
}: {
  sections: ManageSection[]
  active: string
  href: (id: string) => string
}) {
  return (
    <nav aria-label="Manage sections" className="flex flex-col gap-0.5">
      {sections.map(({ id, label, icon: Icon }) => {
        const isActive = id === active
        return (
          <Link
            key={id}
            href={href(id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary/10 font-medium text-primary"
                : "text-foreground hover:bg-muted"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

/** Mobile: the list of sections you drill into (the iOS Settings
 *  pattern, founder's pick 2026-09-29). */
export function SectionList({
  sections,
  href,
}: {
  sections: ManageSection[]
  href: (id: string) => string
}) {
  return (
    <nav
      aria-label="Manage sections"
      className="divide-y divide-border rounded-xl border border-border bg-background"
    >
      {sections.map(({ id, label, icon: Icon }) => (
        <Link
          key={id}
          href={href(id)}
          className="flex items-center gap-3 px-5 py-4 text-sm text-foreground transition-colors hover:bg-muted/50"
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="flex-1">{label}</span>
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        </Link>
      ))}
    </nav>
  )
}
