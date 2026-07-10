"use client"

import { PollHeading } from "@/components/poll-heading"
import { PollReveal } from "@/components/favpoll-card/poll-reveal"
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
  /** Closed favpolls show the reveal; open ones withhold it (see below) */
  isClosed?: boolean
  /** The poll closed while the room watched — type the reveal out */
  justClosed?: boolean
  /** Person favpolls: names the lock pill; null for causes */
  protagonistFirstName?: string | null
}

// The display's poll block, in the event page's language: the same
// PollHeading pill, the same RankingList bars (realtime via
// useRankingItems), and the same withhold-then-disclose reveal treatment.
//
// While the poll is OPEN the reveal is withheld — showing it to the room
// would spoil each guest's own post-pledge reveal moment and could bias
// their pick. The blurred decoy + lock pill advertise the mechanic instead
// (the QR beside it is the way in). When the poll closes, the display
// discloses the reveal — the room's collective finale.
export function DisplayPollSection({
  poll,
  isClosed = false,
  justClosed = false,
  protagonistFirstName = null,
}: Props) {
  const revealText = poll.personal_reveal
  const hasReveal = !!revealText

  return (
    <section className="space-y-4" aria-label={`${poll.topic.title} rankings`}>
      <PollHeading topicTitle={poll.topic.title} />

      {/* While OPEN the poll column carries no reveal at all — the lock
          hint lives in the banner beside the name (a blurred decoy on a
          projector is just noise). The reveal appears here only as the
          finale: typed out at the live close, static once closed. */}
      {hasReveal &&
        (isClosed || justClosed) &&
        (justClosed ? (
          <TypedReveal
            text={revealText!}
            active
            protagonistFirstName={protagonistFirstName ?? "Their"}
          />
        ) : (
          <PollReveal
            personalReveal={revealText!}
            protagonistFirstName={protagonistFirstName ?? undefined}
          />
        ))}

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
