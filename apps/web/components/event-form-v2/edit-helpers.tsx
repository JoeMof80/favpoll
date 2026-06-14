"use client"

import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Class string for the ghost edit-affordance button wrapper applied to every editable field. */
export const EDIT_BTN =
  "group relative block h-auto w-full whitespace-normal rounded-sm p-0 text-left border-b-2 border-dotted border-primary/20 hover:border-primary/60 focus-visible:border-primary/60"

export function EditBadge({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background opacity-60 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
        className
      )}
    >
      <Pencil className="h-4 w-4 text-muted-foreground" />
    </span>
  )
}

export function CharCounter({ value, max }: { value: string; max: number }) {
  const remaining = max - value.length
  return (
    <p
      className={cn(
        "mt-1 text-right text-xs",
        remaining < 10
          ? "text-destructive"
          : remaining < 20
            ? "text-amber-500"
            : "text-muted-foreground"
      )}
    >
      {remaining}
    </p>
  )
}

/** Standard Save / Cancel footer for field overlays. */
export function overlayFooter(onSave: () => void, onCancel: () => void) {
  return (
    <div className="flex gap-2">
      <Button type="button" className="flex-1" onClick={onSave}>
        Save
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="flex-1"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  )
}
