import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { GoalProgress } from "@/components/goal-progress"
import { heroNameSizeClass } from "@/lib/display"
import { formatPounds } from "@/lib/i18n"

// THE FUNDRAISER STRIP (founder, 2026-09-30: "incorporate the pledge goal
// with the protagonist hero"). The presence dial from the live display
// (founder, 2026-08-02): "fundraiser" is telethon theatre; "tribute"
// turns the volume down and keeps the money quiet. Tribute is the hero
// as it is. Fundraiser is the SAME hero — the person stays the heading,
// with their photo and context — plus a money strip in the band's flow
// position beneath it, where the About sits: the eyebrow names the
// figure, the figure and its goal share a baseline, and the bar spans
// the column. An earlier cut made the money the heading and the person
// a byline; the founder reversed it the same evening.

export type HeroFundraiser = {
  totalRaised: number
  goalAmount: number | null
  isClosed: boolean
}

// The hero's own name type, verbatim (base-favpoll-hero / cause-hero),
// so the figure steps down with the name.
const FIGURE_CLASS =
  "leading-tight font-medium tracking-tight text-foreground transition-[font-size] duration-300 ease-out motion-reduce:transition-none"

export function FundraiserStrip({
  fundraiser,
  compact,
}: {
  fundraiser: HeroFundraiser
  compact?: boolean
}) {
  const { totalRaised, goalAmount, isClosed } = fundraiser
  const figure = formatPounds(totalRaised)
  const goalReached = !!goalAmount && totalRaised >= goalAmount

  return (
    <div>
      {/* The eyebrow names the figure: what it is against (the goal), or
          what it is (raised so far), or that it is final. Goal reached
          sits at the eyebrow's right edge, as on the old banner. */}
      <div className="mb-2 flex h-8 items-center justify-between gap-2">
        <SectionEyebrow
          variant="muted"
          className="flex h-8 items-center truncate wrap-break-word"
        >
          {isClosed
            ? "Poll closed"
            : goalAmount
              ? "Pledge goal"
              : "Raised so far"}
        </SectionEyebrow>
        {!isClosed && goalReached && (
          <p className="truncate text-sm font-medium text-success">
            Goal reached — every further pledge still counts
          </p>
        )}
      </div>
      {/* ONE LINE: the figure and its goal share a baseline. A <p>, not
          a heading — the person above is the page's h1. */}
      <div className="flex flex-wrap items-baseline gap-x-3">
        <p
          aria-live="polite"
          className={`${FIGURE_CLASS} ${heroNameSizeClass(figure, compact)}`}
        >
          {figure}
        </p>
        {!isClosed && goalAmount && (
          <p
            className={`text-xl font-normal text-muted-foreground ${compact ? "" : "md:text-2xl"}`}
          >
            of {formatPounds(goalAmount)}
          </p>
        )}
      </div>
      {!isClosed && goalAmount ? (
        <GoalProgress
          totalRaised={totalRaised}
          goalAmount={goalAmount}
          className="mt-4 h-2.5"
        />
      ) : null}
    </div>
  )
}
