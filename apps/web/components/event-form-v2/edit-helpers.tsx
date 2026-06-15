"use client"

import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Shared className for the InputGroup used in every field overlay header. */
export const INPUT_GROUP_CLS =
  "h-auto rounded-none border-0 has-[[data-slot=input-group-control]:focus-visible]:ring-0"

/** Shared props spread onto every field ResponsiveOverlay. */
export const FIELD_OVERLAY_PROPS = {
  hideCloseButton: true,
  headerClassName: "p-0",
  dialogClassName: "flex flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
} as const

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

export function CharCounter({
  value,
  max,
  className,
}: {
  value: string
  max: number
  className?: string
}) {
  const remaining = max - value.length
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums",
        remaining < 10
          ? "bg-destructive/10 text-destructive"
          : remaining < 20
            ? "bg-amber-100 text-amber-600"
            : "bg-muted text-muted-foreground",
        className
      )}
    >
      {remaining}
    </span>
  )
}

/** Standard Cancel / Save footer for field overlays. */
export function overlayFooter(onSave: () => void, onCancel: () => void) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="ghost"
        className="flex-1"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="button" className="flex-1" onClick={onSave}>
        Save
      </Button>
    </div>
  )
}
