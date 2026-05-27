"use client"

import { useState } from "react"
import { CalendarIcon, Clock2Icon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type DateTimePickerProps = {
  id: string
  label: string
  date: string // "YYYY-MM-DD" or ""
  time: string // "HH:MM" or ""
  onDateChange: (v: string) => void
  onTimeChange: (v: string) => void
  optional?: boolean
  minDate?: string // "YYYY-MM-DD"
  disabled?: boolean
}

function DateTimePicker({
  id,
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
  optional,
  minDate,
  disabled,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)

  const selected = date ? new Date(date + "T12:00:00") : undefined
  const minDateObj = minDate ? new Date(minDate + "T00:00:00") : undefined

  const displayDate = date
    ? new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Pick a date"

  return (
    <div>
      <SectionEyebrow variant="muted" className="mb-2 font-semibold">
        {label}
        {optional && (
          <span className="ml-1 font-normal tracking-normal normal-case">
            (optional)
          </span>
        )}
      </SectionEyebrow>
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={`w-full justify-start gap-2 font-normal ${
              !date ? "text-muted-foreground" : ""
            }`}
          >
            <CalendarIcon
              className="h-4 w-4 shrink-0 opacity-50"
              aria-hidden="true"
            />
            <span className="flex-1 text-left">{displayDate}</span>
            {time && (
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {time}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Card size="sm" className="w-fit shadow-none ring-0">
            <CardContent>
              <Calendar
                mode="single"
                captionLayout="dropdown"
                selected={selected}
                defaultMonth={selected ?? minDateObj ?? new Date()}
                startMonth={minDateObj ?? new Date(2020, 0)}
                endMonth={new Date(new Date().getFullYear() + 5, 11)}
                disabled={minDateObj ? { before: minDateObj } : undefined}
                onSelect={(d) => {
                  if (d) {
                    const y = d.getFullYear()
                    const m = String(d.getMonth() + 1).padStart(2, "0")
                    const day = String(d.getDate()).padStart(2, "0")
                    onDateChange(`${y}-${m}-${day}`)
                  }
                }}
                className="p-0"
              />
            </CardContent>
            <CardFooter className="bg-card">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${id}-time`}>Time</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={`${id}-time`}
                      type="time"
                      step="60"
                      value={time}
                      onChange={(e) => onTimeChange(e.target.value)}
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
    </div>
  )
}

function splitDateTime(value: string): { date: string; time: string } {
  if (!value) return { date: "", time: "" }
  const [date, time = ""] = value.split("T")
  return { date, time: time.slice(0, 5) }
}

function joinDateTime(date: string, time: string): string {
  if (!date) return ""
  return time ? `${date}T${time}` : `${date}T00:00`
}

type Props = {
  closesAt: string
  onClosesAtChange: (v: string) => void
  extensionCount?: number
  hardCloseAt?: string | null
  eventId?: string
}

export function ClosingDate({
  closesAt,
  onClosesAtChange,
  extensionCount = 0,
  hardCloseAt,
  eventId,
}: Props) {
  const { date: closingDate, time: closingTime } = splitDateTime(closesAt)
  const today = new Date().toISOString().slice(0, 10)
  const hardCloseDate = hardCloseAt
    ? new Date(hardCloseAt).toISOString().slice(0, 10)
    : undefined

  const [message, setMessage] = useState("")
  const [requestState, setRequestState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle")

  const isBlocked = extensionCount >= 2

  async function handleRequestExtension() {
    if (!eventId || !message.trim()) return
    setRequestState("sending")
    try {
      const res = await fetch(`/api/events/${eventId}/request-extension`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      if (!res.ok) throw new Error()
      setRequestState("sent")
    } catch {
      setRequestState("error")
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card px-5 py-4">
      <DateTimePicker
        id="closes-at"
        label="Favpoll closes"
        date={closingDate}
        time={closingTime}
        onDateChange={(d) => onClosesAtChange(joinDateTime(d, closingTime))}
        onTimeChange={(t) => onClosesAtChange(joinDateTime(closingDate, t))}
        minDate={today}
        disabled={isBlocked}
      />

      {extensionCount === 1 && (
        <p className="text-xs text-muted-foreground">
          One extension remaining after this.
        </p>
      )}

      {isBlocked && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {"You've used both free extensions. "}
            {hardCloseAt && (
              <>
                Hard close:{" "}
                {new Date(hardCloseAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                .{" "}
              </>
            )}
            Contact us below to request more time.
          </p>

          {requestState === "sent" ? (
            <p className="text-xs text-muted-foreground">
              Request sent. {"We'll"} be in touch.
            </p>
          ) : (
            <>
              <Textarea
                placeholder="Why do you need more time?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="text-sm"
                disabled={requestState === "sending"}
              />
              {requestState === "error" && (
                <p className="text-xs text-destructive">
                  Something went wrong. Please try again.
                </p>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full"
                disabled={!message.trim() || requestState === "sending"}
                onClick={handleRequestExtension}
              >
                {requestState === "sending" ? "Sending…" : "Request extension"}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
