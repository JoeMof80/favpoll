"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RankingList } from "@/components/ranking-list"
import { PledgePanel } from "@/components/pledge-panel"
import { PollHeading } from "@/components/poll-heading"
import type { EventPollWithItems } from "@favpoll/types"
import { Button } from "@/components/ui/button"
import { usePollSection } from "./use-poll-section"

type Props = {
  poll: EventPollWithItems
  clerkUserId: string | null
  pledgeAmount: string
  isClosed: boolean
  hasPledged: boolean
  pledgeJustConfirmed?: boolean
  protagonistName: string
  isOrganiser: boolean
  onSelectionsChange: (pollId: string, selectedIds: string[]) => void
  onAddItem?: (label: string) => Promise<void>
}

export function PollSection({
  poll,
  pledgeAmount,
  isClosed,
  hasPledged,
  pledgeJustConfirmed,
  protagonistName,
  isOrganiser,
  onSelectionsChange,
  onAddItem,
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
  })

  const personFirstName = protagonistName.split(/[\s&]+/)[0]
  const pledged = view === "results" && pledgeConfirmed

  return (
    <section aria-label={`${poll.topics.title} poll`} className="space-y-4">
      <PollHeading
        topicTitle={poll.topics.title}
        reveal={pledged ? (poll.personal_reveal ?? null) : null}
        protagonistFirstName={personFirstName}
        pledged={pledged}
      />

      {/* Results view */}
      {view === "results" && (
        <>
          {showRankings && (
            <>
              <div className="flex items-center justify-end">
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
                initialItems={poll.topics.topic_items}
                eventPollId={poll.id}
                topicId={poll.topic_id}
                rankingView={rankingView}
                isOrganiser={isOrganiser}
              />
              {!isClosed && (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setView("pledge")}
                  className="mt-4 h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                >
                  {hasPledged ? "Change my pledge" : "Make a pledge"}
                </Button>
              )}
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
              items={poll.topics.topic_items}
              totalAmount={pledgeAmount}
              onSelectionsChange={handleSelectionsChange}
              isInfinite={!poll.topics.is_finite}
              onAddItem={onAddItem}
            />
          )}
          {(hasPledged || isClosed) && (
            <Button
              type="button"
              variant="link"
              onClick={() => setView("results")}
              className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
            >
              ← See results
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
