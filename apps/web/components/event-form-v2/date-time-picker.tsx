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
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full cursor-pointer justify-start gap-2 font-normal hover:bg-background",
            INPUT_SIZE[size],
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon
            className="h-4 w-4 shrink-0 text-muted-foreground/50 opacity-50"
            aria-hidden
          />
          <span
            className={cn(
              "flex-1 text-left",
              !value && "text-muted-foreground/50"
            )}
          >
            {dateStr}
          </span>
          <span
            className={cn(
              "shrink-0 tabular-nums",
              !value ? "text-muted-foreground/50" : "text-muted-foreground"
            )}
          >
            {timeStr}
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
          <CardFooter className="bg-card">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="v2-closes-time">Time</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="v2-closes-time"
                    type="time"
                    step="60"
                    value={timeStr}
                    onChange={handleTimeChange}
                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                  <InputGroupAddon align="inline-end">
                    <Clock2Icon className="text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </FieldGroup>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
