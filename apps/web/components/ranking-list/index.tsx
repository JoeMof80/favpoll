"use client"

import type { Favourite } from "@favpoll/types"
import { useRankingItems } from "./use-ranking-items"
import { formatAmount } from "./utils"
import { RankingBar } from "@/components/ui/ranking-bar"
import { HideToggle } from "./hide-toggle"
import { useEffect, useState } from "react"

type Props = {
  initialItems: Favourite[]
  favpollPollId: string
  topicId: string
  useAllTime?: boolean
  rankingView?: "amount" | "count"
  isOrganiser?: boolean
  /** Play the climb: the bars paint at zero and rise to their real widths
   *  on the next frame. Raised the moment the pledge sheet leaves, never on
   *  mount — the page unlocks BEHIND the sheet while the note is read, so a
   *  climb tied to mounting would play where nobody could see it. */
  climb?: boolean
}

export function RankingList({
  initialItems,
  rankingView = "amount",
  isOrganiser = false,
  climb = false,
}: Props) {
  const { items, announcement, maxValue } = useRankingItems(
    initialItems,
    rankingView
  )
  // THE BARS CLIMB AFTER A PLEDGE (founder, 2026-10-22). They never did:
  // RankingList is not mounted pre-pledge, and a CSS transition does not run
  // on the first paint, so the 700ms ease-out below only ever fired on LATER
  // refreshes (the live display's interval). The first painted width was the
  // final width, and the landing demo's climb-from-zero was showing something
  // the product did not do.
  //
  // Two frames, not one: the browser has to paint the zero before the change
  // to the real width counts as a transition.
  // `played`, not "am I at full width": the bars MOUNT at full width while
  // the pledge sheet is still up (the page unlocks behind it), so a flag
  // seeded from `climb` at mount latched true and the climb never ran. The
  // zero is DERIVED instead, so the frame in which `climb` turns true already
  // paints zero — a flag set from an effect would paint full width first and
  // flicker.
  const [played, setPlayed] = useState(false)
  useEffect(() => {
    if (!climb || played) return
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setPlayed(true)
      return
    }
    // Two frames: the browser has to paint the zero before the change to the
    // real width counts as a transition.
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setPlayed(true))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [climb, played])
  const atZero = climb && !played

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
      <ol aria-label="Rankings" className="space-y-3">
        {items.map((item) => {
          const value =
            rankingView === "amount"
              ? item.all_time_pledged
              : item.all_time_count
          const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0
          const valueLabel =
            rankingView === "amount"
              ? formatAmount(item.all_time_pledged)
              : `${item.all_time_count} pledge${item.all_time_count !== 1 ? "s" : ""}`

          const isHidden = item.is_hidden ?? false
          const showToggle =
            isOrganiser && !!item.is_guest_added && !!item.favpoll_poll_item_id

          const labelSuffix = showToggle ? (
            <>
              {isHidden && (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  Hidden
                </span>
              )}
              <HideToggle
                isHidden={isHidden}
                favouriteId={item.favpoll_poll_item_id!}
              />
            </>
          ) : undefined

          return (
            <li
              key={item.id}
              style={{ order: item.rank }}
              aria-label={`${item.label}, ranked ${item.rank}, ${valueLabel}${isHidden ? ", hidden from guests" : ""}`}
              className={isHidden ? "opacity-40" : undefined}
            >
              <RankingBar
                label={item.label}
                amount={valueLabel}
                widthPercent={atZero ? 0 : barWidth}
                barClassName="transition-all duration-700 ease-out"
                labelSuffix={labelSuffix}
              />
            </li>
          )
        })}
      </ol>
    </div>
  )
}
