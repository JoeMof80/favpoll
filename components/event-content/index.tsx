"use client"

import { Countdown } from "@/components/countdown"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { EventHero } from "@/components/event-hero"
import { CharityBanner } from "@/components/charity-banner"
import { PollSection } from "@/components/poll-section"
import { PledgeCard } from "@/components/pledge-card"
import type {
  EventWithDetails,
  EventPollWithItems,
  EventPot,
  PotAllocation,
} from "@/types"
import { useEventContent } from "./use-event-content"

type Props = {
  event: EventWithDetails
  pollsWithItems: EventPollWithItems[]
  pot: EventPot | null
  userPotAllocation: PotAllocation | null
  existingPledgesByPollId: string[]
  totalRaised: number
  isClosed: boolean
  clerkUserId: string | null
}

export function EventContent({
  event,
  pollsWithItems,
  pot,
  userPotAllocation,
  existingPledgesByPollId,
  totalRaised,
  isClosed,
  clerkUserId,
}: Props) {
  const {
    pledgeAmount,
    setPledgeAmount,
    pollSelections,
    handleSelectionsChange,
    handlePledgeSuccess,
    confirmedPollIds,
    addItemHandler,
    showPledgeCard,
    isOrganiser,
  } = useEventContent({ event, pollsWithItems, isClosed, clerkUserId })

  const existingSet = new Set(existingPledgesByPollId)
  const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" })
  const closedAt = event.closed_at
    ? new Date(event.closed_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
      {/* Left — hero + polls */}
      <div>
        <EventHero event={event} protagonist={event.protagonists} />

        {pollsWithItems.length > 0 ? (
          <div className="space-y-12">
            {pollsWithItems.map((poll) => (
              <PollSection
                key={poll.id}
                poll={poll}
                clerkUserId={clerkUserId}
                pledgeAmount={pledgeAmount}
                isClosed={isClosed}
                hasPledged={existingSet.has(poll.id)}
                pledgeJustConfirmed={confirmedPollIds.has(poll.id)}
                protagonistName={event.protagonists.name}
                onSelectionsChange={handleSelectionsChange}
                onAddItem={addItemHandler(poll)}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No polls have been set up for this event yet.
          </p>
        )}
      </div>

      {/* Right — sticky meta */}
      <div className="sticky top-20 space-y-4 self-start">
        {isClosed ? (
          <div className="rounded-lg border border-border bg-card px-5 py-4 space-y-1">
            <SectionEyebrow variant="muted" className="font-semibold">
              Poll closed
            </SectionEyebrow>
            {closedAt && (
              <p className="text-sm text-muted-foreground">{closedAt}</p>
            )}
            <p className="text-xl font-medium text-primary">
              {GBP.format(event.total_raised ?? totalRaised)}
            </p>
            <p className="text-xs text-muted-foreground">raised in total</p>
          </div>
        ) : (
          <Countdown closesAt={event.closes_at} />
        )}
        <CharityBanner
          charities={event.event_charities.map((ec) => ec.charities)}
          totalRaised={totalRaised}
        />
        {!isClosed && showPledgeCard && (
          <PledgeCard
            eventId={event.id}
            clerkUserId={clerkUserId}
            charityNames={event.event_charities.map((ec) => ec.charities.name)}
            pollsWithItems={pollsWithItems}
            pot={pot}
            userPotAllocation={userPotAllocation}
            pollSelections={pollSelections}
            onPledgeAmountChange={setPledgeAmount}
            onPledgeSuccess={handlePledgeSuccess}
          />
        )}
      </div>
    </div>
  )
}
