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
import { RevealLockPill, revealLockLabel } from "../reveal-lock"
import { ShareFavpollButton } from "@/components/share-favpoll-button"
import { DECOY_WIDTHS } from "@/lib/decoys"

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
  // (founder, 2026-08-01): pick your OWN favourite, the pledge is the
  // worth, the money's destination, and what opens afterwards.
  const charityClause = charityLine
    ? ` — every pledge goes to ${charityLine}, and favpoll takes no fee`
    : " — every pledge goes to charity, and favpoll takes no fee"
  const afterwards = !hasReveal
    ? "Afterwards you'll see where every favourite stands."
    : isCause
      ? "Afterwards, our pick is revealed — and you'll see where every favourite stands."
      : displayFirstName
        ? `Afterwards, ${displayFirstName}'s own favourite is revealed to you — and you'll see where every favourite stands.`
        : "Afterwards, the favourite is revealed — and you'll see where every favourite stands."
  const lockExplainer = `Pick your own favourite ${poll.topics.title.toLowerCase()} and pledge what it's worth${charityClause}. ${afterwards}`

  const unlockAriaLabel = !hasReveal
    ? "Pledge to see the results"
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
        <PollHeading
          topicTitle={poll.topics.title}
          onPledge={onOpenPledgeDialog}
        />
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
            <div className="space-y-4 blur-xs select-none">
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
                              widthPercent={
                                DECOY_WIDTHS[i % DECOY_WIDTHS.length]
                              }
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
            <Button
              type="button"
              variant="ghost"
              onClick={onOpenPledgeDialog}
              aria-label={unlockAriaLabel}
              className="absolute inset-0 z-10 h-auto w-full flex-col items-center justify-start rounded-none pt-4 hover:bg-transparent"
            >
              {/* Sticky, offset to clear the stuck topic ribbon: the pill
                  starts over the decoy reveal quote, then travels with the
                  scroll — never over the hero above (found on-device: the
                  absolute pill rode over the name at small scroll offsets).
                  +2.5rem = the ribbon's 36px height + 4px air; going below
                  +2.25rem slides the pill under the ribbon. */}
              <span className="sticky top-[calc(var(--hero-stuck-bottom,10rem)+2.5rem)] flex w-full flex-col items-center md:top-[calc(var(--hero-stuck-bottom,13.75rem)+2.5rem)]">
                <RevealLockPill
                  label={
                    hasReveal
                      ? isCause
                        ? "Pledge to reveal our pick"
                        : revealLockLabel(displayFirstName)
                      : "Pledge to see the results"
                  }
                />
                {/* The mechanic, taught at the gate — where the money
                    goes, what a pledge is, what opens after. */}
                <span className="mt-3 max-w-sm rounded-xl bg-background/90 px-4 py-2.5 text-xs leading-relaxed font-normal whitespace-normal text-muted-foreground">
                  {lockExplainer}
                </span>
              </span>
            </Button>
          )}
        </div>
      )}

      {poll.topics.favourites.every((i) => i.is_hidden ?? false) && (
        <EmptyPollAlert />
      )}
    </section>
  )
}
