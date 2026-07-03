"use client"

// The record as a record book, not a race: one holder per topic,
// no comparative bars (bars across different questions imply a shared scale
// that doesn't exist). Tiles fade up in sequence; amounts count up on view.
import { CountUp } from "./count-up"
import { FadeIn } from "./fade-in"
import { formatCurrency, MARKET_DEFAULTS } from "@/lib/i18n"
import type { RecordItem } from "./types"

type Props = {
  items: RecordItem[]
  className?: string
}

export function RecordHolders({ items, className }: Props) {
  // items arrive sorted by all_time_pledged desc — keep the first (highest)
  // per topic so each tile is that question's record holder.
  const seen = new Set<string>()
  const holders = items.filter((item) => {
    const topic = item.topics?.title
    if (!topic || seen.has(topic)) return false
    seen.add(topic)
    return true
  })

  return (
    <ol className={className} aria-label="Current record holders">
      {holders.slice(0, 6).map((item, i) => (
        <li key={item.id} className="list-none">
          <FadeIn
            delay={i * 0.06}
            className="h-full rounded-xl border border-border bg-background p-5"
          >
            <p className="mb-2 text-xs font-medium tracking-[0.08em] text-primary-muted uppercase">
              {item.topics?.title}
            </p>
            <p className="mb-1 text-2xl font-light tracking-tight text-foreground">
              {item.label}
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">
              <CountUp
                value={item.all_time_pledged}
                format={(n) =>
                  formatCurrency(
                    Math.round(n * 100) / 100,
                    MARKET_DEFAULTS["en-GB"]
                  )
                }
              />{" "}
              pledged all-time
            </p>
          </FadeIn>
        </li>
      ))}
    </ol>
  )
}
