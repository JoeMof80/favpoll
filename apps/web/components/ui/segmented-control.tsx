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
  size = "sm",
  className,
}: {
  options: readonly Segment<T>[]
  value: T
  onChange: (value: T) => void
  /** Names the group for assistive tech — the visible label is separate. */
  label: string
  /** "lg" is the 44px form-control scale (founder, 2026-09-02 — one
   * height wherever form elements appear); "sm" stays the toolbar
   * idiom. */
  size?: "sm" | "lg"
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex rounded-lg border border-border bg-background shadow-xs",
        size === "lg" ? "h-11 items-stretch p-1" : "items-center p-0.5",
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
            "inline-flex items-center rounded-md font-medium transition-colors",
            size === "lg" ? "px-4 text-sm md:text-base" : "px-3 py-1 text-sm",
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
