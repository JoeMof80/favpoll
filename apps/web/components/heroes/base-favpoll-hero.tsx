"use client"

import { HeroLayout } from "../hero-layout"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { getFavpollHeadline } from "@/lib/display"
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

  const title = (
    <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight wrap-break-word text-[#2C2C2A] sm:text-5xl">
      {favpoll.subject === "cause" ? favpoll.cause_label : protagonist.name}
    </h1>
  )

  const subtitle = headline.suffix ? (
    <p className="mt-2 truncate text-xl font-normal whitespace-normal text-[#534AB7] md:text-2xl">
      {headline.suffix}
    </p>
  ) : undefined

  const avatar =
    !hideAvatar && favpoll.subject !== "cause" ? (
      <ProtagonistAvatar
        name={protagonist.name}
        photoUrl={protagonist.photo_url ?? null}
      />
    ) : undefined

  const about =
    protagonist.about || aboutPlaceholder ? (
      <p className="line-clamp-4 text-base leading-relaxed wrap-break-word text-[#5F5E5A]">
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
