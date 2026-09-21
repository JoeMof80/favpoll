"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  Check,
  Copy,
  EllipsisVertical,
  ExternalLink,
  Monitor,
  Pencil,
  Printer,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react"
import { BrandedQR } from "@/components/branded-qr"
import { GuestBook, type WallEntry } from "@/components/guest-book"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ToolbarBand } from "@/components/ui/toolbar-band"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { paletteForFavpoll } from "@/lib/register-palette"
import type { FavpollCategory, FavpollSubject } from "@favpoll/types"
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
  setFavpollShowGuestAmounts,
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
  show_guest_amounts: boolean
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

type Visibility = "listed" | "unlisted" | "private"

// The room the toolbar never had (founder, 2026-09-14): one honest
// sentence per state, shown under the control for the CURRENT value.
// "private" is a sign-in gate, not organiser-only — the guest page
// redirects signed-out visitors to sign in.
const VISIBILITY_NOTES: Record<Visibility, string> = {
  listed: "Anyone can find this favpoll on the All favpolls list.",
  unlisted: "Hidden from the list — only people with the link can find it.",
  private: "Hidden from the list, and guests must sign in to view it.",
}

// A card in either lane. ONE Edit door for the whole page — the
// toolbar's (founder, 2026-09-03); per-card doors all led to the same
// wizard anyway. Module scope, not inside ManageClient: a component
// created during render is remade every pass (react-compiler error).
function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-background p-5">
      <div className="mb-4">
        <SectionEyebrow as="h2">{title}</SectionEyebrow>
      </div>
      {children}
    </section>
  )
}

const formatLongDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

