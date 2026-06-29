"use client"

import { useState } from "react"
import Link from "next/link"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { PledgeDialog } from "@/components/pledge-dialog"
import { FavpollHeader } from "./favpoll-card/favpoll-header"
import type { FavpollCardSize } from "./favpoll-card/types"
import { FavpollListCardResults } from "./favpoll-list-card/favpoll-list-card-results"
import { FavpollListCardCharityCarousel } from "./favpoll-list-card/favpoll-list-card-charity-carousel"
import type { CardResultItem } from "./favpoll-list-card/use-favpoll-list-card-pledge"
import type { Charity, FavpollPollWithItems } from "@favpoll/types"

const DECOY_WIDTHS = [85, 62, 48, 33, 19]

type FavpollListCardFavpoll = {
  id: string
  subject?: string
  cause_label?: string | null
  occasion_type: string | null
  opening_line: string
  description: string | null
  closes_at: string
  closed_at?: string | null
  total_raised: number
  is_exemplar?: boolean
  protagonist: { name: string } | null
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
  favpoll: FavpollListCardFavpoll
  className?: string
  clerkUserId?: string | null
  initialResults?: CardResultItem[]
}

export function FavpollListCard({
  size = "sm",
  favpoll,
  className,
  clerkUserId = null,
  initialResults,
}: Props) {
  const poll = favpoll.poll
  const topicItems = poll?.topic?.favourites ?? []
  const perCharity =
    favpoll.charities.length > 0
      ? favpoll.total_raised / favpoll.charities.length
      : 0

  const [hasPledged, setHasPledged] = useState(!!initialResults)
  const [results, setResults] = useState<CardResultItem[] | null>(
    initialResults ?? null
  )

  const isClosed = !!favpoll.closed_at
  const entitled = hasPledged || isClosed

  const decoyResults: CardResultItem[] = [...topicItems]
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 4)
    .map((item, i) => ({
      label: item.label,
      amountPence: 0,
      widthPercent: DECOY_WIDTHS[i % DECOY_WIDTHS.length],
    }))

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

  const pollWithItems: FavpollPollWithItems | null =
    poll && poll.topic
      ? ({
          id: poll.id,
          favpoll_id: favpoll.id,
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
        <Link href={`/favpolls/${favpoll.id}`} className="relative block p-3">
          {favpoll.is_exemplar && (
            <span className="absolute top-3 right-3 rounded-full bg-[#EEEDFE] px-2 py-0.5 text-[10px] font-medium text-[#534AB7]">
              Example
            </span>
          )}
          <FavpollHeader
            protagonist={{
              name:
                favpoll.subject === "cause"
                  ? (favpoll.cause_label ?? "")
                  : (favpoll.protagonist?.name ?? ""),
            }}
            eyebrow={favpoll.opening_line ?? ""}
            size={size}
          />
        </Link>

        {pollWithItems && topicItems.length > 0 && (
          <div className="border-t border-border px-3 py-2">
            <PledgeDialog
              favpollId={favpoll.id}
              clerkUserId={clerkUserId}
              charityNames={favpoll.charities.map((c) => c.charity.name)}
              pollWithItems={pollWithItems}
              pot={null}
              userPotAllocation={null}
              onPledgeSuccess={handlePledgeSuccess}
              isListed
            />
            {entitled ? (
              <FavpollListCardResults results={results ?? []} />
            ) : (
              <div className="relative mt-1">
                <div
                  className="pointer-events-none blur-xs select-none"
                  aria-hidden="true"
                  data-testid="list-card-decoy"
                >
                  <FavpollListCardResults results={decoyResults} />
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
                    <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
                    Pledge to see how the pledges are landing.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {favpoll.charities.length > 0 && (
          <div className="mt-auto border-t border-border px-4 py-3">
            <FavpollListCardCharityCarousel
              charities={favpoll.charities}
              perCharity={perCharity}
              size="sm"
            />
          </div>
        )}
      </div>
    </li>
  )
}
