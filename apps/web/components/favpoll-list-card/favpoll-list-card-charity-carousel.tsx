"use client"

import { useLayoutEffect, useRef, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { CharityRow } from "@/components/charity-row"
import type { Charity } from "@favpoll/types"
import { FavpollCardSize } from "../favpoll-card/types"

type Props = {
  charities: { charity: Charity }[]
  perCharity: number
  size?: FavpollCardSize
  /** Under the amount on every row — see CharityRow. */
  amountCaption?: React.ReactNode
}

export function FavpollListCardCharityCarousel({
  charities,
  perCharity,
  size,
  amountCaption,
}: Props) {
  const [emblaRef] = useEmblaCarousel(
    { axis: "y", loop: true, dragFree: false },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  )

  // MEASURED, not hardcoded (founder screenshot, 2026-09-14): the old
  // 24px constant matched the card's one-line row but the mobile
  // charity footer renders the TWO-line CharityRow (name + charity
  // no., ~40px, more with an amountCaption) — every slide overflowed
  // its slot and the rows painted over each other. The first slide's
  // CONTENT height is intrinsic (a block child is content-sized even
  // inside the fixed viewport), so it sizes the viewport for every
  // call site and follows font/caption changes via ResizeObserver.
  const contentRef = useRef<HTMLDivElement>(null)
  const [rowHeight, setRowHeight] = useState<number>(
    size === "lg" ? 40 : 24 // pre-measure fallback only
  )
  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el) return
    const update = () => {
      const h = el.offsetHeight
      if (h > 0) setRowHeight(h)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (charities.length === 0) return null

  if (charities.length === 1) {
    return (
      <CharityRow
        charity={charities[0].charity}
        amountRaised={perCharity}
        size={size}
        amountCaption={amountCaption}
      />
    )
  }

  return (
    // Fixed height matches a single CharityRow so the footer never resizes
    <div
      className="overflow-hidden"
      style={{ height: rowHeight }}
      ref={emblaRef}
    >
      <div className="flex h-full flex-col">
        {charities.map(({ charity }, i) => (
          <div key={charity.id} className="min-h-0 shrink-0 grow-0 basis-full">
            <div ref={i === 0 ? contentRef : undefined}>
              <CharityRow
                charity={charity}
                amountRaised={perCharity}
                size={size}
                amountCaption={amountCaption}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
