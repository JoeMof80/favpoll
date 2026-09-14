"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Check, Clock, Copy, Monitor, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/display"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"
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
// (funeral directors, event coordinators).
//
// A HUB OF DESTINATIONS (founder, 2026-09-14, superseding row→manage):
// the row tap opens the FAVPOLL PAGE — tap the thing, see the thing,
// matching the public list. The right cluster carries the other
// surfaces: Copy (the mid-conversation share grab), Live (the
// projector, new tab) and Manage. Manage stays the one door for
// OPERATIONS (edit/delete/settings/stationery/keepsake) — the console
// is a hub of destinations, not a second operations surface.
//
// STRETCHED LINK, not a Link row: links inside an anchor are invalid
// HTML (browsers split nested <a>s), so the row uses the list cards'
// pattern — an absolute inset-0 Link, with the action cluster
// `relative` so it hit-tests above it.
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

  // The identity triple's third leg: first charity, "+N" for the rest.
  const charityLabel = favpoll.charities[0]
    ? favpoll.charities[0].charity.name +
      (favpoll.charities.length > 1 ? ` +${favpoll.charities.length - 1}` : "")
    : ""

  const palette = paletteForFavpoll({
    category: (favpoll.category ?? null) as FavpollCategory | null,
    subject: (favpoll.subject ?? undefined) as FavpollSubject | undefined,
  })

  return (
    <li className="list-none" data-register={palette ?? undefined}>
      <div
        className={cn(
          "relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3 transition-colors hover:bg-primary/5",
          "sm:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]",
          isClosed && "opacity-70"
        )}
      >
        {/* Stretched link — the row tap opens the favpoll page. */}
        <Link
          href={`/favpolls/${favpoll.id}`}
          aria-label={`View favpoll: ${name}`}
          className="absolute inset-0"
        />
        {/* Identity — register ink on the eyebrow, like the cards. The
            full triple on one line (founder, 2026-09-03): name · topic
            · charity is how a professional recognises the row. Pledges
            left the scan — an input metric the money column already
            summarises; it lives on manage. */}
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
            {charityLabel && (
              <span className="font-normal text-muted-foreground">
                {" "}
                · {charityLabel}
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

        {/* The destination cluster — relative, so it hit-tests above
            the stretched link. Copy · Live · Manage; manage nearest
            the edge, the operations door. No chevron: three explicit
            destinations replace the "this row goes somewhere" hint. */}
        <span className="relative flex items-center gap-1">
          <TooltipProvider>
            <Tooltip content={copied ? "Copied" : "Copy guest link"}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                aria-label="Copy guest link"
                onClick={() => {
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
            </Tooltip>
            <Tooltip content="Open the live display">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
              >
                <a
                  href={`/live/${favpoll.live_slug}`}
                  target="_blank"
                  rel="noopener"
                  aria-label="Open the live display"
                >
                  <Monitor size={13} aria-hidden="true" />
                </a>
              </Button>
            </Tooltip>
            <Tooltip content="Manage favpoll">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
              >
                <Link
                  href={`/favpolls/${favpoll.id}/manage`}
                  aria-label="Manage favpoll"
                >
                  <Settings2 size={13} aria-hidden="true" />
                </Link>
              </Button>
            </Tooltip>
          </TooltipProvider>
        </span>

        {/* Mobile second line: the vitals the grid hides. */}
        <span className="col-span-2 flex items-center gap-3 text-xs text-muted-foreground sm:hidden">
          <span className={cn(isWarning && "text-amber-600")}>
            {isClosed ? "Closed" : `${Math.max(days, 0)}d left`}
          </span>
          <span className="font-medium text-primary tabular-nums">
            {formatAmount(favpoll.total_raised)}
          </span>
        </span>
      </div>
    </li>
  )
}
