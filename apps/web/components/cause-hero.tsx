"use client"

import { HeroLayout } from "./hero-layout"
import { heroNameSizeClass } from "@/lib/display"
import { getFavpollHeadline } from "@/lib/display"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import type { Favpoll } from "@favpoll/types"

type Props = {
  favpoll: Favpoll
}

// Faceless hero for subject='cause' — no protagonist, no avatar. Renders
// through the same HeroLayout as the person hero so the top padding, sticky
// header, and scroll-shrink behaviour can never drift between the two
// (they did: this component used to hand-roll its layout and sat ~72px
// higher than person pages, found 2026-07-13).
export function CauseHero({ favpoll }: Props) {
  const headline = getFavpollHeadline({
    occasionType: favpoll.occasion_type,
    openingLine: favpoll.opening_line,
    name: favpoll.cause_label ?? "",
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
    <h1
      className={`line-clamp-2 leading-tight font-medium tracking-tight wrap-break-word text-foreground ${heroNameSizeClass(favpoll.cause_label ?? "")}`}
    >
      {favpoll.cause_label}
    </h1>
  )

  const about = favpoll.description ? (
    <p className="line-clamp-4 text-base leading-relaxed wrap-break-word text-muted-foreground">
      {favpoll.description}
    </p>
  ) : undefined

  return <HeroLayout eyebrowText={eyebrowText} title={title} about={about} />
}
