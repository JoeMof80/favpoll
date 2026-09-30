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
  /** "Marie Curie", "A & B" or "A, B & C" (lib/display charityNames) —
   *  the card's label names who the money is for, so the charity footer
   *  need not say the money twice (founder, 2026-09-30). */
  charityLine: string | null
}

export function FundraiserStrip({
  fundraiser,
}: {
  fundraiser: HeroFundraiser
}) {
  const { totalRaised, goalAmount, isClosed, charityLine } = fundraiser
  const forCharity = charityLine ? ` for ${charityLine}` : ""
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
          line box the digits stand in, measured against the rail), so this
          card is as tall as that one and the hairlines beneath them meet.
          TWO PAIRS across it, as the countdown has its columns (founder,
          2026-09-30): the total with who it is for at the left, the goal
          at the right, both figures in the one style — "£240 for
          Alzheimer's Society … of £1,000". Once the goal is reached the
          goal's figure turns success, as the bar does. */}
      <div className="relative flex h-[29px] items-baseline justify-between gap-x-4 tabular-nums">
        <span className="flex min-w-0 items-baseline gap-x-2">
          <span
            aria-live="polite"
            className="text-2xl leading-none font-medium text-foreground"
          >
            {formatPounds(totalRaised)}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {isClosed ? `raised${forCharity}` : forCharity.trim()}
          </span>
        </span>
        {goalAmount && (
          <span className="flex shrink-0 items-baseline gap-x-2">
            <span className="text-xs text-muted-foreground">of</span>
            <span
              className={`text-2xl leading-none font-medium ${
                goalReached ? "text-success" : "text-foreground"
              }`}
            >
              {formatPounds(goalAmount)}
            </span>
          </span>
        )}
      </div>
    </div>
  )
}
