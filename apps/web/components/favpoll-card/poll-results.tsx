import { RankingBar } from "@/components/ui/ranking-bar"
import type { PollResultItem } from "./types"

type PollResultsProps = {
  results: PollResultItem[]
  /** Emphasise the first row (the record's leader) */
  emphasizeFirst?: boolean
}

export function PollResults({ results, emphasizeFirst }: PollResultsProps) {
  return (
    <ul role="list" aria-label="Results" className="space-y-2.5">
      {results.map((r, i) => (
        <li key={r.label}>
          <RankingBar
            label={r.label}
            amount={r.amount}
            widthPercent={r.widthPercent}
            emphasis={emphasizeFirst && i === 0}
            barClassName={i === 0 ? "bg-primary" : "bg-chart-3"}
          />
        </li>
      ))}
    </ul>
  )
}
