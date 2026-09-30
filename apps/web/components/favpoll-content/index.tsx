"use client"

import { useEffect, useState } from "react"
import type { WallEntry } from "@/components/guest-book"
import type { RankHistory } from "@/lib/rank-history"
import { PledgeDialog } from "@/components/pledge-dialog"
import type {
  FavpollWithDetails,
  FavpollPollWithItems,
  FavpollPot,
  PotAllocation,
} from "@favpoll/types"
import { useFavpollContent } from "./use-favpoll-content"
import { MobileCharityFooter } from "./mobile-charity-footer"
import { StickyIdentityBar } from "./sticky-identity-bar"
import { FavpollSheet, type SheetViewer } from "@/components/favpoll-sheet"

// THE GUEST LAYER (2026-09-30): the favpoll page in a guest's hand. The
// sheet (components/favpoll-sheet) is the favpoll as anyone sees it; this
// wraps it in what only a guest has — the pledge dialog, their own
// standing (entitled, the note, the real list), the identity bar and the
// mobile charity footer. The live display wraps the same sheet in the
// room layer instead.

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
  /** One ISO date per step: the chart's dated x-axis. */
  rankHistoryDates?: string[]
  /** Charities that haven't yet consented to receive pledges (consent-first
   * posture only) — non-empty withholds every pledge entry point. */
  gatedCharityNames?: string[]
  /** Organiser has enabled show_guest_amounts — thread to pledge dialog */
  showGuestAmounts?: boolean
  /** Organiser name + avatar for the rail card */
  organiser?: { name: string; avatarUrl: string | null } | null
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
  rankHistoryDates,
  gatedCharityNames = [],
  showGuestAmounts = false,
  organiser,
}: Props) {
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

  const viewer: SheetViewer = {
    clerkUserId,
    entitled: localEntitled,
    personalNote: effectiveNote,
    hasNote,
    items: effectiveItems,
    pledgeJustConfirmed: pledgeConfirmed,
    onViewChange: handleViewChange,
    onOpenPledgeDialog:
      !isClosed && !pledgesGated ? () => setPledgeDialogOpen(true) : undefined,
    pledgesGatedNotice,
  }

  return (
    <FavpollSheet
      favpoll={favpoll}
      appeal={appeal}
      pollWithItems={pollWithItems}
      pickerPoll={pickerPoll}
      totalRaised={totalRaised}
      isClosed={isClosed}
      isOrganiser={isOrganiser}
      wallEntries={wallEntries}
      rankHistory={rankHistory}
      rankHistoryDates={rankHistoryDates}
      organiser={organiser}
      presentation="guest"
      viewer={viewer}
      afterPoll={pledgeDialog}
    >
      <StickyIdentityBar
        name={
          favpoll.subject === "cause"
            ? (favpoll.cause_label ?? "")
            : (favpoll.protagonists?.name ?? "")
        }
        photoUrl={favpoll.protagonists?.photo_url}
        closesAt={isClosed ? null : favpoll.closes_at}
        closedLabel={
          isClosed ? `Poll closed${closedAt ? ` · ${closedAt}` : ""}` : null
        }
      />
      <MobileCharityFooter
        charities={favpoll.favpoll_charities.map((ec) => ec.charities)}
        totalRaised={totalRaised}
        goalAmount={favpoll.goal_amount ?? null}
        appeal={appeal}
      />
    </FavpollSheet>
  )
}
