"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RankingList } from "@/components/ranking-list"
import { PollHeading } from "@/components/poll-heading"
import type { FavpollPollWithItems, Favourite } from "@favpoll/types"
import { usePollSection } from "./use-poll-section"
import { EmptyPollAlert } from "./empty-poll-alert"
import { DecoyResults } from "./decoy-results"
import { PollReveal } from "../favpoll-card/poll-reveal"

type RankingView = "amount" | "count"

type Props = {
  poll: FavpollPollWithItems
  clerkUserId: string | null
  isClosed: boolean
  hasPledged: boolean
  pledgeJustConfirmed?: boolean
  protagonistName: string
  isOrganiser: boolean
  favpollId: string
  onViewChange?: (view: "pledge" | "results") => void
  /** Whether the viewer is entitled to see real reveal + results */
  entitled: boolean
  /** Real personal_reveal — null until entitled */
  personalReveal: string | null
  /** Real item list — may be zeroed until entitled */
  initialItems: Favourite[]
  /** Called when the merged header-button is clicked pre-pledge */
  onOpenPledgeDialog?: () => void
  /** @deprecated — kept for backwards compat with Storybook/tests */
  pledgeTrigger?: React.ReactNode
}

export function PollSection({
  poll,
  isClosed,
  hasPledged,
  pledgeJustConfirmed,
  protagonistName,
  isOrganiser,
  onViewChange,
  entitled,
  personalReveal,
  initialItems,
  onOpenPledgeDialog,
}: Props) {
  const { rankingView, setRankingView } = usePollSection({
    pollId: poll.id,
    hasPledged,
    isClosed,
    pledgeJustConfirmed,
    onSelectionsChange: () => {},
    onViewChange,
  })

  const personFirstName = protagonistName.split(/[\s&]+/)[0]
  const hasItems = poll.topics.favourites.length > 0

  return (
    <section aria-label={`${poll.topics.title} poll`} className="space-y-4">
      {/* Merged header: topic label + pledge trigger pre-pledge */}
      <div className="sticky top-40 z-20 md:top-55">
        <PollHeading
          topicTitle={poll.topics.title}
          reveal={entitled ? personalReveal : null}
          protagonistFirstName={personFirstName}
        />
      </div>

      {/* Post-pledge: real reveal + real ranking list */}
      {entitled ? (
        <>
          {personalReveal && (
            <PollReveal
              personalReveal={personalReveal}
              protagonistFirstName={personFirstName}
              role="status"
              aria-live="polite"
            />
          )}

          {hasItems && (
            <>
              <div className="sticky top-40 z-20 flex items-center justify-end md:top-55">
                <Tabs
                  value={rankingView}
                  onValueChange={(v: string) =>
                    setRankingView(v as RankingView)
                  }
                >
                  <TabsList className="h-7">
                    <TabsTrigger value="amount" className="px-3 text-xs">
                      By amount
                    </TabsTrigger>
                    <TabsTrigger value="count" className="px-3 text-xs">
                      By pledges
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <RankingList
                initialItems={initialItems}
                favpollPollId={poll.id}
                topicId={poll.topic_id}
                rankingView={rankingView}
                isOrganiser={isOrganiser}
              />
            </>
          )}
        </>
      ) : (
        /* Pre-pledge: blurred decoy + pledge CTA */
        <div className="space-y-4">
          <div className="relative">
            <div
              className="pointer-events-none blur-sm select-none"
              aria-hidden="true"
            >
              <DecoyResults
                items={poll.topics.favourites}
                topicTitle={poll.topics.title}
              />
            </div>
          </div>

          {!isClosed && onOpenPledgeDialog && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={onOpenPledgeDialog}
            >
              Pledge to reveal
            </Button>
          )}

          {isClosed && (
            <p className="text-sm text-muted-foreground">
              This poll has closed.
            </p>
          )}
        </div>
      )}

      {poll.topics.favourites.every((i) => i.is_hidden ?? false) && (
        <EmptyPollAlert />
      )}
    </section>
  )
}
