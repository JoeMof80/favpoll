"use client"

import { useState } from "react"
import Link from "next/link"
import { Clock, Monitor, Copy, Check, ExternalLink } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/display"
import { setFavpollListed } from "@/app/favpolls/[id]/actions"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FavpollHeader } from "@/components/favpoll-card/favpoll-header"
import { SectionLabel } from "@/components/favpoll-card/section-label"
import {
  type OrganizerCardFavpoll,
  WARNING_THRESHOLD_DAYS,
  isFavpollClosed,
  daysRemaining,
} from "./utils"

const BRAND = "#534AB7"

type Props = {
  favpoll: OrganizerCardFavpoll
}

export function OrganizerCard({ favpoll }: Props) {
  const isClosed = isFavpollClosed(favpoll)
  const days = daysRemaining(favpoll.closes_at)
  const isWarning = !isClosed && days <= WARNING_THRESHOLD_DAYS

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
  const displayUrl = baseUrl
    ? `${baseUrl}/favpolls/${favpoll.id}/display`
    : `/favpolls/${favpoll.id}/display`

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
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-background",
        isClosed && "opacity-70"
      )}
      data-testid="organizer-card"
    >
      {/* 1. Identity */}
      <Link
        href={`/favpolls/${favpoll.id}`}
        className="block p-3 transition-colors hover:bg-muted/30"
      >
        <FavpollHeader
          protagonist={{ name: protagonistName }}
          eyebrow={favpoll.opening_line ?? ""}
          size="md"
        />
      </Link>

      {/* 2. Topic + countdown */}
      {topicTitle && (
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <SectionLabel title={topicTitle} size="md" />
          <div className="flex shrink-0 items-center gap-1.5 pl-2">
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
          </div>
        </div>
      )}

      {/* 3. Listed/Unlisted */}
      <div className="flex items-center justify-between border-t border-border px-3 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {listed ? "Listed" : "Unlisted"}
          </p>
          <p className="text-xs text-muted-foreground">
            {listed
              ? "Appears on the live favpolls page."
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

      {/* 4. Share block */}
      <div className="flex gap-3 border-t border-border px-3 py-3">
        <div
          data-testid="qr-code"
          className="shrink-0"
          suppressHydrationWarning
        >
          <QRCodeSVG
            value={guestUrl}
            size={96}
            fgColor={BRAND}
            bgColor="transparent"
            aria-label="QR code for the guest-facing favpoll page"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5">
          {/* Guest URL */}
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
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={handleCopyGuest}
              aria-label="Copy guest link"
              data-testid="copy-guest-button"
            >
              {copiedGuest ? (
                <Check size={12} aria-hidden="true" />
              ) : (
                <Copy size={12} aria-hidden="true" />
              )}
            </Button>
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
        </div>
      </div>

      {/* 5. Charity footer */}
      {charity && (
        <div className="flex items-center gap-3 border-t border-border px-3 py-2.5">
          {charity.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={charity.logo_url}
              alt={charity.name}
              className="h-9 w-9 shrink-0 rounded object-contain"
            />
          ) : (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#EEEDFE] text-sm font-medium text-[#534AB7]"
              aria-hidden="true"
            >
              {charity.name.charAt(0)}
            </div>
          )}
          <span className="min-w-0 flex-1 truncate text-sm text-foreground">
            {charity.name}
          </span>
          <span
            className="shrink-0 text-sm font-medium text-[#534AB7]"
            aria-live="polite"
          >
            {formatAmount(favpoll.total_raised)}
          </span>
        </div>
      )}
    </div>
  )
}
