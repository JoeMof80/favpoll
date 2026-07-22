"use client"

import { useState } from "react"
import Link from "next/link"
import { RevealLockPill } from "@/components/reveal-lock"
import { cn } from "@/lib/utils"
import { favpollEyebrow } from "@/lib/favpoll-eyebrow"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PledgeDialog } from "@/components/pledge-dialog"
import { PollHeading } from "@/components/poll-heading"
import { FavpollHeader } from "./favpoll-card/favpoll-header"
import type { FavpollCardSize } from "./favpoll-card/types"
import { FavpollListCardResults } from "./favpoll-list-card/favpoll-list-card-results"
import { FavpollListCardCharityCarousel } from "./favpoll-list-card/favpoll-list-card-charity-carousel"
import type { CardResultItem } from "./favpoll-list-card/use-favpoll-list-card-pledge"
import type { Charity, FavpollPollWithItems } from "@favpoll/types"
import { DECOY_WIDTHS } from "@/lib/decoys"

type FavpollListCardFavpoll = {
  id: string
  subject?: string
  cause_label?: string | null
  category?: string | null
  occasion_type: string | null
  opening_line: string
  description: string | null
  closes_at: string
  closed_at?: string | null
  total_raised: number
  is_exemplar?: boolean
  protagonist: { name: string; photo_url?: string | null } | null
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
  // The dialog is controlled so both the topic banner and the lock overlay
  // can open it (uncontrolled mode ties opening to the banner alone).
  const [pledgeOpen, setPledgeOpen] = useState(false)

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

  async function handlePledgeSuccess(guestToken?: string) {
    setHasPledged(true)
    if (!poll) return
    try {
      // The results API is entitlement-gated (same gate as the reveal):
      // signed-in pledgers pass via cookie auth; guests pass the token
      // their pledge just minted.
      const query = guestToken
        ? `?guest_token=${encodeURIComponent(guestToken)}`
        : ""
      const res = await fetch(`/api/polls/${poll.id}/results${query}`)
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

  const displayName =
    favpoll.subject === "cause"
      ? (favpoll.cause_label ?? "")
      : (favpoll.protagonist?.name ?? "")

  return (
    <li className={cn("list-none", className)}>
      {/* Interaction matches FavpollSummaryCard: the whole card navigates
          (stretched link below), with the same hover lift + shadow. The
          poll body sits above the link (relative) so pledging still works. */}
      <div
        className={cn(
          "group relative flex h-full flex-col rounded-xl border border-border bg-background shadow-sm transition-all duration-300 hover:border-border-strong hover:shadow-lg motion-safe:hover:-translate-y-1",
          // Your pledge, visible at a glance: soft purple border (the
          // view-state colour) — the badge on the seam carries the words
          hasPledged && "border-primary/60 hover:border-primary/80"
        )}
      >
        {/* Pre-attentive marker: a solid strip at a fixed position is what
            scanning eyes catch; the border and badge alone needed reading.
            No aria-hidden — empty divs are silent, and [aria-hidden] is
            reserved surface here. */}
        {hasPledged && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-xl bg-primary" />
        )}
        {/* Stretched link — covers the card; positioned siblings (the poll
            body) paint and hit-test above it. */}
        <Link
          href={`/favpolls/${favpoll.id}`}
          aria-label={`View favpoll: ${displayName}`}
          className="absolute inset-0 rounded-xl"
        />
        <div className="p-3">
          {favpoll.is_exemplar && (
            <Badge
              variant="secondary"
              className="pointer-events-none absolute top-3 right-3"
            >
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
            size={size}
          />
        </div>

        {pollWithItems && topicItems.length > 0 && (
          <div className="relative border-t border-border bg-background px-3 py-2">
            {hasPledged && (
              <Badge
                variant="secondary"
                className="absolute -top-2.5 right-3 z-10 border border-primary/30 text-primary"
              >
                Pledged
              </Badge>
            )}
            <PollHeading
              topicTitle={pollWithItems.topics.title}
              size="md"
              onPledge={() => setPledgeOpen(true)}
            />
            <PledgeDialog
              favpollId={favpoll.id}
              clerkUserId={clerkUserId}
              charityNames={favpoll.charities.map((c) => c.charity.name)}
              pollWithItems={pollWithItems}
              pot={null}
              userPotAllocation={null}
              onPledgeSuccess={handlePledgeSuccess}
              isListed
              open={pledgeOpen}
              onOpenChange={setPledgeOpen}
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
                {/* Full-area unlock — the poll section's idiom: a ghost
                    button over the decoy, the pointer-events-none pill
                    riding inside it. */}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPledgeOpen(true)}
                  className="absolute inset-0 z-10 h-auto w-full rounded-none hover:bg-transparent"
                >
                  <RevealLockPill size="sm" label="Pledge to see the results" />
                </Button>
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
