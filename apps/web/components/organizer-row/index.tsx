"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  Clock,
  Monitor,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Pencil,
} from "lucide-react"
import { BrandedQR } from "@/components/branded-qr"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/display"
import { setFavpollListed } from "@/app/favpolls/[id]/actions"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  type OrganizerFavpoll,
  WARNING_THRESHOLD_DAYS,
  isFavpollClosed,
  daysRemaining,
} from "./utils"

type Props = {
  favpoll: OrganizerFavpoll
}

// One favpoll as an expandable list row — built for organisers who hold many.
// Collapsed: identity, countdown, raised, quick guest-link copy. Expanded:
// the full management surface the old organiser card carried (QR, guest +
// display links, print pack, listed switch, charity, goal, shared fund).
export function OrganizerRow({ favpoll }: Props) {
  const isClosed = isFavpollClosed(favpoll)
  const days = daysRemaining(favpoll.closes_at)
  const isWarning = !isClosed && days <= WARNING_THRESHOLD_DAYS

  const [expanded, setExpanded] = useState(false)
  const [listed, setListed] = useState(favpoll.is_listed)
  const [listingPending, setListingPending] = useState(false)
  const [copiedGuest, setCopiedGuest] = useState(false)
  const [copiedDisplay, setCopiedDisplay] = useState(false)

  // Computed once per render; `typeof window` guard handles SSR pass.
  // URL spans carry suppressHydrationWarning to silence the server/client diff.
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")

  const guestUrl = baseUrl
    ? `${baseUrl}/favpolls/${favpoll.id}`
    : `/favpolls/${favpoll.id}`
  // Capability URL — the unguessable slug is what authorises the display
  const displayUrl = baseUrl
    ? `${baseUrl}/live/${favpoll.live_slug}`
    : `/live/${favpoll.live_slug}`

  const topicTitle = favpoll.poll?.topic?.title
  const protagonistName =
    favpoll.subject === "cause"
      ? (favpoll.cause_label ?? "")
      : (favpoll.protagonist?.name ?? "")
  const charity = favpoll.charities[0]?.charity ?? null

  async function handleToggleListed(value: boolean) {
    setListed(value)
    setListingPending(true)
    try {
      await setFavpollListed(favpoll.id, value)
    } catch {
      setListed(!value)
    } finally {
      setListingPending(false)
    }
  }

  function handleCopyGuest() {
    navigator.clipboard.writeText(guestUrl).then(() => {
      setCopiedGuest(true)
      setTimeout(() => setCopiedGuest(false), 2000)
    })
  }

  function handleCopyDisplay() {
    navigator.clipboard.writeText(displayUrl).then(() => {
      setCopiedDisplay(true)
      setTimeout(() => setCopiedDisplay(false), 2000)
    })
  }

  return (
    <li
      className={cn("list-none", isClosed && "opacity-70")}
      data-testid="organizer-row"
    >
      {/* ── Collapsed header ── */}
      <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          data-testid="row-toggle"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left"
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs text-muted-foreground">
              {favpoll.opening_line}
            </span>
            <span className="block truncate text-sm font-medium text-foreground">
              {protagonistName}
              {topicTitle && (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · {topicTitle}
                </span>
              )}
            </span>
          </span>
          <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
            <Clock
              size={12}
              className="text-muted-foreground"
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-xs tabular-nums",
                isWarning
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
              )}
              data-testid={isClosed ? "countdown-closed" : "countdown-active"}
            >
              {isClosed
                ? "Closed"
                : days <= 0
                  ? "closing"
                  : `${days} day${days === 1 ? "" : "s"}`}
            </span>
          </span>
        </button>

        {!listed && (
          <span className="hidden shrink-0 rounded-full bg-muted-foreground/10 px-2 py-0.5 text-[11px] font-medium text-muted-foreground sm:inline">
            Unlisted
          </span>
        )}
        <span
          className="shrink-0 text-sm font-medium text-primary tabular-nums"
          aria-live="polite"
        >
          {formatAmount(favpoll.total_raised)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={handleCopyGuest}
          aria-label="Copy guest link"
          data-testid="copy-guest-button"
        >
          {copiedGuest ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Copy size={14} aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* ── Expanded management panel ── */}
      {expanded && (
        <div className="grid gap-6 border-t border-border bg-muted/20 px-4 py-4 sm:grid-cols-2 sm:px-6">
          {/* Share block */}
          <div className="flex gap-3">
            <div
              data-testid="qr-code"
              className="shrink-0"
              suppressHydrationWarning
            >
              <BrandedQR
                value={guestUrl}
                size={96}
                aria-label="QR code for the guest-facing favpoll page"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5">
              {/* Guest URL (copy lives on the collapsed row) */}
              <div className="flex items-center gap-1.5">
                <ExternalLink
                  size={12}
                  className="shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span
                  className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground"
                  title={guestUrl}
                  suppressHydrationWarning
                >
                  {guestUrl}
                </span>
              </div>
              {/* Display URL */}
              <div className="flex items-center gap-1.5">
                <Monitor
                  size={12}
                  className="shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span
                  className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground"
                  title={displayUrl}
                  suppressHydrationWarning
                >
                  {displayUrl}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={handleCopyDisplay}
                  aria-label="Copy display link"
                  data-testid="copy-display-button"
                >
                  {copiedDisplay ? (
                    <Check size={12} aria-hidden="true" />
                  ) : (
                    <Copy size={12} aria-hidden="true" />
                  )}
                </Button>
              </div>
              <div className="mt-1 flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <a href={`/favpolls/${favpoll.id}/pack`}>
                    <Printer data-icon="inline-start" aria-hidden="true" />
                    Print pack
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/favpolls/${favpoll.id}/edit`}>
                    <Pencil data-icon="inline-start" aria-hidden="true" />
                    Edit
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/favpolls/${favpoll.id}`}>
                    <ExternalLink data-icon="inline-start" aria-hidden="true" />
                    View
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Status column: listed switch, charity, goal, shared fund */}
          <div className="flex flex-col justify-center gap-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {listed ? "Listed" : "Unlisted"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {listed
                    ? "Appears on the public favpolls page."
                    : "Only reachable by people you give the link to."}
                </p>
              </div>
              <Switch
                checked={listed}
                onCheckedChange={handleToggleListed}
                disabled={listingPending}
                aria-label={
                  listed
                    ? "Listed — click to unlist"
                    : "Unlisted — click to list"
                }
              />
            </div>

            {charity && (
              <div className="flex items-center gap-3">
                {charity.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={charity.logo_url}
                    alt={charity.name}
                    className="h-9 w-9 shrink-0 rounded object-contain"
                  />
                ) : (
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-secondary text-sm font-medium text-secondary-foreground"
                    aria-hidden="true"
                  >
                    {charity.name.charAt(0)}
                  </div>
                )}
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {charity.name}
                </span>
                <span className="shrink-0 text-sm font-medium text-primary">
                  {formatAmount(favpoll.total_raised)}
                </span>
              </div>
            )}

            {favpoll.goal_amount ? (
              <div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label="Progress towards the pledge goal"
                  aria-valuemin={0}
                  aria-valuemax={favpoll.goal_amount}
                  aria-valuenow={Math.min(
                    favpoll.total_raised,
                    favpoll.goal_amount
                  )}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, (favpoll.total_raised / favpoll.goal_amount) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatAmount(favpoll.total_raised)} raised of the{" "}
                  {formatAmount(favpoll.goal_amount)} goal
                </p>
              </div>
            ) : null}

            {favpoll.pot && favpoll.pot.total_deposited > 0 && (
              <p className="text-xs text-muted-foreground">
                Shared fund: {formatAmount(favpoll.pot.total_deposited)}{" "}
                deposited · {formatAmount(favpoll.pot.total_allocated)} used
              </p>
            )}
          </div>
        </div>
      )}
    </li>
  )
}
