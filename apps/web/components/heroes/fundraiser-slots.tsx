import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
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
// person demoted to a byline beneath the band. One layout, two voices —
// the display used to hand-build a second banner for this, and fell
// behind every hero change.

export type HeroFundraiser = {
  totalRaised: number
  goalAmount: number | null
  isClosed: boolean
}

/** Who the money is for: the person or the cause, as a byline. */
export type HeroByline = {
  name: string
  context: string | null
  photoUrl: string | null
}

// The hero's own type, verbatim (base-favpoll-hero / cause-hero), so the
// figure sits exactly where the name does and steps down with it.
const TITLE_CLASS =
  "line-clamp-2 leading-tight font-medium tracking-tight wrap-break-word text-foreground transition-[font-size] duration-300 ease-out motion-reduce:transition-none"
const SUBTITLE_CLASS =
  "mt-4 truncate text-xl font-normal whitespace-normal text-primary transition-[font-size] duration-300 ease-out motion-reduce:transition-none"

export function fundraiserHeroSlots({
  fundraiser,
  byline,
  compact,
}: {
  fundraiser: HeroFundraiser
  byline: HeroByline
  compact?: boolean
}) {
  const { totalRaised, goalAmount, isClosed } = fundraiser
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

  // A <p>, not the page's <h1>: the heading is the figure, but the
  // document is still about the person — the byline keeps the h1.
  const title = (
    <p
      aria-live="polite"
      className={`${TITLE_CLASS} ${heroNameSizeClass(figure, compact)}`}
    >
      {figure}
    </p>
  )

  const subtitleSize = compact ? "" : "md:text-2xl"
  const subtitle = isClosed ? (
    <p className={`${SUBTITLE_CLASS} ${subtitleSize}`}>
      Thank you — the final standings are in.
    </p>
  ) : goalAmount ? (
    <div>
      <p className={`${SUBTITLE_CLASS} ${subtitleSize}`}>
        of {formatPounds(goalAmount)}
      </p>
      <GoalProgress
        totalRaised={totalRaised}
        goalAmount={goalAmount}
        className="mt-3 h-2.5"
      />
    </div>
  ) : undefined
  // No goal: the figure stands alone under "Raised so far". The display's
  // old banner put the countdown on this line, but the sheet's rail pins
  // the countdown at its top, and twice on one screen is noise.

  // The byline, in the about's flow position: the identity is a byline
  // here, not the heading (founder, 2026-08-02).
  const about = (
    <div className="flex items-center gap-3">
      {byline.photoUrl && (
        <ProtagonistAvatar
          name={byline.name}
          photoUrl={byline.photoUrl}
          className="h-10 w-10 rounded-lg md:h-10 md:w-10"
        />
      )}
      <div className="min-w-0">
        <h1 className="truncate text-base font-medium text-foreground">
          {byline.name}
        </h1>
        {byline.context && (
          <p className="truncate text-sm text-muted-foreground">
            {byline.context}
          </p>
        )}
      </div>
    </div>
  )

  return { eyebrowText, title, subtitle, avatar: undefined, about }
}
