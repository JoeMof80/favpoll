"use client"

import { Lock } from "lucide-react"
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

const DECOY_WIDTHS = [85, 62, 48, 33, 19]

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
  /** Real item list — may be zeroed until entitled */
  initialItems: Favourite[]
  /** Called when the merged header-button is clicked pre-pledge */
  onOpenPledgeDialog: () => void
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
  // Null for cause favpolls — the first token of the cause label is not a person name
  const displayFirstName = isCause ? null : personFirstName
  const hasItems = poll.topics.favourites.length > 0

  const unlockAriaLabel = displayFirstName
    ? `Pledge to reveal ${displayFirstName}'s favourite and see the results`
    : "Pledge to see the reveal and results"

  return (
    <section
      aria-label={`Favourite ${poll.topics.title} poll`}
      className="space-y-4"
    >
      {/* Merged header: "Favourite {topic}" — button pre-pledge, static post-pledge */}
      <div className="sticky top-40 z-20 md:top-55">
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
              <div className="sticky top-40 z-20 flex items-center justify-end md:top-67">
                <Tabs
                  value={rankingView}
                  onValueChange={(v: string) =>
                    setRankingView(v as RankingView)
                  }
                >
                  <TabsList className="h-7 shadow">
                    <TabsTrigger value="amount" className="px-3 text-xs">
                      By amount
                    </TabsTrigger>
                    <TabsTrigger value="count" className="px-3 text-xs">
                      By pledges
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
            </>
          )}
        </>
      ) : (
        /* Pre-pledge: blurred decoy with centered unlock overlay */
        <div className="relative">
          <div
            className="pointer-events-none space-y-4 blur-xs select-none"
            aria-hidden="true"
          >
            <PollReveal personalReveal="Pledge to see their reveal. Pledge to see their reveal. Pledge to see their reveal." />

            {hasItems && (
              <>
                <div className="flex items-center justify-end">
                  <Tabs value="amount">
                    <TabsList className="h-7">
                      <TabsTrigger value="amount" className="px-3 text-xs">
                        By amount
                      </TabsTrigger>
                      <TabsTrigger value="count" className="px-3 text-xs">
                        By pledges
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
                            widthPercent={DECOY_WIDTHS[i % DECOY_WIDTHS.length]}
                            barClassName="transition-all duration-700 ease-out"
                          />
                        </li>
                      ))}
                  </ol>
                </div>
              </>
            )}
          </div>

          {onOpenPledgeDialog && (
            <Button
              type="button"
              variant="ghost"
              onClick={onOpenPledgeDialog}
              aria-label={unlockAriaLabel}
              className="absolute inset-0 z-10 h-auto w-full flex-col justify-start gap-0 rounded-none pt-6 hover:bg-transparent"
            >
              <span className="flex max-w-60 flex-col items-center gap-2 rounded-xl bg-background/95 px-5 py-3 shadow-md backdrop-blur-sm">
                <Lock
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-center text-sm font-medium whitespace-normal text-foreground">
                  Pledge to see the reveal — and how the pledges are landing.
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
