"use client"

import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

type PollResult = { label: string; pct: number }

type ExampleEvent = {
  occasion: string
  name: string
  charity: string
  question: string
  results: PollResult[]
  pledges: number
  daysLeft: number
  raised: string
}

const EXAMPLES: ExampleEvent[] = [
  {
    occasion: "Birthday celebration",
    name: "Rebecca Jane Whitmore",
    charity: "Cancer Research UK",
    question: "Colour?",
    results: [
      { label: "Sky blue", pct: 34 },
      { label: "Forest green", pct: 28 },
      { label: "Crimson", pct: 22 },
      { label: "Midnight navy", pct: 16 },
    ],
    pledges: 24,
    daysLeft: 6,
    raised: "£1,240",
  },
  {
    occasion: "Memorial service",
    name: "David Arthur Thompson",
    charity: "British Heart Foundation",
    question: "Film?",
    results: [
      { label: "The Shawshank Redemption", pct: 41 },
      { label: "Casablanca", pct: 27 },
      { label: "Blade Runner", pct: 19 },
      { label: "The Great Escape", pct: 13 },
    ],
    pledges: 58,
    daysLeft: 3,
    raised: "£3,720",
  },
  {
    occasion: "Retirement",
    name: "Belinda Collins",
    charity: "Age UK",
    question: "Holiday destination?",
    results: [
      { label: "Tuscany", pct: 38 },
      { label: "The Scottish Highlands", pct: 30 },
      { label: "Lisbon", pct: 21 },
      { label: "New York", pct: 11 },
    ],
    pledges: 31,
    daysLeft: 14,
    raised: "£890",
  },
  {
    occasion: "Wedding",
    name: "Sophie & James Hargreaves",
    charity: "Shelter",
    question: "Song?",
    results: [
      { label: "At Last - Etta James", pct: 45 },
      { label: "Make You Feel My Love", pct: 29 },
      { label: "Can't Help Falling in Love", pct: 17 },
      { label: "A Thousand Years", pct: 9 },
    ],
    pledges: 42,
    daysLeft: 21,
    raised: "£2,100",
  },
]

export function HomeCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

  return (
    <div className="flex flex-col items-center">
      {/* Viewport */}
      <div className="w-full overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {EXAMPLES.map((event, i) => (
            <div
              key={i}
              className="min-w-0 shrink-0 grow-0 basis-full px-4 sm:basis-1/2 lg:basis-1/3"
            >
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <SectionEyebrow variant="muted" className="mb-1">
                  {event.occasion}
                </SectionEyebrow>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  {event.name}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {event.charity}
                </p>

                <div className="mt-5">
                  <SectionEyebrow variant="muted" className="font-semibold">
                    {event.question}
                  </SectionEyebrow>
                  <ul className="mt-3 space-y-2.5">
                    {event.results.map((r) => (
                      <li key={r.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="truncate pr-3 text-foreground">
                            {r.label}
                          </span>
                          <span className="shrink-0 text-muted-foreground">
                            {r.pct}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${r.pct}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground">
                    {event.pledges} pledges · {event.daysLeft} days left
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {event.raised} raised
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={scrollPrev}
          aria-label="Previous example"
          className="h-8 w-8 rounded-lg"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-1.5">
          {EXAMPLES.map((_, i) => (
            <Button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Go to example ${i + 1}`}
              className={`h-1.5 rounded-full p-0 transition-all duration-300 ${
                i === selectedIndex
                  ? "w-5 bg-primary hover:bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={scrollNext}
          aria-label="Next example"
          className="h-8 w-8 rounded-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
