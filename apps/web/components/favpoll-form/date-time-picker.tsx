"use client"

import { useState } from "react"
import { CalendarIcon, Clock2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import {
  ResponsiveOverlay,
  useIsMobile,
} from "@/components/ui/responsive-overlay"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { type PickerSize, INPUT_SIZE } from "./constants"

export function DateTimePicker({
  value,
  onChange,
  size = "md",
  presets,
}: {
  value: Date | undefined
  onChange: (d: Date) => void
  size?: PickerSize
  /** Optional chip column inside the calendar popover — {label, days from now}. A preset keeps the chosen time; the popover stays open so the pick can be seen on the calendar. */
  presets?: { label: string; days: number }[]
}) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>(() => value ?? new Date())
  // Popover on desktop, bottom sheet on mobile (overlay review,
  // 2026-09-15): an anchored calendar is cramped on a phone.
  const isMobile = useIsMobile()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) setMonth(value ?? new Date())
  }

  const dateStr = value
    ? value.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Pick a close date"

  // No date, no time (founder, 2026-09-06): a blank picker showing
  // 23:59 read as a value already chosen. Empty renders the native
  // --:-- state; typing a time first still works (handleTimeChange
  // bases it on today), and 23:59 remains the default the moment a
  // date arrives via preset or calendar.
  const timeStr = value
    ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
    : ""

  function handlePreset(days: number) {
    const base =
      value ??
      (() => {
        const d = new Date()
        d.setHours(23, 59, 0, 0)
        return d
      })()
    const next = new Date()
    next.setDate(next.getDate() + days)
    next.setHours(base.getHours(), base.getMinutes(), 0, 0)
    onChange(next)
    setMonth(next)
  }

  function handleDaySelect(d: Date | undefined) {
    if (!d) return
    const next = value ? new Date(value) : new Date()
    next.setFullYear(d.getFullYear(), d.getMonth(), d.getDate())
    onChange(next)
    setOpen(false)
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [h, m] = e.target.value.split(":").map(Number)
    const next = value ? new Date(value) : new Date()
    next.setHours(h ?? 23, m ?? 59, 0, 0)
    onChange(next)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const trigger = (
    <Button
      type="button"
      variant="outline"
      onClick={isMobile ? () => handleOpenChange(true) : undefined}
      className={cn(
        // FIXED at 175px (founder, 2026-09-06): date 175 + gap 8 +
        // time 128 = 311 — the popover's measured natural width —
        // so the PAIR spans exactly the dropdown, in any context,
        // whatever the value. flex-1 made the width depend on the
        // container (wizard stretched) or the text (appeal drifted
        // once a date was picked).
        "w-[175px] min-w-0 shrink-0 cursor-pointer justify-start gap-2 bg-background! font-normal",
        INPUT_SIZE[size],
        !value && "text-muted-foreground"
      )}
    >
      <CalendarIcon
        className="h-4 w-4 shrink-0 text-muted-foreground/50"
        aria-hidden
      />
      <span className={cn(!value && "text-muted-foreground/50")}>
        {dateStr}
      </span>
    </Button>
  )

  const calendar = (
    <Calendar
      mode="single"
      captionLayout="dropdown"
      selected={value}
      month={month}
      onMonthChange={setMonth}
      startMonth={today}
      endMonth={new Date(new Date().getFullYear() + 5, 11)}
      disabled={{ before: today }}
      onSelect={handleDaySelect}
      className="p-0"
    />
  )

  const presetButtons = (className: string) =>
    presets && (
      <div className={className}>
        {presets.map((p) => (
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
    )

  return (
    <div className="flex gap-2">
      {/* Date picker: popover on desktop; bottom sheet on mobile — a
          day tap picks and closes (the single-select grammar); a preset
          keeps it open so the pick lands visibly on the calendar, and
          the × dismisses. */}
      {isMobile ? (
        <>
          {trigger}
          <ResponsiveOverlay
            open={open}
            onOpenChange={handleOpenChange}
            title="Close date"
            bodyClassName="flex items-start justify-center gap-3 px-4 pt-1 pb-4"
          >
            {calendar}
            {/* One preset column on narrow phones; two from 420px —
                covers both Pro Max generations (428pt and 430pt) */}
            {presetButtons(
              "grid shrink-0 grid-cols-1 gap-1.5 min-[420px]:grid-cols-2"
            )}
          </ResponsiveOverlay>
        </>
      ) : (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Card size="sm" className="w-fit shadow-none ring-0">
              <CardContent className={presets ? "flex gap-3" : undefined}>
                {calendar}
                {presetButtons("flex flex-col gap-1.5")}
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      )}

      {/* Time picker */}
      <InputGroup className={cn(INPUT_SIZE[size], "w-32 bg-background")}>
        <InputGroupInput
          type="time"
          step="60"
          value={timeStr}
          onChange={handleTimeChange}
          className="appearance-none tabular-nums [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
        <InputGroupAddon align="inline-end">
          <Clock2Icon className="h-4 w-4 text-muted-foreground/50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
