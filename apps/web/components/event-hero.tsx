"use client"

import { getEventHeadline } from "@/lib/display"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ProtagonistAvatar } from "@/components/event-hero-avatar"
import type { Event, Protagonist } from "@favpoll/types"

type Props = {
  event: Event
  protagonist: Protagonist
  hideAvatar?: boolean
  aboutPlaceholder?: string
}

export function EventHero({
  event,
  protagonist,
  hideAvatar,
  aboutPlaceholder,
}: Props) {
  const headline = getEventHeadline({
    occasionType: event.occasion_type,
    openingLine: event.opening_line,
    name: protagonist.name,
    dateLabel: protagonist.context,
  })

  return (
    <div className="mb-5 md:mb-10">
      <div className="flex items-start gap-4 md:gap-6">
        {/* Text */}
        <div className="min-w-0 flex-1">
          <SectionEyebrow
            variant="muted"
            className="flex h-8 items-center truncate break-words"
          >
            {headline?.prefix}
          </SectionEyebrow>

          <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight wrap-break-word text-[#2C2C2A] sm:text-5xl">
            {protagonist.name}
          </h1>

          {headline?.suffix && (
            <p className="mt-2 truncate text-xl font-normal whitespace-normal text-[#534AB7] md:text-2xl">
              {headline.suffix}
            </p>
          )}
        </div>

        {/* Photo */}
        {!hideAvatar && (
          <ProtagonistAvatar
            name={protagonist.name}
            photoUrl={protagonist.photo_url}
          />
        )}
      </div>

      {protagonist.about ? (
        <p className="mt-4 line-clamp-4 text-base leading-relaxed wrap-break-word text-[#5F5E5A]">
          {protagonist.about}
        </p>
      ) : aboutPlaceholder ? (
        <p className="mt-4 line-clamp-4 text-base leading-relaxed wrap-break-word text-muted-foreground/50">
          {aboutPlaceholder}
        </p>
      ) : null}

      <hr className="mt-4 border-[#D3D1C7] md:mt-8" />
    </div>
  )
}
