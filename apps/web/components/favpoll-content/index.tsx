"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Countdown } from "@/components/countdown"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { FavpollHero } from "@/components/favpoll-hero"
import { CauseHero } from "@/components/cause-hero"
import { CharityBanner } from "@/components/charity-banner"
import { PollSection } from "@/components/poll-section"
import { PledgeDialog } from "@/components/pledge-dialog"
import { SeedFundModal } from "@/components/favpoll-form/seed-fund-modal"
import type {
  FavpollWithDetails,
  FavpollPollWithItems,
  FavpollPot,
  PotAllocation,
} from "@favpoll/types"
import { useFavpollContent } from "./use-favpoll-content"
import { FavpollListCardCharityCarousel } from "../favpoll-list-card/favpoll-list-card-charity-carousel"
import { PageLayout } from "../page-layout"
import { Gift } from "lucide-react"

type Props = {
  favpoll: FavpollWithDetails
  pollWithItems: FavpollPollWithItems | null
  pot: FavpollPot | null
  userPotAllocation: PotAllocation | null
  hasPledged: boolean
  totalRaised: number
  isClosed: boolean
  clerkUserId: string | null
  isOrganiser: boolean
  entitled: boolean
}

export function FavpollContent({
  favpoll,
  pollWithItems,
  pot,
  userPotAllocation,
  hasPledged: _hasPledged,
  totalRaised,
  isClosed,
  clerkUserId,
  isOrganiser,
  entitled,
}: Props) {
  const router = useRouter()
  const [showGuestFund, setShowGuestFund] = useState(false)
  const [pledgeDialogOpen, setPledgeDialogOpen] = useState(false)

  const {
    handlePledgeSuccess,
    pledgeConfirmed,
    addItemHandler,
    handleViewChange,
    localEntitled,
    effectiveReveal,
    effectiveItems,
  } = useFavpollContent({
    favpoll,
    pollWithItems,
    isClosed,
    clerkUserId,
    entitled,
  })

  const isCause = favpoll.subject === "cause"
  const isListed = favpoll.is_listed ?? true
  const fundAvailable = pot ? pot.total_deposited - pot.total_allocated : 0

  const GBP = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  })
  const closedAt = favpoll.closed_at
    ? new Date(favpoll.closed_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  const perCharity =
    favpoll.favpoll_charities.length > 0
      ? totalRaised / favpoll.favpoll_charities.length
      : 0

  const charityNames = favpoll.favpoll_charities.map((ec) => ec.charities.name)

  const pledgeDialog =
    !isClosed && pollWithItems ? (
      <PledgeDialog
        favpollId={favpoll.id}
        clerkUserId={clerkUserId}
        charityNames={charityNames}
        pollWithItems={pollWithItems}
        pot={pot}
        userPotAllocation={userPotAllocation}
        onPledgeSuccess={handlePledgeSuccess}
        onAddItem={addItemHandler(pollWithItems)}
        isListed={isListed}
        open={pledgeDialogOpen}
        onOpenChange={setPledgeDialogOpen}
      />
    ) : null

  const left = (
    <>
      {isCause ? (
        <CauseHero favpoll={favpoll} />
      ) : (
        <FavpollHero favpoll={favpoll} protagonist={favpoll.protagonists!} />
      )}

      {pollWithItems ? (
        <>
          <PollSection
            poll={pollWithItems}
            clerkUserId={clerkUserId}
            isClosed={isClosed}
            hasPledged={localEntitled}
            pledgeJustConfirmed={pledgeConfirmed}
            protagonistName={
              isCause
                ? (favpoll.cause_label ?? "")
                : (favpoll.protagonists?.name ?? "")
            }
            isOrganiser={isOrganiser}
            favpollId={favpoll.id}
            onViewChange={handleViewChange}
            entitled={localEntitled}
            personalReveal={effectiveReveal}
            initialItems={effectiveItems}
            onOpenPledgeDialog={
              !isClosed ? () => setPledgeDialogOpen(true) : undefined
            }
          />
          {pledgeDialog}
        </>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No poll has been set up for this favpoll yet.
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
            {GBP.format(favpoll.total_raised ?? totalRaised)}
          </p>
          <p className="text-xs text-muted-foreground">raised in total</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <Countdown closesAt={favpoll.closes_at} />
        </div>
      )}

      <CharityBanner
        charities={favpoll.favpoll_charities.map((ec) => ec.charities)}
        totalRaised={totalRaised}
      />

      {/* Guest shared fund contribution card — always shown on open favpolls */}
      {!isClosed && pot && (
        <div className="rounded-lg border border-border bg-background px-5 py-4">
          <p className="mt-1 text-sm text-muted-foreground">
            <b>{GBP.format(fundAvailable)}</b> available for guests who need
            help to pledge.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3 flex w-full"
            onClick={() => setShowGuestFund(true)}
          >
            <Gift size={4} />
            Add to the shared fund
          </Button>
        </div>
      )}
    </>
  )

  return (
    <PageLayout left={left} right={right}>
      {showGuestFund && (
        <SeedFundModal
          favpollId={favpoll.id}
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
      {favpoll.favpoll_charities.length > 0 && (
        <div
          className="fixed right-0 bottom-0 left-0 z-20 border-t border-border bg-background px-4 py-3 md:hidden"
          style={{
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          <FavpollListCardCharityCarousel
            charities={favpoll.favpoll_charities.map((ec) => ({
              charity: ec.charities,
            }))}
            perCharity={perCharity}
          />
        </div>
      )}
    </PageLayout>
  )
}
