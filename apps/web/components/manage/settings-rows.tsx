"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
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

/** Desktop: the wizard rail's stations — a round icon button and an
 *  uppercase primary label per section, the active one filled. No spine:
 *  sections are places, not a journey. */
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
    <nav aria-label="Manage sections" className="flex flex-col gap-5">
      {sections.map(({ id, label, icon: Icon }) => {
        const isActive = id === active
        return (
          <Link
            key={id}
            href={href(id)}
            aria-current={isActive ? "page" : undefined}
            className="group flex items-center gap-1.5"
          >
            <Button
              asChild
              size="icon-sm"
              variant={isActive ? "default" : "outline"}
              className={cn(
                "-ml-0.5 h-7 w-7 shrink-0 rounded-full",
                !isActive &&
                  "border-primary bg-transparent group-hover:bg-primary/10"
              )}
              tabIndex={-1}
            >
              <span aria-hidden="true">
                <Icon className={cn("h-4 w-4", !isActive && "text-primary")} />
              </span>
            </Button>
            <span className="text-base font-medium tracking-widest text-primary uppercase">
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

/** Mobile: the list of sections you drill into (the iOS Settings
 *  pattern, founder's pick 2026-09-29), in the rail's type. */
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
          className="flex items-center gap-3 py-4 transition-colors hover:bg-muted/50"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary">
            <Icon className="h-4 w-4 text-primary" aria-hidden />
          </span>
          <span className="flex-1 text-base font-medium tracking-widest text-primary uppercase">
            {label}
          </span>
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        </Link>
      ))}
    </nav>
  )
}
