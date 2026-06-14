"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { Countdown } from "@/components/countdown"
import { DateTimePicker } from "./date-time-picker"

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
      <div className="relative">
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          {isPast ? (
            <p className="text-xs text-muted-foreground">Poll closed</p>
          ) : (
            <Countdown closesAt={closesAt} />
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-7 w-7 p-0 opacity-60 hover:opacity-100"
          onClick={() => {
            setDraft(new Date(closesAt))
            setOpen(true)
          }}
          aria-label="Edit closing date"
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>

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
