"use client"

// PROTOTYPE — counts a number up from zero the first time it scrolls into
// view. Respects prefers-reduced-motion (renders the final value directly).
import { useEffect, useRef, useState } from "react"

type Props = {
  value: number
  format?: (n: number) => string
  durationMs?: number
  className?: string
}

export function CountUp({
  value,
  format = (n) => String(n),
  durationMs = 900,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value)
      setDone(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs)
          const eased = 1 - Math.pow(1 - t, 3)
          setDisplay(value * eased)
          if (t < 1) requestAnimationFrame(tick)
          else setDone(true)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [value, durationMs])

  return (
    <span ref={ref} className={className}>
      {format(done ? value : display)}
    </span>
  )
}
