"use client"

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
import { Tooltip, TooltipProvider } from "../ui/tooltip"
import { Lock } from "lucide-react"
import { ShareFavpollButton } from "@/components/share-favpoll-button"
import { decoyWidth } from "@/lib/decoys"
import { buildMechanicSteps, mechanicFooter } from "@/lib/mechanic-steps"
import { Gift } from "lucide-react"

type RankingView = "amount" | "count"

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
  /** e.g. "Marie Curie" or "A & B" — renders the pre-pledge trust line */
  charityLine?: string | null
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
  charityLine = null,
  initialItems,
  onOpenPledgeDialog,
}: Props) {
  const { rankingView, setRankingView } = usePollSection({
    pollId: poll.id,
    hasPledged,
    isClosed,
    pledgeJustConfirmed,
    onSelectionsChange: () => {},
    onViewChange,
  })

  const personFirstName = protagonistName.split(/[\s&]+/)[0]
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
    firstName: displayFirstName,
    isCause,
    hasReveal,
  })

  const unlockAriaLabel = !hasReveal
    ? "Pledge your favourite to see the results"
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
      <div className="sticky top-[var(--hero-stuck-bottom,10rem)] z-20 md:top-[var(--hero-stuck-bottom,13.75rem)]">
        {/* Opaque backdrop: the stuck hero and ribbon are separate boxes,
            so the slit between them, the ribbon's rounded corners, and the
            decoy's blur bleed (filters paint past their box) all showed
            scrolling content. One panel behind the ribbon covers the lot. */}
        {/* Decorative, empty — deliberately NO aria-hidden: the reveal
            tests (and AT heuristics) locate TypedReveal's hidden copy via
            [aria-hidden], and an empty div announces nothing anyway. */}
        <div className="pointer-events-none absolute -inset-x-1 -top-3 bottom-0 -z-10 bg-background" />
        {/* The ribbon is a HEADER, not a button (founder, 2026-08-02) —
            pre-pledge the lock card is the one CTA, so a second full-
            width button was redundant. Once entitled, a quiet icon at
            the ribbon's edge reopens the dialog to pledge again. */}
        <div className="relative">
          <PollHeading topicTitle={poll.topics.title} inert />
          {entitled && onOpenPledgeDialog && (
            <TooltipProvider>
              <Tooltip content="Pledge again" side="left">
                <Button
                  type="button"
                  size="icon-sm"
                  aria-label="Pledge again"
                  onClick={onOpenPledgeDialog}
                  className="absolute top-1/2 right-0 -translate-y-1/2"
                >
                  <Gift aria-hidden="true" />
                </Button>
              </Tooltip>
            </TooltipProvider>
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
              <div className="sticky top-[calc(var(--hero-stuck-bottom,10rem)+3rem)] z-20 flex items-center justify-end md:top-[calc(var(--hero-stuck-bottom,13.75rem)+3rem)]">
                <Tabs
                  value={rankingView}
                  onValueChange={(v: string) =>
                    setRankingView(v as RankingView)
                  }
                >
                  <TabsList className="h-7 shadow">
                    <TabsTrigger value="amount" className="px-3 text-xs">
                      Amount
                    </TabsTrigger>
                    <TabsTrigger value="count" className="px-3 text-xs">
                      Pledges
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
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
        /* Pre-pledge: blurred decoy with centered unlock overlay */
        <div className="relative">
          {/* overflow-hidden on a WRAPPER clips the blur filter's painted
              bleed (filters draw past the element's box) */}
          <div
            className="pointer-events-none overflow-hidden"
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
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center pt-4">
              <span className="sticky top-[calc(var(--hero-stuck-bottom,10rem)+2.5rem)] flex w-full flex-col items-center md:top-[calc(var(--hero-stuck-bottom,13.75rem)+2.5rem)]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onOpenPledgeDialog}
                  aria-label={unlockAriaLabel}
                  className="pointer-events-auto h-auto w-full max-w-sm flex-col items-stretch gap-0 overflow-hidden rounded-xl border-0 bg-background/95 p-0 text-left whitespace-normal shadow-xl ring-1 ring-border transition-all duration-300 hover:bg-background/95 hover:shadow-2xl motion-safe:hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-base font-medium text-primary-foreground">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    {/* One universal CTA (founder question, 2026-08-02):
                        "reveal X's favourite" as the header made the
                        reveal transactional bait — the quiz-frame again.
                        The action is pledging YOUR favourite; step 3
                        presents the reveal as the gift. */}
                    Pledge your favourite
                  </span>
                  <span className="flex flex-col gap-1.5 px-4 py-3 text-left text-sm leading-relaxed font-normal whitespace-normal text-muted-foreground">
                    {lockSteps.map((step, i) => (
                      <span key={i} className="flex gap-2">
                        <span className="w-4 shrink-0 text-right font-semibold text-primary">
                          {i + 1}.
                        </span>
                        <span className="flex-1">{step}</span>
                      </span>
                    ))}
                    <span className="pt-1 text-[13px] text-muted-foreground/80">
                      {mechanicFooter(poll.topics.title)}
                    </span>
                  </span>
                </Button>
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
