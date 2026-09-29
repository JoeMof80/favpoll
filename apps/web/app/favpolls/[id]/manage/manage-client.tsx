"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  HeartHandshake,
  LayoutDashboard,
  Monitor,
  PenLine,
  Pencil,
  Printer,
  Settings2,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react"
import { BrandedQR } from "@/components/branded-qr"
import { GuestBook, type WallEntry } from "@/components/guest-book"
import { ToolbarBand } from "@/components/ui/toolbar-band"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import {
  SectionList,
  SectionNav,
  SettingsGroup,
  SettingsRow,
  type ManageSection,
} from "@/components/manage/settings-rows"
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

// One honest sentence per state, shown under the control for the
// CURRENT value. "private" is a sign-in gate, not organiser-only — the
// guest page redirects signed-out visitors to sign in.
const VISIBILITY_NOTES: Record<Visibility, string> = {
  listed: "Anyone can find this favpoll on the All favpolls list.",
  unlisted: "Hidden from the list — only people with the link can find it.",
  private: "Hidden from the list, and guests must sign in to view it.",
}

const formatLongDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

// THE SECTIONS (founder, 2026-09-29): manage is laid out like a
// settings page — a section nav and, per section, groups of rows. The
// wizard stays the creator; changing things happens here, field by
// field, as each row learns to edit in place. Overview is the
// desktop default; on the phone the page opens as this list and each
// section is its own screen (?section=…).
const SECTIONS: ManageSection[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "story", label: "Story", icon: PenLine },
  { id: "charities", label: "Charities", icon: HeartHandshake },
  { id: "sharing", label: "Sharing", icon: Share2 },
  { id: "settings", label: "Settings", icon: Settings2 },
  { id: "delete", label: "Delete", icon: Trash2 },
]

const NONE = <span className="text-muted-foreground">None written.</span>

