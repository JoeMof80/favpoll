import { PollResults } from "@/components/favpoll-card/poll-results"
import { formatCurrency } from "@/lib/i18n"
import type { CardResultItem } from "./use-favpoll-list-card-pledge"

type Props = {
  results: CardResultItem[]
  /** Fill the flex parent instead of the fixed 120px cap — the flip
   *  card's standings face uses whatever height the story earned
   *  (founder, 2026-09-01), scrolling only on true overflow. */
  fill?: boolean
}

export function FavpollListCardResults({ results, fill = false }: Props) {
  const pollResults = results.map((item) => ({
    label: item.label,
    amount: item.amountPence > 0 ? formatCurrency(item.amountPence) : "—",
    widthPercent: item.widthPercent,
  }))

  return (
    <div
      className={
        fill
          ? // The flip body is a FIXED height with absolute faces
            // (2026-09-01), so the list can simply fill it and scroll —
            // content cannot size the card any more.
            "min-h-0 flex-1 overflow-y-auto pt-2.5"
          : "max-h-30 overflow-y-auto pt-2.5"
      }
    >
      <PollResults results={pollResults} />
    </div>
  )
}
