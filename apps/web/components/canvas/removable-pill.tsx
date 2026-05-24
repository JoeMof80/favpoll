"use client"

import { X } from "lucide-react"

type Props = {
  label: string
  onRemove: () => void
  /** When provided the pill itself becomes a button */
  onClick?: () => void
  selected?: boolean
}

const removeClassName =
  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"

export function RemovablePill({ label, onRemove, onClick, selected }: Props) {
  // When the pill is itself a <button>, the remove control must not also be a
  // <button> — HTML forbids nested interactive elements. Use a <span> instead.
  const removeControl = onClick ? (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Remove ${label}`}
      className={removeClassName}
      onClick={(e) => { e.stopPropagation(); onRemove() }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onRemove() } }}
    >
      <X className="h-2.5 w-2.5" />
    </span>
  ) : (
    <button
      type="button"
      aria-label={`Remove ${label}`}
      className={removeClassName}
      onClick={(e) => { e.stopPropagation(); onRemove() }}
    >
      <X className="h-2.5 w-2.5" />
    </button>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center rounded-full border py-1.5 pr-1 text-xs transition-colors ${
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input bg-background text-foreground hover:bg-muted/50"
        }`}
      >
        <span className="pl-3 pr-1">{label}</span>
        {removeControl}
      </button>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full border border-input bg-background py-1.5 pr-1 text-xs text-foreground">
      <span className="pl-3 pr-1">{label}</span>
      {removeControl}
    </span>
  )
}
