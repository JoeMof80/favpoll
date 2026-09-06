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

  return (
    <div className="flex gap-2">
      {/* Date picker */}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "min-w-0 flex-1 cursor-pointer justify-start gap-2 bg-background! font-normal",
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
        </PopoverTrigger>
        {/* Width follows the trigger (measured 2026-09-06: content's
            natural width is ~311px, the trigger ~330 — the button used
            to jut past the popover's edge). The Radix var makes the
            edges align by construction; min-w-fit guards the narrow-
            trigger case (phones), where content width wins. */}
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-fit p-0"
          align="start"
        >
          <Card size="sm" className="w-full shadow-none ring-0">
            <CardContent
              className={presets ? "flex justify-between gap-3" : undefined}
            >
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
              {presets && (
                <div className="flex flex-col gap-1.5">
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
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

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
