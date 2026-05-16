"use client"

import { X } from "lucide-react"

type Props = {
  label: string
  onRemove: () => void
  /** When provided the pill itself becomes a button */
  onClick?: () => void
  selected?: boolean
}

export function RemovablePill({ label, onRemove, onClick, selected }: Props) {
  const inner = (
    <>
      <span className={onClick ? "pl-3 pr-1" : "pl-3 pr-1"}>{label}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label={`Remove ${label}`}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </>
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
        {inner}
      </button>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full border border-input bg-background py-1.5 pr-1 text-xs text-foreground">
      {inner}
    </span>
  )
}
