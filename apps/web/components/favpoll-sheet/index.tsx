"use client"

import type { MentionTarget } from "@/lib/mentions"
import { useState } from "react"
import { Countdown } from "@/components/countdown"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { GuestBook, type WallEntry } from "@/components/guest-book"
import { TrendingUpDown } from "lucide-react"
import { BumpChart } from "@/components/bump-chart"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import type { RankHistory } from "@/lib/rank-history"
import { FavpollHero } from "@/components/favpoll-hero"
import { CauseHero } from "@/components/cause-hero"
import { PollSection } from "@/components/poll-section"
import { FundraiserStrip } from "@/components/heroes/fundraiser-slots"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import type {
  Favourite,
  FavpollWithDetails,
  FavpollPollWithItems,
} from "@favpoll/types"
import { charityNames as joinCharityNames } from "@/lib/display"
import { PageLayout } from "../page-layout"
import Link from "next/link"
import { formatPounds } from "@/lib/i18n"
import { FavpollListCardCharityCarousel } from "@/components/favpoll-list-card/favpoll-list-card-charity-carousel"
import { GoalProgress } from "@/components/goal-progress"

// THE SHEET (2026-09-30): the favpoll as anyone sees it — hero, standings
// and the rail (countdown, organiser, guest book) under PageLayout, with
// the charity footer pinned to the standings' foot. Two surfaces render
// it: the favpoll page, in a guest's hand, wraps it in the guest layer
// (pledge dialog, identity bar, mobile charity footer) and passes the
// viewer's own standing; the live display, on the screen in the room,
// wraps it in the room layer (presenter chrome, QR codes, refresh) and
// passes no viewer at all. One layout, so a redesign of the page IS a
// redesign of the display — the display fell behind every time the two
// were separate trees (founder, 2026-09-30).

/** Who is looking: a guest on their own phone, or the room's screen. */
export type SheetPresentation = "guest" | "room"

/** The viewer's own standing on this favpoll — the guest layer's state,
 *  threaded into the standings. Absent on the room's screen, which has
 *  no guest: the standings show to the room, and the reveal never does
 *  while the poll is open (founder, 2026-08-02: on a shared screen it
 *  would spoil each guest's own moment). */
export type SheetViewer = {
  clerkUserId: string | null
  /** Entitled to the real standings and the reveal (pledged, or signed
   *  in with a pledge on record). */
  entitled: boolean
  /** The real personal note — null until entitled. */
  personalNote: string | null
  /** Whether a note exists at all (safe to know pre-pledge). */
  hasNote: boolean
  /** The real item list — may be zeroed until entitled. */
  items: Favourite[]
  pledgeJustConfirmed: boolean
  onViewChange?: (view: "pledge" | "results") => void
  /** Undefined withholds every pledge entry point (closed, or gated). */
  onOpenPledgeDialog?: () => void
  pledgesGatedNotice?: string
}

export type FavpollSheetProps = {
  favpoll: FavpollWithDetails
  /** Appeal membership, for the charity card's one-line note. */
  appeal?: { name: string; slug: string } | null
  pollWithItems: FavpollPollWithItems | null
  /** Full item list for the note's mentions — the standings' list is
   *  filtered to pledged items, and a note names its favourite before
   *  anyone has pledged (founder, 2026-09-28). */
  pickerPoll?: FavpollPollWithItems | null
  totalRaised: number
  isClosed: boolean
  isOrganiser: boolean
  wallEntries: WallEntry[]
  rankHistory: RankHistory | null
  /** One ISO date per step: the chart's dated x-axis. */
  rankHistoryDates?: string[]
  /** Organiser name + avatar for the rail card */
  organiser?: { name: string; avatarUrl: string | null } | null
  presentation?: SheetPresentation
  /** The presence dial (founder, 2026-08-02), room presentation only:
   *  "fundraiser" makes the money the hero's heading, "tribute" keeps the
   *  person there and the money quiet. The guest page is always tribute. */
  heroVariant?: "fundraiser" | "tribute"
  /** THE FINALE (founder, 2026-08-02), room presentation only: the poll
   *  closed while the room watched, so the note types out over the final
   *  standings — the one moment a shared screen shows the reveal. */
  reveal?: boolean
  /** A STILL of the sheet (the landing page's screen-in-a-room): the
   *  screen's own height for the shell, instead of the viewport's. */
  shellHeight?: string
  /** Guest presentation only. */
  viewer?: SheetViewer
  /** Rendered in the left column straight after the standings — the
   *  guest layer's pledge dialog, so it sits where it always has. */
  afterPoll?: React.ReactNode
  /** PageLayout's tail: fixed mobile chrome (identity bar, charity
   *  footer) on the guest page. */
  children?: React.ReactNode
}

