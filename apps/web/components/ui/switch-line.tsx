"use client"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

// A SWITCH WITH ITS SENTENCE (founder, 2026-09-30: "should these be
// inline or are they better in rows?" — inline). The sentence is the
// switch's own label, beside it on one line: the whole line toggles,
// assistive tech reads the switch as that sentence, and nothing sits
// stranded two lines below. The checkbox convention — the one place a
// control and its explanation belong together, because the sentence
// IS the state.

export function SwitchLine({
  checked,
  onCheckedChange,
  disabled,
  children,
  className,
}: {
  checked: boolean
  onCheckedChange: (next: boolean) => void
  disabled?: boolean
  /** The state, as a sentence. */
  children: React.ReactNode
  className?: string
}) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground",
        disabled && "cursor-default opacity-70",
        className
      )}
    >
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <span className="min-w-0">{children}</span>
    </label>
  )
}
