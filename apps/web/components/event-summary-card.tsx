"use client"

import { ClosingLabel } from "@/components/closing-label"
import { cn } from "@/lib/utils"
import type { Charity } from "@favpoll/types"
import Link from "next/link"
import { EventCardCharityCarousel } from "./event-card/event-card-charity-carousel"
import { FavpollHeader } from "./favpoll-card/favpoll-header"
import { PollTitle } from "./favpoll-card/poll-title"

export type EventSummaryCardEvent = {
  id: string
  register: string
  occasion_type: string | null
  opening_line: string
  closes_at: string
  closed_at?: string | null
  total_raised: number
  protagonist: { name: string }
  charities: { charity: Charity }[]
  poll: { topic: { title: string } | null } | null
}

type Props = {
  event: EventSummaryCardEvent
  className?: string
}

export function EventSummaryCard({ event, className }: Props) {
  const topicTitle = event.poll?.topic?.title ?? null
  const perCharity =
    event.charities.length > 0 ? event.total_raised / event.charities.length : 0

  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        "block rounded-xl border border-border bg-background transition-colors duration-200 hover:border-[#AFA9EC]",
        className
      )}
    >
      {/* Header */}
      <div className="p-3">
        <FavpollHeader
          protagonist={{ name: event.protagonist.name }}
          eyebrow={event.occasion_type ?? event.register}
          size="md"
        />
      </div>

      {/* Topic + countdown */}
      {topicTitle && (
        <div className="border-t border-border px-3 py-2">
          <PollTitle title={topicTitle} size="md" />
        </div>
      )}

      <div className="border-t border-border px-3 py-2">
        <ClosingLabel closesAt={event.closes_at} />
      </div>

      {/* Charity */}
      {event.charities.length > 0 && (
        <div className="border-t border-border px-3 py-2">
          <EventCardCharityCarousel
            charities={event.charities}
            perCharity={perCharity}
            size="sm"
          />
        </div>
      )}
    </Link>
  )
}