export function FavpollSheet({
  favpoll,
  appeal,
  pollWithItems,
  pickerPoll,
  totalRaised,
  isClosed,
  isOrganiser,
  wallEntries,
  rankHistory,
  rankHistoryDates,
  organiser,
  presentation = "guest",
  heroVariant = "tribute",
  reveal = false,
  shellHeight,
  viewer,
  afterPoll,
  children,
}: FavpollSheetProps) {
  const room = presentation === "room"
  // The desktop rail expands to an equal split instead of opening a
  // modal (founder, 2026-09-22): the standings stay on screen, and at
  // that width the guest book's comments become readable. Mobile has no
  // columns to swap, so its own GuestBook keeps the dialog.
  // The room starts expanded: on a projector the guest book read in
  // place is the point, and nobody is there to open it.
  const [guestBookExpanded, setGuestBookExpanded] = useState(room)
  const [storyOpen, setStoryOpen] = useState(false)

  const isCause = favpoll.subject === "cause"

  // The fundraiser strip's figures come from the sheet's own data; only
  // the room turns the dial (see heroes/fundraiser-slots).
  const heroFundraiser =
    room && heroVariant === "fundraiser"
      ? {
          totalRaised,
          goalAmount: favpoll.goal_amount ?? null,
          isClosed,
        }
      : undefined

  // The person (or cause) for the fundraiser dial's row: the name and a
  // small photo.
  const personName = isCause
    ? (favpoll.cause_label ?? "")
    : (favpoll.protagonists?.name ?? "")
  const personPhoto = isCause
    ? (favpoll.photo_url ?? null)
    : (favpoll.protagonists?.photo_url ?? null)

  // THE ROOM'S STANDING: the standings show, the reveal is withheld —
  // entitled to the list, never to the note — until the finale, when the
  // note arrives as a just-confirmed pledge's does: typed out.
  const roomReveal = room && reveal
  const standing: SheetViewer = viewer ?? {
    clerkUserId: null,
    entitled: true,
    personalNote: roomReveal ? (pollWithItems?.personal_note ?? null) : null,
    hasNote: false,
    items: pollWithItems?.topics.favourites ?? [],
    pledgeJustConfirmed: roomReveal,
  }

  const closedAt = favpoll.closed_at
    ? new Date(favpoll.closed_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  // "Marie Curie", "A & B" or "A, B & C" — for the pre-pledge trust line
  const charityLine = joinCharityNames(
    favpoll.favpoll_charities.map((ec) => ({ charity: ec.charities }))
  )

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

  // Closed: the guest book's header grammar — the eyebrow with the
  // standings-history control at its right edge (the expand icon's
  // seat) — over the countdown at rest, zeroed, and the date (founder,
  // 2026-09-30). The settled figure and the Keepsake button are gone:
  // the footer carries the live total, the … menu the keepsake.
  const stateCardInner = isClosed ? (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <SectionEyebrow variant="muted" className="font-semibold">
          Poll closed
        </SectionEyebrow>
        {rankHistory && (
          <button
            type="button"
            onClick={() => setStoryOpen(true)}
            aria-label="Standings history"
            // -m-1 p-1: a 24px target without moving the icon off the eyebrow.
            className="-m-1 shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <TrendingUpDown className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <Countdown ended />
      {closedAt && <p className="text-xs text-muted-foreground">{closedAt}</p>}
    </div>
  ) : (
    <Countdown closesAt={favpoll.closes_at} />
  )

  const stateCardRail = <div className={railChrome}>{stateCardInner}</div>

  // Guest book: always visible in the rail (fills the space), but
  // entries are withheld pre-pledge — a teaser with skeleton rows
  // replaces the real list. Post-pledge it expands with real entries.
  // The room reads the book as it is: there is no pledge to tease.
  const guestBookProps = {
    entries: standing.entitled ? wallEntries : [],
    teaseBacked: !standing.entitled,
    animate: true,
    expandable: standing.entitled,
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
    ...(pickerPoll?.topics.favourites ?? standing.items).map((i) => ({
      kind: "item" as const,
      label: i.label,
    })),
  ]

  const left = (
    <>
      {/* The expanded rail halves the sheet, so the hero takes its
          compact sizes (founder, 2026-09-29: the context "breaks" when
          the guest book is expanded). */}
      {/* THE FUNDRAISER DIAL (room only; founder, 2026-09-30, settled over
          four cuts): no hero band at all. The pledge goal first, in the
          countdown card's grammar, then the person as a row in the
          organiser block's grammar — the rail's pinned pair, mirrored
          on the left. No About: the room is not reading. Tribute keeps
          the full hero. */}
      {heroFundraiser ? (
        // md:pt-[72px], not the band's pt-16: the rail's pinned countdown
        // eyebrow sits at y=72 in the room, and this strip's eyebrow is
        // its mirror (measured 64 vs 72 at pt-16).
        <div className="mb-6 pt-6 md:pt-[72px]">
          <FundraiserStrip fundraiser={heroFundraiser} />
          {/* The person's row: the name, larger than the organiser's
              (founder, 2026-09-30: "increase the name size"), no context,
              the photo at the right edge. */}
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-5">
            <h1 className="min-w-0 truncate text-xl font-medium text-foreground">
              {personName}
            </h1>
            {personPhoto ? (
              <ProtagonistAvatar
                name={personName}
                photoUrl={personPhoto}
                className="h-8 w-8 rounded border-0 md:h-8 md:w-8"
              />
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
                {personName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      ) : isCause ? (
        <CauseHero
          favpoll={favpoll}
          mentions={aboutMentions}
          compact={guestBookExpanded}
          animate={!room}
        />
      ) : (
        <FavpollHero
          favpoll={favpoll}
          protagonist={favpoll.protagonists!}
          mentions={aboutMentions}
          compact={guestBookExpanded}
          animate={!room}
        />
      )}

      {pollWithItems ? (
        <>
          <PollSection
            onOpenStory={rankHistory ? () => setStoryOpen(true) : undefined}
            poll={pollWithItems}
            clerkUserId={standing.clerkUserId}
            isClosed={isClosed}
            hasPledged={standing.entitled}
            pledgeJustConfirmed={standing.pledgeJustConfirmed}
            protagonistName={
              isCause
                ? (favpoll.cause_label ?? "")
                : (favpoll.protagonists?.name ?? "")
            }
            isCause={isCause}
            isOrganiser={isOrganiser}
            favpollId={favpoll.id}
            onViewChange={standing.onViewChange}
            entitled={standing.entitled}
            personalNote={standing.personalNote}
            noteMentions={noteMentions}
            hasNote={standing.hasNote}
            charityLine={charityLine || null}
            initialItems={standing.items}
            onOpenPledgeDialog={standing.onOpenPledgeDialog}
            pledgesGatedNotice={standing.pledgesGatedNotice}
          />
          {afterPoll}
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
          title="Standings history"
          dialogClassName="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
          // Taller than the overlay's default: fifteen lanes need it.
          dialogStyle={{ maxHeight: "min(900px, 90vh)" }}
          dialogContentClassName="flex-1 overflow-y-auto px-5 pb-5"
        >
          <BumpChart
            history={rankHistory}
            title=""
            axisLabels={rankHistoryDates}
          />
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
      shellHeight={shellHeight}
    >
      {children}
    </PageLayout>
  )
}
