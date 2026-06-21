"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Coins, Monitor, Copy, Check, ExternalLink } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/display"
import { setFavpollListed } from "@/app/favpolls/[id]/actions"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FavpollHeader } from "@/components/favpoll-card/favpoll-header"
import { SectionLabel } from "@/components/favpoll-card/section-label"
import { EventCardCharityCarousel } from "@/components/event-card/event-card-charity-carousel"
import {
  type OrganizerCardFavpoll,
  WARNING_THRESHOLD_DAYS,
  isFavpollClosed,
  daysRemaining,
} from "./utils"

const BRAND = "#534AB7"

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (typeof window !== "undefined") return window.location.origin
  return ""
}

type Props = {
  favpoll: OrganizerCardFavpoll
}

export function OrganizerCard({ favpoll }: Props) {
  const isClosed = isFavpollClosed(favpoll)
  const days = daysRemaining(favpoll.closes_at)
  const isWarning = !isClosed && days <= WARNING_THRESHOLD_DAYS

  const [listed, setListed] = useState(favpoll.is_listed)
  const [listingPending, setListingPending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [baseUrl, setBaseUrl] = useState(process.env.NEXT_PUBLIC_BASE_URL ?? "")

  useEffect(() => {
    if (!baseUrl) setBaseUrl(window.location.origin)
  }, [baseUrl])

  const guestUrl = `${baseUrl}/favpolls/${favpoll.id}`

  const topicTitle = favpoll.poll?.topic?.title
  const potRemaining =
    (favpoll.pot?.total_deposited ?? 0) - (favpoll.pot?.total_allocated ?? 0)
  const potTotal = favpoll.pot?.total_deposited ?? 0

  const protagonistName =
    favpoll.subject === "cause"
      ? (favpoll.cause_label ?? "")
      : (favpoll.protagonist?.name ?? "")

  const perCharity =
    favpoll.charities.length > 0
      ? favpoll.total_raised / favpoll.charities.length
      : 0

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

  function handleCopy() {
    navigator.clipboard.writeText(guestUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const displayUrl = `${getBaseUrl()}/favpolls/${favpoll.id}/display`

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-background",
        isClosed && "opacity-70"
      )}
      data-testid="organizer-card"
    >
      {/* 1. Identity row + status badge */}
      <Link
        href={`/favpolls/${favpoll.id}`}
        className="relative block p-3 transition-colors hover:bg-muted/30"
      >
        <div className="absolute top-3 right-3">
          {isClosed ? (
            <span
              className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              data-testid="status-badge-closed"
            >
              Closed
            </span>
          ) : (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                isWarning
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
              )}
              data-testid="status-badge-active"
            >
              {days <= 0
                ? "closing"
                : `${days} day${days === 1 ? "" : "s"} left`}
            </span>
          )}
        </div>
        <FavpollHeader
          protagonist={{ name: protagonistName }}
          eyebrow={favpoll.opening_line ?? ""}
          size="md"
        />
      </Link>

      {/* 2. Total raised */}
      <div className="flex items-baseline gap-2 border-t border-border px-4 py-3">
        <span
          className={cn(
            "text-2xl font-medium tabular-nums",
            favpoll.total_raised === 0
              ? "text-muted-foreground"
              : "text-foreground"
          )}
          aria-live="polite"
        >
          {formatAmount(favpoll.total_raised)}
        </span>
        <span className="text-xs text-muted-foreground">
          {isClosed ? "Closed" : "Active"}
        </span>
      </div>

      {/* 3. Poll row */}
      {topicTitle && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <SectionLabel title={topicTitle} size="md" />
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatAmount(favpoll.total_raised)}
          </span>
        </div>
      )}

      {/* 4. Shared fund row */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-2 text-sm">
        <Coins
          className="h-3.5 w-3.5 shrink-0 text-[#1D9E75]"
          aria-hidden="true"
        />
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatAmount(potRemaining)}
          </span>
          {" of "}
          <span>{formatAmount(potTotal)}</span>
          {" left in shared fund"}
        </span>
      </div>

      {/* 5. Listed/Unlisted switch */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {listed ? "Listed" : "Unlisted"}
          </p>
          <p className="text-xs text-muted-foreground">
            {listed
              ? "Appears on the live events page."
              : "Only reachable by people you give the link to."}
          </p>
        </div>
        <Switch
          checked={listed}
          onCheckedChange={handleToggleListed}
          disabled={listingPending}
          aria-label={
            listed ? "Listed — click to unlist" : "Unlisted — click to list"
          }
        />
      </div>

      {/* 6. Share block */}
      <div className="flex gap-4 border-t border-border px-4 py-4">
        <div className="shrink-0" data-testid="qr-code">
          <QRCodeSVG
            value={guestUrl || `/favpolls/${favpoll.id}`}
            size={72}
            fgColor={BRAND}
            bgColor="transparent"
            aria-label="QR code for the guest-facing favpoll page"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="mb-2 truncate font-mono text-xs text-muted-foreground"
            title={guestUrl}
          >
            {guestUrl || `/favpolls/${favpoll.id}`}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            data-testid="copy-link-button"
          >
            {copied ? (
              <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Copy className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>
      </div>

      {/* 7. Footer — charities + live display */}
      {favpoll.charities.length > 0 && (
        <div className="mt-auto flex items-center justify-between border-t border-border px-4 py-2.5">
          <div className="min-w-0 flex-1 overflow-hidden">
            <EventCardCharityCarousel
              charities={favpoll.charities}
              perCharity={perCharity}
              size="sm"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-2 shrink-0 gap-1.5 text-xs text-muted-foreground"
            asChild
          >
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open live display in new tab"
              data-testid="live-display-button"
            >
              <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
              Live display
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}
