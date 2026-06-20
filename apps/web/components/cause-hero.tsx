"use client"

import { getFavpollHeadline } from "@/lib/display"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import type { Favpoll } from "@favpoll/types"

type Props = {
  event: Favpoll
}

export function CauseHero({ event }: Props) {
  const headline = getFavpollHeadline({
    occasionType: event.occasion_type,
    openingLine: event.opening_line,
    name: event.cause_label ?? "",
    subject: event.subject,
  })

  return (
    <div className="mb-5 md:mb-10">
      <SectionEyebrow variant="muted" className="mb-2 truncate wrap-break-word">
        {headline.prefix}
      </SectionEyebrow>

      <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight wrap-break-word text-[#2C2C2A] sm:text-5xl">
        {event.cause_label}
      </h1>

      {event.description && (
        <p className="mt-4 line-clamp-4 text-base leading-relaxed text-[#5F5E5A]">
          {event.description}
        </p>
      )}

      <hr className="mt-4 border-[#D3D1C7] md:mt-8" />
    </div>
  )
}
