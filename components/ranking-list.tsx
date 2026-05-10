'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TopicItem } from '@/types'

type RankedItem = TopicItem & { rank: number; prevRank: number | null }

function rankItems(items: TopicItem[]): RankedItem[] {
  const sorted = [...items].sort((a, b) => b.all_time_pledged - a.all_time_pledged)
  return sorted.map((item, i) => ({ ...item, rank: i + 1, prevRank: null }))
}

function formatAmount(amount: number): string {
  if (amount === 0) return '£0'
  if (amount >= 1000) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  }).format(amount)
}

type Props = {
  initialItems: TopicItem[]
  eventPollId: string
  topicId: string
  useAllTime?: boolean
}

export function RankingList({ initialItems, topicId, useAllTime = false }: Props) {
  const [items, setItems] = useState<RankedItem[]>(() => rankItems(initialItems))
  const [announcement, setAnnouncement] = useState('')
  const prevRanksRef = useRef<Map<string, number>>(new Map())
  const supabase = createClient()

  useEffect(() => {
    // Build initial prev ranks
    items.forEach((item) => prevRanksRef.current.set(item.id, item.rank))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const channel = supabase
      .channel(`topic_items:${topicId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'topic_items',
          filter: `topic_id=eq.${topicId}`,
        },
        (payload) => {
          setItems((prev) => {
            const updated = prev.map((item) =>
              item.id === payload.new.id
                ? { ...item, ...(payload.new as TopicItem) }
                : item,
            )
            const reranked = rankItems(updated).map((item) => ({
              ...item,
              prevRank: prevRanksRef.current.get(item.id) ?? null,
            }))

            // Announce rank changes
            const movers = reranked.filter(
              (item) => item.prevRank !== null && item.prevRank !== item.rank,
            )
            if (movers.length > 0) {
              const parts = movers.map((item) => {
                const prev = item.prevRank!
                const dir = item.rank < prev ? 'up' : 'down'
                return `${item.label} moved ${dir} to position ${item.rank}`
              })
              setAnnouncement(parts.join('. '))
            }

            reranked.forEach((item) => prevRanksRef.current.set(item.id, item.rank))
            return reranked
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, topicId])

  const maxPledged = Math.max(...items.map((i) => (useAllTime ? i.all_time_pledged : i.all_time_pledged)), 1)

  return (
    <div>
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </span>

      <ol
        aria-label="Rankings"
        className="space-y-2"
      >
        {items.map((item) => {
          const pledged = useAllTime ? item.all_time_pledged : item.all_time_pledged
          const barWidth = maxPledged > 0 ? (pledged / maxPledged) * 100 : 0
          const isFirst = item.rank === 1

          return (
            <li
              key={item.id}
              className="group relative rounded-md border border-border bg-card px-4 py-3 transition-all duration-500"
              style={{ order: item.rank }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-5 shrink-0 text-center text-sm tabular-nums text-muted-foreground"
                  aria-label={`Rank ${item.rank}`}
                >
                  {item.rank}
                </span>

                <span className={`flex-1 text-sm ${isFirst ? 'font-medium text-foreground' : 'text-foreground'}`}>
                  {item.label}
                </span>

                <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                  {formatAmount(pledged)}
                </span>
              </div>

              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted" role="presentation">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${barWidth}%` }}
                  aria-hidden="true"
                />
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
