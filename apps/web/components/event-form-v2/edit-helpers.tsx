"use client"

import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Class string for the ghost edit-affordance button wrapper applied to every editable field. */
export const EDIT_BTN =
  "group relative block h-auto min-h-8 w-full whitespace-normal rounded-none p-0 text-left border-0 hover:bg-transparent focus-visible:bg-transparent after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:border-b after:[border-bottom-style:dotted] after:border-primary/20 hover:after:[border-bottom-style:solid] hover:after:border-primary/60 focus-visible:after:[border-bottom-style:solid] focus-visible:after:border-primary/60"

export function EditBadge({
  className,
  iconClassName,
}: {
  className?: string
  iconClassName?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center opacity-60 drop-shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
        className
      )}
    >
      <Pencil
        className={cn(
          "h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary/60 group-focus-visible:text-primary/60",
          iconClassName
        )}
      />
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
