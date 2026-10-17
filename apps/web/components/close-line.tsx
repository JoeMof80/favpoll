"use client"

import { useEffect, useState } from "react"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { heroNameSizeClass } from "@/lib/display"

// SAY WHEN, NOT HOW LONG (founder, 2026-10-17: "i've not been satisfied
// with the countdown design for some time"). The four-column clock was a
// flash-sale idiom — "hurry" every second, wrong for a memorial and noise
// at four days out. The close is a DATE now, in the hero's own grammar:
// eyebrow "Poll closes", the date where the name stands, the time to go
// as the context line. It escalates only as it should: days while there
// are days, hours and minutes on the last day, seconds in the last hour.
// For most of a favpoll's life the rail is calm.

const DAY = 86_400_000
const HOUR = 3_600_000
const MINUTE = 60_000

const unit = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`

/** THE COUNTDOWN'S THREE UNITS as a sentence — "4 days 13 hrs 9 mins to
 *  go" while there are days, "3 hrs 12 mins 30 secs to go" on the last
 *  day, "12 mins 30 secs to go" in the last hour (the card's own rule:
 *  seconds are noise while days remain). */
export function timeToGo(ms: number): string {
  if (ms <= 0) return "Closing"
  const d = Math.floor(ms / DAY)
  const h = Math.floor((ms % DAY) / HOUR)
  const m = Math.floor((ms % HOUR) / MINUTE)
  const s = Math.floor((ms % MINUTE) / 1000)
  if (d > 0)
    return `${unit(d, "day", "days")} ${unit(h, "hr", "hrs")} ${unit(m, "min", "mins")} to go`
  if (h > 0)
    return `${unit(h, "hr", "hrs")} ${unit(m, "min", "mins")} ${unit(s, "sec", "secs")} to go`
  return `${unit(m, "min", "mins")} ${unit(s, "sec", "secs")} to go`
}

/** THE LEADING UNIT, for the ring's centre: "4" over "days", then hours,
 *  then minutes, and in the last hour the seconds ticking in the middle
 *  of the dial — the telethon's drama exactly when it is earned. */
export function leadingUnit(ms: number): { value: string; label: string } {
  if (ms <= 0) return { value: "0", label: "secs" }
  if (ms >= DAY) {
    const d = Math.floor(ms / DAY)
    return { value: String(d), label: d === 1 ? "day" : "days" }
  }
  if (ms >= HOUR) {
    const h = Math.floor(ms / HOUR)
    return { value: String(h), label: h === 1 ? "hr" : "hrs" }
  }
  if (ms >= MINUTE) {
    const m = Math.floor(ms / MINUTE)
    return { value: String(m), label: m === 1 ? "min" : "mins" }
  }
  const s = Math.floor(ms / 1000)
  return { value: String(s), label: s === 1 ? "sec" : "secs" }
}

/** "Tue 21 Oct" and "6pm" (or "6.30pm"), the close as a guest says it. */
export function closeWhen(closesAt: string): { date: string; time: string } {
  const d = new Date(closesAt)
  const date = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d)
  const h24 = d.getHours()
  const mins = d.getMinutes()
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  const time = `${h12}${mins ? `.${String(mins).padStart(2, "0")}` : ""}${h24 < 12 ? "am" : "pm"}`
  return { date, time }
}

/** Ticks once a second inside the last hour and once a minute before it
 *  — the sentence shows minutes, so a minute is the finest it can change
 *  until the seconds arrive. */
export function useTimeLeft(closesAt: string | null | undefined) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    if (!closesAt) return
    setNow(Date.now())
    const end = new Date(closesAt).getTime()
    const left = end - Date.now()
    const every = left < HOUR ? 1000 : MINUTE
    const id = setInterval(() => setNow(Date.now()), every)
    return () => clearInterval(id)
  }, [closesAt])
  if (!closesAt || now === null) return null
  return new Date(closesAt).getTime() - now
}

/** The rail's close card, in the hero's grammar. */
export function CloseLine({
  closesAt,
  compact = false,
}: {
  closesAt: string
  compact?: boolean
}) {
  const left = useTimeLeft(closesAt)
  const { date, time } = closeWhen(closesAt)
  return (
    <div aria-live="off">
      <SectionEyebrow
        variant="muted"
        className="mb-2 flex h-8 items-center truncate wrap-break-word"
      >
        Poll closes
      </SectionEyebrow>
      <p
        className={`${heroNameSizeClass(date, compact)} leading-tight font-medium tracking-tight text-foreground transition-[font-size] duration-300 ease-out motion-reduce:transition-none`}
      >
        {date}
      </p>
      <p
        className={`mt-4 truncate text-xl font-normal text-primary tabular-nums transition-[font-size] duration-300 ease-out motion-reduce:transition-none ${compact ? "" : "shell:text-2xl"}`}
      >
        {left === null ? " " : timeToGo(left)}
        <span className="text-primary/70"> · {time}</span>
      </p>
    </div>
  )
}
