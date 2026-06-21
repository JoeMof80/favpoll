"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RankingList } from "@/components/ranking-list"
import { PollHeading } from "@/components/poll-heading"
import type { FavpollPollWithItems } from "@favpoll/types"
import { usePollSection } from "./use-poll-section"
import { EmptyPollAlert } from "./empty-poll-alert"
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
  /** Rendered in the pledge view in place of the old PledgePanel trigger. */
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
  pledgeTrigger,
}: Props) {
  const {
    view,
    setView,
    rankingView,
    setRankingView,
    pledgeConfirmed,
    showRankings,
  } = usePollSection({
    pollId: poll.id,
    hasPledged,
    isClosed,
    pledgeJustConfirmed,
    onSelectionsChange: () => {},
    onViewChange,
  })

  const personFirstName = protagonistName.split(/[\s&]+/)[0]
  const pledged = view === "results" && pledgeConfirmed

  function changeView(v: "pledge" | "results") {
    setView(v)
    onViewChange?.(v)
  }

  const onResetPledge =
    view === "results" && !isClosed && showRankings
      ? () => changeView("pledge")
      : undefined

  const onViewResults =
    view === "pledge" && (hasPledged || isClosed)
      ? () => changeView("results")
      : undefined

  const reveal = pledged ? (poll.personal_reveal ?? null) : null

  return (
    <section aria-label={`${poll.topics.title} poll`} className="space-y-4">
      <div className="sticky top-40 z-20 md:top-55">
        <PollHeading
          topicTitle={poll.topics.title}
          reveal={pledged ? (poll.personal_reveal ?? null) : null}
          protagonistFirstName={personFirstName}
          onResetPledge={onResetPledge}
          onViewResults={onViewResults}
        />
      </div>

      {reveal && (
        <PollReveal
          personalReveal={reveal}
          protagonistFirstName={personFirstName}
          role="status"
          aria-live="polite"
        />
      )}

      {/* Results view */}
      {view === "results" && (
        <>
          {showRankings && (
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
                initialItems={poll.topics.favourites}
                eventPollId={poll.id}
                topicId={poll.topic_id}
                rankingView={rankingView}
                isOrganiser={isOrganiser}
              />
            </>
          )}
        </>
      )}

      {/* Pledge view */}
      {view === "pledge" && (
        <div className="space-y-5">
          {isClosed ? (
            <p className="text-sm text-muted-foreground">
              This poll has closed.
            </p>
          ) : (
            (pledgeTrigger ?? null)
          )}
        </div>
      )}

      {poll.topics.favourites.every((i) => i.is_hidden ?? false) && (
        <EmptyPollAlert />
      )}
    </section>
  )
}
