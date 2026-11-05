"use client"

import { cn } from "@/lib/utils"
import { favpollEyebrow } from "@/lib/favpoll-eyebrow"
import type { Charity, FavpollCategory, FavpollSubject } from "@favpoll/types"
import { paletteForFavpoll } from "@/lib/register-palette"
import Link from "next/link"
import { FavpollListCardCharityCarousel } from "./favpoll-list-card/favpoll-list-card-charity-carousel"
import { FavpollCardBand } from "./favpoll-card/favpoll-card-band"
import { PollHeading } from "@/components/poll-heading"

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
  /** The cause favpoll's own photo, for the mark; person favpolls keep
   *  it on the protagonist. */
  photo_url?: string | null
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
  const markPhoto =
    favpoll.subject === "cause"
      ? (favpoll.photo_url ?? null)
      : (favpoll.protagonist?.photo_url ?? null)
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
      {/* The shared card header (favpoll-card-band.tsx): band, mark,
          eyebrow, name. The summary card and the list card wear the same
          one so the home shelf, the charity page and the appeal page
          match /favpolls (founder, 2026-11-04). */}
      <FavpollCardBand
        closesAt={favpoll.closes_at}
        isExemplar={favpoll.is_exemplar}
        markPhoto={markPhoto}
        name={displayName}
        eyebrow={favpollEyebrow(favpoll)}
        size="md"
      />

      {/* Topic. The countdown moved up into the band (founder,
          2026-11-04); the topic line owns the full card width. No rule
          above it: the band is the header's edge now. */}
      {topicTitle && (
        <div className="relative px-3 pt-1 pb-2">
          {/* The Favourite eyebrow (founder, 2026-09-01) — PollHeading's
              default mode, in the shared two-line grammar. */}
          <PollHeading topicTitle={topicTitle} size="md" />
        </div>
      )}

      {/* Charity, on the band's tint so the card closes the way it opens
          (founder, 2026-11-04). */}
      {favpoll.charities.length > 0 && (
        <div className="rounded-b-xl border-t border-border bg-muted px-3 py-2">
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
