"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

type Urgency = "normal" | "warning" | "urgent" | "closed"

type TimeLeft = {
  label: string
  urgency: Urgency
}

function getTimeLeft(closesAt: string): TimeLeft {
  const diff = new Date(closesAt).getTime() - Date.now()
  if (diff <= 0) return { label: "Poll closed", urgency: "closed" }

  const totalMinutes = diff / (1000 * 60)
  const totalHours = diff / (1000 * 60 * 60)
  const totalDays = diff / (1000 * 60 * 60 * 24)

  if (totalMinutes < 60) {
    const mins = Math.floor(totalMinutes)
    return {
      label: mins <= 1 ? "a few minutes" : `${mins} minutes`,
      urgency: "urgent",
    }
  }

  if (totalHours < 24) {
    const hrs = Math.floor(totalHours)
    return {
      label: `${hrs} ${hrs === 1 ? "hour" : "hours"}`,
      urgency: "urgent",
    }
  }

  if (totalDays < 3) {
    const hrs = Math.floor(totalHours)
    return {
      label: `${hrs} hours`,
      urgency: "warning",
    }
  }

  const days = Math.floor(totalDays)
  return {
    label: `${days} days`,
    urgency: "normal",
  }
}

const urgencyClass: Record<Urgency, string> = {
  normal: "text-foreground",
  warning: "text-amber-600 dark:text-amber-400",
  urgent: "text-red-600 dark:text-red-400",
  closed: "text-muted-foreground",
}

type Props = {
  closesAt: string
  className?: string
}

export function ClosingLabel({ closesAt, className }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(closesAt)
  )

  useEffect(() => {
    setTimeLeft(getTimeLeft(closesAt))
    const interval = setInterval(
      () => setTimeLeft(getTimeLeft(closesAt)),
      60_000
    )
    return () => clearInterval(interval)
  }, [closesAt])

  const closed = timeLeft.urgency === "closed"

  return (
    <div
      className={cn("flex items-baseline gap-1.5", className)}
      aria-live="off"
    >
      {!closed && <Clock size={10} aria-hidden="true" />}
      <span
        className={cn(
          "text-xs font-semibold tabular-nums",
          urgencyClass[timeLeft.urgency]
        )}
      >
        {timeLeft.label}
      </span>
    </div>
  )
}
