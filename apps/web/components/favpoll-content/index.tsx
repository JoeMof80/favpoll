"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Countdown } from "@/components/countdown"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { GuestBook, type WallEntry } from "@/components/guest-book"
import { BumpChart } from "@/components/bump-chart"
import type { RankHistory } from "@/lib/rank-history"
import { FavpollHero } from "@/components/favpoll-hero"
import { CauseHero } from "@/components/cause-hero"
import { CharityBanner } from "@/components/charity-banner"
import { PollSection } from "@/components/poll-section"
import { PledgeDialog } from "@/components/pledge-dialog"
import type {
  FavpollWithDetails,
  FavpollPollWithItems,
  FavpollPot,
  PotAllocation,
} from "@favpoll/types"
import {
  charityNames as joinCharityNames,
  getFavpollHeadline,
} from "@/lib/display"
import { useFavpollContent } from "./use-favpoll-content"
import { MobileCharityFooter } from "./mobile-charity-footer"
import { StickyIdentityBar } from "./sticky-identity-bar"
import { PageLayout } from "../page-layout"
import { FileText } from "lucide-react"
import { formatPoundsExact } from "@/lib/i18n"

type Props = {
  favpoll: FavpollWithDetails
  /** Appeal membership, for the charity card's one-line note. */
  appeal?: { name: string; slug: string } | null
  pollWithItems: FavpollPollWithItems | null
  /** Full item list for the picker — when the standings filter removes
   *  unpledged items, the picker still needs the complete catalogue. */
  pickerPoll?: FavpollPollWithItems | null
  pot: FavpollPot | null
  userPotAllocation: PotAllocation | null
  totalRaised: number
  isClosed: boolean
  clerkUserId: string | null
  isOrganiser: boolean
  entitled: boolean
  /** Whether a personal reveal exists (content withheld until entitled) */
  hasNote: boolean
  wallEntries: WallEntry[]
  rankHistory: RankHistory | null
  /** Charities that haven't yet consented to receive pledges (consent-first
   * posture only) — non-empty withholds every pledge entry point. */
  gatedCharityNames?: string[]
  /** Organiser has enabled show_guest_amounts — thread to pledge dialog */
  showGuestAmounts?: boolean
}

