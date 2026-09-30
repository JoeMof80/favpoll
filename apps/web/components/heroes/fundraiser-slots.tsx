import { SectionEyebrow } from "@/components/ui/section-eyebrow"
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
      {/* The countdown card's digit line, exactly: a 29px box (the text-2xl
          line box the digits stand in, measured against the rail: its
          hairline sat 1px above this one at 30), so this card is as tall as that
          one and the hairlines beneath them meet on one line (founder,
          2026-09-30: "make the pledge goal bottom border level with the
          bottom border of poll closes in"). The figure and its label
          share the digits' baseline. The bar is not here: it IS the card's
          hairline, drawn by the sheet where the rail's hairline runs. */}
      <div className="relative h-[29px]">
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
      </div>
    </div>
  )
}