// THE COMPLETE RECORD, composed (founder, 2026-09-03). The sticky
// ToolbarBand leads the page — the stationery workspace's own
// subheader, tools flush right, nothing else in it. Beneath, the page
// column: back-link, identity, then two lanes —
//
// - MAIN — the record itself, in THE FAVPOLL'S OWN ANATOMY (header →
//   story → topic → charities) so the organiser proofs the artefact as
//   it will be experienced. Read-only with Edit doors into the wizard.
// - SIDE — the operation, grouped by kind: Charities, Money (raised ·
//   goal · pledges · fund), the guest wall. Visibility, guest
//   additions, the doors and the share popover all ride the toolbar.
export function ManageClient({
  favpoll,
  wallEntries,
}: {
  favpoll: ManageFavpoll
  wallEntries: WallEntry[]
}) {
  const router = useRouter()

  // The manage page opens mid-scroll on some navigations — the browser
  // restores a stale position or the layout shifts before paint. Reset
  // to the top on mount (useLayoutEffect = pre-paint, no flash).
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const isClosed = isFavpollClosed(favpoll)
  const days = daysRemaining(favpoll.closes_at)
  const isWarning = !isClosed && days <= WARNING_THRESHOLD_DAYS

  // The origin resolves in an effect, not at render: reading
  // window.location.origin during render makes the server (no window)
  // and the client (tunnel hosts, ports) disagree — a hydration
  // mismatch on every href built from it.
  const [baseUrl, setBaseUrl] = useState(process.env.NEXT_PUBLIC_BASE_URL || "")
  useEffect(() => {
    setBaseUrl((prev) => prev || window.location.origin)
  }, [])
  const guestUrl = baseUrl
    ? `${baseUrl}/favpolls/${favpoll.id}`
    : `/favpolls/${favpoll.id}`
  const qrUrl = baseUrl
    ? `${baseUrl}/p/${favpoll.short_code}`
    : `/p/${favpoll.short_code}`
  const displayUrl = baseUrl
    ? `${baseUrl}/live/${favpoll.live_slug}`
    : `/live/${favpoll.live_slug}`

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

  const [visibility, setVisibilityState] = useState<Visibility>(
    favpoll.isPrivate ? "private" : favpoll.is_listed ? "listed" : "unlisted"
  )
  const [visibilityPending, setVisibilityPending] = useState(false)
  const [guestItems, setGuestItems] = useState(
    favpoll.allow_guest_items !== false
  )
  const [guestItemsPending, setGuestItemsPending] = useState(false)
  const [showGuestAmounts, setShowGuestAmounts] = useState(
    favpoll.show_guest_amounts === true
  )
  const [showGuestAmountsPending, setShowGuestAmountsPending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
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

  async function handleVisibility(v: Visibility) {
    const prev = visibility
    setVisibilityState(v)
    setVisibilityPending(true)
    try {
      await setFavpollVisibility(favpoll.id, v)
    } catch {
      setVisibilityState(prev)
    } finally {
      setVisibilityPending(false)
    }
  }

  async function handleToggleShowGuestAmounts(value: boolean) {
    setShowGuestAmounts(value)
    setShowGuestAmountsPending(true)
    try {
      await setFavpollShowGuestAmounts(favpoll.id, value)
    } catch {
      setShowGuestAmounts(!value)
    } finally {
      setShowGuestAmountsPending(false)
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

  // The … menu item opens the confirm dialog (shadcn Dialog, replacing
  // window.confirm — founder, 2026-09-14); this performs the deletion.
  async function performDelete() {
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

  const fact = (label: string, value: React.ReactNode) => (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-sm text-foreground">{value}</div>
    </div>
  )

  // Label and value share a line — the record's gutter grammar.
  const inlineFact = (label: string, value: React.ReactNode) => (
    // min-w-0 on the ROW too, not just the value: the row is a grid item
    // (min-width:auto) and iOS Safari resolves that through the nested
    // flex differently from Chrome — the value overran the avatar
    // (founder screenshot, 2026-09-14).
    // WRAP, NOT TRUNCATE (founder, 2026-09-14): this card IS the record —
    // a truncated value hides the very data the card exists to show, with
    // no recovery on touch. Truncation belongs in list rows, where manage
    // is the destination that shows the full value.
    <div className="flex min-w-0 items-baseline gap-3">
      <p className="w-24 shrink-0 text-xs text-muted-foreground">{label}</p>
      <div className="min-w-0 flex-1 text-sm break-words text-foreground">
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
  ) => {
    // The scheme is noise in a 220px popover — show host+path, copy
    // the full link (founder, 2026-09-03).
    const shown = display.replace(/^https?:\/\//, "")
    return (
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
              {shown}
            </a>
          ) : (
            <Link
              href={href}
              className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
              title={display}
              suppressHydrationWarning
            >
              {shown}
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
  }

  const perCharity =
    favpoll.charities.length > 0
      ? favpoll.total_raised / favpoll.charities.length
      : 0

  return (
    <>
      {/* THE SUBHEADER (founder, 2026-09-03: "like the stationery
          page") — the sticky ToolbarBand leads the page, tools flush
          right, nothing else in it. Identity lives below, at the top
          of the record column. */}
      <ToolbarBand className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {/* The back door, the visibility tabs and the guest switch share
            one group so on mobile they sit on the same row rather than
            the tabs wrapping alone (founder, 2026-09-13). Ghost Button,
            not a bare link — same ask. */}
        {/* Default size, not sm — level with the other toolbar
            buttons (founder, 2026-09-14, applied on every toolbar). */}
        <Button asChild variant="ghost" className="-ml-2">
          <Link href="/my-favpolls">
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            Your favpolls
          </Link>
        </Button>
        {/* SHARE + … ONLY (founder, 2026-09-14, superseding the door
            buttons of the same morning): Share is the one action that
            earns permanent visibility — the growth lever. The doors
            (Edit/Stationery/Keepsake) and Delete live in the …
            overflow, the idiom the poll page's heading established.
            Settings moved to the "Visibility & guests" card; the
            share popover's guest link is the View door (2026-09-03). */}
        <div className="ml-auto flex items-center gap-2">
          {/* SHARE AS A POPOVER (founder, 2026-09-03): sharing is an
                action, so it rides the toolbar — a Popover, not a
                menu, because the content is interactive (copy
                buttons, QR). */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Share2 data-icon="inline-start" aria-hidden="true" />
                Share
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-55 p-5">
              {/* QR leads, near-full width — the thing handed
                    across a table; links stack beneath (founder,
                    2026-09-03). 288 read as too big; 180 settled. */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-center" suppressHydrationWarning>
                  <BrandedQR
                    value={qrUrl}
                    size={180}
                    aria-label="QR code for the guest-facing favpoll page"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-3">
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
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="More actions"
              >
                <EllipsisVertical className="size-5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isClosed && (
                <DropdownMenuItem asChild>
                  <Link href={`/favpolls/${favpoll.id}/edit`}>
                    <Pencil aria-hidden="true" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <a href={`/favpolls/${favpoll.id}/stationery`}>
                  <Printer aria-hidden="true" />
                  Stationery
                </a>
              </DropdownMenuItem>
              {isClosed && (
                <DropdownMenuItem asChild>
                  <Link href={`/favpolls/${favpoll.id}/keepsake`}>
                    <Sparkles aria-hidden="true" />
                    Keepsake
                  </Link>
                </DropdownMenuItem>
              )}
              {/* Delete is menu-resident, the standard home for a rare
                  destructive action — after a separator, destructive
                  variant, guarded by handleDelete's confirm. Only
                  while OPEN (the zero-pledges guard made it an
                  open-favpoll action anyway). */}
              {!isClosed && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={!canDelete || deleting}
                    onSelect={() => setConfirmDeleteOpen(true)}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive [&_svg]:text-destructive"
                  >
                    <Trash2 aria-hidden="true" />
                    {canDelete
                      ? deleting
                        ? "Deleting…"
                        : "Delete favpoll"
                      : "Delete (has pledges)"}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* CONTROLLED, a sibling of the menu — the menu closes on
              select and the overlay lives outside it, so Radix's focus
              return can't snap it shut. ResponsiveOverlay, not a raw
              Dialog: the app's convention is bottom sheet on mobile /
              centred dialog on desktop, register palette carried
              through the portal (founder, 2026-09-14). */}
          <ResponsiveOverlay
            open={confirmDeleteOpen}
            onOpenChange={setConfirmDeleteOpen}
            title={`Delete ${name || "this favpoll"}?`}
            description="The favpoll and its poll will be gone for good — this can't be undone."
            dataRegister={paletteForFavpoll({
              category: (favpoll.category ?? null) as FavpollCategory | null,
              subject: (favpoll.subject ?? undefined) as
                | FavpollSubject
                | undefined,
            })}
            dialogClassName="max-w-sm"
            footer={
              /* The overlay footer house pattern (hero-photo-overlay):
                 ghost Cancel + the action as h-11 flex-1 twins
                 (founder, 2026-09-15: the small-button footer varied
                 from every other dialog). */
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 flex-1 md:text-base"
                  disabled={deleting}
                  onClick={() => setConfirmDeleteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11 flex-1 md:text-base"
                  disabled={deleting}
                  onClick={performDelete}
                >
                  <Trash2 data-icon="inline-start" aria-hidden="true" />
                  {deleting ? "Deleting…" : "Delete favpoll"}
                </Button>
              </div>
            }
          />
        </div>
      </ToolbarBand>

      <div className="mx-auto w-full max-w-330 px-4 py-8 sm:px-6">
        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.08em] text-primary uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-0.5 truncate text-2xl font-medium text-foreground">
              {name}
            </h1>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {isClosed ? "Closed" : "Closes"}
            </p>
            <p
              className={cn(
                "mt-0.5 text-2xl font-medium",
                !isClosed && isWarning
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-foreground"
              )}
            >
              {formatLongDate(
                isClosed
                  ? (favpoll.closed_at ?? favpoll.closes_at)
                  : favpoll.closes_at
              )}
              {!isClosed && (
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  · {Math.max(days, 0)} day{days === 1 ? "" : "s"} left
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* ═══ MAIN LANE — the record ═══ */}
          <div className="flex min-w-0 flex-col gap-6">
            <Card title="Header">
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

            <Card title="Story">
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

            <Card title={topicTitle ? `Favourite ${topicTitle}` : "Topic"}>
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
          </div>

          {/* ═══ SIDE LANE — the operation ═══ */}
          <div className="flex min-w-0 flex-col gap-6">
            <Card title="Charities">
              <div className="flex flex-col gap-3">
                {favpoll.charities.map(({ charity }) => (
                  <div key={charity.id} className="flex flex-col gap-1">
                    <CharityRow
                      charity={{
                        ...charity,
                        created_at: charity.created_at ?? "",
                      }}
                      amountRaised={perCharity}
                      size="sm"
                    />
                    {/* STATUS ONLY — favpoll owns the consent outreach, not
                        the organiser (founder, 2026-09-14): consent_status
                        lives on charities, one agreement per charity across
                        every favpoll, so the invitation is a platform-level
                        relationship. The organiser mailto path is gone. */}
                    {charity.consent_status &&
                      charity.consent_status !== "approved" && (
                        <p className="text-xs text-muted-foreground">
                          {charity.consent_status === "declined"
                            ? "The charity has declined — pledges here are paused."
                            : `Pledges are held until ${charity.name} agrees to receive them.`}
                        </p>
                      )}
                  </div>
                ))}
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
                  "Shared pot",
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

            {/* SETTINGS AS A CARD, not toolbar controls (founder,
                2026-09-14): the settings need a sentence of
                explanation each, and a card keeps the current state
                glanceable — a dialog would hide it. */}
            <Card title="Visibility & guests">
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <SegmentedControl
                    label="Who can see this favpoll"
                    // w-fit: a grid item stretches, and the control at
                    // full card width read as broken (founder,
                    // 2026-09-14). Toolbar-size sm kept on purpose —
                    // the founder declined the lg form scale here.
                    className="w-fit"
                    value={visibility}
                    onChange={(v) => {
                      if (!visibilityPending) handleVisibility(v as Visibility)
                    }}
                    options={[
                      { value: "listed", label: "Listed" },
                      { value: "unlisted", label: "Link only" },
                      { value: "private", label: "Private" },
                    ]}
                  />
                  <p className="text-xs text-muted-foreground">
                    {VISIBILITY_NOTES[visibility]}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">Guest additions</p>
                    <p className="text-xs text-muted-foreground">
                      {guestItems
                        ? "Guests can add their own favourites to the poll."
                        : "Guests pick from your list only."}
                    </p>
                  </div>
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
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">Show donations</p>
                    <p className="text-xs text-muted-foreground">
                      {showGuestAmounts
                        ? "Guests can choose to show their donation in the guest book."
                        : "Only favourite picks appear in the guest book."}
                    </p>
                  </div>
                  <Switch
                    checked={showGuestAmounts}
                    onCheckedChange={handleToggleShowGuestAmounts}
                    disabled={showGuestAmountsPending}
                    aria-label={
                      showGuestAmounts
                        ? "Donations visible in guest book — click to hide"
                        : "Donations hidden in guest book — click to show"
                    }
                  />
                </div>
              </div>
            </Card>

            {/* No wrapper: the wall draws its own card, eyebrow and
                all (founder, 2026-09-03). */}
            <GuestBook entries={wallEntries} teaseBacked={false} />
          </div>
        </div>
      </div>
    </>
  )
}
