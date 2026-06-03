"use client"

import { getEventHeadline } from "@/lib/display"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import type { Event, Protagonist } from "@favpoll/types"

type Props = {
  event: Event
  protagonist: Protagonist
  hideAvatar?: boolean
}

export function EventHero({ event, protagonist, hideAvatar }: Props) {
  const headline = getEventHeadline({
    occasion: event.occasion,
    occasionLabel: event.opening_line,
    name: protagonist.name,
    dateLabel: protagonist.context,
  })

  return (
    <div className="mb-5 md:mb-10">
      <div className="flex items-start gap-4 md:gap-6">
        {/* Text */}
        <div className="min-w-0 flex-1">
          <SectionEyebrow variant="muted" className="mb-2 truncate break-words">
            {headline?.prefix}
          </SectionEyebrow>

          <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight break-words text-[#2C2C2A] sm:text-5xl">
            {protagonist.name}
          </h1>

          {headline?.suffix && (
            <p className="mt-2 truncate text-xl font-normal text-[#534AB7] md:text-2xl">
              {headline.suffix}
            </p>
          )}
        </div>

        {/* Photo */}
        {!hideAvatar && (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[#D3D1C7] md:h-28 md:w-28">
            {protagonist.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={protagonist.photo_url}
                alt={protagonist.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <svg
                  className="absolute inset-0 h-full w-full text-[#D3D1C7]"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern
                      id="hatch"
                      patternUnits="userSpaceOnUse"
                      width="8"
                      height="8"
                      patternTransform="rotate(45)"
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="8"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hatch)" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-[#888780]">
                  {protagonist.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {protagonist.about && (
        <p className="mt-4 line-clamp-4 text-base leading-relaxed text-[#5F5E5A]">
          {protagonist.about}
        </p>
      )}

      <hr className="mt-4 border-[#D3D1C7] md:mt-8" />
    </div>
  )
}
