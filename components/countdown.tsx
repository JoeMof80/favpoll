"use client"

import { useEffect, useState } from "react"

type Props = {
  closesAt: string
}

function getTimeLeft(closesAt: string) {
  const diff = new Date(closesAt).getTime() - Date.now()
  if (diff <= 0) return null

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}

export function Countdown({ closesAt }: Props) {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null)

  useEffect(() => {
    setTimeLeft(getTimeLeft(closesAt))
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(closesAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [closesAt])

  if (!timeLeft) return null

  const { days, hours, minutes, seconds } = timeLeft

  const parts =
    days > 0
      ? [
          { value: days, label: days === 1 ? "day" : "days" },
          { value: hours, label: hours === 1 ? "hr" : "hrs" },
          { value: minutes, label: "min" },
          { value: seconds, label: "sec" },
        ]
      : hours > 0
        ? [
            { value: hours, label: hours === 1 ? "hr" : "hrs" },
            { value: minutes, label: "min" },
            { value: seconds, label: "sec" },
          ]
        : [
            { value: minutes, label: "min" },
            { value: seconds, label: "sec" },
          ]

  return (
    <div
      className="rounded-lg border border-border bg-card px-5 py-4"
      aria-live="off"
    >
      <p className="mb-2 text-xs text-muted-foreground">Poll closes in</p>
      <div
        className="flex items-end gap-3"
        aria-label={`${days} days ${hours} hours ${minutes} minutes remaining`}
      >
        {parts.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-2xl leading-none font-medium text-foreground tabular-nums">
              {String(value).padStart(2, "0")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
