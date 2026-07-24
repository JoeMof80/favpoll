"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { INPUT_GROUP_CLS, FIELD_OVERLAY_PROPS } from "./edit-helpers"
import {
  addDays,
  ordinalSuffix,
  CLOSE_DATE_PRESETS,
  CLOSE_TIME_PRESETS,
} from "./date-helpers"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  initialDate: Date
  saveLabel?: string
  submitting?: boolean
  onSave: (date: Date) => void
}

export function CloseDateOverlay({
  open,
  onOpenChange,
  title = "Poll closing date",
  initialDate,
  saveLabel = "Save",
  submitting = false,
  onSave,
}: Props) {
  const [draft, setDraft] = useState<Date>(initialDate)
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  )
  const prevOpenRef = useRef(false)

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setDraft(initialDate)
      setCalendarMonth(
        new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
      )
    }
    prevOpenRef.current = open
  }, [open, initialDate])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const timeStr = `${String(draft.getHours()).padStart(2, "0")}:${String(draft.getMinutes()).padStart(2, "0")}`

  function handleDaySelect(d: Date | undefined) {
    if (!d) return
    const next = new Date(draft)
    next.setFullYear(d.getFullYear(), d.getMonth(), d.getDate())
    setDraft(next)
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [h, m] = e.target.value.split(":").map(Number)
    const next = new Date(draft)
    next.setHours(h ?? 23, m ?? 59, 0, 0)
    setDraft(next)
  }

  function handlePreset(days: number) {
    const d = addDays(new Date(), days)
    // Keep whatever time the organiser has chosen — a date preset moves
    // the day, it must not stomp a 2pm service back to end-of-day.
    d.setHours(draft.getHours(), draft.getMinutes(), 0, 0)
    setDraft(d)
    setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1))
  }

  function handleTimePreset(hours: number, minutes: number) {
    const next = new Date(draft)
    next.setHours(hours, minutes, 0, 0)
    setDraft(next)
  }

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={(o) => !o && onOpenChange(false)}
      title={title}
      {...FIELD_OVERLAY_PROPS}
      dialogClassName={cn(
        FIELD_OVERLAY_PROPS.dialogClassName,
        "bg-white dark:bg-card"
      )}
      dialogContentClassName="flex-1 overflow-y-auto px-5 py-4"
      header={
        <InputGroup
          className={cn(INPUT_GROUP_CLS, "items-start")}
          style={{ backgroundColor: "var(--card)" }}
        >
          <InputGroupAddon align="block-start" className="px-5 pt-4 pb-0">
            <InputGroupText>Close date</InputGroupText>
          </InputGroupAddon>

          <div className="flex items-baseline justify-between gap-4 px-5 py-3">
            <span className="text-2xl text-foreground">
              {`${ordinalSuffix(draft.getDate())} ${draft.toLocaleDateString("en-GB", { month: "long" })}, ${draft.getFullYear()}`}
            </span>
            <input
              type="time"
              step="60"
              value={timeStr}
              onChange={handleTimeChange}
              className="appearance-none border-b [border-bottom-style:dotted] border-primary/20 bg-transparent text-2xl text-muted-foreground tabular-nums outline-none hover:[border-bottom-style:solid] hover:border-primary/60 focus:[border-bottom-style:solid] focus:border-primary/60 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>

          <InputGroupAddon align="block-end" className="px-5 pb-3">
            <InputGroupText>
              Aim for at least a week — most pledges come in the final 48 hours.
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      }
      footer={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={submitting}
            onClick={() => onSave(draft)}
          >
            {submitting ? "Creating…" : saveLabel}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={draft}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          startMonth={today}
          endMonth={new Date(new Date().getFullYear() + 5, 11)}
          disabled={{ before: today }}
          onSelect={handleDaySelect}
          className="w-full p-0"
        />
        <div className="flex flex-col content-start gap-5">
          <div>
            <p className="mb-2 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
              Date
            </p>
            <div className="flex flex-wrap gap-2">
              {CLOSE_DATE_PRESETS.map((p) => (
                <Button
                  key={p.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => handlePreset(p.days)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
              Time
            </p>
            <div className="flex flex-wrap gap-2">
              {CLOSE_TIME_PRESETS.map((p) => (
                <Button
                  key={p.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleTimePreset(p.hours, p.minutes)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ResponsiveOverlay>
  )
}
