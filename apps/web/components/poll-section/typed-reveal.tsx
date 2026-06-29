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
    <div aria-label={label}>
      <span className="sr-only" role="status" aria-live="polite">
        {text}
      </span>
      <blockquote
        className="border-l-[2.5px] border-[#7F77DD] pl-3 text-[18px] leading-relaxed font-normal text-[#26215C] italic"
        aria-hidden="true"
      >
        {shown || " "}
      </blockquote>
    </div>
  )
}
