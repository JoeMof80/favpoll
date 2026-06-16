"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RankingList } from "@/components/ranking-list"
import { PledgePanel } from "@/components/pledge-panel"
import { PollHeading } from "@/components/poll-heading"
import type { FavpollPollWithItems } from "@favpoll/types"
import { usePollSection } from "./use-poll-section"
import { EmptyPollAlert } from "./empty-poll-alert"
import { SectionLabel } from "../favpoll-card/section-label"

type Props = {
  poll: FavpollPollWithItems
  clerkUserId: string | null
  pledgeAmount: string
  isClosed: boolean
  hasPledged: boolean
  pledgeJustConfirmed?: boolean
  protagonistName: string
  isOrganiser: boolean
  eventId: string
  onSelectionsChange: (pollId: string, selectedIds: string[]) => void
  onAddItem?: (label: string) => Promise<void>
  onViewChange?: (view: "pledge" | "results") => void
}

export function PollSection({
  poll,
  pledgeAmount,
  isClosed,
  hasPledged,
  pledgeJustConfirmed,
  protagonistName,
  isOrganiser,
  eventId,
  onSelectionsChange,
  onAddItem,
  onViewChange,
}: Props) {
  const {
    view,
    setView,
    rankingView,
    setRankingView,
    pledgeConfirmed,
    showRankings,
    handleSelectionsChange,
  } = usePollSection({
    pollId: poll.id,
    hasPledged,
    isClosed,
    pledgeJustConfirmed,
    onSelectionsChange,
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

  return (
    <section aria-label={`${poll.topics.title} poll`} className="space-y-4">
      <PollHeading
        topicTitle={poll.topics.title}
        reveal={pledged ? (poll.personal_reveal ?? null) : null}
        protagonistFirstName={personFirstName}
        onResetPledge={onResetPledge}
        onViewResults={onViewResults}
      />

      {/* Results view */}
      {view === "results" && (
        <>
          {showRankings && (
            <>
              <div className="flex items-center justify-between">
                <SectionLabel title="Results" />
                <Tabs
                  value={rankingView}
                  onValueChange={(v: string) =>
                    setRankingView(v as "amount" | "count")
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
            <PledgePanel
              items={poll.topics.favourites}
              totalAmount={pledgeAmount}
              onSelectionsChange={handleSelectionsChange}
              isInfinite={!poll.topics.is_finite}
              onAddItem={onAddItem}
              topicTitle={poll.topics.title}
            />
          )}
        </div>
      )}

      {poll.topics.favourites.every((i) => i.is_hidden ?? false) && (
        <EmptyPollAlert />
      )}
    </section>
  )
}