export function FavpollContent({
  favpoll,
  appeal,
  pollWithItems,
  pickerPoll,
  pot,
  userPotAllocation,
  totalRaised,
  isClosed,
  clerkUserId,
  isOrganiser,
  entitled,
  hasNote,
  wallEntries,
  rankHistory,
  gatedCharityNames = [],
  showGuestAmounts = false,
}: Props) {
  const router = useRouter()
  const [pledgeDialogOpen, setPledgeDialogOpen] = useState(false)

  // The Pledge FAB (in FavpollSubheader, a sibling) dispatches this
  // event to open the dialog without prop-drilling through the server
  // component that renders both.
  useEffect(() => {
    const handler = () => setPledgeDialogOpen(true)
    window.addEventListener("favpoll:pledge", handler)
    return () => window.removeEventListener("favpoll:pledge", handler)
  }, [])

  const {
    handlePledgeSuccess,
    pledgeConfirmed,
    addItemHandler,
    handleViewChange,
    localEntitled,
    effectiveNote,
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

  // CONSENT GATE — pledging is withheld while a charity hasn't agreed to
  // receive money. Same posture the server actions enforce; hiding the
  // controls is courtesy, the actions are the permission check.
  const pledgesGated = gatedCharityNames.length > 0
  const pledgesGatedNotice =
    !isClosed && pledgesGated
      ? `Pledges open once ${gatedCharityNames.join(" & ")} ${
          gatedCharityNames.length > 1 ? "confirm" : "confirms"
        }.`
      : undefined

  const closedAt = favpoll.closed_at
    ? new Date(favpoll.closed_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

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
    !isClosed && !pledgesGated && pollWithItems ? (
      <PledgeDialog
        favpollId={favpoll.id}
        clerkUserId={clerkUserId}
        charityNames={charityNames}
        impactStatements={impactStatements}
        pollWithItems={pickerPoll ?? pollWithItems}
        pot={pot}
        userPotAllocation={userPotAllocation}
        onPledgeSuccess={handlePledgeSuccess}
        // Withheld when the organiser has turned guest additions off. The
        // server action checks this too — hiding a control is not a
        // permission check.
        onAddItem={
          favpoll.allow_guest_items === false
            ? undefined
            : addItemHandler(pollWithItems)
        }
        showGuestAmounts={showGuestAmounts}
        isListed={isListed}
        open={pledgeDialogOpen}
        onOpenChange={setPledgeDialogOpen}
      />
    ) : null

  // The rail's cards, shared with the MOBILE STACK below the standings
  // (founder, 2026-09-18): PageLayout hides the right column below md,
  // which left phones with no countdown, no keepsake link on closed
  // favpolls, no guest book and no pot card. The charity banner is NOT
  // in the stack — the fixed mobile charity footer already carries
  // charity + total + goal, and twice on one screen is noise.
  const stateCard = isClosed ? (
    <div className="space-y-1 rounded-lg border border-border bg-card px-5 py-4">
      <SectionEyebrow variant="muted" className="font-semibold">
        Poll closed
      </SectionEyebrow>
      {closedAt && <p className="text-sm text-muted-foreground">{closedAt}</p>}
      <p className="text-xl font-medium text-primary">
        {formatPoundsExact(favpoll.total_raised ?? totalRaised)}
      </p>
      <p className="text-xs text-muted-foreground">raised in total</p>
      {/* Outline at default height, matching the pot card's
          top-up button (founder, 2026-09-14: "larger too"). */}
      <Button asChild variant="outline" className="mt-3 flex w-full">
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
  )

  // Guest book gated on entitlement (founder, 2026-09-22): part of the
  // reward, like the standings. The live display shows it to everyone
  // (the room's projector is not an individual guest surface).
  const guestBook = localEntitled ? (
    <GuestBook entries={wallEntries} animate expandable />
  ) : null

  // Pot card RETIRED (founder, 2026-09-22): the pledge dialog's step 2
  // now shows the pot balance and has the fund toggle — the standalone
  // card was a second door to the same room, buried below the fold on
  // mobile. "Give without picking" on step 1 routes to the shared pot.

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
            personalNote={effectiveNote}
            hasNote={hasNote}
            charityLine={charityLine || null}
            initialItems={effectiveItems}
            onOpenPledgeDialog={
              !isClosed && !pledgesGated
                ? () => setPledgeDialogOpen(true)
                : undefined
            }
            pledgesGatedNotice={pledgesGatedNotice}
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

      {/* THE MOBILE STACK — the rail's cards, below the standings.
          State first (and the keepsake route back on closed favpolls),
          social proof under the results it animates, then the pot. */}
      <div className="mt-8 space-y-4 md:hidden">
        {stateCard}
        {guestBook}
      </div>
    </>
  )

  const right = (
    <>
      {stateCard}

      <CharityBanner
        charities={favpoll.favpoll_charities.map((ec) => ec.charities)}
        totalRaised={totalRaised}
        appeal={appeal}
        goalAmount={favpoll.goal_amount ?? null}
      />

      {/* Share removed from the rail — it lives in the ... dropdown
          on the topic heading now (founder, 2026-09-11). */}

      {guestBook}
    </>
  )

  return (
    <PageLayout left={left} right={right}>
      <StickyIdentityBar
        name={
          favpoll.subject === "cause"
            ? (favpoll.cause_label ?? "")
            : (favpoll.protagonists?.name ?? "")
        }
        eyebrow={
          getFavpollHeadline({
            occasionType: favpoll.occasion_type ?? null,
            name: "",
            openingLine: favpoll.opening_line ?? null,
            subject: favpoll.subject,
          }).prefix
        }
        photoUrl={favpoll.protagonists?.photo_url}
      />
      <MobileCharityFooter
        charities={favpoll.favpoll_charities.map((ec) => ec.charities)}
        totalRaised={totalRaised}
        goalAmount={favpoll.goal_amount ?? null}
        appeal={appeal}
      />
    </PageLayout>
  )
}
