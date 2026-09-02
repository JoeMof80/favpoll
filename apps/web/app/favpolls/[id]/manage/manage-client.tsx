"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Monitor,
  Pencil,
  Printer,
  Trash2,
} from "lucide-react"
import { BrandedQR } from "@/components/branded-qr"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/display"
import { TOAST_ERROR_STYLE } from "@/lib/toast-styles"
import {
  deleteFavpoll,
  setFavpollListed,
  setFavpollGuestItems,
} from "@/app/favpolls/[id]/actions"
import {
  type OrganizerFavpoll,
  WARNING_THRESHOLD_DAYS,
  isFavpollClosed,
  daysRemaining,
} from "@/components/organizer-row/utils"

const formatLongDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

// THE MANAGE HUB's body (candidate B, drafted 2026-09-02): everything
// the accordion row held, laid out as a control room — header with the
// doors (view / edit / print), a vitals band, the share card with QR,
// and the controls card. Register-inked via the page's RegisterScope.
export function ManageClient({ favpoll }: { favpoll: OrganizerFavpoll }) {
  const router = useRouter()
  const isClosed = isFavpollClosed(favpoll)
  const days = daysRemaining(favpoll.closes_at)
  const isWarning = !isClosed && days <= WARNING_THRESHOLD_DAYS

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  const guestUrl = baseUrl
    ? `${baseUrl}/favpolls/${favpoll.id}`
    : `/favpolls/${favpoll.id}`
  const qrUrl = baseUrl
    ? `${baseUrl}/p/${favpoll.short_code}`
    : `/p/${favpoll.short_code}`
  const displayUrl = baseUrl
    ? `${baseUrl}/live/${favpoll.live_slug}`
    : `/live/${favpoll.live_slug}`
  const editUrl = baseUrl
    ? `${baseUrl}/favpolls/${favpoll.id}/edit`
    : `/favpolls/${favpoll.id}/edit`

  const name =
    favpoll.subject === "cause"
      ? (favpoll.cause_label ?? "")
      : (favpoll.protagonist?.name ?? "")
  const topicTitle = favpoll.poll?.topic?.title
  const charity = favpoll.charities[0]?.charity ?? null
  const eyebrow =
    favpoll.occasion_type ??
    (favpoll.category
      ? favpoll.category.charAt(0).toUpperCase() + favpoll.category.slice(1)
      : "favpoll")

  const [listed, setListed] = useState(favpoll.is_listed)
  const [listingPending, setListingPending] = useState(false)
  const [guestItems, setGuestItems] = useState(
    favpoll.allow_guest_items !== false
  )
  const [guestItemsPending, setGuestItemsPending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const copyTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => {
    const timers = copyTimersRef.current
    return () => timers.forEach(clearTimeout)
  }, [])

  function copy(key: string, url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(key)
      copyTimersRef.current.push(setTimeout(() => setCopied(null), 2000))
    })
  }

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

  async function handleToggleGuestItems(value: boolean) {
    setGuestItems(value)
    setGuestItemsPending(true)
    try {
      await setFavpollGuestItems(favpoll.id, value)
    } catch {
      setGuestItems(!value)
    } finally {
      setGuestItemsPending(false)
    }
  }

  const canDelete =
    favpoll.pledge_count === 0 && (favpoll.pot?.total_deposited ?? 0) === 0

  async function handleDelete() {
    if (
      !window.confirm(`Delete ${name || "this favpoll"}? This can't be undone.`)
    )
      return
    setDeleting(true)
    try {
      await deleteFavpoll(favpoll.id)
      router.push("/my-favpolls")
    } catch {
      toast.error("Couldn't delete this favpoll — please try again.", {
        style: TOAST_ERROR_STYLE,
      })
      setDeleting(false)
    }
  }

  const linkRow = (
    key: string,
    label: string,
    Icon: typeof ExternalLink,
    href: string,
    display: string,
    external: boolean
  ) => (
    <div className="min-w-0">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-1.5">
        <Icon
          size={11}
          className="shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        {external ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
            title={display}
            suppressHydrationWarning
          >
            {display}
          </a>
        ) : (
          <Link
            href={href}
            className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
            title={display}
            suppressHydrationWarning
          >
            {display}
          </Link>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => copy(key, display)}
          aria-label={`Copy ${label} link`}
        >
          {copied === key ? (
            <Check size={12} aria-hidden="true" />
          ) : (
            <Copy size={12} aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  )

  const vital = (label: string, value: React.ReactNode) => (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-lg font-medium text-foreground tabular-nums">
        {value}
      </div>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-330 px-4 py-8 sm:px-6">
      <Link
        href="/my-favpolls"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Your favpolls
      </Link>

      {/* ── Header: identity + the doors ── */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-[0.08em] text-primary uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-0.5 truncate text-2xl font-medium text-foreground">
            {name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {topicTitle && <>Favourite {topicTitle.toLowerCase()}</>}
            {charity && (
              <>
                {" "}
                · {charity.name}
                {favpoll.charities.length > 1 &&
                  ` +${favpoll.charities.length - 1}`}
              </>
            )}
          </p>
          <p
            className={cn(
              "mt-1 text-sm",
              isClosed
                ? "text-muted-foreground"
                : isWarning
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
            )}
          >
            {isClosed
              ? `Closed ${formatLongDate(favpoll.closed_at ?? favpoll.closes_at)}`
              : `Closes ${formatLongDate(favpoll.closes_at)} · ${Math.max(days, 0)} day${days === 1 ? "" : "s"} left`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={guestUrl} target="_blank" rel="noreferrer">
              <ExternalLink data-icon="inline-start" aria-hidden="true" />
              View favpoll
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/favpolls/${favpoll.id}/edit`}>
              <Pencil data-icon="inline-start" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={`/favpolls/${favpoll.id}/pack`}>
              <Printer data-icon="inline-start" aria-hidden="true" />
              Print pack
            </a>
          </Button>
        </div>
      </div>

      {/* ── Vitals ── */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {vital(
          "Raised",
          <>
            {formatAmount(favpoll.total_raised)}
            {favpoll.goal_amount ? (
              <>
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  of {formatAmount(favpoll.goal_amount)}
                </span>
                <span
                  className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-label="Progress towards the pledge goal"
                  aria-valuemin={0}
                  aria-valuemax={favpoll.goal_amount}
                  aria-valuenow={Math.min(
                    favpoll.total_raised,
                    favpoll.goal_amount
                  )}
                >
                  <span
                    className="block h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, (favpoll.total_raised / favpoll.goal_amount) * 100)}%`,
                    }}
                  />
                </span>
              </>
            ) : null}
          </>
        )}
        {vital("Pledges", `${favpoll.pledge_count}`)}
        {vital(
          "Shared fund",
          favpoll.pot && favpoll.pot.total_deposited > 0 ? (
            <>
              {formatAmount(favpoll.pot.total_deposited)}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                · {formatAmount(favpoll.pot.total_allocated)} used
              </span>
            </>
          ) : (
            <span className="text-sm font-normal text-muted-foreground">
              Empty
            </span>
          )
        )}
        {vital(
          "Reveal",
          <span className="text-sm font-normal text-foreground">
            {favpoll.has_reveal ? "Written" : "None"}
          </span>
        )}
      </div>

      {/* ── Share | Controls ── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-sm font-medium text-foreground">Share</h2>
          <div className="mt-4 flex flex-col gap-4 min-[480px]:flex-row">
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
              {linkRow(
                "guest",
                "favpoll",
                ExternalLink,
                guestUrl,
                guestUrl,
                true
              )}
              {linkRow(
                "display",
                "Live favpoll",
                Monitor,
                displayUrl,
                displayUrl,
                true
              )}
              {linkRow(
                "edit",
                "Edit favpoll",
                Pencil,
                `/favpolls/${favpoll.id}/edit`,
                editUrl,
                false
              )}
            </div>
            <div className="flex shrink-0 flex-col items-start gap-2">
              <div suppressHydrationWarning>
                <BrandedQR
                  value={qrUrl}
                  size={148}
                  aria-label="QR code for the guest-facing favpoll page"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-sm font-medium text-foreground">Controls</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Visibility</p>
              <div className="mt-1 flex items-center gap-2">
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
                <span className="text-sm text-foreground">
                  {listed ? "Listed" : "Unlisted"}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Guest additions</p>
              <div className="mt-1 flex items-center gap-2">
                <Switch
                  checked={guestItems}
                  onCheckedChange={handleToggleGuestItems}
                  disabled={guestItemsPending}
                  aria-label={
                    guestItems
                      ? "Guests can add favourites — click to stop them"
                      : "Guests cannot add favourites — click to allow it"
                  }
                />
                <span className="text-sm text-foreground">
                  {guestItems ? "Allowed" : "Off"}
                </span>
              </div>
            </div>
            <div className="col-span-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canDelete || deleting}
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 data-icon="inline-start" aria-hidden="true" />
                {deleting ? "Deleting…" : "Delete favpoll"}
              </Button>
              {!canDelete && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Favpolls with pledges can&apos;t be deleted.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
