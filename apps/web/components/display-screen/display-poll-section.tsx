"use client"

import { RankingList } from "@/components/ranking-list"
import { TypedReveal } from "@/components/poll-section/typed-reveal"
import type { Favourite } from "@favpoll/types"

export type DisplayPoll = {
  id: string
  personal_reveal: string | null
  topic: {
    id: string
    title: string
  }
  items: Favourite[]
}

type Props = {
  poll: DisplayPoll
  /** The poll closed while the room watched — type the reveal out */
  justClosed?: boolean
  /** Person favpolls: names the typed finale; null for causes */
  protagonistFirstName?: string | null
}

// The display's poll block, in the event page's language: the same
// PollHeading pill and the same RankingList bars (realtime via
// useRankingItems).
//
// The reveal appears here ONLY as the witnessed finale — typed out at the
// moment the poll closes while the room is watching. On a shared screen
// the reveal is a keepsake, not signage (founder, 2026-08-02): while open
// it would spoil each guest's own post-pledge moment, and once closed a
// static quote is just noise above the standings.
export function DisplayPollSection({
  poll,
  justClosed = false,
  protagonistFirstName = null,
}: Props) {
  const revealText = poll.personal_reveal

  return (
    <section className="space-y-4" aria-label={`${poll.topic.title} rankings`}>
      {/* Projector-scale topic header (founder, 2026-08-02) — PollHeading's
          card-sized ramp reads small across a room. */}
      <h2 className="mb-6 truncate text-xl font-medium tracking-[0.09em] text-primary uppercase md:text-2xl">
        Favourite {poll.topic.title}
      </h2>

      {!!revealText && justClosed && (
        <TypedReveal
          text={revealText}
          active
          protagonistFirstName={protagonistFirstName ?? "Their"}
        />
      )}

      <RankingList
        initialItems={poll.items}
        favpollPollId={poll.id}
        topicId={poll.topic.id}
        rankingView="amount"
        size="display"
      />
    </section>
  )
}
