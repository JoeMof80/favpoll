import { RankingBar } from "@/components/ui/ranking-bar"
import { formatCurrency } from "@/lib/i18n"
import type { CardResultItem } from "./use-event-card-pledge"

type Props = {
  results: CardResultItem[]
}

export function EventCardResults({ results }: Props) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-medium text-[#1D9E75]">
        Pledge confirmed — here&apos;s how it&apos;s looking
      </p>
      <ol role="list" aria-label="Results" className="space-y-2">
        {results.map((item, i) => (
          <li key={item.label}>
            <RankingBar
              label={item.label}
              amount={formatCurrency(item.amountPence)}
              widthPercent={item.widthPercent}
              barStyle={{ background: i === 0 ? "#534AB7" : "#AFA9EC" }}
            />
          </li>
        ))}
      </ol>
    </div>
  )
}
