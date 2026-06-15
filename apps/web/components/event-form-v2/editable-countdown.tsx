"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Countdown } from "@/components/countdown"
import { cn } from "@/lib/utils"
import { EditBadge } from "./edit-helpers"
import { CloseDateOverlay } from "./close-date-overlay"

type Props = {
  /** ISO string — when provided (edit mode) shows a live countdown with edit affordance */
  closesAt?: string
  onClosesAtChange?: (iso: string) => void
}

export function EditableCountdown({ closesAt, onClosesAtChange }: Props) {
  const [open, setOpen] = useState(false)

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
        onClick={() => setOpen(true)}
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

      <CloseDateOverlay
        open={open}
        onOpenChange={setOpen}
        initialDate={new Date(closesAt)}
        onSave={(date) => {
          onClosesAtChange?.(date.toISOString())
          setOpen(false)
        }}
      />
    </>
  )
}
