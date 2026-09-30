"use client"

import { HeroLayout } from "../hero-layout"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { getFavpollHeadline, heroNameSizeClass } from "@/lib/display"
import type { Favpoll, Protagonist } from "@favpoll/types"
import { MentionText } from "@/components/mention-text"
import type { MentionTarget } from "@/lib/mentions"
import { fundraiserHeroSlots, type HeroFundraiser } from "./fundraiser-slots"

type BaseFavpollHeroProps = {
  favpoll: Favpoll
  protagonist: Protagonist
  hideAvatar?: boolean
  aboutPlaceholder?: string
  /** The charity and the topic, lit in the About (lib/mentions). */
  mentions?: MentionTarget[]
  /** The rail is expanded to half the sheet (the guest book read in
   *  place): the name and context take the phone's sizes, so the
   *  narrowed column keeps them on their lines (founder, 2026-09-29). */
  compact?: boolean
  /** The presence dial's loud setting (founder, 2026-09-30): the money is
   *  the heading and the person a byline. Absent = tribute, the hero as
   *  it is. See heroes/fundraiser-slots. */
  fundraiser?: HeroFundraiser
  /** Off for the screen in the room: a static band (HeroLayout). */
  animate?: boolean
}

export function BaseFavpollHero({
  favpoll,
  protagonist,
  hideAvatar,
  aboutPlaceholder,
  mentions,
  compact,
  fundraiser,
  animate,
}: BaseFavpollHeroProps) {
  if (fundraiser) {
    return (
      <HeroLayout
        animate={animate}
        {...fundraiserHeroSlots({
          fundraiser,
          compact,
        })}
      />
    )
  }

  const headline = getFavpollHeadline({
    occasionType: favpoll.occasion_type ?? null,
    name:
      favpoll.subject === "cause"
        ? (favpoll.cause_label ?? "")
        : protagonist.name,
    dateLabel: protagonist.context ?? null,
    openingLine: favpoll.opening_line ?? null,
    subject: favpoll.subject,
  })

  const eyebrowText = (
    <SectionEyebrow
      variant="muted"
      className="mb-2 flex h-8 items-center truncate wrap-break-word"
    >
      {headline.prefix}
    </SectionEyebrow>
  )

  const title = (
    <h1
      // The size transition keeps step with the rail's expand (page-layout,
      // 300ms) so the compact step is one motion, not a jump.
      className={`line-clamp-2 leading-tight font-medium tracking-tight wrap-break-word text-foreground transition-[font-size] duration-300 ease-out motion-reduce:transition-none ${heroNameSizeClass(headline.name, compact)}`}
    >
      {favpoll.subject === "cause" ? favpoll.cause_label : protagonist.name}
    </h1>
  )

  const subtitle = headline.suffix ? (
    <p
      className={`mt-4 truncate text-xl font-normal whitespace-normal text-primary transition-[font-size] duration-300 ease-out motion-reduce:transition-none ${compact ? "" : "md:text-2xl"}`}
    >
      {headline.suffix}
    </p>
  ) : undefined

  // No photo → no avatar at all on the public page (the hatched initials
  // placeholder lives only on the edit form's upload slot; normalised
  // structure, 2026-07-30). HeroLayout's min-height keeps the stuck band
  // at the same height either way.
  const avatar =
    !hideAvatar && favpoll.subject !== "cause" && protagonist.photo_url ? (
      <ProtagonistAvatar
        name={protagonist.name}
        photoUrl={protagonist.photo_url}
        className="h-full w-full md:h-full md:w-full"
      />
    ) : undefined

  const about =
    protagonist.about || aboutPlaceholder ? (
      <p className="text-sm leading-relaxed wrap-break-word text-muted-foreground/80 md:text-base">
        {protagonist.about ? (
          <MentionText text={protagonist.about} mentions={mentions} />
        ) : (
          aboutPlaceholder
        )}
      </p>
    ) : undefined

  return (
    <HeroLayout
      eyebrowText={eyebrowText}
      title={title}
      subtitle={subtitle}
      avatar={avatar}
      about={about}
      animate={animate}
    />
  )
}
