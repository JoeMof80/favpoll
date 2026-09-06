"use client"

import { HeroLayout } from "./hero-layout"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { getFavpollHeadline, heroNameSizeClass } from "@/lib/display"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import type { Favpoll } from "@favpoll/types"

type Props = {
  favpoll: Favpoll
}

// Hero for subject='cause' — no protagonist row, so the optional image and
// context live on the favpoll itself (normalised structure, 2026-07-30).
// Renders through the same HeroLayout as the person hero so the top
// padding, sticky header, and scroll-shrink behaviour can never drift
// between the two (they did: this component used to hand-roll its layout
// and sat ~72px higher than person pages, found 2026-07-13).
export function CauseHero({ favpoll }: Props) {
  const headline = getFavpollHeadline({
    occasionType: favpoll.occasion_type,
    openingLine: favpoll.opening_line,
    name: favpoll.cause_label ?? "",
    dateLabel: favpoll.context ?? null,
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
      className={`line-clamp-2 leading-tight font-medium tracking-tight wrap-break-word text-foreground ${heroNameSizeClass(headline.name)}`}
    >
      {favpoll.cause_label}
    </h1>
  )

  const subtitle = headline.suffix ? (
    <p className="mt-4 truncate text-xl font-normal whitespace-normal text-primary md:text-2xl">
      {headline.suffix}
    </p>
  ) : undefined

  // No placeholder when unset — the empty avatar shows only on the edit
  // form, never on the public page.
  const avatar = favpoll.photo_url ? (
    <ProtagonistAvatar
      name={favpoll.cause_label ?? ""}
      photoUrl={favpoll.photo_url}
      className="h-full w-full md:h-full md:w-full"
    />
  ) : undefined

  const about = favpoll.description ? (
    <p className="text-base leading-relaxed wrap-break-word text-muted-foreground">
      {favpoll.description}
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
