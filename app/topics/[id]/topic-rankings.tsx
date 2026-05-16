'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TopicItem } from '@/types'

type RankingView = 'amount' | 'count'

function formatAmount(amount: number): string {
  if (amount === 0) return '—'
  if (amount >= 1000) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency', currency: 'GBP', notation: 'compact', maximumFractionDigits: 1,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-GB', {
    style: 'currency', currency: 'GBP', minimumFractionDigits: 0,
  }).format(amount)
}

type Props = {
  items: TopicItem[]
  topicTitle: string
  hasColourSwatch: boolean
}

export function TopicRankings({ items, topicTitle, hasColourSwatch }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const view: RankingView = (searchParams.get('view') as RankingView) ?? 'amount'

  const sorted = [...items].sort((a, b) =>
    view === 'amount'
      ? b.all_time_pledged - a.all_time_pledged
      : b.all_time_count - a.all_time_count
  )

  const maxValue = view === 'amount'
    ? Math.max(...items.map((i) => i.all_time_pledged), 1)
    : Math.max(...items.map((i) => i.all_time_count), 1)

  const hasActivity = items.some((i) => i.all_time_pledged > 0)

  function setView(v: RankingView) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', v)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <Tabs value={view} onValueChange={(v) => setView(v as RankingView)}>
          <TabsList className="h-7">
            <TabsTrigger value="amount" className="px-3 text-xs">By amount</TabsTrigger>
            <TabsTrigger value="count" className="px-3 text-xs">By pledges</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ol
        aria-label={`${topicTitle} — all-time rankings`}
        aria-live="polite"
        className="space-y-2"
      >
        {sorted.map((item, i) => {
          const value = view === 'amount' ? item.all_time_pledged : item.all_time_count
          const barWidth = hasActivity ? (value / maxValue) * 100 : 0
          const valueLabel = view === 'amount'
            ? formatAmount(item.all_time_pledged)
            : `${item.all_time_count} pledge${item.all_time_count !== 1 ? 's' : ''}`

          return (
            <li
              key={item.id}
              className={`rounded-lg border bg-card px-4 py-3 ${i === 0 && hasActivity ? 'border-primary/30' : 'border-border'}`}
              aria-label={`${item.label}, ranked ${i + 1}, ${valueLabel}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-right text-sm text-muted-foreground tabular-nums" aria-hidden="true">
                  {i + 1}
                </span>
                {hasColourSwatch && (
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-border/50"
                    style={{ backgroundColor: item.label.toLowerCase() }}
                    aria-hidden="true"
                  />
                )}
                <span className={`flex-1 text-sm ${i === 0 && hasActivity ? 'font-medium text-foreground' : 'text-foreground'}`}>
                  {item.label}
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">{valueLabel}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted" role="presentation">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </li>
          )
        })}
      </ol>

      {sorted.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No pledges have been made on this topic yet.
        </p>
      )}
    </div>
  )
}
