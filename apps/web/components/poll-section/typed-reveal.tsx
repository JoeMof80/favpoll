"use client"

import { useEffect, useState } from "react"
import { PollReveal } from "@/components/favpoll-card/poll-reveal"

type Props = {
  text: string
  active: boolean
  protagonistFirstName: string
}

// Rough total duration regardless of reveal length (mirrors the demo panel).
const TARGET_MS = 1900

export function TypedReveal({ text, active, protagonistFirstName }: Props) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const shouldType = active && !reduced

  const [shown, setShown] = useState(() => (shouldType ? "" : text))

  useEffect(() => {
    if (!shouldType) {
      setShown(text)
      return
    }
    setShown("")
    const speed = Math.max(
      12,
      Math.min(40, Math.round(TARGET_MS / Math.max(1, text.length)))
    )
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) window.clearInterval(id)
    }, speed)
    return () => window.clearInterval(id)
  }, [text, shouldType])

  if (!shouldType) {
    // Non-animated: standard accessible render (handles SSR / returning pledger)
    return (
      <PollReveal
        personalReveal={text}
        protagonistFirstName={protagonistFirstName}
        role="status"
        aria-live="polite"
      />
    )
  }

  // Animated: full text announced once via sr-only; typed copy is aria-hidden
  // so AT doesn't read each keystroke individually.
  const label = protagonistFirstName
    ? `${protagonistFirstName}'s reveal`
    : "Their reveal"

  return (
    <div aria-label={label} className="relative">
      <span className="sr-only" role="status" aria-live="polite">
        {text}
      </span>
      <blockquote
        className="absolute inset-0 border-l-[2.5px] border-primary-muted pl-3 text-[18px] leading-relaxed font-normal text-reveal-foreground italic"
        aria-hidden="true"
      >
        {shown || " "}
      </blockquote>
      {/* Reserves the final height so the quote border spans it from the
          first keystroke and typing never pushes the layout below. Placed
          AFTER the typed copy: tests read the first [aria-hidden] element
          as the typing surface. */}
      <div className="invisible" aria-hidden="true">
        <PollReveal
          personalReveal={text}
          protagonistFirstName={protagonistFirstName}
        />
      </div>
    </div>
  )
}
