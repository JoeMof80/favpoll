"use client"

import { HeroLayout } from "../hero-layout"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ProtagonistAvatar } from "@/components/event-hero-avatar"
import { getFavpollHeadline } from "@/lib/display"
import type { Favpoll, Protagonist } from "@favpoll/types"

type BaseEventHeroProps = {
  event: Favpoll
  protagonist: Protagonist
  hideAvatar?: boolean
  aboutPlaceholder?: string
}

export function BaseEventHero({
  event,
  protagonist,
  hideAvatar,
  aboutPlaceholder,
}: BaseEventHeroProps) {
  const headline = getFavpollHeadline({
    occasionType: event.occasion_type ?? null,
    name:
      event.subject === "cause" ? (event.cause_label ?? "") : protagonist.name,
    dateLabel: protagonist.context ?? null,
    openingLine: event.opening_line ?? null,
    subject: event.subject,
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
      {event.subject === "cause" ? event.cause_label : protagonist.name}
    </h1>
  )

  const subtitle = headline.suffix ? (
    <p className="mt-2 truncate text-xl font-normal whitespace-normal text-[#534AB7] md:text-2xl">
      {headline.suffix}
    </p>
  ) : undefined

  const avatar =
    !hideAvatar && event.subject !== "cause" ? (
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
