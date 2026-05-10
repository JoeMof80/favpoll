"use client"

import { useCallback, useEffect, useState } from "react"
import { RankingList } from "@/components/ranking-list"
import { PledgePanel } from "@/components/pledge-panel"
import type { EventPollWithItems } from "@/types"

type Props = {
  poll: EventPollWithItems
  clerkUserId: string | null
  pledgeAmount: string
  isClosed: boolean
  hasPledged: boolean
  onSelectionsChange: (pollId: string, selectedIds: string[]) => void
  onAddItem?: (label: string) => Promise<void>
}

export function PollSection({
  poll,
  clerkUserId,
  pledgeAmount,
  isClosed,
  hasPledged,
  onSelectionsChange,
  onAddItem,
}: Props) {
  const [view, setView] = useState<"pledge" | "results">(
    hasPledged || isClosed ? "results" : "pledge"
  )

  useEffect(() => {
    if (hasPledged && view === "pledge") setView("results")
  }, [hasPledged]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectionsChange = useCallback(
    (selectedIds: string[]) => onSelectionsChange(poll.id, selectedIds),
    [poll.id, onSelectionsChange]
  )

  const topicTitle = poll.topics.title
  const heading = poll.personal_framing ?? topicTitle
  const isInfinite = !poll.topics.is_finite

  return (
    <section aria-labelledby={`poll-heading-${poll.id}`} className="space-y-5">
      {/* Heading */}
      <div>
        <h2
          id={`poll-heading-${poll.id}`}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          {topicTitle}
        </h2>
        {poll.personal_framing && (
          <p className="mt-1 text-sm text-muted-foreground">{heading}</p>
        )}
        {poll.personal_quote && (
          <blockquote className="mt-3 border-l-2 border-primary/40 pl-3 text-sm text-muted-foreground italic">
            {poll.personal_quote}
          </blockquote>
        )}
      </div>

      {/* Results view */}
      {view === "results" && (
        <>
          <RankingList
            initialItems={poll.topics.topic_items}
            eventPollId={poll.id}
            topicId={poll.topic_id}
          />
          {!isClosed && (
            <button
              type="button"
              onClick={() => setView("pledge")}
              className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus:ring-2 focus:ring-ring focus:outline-none"
            >
              {hasPledged ? "Change my pledge" : "Make a pledge"}
            </button>
          )}
        </>
      )}

      {/* Pledge view */}
      {view === "pledge" && (
        <div className="space-y-5">
          {!clerkUserId ? (
            <div className="rounded-lg border border-border bg-card px-5 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                <a
                  href="/sign-in"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Sign in
                </a>{" "}
                to make a pledge for this poll.
              </p>
            </div>
          ) : isClosed ? (
            <div className="rounded-lg border border-border bg-muted/30 px-5 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                This poll has closed.
              </p>
            </div>
          ) : (
            <PledgePanel
              items={poll.topics.topic_items}
              totalAmount={pledgeAmount}
              onSelectionsChange={handleSelectionsChange}
              isInfinite={isInfinite}
              onAddItem={onAddItem}
            />
          )}
          {(hasPledged || isClosed) && (
            <button
              type="button"
              onClick={() => setView("results")}
              className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus:ring-2 focus:ring-ring focus:outline-none"
            >
              ← See results
            </button>
          )}
        </div>
      )}
    </section>
  )
}
