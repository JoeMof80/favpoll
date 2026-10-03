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
  /**
   * Read the PROJECTOR'S type ramp (--display-topic, lib/display), falling
   * back to `size`'s own px everywhere the variable is unset. The room and
   * the still that depicts it set it; nothing else does.
   */
  ramp?: boolean
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
// THE PROJECTOR'S TYPE RAMP (lib/display, ROOM_TYPE_RAMP), in the shape the
// ramp was designed for: the shared component reads the variable with ITS
// OWN CURRENT SIZE as the fallback, so only the surface that sets the
// variable — the room, and the still that depicts it — changes, and no flag
// has to be threaded further than this.
//
// It is applied here because the room had the heading SMALLER than the list
// it labels: measured at 1920x1080, the topic read 17px against 24px
// ranking labels, the same 17px a phone gets. Literal classes, one per
// size, because Tailwind scans source text and cannot see a built string.
const TOPIC_RAMP: Record<string, string> = {
  lg: "text-[length:var(--display-topic,17px)]",
  md: "text-[length:var(--display-topic,15px)]",
  sm: "text-[length:var(--display-topic,11px)]",
}
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
      // Clear the inline size first and read what CSS wants: on the room
      // that is the ramp's clamp, everywhere else the size's own class.
      // Reading it back rather than trusting basePx is what lets one
      // variable drive the line without a second source of truth.
      el.style.fontSize = ""
      const base = parseFloat(getComputedStyle(el).fontSize) || basePx
      const available = el.clientWidth
      const needed = el.scrollWidth
      if (!available || !needed || needed <= available) return
      const next = Math.max(base * MIN_SCALE, (base * available) / needed)
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
  ramp = false,
}: {
  topicTitle: string
  size: FavpollCardSize
  eyebrowClass: string
  topicClass: string
  align?: "start" | "center"
  /** Read the projector's type ramp, falling back to this size. */
  ramp?: boolean
}) {
  // THE TOPIC LINE ALONE TAKES THE RAMP. Both lines at 1.7vw made the
  // heading 81.6px and overflowed a 1080-high room by 13px, and the room's
  // spare height is an invariant (#984) — a nudge on a column with slack
  // scrolls the static hero away. The eyebrow keeps the surface's own size,
  // which also puts a quiet label over a large topic word: the thing the
  // room has to read from the back is the topic.
  const topicTextClass = ramp ? TOPIC_RAMP[size] : TOPIC_TEXT[size]
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
          topicTextClass,
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
  ramp = false,
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
          ramp={ramp}
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
