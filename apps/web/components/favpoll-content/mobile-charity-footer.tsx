"use client"

import { useLayoutEffect, useRef } from "react"
import type { Charity } from "@favpoll/types"
import { FavpollListCardCharityCarousel } from "@/components/favpoll-list-card/favpoll-list-card-charity-carousel"
import { GoalProgress } from "@/components/goal-progress"
import { formatPounds } from "@/lib/i18n"

type Props = {
  charities: Charity[]
  totalRaised: number
  goalAmount: number | null
}

// The phone's charity surface: fixed to the bottom, always visible. On a
// phone the right column — CharityBanner, its goal bar, the share button —
// is not rendered at all (PageLayout hides it below md), so until 2026-08-29
// a guest on a phone never saw the pledge goal: the most motivating number a
// fundraiser has, invisible on the device most guests hold. The goal rides
// under the charity row here in the banner's exact words, so the two
// surfaces cannot drift.
//
// THE FOOTER PUBLISHES ITS HEIGHT. Two other things have to clear it — the
// share FAB (FavpollSubheader) and the page's bottom padding (PageLayout) —
// and both used to hardcode the old 61px. Adding the goal made the footer
// 93px and the FAB sat 5px inside it (measured 2026-08-29); the safe-area
// inset on a notched iPhone would have done the same on its own. So the
// rendered height is written to `--charity-footer-h` on <html> and the
// other two derive from it: change what is in here and they follow.
export const CHARITY_FOOTER_HEIGHT_VAR = "--charity-footer-h"

export function MobileCharityFooter({
  charities,
  totalRaised,
  goalAmount,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    const root = document.documentElement
    if (!el || typeof ResizeObserver === "undefined") return
    const publish = () =>
      root.style.setProperty(
        CHARITY_FOOTER_HEIGHT_VAR,
        `${el.getBoundingClientRect().height}px`
      )
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)
    return () => {
      observer.disconnect()
      root.style.removeProperty(CHARITY_FOOTER_HEIGHT_VAR)
    }
  }, [])

  if (charities.length === 0) return null
  const perCharity = totalRaised / charities.length

  return (
    <div
      ref={ref}
      className="fixed right-0 bottom-0 left-0 z-20 border-t border-border bg-background px-4 py-3 md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <FavpollListCardCharityCarousel
        charities={charities.map((charity) => ({ charity }))}
        perCharity={perCharity}
      />
      {goalAmount ? (
        <div className="mt-2">
          <GoalProgress
            totalRaised={totalRaised}
            goalAmount={goalAmount}
            className="h-1"
          />
          <p
            className="mt-1 text-right text-xs text-muted-foreground"
            aria-live="polite"
          >
            {formatPounds(totalRaised)} raised of the {formatPounds(goalAmount)}{" "}
            goal
          </p>
        </div>
      ) : null}
    </div>
  )
}
