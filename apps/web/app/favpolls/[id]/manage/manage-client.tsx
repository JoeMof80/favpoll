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
  EyeOff,
  Monitor,
  Pencil,
  Printer,
  Sparkles,
  Trash2,
} from "lucide-react"
import { BrandedQR } from "@/components/branded-qr"
import {
  WallOfFavourites,
  type WallEntry,
} from "@/components/wall-of-favourites"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Chip } from "@/components/ui/chip"
import { CharityRow } from "@/components/charity-row"
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

/** The complete administrative record: the organiser list's row data
 * plus every authored thing in full. */
export type ManageFavpoll = OrganizerFavpoll & {
  isPrivate: boolean
  context: string | null
  about: string | null
  reveal: string | null
  photoUrl: string | null
  favourites: {
    id: string
    label: string
    isGuestAdded: boolean
    isHidden: boolean
  }[]
}

const formatLongDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

// THE COMPLETE RECORD (founder, 2026-09-03: "everything there is to
// show about the favpoll, all on one page in an administrative
// context"). Vitals, then the CONTENT LEDGER — header fields, the full
// story, the reveal at rest (badged as hidden from guests), the whole
// favourite list, the charities — then settings with live controls,
// the share kit, and the danger zone. Content is READ-ONLY with Edit
// doors into the wizard; the moment this page edits words it has
// rebuilt the in-place editor Phase 3 deleted.
export function ManageClient({
  favpoll,
  wallEntries,
}: {
  favpoll: ManageFavpoll
  wallEntries: WallEntry[]
}) {
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

  // A ledger section: heading + Edit door into the wizard.
  const Section = ({
    title,
    children,
    editable = true,
  }: {
    title: string
    children: React.ReactNode
    editable?: boolean
  }) => (
    <section className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {editable && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href={`/favpolls/${favpoll.id}/edit`}>
              <Pencil data-icon="inline-start" aria-hidden="true" />
              Edit
            </Link>
          </Button>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )

  const fact = (label: string, value: React.ReactNode) => (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-sm text-foreground">{value}</div>
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

  const perCharity =
    favpoll.charities.length > 0
      ? favpoll.total_raised / favpoll.charities.length
      : 0

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
          <p
            className={cn(
              "mt-1 text-sm",
              !isClosed && isWarning
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
          {isClosed && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/favpolls/${favpoll.id}/keepsake`}>
                <Sparkles data-icon="inline-start" aria-hidden="true" />
                Keepsake
              </Link>
            </Button>
          )}
          {/* The operational controls sit INLINE with the doors
              (founder, 2026-09-03: no settings or danger cards) —
              switches as labelled pairs, delete as a quiet destructive
              ghost at the row's end. */}
          <span
            aria-hidden="true"
            className="mx-1 hidden h-5 w-px bg-border sm:block"
          />
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
            <Switch
              checked={listed}
              onCheckedChange={handleToggleListed}
              disabled={listingPending || favpoll.isPrivate}
              aria-label={
                listed ? "Listed — click to unlist" : "Unlisted — click to list"
              }
            />
            {favpoll.isPrivate ? "Private" : listed ? "Listed" : "Link only"}
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
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
            Guest additions
          </label>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={!canDelete || deleting}
            onClick={handleDelete}
            aria-label="Delete favpoll"
            title={
              canDelete
                ? "Delete favpoll"
                : "Favpolls with pledges can't be deleted."
            }
            className="text-destructive hover:text-destructive"
          >
            <Trash2 size={14} aria-hidden="true" />
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
          "Status",
          <span className="text-sm font-normal text-foreground">
            {isClosed ? "Closed" : "Open"}
            {" · "}
            {favpoll.isPrivate ? "Private" : listed ? "Listed" : "Link only"}
          </span>
        )}
      </div>

      {/* ── The content ledger ── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Section title="Header">
            <div className="flex items-start gap-4">
              {favpoll.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={favpoll.photoUrl}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
              )}
              <div className="grid min-w-0 flex-1 gap-3">
                {fact("Opening line", favpoll.opening_line || "—")}
                {fact("Name", name || "—")}
                {fact("Context", favpoll.context || "—")}
              </div>
            </div>
          </Section>

          <Section title="Story">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {favpoll.about || (
                <span className="text-muted-foreground">None written.</span>
              )}
            </p>
            <div className="mt-4 border-t border-border pt-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <EyeOff size={12} aria-hidden="true" />
                The reveal — hidden from guests until they pledge
              </p>
              <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {favpoll.reveal || (
                  <span className="text-muted-foreground">None written.</span>
                )}
              </p>
            </div>
          </Section>

          <Section title="Charities">
            <div className="flex flex-col gap-3">
              {favpoll.charities.map(({ charity }) => (
                <CharityRow
                  key={charity.id}
                  charity={{ ...charity, created_at: charity.created_at ?? "" }}
                  amountRaised={perCharity}
                  size="sm"
                />
              ))}
            </div>
          </Section>
        </div>

        <div className="flex flex-col gap-6">
          <Section title={topicTitle ? `Favourite ${topicTitle}` : "Topic"}>
            {favpoll.favourites.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {favpoll.favourites.map((f) => (
                    <Chip
                      key={f.id}
                      size="sm"
                      readOnly
                      className={cn(
                        f.isGuestAdded &&
                          "border-primary bg-primary/10 text-primary",
                        f.isHidden && "opacity-40"
                      )}
                    >
                      {f.label}
                    </Chip>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {favpoll.favourites.length} favourite
                  {favpoll.favourites.length === 1 ? "" : "s"}
                  {favpoll.favourites.some((f) => f.isGuestAdded) &&
                    " · tinted = added by guests"}
                  {favpoll.favourites.some((f) => f.isHidden) &&
                    " · faded = hidden from the poll"}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No favourites.</p>
            )}
          </Section>

          <section className="rounded-xl border border-border bg-background p-5">
            <WallOfFavourites entries={wallEntries} teaseBacked={false} />
          </section>

          <Section title="Share" editable={false}>
            <div className="flex flex-col gap-4 min-[480px]:flex-row">
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
              <div className="shrink-0" suppressHydrationWarning>
                <BrandedQR
                  value={qrUrl}
                  size={148}
                  aria-label="QR code for the guest-facing favpoll page"
                />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
