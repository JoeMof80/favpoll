"use client"

import { Check, X } from "lucide-react"

type Props = {
  value: string
  onChange: (v: string) => void
  onConfirm: () => void
  onCancel: () => void
  placeholder?: string
  autoFocus?: boolean
}

export function InlineOptionInput({
  value,
  onChange,
  onConfirm,
  onCancel,
  placeholder = "Option name…",
  autoFocus = true,
}: Props) {
  return (
    <div className="flex items-center rounded-full border border-input bg-background py-1 pl-3 pr-1">
      <input
        autoFocus={autoFocus}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onConfirm()
          if (e.key === "Escape") onCancel()
        }}
        placeholder={placeholder}
        className="min-w-0 w-28 bg-transparent text-xs outline-none placeholder:text-muted-foreground/40"
      />
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={onConfirm}
          aria-label="Confirm"
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
