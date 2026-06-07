"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { EventHero } from "@/components/event-hero"
import { PollTitle } from "@/components/favpoll-card/poll-title"
import { PollReveal } from "@/components/favpoll-card/poll-reveal"
import { PollResults } from "@/components/favpoll-card/poll-results"
import { PledgePanel } from "@/components/pledge-panel"
import { CharityBanner } from "@/components/charity-banner"
import { PledgeCard } from "@/components/pledge-card"
import { Button } from "@/components/ui/button"
import type { Event, Protagonist, Charity, TopicItem } from "@favpoll/types"
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

// Dimmed countdown shown instead of "Poll closed" copy
function ClosedCountdownPlaceholder() {
  return (
    <div className="pointer-events-none opacity-40">
      <div className="rounded-lg border border-border bg-card px-5 py-4">
        <p className="mb-2 text-xs text-muted-foreground">Poll closes in</p>
        <div className="flex items-end gap-3">
          {(["days", "hrs", "min", "sec"] as const).map((label) => (
            <div key={label} className="text-center">
              <p className="text-2xl leading-none font-medium text-foreground/25 tabular-nums">
                00
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid animate-pulse gap-10 lg:grid-cols-[1fr_300px]">
      {/* Left — hero */}
      <div>
        <div className="mb-5 md:mb-10">
          <div className="flex items-start gap-4 md:gap-6">
            <div className="min-w-0 flex-1">
              {/* Eyebrow */}
              <div className="mb-2 h-4 w-24 rounded bg-muted" />
              {/* Name h1 — text-4xl leading-tight ≈ 44px */}
              <div className="h-11 w-52 rounded bg-muted" />
              {/* Context — text-xl ≈ 28px */}
              <div className="mt-2 h-7 w-32 rounded bg-muted" />
            </div>
            {/* Avatar — matches ProtagonistAvatar exactly */}
            <div className="h-20 w-20 shrink-0 rounded-full bg-muted md:h-28 md:w-28" />
          </div>
          {/* About — text-base leading-relaxed ≈ 26px/line, line-clamp-4 */}
          <div className="mt-4 space-y-1.5">
            <div className="h-6.5 w-full rounded bg-muted" />
            <div className="h-6.5 w-5/6 rounded bg-muted" />
            <div className="h-6.5 w-4/5 rounded bg-muted" />
            <div className="h-6.5 w-2/3 rounded bg-muted" />
          </div>
          <div className="mt-4 h-px bg-muted md:mt-8" />
        </div>
        {/* Poll — title+toggle row, PollReveal quote, result bars */}
        <div className="space-y-3">
          {/* Title + toggle on one row */}
          <div className="flex items-center justify-between gap-2">
            <div className="h-6 w-20 rounded bg-muted" />
            <div className="h-9 w-44 rounded-full bg-muted" />
          </div>
          {/* PollReveal: text-[18px] leading-relaxed + pb-4, ~1-2 lines */}
          <div className="space-y-1.5 pb-4">
            <div className="h-7.25 w-full rounded bg-muted" />
            <div className="h-7.25 w-4/5 rounded bg-muted" />
          </div>
          {/* RankingBar rows: label row h-5 + mb-1 + bar h-1.5 ≈ 32px each, space-y-2.5 */}
          <div className="space-y-2.5">
            {[100, 72, 48].map((w) => (
              <div key={w} style={{ width: `${w}%` }}>
                <div className="mb-1 h-5 w-full rounded bg-muted" />
                <div className="h-1.5 w-full rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right — sidebar cards sized to match actual rendered cards */}
      <div className="space-y-4">
        {/* Countdown: py-4 + label-row(16) + mb-2(8) + numbers(24) + labels(20) ≈ 100px */}
        <div className="h-24 rounded-lg bg-muted" />
        {/* CharityBanner: py-4 + 1 charity row(40) + divider+amount rows(44) ≈ 112px */}
        <div className="h-28 rounded-lg bg-muted" />
        {/* PledgeCard: py-4 + label + AmountInput + Presets + TopUp + Confirm ≈ 400px */}
        <div className="h-96 rounded-lg bg-muted" />
      </div>
    </div>
  )
}

export function ExamplePanel({ register, occasionType }: Props) {
  const requestKey = `${register}|${occasionType ?? ""}`
  const [loaded, setLoaded] = useState<{
    key: string
    data: ExemplarData | null
  } | null>(null)
  const [exampleView, setExampleView] = useState<"pledge" | "results">(
    "results"
  )

  const loading = loaded?.key !== requestKey

  useEffect(() => {
    let cancelled = false
    const url = new URL("/api/exemplar", window.location.origin)
    url.searchParams.set("register", register)
    if (occasionType) url.searchParams.set("occasion_type", occasionType)

    fetch(url.toString())
      .then((r) => r.json())
      .then((data: ExemplarData | null) => {
        if (!cancelled) setLoaded({ key: requestKey, data })
      })
      .catch(() => {
        if (!cancelled) setLoaded({ key: requestKey, data: null })
      })

    return () => {
      cancelled = true
    }
  }, [register, occasionType]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <LoadingSkeleton />

  const exemplar = loaded?.data ?? null

  if (!exemplar) {
    return (
      <div className="flex min-h-100 items-center justify-center">
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
    closes_at: new Date(0).toISOString(),
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

  // Derive TopicItem[] from results so PledgePanel can render the options
  const exampleItems: TopicItem[] = (exemplar.poll?.results ?? []).map(
    (r, i) =>
      ({
        id: `ex-item-${i}`,
        label: r.label,
        topic_id: "",
        all_time_pledged: 0,
        all_time_count: 0,
        is_canonical: true,
        is_active: true,
        created_at: "",
      }) as unknown as TopicItem
  )

  const showReveal = exampleView === "results"

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
      {/* Left — hero + poll */}
      <div>
        <EventHero event={fakeEvent} protagonist={fakeProtagonist} />

        {exemplar.poll && (
          <div className="space-y-4">
            <div className="space-y-3">
              {/* Title row with toggle aligned right */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <PollTitle title={exemplar.poll.topicTitle} />
                </div>
                <div className="flex shrink-0 gap-0.5 rounded-full border border-border bg-background p-0.5 shadow-md">
                  <Button
                    type="button"
                    size="sm"
                    variant={exampleView === "pledge" ? "default" : "ghost"}
                    className="h-7 rounded-full px-3 text-xs"
                    onClick={() => setExampleView("pledge")}
                  >
                    Before pledging
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={exampleView === "results" ? "default" : "ghost"}
                    className="h-7 rounded-full px-3 text-xs"
                    onClick={() => setExampleView("results")}
                  >
                    Results
                  </Button>
                </div>
              </div>

              {showReveal && exemplar.poll.personalReveal && (
                <PollReveal
                  personalReveal={exemplar.poll.personalReveal}
                  protagonistFirstName={protagonistFirstName}
                  role="status"
                  aria-live="polite"
                />
              )}
            </div>

            {showReveal ? (
              <PollResults results={exemplar.poll.results} />
            ) : (
              /* Pre-pledge view — dimmed + inert, shows the guest item picker */
              <div className="pointer-events-none opacity-40">
                <PledgePanel
                  items={exampleItems}
                  totalAmount=""
                  onSelectionsChange={() => {}}
                  isInfinite={false}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right — dimmed countdown + charity + dimmed pledge card */}
      <div className="sticky top-20 space-y-4 self-start">
        <ClosedCountdownPlaceholder />

        {exemplar.charities.length > 0 && (
          <CharityBanner
            charities={exemplar.charities as Charity[]}
            totalRaised={exemplar.total_raised}
          />
        )}

        <div className="pointer-events-none opacity-40">
          <PledgeCard
            prePublish
            charityNames={exemplar.charities.map((c) => c.name)}
          />
        </div>

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
  )
}
