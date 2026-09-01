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
          ? // max-h-72 is load-bearing, not styling: the flip faces are
            // grid-stacked and a grid item's auto min-height is its
            // CONTENT, so without a cap a 40-favourite poll sized the
            // whole card to the full list (found on Favourite County,
            // 2026-09-01). flex-1 still grows into a tall story's room;
            // the cap bounds what the standings can demand for themselves.
            "max-h-72 min-h-0 flex-1 overflow-y-auto pt-2.5"
          : "max-h-30 overflow-y-auto pt-2.5"
      }
    >
      <PollResults results={pollResults} />
    </div>
  )
}
