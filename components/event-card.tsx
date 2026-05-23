"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  occasionLabel,
  charityNames,
  formatAmount,
  formatRelativeDate,
} from "@/lib/display"
import { OccasionTag } from "@/components/ui/occasion-tag"
import { FavpollHeader } from "./favpoll-card/favpoll-header"
import { FavpollCardProvider } from "./favpoll-card/favpoll-card-context"
import { FavpollCardSize } from "./favpoll-card/types"
import { PollTitle } from "./favpoll-card/poll-title"
import { FavpollCharityRow } from "./favpoll-card/favpoll-charity-row"
import { CharityBanner } from "./charity-banner"
import { Charity } from "@/types"
import { CharityRow } from "./charity-row"
import { AmountInput } from "./pledge-card/amount-input"
import { AmountPresets } from "./pledge-card/amount-presets"
import { usePledge } from "./pledge-card/use-pledge"
import { Button } from "./ui/button"
import { FavpollPledgePanel } from "./favpoll-card/favpoll-pledge-panel"

type EventCardEvent = {
  id: string
  occasion_label: string
  description: string | null
  closes_at: string
  total_raised: number
  protagonist: { name: string }
  charities: { charity: Charity }[]
  poll: { topic: { title: string; topic_items: string[] } | null } | null
}

type Props = {
  size?: FavpollCardSize | undefined
  event: EventCardEvent
  className?: string
}

export function EventCard({ size = "full", event, className }: Props) {
  const topicTitle = event.poll?.topic?.title ?? ""
  const perCharity =
    event.charities.length > 0 ? event.total_raised / event.charities.length : 0

  return (
    <FavpollCardProvider value={{ size }}>
      <li className={cn("list-none", className)}>
        <Link href={`/events/${event.id}`}>
          <div className="group flex h-full cursor-pointer flex-col rounded-xl border border-border bg-background transition-colors duration-200 hover:border-[#AFA9EC]">
            <div className="p-5">
              {/* Occasion tag */}
              {/* <OccasionTag
              label={occasionLabel(event.occasion_label)}
              className="mb-2"
            /> */}

              <FavpollHeader
                protagonistName={event.protagonist.name}
                protagonistInitials="??"
                protagonistAvatarSrc="https://i.pravatar.cc/150?img=47"
                eyebrow={event.occasion_label}
                dateLabel={event.closes_at}
              />

              {/* Heading — topic if available, else protagonist name */}
              {topicTitle && <PollTitle title={topicTitle} />}

              {/* Description */}
              {event.description && (
                <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              )}

              <div className="space-y-3">
                <AmountInput
                  id="pledge-amount"
                  value="100"
                  onChange={() => {}}
                />
                <FavpollPledgePanel />
              </div>
              {/* <RankingList
                initialItems={event.polls[0]?.topic?.topic_items}
                eventPollId={event.polls[0]?.id}
                topicId={event.polls[0]?.topic_id}
                rankingView={rankingView}
              /> */}
            </div>

            {/* Footer */}
            <div className="mt-auto border-t border-border px-4 py-3">
              <div className="space-y-3">
                {event.charities.map((charity) => (
                  <CharityRow
                    key={charity.charity.id}
                    charity={charity.charity}
                    amountRaised={perCharity}
                  />
                ))}
              </div>
            </div>
          </div>
        </Link>
      </li>
    </FavpollCardProvider>
  )
}
