"use client"

import { useLayoutEffect, useRef } from "react"
import Link from "next/link"
import type { Charity } from "@favpoll/types"
import { FavpollListCardCharityCarousel } from "@/components/favpoll-list-card/favpoll-list-card-charity-carousel"
import { GoalProgress } from "@/components/goal-progress"
import { formatPounds } from "@/lib/i18n"
import { useHideOnScrollDown } from "./use-hide-on-scroll"

type Props = {
  charities: Charity[]
  totalRaised: number
  goalAmount: number | null
  /** Appeal membership — the rail's "Part of" line has no mobile home
      (the rail hides below md), so the footer carries it (founder,
      2026-09-06). */
  appeal?: { name: string; slug: string } | null
}

// The phone's charity surface: fixed to the bottom, always visible. On a
// phone the right column — CharityBanner, its goal bar, the share button —
// is not rendered at all (PageLayout hides it below md), so until 2026-08-29
// a guest on a phone never saw the pledge goal: the most motivating number a
// fundraiser has, invisible on the device most guests hold.
//
// WITH A GOAL, THE ROW SHOWS THE TOTAL. The row's figure is normally the
// per-charity split (what the list card shows), but a goal is a
// whole-favpoll number, and "of the £500 goal" under a £300 split would
// read wrong. So when a goal is set the figure is the favpoll total, with
// the goal beneath it in the "Charity no." line's style (founder, 2026-08-29:
// the caption "underneath the total, inline with the charity no"). With one
// charity — nearly every favpoll — total and split are the same number. The
// split stays on the desktop banner, where each charity has its own row.
//
// THE FOOTER PUBLISHES ITS HEIGHT. Two other things have to clear it — the
// share FAB (FavpollSubheader) and the page's bottom padding (PageLayout) —
// and both used to hardcode the old 61px. Adding the goal made the footer
// 93px and the FAB sat 5px inside it (measured 2026-08-29); the safe-area
// inset on a notched iPhone would have done the same on its own. So the
// rendered height is written to `--charity-footer-h` on <html> and the
// other two derive from it: change what is in here and they follow.
export const CHARITY_FOOTER_HEIGHT_VAR = "--charity-footer-h"
// The FABs ride this one instead (founder, 2026-09-09): it drops to 0px
// while the footer is tucked away, so they glide down into the corner —
// X-style — while page padding keeps the constant var and never reflows.
export const CHARITY_FOOTER_VISIBLE_VAR = "--charity-footer-visible-h"

export function MobileCharityFooter({
  charities,
  totalRaised,
  goalAmount,
  appeal,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const hidden = useHideOnScrollDown()

  useLayoutEffect(() => {
    const el = ref.current
    const root = document.documentElement
    if (!el || typeof ResizeObserver === "undefined") return
    const publish = () => {
      const h = `${el.getBoundingClientRect().height}px`
      root.style.setProperty(CHARITY_FOOTER_HEIGHT_VAR, h)
      root.style.setProperty(CHARITY_FOOTER_VISIBLE_VAR, hidden ? "0px" : h)
    }
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)
    return () => {
      observer.disconnect()
      root.style.removeProperty(CHARITY_FOOTER_HEIGHT_VAR)
      root.style.removeProperty(CHARITY_FOOTER_VISIBLE_VAR)
    }
  }, [hidden])

  if (charities.length === 0) return null

  return (
    <div
      ref={ref}
      className={`fixed right-0 bottom-0 left-0 z-20 border-t border-border bg-background px-4 py-3 transition-transform duration-300 md:hidden ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      {/* Slim appeal strip, the banner's own arrangement: above the
          charity rows, behind a divider. The footer publishes its height,
          so the FABs and page padding absorb the extra line. */}
      {appeal && (
        <p className="mb-2 truncate border-b border-border pb-2 text-xs text-muted-foreground">
          Part of{" "}
          <Link
            href={`/appeals/${appeal.slug}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {appeal.name}
          </Link>
        </p>
      )}
      <FavpollListCardCharityCarousel
        charities={charities.map((charity) => ({ charity }))}
        perCharity={goalAmount ? totalRaised : totalRaised / charities.length}
        amountCaption={
          goalAmount
            ? totalRaised >= goalAmount
              ? // Words, not colour alone — on a fundraiser page the brand
                // green hides the bar's success turn (PROJECT.md open item).
                `${formatPounds(goalAmount)} goal reached`
              : `of the ${formatPounds(goalAmount)} goal`
            : undefined
        }
      />
      {goalAmount ? (
        <GoalProgress
          totalRaised={totalRaised}
          goalAmount={goalAmount}
          className="mt-2 h-1"
        />
      ) : null}
    </div>
  )
}
