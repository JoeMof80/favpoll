import type { Favourite } from "@favpoll/types"
import { PollReveal } from "@/components/favpoll-card/poll-reveal"
import { RankingBar } from "@/components/ui/ranking-bar"

type Props = {
  items: Favourite[]
}

const DECOY_WIDTHS = [85, 62, 48, 33, 19]

export function DecoyResults({ items }: Props) {
  // Sort alphabetically — avoids leaking real ranking order
  const sorted = [...items]
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 5)

  return (
    <div aria-hidden="true" tabIndex={-1}>
      <PollReveal personalReveal="Pledge to see their reveal." />
      <ol aria-label="Rankings" className="mt-4 space-y-3">
        {sorted.map((item, i) => (
          <li key={item.id}>
            <RankingBar
              label={item.label}
              amount="—"
              widthPercent={DECOY_WIDTHS[i] ?? 10}
            />
          </li>
        ))}
      </ol>
    </div>
  )
}
