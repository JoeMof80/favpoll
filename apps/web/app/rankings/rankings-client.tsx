"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { Chip } from "@/components/ui/chip"
import type { Category, Topic, Favourite } from "@favpoll/types"
import { SectionLabel } from "@/components/favpoll-card/section-label"
import { PollResults } from "@/components/favpoll-card/poll-results"

type TopicWithItems = Topic & {
  favourites: Favourite[]
  category_ids: string[]
}

type Props = {
  categories: Category[]
  topics: TopicWithItems[]
  totalPledged: number
}

function formatAmount(amount: number): string {
  if (amount === 0) return "—"
  if (amount >= 1000) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount)
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function RankingsClient({ categories, topics, totalPledged }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  const visibleTopics =
    activeCategory === null
      ? topics
      : topics.filter((t) => t.category_ids.includes(activeCategory))

  return (
    <>
      {/* Category filter bar — sticky beneath the header (header is h-14 = 3.5rem) */}
      <div className="sticky top-14 z-30 border-b border-border bg-background">
        <div
          ref={tabsRef}
          className="mx-auto flex max-w-330 scrollbar-none gap-1 overflow-x-auto px-4 py-2"
          role="tablist"
          aria-label="Filter by category"
        >
          <Chip
            role="tab"
            aria-selected={activeCategory === null}
            selected={activeCategory === null}
            onClick={() => setActiveCategory(null)}
            className="shrink-0 py-1 text-sm"
          >
            All
          </Chip>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              selected={activeCategory === cat.id}
              onClick={() =>
                setActiveCategory(activeCategory === cat.id ? null : cat.id)
              }
              className="shrink-0 py-1 text-sm"
            >
              {cat.label}
            </Chip>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-330 px-4 pt-8 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-foreground">
            The record TODO: Sorting and filtering
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every pledge ever made, across every favpoll.
            {totalPledged > 0 && (
              <> {formatAmount(totalPledged)} raised in total.</>
            )}
          </p>
        </div>

        {visibleTopics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No topics in this category yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTopics.map((topic) => {
              const maxPledged = topic.favourites[0]?.all_time_pledged ?? 0
              const hasActivity = maxPledged > 0

              return (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.id}`}
                  className="group block rounded-lg border border-border bg-card px-5 py-5 transition-colors hover:border-primary/30 hover:bg-secondary/20 focus:ring-2 focus:ring-ring focus:outline-none"
                  aria-labelledby={`topic-${topic.id}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <SectionLabel title={topic.title} />
                      <span className="text-xs text-muted-foreground transition-colors group-hover:text-primary">
                        See all →
                      </span>
                    </div>
                    {topic.favourites.slice(0, 5).map((item, i) => {
                      const barWidth =
                        hasActivity && maxPledged > 0
                          ? (item.all_time_pledged / maxPledged) * 100
                          : 0
                      return (
                        <PollResults
                          key={i}
                          results={[
                            {
                              label: item.label,
                              amount: formatAmount(item.all_time_pledged),
                              widthPercent: barWidth,
                            },
                          ]}
                        />
                      )
                    })}
                  </div>

                  {topic.favourites.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No pledges yet.
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
