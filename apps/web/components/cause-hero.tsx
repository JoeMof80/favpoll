"use client"

import { getEventHeadline } from "@/lib/display"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import type { Event } from "@favpoll/types"

type Props = {
  event: Event
}

export function CauseHero({ event }: Props) {
  const headline = getEventHeadline({
    occasionType: event.occasion_type,
    openingLine: event.opening_line,
    name: event.cause_label ?? "",
    subject: event.event_subject,
  })

  return (
    <div className="mb-5 md:mb-10">
      <SectionEyebrow variant="muted" className="mb-2 truncate break-words">
        {headline.prefix}
      </SectionEyebrow>

      <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight break-words text-[#2C2C2A] sm:text-5xl">
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
