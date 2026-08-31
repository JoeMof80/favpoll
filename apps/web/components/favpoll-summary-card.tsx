"use client"

import { ClosingLabel } from "@/components/closing-label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { favpollEyebrow } from "@/lib/favpoll-eyebrow"
import type { Charity, FavpollCategory, FavpollSubject } from "@favpoll/types"
import { paletteForFavpoll } from "@/lib/register-palette"
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

  // The card wears its own register's palette — one element on a mixed
  // surface, so the attribute scopes the subtree (see RegisterScope notes).
  const palette = paletteForFavpoll({
    category: (favpoll.category ?? null) as FavpollCategory | null,
    subject: (favpoll.subject ?? undefined) as FavpollSubject | undefined,
  })

  return (
    <Link
      href={`/favpolls/${favpoll.id}`}
      data-register={palette ?? undefined}
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
          hideEmptyAvatar
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
        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
          <div className="min-w-0 flex-1">
            <SectionLabel title={topicTitle} size="md" />
          </div>
          <ClosingLabel
            closesAt={favpoll.closes_at}
            className="shrink-0 whitespace-nowrap"
          />
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
