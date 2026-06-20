"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Countdown } from "@/components/countdown"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { EventHero } from "@/components/event-hero"
import { CauseHero } from "@/components/cause-hero"
import { CharityBanner } from "@/components/charity-banner"
import { PollSection } from "@/components/poll-section"
import { PledgeDialog } from "@/components/pledge-dialog"
import { SeedFundModal } from "@/components/event-form-v2/seed-fund-modal"
import type {
  FavpollWithDetails,
  FavpollPollWithItems,
  FavpollPot,
  PotAllocation,
} from "@favpoll/types"
import { useEventContent } from "./use-event-content"
import { EventCardCharityCarousel } from "../event-card/event-card-charity-carousel"
import { PageLayout } from "../page-layout"

type Props = {
  event: FavpollWithDetails
  pollWithItems: FavpollPollWithItems | null
  pot: FavpollPot | null
  userPotAllocation: PotAllocation | null
  hasPledged: boolean
  totalRaised: number
  isClosed: boolean
  clerkUserId: string | null
  isOrganiser: boolean
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
  isOrganiser,
}: Props) {
  const router = useRouter()
  const [showGuestFund, setShowGuestFund] = useState(false)

  const {
    handlePledgeSuccess,
    pledgeConfirmed,
    addItemHandler,
    showPledgeCard,
    handleViewChange,
  } = useEventContent({
    event,
    pollWithItems,
    isClosed,
    hasPledged,
    clerkUserId,
  })

  const isCause = event.subject === "cause"
  const isListed = event.is_listed ?? true
  const fundAvailable =
    pot && pot.total_deposited > 0
      ? pot.total_deposited - pot.total_allocated
      : 0

  const GBP = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  })
  const closedAt = event.closed_at
    ? new Date(event.closed_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  const perCharity =
    event.favpoll_charities.length > 0
      ? totalRaised / event.favpoll_charities.length
      : 0

  const charityNames = event.favpoll_charities.map((ec) => ec.charities.name)

  const pledgeDialog =
    !isClosed && showPledgeCard && pollWithItems ? (
      <PledgeDialog
        eventId={event.id}
        clerkUserId={clerkUserId}
        charityNames={charityNames}
        pollWithItems={pollWithItems}
        pot={pot}
        userPotAllocation={userPotAllocation}
        onPledgeSuccess={handlePledgeSuccess}
        onAddItem={addItemHandler(pollWithItems)}
        isListed={isListed}
      />
    ) : null

  const left = (
    <>
      {isCause ? (
        <CauseHero event={event} />
      ) : (
        <EventHero event={event} protagonist={event.protagonists!} />
      )}

      {pollWithItems ? (
        <PollSection
          poll={pollWithItems}
          clerkUserId={clerkUserId}
          isClosed={isClosed}
          hasPledged={hasPledged}
          pledgeJustConfirmed={pledgeConfirmed}
          protagonistName={
            isCause
              ? (event.cause_label ?? "")
              : (event.protagonists?.name ?? "")
          }
          isOrganiser={isOrganiser}
          eventId={event.id}
          onViewChange={handleViewChange}
          pledgeTrigger={pledgeDialog}
        />
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No poll has been set up for this event yet.
        </p>
      )}
    </>
  )

  const right = (
    <>
      {isClosed ? (
        <div className="space-y-1 rounded-lg border border-border bg-card px-5 py-4">
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
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <Countdown closesAt={event.closes_at} />
        </div>
      )}

      {/* Guest shared fund contribution card */}
      {!isClosed && pot && pot.total_deposited > 0 && (
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Help others take part
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {fundAvailable > 0
              ? `${GBP.format(fundAvailable)} is available for guests who can't pledge on their own.`
              : "There's a shared fund for this favpoll."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => setShowGuestFund(true)}
          >
            Add to the shared fund
          </Button>
        </div>
      )}

      <CharityBanner
        charities={event.favpoll_charities.map((ec) => ec.charities)}
        totalRaised={totalRaised}
      />
    </>
  )

  return (
    <PageLayout left={left} right={right}>
      {showGuestFund && (
        <SeedFundModal
          eventId={event.id}
          variant="guest"
          isListed={isListed}
          onComplete={() => {
            setShowGuestFund(false)
            router.refresh()
          }}
          onCancel={() => setShowGuestFund(false)}
        />
      )}
      {/* Fixed charity carousel — mobile only, always visible */}
      {event.favpoll_charities.length > 0 && (
        <div
          className="fixed right-0 bottom-0 left-0 z-20 border-t border-border bg-background px-4 py-3 md:hidden"
          style={{
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          <EventCardCharityCarousel
            charities={event.favpoll_charities.map((ec) => ({
              charity: ec.charities,
            }))}
            perCharity={perCharity}
          />
        </div>
      )}
    </PageLayout>
  )
}
