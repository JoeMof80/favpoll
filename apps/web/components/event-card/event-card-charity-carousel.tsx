"use client"

import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { CharityRow } from "@/components/charity-row"
import type { Charity } from "@favpoll/types"
import { FavpollCardSize } from "../favpoll-card/types"

type Props = {
  charities: { charity: Charity }[]
  perCharity: number
  size?: FavpollCardSize
}

export function EventCardCharityCarousel({
  charities,
  perCharity,
  size,
}: Props) {
  const [emblaRef] = useEmblaCarousel(
    { axis: "y", loop: true, dragFree: false },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  )

  if (charities.length === 0) return null

  if (charities.length === 1) {
    return (
      <CharityRow
        charity={charities[0].charity}
        amountRaised={perCharity}
        size={size}
      />
    )
  }

  const rowHeight = size === "lg" ? 40 : 24

  return (
    // Fixed height matches a single CharityRow so the footer never resizes
    <div className="overflow-hidden" style={{ height: rowHeight }} ref={emblaRef}>
      <div className="flex h-full flex-col">
        {charities.map(({ charity }) => (
          <div key={charity.id} className="min-h-0 shrink-0 grow-0 basis-full">
            <CharityRow
              charity={charity}
              amountRaised={perCharity}
              size={size}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
