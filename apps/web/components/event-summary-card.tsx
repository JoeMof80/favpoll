"use client"

import { ClosingLabel } from "@/components/closing-label"
import { cn } from "@/lib/utils"
import type { Charity } from "@favpoll/types"
import Link from "next/link"
import { FavpollListCardCharityCarousel } from "./favpoll-list-card/favpoll-list-card-charity-carousel"
import { FavpollHeader } from "./favpoll-card/favpoll-header"
import { SectionLabel } from "./favpoll-card/section-label"

export type EventSummaryCardEvent = {
  id: string
  occasion_type: string | null
  category?: string | null
  opening_line: string
  closes_at: string
  closed_at?: string | null
  total_raised: number
  is_exemplar?: boolean
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
      href={`/favpolls/${event.id}`}
      className={cn(
        "block rounded-xl border border-border bg-background transition-colors duration-200 hover:border-[#AFA9EC]",
        className
      )}
    >
      {/* Header */}
      <div className="relative p-3">
        {event.is_exemplar && (
          <span className="absolute top-3 right-3 rounded-full bg-[#EEEDFE] px-2 py-0.5 text-[10px] font-medium text-[#534AB7]">
            Example
          </span>
        )}
        <FavpollHeader
          protagonist={{ name: event.protagonist.name }}
          eyebrow={
            event.category
              ? event.category.charAt(0).toUpperCase() + event.category.slice(1)
              : (event.opening_line ?? "")
          }
          size="md"
        />
      </div>

      {/* Topic + countdown */}
      {topicTitle && (
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <SectionLabel title={topicTitle} size="md" />
          <ClosingLabel closesAt={event.closes_at} />
        </div>
      )}

      {/* Charity */}
      {event.charities.length > 0 && (
        <div className="border-t border-border px-3 py-2">
          <FavpollListCardCharityCarousel
            charities={event.charities}
            perCharity={perCharity}
            size="sm"
          />
        </div>
      )}
    </Link>
  )
}
