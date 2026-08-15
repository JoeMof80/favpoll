"use client"

import { cn } from "@/lib/utils"

// A small set of mutually exclusive choices, shown all at once.
//
// Extracted from ListControls (founder, 2026-08-15) once the print workspace
// grew a second copy for its zoom presets. Two identical controls in one
// product is one control that has not been named yet.
//
// Use it when the options are FEW and worth seeing without opening anything —
// status, zoom, a variant. When there are more than about four, or the labels
// are long, a dropdown is the better shape; the pack's eight sheets went that
// way for exactly that reason.

export type Segment<T extends string> = { value: T; label: string }

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: readonly Segment<T>[]
  value: T
  onChange: (value: T) => void
  /** Names the group for assistive tech — the visible label is separate. */
  label: string
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex items-center rounded-lg border border-border bg-background p-0.5 shadow-xs",
        className
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            value === opt.value
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// The small uppercase label that sits before a control in a toolbar band.
// Hidden below md, where the band needs its width for the controls.
export function ToolbarLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="hidden text-[11px] font-medium tracking-widest text-muted-foreground uppercase md:inline">
      {children}
    </span>
  )
}
