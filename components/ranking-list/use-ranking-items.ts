import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { TopicItem } from "@/types"
import { rankItems, type RankedItem } from "./utils"

export function useRankingItems(
  initialItems: TopicItem[],
  topicId: string,
  rankingView: "amount" | "count"
) {
  const [items, setItems] = useState<RankedItem[]>(() =>
    rankItems(initialItems, rankingView)
  )
  const [announcement, setAnnouncement] = useState("")
  const prevRanksRef = useRef<Map<string, number>>(new Map())
  const supabase = createClient()

  // Seed initial prev ranks
  useEffect(() => {
    items.forEach((item) => prevRanksRef.current.set(item.id, item.rank))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-sort when rankingView changes
  useEffect(() => {
    setItems((prev) => {
      const reranked = rankItems(prev, rankingView).map((item) => ({
        ...item,
        prevRank: prevRanksRef.current.get(item.id) ?? null,
      }))
      reranked.forEach((item) => prevRanksRef.current.set(item.id, item.rank))
      return reranked
    })
    setAnnouncement(
      `Sorted by ${rankingView === "amount" ? "amount pledged" : "number of pledges"}`
    )
  }, [rankingView])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`topic_items:${topicId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "topic_items",
          filter: `topic_id=eq.${topicId}`,
        },
        (payload) => {
          setItems((prev) => {
            const updated = prev.map((item) =>
              item.id === payload.new.id
                ? { ...item, ...(payload.new as TopicItem) }
                : item
            )
            const reranked = rankItems(updated, rankingView).map((item) => ({
              ...item,
              prevRank: prevRanksRef.current.get(item.id) ?? null,
            }))
            const movers = reranked.filter(
              (item) => item.prevRank !== null && item.prevRank !== item.rank
            )
            if (movers.length > 0) {
              const parts = movers.map((item) => {
                const dir = item.rank < item.prevRank! ? "up" : "down"
                return `${item.label} moved ${dir} to position ${item.rank}`
              })
              setAnnouncement(parts.join(". "))
            }
            reranked.forEach((item) =>
              prevRanksRef.current.set(item.id, item.rank)
            )
            return reranked
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, topicId, rankingView])

  const maxValue = Math.max(
    ...items.map((i) =>
      rankingView === "amount" ? i.all_time_pledged : i.all_time_count
    ),
    1
  )

  return { items, announcement, maxValue }
}
