"use client"

import { InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Bigger inputs (extended-wizard prototype, round 11) — the wizard
// column is generous, so fields wear full text size instead of shadcn's
// md:text-sm shrink.
export const WIZARD_INPUT_SIZE = "h-11 md:text-base"

export function WizardInfoPopover({ text }: { text: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="About this field"
          className="ml-1 h-4 w-4 rounded-full align-middle text-muted-foreground/60 hover:text-foreground"
        >
          <InfoIcon className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 text-xs leading-relaxed">
        {text}
      </PopoverContent>
    </Popover>
  )
}

/**
 * A wizard form row: label | field (stacked below sm). The root is a div,
 * not a label — info buttons and counters must not live inside a label
 * (they inherit its accessible name and its activation). Required fields
 * wear a quiet asterisk; optional is unspoken (prototype round 23).
 */
export function WizardField({
  label,
  required = false,
  info,
  hint,
  children,
}: {
  label: string
  required?: boolean
  info?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="block space-y-1.5 text-sm sm:grid sm:grid-cols-[180px_1fr] sm:items-start sm:space-y-0 sm:gap-x-6 sm:gap-y-1.5">
      <span className="block font-medium sm:pt-3">
        {label}
        {required && <span className="text-muted-foreground"> *</span>}
        {info && <WizardInfoPopover text={info} />}
      </span>
      <div className="min-w-0">{children}</div>
      {hint && (
        <span className="block text-xs text-muted-foreground sm:col-start-2">
          {hint}
        </span>
      )}
    </div>
  )
}
