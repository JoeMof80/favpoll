"use client"

import { useLayoutEffect, useRef } from "react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import type { FavpollCardSize } from "./favpoll-card/types"

type Props = {
  topicTitle: string
  size?: FavpollCardSize
  onPledge?: () => void
  /**
   * Renders the pledge-button CHROME without the button — for previews
   * (the edit form) that must look like the guest page. A static div,
   * not a disabled button: there is nothing to enable.
   */
  inert?: boolean
}

// "Favourite" is the EYEBROW — quiet, above the topic word at full size
// (founder, 2026-09-01: the hero router cards' grammar from #614, brought
// to every PollHeading surface).
//
// THE TOPIC LINE NEVER WRAPS (founder, 2026-09-01: "REGIONAL OR DIALECT
// WORD" broke onto two lines): it shrinks to fit its width instead.
// Measured, not guessed — the old character-count table was width-blind
// (the same topic fits the guest ribbon and overflows a card). FitLine
// sets the font size imperatively in a layout effect (pre-paint, no
// flash, no state loop): reset to base, read scrollWidth vs clientWidth,
// scale linearly (tracking is em-based, so width ∝ font-size), floor at
// 55%. A ResizeObserver refits when the container changes.
//
// Plain spans, no aria theatre: sequential text already reads as one
// phrase ("Favourite" "Colour"), and an sr-only twin collided with the
// reveal's own sr-only machinery in poll-section.
//
// One size for both lines — the eyebrow is quieter by OPACITY alone,
// like the hero card's. SETTLED (founder, 2026-09-01) after both
// calibrations were rendered: size-only (#627) was tried and reverted;
// "one or the other" holds, and opacity won. Don't re-litigate without
// a new screenshot.
const TOPIC_TEXT: Record<string, string> = {
  lg: "text-[17px]",
  md: "text-[15px]",
  sm: "text-[11px]",
}
const TOPIC_PX: Record<string, number> = { lg: 17, md: 15, sm: 11 }
const MIN_SCALE = 0.55

function FitLine({
  text,
  basePx,
  className,
}: {
  text: string
  basePx: number
  className: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      el.style.fontSize = `${basePx}px`
      const available = el.clientWidth
      const needed = el.scrollWidth
      if (!available || !needed || needed <= available) return
      const next = Math.max(basePx * MIN_SCALE, (basePx * available) / needed)
      el.style.fontSize = `${Math.floor(next * 10) / 10}px`
    }
    fit()
    // Web fonts can land after first paint and change the metrics.
    document.fonts?.ready.then(fit).catch(() => {})
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [text, basePx])

  return (
    <span
      ref={ref}
      className={cn(
        "block w-full min-w-0 overflow-hidden whitespace-nowrap",
        className
      )}
    >
      {text}
    </span>
  )
}

function HeadingLines({
  topicTitle,
  size,
  eyebrowClass,
  topicClass,
  align = "start",
}: {
  topicTitle: string
  size: FavpollCardSize
  eyebrowClass: string
  topicClass: string
  align?: "start" | "center"
}) {
  return (
    <span
      className={cn(
        "flex w-full min-w-0 flex-col font-medium uppercase",
        align === "center" ? "items-center" : "items-start"
      )}
    >
      <span
        className={cn(
          TOPIC_TEXT[size],
          eyebrowClass,
          "leading-tight tracking-[0.09em]"
        )}
      >
        Favourite
      </span>
      <FitLine
        text={topicTitle}
        basePx={TOPIC_PX[size]}
        className={cn(
          TOPIC_TEXT[size],
          topicClass,
          "leading-tight tracking-[0.09em]",
          align === "center" && "text-center"
        )}
      />
    </span>
  )
}

export function PollHeading({
  topicTitle,
  size = "lg",
  onPledge,
  inert = false,
}: Props) {
  if (onPledge) {
    return (
      <Button
        type="button"
        className="h-auto w-full min-w-0 py-1.5"
        onClick={onPledge}
      >
        <HeadingLines
          topicTitle={topicTitle}
          size={size}
          eyebrowClass="text-primary-foreground/70"
          topicClass="text-primary-foreground"
          align="center"
        />
      </Button>
    )
  }

  if (inert) {
    // A HEADER, not button chrome (founder, 2026-08-02). min-h-9 keeps
    // the old ribbon height so the sticky offsets above the poll hold;
    // the topic line never wraps, so it cannot grow past it.
    return (
      <div className="flex min-h-9 w-full min-w-0 flex-col justify-center">
        <HeadingLines
          topicTitle={topicTitle}
          size={size}
          eyebrowClass="text-primary/55"
          topicClass="text-primary"
        />
      </div>
    )
  }

  // The quiet default — SectionLabel's old tone, in the two-line grammar.
  return (
    <div className="flex min-w-0 flex-col">
      <HeadingLines
        topicTitle={topicTitle}
        size={size}
        eyebrowClass="text-primary-muted/60"
        topicClass="text-primary-muted"
      />
    </div>
  )
}
