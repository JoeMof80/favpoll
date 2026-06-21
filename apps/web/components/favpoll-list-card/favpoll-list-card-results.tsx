import { PollResults } from "@/components/favpoll-card/poll-results"
import { formatCurrency } from "@/lib/i18n"
import type { CardResultItem } from "./use-event-card-pledge"

type Props = {
  results: CardResultItem[]
}

export function EventCardResults({ results }: Props) {
  const pollResults = results.map((item) => ({
    label: item.label,
    amount: item.amountPence > 0 ? formatCurrency(item.amountPence) : "—",
    widthPercent: item.widthPercent,
  }))

  return (
    <div className="max-h-8 overflow-y-auto">
      <PollResults results={pollResults} />
    </div>
  )
}
