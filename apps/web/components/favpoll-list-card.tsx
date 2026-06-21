"use client"

import { useState } from "react"
import Link from "next/link"
import { Gift, ChartBarDecreasing } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button"
import { PledgeDialog } from "@/components/pledge-dialog"
import { FavpollHeader } from "./favpoll-card/favpoll-header"
import type { FavpollCardSize } from "./favpoll-card/types"
import { SectionLabel } from "./favpoll-card/section-label"
import { FavpollListCardResults } from "./favpoll-list-card/favpoll-list-card-results"
import { FavpollListCardCharityCarousel } from "./favpoll-list-card/favpoll-list-card-charity-carousel"
import type { CardResultItem } from "./favpoll-list-card/use-favpoll-list-card-pledge"
import type { Charity, FavpollPollWithItems } from "@favpoll/types"

type FavpollListCardFavpoll = {
  id: string
  occasion_type: string | null
  opening_line: string
  description: string | null
  closes_at: string
  total_raised: number
  is_exemplar?: boolean
  protagonist: { name: string }
  charities: { charity: Charity }[]
  poll: {
    id: string
    topic_id: string | null
    topic: {
      title: string
      is_finite: boolean
      favourites: { id: string; label: string }[]
    } | null
  } | null
}

type Props = {
  size?: FavpollCardSize
  event: FavpollListCardFavpoll
  className?: string
  clerkUserId?: string | null
  initialResults?: CardResultItem[]
}

export function FavpollListCard({
  size = "sm",
  event,
  className,
  clerkUserId = null,
  initialResults,
}: Props) {
  const poll = event.poll
  const topicTitle = poll?.topic?.title ?? ""
  const topicItems = poll?.topic?.favourites ?? []
  const perCharity =
    event.charities.length > 0 ? event.total_raised / event.charities.length : 0

  const [hasPledged, setHasPledged] = useState(!!initialResults)
  const [results, setResults] = useState<CardResultItem[] | null>(
    initialResults ?? null
  )

  async function handlePledgeSuccess() {
    setHasPledged(true)
    if (!poll) return
    try {
      const res = await fetch(`/api/polls/${poll.id}/results`)
      if (res.ok) {
        const { results: fetched } = (await res.json()) as {
          results: CardResultItem[]
        }
        if (fetched.length > 0) setResults(fetched)
      }
    } catch {
      // Non-fatal — pledged state shown without results
    }
  }

  // Construct FavpollPollWithItems from the card's poll data
  const pollWithItems: FavpollPollWithItems | null =
    poll && poll.topic
      ? ({
          id: poll.id,
          favpoll_id: event.id,
          topic_id: poll.topic_id ?? "",
          personal_reveal: null,
          created_at: "",
          topics: {
            id: poll.topic_id ?? "",
            title: poll.topic.title,
            is_finite: poll.topic.is_finite,
            is_active: true,
            description: null,
            created_by: null,
            created_at: "",
            favourites: topicItems,
          },
        } as unknown as FavpollPollWithItems)
      : null

  return (
    <li className={cn("list-none", className)}>
      <div className="group flex h-full flex-col rounded-xl border border-border bg-background transition-colors duration-200 hover:border-[#AFA9EC]">
        {/* Navigable header — links to favpoll page */}
        <Link href={`/favpolls/${event.id}`} className="relative block p-3">
          {event.is_exemplar && (
            <span className="absolute top-3 right-3 rounded-full bg-[#EEEDFE] px-2 py-0.5 text-[10px] font-medium text-[#534AB7]">
              Example
            </span>
          )}
          <FavpollHeader
            protagonist={{ name: event.protagonist.name }}
            eyebrow={event.opening_line ?? ""}
            size={size}
          />
        </Link>

        {/* SectionLabel row — with pledge-again / view-results button */}
        {topicTitle && (
          <div className="flex items-center justify-between gap-1 border-t border-border px-3 pt-2">
            <div>
              <SectionLabel title={topicTitle} size="md" />
              {event.description && (
                <p className="mt-2 mb-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              )}
            </div>

            {poll && topicItems.length > 0 && (
              <>
                {hasPledged ? (
                  <TooltipIconButton
                    icon={Gift}
                    label="Pledge again"
                    onClick={() => setHasPledged(false)}
                  />
                ) : results !== null ? (
                  <TooltipIconButton
                    icon={ChartBarDecreasing}
                    label="View results"
                    onClick={() => setHasPledged(true)}
                  />
                ) : null}
              </>
            )}
          </div>
        )}

        {/* Description only — when there's no topicTitle */}
        {!topicTitle && event.description && (
          <Link href={`/favpolls/${event.id}`} className="block px-5">
            <p className="mt-2 mb-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          </Link>
        )}

        {/* Pledge section */}
        {pollWithItems && topicItems.length > 0 ? (
          <div className="px-3 py-2">
            {hasPledged ? (
              <FavpollListCardResults results={results ?? []} />
            ) : (
              <PledgeDialog
                favpollId={event.id}
                clerkUserId={clerkUserId}
                charityNames={event.charities.map((c) => c.charity.name)}
                pollWithItems={pollWithItems}
                pot={null}
                userPotAllocation={null}
                onPledgeSuccess={handlePledgeSuccess}
                isListed
              />
            )}
          </div>
        ) : (
          <div className="px-5 pb-5">
            <Link href={`/favpolls/${event.id}`} tabIndex={-1}>
              <Button type="button" variant="outline" className="w-full">
                View favpoll
              </Button>
            </Link>
          </div>
        )}

        {/* Charity footer */}
        {event.charities.length > 0 && (
          <div className="mt-auto border-t border-border px-4 py-3">
            <FavpollListCardCharityCarousel
              charities={event.charities}
              perCharity={perCharity}
              size="sm"
            />
          </div>
        )}
      </div>
    </li>
  )
}
