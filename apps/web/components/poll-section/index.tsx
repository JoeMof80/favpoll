"use client"

import Link from "next/link"
import type { MentionTarget } from "@/lib/mentions"
import { protagonistShortName } from "@/lib/display"
import { RankingList } from "@/components/ranking-list"
import { PollHeading } from "@/components/poll-heading"
import type { FavpollPollWithItems, Favourite } from "@favpoll/types"
import { usePollSection } from "./use-poll-section"
import { EmptyPollAlert } from "./empty-poll-alert"
import { TypedNote } from "./typed-note"
import { Button } from "../ui/button"
import { buildMechanicSteps } from "@/lib/mechanic-steps"
import { Badge } from "@/components/ui/badge"
import { LockCardContent } from "@/components/lock-card-content"
import {
  TrendingUpDown,
  Check,
  EllipsisVertical,
  Share2,
  FileHeart,
  Sun,
  Moon,
} from "lucide-react"
import { useTheme } from "@favpoll/ui"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  NoteSkeleton,
  StandingsSkeleton,
} from "@/components/standings-skeleton"

type Props = {
  poll: FavpollPollWithItems
  clerkUserId: string | null
  isClosed: boolean
  /** A closed favpoll with enough pledges: the story-of-the-poll door
   *  in the … menu on the PHONE (founder, 2026-09-30); on desktop the
   *  rail's closed card carries it. */
  onOpenStory?: () => void
  hasPledged: boolean
  pledgeJustConfirmed?: boolean
  protagonistName: string
  /** True for cause-type favpolls — suppresses the protagonist name in the unlock copy */
  isCause: boolean
  isOrganiser: boolean
  favpollId: string
  onViewChange?: (view: "pledge" | "results") => void
  /** Whether the viewer is entitled to see real reveal + results */
  entitled: boolean
  /** Real personal_note — null until entitled */
  personalNote: string | null
  /** The charity, topic and favourites, lit in the note (lib/mentions). */
  noteMentions?: MentionTarget[]
  /**
   * Whether a reveal exists at all (safe to know pre-pledge). Drives the lock
   * copy: a favpoll without a reveal must offer the results, not promise a
   * disclosure that never comes. Defaults true for existing callers/stories.
   */
  hasNote?: boolean
  /** Content-free quote flag — step 3 promises "their own words". */
  /** e.g. "Marie Curie" or "A & B" — renders the pre-pledge trust line */
  charityLine?: string | null
  /** Consent gate — set when pledging is withheld awaiting the charity's
   * agreement; renders as a quiet notice in the lock slot in place of the
   * pledge CTA (which arrives via onOpenPledgeDialog being undefined). */
  pledgesGatedNotice?: string
  /** The picks are in (lib/picks-suspended): the lock card teaches the
   *  pot's path and the standings say they are frozen. */
  picksSuspended?: boolean
  /** The room's presenter items (view, manage, full screen), slotted at
   *  the top of the heading's ⋮ — ONE menu on both surfaces (founder,
   *  2026-10-17: "render exactly the favpoll components on the live
   *  page"). */
  menuExtras?: React.ReactNode
  /** Real item list — may be zeroed until entitled */
  initialItems: Favourite[]
  /** Called when the merged header-button is clicked pre-pledge */
  onOpenPledgeDialog?: () => void
  /** @deprecated — kept for backwards compat with Storybook/tests */
  pledgeTrigger?: React.ReactNode
}

