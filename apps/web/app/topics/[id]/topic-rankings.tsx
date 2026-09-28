"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RankingBar } from "@/components/ui/ranking-bar"
import type { Favourite } from "@favpoll/types"
import { PollHeading } from "@/components/poll-heading"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { formatPoundsCompact } from "@/lib/i18n"

type RankingView = "amount" | "count"

type Props = {
  items: Favourite[]
  /** The name shown: the subset's when one is selected. */
  topicTitle: string
  /** The parent's title when a subset is selected, else null. */
  parentTitle?: string | null
  /** The topic's approved subsets (favpoll-topic-rules §1): each has its
   *  own record, reached by ?subset=. */
  subsets?: { id: string; title: string }[]
  selectedSubsetId?: string | null
  hasColourSwatch: boolean
}

export function TopicRankings({
  items,
  topicTitle,
  parentTitle = null,
  subsets = [],
  selectedSubsetId = null,
  hasColourSwatch,
}: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const view: RankingView =
    (searchParams.get("view") as RankingView) ?? "amount"

  const sorted = [...items].sort((a, b) =>
    view === "amount"
      ? b.all_time_pledged - a.all_time_pledged
      : b.all_time_count - a.all_time_count
  )

  const maxValue =
    view === "amount"
      ? Math.max(...items.map((i) => i.all_time_pledged), 1)
      : Math.max(...items.map((i) => i.all_time_count), 1)

  const hasActivity = items.some((i) => i.all_time_pledged > 0)

  function setView(v: RankingView) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", v)
    router.replace(`?${params.toString()}`, { scroll: false })
  }
  function subsetHref(id: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (id) params.set("subset", id)
    else params.delete("subset")
    const q = params.toString()
    return q ? `?${q}` : "?"
  }

  return (
    <section className="space-y-4">
      <div className="sticky top-14 z-20 bg-background pt-4 md:pt-10">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-1 -ml-2 text-muted-foreground"
        >
          <Link href="/record">
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            Back to the record
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <PollHeading topicTitle={topicTitle} size="lg" inert />
          <Tabs value={view} onValueChange={(v) => setView(v as RankingView)}>
            <TabsList className="h-7">
              <TabsTrigger value="amount" className="px-3 text-xs">
                Amount
              </TabsTrigger>
              <TabsTrigger value="count" className="px-3 text-xs">
                Pledges
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* THE SUBSETS' RECORDS (favpoll-topic-rules §1, ruling 4): the
            whole list first, then each subset; a subset's record adds its
            own favpolls' picks to its members' whole-list picks. */}
        {subsets.length > 0 && (
          <nav
            aria-label="Subsets of this topic"
            className="mt-2 flex flex-wrap gap-1.5 pb-2"
          >
            <Link
              href={subsetHref(null)}
              scroll={false}
              aria-current={selectedSubsetId ? undefined : "page"}
              className={
                selectedSubsetId
                  ? "rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                  : "rounded-full border border-primary bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
              }
            >
              {parentTitle ?? topicTitle}, the whole list
            </Link>
            {subsets.map((s) => (
              <Link
                key={s.id}
                href={subsetHref(s.id)}
                scroll={false}
                aria-current={selectedSubsetId === s.id ? "page" : undefined}
                className={
                  selectedSubsetId === s.id
                    ? "rounded-full border border-primary bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
                    : "rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                }
              >
                {s.title}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <ul
        role="list"
        aria-label={`${topicTitle} — the record`}
        aria-live="polite"
        className="space-y-2.5"
      >
        {sorted.map((item, i) => {
          const value =
            view === "amount" ? item.all_time_pledged : item.all_time_count
          const barWidth = hasActivity ? (value / maxValue) * 100 : 0
          const valueLabel =
            view === "amount"
              ? formatPoundsCompact(item.all_time_pledged)
              : item.all_time_count > 0
                ? `${item.all_time_count} pledge${item.all_time_count !== 1 ? "s" : ""}`
                : "—"

          return (
            <li
              key={item.id}
              aria-label={`${item.label}, ranked ${i + 1}, ${valueLabel}`}
            >
              <RankingBar
                label={item.label}
                amount={valueLabel}
                widthPercent={barWidth}
                barClassName={
                  i === 0 && hasActivity ? "bg-primary" : "bg-chart-3"
                }
                labelSuffix={
                  hasColourSwatch ? (
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-full border border-border/50"
                      style={{ backgroundColor: item.label.toLowerCase() }}
                      aria-hidden="true"
                    />
                  ) : undefined
                }
              />
            </li>
          )
        })}
      </ul>

      {sorted.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No pledges have been made on this topic yet.
        </p>
      )}
    </section>
  )
}
