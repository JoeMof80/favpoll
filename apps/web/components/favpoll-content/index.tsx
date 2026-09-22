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
import Link from "next/link"
import { formatPounds, formatPoundsExact } from "@/lib/i18n"
import { FavpollListCardCharityCarousel } from "@/components/favpoll-list-card/favpoll-list-card-charity-carousel"
import { GoalProgress } from "@/components/goal-progress"

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
  gatedCharityNames = [],
  showGuestAmounts = false,
  organiser,
}: Props) {
  const router = useRouter()
  const [pledgeDialogOpen, setPledgeDialogOpen] = useState(false)
  // The desktop rail expands to an equal split instead of opening a
  // modal (founder, 2026-09-22): the standings stay on screen, and at
  // that width the guest book's comments become readable. Mobile has no
  // columns to swap, so its own GuestBook keeps the dialog.
  const [guestBookExpanded, setGuestBookExpanded] = useState(false)

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
  //
  // The two surfaces have DIFFERENT chrome (2026-09-22): the desktop rail
  // is a divided column, so its rows are flat and the divider does the
  // separating; the mobile stack keeps the bordered cards. `railChrome`
  // is applied to the rail copy only.
  // The rail COLUMN carries the horizontal gutter; rows set rhythm only.
  const railChrome = "py-5"
  const cardChrome = "rounded-lg border border-border bg-card px-5 py-4"

  const stateCardInner = isClosed ? (
    <div className="space-y-1">
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
    <Countdown closesAt={favpoll.closes_at} />
  )

  const stateCardMobile = <div className={cardChrome}>{stateCardInner}</div>
  const stateCardRail = <div className={railChrome}>{stateCardInner}</div>

  // Guest book: always visible in the rail (fills the space), but
  // entries are withheld pre-pledge — a teaser with skeleton rows
  // replaces the real list. Post-pledge it expands with real entries.
  const guestBookProps = {
    entries: localEntitled ? wallEntries : [],
    teaseBacked: !localEntitled,
    animate: true,
    expandable: localEntitled,
  }
  const guestBookMobile = <GuestBook {...guestBookProps} />
  // flex-1: the rail is a flex column, so the guest book takes the
  // height the cards above it leave and scrolls its list internally.
  const guestBookRail = (
    <GuestBook
      {...guestBookProps}
      variant="flat"
      className="flex-1"
      expanded={guestBookExpanded}
      onToggleExpand={() => setGuestBookExpanded((v) => !v)}
    />
  )

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
        {stateCardMobile}
        {guestBookMobile}
      </div>

      <div className="sticky bottom-0 z-10 mt-8 hidden border-t border-border bg-background py-5 md:block">
        {appeal && (
          <p className="mb-2 truncate border-b border-border pb-2 text-xs text-muted-foreground">
            Part of{" "}
            <Link
              href={`/appeals/${appeal.slug}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {appeal.name}
            </Link>
          </p>
        )}
        <FavpollListCardCharityCarousel
          charities={favpoll.favpoll_charities.map((ec) => ({
            charity: ec.charities,
          }))}
          size="lg"
          perCharity={
            favpoll.goal_amount
              ? totalRaised
              : totalRaised / Math.max(1, favpoll.favpoll_charities.length)
          }
          amountCaption={
            favpoll.goal_amount
              ? totalRaised >= favpoll.goal_amount
                ? `${formatPounds(favpoll.goal_amount)} goal reached`
                : `of the ${formatPounds(favpoll.goal_amount)} goal`
              : undefined
          }
        />
        {favpoll.goal_amount ? (
          <GoalProgress
            totalRaised={totalRaised}
            goalAmount={favpoll.goal_amount}
            className="mt-4 h-1"
          />
        ) : null}
      </div>
    </>
  )

  const organiserCard = organiser && (
    <div className={`flex items-center gap-3 ${railChrome}`}>
      {organiser.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={organiser.avatarUrl}
          alt={organiser.name}
          className="size-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {organiser.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {organiser.name}
        </p>
        <p className="text-xs text-muted-foreground">Organiser</p>
      </div>
    </div>
  )

  const right = (
    <>
      {stateCardRail}
      {organiserCard}
      {guestBookRail}
    </>
  )

  return (
    // appShell: the favpoll page is the only surface built for the
    // two-pane desktop shell — the rail runs to the page bottom and the
    // charity footer pins inside the left scroller.
    <PageLayout
      left={left}
      right={right}
      appShell
      railExpanded={guestBookExpanded}
    >
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
