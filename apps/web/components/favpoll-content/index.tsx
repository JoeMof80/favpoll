"use client"

import type { MentionTarget } from "@/lib/mentions"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Countdown } from "@/components/countdown"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { GuestBook, type WallEntry } from "@/components/guest-book"
import { ChevronRight } from "lucide-react"
import { BumpChart } from "@/components/bump-chart"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
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
import { charityNames as joinCharityNames } from "@/lib/display"
import { useFavpollContent } from "./use-favpoll-content"
import { MobileCharityFooter } from "./mobile-charity-footer"
import { StickyIdentityBar } from "./sticky-identity-bar"
import { PageLayout } from "../page-layout"
import Link from "next/link"
import { formatPounds } from "@/lib/i18n"
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
  const [storyOpen, setStoryOpen] = useState(false)

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

  // Closed: the state and its date, nothing more (founder, 2026-09-30:
  // the settled figure — zero until settlement — duplicated the
  // footer's live total, and the Keepsake door moved to the … menu).
  const stateCardInner = isClosed ? (
    <div className="space-y-1">
      <SectionEyebrow variant="muted" className="font-semibold">
        Poll closed
      </SectionEyebrow>
      {closedAt && <p className="text-sm text-muted-foreground">{closedAt}</p>}
      {/* The story's door, under the closed state (founder, 2026-09-30:
          "below the poll closed eyebrow") — the … menu keeps it on the
          phone, where there is no rail. */}
      {rankHistory && (
        <button
          type="button"
          onClick={() => setStoryOpen(true)}
          className="mt-1 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          The story of the poll
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  ) : (
    <Countdown closesAt={favpoll.closes_at} />
  )

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
  // On the phone the guest book is ONE BUTTON (founder, 2026-09-29): the
  // count is the social proof; the dialog behind it keeps the tease.
  const guestBookMobile = (
    <GuestBook
      {...guestBookProps}
      variant="button"
      expandable
      count={wallEntries.length}
    />
  )

  // Pot card RETIRED (founder, 2026-09-22): the pledge dialog's step 2
  // now shows the pot balance and has the fund toggle — the standalone
  // card was a second door to the same room, buried below the fold on
  // mobile. "Give without picking" on step 1 routes to the shared pot.

  // MENTIONS (lib/mentions): the charities and the topic under the name
  // on the card, lit in the About; the favourites join them in the note.
  const aboutMentions: MentionTarget[] = [
    ...favpoll.favpoll_charities.map((ec) => ({
      kind: "charity" as const,
      label: ec.charities.name,
      id: ec.charities.id,
    })),
    ...(pollWithItems
      ? [
          {
            kind: "topic" as const,
            label: pollWithItems.topics.title,
            id: pollWithItems.topic_id,
          },
        ]
      : []),
  ]
  // The favourites come from the FULL list (the picker's), not the
  // standings' — those are filtered to pledged items, and a note names
  // its favourite before anyone has pledged (founder, 2026-09-28: "no
  // noticeable changes!!!" on a favpoll with no pledges yet).
  const noteMentions: MentionTarget[] = [
    ...aboutMentions,
    ...(pickerPoll?.topics.favourites ?? effectiveItems).map((i) => ({
      kind: "item" as const,
      label: i.label,
    })),
  ]

  const left = (
    <>
      {/* The expanded rail halves the sheet, so the hero takes its
          compact sizes (founder, 2026-09-29: the context "breaks" when
          the guest book is expanded). */}
      {isCause ? (
        <CauseHero
          favpoll={favpoll}
          mentions={aboutMentions}
          compact={guestBookExpanded}
        />
      ) : (
        <FavpollHero
          favpoll={favpoll}
          protagonist={favpoll.protagonists!}
          mentions={aboutMentions}
          compact={guestBookExpanded}
        />
      )}

      {pollWithItems ? (
        <>
          <PollSection
            onOpenStory={rankHistory ? () => setStoryOpen(true) : undefined}
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
            noteMentions={noteMentions}
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

      {/* THE STORY OF THE POLL's overlay (founder, 2026-09-30): opened
          from the rail's closed card on desktop, from the … menu on the
          phone; the full chart at a width where the lanes and labels
          have room. */}
      {rankHistory && (
        <ResponsiveOverlay
          open={storyOpen}
          onOpenChange={setStoryOpen}
          title="The story of the poll"
          dialogClassName="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
          // Taller than the overlay's default: fifteen lanes need it.
          dialogStyle={{ maxHeight: "min(900px, 90vh)" }}
          dialogContentClassName="flex-1 overflow-y-auto px-5 pb-5"
        >
          <BumpChart history={rankHistory} title="" />
        </ResponsiveOverlay>
      )}

      {/* THE MOBILE STACK, below the standings. The countdown lives in
          the identity bar now (founder, 2026-09-29), so an open favpoll
          stacks only the guest book button; a closed one keeps its state
          card for the keepsake route back. mt-6, not the sections' 8:
          the book is the standings' tail, not a section of its own. */}
      <div className="mt-6 space-y-4 md:hidden">{guestBookMobile}</div>

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
          className="size-8 shrink-0 rounded object-cover"
        />
      ) : (
        <div className="flex size-8 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
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

  // The guest book FLOWS in the rail (founder, 2026-09-29): the rail is
  // the scroller and a long book reads as a page, as the standings do
  // on the left. The countdown and organiser pin at its top, and the
  // guest book's header pins with them (GuestBook's `pinned` slot; the
  // sticky group lives there — never top-14 inside the shell), so the
  // rail is that one panel.
  const guestBookRail = (
    <GuestBook
      {...guestBookProps}
      variant="flat"
      expanded={guestBookExpanded}
      onToggleExpand={() => setGuestBookExpanded((v) => !v)}
      pinned={
        <>
          {stateCardRail}
          {organiserCard}
        </>
      }
    />
  )
  const right = guestBookRail

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
    </PageLayout>
  )
}
