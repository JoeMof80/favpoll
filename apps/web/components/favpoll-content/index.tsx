"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Countdown } from "@/components/countdown"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { GuestWall, type GuestWallEntry } from "@/components/guest-wall"
import { BumpChart } from "@/components/bump-chart"
import type { RankHistory } from "@/lib/rank-history"
import { FavpollHero } from "@/components/favpoll-hero"
import { CauseHero } from "@/components/cause-hero"
import { CharityBanner } from "@/components/charity-banner"
import { ShareFavpollButton } from "@/components/share-favpoll-button"
import { PollSection } from "@/components/poll-section"
import { PledgeDialog } from "@/components/pledge-dialog"
import { SeedFundModal } from "@/components/favpoll-form/seed-fund-modal"
import type {
  FavpollWithDetails,
  FavpollPollWithItems,
  FavpollPot,
  PotAllocation,
} from "@favpoll/types"
import { charityNames as joinCharityNames } from "@/lib/display"
import { useFavpollContent } from "./use-favpoll-content"
import { FavpollListCardCharityCarousel } from "../favpoll-list-card/favpoll-list-card-charity-carousel"
import { PageLayout } from "../page-layout"
import { Gift, FileText } from "lucide-react"
import { formatPoundsExact } from "@/lib/i18n"

type Props = {
  favpoll: FavpollWithDetails
  pollWithItems: FavpollPollWithItems | null
  pot: FavpollPot | null
  userPotAllocation: PotAllocation | null
  totalRaised: number
  isClosed: boolean
  clerkUserId: string | null
  isOrganiser: boolean
  entitled: boolean
  /** Whether a personal reveal exists (content withheld until entitled) */
  hasReveal: boolean
  wallEntries: GuestWallEntry[]
  rankHistory: RankHistory | null
}

export function FavpollContent({
  favpoll,
  pollWithItems,
  pot,
  userPotAllocation,
  totalRaised,
  isClosed,
  clerkUserId,
  isOrganiser,
  entitled,
  hasReveal,
  wallEntries,
  rankHistory,
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
  // "Marie Curie", "A & B" or "A, B & C" — for the pre-pledge trust line
  const charityLine = joinCharityNames(
    favpoll.favpoll_charities.map((ec) => ({ charity: ec.charities }))
  )
  const impactStatements = favpoll.favpoll_charities
    .map((ec) => ec.charities.impact_statement)
    .filter((s): s is string => !!s && s.trim().length > 0)

  const pledgeDialog =
    // No suggestTip override: memorials once defaulted the tip to None
    // (quietest ask) — dropped 2026-07-31 on celebrant feedback: a None
    // default simply stays None; nobody read the ask as insensitive.
    !isClosed && pollWithItems ? (
      <PledgeDialog
        favpollId={favpoll.id}
        clerkUserId={clerkUserId}
        charityNames={charityNames}
        impactStatements={impactStatements}
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
            isCause={isCause}
            isOrganiser={isOrganiser}
            favpollId={favpoll.id}
            onViewChange={handleViewChange}
            entitled={localEntitled}
            personalReveal={effectiveReveal}
            hasReveal={hasReveal}
            charityLine={charityLine || null}
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

      {rankHistory && (
        <div className="mt-8 rounded-lg border border-border bg-card px-5 py-5">
          <BumpChart history={rankHistory} />
        </div>
      )}
    </>
  )

  const displayTitle =
    favpoll.subject === "cause"
      ? (favpoll.cause_label ?? "favpoll")
      : (favpoll.protagonists?.name ?? "favpoll")

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
            {formatPoundsExact(favpoll.total_raised ?? totalRaised)}
          </p>
          <p className="text-xs text-muted-foreground">raised in total</p>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mt-3 flex w-full"
          >
            <a href={`/favpolls/${favpoll.id}/keepsake`}>
              <FileText data-icon="inline-start" aria-hidden="true" />
              Keepsake
            </a>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <Countdown closesAt={favpoll.closes_at} />
        </div>
      )}

      <CharityBanner
        charities={favpoll.favpoll_charities.map((ec) => ec.charities)}
        totalRaised={totalRaised}
        goalAmount={favpoll.goal_amount ?? null}
      />

      {/* Desktop share lives in the rail (the actions column); the FAB
          remains the mobile surface */}
      <ShareFavpollButton
        shareTitle={`${displayTitle} — favpoll`}
        className="w-full"
      />

      <GuestWall
        entries={wallEntries}
        teaseBacked={!localEntitled}
        animate
        expandable
      />

      {/* Guest shared fund contribution card — always shown on open favpolls.
          Carries both jobs explicitly: how to USE the fund (pledge step) and
          how to GIVE to it (the button). */}
      {!isClosed && pot && (
        <div className="rounded-lg border border-border bg-background px-5 py-4">
          <p className="mt-1 text-sm text-muted-foreground">
            <b>{formatPoundsExact(fundAvailable)}</b> in the shared fund, for
            any guest who needs help to pledge.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {fundAvailable > 0
              ? "To use it, pick “Use shared fund” when you pledge — or top it up for others."
              : "Top it up so every guest can take part."}
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
