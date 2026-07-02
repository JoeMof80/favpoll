"use client"

import { getFavpollHeadline } from "@/lib/display"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import type { Favpoll } from "@favpoll/types"

type Props = {
  favpoll: Favpoll
}

export function CauseHero({ favpoll }: Props) {
  const headline = getFavpollHeadline({
    occasionType: favpoll.occasion_type,
    openingLine: favpoll.opening_line,
    name: favpoll.cause_label ?? "",
    subject: favpoll.subject,
  })

  return (
    <div className="mb-5 md:mb-10">
      <SectionEyebrow variant="muted" className="mb-2 truncate wrap-break-word">
        {headline.prefix}
      </SectionEyebrow>

      <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight wrap-break-word text-foreground sm:text-5xl">
        {favpoll.cause_label}
      </h1>

      {favpoll.description && (
        <p className="mt-4 line-clamp-4 text-base leading-relaxed text-muted-foreground">
          {favpoll.description}
        </p>
      )}

      <hr className="mt-4 border-border md:mt-8" />
    </div>
  )
}
