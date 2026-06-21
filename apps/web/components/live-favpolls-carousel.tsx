"use client"

import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FavpollSummaryCard } from "@/components/favpoll-summary-card"
import type { FavpollSummaryCardFavpoll } from "@/components/favpoll-summary-card"

type Props = {
  favpolls: FavpollSummaryCardFavpoll[]
}

export function LiveFavpollsCarousel({ favpolls }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: false, align: "start" },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  )

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateScrollState = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    updateScrollState()
    emblaApi.on("select", updateScrollState)
    emblaApi.on("reInit", updateScrollState)
    return () => {
      emblaApi.off("select", updateScrollState)
      emblaApi.off("reInit", updateScrollState)
    }
  }, [emblaApi, updateScrollState])

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <ul className="flex gap-4" role="list">
          {favpolls.map((favpoll) => (
            <li key={favpoll.id} className="w-[306px] shrink-0 list-none">
              <FavpollSummaryCard favpoll={favpoll} className="h-full" />
            </li>
          ))}
        </ul>
      </div>

      {/* Navigation */}
      <div className="mt-5 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canScrollPrev}
          aria-label="Previous event"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canScrollNext}
          aria-label="Next event"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
