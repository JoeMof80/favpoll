import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { Countdown } from "@/components/countdown"
import { GoalProgress } from "@/components/goal-progress"
import { heroNameSizeClass } from "@/lib/display"
import { formatPounds } from "@/lib/i18n"

// THE FUNDRAISER HERO (founder, 2026-09-30: "we need to grow a fundraiser
// prop"). The presence dial from the live display (founder, 2026-08-02):
// "fundraiser" is telethon theatre — the money is the heading; "tribute"
// turns the volume down — the person is the heading and the money stays
// quiet. Tribute is the hero as it is. Fundraiser is the SAME three-line
// silhouette (eyebrow, heading, subtitle line; HeroLayout's band, its
// collapse, its settle) with the figures in the person's place and the
// person a byline in the rail's pinned slot. One layout, two voices —
// the display used to hand-build a second banner for this, and fell
// behind every hero change.

export type HeroFundraiser = {
  totalRaised: number
  goalAmount: number | null
  /** ISO close — null when closed or undated; the band's right edge. */
  closesAt: string | null
  isClosed: boolean
}

// The hero's own type, verbatim (base-favpoll-hero / cause-hero), so the
// figure sits exactly where the name does and steps down with it.
const TITLE_CLASS =
  "line-clamp-2 leading-tight font-medium tracking-tight wrap-break-word text-foreground transition-[font-size] duration-300 ease-out motion-reduce:transition-none"
const SUBTITLE_CLASS =
  "mt-4 truncate text-xl font-normal whitespace-normal text-primary transition-[font-size] duration-300 ease-out motion-reduce:transition-none"

export function fundraiserHeroSlots({
  fundraiser,
  compact,
}: {
  fundraiser: HeroFundraiser
  compact?: boolean
}) {
  const { totalRaised, goalAmount, closesAt, isClosed } = fundraiser
  const figure = formatPounds(totalRaised)
  const goalReached = !!goalAmount && totalRaised >= goalAmount
  const isOpen = !isClosed

  // The eyebrow names the figure: what it is against (the goal), or what
  // it is (raised so far), or that it is final. Goal reached sits at the
  // eyebrow's right edge, as it did on the display banner.
  const eyebrowText = (
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
      {isOpen && goalReached && (
        <p className="truncate text-sm font-medium text-success">
          Goal reached — every further pledge still counts
        </p>
      )}
    </div>
  )

  // ONE LINE (founder, 2026-09-30: "more horizontal"): the figure and its
  // goal share a baseline, as the display's banner had them. A <p>, not
  // the page's <h1>: the heading is the figure, but the document is
  // still about the person — the rail's byline keeps the h1.
  const title = (
    <div className="flex flex-wrap items-baseline gap-x-3">
      <p
        aria-live="polite"
        className={`${TITLE_CLASS} ${heroNameSizeClass(figure, compact)}`}
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
  )

  const subtitleSize = compact ? "" : "md:text-2xl"
  const subtitle = isClosed ? (
    <p className={`${SUBTITLE_CLASS} ${subtitleSize}`}>
      Thank you — the final standings are in.
    </p>
  ) : goalAmount ? (
    <GoalProgress
      totalRaised={totalRaised}
      goalAmount={goalAmount}
      className="mt-4 h-2.5"
    />
  ) : undefined

  // The countdown at the band's right edge, in the rail's own grammar —
  // the rail's pinned slot carries the byline instead (the sheet).
  // mt-2: the eyebrow row is h-8 with its text centred, so the text's top
  // sits 8px into the row; the countdown's label starts at the row's top
  // and needs the same 8px to share the eyebrow's line (measured).
  const aside =
    isOpen && closesAt ? (
      <div className="mt-2">
        <Countdown closesAt={closesAt} />
      </div>
    ) : undefined

  return {
    eyebrowText,
    title,
    subtitle,
    avatar: undefined,
    aside,
    about: undefined,
  }
}
