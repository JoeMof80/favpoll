"use client"

import type { MentionTarget } from "@/lib/mentions"
import { useCallback, useState, useSyncExternalStore } from "react"
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
import { RadialGoal } from "@/components/radial-goal"

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

/** The micro banner's window: the last week (founder, 2026-10-16 — a
 *  memorial favpoll that runs three weeks has its push in the last one). */
const CLOSING_SOON_MS = 7 * 24 * 60 * 60 * 1000

/** The viewer's own standing on this favpoll — the guest layer's state,
 *  threaded into the standings. Absent on the room's screen, which has
 *  no guest: the standings show to the room, and the reveal never does
 *  while the poll is open (founder, 2026-08-02: on a shared screen it
 *  would spoil each guest's own moment). */
export type SheetViewer = {
  clerkUserId: string | null
  /** Entitled to the real standings and the reveal — a pledge on record,
   *  the close, the organiser, or a suspension, which reads as a close
   *  (lib/picks-suspended). */
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
  /** The picks are in (lib/picks-suspended): the lock card teaches the
   *  pot's path, the standings say they are frozen — guest and room. */
  picksSuspended?: boolean
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
  /** The still again: a static hero (no pinning, no portalled mark) for
   *  a picture of a page. The ROOM pins as the guest page does
   *  (founder, 2026-10-17: "band and photo aren't sticky on live. the
   *  brandmark isn't clickable. So you obviously aren't using the same
   *  components") — the hero's own mark is the room's mark now. */
  still?: boolean
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
  picksSuspended = false,
  isOrganiser,
  wallEntries,
  rankHistory,
  rankHistoryDates,
  organiser,
  presentation = "guest",
  heroVariant = "tribute",
  still = false,
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

  // "Marie Curie", "A & B" or "A, B & C" — for the pre-pledge trust line
  const charityLine = joinCharityNames(
    favpoll.favpoll_charities.map((ec) => ({ charity: ec.charities }))
  )

  // The fundraiser strip's figures come from the sheet's own data; only
  // the room turns the dial (see heroes/fundraiser-slots).
  const heroFundraiser =
    room && heroVariant === "fundraiser"
      ? {
          totalRaised,
          goalAmount: favpoll.goal_amount ?? null,
          isClosed,
          charityLabel:
            favpoll.favpoll_charities.length > 1
              ? `${favpoll.favpoll_charities.length} charities`
              : charityLine || null,
        }
      : undefined

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

  // THE MICRO BANNER (founder, 2026-10-16: "a micro banner at the very
  // top that is only visible as the favpoll approaches its deadline"):
  // the phone's countdown, passed to the hero only inside the last
  // CLOSING_SOON_MS. Beyond that a countdown is furniture; inside it, a
  // signal. Nothing once closed — the lock card says so, and when. The
  // desktop keeps the rail's countdown.
  const closingSoon = useClosingSoon(isClosed ? null : favpoll.closes_at)
  const closingBanner = closingSoon ? (
    <Countdown closesAt={favpoll.closes_at!} variant="banner" />
  ) : undefined

  const closedAt = favpoll.closed_at
    ? new Date(favpoll.closed_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

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
      {/* THE FUNDRAISER DIAL (mock, founder 2026-10-17, third cut: "keep
          the left column the same as tribute view, except remove the
          About. in the right column, add the telethon dial to the top"):
          the hero as it is, band and photo and all, with no About — the
          room is not reading — and the goal card at the rail's top, over
          the countdown. Tribute keeps the About. */}
      {isCause ? (
        <CauseHero
          hideAbout={!!heroFundraiser}
          favpoll={favpoll}
          mentions={aboutMentions}
          compact={guestBookExpanded}
          pins={!still}
          banner={closingBanner}
        />
      ) : (
        <FavpollHero
          hideAbout={!!heroFundraiser}
          favpoll={favpoll}
          protagonist={favpoll.protagonists!}
          mentions={aboutMentions}
          compact={guestBookExpanded}
          pins={!still}
          banner={closingBanner}
        />
      )}

      {/* THE HEADER PINS from the shell breakpoint on the guest page (2026-10-15: the band and
          photo at the top, the name on the eyebrow's line); the room's is
          static, as it has been since 2026-09-30. */}
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
            picksSuspended={picksSuspended}
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
      <div className="mt-6 space-y-4 shell:hidden">{guestBookMobile}</div>

      {/* THE FOOTER IS THE COLUMN'S FLOOR (founder, 2026-10-01): pushed
          to the bottom when the standings are short (the spacer takes
          the slack), sticky over them when long, and its charity row
          sits the sheet's inset above the bottom — the same margin the
          top of the page keeps — with the sheet's white beneath. */}
      <div className="hidden shell:block shell:flex-1" aria-hidden="true" />
      {/* EDGE TO EDGE (founder, 2026-10-15: "extend the width of the charity
          block so the card shadow isn't visible when scrolling past"): the
          footer bleeds across the shell's gutters (page-layout's
          shellGutter, shell:pl-16 shell:pr-8) and pads its content back in, so
          the lock card's shadow passing beneath is covered to the column's
          edges, not just to its content box. z-30, above the sticky poll
          heading (z-20): on a short column the heading's natural position
          met the pinned footer and painted over it (founder, 2026-10-15:
          "Topic shouldn't be on top of charity"); the footer is the floor
          and everything in the column passes beneath it. WHITE WITH A
          HAIRLINE, not the band's muted (founder, 2026-10-16: tried the same
          day and reverted here — the phone's footer keeps it): the band is a
          56px strip and this is three times that, so matching tones read as
          a strip above and a slab below, not a frame. */}
      <div className="sticky bottom-0 z-30 mt-8 hidden border-t border-border bg-background pt-5 pb-[var(--shell-inset)] shell:-mr-8 shell:-ml-16 shell:block shell:pr-8 shell:pl-16">
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
        {/* On the room's fundraiser dial the goal card at the top carries
            the GOAL and names the charity, so the footer keeps the total
            beside the charity (founder, 2026-09-30: "include the total in
            the footer still") but drops the goal caption and the bar —
            the goal is said once. */}
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
            !heroFundraiser && favpoll.goal_amount
              ? totalRaised >= favpoll.goal_amount
                ? `${formatPounds(favpoll.goal_amount)} goal reached`
                : `of the ${formatPounds(favpoll.goal_amount)} goal`
              : undefined
          }
        />
        {!heroFundraiser && favpoll.goal_amount ? (
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
  // THE TELETHON DIAL AT THE RAIL'S TOP (mock, founder 2026-10-17): the
  // goal card in the countdown card's grammar, exactly as the dial was
  // first built (heroes/fundraiser-slots), over the countdown. THE BAR
  // IS THE HAIRLINE (founder, 2026-09-30): the goal's bar straddles the
  // card's bottom edge, where the rail's divider runs, so the line
  // beneath this card is the bar; without a goal, the divider itself.
  const dialRail = heroFundraiser && (
    /* THE RADIAL COUNTDOWN where the photo hangs on the hero (founder,
       2026-10-17: "no need for countdown if we have radial countdown.
       remove band but keep radial"): 80px, keylined, its top on the
       photo's line (16 from the rail's top: this card starts at the
       pinned group's pt-15, so -top-11). The ring is the countdown; the
       digits card is gone. pt-5: the eyebrow's text on the hero's
       eyebrow line (measured 76 vs 88 at pt-2), which also carries the
       figures clear of the dial's bottom edge at 96. Only the eyebrow's
       row runs under the dial, and "Pledge goal" is short. */
    // paddingBottom 84 (founder, 2026-10-17: "increase vertical space to
    // match the name hero"): the card's bottom on the hero's — measured,
    // the hero's context ends at 194 and the topic heading starts at
    // 218; this card ended at 154 with pb-5, so 64 more. The organiser
    // row then begins where the topic heading begins. Inline: a fresh
    // utility is invisible to a running dev server.
    // pt-3: the group's pt-15 (60) plus 12 puts the card's eyebrow row at
    // 72, the hero's own line (the figure then stands at 112, as the name
    // does); pb-4 brings the organiser row to the topic heading's line.
    // The dial's top is the photo's, 16 from the rail's top: the card's
    // box starts at 60 (its pt-3 is inside it), so -top-11.
    // pb-5, the rail's own rhythm (founder, 2026-10-17: "shorten the
    // card" — the padding that held the countdown card on the topic
    // heading's line read as empty space; the card ends under its
    // figures and the countdown card rides up).
    <div className="relative pt-3 pb-5">
      {/* THE RADIAL GOAL at the right over the goal figure, the eyebrow
          back at the left (founder, 2026-10-17: "reverse the radial and
          the eyebrow back. Make the radial refer to the total rather
          than the countdown"). */}
      {heroFundraiser.goalAmount && (
        <div
          className="absolute -top-11 right-0 rounded-full border-4 border-background bg-background shadow-sm"
          style={{ width: 80, height: 80 }}
        >
          <RadialGoal
            totalRaised={totalRaised}
            goalAmount={heroFundraiser.goalAmount}
            size={72}
          />
        </div>
      )}
      {/* THE RAIL'S OWN DIRECTION (founder, 2026-10-17: "text should be
          smaller as the column is narrower"): the rail is 376 at rest
          and half the sheet expanded, so this card is compact at REST
          and full with the guest book expanded — the hero's opposite,
          each following its own column. */}
      <FundraiserStrip
        fundraiser={heroFundraiser}
        scale="hero"
        compact={!guestBookExpanded}
      />
      {/* No context line: the rail's own countdown card follows this one
          (founder, 2026-10-17: "replace the countdown with the normal
          countdown block"). */}
      {/* No goal bar beneath (founder, 2026-10-17: "remove the countdown
          line" — the bar; the ring carries the goal). The rail's own
          divider closes the card. */}
    </div>
  )

  const guestBookRail = (
    <GuestBook
      {...guestBookProps}
      variant="flat"
      // The rail's top: on the hero's eyebrow line (pt-15 — band 56 +
      // strip 16, less the row's own 20, plus the eyebrow's 8), in both
      // modes: the dial's goal card takes the countdown's line.
      pinnedTop="pt-15"
      expanded={guestBookExpanded}
      onToggleExpand={() => setGuestBookExpanded((v) => !v)}
      pinned={
        heroFundraiser ? (
          <>
            {dialRail}
            {stateCardRail}
            {organiserCard}
          </>
        ) : (
          <>
            {stateCardRail}
            {organiserCard}
          </>
        )
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
      // The bottom inset: 64px on both surfaces (the room's 72 was the
      // first dial's line; gone with it, 2026-10-17).
      shellInset="64px"
    >
      {children}
    </PageLayout>
  )
}

/** Whether the close is inside the banner's window — read from the clock
 *  as an external store (a minute's tick), so render stays pure and the
 *  server's answer matches the client's except in the minute the
 *  threshold passes. Null = no close, or closed: never soon. */
function useClosingSoon(closesAt: string | null | undefined) {
  const subscribe = useCallback((onChange: () => void) => {
    const id = setInterval(onChange, 60_000)
    return () => clearInterval(id)
  }, [])
  const read = useCallback(
    () =>
      !!closesAt && new Date(closesAt).getTime() - Date.now() < CLOSING_SOON_MS,
    [closesAt]
  )
  return useSyncExternalStore(subscribe, read, read)
}
