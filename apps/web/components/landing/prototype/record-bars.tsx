"use client"

// PROTOTYPE — record ranking bars that grow from zero the first time they
// scroll into view. Static at full width under prefers-reduced-motion.
import { useEffect, useRef, useState } from "react"
import { RankingBar } from "@/components/ui/ranking-bar"
import { formatCurrency, MARKET_DEFAULTS } from "@/lib/i18n"
import type { RecordItem } from "./types"

type Props = {
  items: RecordItem[]
  max: number
  showTopics?: boolean
  className?: string
}

export function RecordBars({ items, max, showTopics, className }: Props) {
  const ref = useRef<HTMLOListElement>(null)
  const [grown, setGrown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGrown(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        setGrown(true)
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <ol ref={ref} className={className} aria-label="Top all-time favourites">
      {items.map((item, i) => (
        <li key={item.id}>
          <RankingBar
            label={item.label}
            amount={formatCurrency(
              item.all_time_pledged,
              MARKET_DEFAULTS["en-GB"]
            )}
            widthPercent={
              grown ? Math.round((item.all_time_pledged / max) * 100) : 0
            }
            barClassName="bg-chart-2"
            barStyle={{
              transition: `width ${600 + i * 90}ms ease-out`,
            }}
          />
          {showTopics && item.topics?.title && (
            <p className="mt-0.5 text-xs tracking-[0.07em] text-muted-foreground uppercase">
              {item.topics.title}
            </p>
          )}
        </li>
      ))}
    </ol>
  )
}
