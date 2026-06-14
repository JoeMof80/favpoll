"use client"

import { useEffect, useState } from "react"
import type { FavpollCardSize } from "@/components/favpoll-card/types"

const PLACEHOLDER_PARTS = ["days", "hrs", "min", "sec"] as const

type Props = {
  closesAt?: string
  size?: FavpollCardSize
  variant?: "stacked" | "inline"
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

export function Countdown({
  closesAt,
  size = "md",
  variant = "inline",
}: Props) {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null)

  useEffect(() => {
    if (!closesAt) return
    setTimeLeft(getTimeLeft(closesAt))
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(closesAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [closesAt])

  if (!closesAt) {
    const inlineValueClass =
      size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-xl"
    const inlineLabelClass =
      size === "lg" ? "text-sm" : size === "md" ? "text-xs" : "text-[10px]"
    const inlineHeadingClass =
      size === "lg" ? "text-xs" : size === "md" ? "text-[10px]" : "text-[10px]"
    if (variant === "inline") {
      return (
        <div>
          <p
            className={`mb-2 ${inlineHeadingClass} font-medium text-[#7F77DD]`}
          >
            Poll closes in
          </p>
          <div className="flex flex-wrap items-baseline justify-between gap-y-1">
            {PLACEHOLDER_PARTS.map((label) => (
              <span key={label} className="tabular-nums">
                <span
                  className={`${inlineValueClass} leading-none font-medium text-muted-foreground`}
                >
                  --
                </span>
                <span
                  className={`ml-1 ${inlineLabelClass} text-muted-foreground`}
                >
                  {label}
                </span>
              </span>
            ))}
          </div>
        </div>
      )
    }
    const valueClass =
      size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs"
    const labelClass = size === "sm" ? "text-[10px]" : "text-xs"
    return (
      <div>
        <p className={`mb-2 ${labelClass} text-muted-foreground`}>
          Poll closes in
        </p>
        <div className="flex items-end justify-between">
          {PLACEHOLDER_PARTS.map((label) => (
            <div key={label} className="text-center">
              <p
                className={`${valueClass} leading-none font-medium text-muted-foreground tabular-nums`}
              >
                --
              </p>
              <p className={`mt-1 ${labelClass} text-muted-foreground`}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

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

  if (variant === "inline") {
    const inlineValueClass =
      size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-xl"
    const inlineLabelClass =
      size === "lg" ? "text-sm" : size === "md" ? "text-xs" : "text-[10px]"
    const inlineHeadingClass =
      size === "lg" ? "text-xs" : size === "md" ? "text-[10px]" : "text-[10px]"
    return (
      <div aria-live="off">
        <p className={`mb-2 ${inlineHeadingClass} font-medium text-[#7F77DD]`}>
          Poll closes in
        </p>
        <div
          className="flex flex-wrap items-baseline justify-between gap-y-1"
          aria-label={`${days} days ${hours} hours ${minutes} minutes remaining`}
        >
          {parts.map(({ value, label }) => (
            <span key={label} className="tabular-nums">
              <span
                className={`${inlineValueClass} leading-none font-medium text-foreground`}
              >
                {String(value).padStart(2, "0")}
              </span>
              <span
                className={`ml-1 ${inlineLabelClass} text-muted-foreground`}
              >
                {label}
              </span>
            </span>
          ))}
        </div>
      </div>
    )
  }

  const valueClass =
    size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs"
  const labelClass = size === "sm" ? "text-[10px]" : "text-xs"

  return (
    <div aria-live="off">
      <p className={`mb-2 ${labelClass} text-muted-foreground`}>
        Poll closes in
      </p>
      <div
        className="flex items-end justify-between"
        aria-label={`${days} days ${hours} hours ${minutes} minutes remaining`}
      >
        {parts.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p
              className={`${valueClass} leading-none font-medium text-foreground tabular-nums`}
            >
              {String(value).padStart(2, "0")}
            </p>
            <p className={`mt-1 ${labelClass} text-muted-foreground`}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
