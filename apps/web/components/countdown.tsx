"use client"

import { useEffect, useState } from "react"
import type { FavpollCardSize } from "@/components/favpoll-card/types"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

// Four, matching the live maximum below. Keep this in step with the
// inline `parts` or the card reflows the moment the countdown mounts.
// The trailing seconds takes half a column — see `columns` below.
type Part = {
  value?: number
  label: string
  half?: boolean
  /** Hero scale: a leading unit already at zero, kept in its column and
   *  muted rather than dropped. */
  spent?: boolean
}

const PLACEHOLDER_PARTS: readonly Part[] = [
  { label: "days" },
  { label: "hrs" },
  { label: "mins" },
  { label: "secs", half: true },
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
  variant?: "stacked" | "inline" | "subtitle" | "bar" | "banner"
  /** The countdown at rest, zeroed and muted: the rail's closed card
   *  keeps the shape of the open one (founder, 2026-09-30: "mirror the
   *  shape of the countdown but with something to indicate the
   *  countdown has ended"). Inline only; no heading — the caller's
   *  eyebrow says "Poll closed". */
  ended?: boolean
  /** Subtitle variant: the hero's context steps down with the rail's
   *  expand (lg:text-2xl → text-xl); so does this line. Hero scale:
   *  the figures step as the name does. */
  compact?: boolean
  /** THE HERO'S OWN GRAMMAR for the inline card (founder, 2026-10-17:
   *  "match the style of the countdown to the Opening Line and Name"):
   *  the eyebrow in its h-8 row, the figures in the name's type and on
   *  its ramp, the units a step up — the rail's countdown reading as the
   *  hero's twin across the aisle, as the goal card does on the dial. */
  scale?: "rail" | "hero"
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
  ended = false,
  compact = false,
  scale = "rail",
}: Props) {
  const hero = scale === "hero"
  const eyebrowClass = hero
    ? "mb-2 flex h-8 items-center truncate wrap-break-word"
    : "mb-2 font-semibold"
  // The figures at the CONTEXT line's weight, not the name's (founder,
  // 2026-10-17: "i like the balance between the name and countdown but
  // the countdown is far too dominant. it isn't that important"): the
  // eyebrow still sits on the hero's eyebrow line and the figures on the
  // name's line, but at text-xl → 2xl, stepping with the column.
  const heroValueClass = `text-xl leading-tight font-medium transition-[font-size] duration-300 ease-out motion-reduce:transition-none ${compact ? "" : "shell:text-2xl"}`
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null)

  useEffect(() => {
    if (!closesAt) return
    setTimeLeft(getTimeLeft(closesAt))
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(closesAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [closesAt])

  // The bar has no placeholder: a favpoll without a close has no row.
  if ((variant === "bar" || variant === "banner") && (!closesAt || !timeLeft))
    return null

  if (ended) {
    const valueCls =
      size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-xl"
    const labelCls =
      size === "lg" ? "text-sm" : size === "md" ? "text-xs" : "text-[10px]"
    return (
      <div
        className="grid items-baseline gap-x-3"
        style={{ gridTemplateColumns: columns(PLACEHOLDER_PARTS) }}
        aria-label="The poll has closed"
      >
        {PLACEHOLDER_PARTS.map(({ label, half }) => (
          <span
            key={label}
            className={`tabular-nums ${half ? "text-right" : ""}`}
          >
            {/* Quieter than muted (founder, 2026-09-30: "mute the 00 00
                00 00") — the shape stays, the figures step back. */}
            <span
              className={`${valueCls} leading-none font-medium text-muted-foreground/50`}
            >
              00
            </span>
            <span className={`ml-1 ${labelCls} text-muted-foreground/50`}>
              {label}
            </span>
          </span>
        ))}
      </div>
    )
  }

  if (!closesAt) {
    const inlineValueClass = hero
      ? heroValueClass
      : size === "lg"
        ? "text-3xl leading-none"
        : size === "md"
          ? "text-2xl leading-none"
          : "text-xl leading-none"
    const inlineLabelClass = hero
      ? "text-xs"
      : size === "lg"
        ? "text-sm"
        : size === "md"
          ? "text-xs"
          : "text-[10px]"
    if (variant === "inline") {
      return (
        <div>
          <SectionEyebrow variant="muted" className={eyebrowClass}>
            Poll closes in
          </SectionEyebrow>
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
                <span className={hero ? "flex flex-col items-center" : ""}>
                  <span
                    className={`${inlineValueClass} font-medium text-muted-foreground`}
                  >
                    --
                  </span>
                  <span
                    className={`${hero ? "mt-1" : "ml-1"} ${inlineLabelClass} text-muted-foreground`}
                  >
                    {label}
                  </span>
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
        <SectionEyebrow variant="muted" className="mb-2 font-semibold">
          Poll closes in
        </SectionEyebrow>
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
        className={`truncate text-xl font-normal whitespace-normal text-primary tabular-nums transition-[font-size] duration-300 ease-out motion-reduce:transition-none ${compact ? "" : "shell:text-2xl"}`}
      >
        {/* Figures keep the subtitle size; the prefix and unit labels
            step down (size + 70% ink) so the numbers carry the line —
            the inline variant's value/label hierarchy, in this type. */}
        <span
          className={`text-sm text-primary/70 ${compact ? "" : "shell:text-base"}`}
        >
          Closes in
        </span>
        {/* ml-3 between components (wider than the intra-group space)
            so each figure+unit reads as one unit of time */}
        {subtitleParts.map(([value, label]) => (
          <span key={label} className="ml-3">
            {value}
            <span
              className={`text-sm text-primary/70 ${compact ? "" : "shell:text-base"}`}
            >
              {" "}
              {label}
            </span>
          </span>
        ))}
      </p>
    )
  }

  // EVERY UNIT PLURALISES THE SAME WAY — day/days, hr/hrs, min/mins,
  // sec/secs, singular only at exactly one. "min" and "sec" had been
  // written as invariant abbreviations beside a varying "hrs" (founder,
  // 2026-10-17: "why are some labels plural and some not?").
  // AT MOST THREE UNITS, the subtitle variant's own rule (founder,
  // 2026-09-14: four segments wrapped at 3-digit days): seconds are
  // noise while days remain and return for the last-day drama once
  // the days unit drops away.
  const parts =
    days > 0
      ? [
          { value: days, label: days === 1 ? "day" : "days" },
          { value: hours, label: hours === 1 ? "hr" : "hrs" },
          { value: minutes, label: minutes === 1 ? "min" : "mins" },
        ]
      : hours > 0
        ? [
            { value: hours, label: hours === 1 ? "hr" : "hrs" },
            { value: minutes, label: minutes === 1 ? "min" : "mins" },
            { value: seconds, label: seconds === 1 ? "sec" : "secs" },
          ]
        : [
            { value: minutes, label: minutes === 1 ? "min" : "mins" },
            { value: seconds, label: seconds === 1 ? "sec" : "secs" },
          ]

  if (variant === "banner") {
    // THE MICRO BANNER's line (founder, 2026-10-16): one short sentence
    // in the band's ink, at most three units as the subtitle rule has it,
    // tightening to hours and minutes inside the last day.
    return (
      <p
        aria-live="off"
        aria-label={`${days} days ${hours} hours ${minutes} minutes remaining`}
        className="truncate tabular-nums"
      >
        Closes in
        {parts.map(({ value, label }) => (
          <span key={label} className="ml-1.5 font-medium text-foreground">
            {value}
            <span className="font-normal text-muted-foreground"> {label}</span>
          </span>
        ))}
      </p>
    )
  }

  if (variant === "bar") {
    // ONE SMALL LINE for the mobile identity bar's state strip (founder,
    // 2026-09-29: the countdown "above the Name and photo, on its own
    // row" — then "creates clutter" as a third line of caps, so it is
    // sentence case at text-xs, figures carrying the line and units
    // stepped back, the card's own hierarchy). Seconds ride along as on
    // the card (founder: "no reason not to restore seconds").
    const barParts =
      days > 0
        ? [...parts, { value: seconds, label: seconds === 1 ? "sec" : "secs" }]
        : parts
    return (
      <p
        aria-live="off"
        aria-label={`${days} days ${hours} hours ${minutes} minutes remaining`}
        className="truncate text-xs text-muted-foreground tabular-nums"
      >
        Closes in
        {barParts.map(({ value, label }) => (
          <span key={label} className="ml-2 font-medium text-foreground">
            {value}
            <span className="font-normal text-muted-foreground"> {label}</span>
          </span>
        ))}
      </p>
    )
  }

  if (variant === "inline") {
    // Seconds ride along even while days remain (founder, 2026-09-23,
    // revising the 2026-09-14 three-unit rule for this card), taking
    // half a column. `parts` itself is untouched, so the stacked variant
    // keeps three.
    //
    // Only this appended copy takes a half column. Once the days unit
    // drops away seconds become the last-day drama and arrive through
    // `parts` as a full unit, exactly as before.
    // HERO SCALE: ALL FOUR UNITS, ALWAYS (founder, 2026-10-17: "i'm not
    // sure i like the countdown without days or hours. Should we include
    // them but muted?"). The card keeps its shape to the last second —
    // it used to lose a column at the day and the hour and the rail
    // jumped — and a unit already at zero stays in its column, muted:
    // "00 days" reads as what it is. The leading zeros are muted; once a
    // unit is live every unit after it is live.
    const heroParts: Part[] = (() => {
      const all: Part[] = [
        { value: days, label: days === 1 ? "day" : "days" },
        { value: hours, label: hours === 1 ? "hr" : "hrs" },
        { value: minutes, label: minutes === 1 ? "min" : "mins" },
        { value: seconds, label: seconds === 1 ? "sec" : "secs" },
      ]
      let live = false
      return all.map((part) => {
        if ((part.value ?? 0) > 0) live = true
        return { ...part, spent: !live }
      })
    })()
    const inlineParts: Part[] = hero
      ? heroParts
      : days > 0
        ? [
            ...parts,
            {
              value: seconds,
              label: seconds === 1 ? "sec" : "secs",
              half: true,
            },
          ]
        : parts
    const inlineValueClass = hero
      ? heroValueClass
      : size === "lg"
        ? "text-3xl leading-none"
        : size === "md"
          ? "text-2xl leading-none"
          : "text-xl leading-none"
    const inlineLabelClass = hero
      ? "text-xs"
      : size === "lg"
        ? "text-sm"
        : size === "md"
          ? "text-xs"
          : "text-[10px]"
    return (
      <div aria-live="off">
        <SectionEyebrow variant="muted" className={eyebrowClass}>
          Poll closes in
        </SectionEyebrow>
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
          {inlineParts.map(({ value, label, spent }, i) => (
            <span
              key={label}
              className={`tabular-nums ${
                // The HALF column (seconds beside days) hugs the right
                // edge, so the row still spans the card the way
                // justify-between used to. Three full columns read
                // evenly only left-aligned (founder, 2026-09-30: "the
                // countdown parts aren't distributed evenly").
                i === inlineParts.length - 1 && inlineParts[i]?.half
                  ? "text-right"
                  : ""
              } ${hero ? "flex justify-start" : ""} ${
                hero && i === inlineParts.length - 1 ? "justify-end" : ""
              }`}
            >
              {/* Hero scale: the unit BENEATH its figure (founder,
                  2026-10-17: "place days, hrs, mins, sec labels below
                  their figures"), so each column reads as one unit of
                  time at the name's size; rail scale keeps them inline. */}
              {/* items-center: the unit centred under ITS figure; the block
                  shrink-wraps in its column, so the first stays on the left
                  edge and the last on the right. */}
              <span className={hero ? "flex flex-col items-center" : ""}>
                <span
                  className={`${inlineValueClass} font-medium ${
                    spent ? "text-muted-foreground/60" : "text-foreground"
                  }`}
                >
                  {String(value).padStart(2, "0")}
                </span>
                <span
                  className={`${hero ? "mt-1" : "ml-1"} ${inlineLabelClass} ${
                    spent ? "text-muted-foreground/60" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
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
      <SectionEyebrow variant="muted" className="mb-2 font-semibold">
        Poll closes in
      </SectionEyebrow>
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
