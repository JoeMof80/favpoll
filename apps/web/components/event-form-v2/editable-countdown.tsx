"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { Countdown } from "@/components/countdown"
import { DateTimePicker } from "./date-time-picker"
import { EditBadge } from "./edit-helpers"
import { cn } from "@/lib/utils"

type Props = {
  /** ISO string — when provided (edit mode) shows a live countdown with edit affordance */
  closesAt?: string
  onClosesAtChange?: (iso: string) => void
}

export function EditableCountdown({ closesAt, onClosesAtChange }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Date | undefined>()

  if (!closesAt) {
    return (
      <div className="rounded-lg border border-border bg-card px-5 py-4">
        <Countdown />
      </div>
    )
  }

  const isPast = new Date(closesAt) <= new Date()

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "group relative block h-auto w-full rounded-xl border border-dotted border-border bg-card px-5 py-4",
          "text-left font-normal whitespace-normal hover:bg-card focus-visible:bg-card",
          "hover:border-solid hover:border-primary/40",
          "focus-visible:border-solid focus-visible:border-primary/40"
        )}
        onClick={() => {
          setDraft(new Date(closesAt))
          setOpen(true)
        }}
        aria-label="Edit closing date"
      >
        {isPast ? (
          <p className="text-xs text-muted-foreground">Poll closed</p>
        ) : (
          <Countdown closesAt={closesAt} />
        )}
        <EditBadge
          className="top-0 bottom-auto"
          iconClassName="group-hover:text-primary/40 group-focus-visible:text-primary/40"
        />
      </Button>

      <ResponsiveOverlay
        open={open}
        onOpenChange={(o) => !o && setOpen(false)}
        title="Poll closing date"
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              disabled={!draft}
              onClick={() => {
                if (draft) onClosesAtChange?.(draft.toISOString())
                setOpen(false)
              }}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        }
      >
        <DateTimePicker value={draft} onChange={setDraft} />
      </ResponsiveOverlay>
    </>
  )
}
