"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import type { Category, Topic, TopicItem } from "@/types"

type TopicWithItems = Topic & {
  topic_items: TopicItem[]
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
          <button
            role="tab"
            aria-selected={activeCategory === null}
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full px-3 py-1 text-sm transition-colors focus:ring-2 focus:ring-ring focus:outline-none ${
              activeCategory === null
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              onClick={() =>
                setActiveCategory(activeCategory === cat.id ? null : cat.id)
              }
              className={`shrink-0 rounded-full px-3 py-1 text-sm transition-colors focus:ring-2 focus:ring-ring focus:outline-none ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-330 px-4 pt-8 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-foreground">
            All-time rankings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every pledge ever made, across every event.
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
              const maxPledged = topic.topic_items[0]?.all_time_pledged ?? 0
              const hasActivity = maxPledged > 0

              return (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.id}`}
                  className="group block rounded-lg border border-border bg-card px-5 py-5 transition-colors hover:border-primary/30 hover:bg-secondary/20 focus:ring-2 focus:ring-ring focus:outline-none"
                  aria-labelledby={`topic-${topic.id}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h2
                      id={`topic-${topic.id}`}
                      className="text-sm font-medium text-foreground"
                    >
                      {topic.title}
                    </h2>
                    <span className="text-xs text-muted-foreground transition-colors group-hover:text-primary">
                      See all →
                    </span>
                  </div>

                  <ol
                    aria-label={`${topic.title} top 3`}
                    className="space-y-2.5"
                  >
                    {topic.topic_items.slice(0, 3).map((item, i) => {
                      const barWidth =
                        hasActivity && maxPledged > 0
                          ? (item.all_time_pledged / maxPledged) * 100
                          : 0

                      return (
                        <li key={item.id} className="flex items-center gap-2.5">
                          <span
                            className="w-4 shrink-0 text-right text-xs text-muted-foreground tabular-nums"
                            aria-label={`Rank ${i + 1}`}
                          >
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-1">
                              <span
                                className={`truncate text-sm ${i === 0 && hasActivity ? "font-medium text-foreground" : "text-foreground"}`}
                              >
                                {item.label}
                              </span>
                              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                {formatAmount(item.all_time_pledged)}
                              </span>
                            </div>
                            <div
                              className="mt-1 h-0.5 overflow-hidden rounded-full bg-muted"
                              role="presentation"
                            >
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ol>

                  {topic.topic_items.length === 0 && (
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
