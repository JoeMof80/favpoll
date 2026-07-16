"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Monitor,
  Printer,
  Pencil,
} from "lucide-react"
import { BrandedQR } from "@/components/branded-qr"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/display"
import { setFavpollListed } from "@/app/favpolls/[id]/actions"
import { Badge } from "@/components/ui/badge"
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

const formatPanelDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

// One favpoll as an expandable list row — built for organisers who hold many.
// Collapsed: identity, charity, countdown, raised, quick guest-link copy.
// Expanded: a share column (clickable guest/display/edit link rows + QR)
// and a manage column (listed switch, closing date, pledge count, reveal
// status, goal, shared fund, print pack).
export function OrganizerRow({ favpoll }: Props) {
  const isClosed = isFavpollClosed(favpoll)
  const days = daysRemaining(favpoll.closes_at)
  const isWarning = !isClosed && days <= WARNING_THRESHOLD_DAYS

  const [expanded, setExpanded] = useState(false)
  const [listed, setListed] = useState(favpoll.is_listed)
  const [listingPending, setListingPending] = useState(false)
  const [copiedGuest, setCopiedGuest] = useState(false)
  const [copiedDisplay, setCopiedDisplay] = useState(false)
  const [copiedEdit, setCopiedEdit] = useState(false)

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
  const editUrl = baseUrl
    ? `${baseUrl}/favpolls/${favpoll.id}/edit`
    : `/favpolls/${favpoll.id}/edit`

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

  function handleCopyEdit() {
    navigator.clipboard.writeText(editUrl).then(() => {
      setCopiedEdit(true)
      setTimeout(() => setCopiedEdit(false), 2000)
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
            <span className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-foreground">
                {protagonistName}
              </span>
              {/* The triad at a glance: protagonist · topic · charity */}
              {topicTitle && (
                <Badge
                  variant="outline"
                  className="hidden font-normal text-muted-foreground sm:inline-flex"
                >
                  {topicTitle}
                </Badge>
              )}
              {charity && (
                <Badge
                  variant="outline"
                  className="hidden font-normal text-muted-foreground sm:inline-flex"
                >
                  {charity.name}
                  {favpoll.charities.length > 1 &&
                    ` +${favpoll.charities.length - 1}`}
                </Badge>
              )}
            </span>
          </span>
          {!listed && (
            <span className="hidden shrink-0 rounded-full bg-muted-foreground/10 px-2 py-0.5 text-[11px] font-medium text-muted-foreground sm:inline">
              Unlisted
            </span>
          )}
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

      {/* ── Expanded panel: manage column | share column (QR far right).
          Share renders first in the DOM so phones — the at-the-venue case —
          get the links on top; sm:order swaps the columns on desktop. ── */}
      {expanded && (
        <div className="grid gap-x-8 gap-y-5 border-t border-border bg-muted/20 px-4 py-4 sm:grid-cols-2 sm:px-6 sm:py-5">
          {/* Share — clickable link rows, QR on the outer edge */}
          <div className="sm:order-2">
            <div className="flex flex-col gap-4 min-[480px]:flex-row">
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                {/* favpoll */}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground">favpoll</p>
                  <div className="flex items-center gap-1.5">
                    <ExternalLink
                      size={11}
                      className="shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <a
                      href={guestUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
                      title={guestUrl}
                      data-testid="favpoll-link"
                      suppressHydrationWarning
                    >
                      {guestUrl}
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={handleCopyGuest}
                      aria-label="Copy guest link"
                      data-testid="copy-guest-url-button"
                    >
                      {copiedGuest ? (
                        <Check size={12} aria-hidden="true" />
                      ) : (
                        <Copy size={12} aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>
                {/* Edit favpoll */}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    Edit favpoll
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Pencil
                      size={11}
                      className="shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Link
                      href={`/favpolls/${favpoll.id}/edit`}
                      className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
                      title={editUrl}
                      data-testid="edit-favpoll-link"
                      suppressHydrationWarning
                    >
                      {editUrl}
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={handleCopyEdit}
                      aria-label="Copy edit link"
                      data-testid="copy-edit-button"
                    >
                      {copiedEdit ? (
                        <Check size={12} aria-hidden="true" />
                      ) : (
                        <Copy size={12} aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>
                {/* Live favpoll */}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    Live favpoll
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Monitor
                      size={11}
                      className="shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <a
                      href={displayUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
                      title={displayUrl}
                      data-testid="live-favpoll-link"
                      suppressHydrationWarning
                    >
                      {displayUrl}
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
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
                </div>
              </div>
              <div
                data-testid="qr-code"
                className="shrink-0"
                suppressHydrationWarning
              >
                <BrandedQR
                  value={guestUrl}
                  size={148}
                  aria-label="QR code for the guest-facing favpoll page"
                />
              </div>
            </div>
          </div>

          {/* Manage — visibility, at-a-glance details, goal, shared fund,
              print pack */}
          <div className="flex flex-col gap-3 sm:order-1">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">
                {listed ? "Listed" : "Unlisted"}
              </p>
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

            <div className="text-xs text-muted-foreground">
              <p>
                {isClosed ? "Closed" : "Closes"}{" "}
                {formatPanelDate(
                  isClosed
                    ? (favpoll.closed_at ?? favpoll.closes_at)
                    : favpoll.closes_at
                )}
              </p>
              <p>
                {favpoll.pledge_count}{" "}
                {favpoll.pledge_count === 1 ? "pledge" : "pledges"} ·{" "}
                {favpoll.has_reveal ? "Reveal written" : "No reveal"}
              </p>
            </div>

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

            <Button asChild variant="outline" size="sm" className="mt-auto">
              <a href={`/favpolls/${favpoll.id}/pack`}>
                <Printer data-icon="inline-start" aria-hidden="true" />
                Print pack
              </a>
            </Button>
          </div>
        </div>
      )}
    </li>
  )
}
