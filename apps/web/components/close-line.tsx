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

/** "4 days to go" · "3 hrs 12 mins to go" · "12 mins 30 secs to go". */
export function timeToGo(ms: number): string {
  if (ms <= 0) return "Closing"
  const unit = (n: number, one: string, many: string) =>
    `${n} ${n === 1 ? one : many}`
  if (ms >= DAY) return `${unit(Math.floor(ms / DAY), "day", "days")} to go`
  if (ms >= HOUR) {
    const h = Math.floor(ms / HOUR)
    const m = Math.floor((ms % HOUR) / MINUTE)
    return `${unit(h, "hr", "hrs")} ${unit(m, "min", "mins")} to go`
  }
  const m = Math.floor(ms / MINUTE)
  const s = Math.floor((ms % MINUTE) / 1000)
  return `${unit(m, "min", "mins")} ${unit(s, "sec", "secs")} to go`
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

/** Ticks once a second only inside the last hour, once a minute on the
 *  last day, and not at all while there are days to go — the rail should
 *  not restlessly re-render for a figure that cannot change. */
export function useTimeLeft(closesAt: string | null | undefined) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    if (!closesAt) return
    setNow(Date.now())
    const end = new Date(closesAt).getTime()
    const left = end - Date.now()
    const every = left < HOUR ? 1000 : left < DAY ? MINUTE : HOUR
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
