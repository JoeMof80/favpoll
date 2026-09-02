"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Check, ChevronRight, Clock, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/display"
import { Button } from "@/components/ui/button"
import { paletteForFavpoll } from "@/lib/register-palette"
import type { FavpollCategory, FavpollSubject } from "@favpoll/types"
import {
  type OrganizerFavpoll,
  WARNING_THRESHOLD_DAYS,
  isFavpollClosed,
  daysRemaining,
} from "./utils"

// THE CONSOLE ROW (candidate A of the my-favpolls redesign, drafted
// 2026-09-02): one favpoll as a scannable operations line — no
// accordion, every vital inline — for the professional holding many
// (funeral directors, event coordinators). The whole row opens the
// favpoll's manage hub (candidate B); the one inline action is the
// thing needed mid-conversation: copy the guest link.
export function ConsoleRow({ favpoll }: { favpoll: OrganizerFavpoll }) {
  const isClosed = isFavpollClosed(favpoll)
  const days = daysRemaining(favpoll.closes_at)
  const isWarning = !isClosed && days <= WARNING_THRESHOLD_DAYS

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  const guestUrl = baseUrl
    ? `${baseUrl}/favpolls/${favpoll.id}`
    : `/favpolls/${favpoll.id}`

  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  const name =
    favpoll.subject === "cause"
      ? (favpoll.cause_label ?? "")
      : (favpoll.protagonist?.name ?? "")
  const topicTitle = favpoll.poll?.topic?.title
  const eyebrow =
    favpoll.occasion_type ??
    (favpoll.category
      ? favpoll.category.charAt(0).toUpperCase() + favpoll.category.slice(1)
      : "favpoll")

  const palette = paletteForFavpoll({
    category: (favpoll.category ?? null) as FavpollCategory | null,
    subject: (favpoll.subject ?? undefined) as FavpollSubject | undefined,
  })

  return (
    <li className="list-none" data-register={palette ?? undefined}>
      <Link
        href={`/favpolls/${favpoll.id}/manage`}
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3 transition-colors hover:bg-primary/5",
          "sm:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]",
          isClosed && "opacity-70"
        )}
      >
        {/* Identity — register ink on the eyebrow, like the cards. */}
        <span className="min-w-0">
          <span className="block truncate text-[11px] font-medium tracking-[0.08em] text-primary uppercase">
            {eyebrow}
          </span>
          <span className="block truncate text-sm font-medium text-foreground">
            {name}
            {topicTitle && (
              <span className="font-normal text-muted-foreground">
                {" "}
                · {topicTitle}
              </span>
            )}
          </span>
        </span>

        {/* Status */}
        <span className="hidden items-center gap-1.5 sm:flex">
          <Clock
            size={12}
            className="shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span
            className={cn(
              "truncate text-xs tabular-nums",
              isWarning
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
            )}
          >
            {isClosed
              ? "Closed"
              : days <= 0
                ? "closing"
                : `${days} day${days === 1 ? "" : "s"} left`}
          </span>
        </span>

        {/* Pledges */}
        <span className="hidden truncate text-xs text-muted-foreground tabular-nums sm:block">
          {favpoll.pledge_count} pledge{favpoll.pledge_count === 1 ? "" : "s"}
        </span>

        {/* Raised, with the goal bar under it when one exists */}
        <span className="hidden min-w-0 sm:block">
          <span className="block text-sm font-medium text-primary tabular-nums">
            {formatAmount(favpoll.total_raised)}
            {favpoll.goal_amount ? (
              <span className="font-normal text-muted-foreground">
                {" "}
                / {formatAmount(favpoll.goal_amount)}
              </span>
            ) : null}
          </span>
          {favpoll.goal_amount ? (
            <span className="mt-1 block h-1 w-full max-w-28 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-primary"
                style={{
                  width: `${Math.min(100, (favpoll.total_raised / favpoll.goal_amount) * 100)}%`,
                }}
              />
            </span>
          ) : null}
        </span>

        {/* Actions: copy guest link without leaving the scan; the row
            itself is the door to the hub. */}
        <span className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            aria-label="Copy guest link"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              navigator.clipboard.writeText(guestUrl).then(() => {
                setCopied(true)
                timerRef.current = setTimeout(() => setCopied(false), 2000)
              })
            }}
          >
            {copied ? (
              <Check size={13} aria-hidden="true" />
            ) : (
              <Copy size={13} aria-hidden="true" />
            )}
          </Button>
          <ChevronRight
            size={16}
            className="text-muted-foreground"
            aria-hidden="true"
          />
        </span>

        {/* Mobile second line: the vitals the grid hides. */}
        <span className="col-span-2 flex items-center gap-3 text-xs text-muted-foreground sm:hidden">
          <span className={cn(isWarning && "text-amber-600")}>
            {isClosed ? "Closed" : `${Math.max(days, 0)}d left`}
          </span>
          <span className="tabular-nums">{favpoll.pledge_count} pledges</span>
          <span className="font-medium text-primary tabular-nums">
            {formatAmount(favpoll.total_raised)}
          </span>
        </span>
      </Link>
    </li>
  )
}
