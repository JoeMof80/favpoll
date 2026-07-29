"use client"

import { HeroLayout } from "../hero-layout"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { getFavpollHeadline, heroNameSizeClass } from "@/lib/display"
import type { Favpoll, Protagonist } from "@favpoll/types"

type BaseFavpollHeroProps = {
  favpoll: Favpoll
  protagonist: Protagonist
  hideAvatar?: boolean
  aboutPlaceholder?: string
}

export function BaseFavpollHero({
  favpoll,
  protagonist,
  hideAvatar,
  aboutPlaceholder,
}: BaseFavpollHeroProps) {
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
      className="flex h-8 items-center truncate wrap-break-word"
    >
      {headline.prefix}
    </SectionEyebrow>
  )

  const titleText =
    favpoll.subject === "cause" ? (favpoll.cause_label ?? "") : protagonist.name
  const title = (
    <h1
      className={`line-clamp-2 leading-tight font-medium tracking-tight wrap-break-word text-foreground ${heroNameSizeClass(titleText)}`}
    >
      {titleText}
    </h1>
  )

  const subtitle = headline.suffix ? (
    <p className="mt-2 truncate text-xl font-normal whitespace-normal text-primary md:text-2xl">
      {headline.suffix}
    </p>
  ) : undefined

  const avatar =
    !hideAvatar && favpoll.subject !== "cause" ? (
      <ProtagonistAvatar
        name={protagonist.name}
        photoUrl={protagonist.photo_url ?? null}
        className="h-full w-full md:h-full md:w-full"
      />
    ) : undefined

  const about =
    protagonist.about || aboutPlaceholder ? (
      <p className="line-clamp-4 text-base leading-relaxed wrap-break-word text-muted-foreground">
        {protagonist.about || aboutPlaceholder}
      </p>
    ) : undefined

  return (
    <HeroLayout
      eyebrowText={eyebrowText}
      title={title}
      subtitle={subtitle}
      avatar={avatar}
      about={about}
    />
  )
}
