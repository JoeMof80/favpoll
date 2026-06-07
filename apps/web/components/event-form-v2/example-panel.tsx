"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { EventHero } from "@/components/event-hero"
import { PollHeading } from "@/components/poll-heading"
import { PollResults } from "@/components/favpoll-card/poll-results"
import { CharityBanner } from "@/components/charity-banner"
import type { Event, Protagonist, Charity } from "@favpoll/types"
import type { PollResultItem } from "@/components/favpoll-card/types"

type ExemplarData = {
  id: string
  register: string
  occasion_type: string | null
  opening_line: string | null
  total_raised: number
  protagonist: {
    name: string
    about: string | null
    context: string | null
    photo_url: string | null
  }
  charities: {
    id: string
    name: string
    logo_url: string | null
    registered_number: string | null
  }[]
  poll: {
    topicTitle: string
    personalReveal: string | null
    results: PollResultItem[]
  } | null
}

type Props = {
  register: string
  occasionType: string | null
}

export function ExamplePanel({ register, occasionType }: Props) {
  const [exemplar, setExemplar] = useState<ExemplarData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const url = new URL("/api/exemplar", window.location.origin)
    url.searchParams.set("register", register)
    if (occasionType) url.searchParams.set("occasion_type", occasionType)

    fetch(url.toString())
      .then((r) => r.json())
      .then((data: ExemplarData | null) => setExemplar(data))
      .catch(() => setExemplar(null))
      .finally(() => setLoading(false))
  }, [register, occasionType])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 p-16">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-10 w-56 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-px w-full rounded bg-muted" />
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="space-y-2">
          {[80, 55, 35].map((w) => (
            <div
              key={w}
              className={`h-7 rounded bg-muted`}
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!exemplar) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-16">
        <p className="text-sm text-muted-foreground">
          No example available yet.
        </p>
      </div>
    )
  }

  const fakeEvent = {
    id: exemplar.id,
    register: exemplar.register,
    occasion_type: exemplar.occasion_type,
    opening_line: exemplar.opening_line,
    closes_at: new Date().toISOString(),
    closed_at: new Date().toISOString(),
    total_raised: exemplar.total_raised,
    is_private: false,
    is_exemplar: true,
    protagonist_id: "",
    market: "en-GB",
    created_by: "",
    extension_count: 0,
    original_closes_at: null,
    hard_close_at: null,
    description: null,
    created_at: "",
  } as unknown as Event

  const fakeProtagonist = {
    id: exemplar.id,
    name: exemplar.protagonist.name,
    about: exemplar.protagonist.about,
    context: exemplar.protagonist.context,
    photo_url: exemplar.protagonist.photo_url,
    created_by: null,
    created_at: "",
  } as unknown as Protagonist

  const protagonistFirstName = exemplar.protagonist.name.split(" ")[0] || ""

  return (
    <div className="mx-auto min-h-full max-w-5xl bg-background p-16 drop-shadow-lg">
      {/* Example badge */}
      <div className="mb-6">
        <span className="rounded-full bg-[#EEEDFE] px-2.5 py-1 text-[11px] font-medium text-[#534AB7]">
          Example
        </span>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        {/* Left — hero + poll */}
        <div>
          <EventHero event={fakeEvent} protagonist={fakeProtagonist} />

          {exemplar.poll && (
            <div className="space-y-4">
              <PollHeading
                topicTitle={exemplar.poll.topicTitle}
                reveal={exemplar.poll.personalReveal}
                protagonistFirstName={protagonistFirstName}
              />
              {exemplar.poll.results.length > 0 && (
                <PollResults results={exemplar.poll.results} />
              )}
            </div>
          )}
        </div>

        {/* Right — charity + total raised */}
        <div className="sticky top-20 space-y-4 self-start">
          {exemplar.charities.length > 0 && (
            <CharityBanner
              charities={exemplar.charities as Charity[]}
              totalRaised={exemplar.total_raised}
            />
          )}
          <div className="border-t border-border pt-4 text-center">
            <Link
              href={`/events?register=${exemplar.register}${exemplar.occasion_type ? `&occasion_type=${encodeURIComponent(exemplar.occasion_type)}` : ""}&state=closed`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-muted-foreground hover:text-foreground"
            >
              See events like this →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
