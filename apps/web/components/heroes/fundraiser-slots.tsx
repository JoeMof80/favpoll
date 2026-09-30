import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { GoalProgress } from "@/components/goal-progress"
import { formatPounds } from "@/lib/i18n"

// THE FUNDRAISER STRIP (founder, 2026-09-30, settled over four cuts): on
// the room's fundraiser dial the pledge goal sits ABOVE the person, in
// the rail's own grammar — the countdown card's, exactly ("match the
// pledge goal to the Poll closes in formatting"): the muted semibold
// eyebrow, a text-2xl leading-none figure, a text-xs muted label at its
// baseline, tabular. The bar beneath is the goal's own. The person then
// follows as a row in the organiser block's grammar (the sheet). Tribute
// is the hero as it is; fundraiser is strip + row, no hero band at all.

export type HeroFundraiser = {
  totalRaised: number
  goalAmount: number | null
  isClosed: boolean
}

export function FundraiserStrip({
  fundraiser,
}: {
  fundraiser: HeroFundraiser
}) {
  const { totalRaised, goalAmount, isClosed } = fundraiser
  const goalReached = !!goalAmount && totalRaised >= goalAmount

  return (
    <div>
      <SectionEyebrow variant="muted" className="mb-2 font-semibold">
        {isClosed
          ? "Poll closed"
          : goalAmount
            ? "Pledge goal"
            : "Raised so far"}
      </SectionEyebrow>
      {/* The countdown's value + unit-label pair: figure, then what it is
          against, at one baseline. */}
      <div className="flex flex-wrap items-baseline gap-x-3 tabular-nums">
        <span
          aria-live="polite"
          className="text-2xl leading-none font-medium text-foreground"
        >
          {formatPounds(totalRaised)}
        </span>
        {goalAmount && !isClosed && (
          <span className="text-xs text-muted-foreground">
            of {formatPounds(goalAmount)}
          </span>
        )}
        {goalAmount && !isClosed && goalReached && (
          <span className="text-xs font-medium text-success">
            Goal reached — every further pledge still counts
          </span>
        )}
        {isClosed && (
          <span className="text-xs text-muted-foreground">raised</span>
        )}
      </div>
      {goalAmount && !isClosed ? (
        <GoalProgress
          totalRaised={totalRaised}
          goalAmount={goalAmount}
          className="mt-3 h-2"
        />
      ) : null}
    </div>
  )
}
