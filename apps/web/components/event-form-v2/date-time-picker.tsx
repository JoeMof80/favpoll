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

// Matches the natural rendered width of the calendar popover:
// 7 day columns × 28px (--cell-size = --spacing(7)) + CardContent px-3 (12px × 2)
const CALENDAR_WIDTH = 220

export function DateTimePicker({
  value,
  onChange,
  size = "md",
}: {
  value: Date | undefined
  onChange: (d: Date) => void
  size?: PickerSize
}) {
  const [open, setOpen] = useState(false)

  const dateStr = value
    ? value.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Pick a close date"

  const timeStr = value
    ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
    : "23:59"

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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            style={{ width: CALENDAR_WIDTH }}
            className={cn(
              "cursor-pointer justify-start gap-2 bg-background! font-normal",
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
        <PopoverContent className="w-auto p-0" align="start">
          <Card size="sm" className="w-fit shadow-none ring-0">
            <CardContent>
              <Calendar
                mode="single"
                captionLayout="dropdown"
                selected={value}
                defaultMonth={value ?? today}
                startMonth={today}
                endMonth={new Date(new Date().getFullYear() + 5, 11)}
                disabled={{ before: today }}
                onSelect={handleDaySelect}
                className="p-0"
              />
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
