import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { formatPounds } from "@/lib/i18n"
import { heroNameSizeClass } from "@/lib/display"

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
  /** Who the money is for: one charity by name — the trust line, and
   *  the reason the room scanned — or, with several, their count
   *  ("for 3 charities": as short, more specific than "for charity", and
   *  the footer names them; founder, 2026-10-01). */
  charityLabel: string | null
}

export function FundraiserStrip({
  fundraiser,
  scale = "rail",
  compact = false,
}: {
  fundraiser: HeroFundraiser
  /** With the guest book expanded the hero steps down (page-layout's
   *  rail expand); the hero-scale card steps with it (founder,
   *  2026-10-17: "animate the text size along the column size, like the
   *  name hero"). */
  compact?: boolean
  /** "rail": the countdown card's grammar, exactly (the dial as first
   *  built). "hero": the same two pairs in the NAME's place under the
   *  band — the hero's own figure size, the labels a step up — for the
   *  dial with the band and photo (mock, 2026-10-17). */
  scale?: "rail" | "hero"
}) {
  const { totalRaised, goalAmount, isClosed, charityLabel } = fundraiser
  const forCharity = charityLabel ? ` for ${charityLabel}` : ""
  const goalReached = !!goalAmount && totalRaised >= goalAmount
  const eyebrow = isClosed
    ? "Poll closed"
    : goalAmount
      ? "Pledge goal"
      : "Raised so far"

  if (scale === "hero") {
    // THE HERO'S OWN GRAMMAR (founder, 2026-10-17: "match the style too"):
    // the eyebrow in its h-8 row, the total where the NAME stands and in
    // its type, the goal and the charity as the context line beneath —
    // "of £1,000 for Alzheimer's Society" in the register's ink, the
    // goal success once reached.
    return (
      <div>
        <SectionEyebrow
          variant="muted"
          className="mb-2 flex h-8 items-center truncate wrap-break-word"
        >
          <span>{eyebrow}</span>
        </SectionEyebrow>
        {/* "£240 … of £1,000" on the name's line (founder, 2026-10-17:
            "£240 on the left, of £1000 on the right"): the total in the
            name's type at the left edge, the goal at the right in the
            register's ink (success once reached), "of" stepped back
            beside it. */}
        <p
          className={`flex items-baseline justify-between gap-x-4 leading-tight font-medium tracking-tight text-foreground tabular-nums transition-[font-size] duration-300 ease-out motion-reduce:transition-none ${heroNameSizeClass(
            `${formatPounds(totalRaised)} of ${formatPounds(goalAmount ?? 0)}`,
            compact
          )}`}
        >
          <span aria-live="polite">{formatPounds(totalRaised)}</span>
          {goalAmount && (
            <span className="flex items-baseline gap-x-2">
              <span className="text-xl font-normal text-muted-foreground">
                of
              </span>
              <span className={goalReached ? "text-success" : "text-primary"}>
                {formatPounds(goalAmount)}
              </span>
            </span>
          )}
        </p>
        {/* No charity line here (founder, 2026-10-17: "it feels noisy and
            repeats the charity") — the footer names it beside the total. */}
      </div>
    )
  }

  return (
    <div>
      <SectionEyebrow variant="muted" className="mb-2 font-semibold">
        {eyebrow}
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
          {/* "raised for X" whenever the eyebrow does not already say
              raised — with a goal ("Pledge goal") and once closed; under
              "Raised so far" the label is "for X" alone (founder,
              2026-10-01). */}
          <span className="truncate text-xs text-muted-foreground">
            {isClosed || goalAmount ? `raised${forCharity}` : forCharity.trim()}
          </span>
        </span>
        {goalAmount && (
          <span className="flex shrink-0 items-baseline gap-x-2">
            <span className="text-xs text-muted-foreground">of</span>
            {/* The goal in the register's ink (founder, 2026-10-01), success
                once reached, as the bar. */}
            <span
              className={`text-2xl leading-none font-medium ${
                goalReached ? "text-success" : "text-primary"
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
