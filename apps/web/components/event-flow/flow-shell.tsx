"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

type FlowShellProps = {
  step: 1 | 2 | 3
  title: string
  description?: string
  backHref?: string
  nextDisabled: boolean
  onNext: () => void
  children: React.ReactNode
}

export function FlowShell({
  step,
  title,
  description,
  backHref,
  nextDisabled,
  onNext,
  children,
}: FlowShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Stepper header */}
      <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        {backHref && (
          <Button variant="ghost" size="sm" asChild className="shrink-0">
            <Link href={backHref}>← Back</Link>
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Step {step} of 3</p>
          <h1 className="text-base font-semibold">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6">{children}</div>
      </div>

      {/* Sticky Next */}
      <div
        className="shrink-0 border-t border-border bg-background px-4 py-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <Button className="w-full" disabled={nextDisabled} onClick={onNext}>
          {step === 3 ? "Set up your event" : "Next"}
        </Button>
      </div>
    </div>
  )
}