export function ManageClient({
  favpoll,
  wallEntries,
}: {
  favpoll: ManageFavpoll
  wallEntries: WallEntry[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requested = searchParams.get("section")

  // The manage page opens mid-scroll on some navigations — the browser
  // restores a stale position or the layout shifts before paint. Reset
  // to the top on mount and on every section change.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [requested])

  const isClosed = isFavpollClosed(favpoll)
  const days = daysRemaining(favpoll.closes_at)
  const isWarning = !isClosed && days <= WARNING_THRESHOLD_DAYS

  // Delete is an open-favpoll action (the zero-pledges guard made it
  // one anyway), so a closed favpoll has no Delete section.
  const sections = isClosed
    ? SECTIONS.filter((s) => s.id !== "delete")
    : SECTIONS
  const section =
    requested && sections.some((s) => s.id === requested) ? requested : null
  const sectionHref = (id: string) =>
    `/favpolls/${favpoll.id}/manage?section=${id}`

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

  // A link with its copy button — the share popover's and the Sharing
  // section's shared grammar. The scheme is noise; show host+path,
  // copy the full link (founder, 2026-09-03).
  const linkRow = (
    key: string,
    label: string,
    Icon: typeof ExternalLink,
    href: string,
    display: string
  ) => {
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

  // A link as a row's control: the full link in mono, its copy button,
  // and the door itself.
  const linkControl = (key: string, href: string, label: string) => (
    <div className="flex items-center justify-end gap-1">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 truncate font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
        title={href}
        suppressHydrationWarning
      >
        {href.replace(/^https?:\/\//, "")}
      </a>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => copy(key, href)}
        aria-label={`Copy ${label}`}
      >
        {copied === key ? (
          <Check size={14} aria-hidden="true" />
        ) : (
          <Copy size={14} aria-hidden="true" />
        )}
      </Button>
    </div>
  )

  const perCharity =
    favpoll.charities.length > 0
      ? favpoll.total_raised / favpoll.charities.length
      : 0

  const closesLabel = formatLongDate(
    isClosed ? (favpoll.closed_at ?? favpoll.closes_at) : favpoll.closes_at
  )

  // ── The sections ──────────────────────────────────────────────────

  const overview = (
    <div className="flex flex-col gap-8">
      <SettingsGroup title="Money">
        <SettingsRow
          label={favpoll.goal_amount ? "Raised so far" : "Raised"}
          description={
            favpoll.goal_amount
              ? `Towards a ${formatAmount(favpoll.goal_amount)} goal.`
              : "Pledges and the shared pot together."
          }
          stacked={!!favpoll.goal_amount}
        >
          {favpoll.goal_amount ? (
            <div className="grid gap-2">
              <p className="text-lg font-medium text-foreground tabular-nums">
                {formatAmount(favpoll.total_raised)}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  of {formatAmount(favpoll.goal_amount)}
                </span>
              </p>
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
            </div>
          ) : (
            <span className="text-lg font-medium tabular-nums">
              {formatAmount(favpoll.total_raised)}
            </span>
          )}
        </SettingsRow>
        <SettingsRow label="Pledges">
          <span className="tabular-nums">{favpoll.pledge_count}</span>
        </SettingsRow>
        <SettingsRow
          label="Shared pot"
          description="Given without a favourite, spent on the standings."
        >
          {favpoll.pot && favpoll.pot.total_deposited > 0 ? (
            <span className="tabular-nums">
              {formatAmount(favpoll.pot.total_deposited)}
              <span className="text-muted-foreground">
                {" "}
                · {formatAmount(favpoll.pot.total_allocated)} used
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">Empty</span>
          )}
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="The room">
        <SettingsRow
          label="Live display"
          description="The standings on a screen in the room, on its own link."
        >
          {linkControl("display", displayUrl, "live display link")}
        </SettingsRow>
      </SettingsGroup>

      {/* The wall draws its own card, eyebrow and all. */}
      <GuestBook entries={wallEntries} teaseBacked={false} />
    </div>
  )

  const story = (
    <div className="flex flex-col gap-8">
      {!isClosed && (
        <SettingsGroup title="Editing">
          <SettingsRow
            label="Edit in the wizard"
            description="Every field, in the order guests will read them."
          >
            <Button asChild variant="outline">
              <Link href={`/favpolls/${favpoll.id}/edit`}>
                <Pencil data-icon="inline-start" aria-hidden="true" />
                Edit
              </Link>
            </Button>
          </SettingsRow>
        </SettingsGroup>
      )}
      <SettingsGroup title="Header">
        <SettingsRow label="Opening line">
          {favpoll.opening_line || NONE}
        </SettingsRow>
        <SettingsRow label={favpoll.subject === "cause" ? "Cause" : "Name"}>
          {name || NONE}
        </SettingsRow>
        <SettingsRow label="Context">{favpoll.context || NONE}</SettingsRow>
        <SettingsRow label="Photo">
          <ProtagonistAvatar
            name={name}
            photoUrl={favpoll.photoUrl}
            className="ml-auto h-14 w-14 md:h-14 md:w-14"
          />
        </SettingsRow>
      </SettingsGroup>
      <SettingsGroup title="Story">
        <SettingsRow label="About" stacked>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {favpoll.about || NONE}
          </p>
        </SettingsRow>
        <SettingsRow
          label="Personal note"
          description="Shown to guests once they have pledged."
          stacked
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {favpoll.reveal || NONE}
          </p>
        </SettingsRow>
      </SettingsGroup>
      <SettingsGroup title={topicTitle ? `Favourite ${topicTitle}` : "Topic"}>
        <SettingsRow
          label="Favourites"
          description={
            favpoll.favourites.length > 0
              ? `${favpoll.favourites.length} favourite${favpoll.favourites.length === 1 ? "" : "s"}${
                  favpoll.favourites.some((f) => f.isGuestAdded)
                    ? " · tinted = added by guests"
                    : ""
                }${
                  favpoll.favourites.some((f) => f.isHidden)
                    ? " · faded = hidden from the poll"
                    : ""
                }`
              : undefined
          }
          stacked
        >
          {favpoll.favourites.length > 0 ? (
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
          ) : (
            <p className="text-sm text-muted-foreground">No favourites.</p>
          )}
        </SettingsRow>
      </SettingsGroup>
    </div>
  )

  const charities = (
    <SettingsGroup
      title="Charities"
      description="Every pledge is split equally between them."
    >
      {favpoll.charities.map(({ charity }) => (
        <SettingsRow
          key={charity.id}
          label={
            <CharityRow
              charity={{ ...charity, created_at: charity.created_at ?? "" }}
              amountRaised={perCharity}
              size="sm"
            />
          }
          // STATUS ONLY — favpoll owns the consent outreach, not the
          // organiser (founder, 2026-09-14).
          description={
            charity.consent_status && charity.consent_status !== "approved"
              ? charity.consent_status === "declined"
                ? "The charity has declined — pledges here are paused."
                : `Pledges are held until ${charity.name} agrees to receive them.`
              : undefined
          }
          stacked
        />
      ))}
    </SettingsGroup>
  )

  const sharing = (
    <div className="flex flex-col gap-8">
      <SettingsGroup title="Share">
        <SettingsRow
          label="Guest link"
          description="The favpoll as guests see it."
        >
          {linkControl("guest", guestUrl, "guest link")}
        </SettingsRow>
        <SettingsRow
          label="QR code"
          description="Hand it across a table, or print it on the stationery."
          stacked
        >
          <div className="flex justify-center py-2" suppressHydrationWarning>
            <BrandedQR
              value={qrUrl}
              size={180}
              aria-label="QR code for the guest-facing favpoll page"
            />
          </div>
        </SettingsRow>
        <SettingsRow
          label="Live display"
          description="The standings on a screen in the room."
        >
          {linkControl("display", displayUrl, "live display link")}
        </SettingsRow>
      </SettingsGroup>
      <SettingsGroup title="Print and keep">
        <SettingsRow
          label="Stationery"
          description="Invitations, insert cards and table signs, with the QR code."
        >
          <Button asChild variant="outline">
            <a href={`/favpolls/${favpoll.id}/stationery`}>
              <Printer data-icon="inline-start" aria-hidden="true" />
              Stationery
            </a>
          </Button>
        </SettingsRow>
        {isClosed && (
          <SettingsRow
            label="Keepsake"
            description="The closed favpoll as one page to keep."
          >
            <Button asChild variant="outline">
              <Link href={`/favpolls/${favpoll.id}/keepsake`}>
                <Sparkles data-icon="inline-start" aria-hidden="true" />
                Keepsake
              </Link>
            </Button>
          </SettingsRow>
        )}
      </SettingsGroup>
    </div>
  )

  const settings = (
    <div className="flex flex-col gap-8">
      <SettingsGroup title="Visibility and guests">
        <SettingsRow
          label="Who can see this favpoll"
          description={VISIBILITY_NOTES[visibility]}
        >
          <SegmentedControl
            label="Who can see this favpoll"
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
        </SettingsRow>
        <SettingsRow
          label="Guest additions"
          description={
            guestItems
              ? "Guests can add their own favourites to the poll."
              : "Guests pick from your list only."
          }
        >
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
        </SettingsRow>
        <SettingsRow
          label="Show donations"
          description={
            showGuestAmounts
              ? "Guests can choose to show their donation in the guest book."
              : "Only favourite picks appear in the guest book."
          }
        >
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
        </SettingsRow>
      </SettingsGroup>
      <SettingsGroup title="Dates">
        <SettingsRow
          label={isClosed ? "Closed" : "Closes"}
          description={
            !isClosed
              ? `${Math.max(days, 0)} day${days === 1 ? "" : "s"} left.`
              : undefined
          }
        >
          <span
            className={cn(
              !isClosed && isWarning && "text-amber-600 dark:text-amber-400"
            )}
          >
            {closesLabel}
          </span>
        </SettingsRow>
      </SettingsGroup>
    </div>
  )

  const deleteSection = (
    <SettingsGroup title="Delete">
      <SettingsRow
        label="Delete this favpoll"
        description={
          canDelete
            ? "The favpoll and its poll will be gone for good."
            : "A favpoll with pledges can't be deleted."
        }
      >
        <Button
          type="button"
          variant="destructive"
          disabled={!canDelete || deleting}
          onClick={() => setConfirmDeleteOpen(true)}
        >
          <Trash2 data-icon="inline-start" aria-hidden="true" />
          {deleting ? "Deleting…" : "Delete favpoll"}
        </Button>
      </SettingsRow>
    </SettingsGroup>
  )

  const content: Record<string, React.ReactNode> = {
    overview,
    story,
    charities,
    sharing,
    settings,
    delete: deleteSection,
  }
  const activeDesktop = section ?? "overview"
  const sectionLabel = sections.find((s) => s.id === section)?.label

  return (
    <>
      <ToolbarBand className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {/* The back door. On the phone a section's back goes to the
            section list; the list's goes to Your favpolls. */}
        <Button asChild variant="ghost" className="-ml-2 md:hidden">
          <Link
            href={section ? `/favpolls/${favpoll.id}/manage` : "/my-favpolls"}
          >
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            {section ? "Manage" : "Your favpolls"}
          </Link>
        </Button>
        <Button asChild variant="ghost" className="-ml-2 hidden md:inline-flex">
          <Link href="/my-favpolls">
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            Your favpolls
          </Link>
        </Button>
        {/* Share is the one action that earns permanent visibility — the
            growth lever (founder, 2026-09-14). The doors it used to share
            the toolbar with now live in the sections. */}
        <div className="ml-auto flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Share2 data-icon="inline-start" aria-hidden="true" />
                Share
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-55 p-5">
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
                    guestUrl
                  )}
                  {linkRow(
                    "display",
                    "Live favpoll",
                    Monitor,
                    displayUrl,
                    displayUrl
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </ToolbarBand>

      <ResponsiveOverlay
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={`Delete ${name || "this favpoll"}?`}
        description="The favpoll and its poll will be gone for good — this can't be undone."
        dataRegister={paletteForFavpoll({
          category: (favpoll.category ?? null) as FavpollCategory | null,
          subject: (favpoll.subject ?? undefined) as FavpollSubject | undefined,
        })}
        dialogClassName="max-w-sm"
        footer={
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

      <div className="mx-auto w-full max-w-330 px-4 py-8 sm:px-6">
        {/* Identity: the eyebrow and name, the close beside them. */}
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.08em] text-primary uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-0.5 truncate text-2xl font-medium text-foreground">
              {name}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {isClosed ? "Closed" : "Closes"}{" "}
            <span
              className={cn(
                "font-medium",
                !isClosed && isWarning
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-foreground"
              )}
            >
              {closesLabel}
            </span>
            {!isClosed && (
              <>
                {" "}
                · {Math.max(days, 0)} day{days === 1 ? "" : "s"} left
              </>
            )}
          </p>
        </div>

        <div className="mt-8 grid items-start gap-8 md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)]">
          {/* Desktop: the section nav, pinned under the toolbar. */}
          <div className="sticky top-32 hidden md:block">
            <SectionNav
              sections={sections}
              active={activeDesktop}
              href={sectionHref}
            />
          </div>

          {/* ONE content area, rendered once: a chosen section on every
              width (the phone adds its heading); no section is the
              phone's list and the desktop's Overview. */}
          {section ? (
            <div className="min-w-0">
              <h2 className="mb-6 text-xl font-medium text-foreground md:hidden">
                {sectionLabel}
              </h2>
              {content[section]}
            </div>
          ) : (
            <>
              <div className="min-w-0 md:hidden">
                <SectionList sections={sections} href={sectionHref} />
              </div>
              <div className="hidden min-w-0 md:block">{overview}</div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
