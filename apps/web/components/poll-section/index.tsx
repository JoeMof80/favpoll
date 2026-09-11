"use client"

import { protagonistShortName } from "@/lib/display"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RankingList } from "@/components/ranking-list"
import { RankingBar } from "@/components/ui/ranking-bar"
import { PollHeading } from "@/components/poll-heading"
import type { FavpollPollWithItems, Favourite } from "@favpoll/types"
import { usePollSection } from "./use-poll-section"
import { EmptyPollAlert } from "./empty-poll-alert"
import { PollReveal } from "../favpoll-card/poll-reveal"
import { TypedReveal } from "./typed-reveal"
import { Button } from "../ui/button"
import { ShareFavpollButton } from "@/components/share-favpoll-button"
import { decoyWidth } from "@/lib/decoys"
import { buildMechanicSteps } from "@/lib/mechanic-steps"
import { LockCardContent } from "@/components/lock-card-content"
import { Check, EllipsisVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

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
  /** Real personal_reveal — null until entitled */
  personalReveal: string | null
  /**
   * Whether a reveal exists at all (safe to know pre-pledge). Drives the lock
   * copy: a favpoll without a reveal must offer the results, not promise a
   * disclosure that never comes. Defaults true for existing callers/stories.
   */
  hasReveal?: boolean
  /** Content-free quote flag — step 3 promises "their own words". */
  revealIsQuote?: boolean
  revealIsMessage?: boolean
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
  personalReveal,
  hasReveal = true,
  revealIsQuote = false,
  revealIsMessage = false,
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
  })

  const unlockAriaLabel = !hasReveal
    ? "Pledge your favourite to see the results"
    : revealIsMessage
      ? displayFirstName
        ? `Pledge to reveal ${displayFirstName}'s message and see the results`
        : "Pledge to see the message and results"
      : isCause
        ? "Pledge to reveal our pick and see the results"
        : displayFirstName
          ? `Pledge to reveal ${displayFirstName}'s favourite and see the results`
          : "Pledge to see the reveal and results"

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
                  size="icon-sm"
                  aria-label="View options"
                  className="shrink-0"
                >
                  <EllipsisVertical className="size-4" aria-hidden="true" />
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
                <DropdownMenuItem
                  onSelect={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: `Favourite ${poll.topics.title}`,
                          url: window.location.href,
                        })
                        .catch(() => {})
                    }
                  }}
                >
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Post-pledge: real reveal + real ranking list */}
      {entitled ? (
        <>
          {personalReveal && (
            <TypedReveal
              text={personalReveal}
              active={pledgeJustConfirmed ?? false}
              protagonistFirstName={personFirstName}
            />
          )}

          {hasItems && (
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
              {/* The JustGiving lesson at the right moment: the pledge just
                  landed, the reveal played — this is the peak, and sharing
                  is the 5x lever. Quiet, once, only on the confirmed visit. */}
              {pledgeJustConfirmed && (
                <div className="flex justify-center pt-2">
                  <ShareFavpollButton
                    shareTitle={`${protagonistName} — favpoll`}
                  />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* Pre-pledge: blurred decoy with the lock-card overlay sharing
           one grid cell — NOT an absolute overlay: WebKit ignores sticky
           inside absolutely-positioned ancestors, so the card never
           actually pinned on Safari (found 2026-08-02). The in-flow grid
           item stretches to the decoy's height, giving the card's sticky
           its travel in every engine. */
        <div className="grid">
          {/* overflow-hidden on a WRAPPER clips the blur filter's painted
              bleed (filters draw past the element's box) */}
          <div
            className="pointer-events-none overflow-hidden [grid-area:1/1]"
            aria-hidden="true"
          >
            <div className="space-y-4 opacity-60 blur-xs select-none">
              {/* Decoy quote only when a reveal actually exists — a favpoll
                without one shows no quote post-pledge, so fake none here. */}
              {hasReveal && (
                <PollReveal personalReveal="Pledge to reveal their favourite. Pledge to reveal their favourite. Pledge to reveal their favourite." />
              )}

              {hasItems && (
                <>
                  <div className="flex items-center justify-end">
                    <Tabs value="amount">
                      <TabsList className="h-7">
                        <TabsTrigger value="amount" className="px-3 text-xs">
                          Amount
                        </TabsTrigger>
                        <TabsTrigger value="count" className="px-3 text-xs">
                          Pledges
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div>
                    <ol aria-label="Rankings" className="space-y-3">
                      {[...poll.topics.favourites]
                        .sort((a, b) => a.label.localeCompare(b.label))
                        .map((item, i) => (
                          <li key={item.id}>
                            <RankingBar
                              label={item.label}
                              amount="—"
                              widthPercent={decoyWidth(i)}
                              barClassName="transition-all duration-700 ease-out"
                            />
                          </li>
                        ))}
                    </ol>
                  </div>
                </>
              )}
            </div>
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

      {poll.topics.favourites.every((i) => i.is_hidden ?? false) && (
        <EmptyPollAlert />
      )}
    </section>
  )
}
