"use client"

import { ClosingLabel } from "@/components/closing-label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { favpollEyebrow } from "@/lib/favpoll-eyebrow"
import type { Charity } from "@favpoll/types"
import Link from "next/link"
import { FavpollListCardCharityCarousel } from "./favpoll-list-card/favpoll-list-card-charity-carousel"
import { FavpollHeader } from "./favpoll-card/favpoll-header"
import { SectionLabel } from "./favpoll-card/section-label"

export type FavpollSummaryCardFavpoll = {
  id: string
  occasion_type: string | null
  category?: string | null
  subject?: string | null
  cause_label?: string | null
  opening_line: string
  closes_at: string
  closed_at?: string | null
  total_raised: number
  is_exemplar?: boolean
  protagonist: { name: string; photo_url?: string | null } | null // null for cause favpolls
  charities: { charity: Charity }[]
  poll: { topic: { title: string } | null } | null
}

type Props = {
  favpoll: FavpollSummaryCardFavpoll
  className?: string
}

export function FavpollSummaryCard({ favpoll, className }: Props) {
  const topicTitle = favpoll.poll?.topic?.title ?? null
  // Cause favpolls have no protagonist row — the cause label is the name.
  const displayName =
    favpoll.subject === "cause"
      ? (favpoll.cause_label ?? "")
      : (favpoll.protagonist?.name ?? "")
  const perCharity =
    favpoll.charities.length > 0
      ? favpoll.total_raised / favpoll.charities.length
      : 0

  return (
    <Link
      href={`/favpolls/${favpoll.id}`}
      className={cn(
        // Hover matches FavpollListCard: border + shadow + lift — the card
        // shells share one interaction language wherever favpolls appear.
        "block rounded-xl border border-border bg-background shadow-sm transition-all duration-300 hover:border-border-strong hover:shadow-lg motion-safe:hover:-translate-y-1",
        className
      )}
    >
      {/* Header */}
      <div className="relative p-3">
        {favpoll.is_exemplar && (
          <Badge variant="secondary" className="absolute top-3 right-3">
            Example
          </Badge>
        )}
        <FavpollHeader
          protagonist={{
            name: displayName,
            photo_url:
              favpoll.subject === "cause"
                ? null
                : (favpoll.protagonist?.photo_url ?? null),
          }}
          eyebrow={favpollEyebrow(favpoll)}
          size="md"
        />
      </div>

      {/* Topic + countdown */}
      {topicTitle && (
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <SectionLabel title={topicTitle} size="md" />
          <ClosingLabel closesAt={favpoll.closes_at} />
        </div>
      )}

      {/* Charity */}
      {favpoll.charities.length > 0 && (
        <div className="border-t border-border px-3 py-2">
          <FavpollListCardCharityCarousel
            charities={favpoll.charities}
            perCharity={perCharity}
            size="sm"
          />
        </div>
      )}
    </Link>
  )
}
