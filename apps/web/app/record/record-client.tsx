"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { Chip } from "@/components/ui/chip"
import { cn } from "@/lib/utils"
import { ListControls } from "@/components/list-controls"
import { NewFavpollFab } from "@/components/new-favpoll-fab"
import type { Category, Topic, Favourite } from "@favpoll/types"
import { SectionLabel } from "@/components/favpoll-card/section-label"
import { PollResults } from "@/components/favpoll-card/poll-results"
import { isEstablishedRecord, topicPledgedTotal } from "@/lib/record"
import { formatCount, formatPounds } from "@/lib/i18n"

type TopicWithItems = Topic & {
  favourites: Favourite[]
  category_ids: string[]
}

type Props = {
  categories: Category[]
  topics: TopicWithItems[]
}

function formatAmount(amount: number): string {
  if (amount === 0) return "—"
  if (amount >= 1000) {
    // Hand-rolled compact form: Intl's `notation: "compact"` differs
    // between Node's ICU and the browser's ("K" vs "k", "£3.0k" vs
    // "£3k"), which caused hydration text mismatches on this page.
    const [value, suffix] =
      amount >= 1_000_000 ? [amount / 1_000_000, "m"] : [amount / 1000, "k"]
    const digits = value >= 100 ? 0 : 1
    return `£${value.toFixed(digits).replace(/\.0$/, "")}${suffix}`
  }
  return formatPounds(amount)
}

function TopicCard({ topic }: { topic: TopicWithItems }) {
  const maxPledged = topic.favourites[0]?.all_time_pledged ?? 0
  const hasActivity = maxPledged > 0
  // Breadth signal (founder decision §4): show how many pledges stand
  // behind the amount, so a bought summit exposes itself. Pledge count
  // for now; true distinct-pledger counts are a later derivation.
  const pledgeCount = topic.favourites.reduce(
    (sum, i) => sum + i.all_time_count,
    0
  )

  return (
    <Link
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

      {topic.favourites.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pledges yet.</p>
      ) : (
        pledgeCount > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            {formatAmount(topicPledgedTotal(topic.favourites))} across{" "}
            {formatCount(pledgeCount)}{" "}
            {pledgeCount === 1 ? "pledge" : "pledges"}
          </p>
        )
      )}
    </Link>
  )
}

type RecordSortKey = "az" | "most_raised" | "most_pledges"

const SORT_OPTIONS: { value: RecordSortKey; label: string }[] = [
  { value: "az", label: "A to Z" },
  { value: "most_raised", label: "Most raised" },
  { value: "most_pledges", label: "Most pledges" },
]

// Search matches the topic itself or any favourite within it — searching
// "purple" finds Colour.
export function filterTopics(
  topics: TopicWithItems[],
  category: string | null,
  query: string
): TopicWithItems[] {
  const q = query.trim().toLowerCase()
  return topics.filter((t) => {
    if (category !== null && !t.category_ids.includes(category)) return false
    if (q) {
      return (
        t.title.toLowerCase().includes(q) ||
        t.favourites.some((f) => f.label.toLowerCase().includes(q))
      )
    }
    return true
  })
}

export function sortTopics(
  topics: TopicWithItems[],
  sort: RecordSortKey
): TopicWithItems[] {
  const sorted = [...topics]
  if (sort === "most_raised") {
    sorted.sort(
      (a, b) =>
        topicPledgedTotal(b.favourites) - topicPledgedTotal(a.favourites)
    )
  } else if (sort === "most_pledges") {
    const count = (t: TopicWithItems) =>
      t.favourites.reduce((sum, i) => sum + i.all_time_count, 0)
    sorted.sort((a, b) => count(b) - count(a))
  }
  // az: preserve server order (topics arrive title-sorted)
  return sorted
}

export function RankingsClient({ categories, topics }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<RecordSortKey>("az")
  const tabsRef = useRef<HTMLDivElement>(null)

  const visibleTopics = sortTopics(
    filterTopics(topics, activeCategory, search),
    sort
  )

  const established = visibleTopics.filter((t) =>
    isEstablishedRecord(t.favourites)
  )
  const gathering = visibleTopics.filter(
    (t) => !isEstablishedRecord(t.favourites)
  )

  return (
    <main className="min-h-screen bg-muted">
      {/* One sticky band: category rail + the list controls — everything
          that narrows the list lives together (header is h-14 = 3.5rem) */}
      <div className="sticky top-14 z-30 border-b border-border bg-muted/85 backdrop-blur">
        <div className="mx-auto max-w-330 px-4 pt-3 pb-1">
          <ListControls
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search topics or favourites…"
            searchLabel="Search the record"
            sortOptions={SORT_OPTIONS}
            sortValue={sort}
            onSortChange={(v) => setSort(v as RecordSortKey)}
            shown={visibleTopics.length}
            total={topics.length}
          />
        </div>
        <div
          ref={tabsRef}
          className="mx-auto flex max-w-330 scrollbar-none gap-1 overflow-x-auto px-4 pb-3"
          role="tablist"
          aria-label="Filter by category"
        >
          <span className="hidden shrink-0 self-center text-[11px] font-medium tracking-widest text-muted-foreground uppercase md:inline">
            Filters
          </span>
          <Chip
            role="tab"
            aria-selected={activeCategory === null}
            selected={activeCategory === null}
            onClick={() => setActiveCategory(null)}
            className={cn(
              "shrink-0 py-1 text-sm",
              activeCategory === null
                ? "border-primary bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                : "bg-background"
            )}
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
              className={cn(
                "shrink-0 py-1 text-sm",
                activeCategory === cat.id
                  ? "border-primary bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                  : "bg-background"
              )}
            >
              {cat.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-330 px-4 pt-8 pb-16">
        {visibleTopics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No topics match here yet.
          </p>
        ) : (
          <div className="space-y-12">
            {established.length > 0 && (
              <section>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {established.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              </section>
            )}

            {gathering.length > 0 && (
              <section>
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-foreground">
                    Still gathering
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    These topics are early — the standings will settle as more
                    people pledge.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {gathering.map((topic) => (
                    <div key={topic.id} className="opacity-60">
                      <TopicCard topic={topic} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
      <NewFavpollFab />
    </main>
  )
}
