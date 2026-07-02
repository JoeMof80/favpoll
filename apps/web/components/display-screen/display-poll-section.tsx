"use client"

import { useRankingItems } from "@/components/ranking-list/use-ranking-items"
import { DisplayRankingRow } from "./display-ranking-row"
import type { Favourite } from "@favpoll/types"

const ROW_HEIGHT = 72

export type DisplayPoll = {
  id: string
  personal_reveal: string | null
  topic: {
    id: string
    title: string
  }
  items: Favourite[]
}

export function DisplayPollSection({ poll }: { poll: DisplayPoll }) {
  const { items, announcement, maxValue } = useRankingItems(
    poll.items,
    poll.topic.id,
    "amount"
  )
  const isColorTopic =
    poll.topic.title.toLowerCase().includes("colour") ||
    poll.topic.title.toLowerCase().includes("color")

  return (
    <section className="mb-10" aria-labelledby={`poll-${poll.id}-heading`}>
      <h2
        id={`poll-${poll.id}-heading`}
        className="mb-1 text-lg font-medium text-foreground"
      >
        {poll.topic.title}
      </h2>
      {poll.personal_reveal && (
        <p className="mb-4 border-l-2 border-secondary pl-3 text-sm text-muted-foreground italic">
          {poll.personal_reveal}
        </p>
      )}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </span>
      <ol
        aria-label={`${poll.topic.title} rankings`}
        aria-live="polite"
        className="relative"
        style={{ height: items.length * ROW_HEIGHT }}
      >
        {items.map((item) => (
          <DisplayRankingRow
            key={item.id}
            item={item}
            isColorTopic={isColorTopic}
            maxPledged={maxValue}
            isFirst={item.rank === 1}
            style={{
              transform: `translateY(${(item.rank - 1) * ROW_HEIGHT}px)`,
            }}
          />
        ))}
      </ol>
    </section>
  )
}
