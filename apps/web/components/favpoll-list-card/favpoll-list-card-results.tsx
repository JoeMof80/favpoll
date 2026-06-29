import { PollResults } from "@/components/favpoll-card/poll-results"
import { formatCurrency } from "@/lib/i18n"
import type { CardResultItem } from "./use-favpoll-list-card-pledge"

type Props = {
  results: CardResultItem[]
}

export function FavpollListCardResults({ results }: Props) {
  const pollResults = results.map((item) => ({
    label: item.label,
    amount: item.amountPence > 0 ? formatCurrency(item.amountPence) : "—",
    widthPercent: item.widthPercent,
  }))

  return (
    <div className="max-h-30 overflow-y-auto pt-2.5">
      <PollResults results={pollResults} />
    </div>
  )
}
