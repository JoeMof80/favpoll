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
} from "@favpoll/types"
import { useEventContent } from "./use-event-content"

type Props = {
  event: EventWithDetails
  pollWithItems: EventPollWithItems | null
  pot: EventPot | null
  userPotAllocation: PotAllocation | null
  hasPledged: boolean
  totalRaised: number
  isClosed: boolean
  clerkUserId: string | null
}

export function EventContent({
  event,
  pollWithItems,
  pot,
  userPotAllocation,
  hasPledged,
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
    pledgeConfirmed,
    addItemHandler,
    showPledgeCard,
    isOrganiser,
  } = useEventContent({ event, pollWithItems, isClosed, clerkUserId })

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

        {pollWithItems ? (
          <PollSection
            poll={pollWithItems}
            clerkUserId={clerkUserId}
            pledgeAmount={pledgeAmount}
            isClosed={isClosed}
            hasPledged={hasPledged}
            pledgeJustConfirmed={pledgeConfirmed}
            protagonistName={event.protagonists.name}
            onSelectionsChange={handleSelectionsChange}
            onAddItem={addItemHandler(pollWithItems)}
          />
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No poll has been set up for this event yet.
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
        {!isClosed && showPledgeCard && pollWithItems && (
          <PledgeCard
            eventId={event.id}
            clerkUserId={clerkUserId}
            charityNames={event.event_charities.map((ec) => ec.charities.name)}
            pollWithItems={pollWithItems}
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
