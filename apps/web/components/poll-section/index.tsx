"use client"

import { protagonistShortName } from "@/lib/display"
import { RankingList } from "@/components/ranking-list"
import { PollHeading } from "@/components/poll-heading"
import type { FavpollPollWithItems, Favourite } from "@favpoll/types"
import { usePollSection } from "./use-poll-section"
import { EmptyPollAlert } from "./empty-poll-alert"
import { TypedNote } from "./typed-note"
import { Button } from "../ui/button"
import { buildMechanicSteps } from "@/lib/mechanic-steps"
import { LockCardContent } from "@/components/lock-card-content"
import { Check, EllipsisVertical, Share2 } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

// oklch neutrals: 0.87 ≈ zinc-300, 0.92 ≈ zinc-200 — register-safe,
// used by both skeleton components via inline styles (Tailwind's
// bg-muted inherits the register palette and turns pink/green/purple).
const SKEL_LABEL = "oklch(0.87 0 0)"
const SKEL_BAR = "oklch(0.92 0 0)"

// Skeleton personal note — a left-bordered block of neutral lines matching
// the real TypedNote's blockquote style. Only rendered when hasNote is true.
// Uses fixed neutral grey (not bg-muted, which inherits the register palette
// and turns pink/green/purple — founder, 2026-09-21).
function NoteSkeleton() {
  return (
    <div
      className="mb-4 py-1 pl-4"
      style={{ borderLeft: `2px solid ${SKEL_BAR}` }}
    >
      <div className="space-y-2">
        <div
          className="h-4 w-4/5 rounded"
          style={{ backgroundColor: SKEL_BAR }}
        />
        <div
          className="h-4 w-3/5 rounded"
          style={{ backgroundColor: SKEL_BAR }}
        />
      </div>
    </div>
  )
}

// Skeleton standings bars — used behind the lock card (pre-pledge) and
// in the organiser's zero-pledges state. Fixed neutral grey so it reads
// as a placeholder on every register palette (bg-muted turns pink on
// celebrations — founder, 2026-09-21).
const SKELETON_WIDTHS = [1, 0.82, 0.65, 0.48, 0.32, 0.18]
function StandingsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4 py-2">
      {SKELETON_WIDTHS.slice(0, rows).map((w, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between">
            <div
              className="h-3.5 w-24 rounded"
              style={{ backgroundColor: SKEL_LABEL }}
            />
            <div
              className="h-3.5 w-10 rounded"
              style={{ backgroundColor: SKEL_LABEL }}
            />
          </div>
          <div
            className="h-1.5 rounded-full"
            style={{
              width: `${w * 100}%`,
              backgroundColor: SKEL_BAR,
            }}
          />
        </div>
      ))}
    </div>
  )
}

type Props = {
  poll: FavpollPollWithItems
  clerkUserId: string | null
  isClosed: boolean
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
  hasNote = true,
  charityLine = null,
  initialItems,
  onOpenPledgeDialog,
  pledgesGatedNotice,
}: Props) {
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
      {/* Merged header: "Favourite {topic}" — button pre-pledge, static post-pledge */}
      <div className="sticky top-[6.6875rem] z-20 bg-background md:top-(--hero-stuck-bottom,13.75rem)">
        {/* ONE heading row for all breakpoints — PollHeading left,
            ... dropdown right. Same pattern mobile and desktop. */}
        <div className="flex min-h-9 items-center gap-2 py-3">
          <div className="min-w-0 flex-1">
            <PollHeading topicTitle={poll.topics.title} inert />
          </div>
          {entitled && (
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
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Post-pledge: real reveal + real ranking list */}
      {entitled ? (
        <>
          {personalNote && (
            <div className="pb-2">
              <TypedNote
                text={personalNote}
                active={pledgeJustConfirmed ?? false}
                protagonistFirstName={personFirstName}
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
               Only the organiser sees this (guests see the lock card). */
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
        /* Pre-pledge: skeleton bars with the lock-card overlay on top.
           Replaces the old blurred decoy (founder, 2026-09-21: "I quite
           like the skeleton — replace the decoy with it"). The grid cell
           trick stays: WebKit ignores sticky inside absolutely-positioned
           ancestors, so the card pins correctly as an in-flow sibling. */
        <div className="grid">
          <div
            className="pointer-events-none [grid-area:1/1]"
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
              <span className="sticky top-[calc(7.5rem+4.25rem)] flex w-full flex-col items-center md:top-[calc(var(--hero-stuck-bottom,13.75rem)+4.25rem)]">
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
              <span className="sticky top-[calc(7.5rem+4.25rem)] flex w-full flex-col items-center md:top-[calc(var(--hero-stuck-bottom,13.75rem)+4.25rem)]">
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
