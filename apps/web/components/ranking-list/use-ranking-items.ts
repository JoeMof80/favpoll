import { useEffect, useRef, useState } from "react"
import type { Favourite } from "@favpoll/types"
import { rankItems, type RankedItem } from "./utils"

// No realtime subscription here: postgres_changes never reach the anon
// browser (pledges/favourites have RLS enabled with no policies, so every
// event is filtered before delivery). Live surfaces stream fresh
// initialItems instead — the event page after the viewer's own pledge, the
// live display via its interval router.refresh() — and this hook announces
// any rank movements when they arrive.
export function useRankingItems(
  initialItems: Favourite[],
  rankingView: "amount" | "count"
) {
  const [items, setItems] = useState<RankedItem[]>(() =>
    rankItems(initialItems, rankingView)
  )
  const [announcement, setAnnouncement] = useState("")
  const prevRanksRef = useRef<Map<string, number>>(new Map())

  // Seed initial prev ranks
  useEffect(() => {
    items.forEach((item) => prevRanksRef.current.set(item.id, item.rank))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-initialize when the server streams fresh initialItems, announcing
  // movements so aria-live keeps narrating the race
  useEffect(() => {
    const reranked = rankItems(initialItems, rankingView).map((item) => ({
      ...item,
      prevRank: prevRanksRef.current.get(item.id) ?? null,
    }))
    const movers = reranked.filter(
      (item) => item.prevRank !== null && item.prevRank !== item.rank
    )
    if (movers.length > 0) {
      setAnnouncement(
        movers
          .map((item) => {
            const dir = item.rank < item.prevRank! ? "up" : "down"
            return `${item.label} moved ${dir} to position ${item.rank}`
          })
          .join(". ")
      )
    }
    reranked.forEach((item) => prevRanksRef.current.set(item.id, item.rank))
    setItems(reranked)
  }, [initialItems]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const maxValue = Math.max(
    ...items.map((i) =>
      rankingView === "amount" ? i.all_time_pledged : i.all_time_count
    ),
    1
  )

  return { items, announcement, maxValue }
}
