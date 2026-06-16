"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RankingBar } from "@/components/ui/ranking-bar"
import type { Favourite } from "@favpoll/types"
import { SectionLabel } from "@/components/favpoll-card/section-label"

type RankingView = "amount" | "count"

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

type Props = {
  items: Favourite[]
  topicTitle: string
  hasColourSwatch: boolean
}

export function TopicRankings({ items, topicTitle, hasColourSwatch }: Props) {
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <SectionLabel title="Results" />
        <Tabs value={view} onValueChange={(v) => setView(v as RankingView)}>
          <TabsList className="h-7">
            <TabsTrigger value="amount" className="px-3 text-xs">
              By amount
            </TabsTrigger>
            <TabsTrigger value="count" className="px-3 text-xs">
              By pledges
            </TabsTrigger>
          </TabsList>
        </Tabs>
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
              ? formatAmount(item.all_time_pledged)
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
                barStyle={{
                  background: i === 0 && hasActivity ? "#534AB7" : "#AFA9EC",
                }}
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
    </div>
  )
}
