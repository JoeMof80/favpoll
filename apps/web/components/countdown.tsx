"use client"

import { useEffect, useState } from "react"
import type { FavpollCardSize } from "@/components/favpoll-card/types"

// Four, matching the live maximum below. Keep this in step with the
// inline `parts` or the card reflows the moment the countdown mounts.
// The trailing seconds takes half a column — see `columns` below.
type Part = { value?: number; label: string; half?: boolean }

const PLACEHOLDER_PARTS: readonly Part[] = [
  { label: "days" },
  { label: "hrs" },
  { label: "min" },
  { label: "sec", half: true },
]

// The seconds unit gets HALF A COLUMN (founder, 2026-09-23). Every
// figure keeps its full size. Note that an fr track's minimum is
// min-content, so this track will not shrink below the figure it holds:
// it asks for half and settles for whatever the number needs.
const columns = (parts: readonly Part[]) =>
  parts.map((p) => (p.half ? "0.5fr" : "1fr")).join(" ")

type Props = {
  closesAt?: string
  size?: FavpollCardSize
  /**
   * "subtitle" renders one line in the hero subtitle's type (the
   * "1942 – 2025" ramp) — the live display's money block uses it so the
   * countdown sits where the hero's dates line sits.
   */
  variant?: "stacked" | "inline" | "subtitle"
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
            className={`mb-2 ${inlineHeadingClass} font-medium text-primary-muted`}
          >
            Poll closes in
          </p>
          <div
            className="grid items-baseline gap-x-3"
            style={{ gridTemplateColumns: columns(PLACEHOLDER_PARTS) }}
          >
            {PLACEHOLDER_PARTS.map(({ label }, i) => (
              <span
                key={label}
                className={`tabular-nums ${
                  i === PLACEHOLDER_PARTS.length - 1 ? "text-right" : ""
                }`}
              >
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
          {/* The stacked variant keeps the three-unit rule, so it drops
              the inline row's trailing half-column seconds. */}
          {PLACEHOLDER_PARTS.filter((part) => !part.half).map(({ label }) => (
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

  if (variant === "subtitle") {
    const subtitleParts: [number, string][] =
      days > 0
        ? [
            [days, days === 1 ? "day" : "days"],
            [hours, hours === 1 ? "hr" : "hrs"],
            [minutes, "min"],
          ]
        : hours > 0
          ? [
              [hours, hours === 1 ? "hr" : "hrs"],
              [minutes, "min"],
              [seconds, "sec"],
            ]
          : [
              [minutes, "min"],
              [seconds, "sec"],
            ]
    return (
      <p
        aria-live="off"
        aria-label={`${days} days ${hours} hours ${minutes} minutes remaining`}
        className="truncate text-xl font-normal whitespace-normal text-primary tabular-nums md:text-2xl"
      >
        {/* Figures keep the subtitle size; the prefix and unit labels
            step down (size + 70% ink) so the numbers carry the line —
            the inline variant's value/label hierarchy, in this type. */}
        <span className="text-sm text-primary/70 md:text-base">Closes in</span>
        {/* ml-3 between components (wider than the intra-group space)
            so each figure+unit reads as one unit of time */}
        {subtitleParts.map(([value, label]) => (
          <span key={label} className="ml-3">
            {value}
            <span className="text-sm text-primary/70 md:text-base">
              {" "}
              {label}
            </span>
          </span>
        ))}
      </p>
    )
  }

  // AT MOST THREE UNITS, the subtitle variant's own rule (founder,
  // 2026-09-14: four segments wrapped at 3-digit days): seconds are
  // noise while days remain and return for the last-day drama once
  // the days unit drops away.
  const parts =
    days > 0
      ? [
          { value: days, label: days === 1 ? "day" : "days" },
          { value: hours, label: hours === 1 ? "hr" : "hrs" },
          { value: minutes, label: "min" },
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
    // Seconds ride along even while days remain (founder, 2026-09-23,
    // revising the 2026-09-14 three-unit rule for this card), taking
    // half a column. `parts` itself is untouched, so the stacked variant
    // keeps three.
    //
    // Only this appended copy takes a half column. Once the days unit
    // drops away seconds become the last-day drama and arrive through
    // `parts` as a full unit, exactly as before.
    const inlineParts: Part[] =
      days > 0
        ? [...parts, { value: seconds, label: "sec", half: true }]
        : parts
    const inlineValueClass =
      size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-xl"
    const inlineLabelClass =
      size === "lg" ? "text-sm" : size === "md" ? "text-xs" : "text-[10px]"
    const inlineHeadingClass =
      size === "lg" ? "text-xs" : size === "md" ? "text-[10px]" : "text-[10px]"
    return (
      <div aria-live="off">
        <p
          className={`mb-2 ${inlineHeadingClass} font-medium text-primary-muted`}
        >
          Poll closes in
        </p>
        <div
          className="grid items-baseline gap-x-3"
          style={{
            gridTemplateColumns: columns(inlineParts),
          }}
          // Seconds stay OUT of the label: aria-live is off, so this is
          // read on demand, and a value that changes every second makes
          // for a restless accessible name.
          aria-label={`${days} days ${hours} hours ${minutes} minutes remaining`}
        >
          {inlineParts.map(({ value, label }, i) => (
            <span
              key={label}
              className={`tabular-nums ${
                // Last column hugs the right edge, so the row still spans
                // the card the way justify-between used to.
                i === inlineParts.length - 1 ? "text-right" : ""
              }`}
            >
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
