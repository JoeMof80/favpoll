"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { WizardField } from "@/components/new-favpoll-wizard/wizard-field"
import { WizardStepShell } from "@/components/new-favpoll-wizard/wizard-step-shell"
import { cn } from "@/lib/utils"

// THE MANAGE PAGE WEARS THE WIZARD (founder, 2026-09-29: "please use
// design from other parts of the app (e.g. wizard). and page with
// shadow"). A group is a WizardStepShell — the rail's uppercase primary
// heading over a column of fields — and a row is a WizardField: label
// left in the 180px column, the control (or, until a field edits in
// place, its value) right, the explanation as the field's hint. The
// section nav is the wizard's rail: tinted column, round icon
// stations, the active one filled. Nothing here that the wizard
// doesn't already do.

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
    <WizardStepShell title={title}>
      {description && (
        <p className="-mt-2 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="space-y-5">{children}</div>
    </WizardStepShell>
  )
}

export function SettingsRow({
  label,
  description,
  children,
  required = false,
  className,
}: {
  label: string
  /** The wizard's hint line, under the control. */
  description?: React.ReactNode
  /** The control, or the value until the field edits in place. */
  children?: React.ReactNode
  required?: boolean
  /** Kept for callers; the wizard grid stacks below sm on its own. */
  stacked?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <WizardField label={label} required={required} hint={description}>
        {/* min-h matches the wizard's input height so a value at rest
            sits on the same baseline as a field mid-edit. */}
        <div className="flex min-h-11 w-full items-center text-sm text-foreground [&>*]:min-w-0 [&>.grid]:w-full">
          {children}
        </div>
      </WizardField>
    </div>
  )
}

export type ManageSection = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
}

/** Desktop: the left column of sections — plain buttons, the active
 *  one tinted (founder, 2026-09-29: the wizard rail's stations were
 *  auditioned here and cut). */
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
    <nav aria-label="Manage sections" className="divide-y divide-border">
      {sections.map(({ id, label, icon: Icon }) => (
        <Link
          key={id}
          href={href(id)}
          className="flex items-center gap-3 py-4 text-sm text-foreground transition-colors hover:bg-muted/50"
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