export function PollSection({
  poll,
  isClosed,
  hasPledged,
  pledgeJustConfirmed,
  protagonistName,
  isCause,
  isOrganiser,
  onViewChange,
  entitled,
  personalNote,
  noteMentions,
  hasNote = true,
  charityLine = null,
  initialItems,
  onOpenPledgeDialog,
  pledgesGatedNotice,
  favpollId,
  onOpenStory,
  picksSuspended = false,
  menuExtras,
}: Props) {
  const { resolvedTheme, setTheme } = useTheme()
  const { rankingView, setRankingView } = usePollSection({
    pollId: poll.id,
    hasPledged,
    isClosed,
    pledgeJustConfirmed,
    onSelectionsChange: () => {},
    onViewChange,
  })

  const personFirstName = protagonistShortName(protagonistName)
  // Causes get no possessive at all: "Winter Appeal for the Trussell
  // Trust's favourite" overflowed the pill AND reads wrong — a cause's
  // reveal is "our pick", not a personal favourite (found on-device,
  // 2026-07-29). displayFirstName stays person-only.
  const displayFirstName = isCause ? null : personFirstName
  const hasItems = poll.topics.favourites.length > 0

  // The lock overlay is often a cold guest's FIRST favpoll contact (QR on
  // a wake table) — it must teach the mechanic, not just gate the content
  // (founder, 2026-08-01). One card, CTA and steps at equal prominence;
  // the steps come from lib/mechanic-steps so the print pack's table
  // cards carry IDENTICAL instructions.
  // The lock card cannot render on a suspended favpoll: a suspension
  // makes the page read as a closed one (lib/picks-suspended), so the
  // viewer is entitled and there is nothing to cover. Its copy knows
  // nothing about suspension for the same reason.
  const lockSteps = buildMechanicSteps({
    topicTitle: poll.topics.title,
    charityLine,
    hasNote: hasNote,
  })

  // "A note" covers favourite and message reveals alike (founder,
  // 2026-09-17) — the old favourite/message fork is gone.
  const unlockAriaLabel = !hasNote
    ? "Pledge your favourite to see the results"
    : "Pledge to see a personal note and the results"

  return (
    <section
      aria-label={`Favourite ${poll.topics.title} poll`}
      className="space-y-4"
    >
      {/* Merged header: "Favourite {topic}" — button pre-pledge, static post-pledge.
          At every width it pins at the hero's band's edge
          (--hero-stuck-bottom, constants in hero-layout since 2026-10-16:
          the identity bar and the docking name are gone). */}
      <div
        // Sticky on both surfaces — the hero's band pins in the room too
        // now (2026-10-17), so there is something to pin under. pt-10: the
        // hero's photo hangs 40px below the band's edge, where this pins;
        // the padding is inside the sticky box, painted, so the row's ⋮
        // clears the photo and nothing shows through. The lock card's
        // offset below counts it.
        className="sticky top-(--hero-stuck-bottom,13.75rem) z-20 bg-background pt-10"
      >
        {/* ONE heading row for all breakpoints — PollHeading left,
            ... dropdown right. Same pattern mobile and desktop. */}
        <div className="flex min-h-9 items-center gap-2 py-3">
          <div className="min-w-0 flex-1">
            <PollHeading topicTitle={poll.topics.title} inert />
          </div>
          {picksSuspended && !isClosed && (
            /* THE PICKS ARE IN (founder, 2026-10-02): a state mark at the
               thing it affects, on every viewport and in the room. The
               lock card's steps still say why for the guest who hasn't
               pledged; nothing allocates after this, so the standings
               hold until the close. */
            <Badge variant="warning" className="shrink-0">
              Picks suspended
            </Badge>
          )}
          {/* THE MENU IS EVERYONE'S (founder, 2026-10-16: "a new user
              might want to adjust at least the theme without moving away
              from the page" — the ⋮ next to the topic). The standings
              views are the entitled reader's; share and the theme are
              anyone's; the keepsake is the closed favpoll's. */}
          {
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="View options"
                  className="shrink-0"
                >
                  <EllipsisVertical className="size-5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {menuExtras && (
                  <>
                    {menuExtras}
                    <DropdownMenuSeparator />
                  </>
                )}
                {entitled && (
                  <>
                    <DropdownMenuItem onSelect={() => setRankingView("amount")}>
                      Amount
                      {rankingView === "amount" && (
                        <Check className="ml-auto size-4" aria-hidden="true" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setRankingView("count")}>
                      Pledges
                      {rankingView === "count" && (
                        <Check className="ml-auto size-4" aria-hidden="true" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {/* The keepsake's door on a closed favpoll (founder,
                    2026-09-30: not a button on the rail's state card). */}
                {entitled && onOpenStory && (
                  <DropdownMenuItem
                    onSelect={onOpenStory}
                    className="shell:hidden"
                  >
                    Standings history
                    <TrendingUpDown
                      className="ml-auto size-4"
                      aria-hidden="true"
                    />
                  </DropdownMenuItem>
                )}
                {isClosed && (
                  <DropdownMenuItem asChild>
                    <Link href={`/favpolls/${favpollId}/keepsake`}>
                      Keepsake
                      <FileHeart
                        className="ml-auto size-4"
                        aria-hidden="true"
                      />
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onSelect={() => {
                    // ShareFavpollButton's convention (founder call,
                    // 2026-07-29): native sheet only on touch — desktop
                    // share sheets are patchy, the desktop convention is
                    // copy-link. The old navigator.share-only item did
                    // NOTHING on desktop.
                    const coarse = window.matchMedia(
                      "(hover: none) and (pointer: coarse)"
                    ).matches
                    if (coarse && navigator.share) {
                      navigator
                        .share({
                          title: `Favourite ${poll.topics.title}`,
                          url: window.location.href,
                        })
                        .catch(() => {})
                      return
                    }
                    void navigator.clipboard
                      .writeText(window.location.href)
                      .then(() => toast("Link copied"))
                  }}
                >
                  Share
                  <Share2 className="ml-auto size-4" aria-hidden="true" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                >
                  {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
                  {resolvedTheme === "dark" ? (
                    <Sun className="ml-auto size-4" aria-hidden="true" />
                  ) : (
                    <Moon className="ml-auto size-4" aria-hidden="true" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        </div>
      </div>

      {/* Post-pledge: real reveal + real ranking list */}
      {entitled ? (
        <>
          {/* NOTHING STANDS BETWEEN A LATECOMER AND THE PAGE (founder,
              2026-10-04). A suspended favpoll reads as a closed one, so
              there is no card here: the standings and the note are simply
              out, and the only way left to give is the Pledge FAB. The
              mechanic needs no teaching once there is no pick to make —
              the charity footer names where the money goes and the pledge
              dialog says the pot's path as it takes the amount. */}
          {personalNote && (
            <div className="pb-2">
              <TypedNote
                text={personalNote}
                active={pledgeJustConfirmed ?? false}
                protagonistFirstName={personFirstName}
                mentions={noteMentions}
              />
            </div>
          )}

          {hasItems ? (
            <>
              {/* Old desktop tabs row removed — Amount/Pledges now
                  live in the ... dropdown on the topic heading. */}
              <RankingList
                initialItems={initialItems}
                favpollPollId={poll.id}
                topicId={poll.topic_id}
                rankingView={rankingView}
                isOrganiser={isOrganiser}
              />
            </>
          ) : (
            /* No pledges yet — skeleton with a quiet card on top.
               Only the organiser sees this (guests see the lock card).
               The skeleton shows at EVERY width here, unlike the lock card's
               below: the quiet card is one line, so the skeleton reads around it
               (founder, 2026-10-16: "we need skeletons here since they aren't
               obscured by the note"). */
            <div className="grid">
              <div
                className="pointer-events-none [grid-area:1/1]"
                aria-hidden="true"
              >
                <StandingsSkeleton rows={6} />
              </div>
              <div className="pointer-events-none z-10 flex items-start justify-center pt-6 [grid-area:1/1]">
                <div className="w-full max-w-xs rounded-xl bg-background px-5 py-4 text-center shadow-xl ring-1 ring-border">
                  <p className="text-sm text-muted-foreground">
                    Standings appear here as guests pledge.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* SKELETON FROM lg ONLY (founder, 2026-10-15/16: "skeletons seem
           pointless here because they are obscured by the pledge card"): in
           the single column the lock card covers nearly the whole block and
           the skeleton showed as slivers around it; in the shell there is room
           above and below for it to read as the standings-to-come. Below the shell breakpoint
           the cell is the lock card's own height; the organiser's zero-pledges
           skeleton above follows the same rule. */
        /* Pre-pledge: skeleton bars with the lock-card overlay on top.
           Replaces the old blurred decoy (founder, 2026-09-21: "I quite
           like the skeleton — replace the decoy with it"). The grid cell
           trick stays: WebKit ignores sticky inside absolutely-positioned
           ancestors, so the card pins correctly as an in-flow sibling. */
        <div className="grid">
          <div
            className="pointer-events-none hidden [grid-area:1/1] shell:block"
            aria-hidden="true"
          >
            {hasNote && <NoteSkeleton />}
            <StandingsSkeleton rows={6} />
          </div>

          {onOpenPledgeDialog && (
            /* Only the CARD is clickable (founder, 2026-08-02) — the old
               full-area ghost button caught scroll-arresting taps on
               mobile and gave the whole blur a pointer cursor. The
               wrapper passes events through; the card hovers with the
               list cards' lift idiom. */
            <div className="pointer-events-none z-10 flex flex-col items-center pt-4 [grid-area:1/1]">
              <span className="sticky top-[calc(var(--hero-stuck-bottom,13.75rem)+6.75rem)] flex w-full flex-col items-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onOpenPledgeDialog}
                  aria-label={unlockAriaLabel}
                  className="pointer-events-auto h-auto w-full max-w-sm flex-col items-stretch gap-0 overflow-hidden rounded-xl border-0 bg-background/95 p-0 text-left whitespace-normal shadow-xl ring-1 ring-border transition-all duration-300 hover:bg-background/95 hover:shadow-2xl motion-safe:hover:-translate-y-0.5"
                >
                  {/* Shared with the landing demo so the two cannot drift —
                      see components/lock-card-content.tsx. */}
                  <LockCardContent
                    steps={lockSteps}
                    topicTitle={poll.topics.title}
                  />
                </Button>
              </span>
            </div>
          )}

          {!onOpenPledgeDialog && pledgesGatedNotice && (
            /* CONSENT GATE — the CTA's slot carries a quiet notice while
               the charity hasn't yet agreed to receive pledges. Same
               sticky geometry as the lock card so it sits where guests
               expect the way in to be. */
            <div className="pointer-events-none z-10 flex flex-col items-center pt-4 [grid-area:1/1]">
              <span className="sticky top-[calc(var(--hero-stuck-bottom,13.75rem)+6.75rem)] flex w-full flex-col items-center">
                <div className="pointer-events-auto w-full max-w-sm rounded-xl bg-background/95 px-5 py-4 text-center shadow-xl ring-1 ring-border">
                  <p className="text-sm text-muted-foreground">
                    {pledgesGatedNotice}
                  </p>
                </div>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Only show when there ARE items and they're all hidden (organiser
          hid every one). An empty array means no pledges yet, not "all
          hidden" — .every() on [] returns true, which would incorrectly
          trigger the alert (founder, 2026-09-21). */}
      {poll.topics.favourites.length > 0 &&
        poll.topics.favourites.every((i) => i.is_hidden ?? false) && (
          <EmptyPollAlert />
        )}
    </section>
  )
}
