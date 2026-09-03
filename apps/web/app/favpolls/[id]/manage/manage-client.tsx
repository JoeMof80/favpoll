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
  Sparkles,
  Trash2,
} from "lucide-react"
import { BrandedQR } from "@/components/branded-qr"
import {
  WallOfFavourites,
  type WallEntry,
} from "@/components/wall-of-favourites"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ToolbarBand } from "@/components/ui/toolbar-band"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Chip } from "@/components/ui/chip"
import { CharityRow } from "@/components/charity-row"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/display"
import { TOAST_ERROR_STYLE } from "@/lib/toast-styles"
import {
  deleteFavpoll,
  setFavpollVisibility,
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

// THE COMPLETE RECORD, composed (founder, 2026-09-03: "redesign this
// page in the most logical way possible"). Two lanes:
//
// - MAIN — the record itself, in THE FAVPOLL'S OWN ANATOMY (header →
//   topic → story → charities, the order a guest meets it) so the
//   organiser proofs the artefact as it will be experienced. Read-only
//   with Edit doors into the wizard.
// - SIDE — the operation, grouped by kind: Status (with its controls),
//   Money (raised · goal · pledges · fund together), Share (links +
//   QR), Activity (the guest wall).
//
// Headings wear SectionEyebrow, the site's own section grammar; the
// header band carries only the DOORS (view / edit / print / keepsake).
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

  type Visibility = "listed" | "unlisted" | "private"
  const [visibility, setVisibilityState] = useState<Visibility>(
    favpoll.isPrivate ? "private" : favpoll.is_listed ? "listed" : "unlisted"
  )
  const [visibilityPending, setVisibilityPending] = useState(false)
  const [guestItems, setGuestItems] = useState(
    favpoll.allow_guest_items !== false
  )
  const [guestItemsPending, setGuestItemsPending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const copyTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => {
    const timers = copyTimersRef.current
    return (
    <>
      {/* THE SUBHEADER (founder, 2026-09-03: "like the stationery
          page") — the sticky ToolbarBand leads the page, tools flush
          right, nothing else in it. Identity lives below, at the top
          of the record column. */}
      <ToolbarBand className="flex flex-wrap items-center justify-end gap-2">

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <a href={guestUrl} target="_blank" rel="noreferrer">
              <ExternalLink data-icon="inline-start" aria-hidden="true" />
              View
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/favpolls/${favpoll.id}/edit`}>
              <Pencil data-icon="inline-start" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canDelete || deleting}
            onClick={handleDelete}
            title={
              canDelete ? undefined : "Favpolls with pledges can't be deleted."
            }
            className="text-destructive hover:text-destructive"
          >
            <Trash2 data-icon="inline-start" aria-hidden="true" />
            {deleting ? "Deleting…" : "Delete"}
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={`/favpolls/${favpoll.id}/stationery`}>
              <Printer data-icon="inline-start" aria-hidden="true" />
              Stationery
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
        </div>
      </ToolbarBand>

      <div className="mx-auto w-full max-w-330 px-4 py-8 sm:px-6">
        <Link
          href="/my-favpolls"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Your favpolls
        </Link>

        <div className="mt-4 min-w-0">
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

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* ═══ MAIN LANE — the record ═══ */}
          <div className="flex min-w-0 flex-col gap-6">
            <Card title="Header" editable>
              <div className="flex items-start justify-between gap-4">
                <div className="grid min-w-0 flex-1 gap-2">
                  {inlineFact("Opening line", favpoll.opening_line || "—")}
                  {inlineFact("Name", name || "—")}
                  {inlineFact("Context", favpoll.context || "—")}
                </div>
                <ProtagonistAvatar
                  name={name}
                  photoUrl={favpoll.photoUrl}
                  className="h-18 w-18 shrink-0 md:h-18 md:w-18"
                />
              </div>
            </Card>

            <Card title="Story" editable>
              <div className="grid gap-3">
                <div className="flex items-baseline gap-3">
                  <p className="w-24 shrink-0 text-xs text-muted-foreground">
                    About
                  </p>
                  <p className="min-w-0 flex-1 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {favpoll.about || (
                      <span className="text-muted-foreground">
                        None written.
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-baseline gap-3">
                  <p className="w-24 shrink-0 text-xs text-muted-foreground">
                    Reveal
                  </p>
                  <p className="min-w-0 flex-1 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {favpoll.reveal || (
                      <span className="text-muted-foreground">
                        None written.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </Card>

            <Card
              title={topicTitle ? `Favourite ${topicTitle}` : "Topic"}
              editable
            >
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
            </Card>

            <Card title="Charities" editable>
              <div className="flex flex-col gap-3">
                {favpoll.charities.map(({ charity }) => (
                  <CharityRow
                    key={charity.id}
                    charity={{
                      ...charity,
                      created_at: charity.created_at ?? "",
                    }}
                    amountRaised={perCharity}
                    size="sm"
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* ═══ SIDE LANE — the operation ═══ */}
          <div className="flex min-w-0 flex-col gap-6">
            <Card title="Status">
              <p className="text-lg font-medium text-foreground">
                {isClosed ? "Closed" : "Open"}
                <span className="font-normal text-muted-foreground">
                  {" "}
                  ·{" "}
                  {visibility === "private"
                    ? "Private"
                    : visibility === "listed"
                      ? "Listed"
                      : "Link only"}
                </span>
              </p>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-foreground">Visibility</span>
                  {/* Toolbar size, inline with its label (founder,
                    2026-09-03) — the compact idiom, like the switch
                    row below. */}
                  <SegmentedControl
                    label="Who can see this favpoll"
                    value={visibility}
                    onChange={(v) => {
                      if (!visibilityPending) handleVisibility(v as Visibility)
                    }}
                    options={[
                      { value: "listed", label: "Listed" },
                      { value: "unlisted", label: "Link only" },
                      { value: "private", label: "Private" },
                    ]}
                    className="w-fit"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-foreground">
                    Guests can add favourites
                  </span>
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
                </div>
              </div>
            </Card>

            <Card title="Money">
              <p className="text-lg font-medium text-foreground tabular-nums">
                {formatAmount(favpoll.total_raised)}
                {favpoll.goal_amount ? (
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    of {formatAmount(favpoll.goal_amount)} goal
                  </span>
                ) : (
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    raised
                  </span>
                )}
              </p>
              {favpoll.goal_amount ? (
                <div
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
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
              ) : null}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
                {fact(
                  "Pledges",
                  <span className="tabular-nums">{favpoll.pledge_count}</span>
                )}
                {fact(
                  "Shared fund",
                  favpoll.pot && favpoll.pot.total_deposited > 0 ? (
                    <span className="tabular-nums">
                      {formatAmount(favpoll.pot.total_deposited)}
                      <span className="text-muted-foreground">
                        {" "}
                        · {formatAmount(favpoll.pot.total_allocated)} used
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Empty</span>
                  )
                )}
              </div>
            </Card>

            <Card title="Share">
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
                    size={132}
                    aria-label="QR code for the guest-facing favpoll page"
                  />
                </div>
              </div>
            </Card>

            <Card headingless>
              <WallOfFavourites entries={wallEntries} teaseBacked={false} />
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
