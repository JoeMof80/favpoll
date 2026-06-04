"use client"

import { Countdown } from "@/components/countdown"
import { cn } from "@/lib/utils"
import type { Charity } from "@favpoll/types"
import Link from "next/link"
import { EventCardCharityCarousel } from "./event-card/event-card-charity-carousel"
import { FavpollCardProvider } from "./favpoll-card/favpoll-card-context"
import { FavpollHeader } from "./favpoll-card/favpoll-header"
import { PollTitle } from "./favpoll-card/poll-title"

export type EventSummaryCardEvent = {
  id: string
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

function pollClosesLabel(closesAt: string, closedAt?: string | null): string {
  if (closedAt || new Date(closesAt) < new Date()) return "closed"
  const ms = new Date(closesAt).getTime() - Date.now()
  const days = Math.ceil(ms / 86_400_000)
  if (days <= 0) return "today"
  if (days === 1) return "1 day"
  return `${days} days`
}

export function EventSummaryCard({ event, className }: Props) {
  const topicTitle = event.poll?.topic?.title ?? null
  const perCharity =
    event.charities.length > 0 ? event.total_raised / event.charities.length : 0

  return (
    <FavpollCardProvider value={{ size: "full" }}>
      <Link
        href={`/events/${event.id}`}
        className={cn(
          "block rounded-xl border border-border bg-background transition-colors duration-200 hover:border-[#AFA9EC]",
          className
        )}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <FavpollHeader
            protagonist={{ name: event.protagonist.name }}
            eyebrow={event.opening_line}
          />
        </div>

        <Countdown closesAt={event.closes_at} />

        {/* Topic + countdown */}
        {topicTitle && (
          <div className="px-5 py-4">
            <PollTitle title={topicTitle} />
          </div>
        )}

        {/* Charity */}
        {event.charities.length > 0 && (
          <div className="border-t border-border px-4 py-3">
            <EventCardCharityCarousel
              charities={event.charities}
              perCharity={perCharity}
            />
          </div>
        )}
      </Link>
    </FavpollCardProvider>
  )
}
