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
  BookOpen,
  Gift,
  LayoutDashboard,
  Shapes,
  UserRound,
  Users,
  Monitor,
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
import { SwitchLine } from "@/components/ui/switch-line"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import {
  SectionList,
  SectionNav,
  SettingsGroup,
  SettingsRow,
  type ManageSection,
} from "@/components/manage/settings-rows"
import {
  EditableDateRow,
  EditableGoalRow,
  EditableTextRow,
} from "@/components/manage/editable-row"
import { updateStoryField, type StoryField } from "./actions"
import { BumpChart } from "@/components/bump-chart"
import { RankingList } from "@/components/ranking-list"
import { Countdown } from "@/components/countdown"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import {
  PledgesOverTime,
  type TimelinePoint,
} from "@/components/manage/pledges-over-time"
import type { RankHistory } from "@/lib/rank-history"
import type { Favourite } from "@favpoll/types"
import { PhotoRow } from "@/components/manage/photo-row"
import { CharityRows } from "@/components/manage/charity-rows"
import {
  FavouritesGroup,
  type ManageFavourite,
} from "@/components/manage/favourites-row"
import type { Charity } from "@favpoll/types"
import { updateClosesAt } from "@/app/favpolls/[id]/edit/actions"
import type { MentionTarget } from "@/lib/mentions"
import {
  FIELD_HINTS,
  FIELD_LABELS,
  FIELD_LIMITS,
  VISIBILITY_OPTIONS,
  guestAdditionsSentence,
  nameLabel,
  showDonationsSentence,
  visibilityHint,
} from "@/lib/favpoll-fields"
import { ghostsFor } from "@/components/new-favpoll-wizard/wizard-placeholders"
import { paletteForFavpoll } from "@/lib/register-palette"
import type { FavpollCategory, FavpollSubject } from "@favpoll/types"
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
  favourites: ManageFavourite[]
  /** A finite topic takes no organiser additions. */
  topicIsFinite: boolean
  /** Why the charity set can't change (an appeal, other people's money), or null. */
  charityLockReason: string | null
  /** Why the topic can't change (guests have pledged), or null. */
  topicLockReason: string | null
}

type Visibility = "listed" | "unlisted" | "private"

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
// section is its own screen (?section=…). No Sharing section (founder,
// 2026-09-29: "do we need a share section as well as the dropdown?"):
// the toolbar's Share popover is the one door — guest link, QR, live
// display — and the print artefacts ride Overview. Reorganised the
// same day on the founder's word: Delete lives at the end of Settings,
// the guest book has its own section, and the wizard's three authored
// steps — Header, Story, Favourites — are three sections here too.
const SECTIONS: ManageSection[] = [
  // The wizard's own glyphs for the steps it shares (wizard-step-rail
  // STEP_ICONS): a person, a book, an assortment, a gift, settings.
  // The dashboard leads (founder, 2026-09-30); the goal lives on
  // Settings in the wizard's order.
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "header", label: "Header", icon: UserRound },
  { id: "story", label: "Story", icon: BookOpen },
  { id: "favourites", label: "Favourites", icon: Shapes },
  { id: "charities", label: "Charities", icon: Gift },
  { id: "guestbook", label: "Guest book", icon: Users },
  { id: "settings", label: "Settings", icon: Settings2 },
]

export function ManageClient({
  favpoll,
  wallEntries,
  pickerCharities,
  consentGatingActive = false,
  dashboard: dash,
}: {
  favpoll: ManageFavpoll
  wallEntries: WallEntry[]
  /** The charity picker's list: active charities plus this favpoll's own. */
  pickerCharities: Charity[]
  consentGatingActive?: boolean
  /** The dashboard's data: standings with this poll's numbers, the rank
   *  history (null under the minimum), the running total by day. */
  dashboard: {
    standingItems: Favourite[]
    rankHistory: RankHistory | null
    timeline: TimelinePoint[]
  }
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

  const sections = SECTIONS
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
  // The wizard's ghost text, per category — the same words in the
  // same empty boxes (lib/favpoll-fields).
  const ghosts = ghostsFor(favpoll.category)
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

  const perCharity =
    favpoll.charities.length > 0
      ? favpoll.total_raised / favpoll.charities.length
      : 0

  // One save per row: the field's own write, then the server data
  // refreshed so every other surface of the page agrees.
  const saveField =
    (field: StoryField) => async (value: string | number | null) => {
      await updateStoryField(favpoll.id, field, value)
      router.refresh()
    }
  const saveClosesAt = async (d: Date) => {
    await updateClosesAt(favpoll.id, d.toISOString())
    router.refresh()
  }

  // MENTIONS in the About and note (lib/mentions): the charities, the
  // topic, and — in the note — the favourites, as the wizard offers.
  const aboutMentions: MentionTarget[] = [
    ...favpoll.charities.map(({ charity }) => ({
      kind: "charity" as const,
      label: charity.name,
      id: charity.id,
    })),
    ...(topicTitle ? [{ kind: "topic" as const, label: topicTitle }] : []),
  ]
  const noteMentions: MentionTarget[] = [
    ...aboutMentions,
    ...favpoll.favourites.map((f) => ({
      kind: "item" as const,
      label: f.label,
    })),
  ]

  const closesLabel = formatLongDate(
    isClosed ? (favpoll.closed_at ?? favpoll.closes_at) : favpoll.closes_at
  )

  // ── The sections ──────────────────────────────────────────────────

  // THE DASHBOARD (founder, 2026-09-30: "a Dashboard that shows Raised
  // so far, Pledges, Shared Pot… and other dataviz"): the one section
  // that is a reading surface, so the one allowed cards and charts — a
  // stat row, the standings, the running total by day, the story of
  // the poll, and the latest of the guest book with the section a tap
  // away (it previews the book; the book stays its own section).
  const card = "rounded-xl border border-border bg-background p-5"
  const stat = (label: string, body: React.ReactNode) => (
    <div className={card}>
      <SectionEyebrow variant="muted" className="font-semibold">
        {label}
      </SectionEyebrow>
      <div className="mt-2">{body}</div>
    </div>
  )
  const dashboard = (
    <div className="flex flex-col gap-6 py-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {stat(
          "Raised",
          <>
            <p className="text-2xl font-medium text-foreground tabular-nums">
              {formatAmount(favpoll.total_raised)}
              {favpoll.goal_amount ? (
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  of {formatAmount(favpoll.goal_amount)}
                </span>
              ) : null}
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
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.min(100, (favpoll.total_raised / favpoll.goal_amount) * 100)}%`,
                  }}
                />
              </div>
            ) : null}
          </>
        )}
        {stat(
          "Pledges",
          <p className="text-2xl font-medium text-foreground tabular-nums">
            {favpoll.pledge_count}
          </p>
        )}
        {stat(
          "Shared pot",
          favpoll.pot && favpoll.pot.total_deposited > 0 ? (
            <p className="text-2xl font-medium text-foreground tabular-nums">
              {formatAmount(favpoll.pot.total_deposited)}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                · {formatAmount(favpoll.pot.total_allocated)} used
              </span>
            </p>
          ) : (
            <p className="text-2xl font-medium text-muted-foreground">Empty</p>
          )
        )}
        <div className={card}>
          {isClosed ? (
            <>
              <SectionEyebrow variant="muted" className="font-semibold">
                Poll closed
              </SectionEyebrow>
              <p className="mt-2 text-2xl font-medium text-foreground">
                {closesLabel}
              </p>
            </>
          ) : (
            <Countdown closesAt={favpoll.closes_at} size="sm" />
          )}
        </div>
      </div>

      <div className={card}>
        <SectionEyebrow variant="muted" className="mb-4 font-semibold">
          Standings
        </SectionEyebrow>
        {dash.standingItems.length > 0 && favpoll.poll ? (
          <RankingList
            initialItems={dash.standingItems}
            favpollPollId={favpoll.poll.id}
            topicId=""
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Standings appear here as guests pledge.
          </p>
        )}
      </div>

      {dash.timeline.length > 0 && (
        <div className={card}>
          <PledgesOverTime points={dash.timeline} />
        </div>
      )}

      {dash.rankHistory && (
        <div className={card}>
          <BumpChart history={dash.rankHistory} />
        </div>
      )}

      <div>
        <GuestBook
          entries={wallEntries.slice(0, 6)}
          teaseBacked={false}
          count={wallEntries.length}
        />
        {wallEntries.length > 6 && (
          <Button asChild variant="ghost" size="sm" className="mt-2">
            <Link href={sectionHref("guestbook")}>
              All {favpoll.pledge_count} pledges
            </Link>
          </Button>
        )}
      </div>
    </div>
  )

  // The wall draws its own card, eyebrow and all.
  const guestbook = <GuestBook entries={wallEntries} teaseBacked={false} />

  const header = (
    <div className="flex flex-col gap-8">
      <SettingsGroup>
        <EditableTextRow
          label={FIELD_LABELS.openingLine}
          value={favpoll.opening_line ?? ""}
          maxLength={FIELD_LIMITS.openingLine}
          placeholder={ghosts.openingLine}
          readOnly={isClosed}
          onSave={saveField("opening_line")}
        />
        <EditableTextRow
          label={nameLabel(favpoll.subject, favpoll.category)}
          value={name}
          maxLength={FIELD_LIMITS.name}
          placeholder={ghosts.name}
          required
          readOnly={isClosed}
          onSave={saveField("name")}
        />
        <EditableTextRow
          label={FIELD_LABELS.context}
          value={favpoll.context ?? ""}
          maxLength={FIELD_LIMITS.context}
          placeholder={ghosts.context}
          readOnly={isClosed}
          onSave={saveField("context")}
        />
        <PhotoRow
          name={name}
          photoUrl={favpoll.photoUrl}
          readOnly={isClosed}
          onSave={saveField("photo_url")}
        />
      </SettingsGroup>
    </div>
  )

  const story = (
    <div className="flex flex-col gap-8">
      <SettingsGroup>
        <EditableTextRow
          label={FIELD_LABELS.about}
          description={FIELD_HINTS.about}
          value={favpoll.about ?? ""}
          maxLength={FIELD_LIMITS.about}
          placeholder={ghosts.about}
          multiline
          required
          mentions={aboutMentions}
          readOnly={isClosed}
          onSave={saveField("about")}
        />
        <EditableTextRow
          label={FIELD_LABELS.note}
          description={FIELD_HINTS.note}
          value={favpoll.reveal ?? ""}
          maxLength={FIELD_LIMITS.note}
          placeholder={ghosts.note}
          multiline
          mentions={noteMentions}
          readOnly={isClosed}
          onSave={saveField("note")}
        />
      </SettingsGroup>
    </div>
  )

  const favourites = (
    <div className="flex flex-col gap-8">
      <FavouritesGroup
        favpollId={favpoll.id}
        topicTitle={topicTitle}
        favourites={favpoll.favourites}
        topicIsFinite={favpoll.topicIsFinite}
        topicLockReason={favpoll.topicLockReason}
        readOnly={isClosed}
        editHref={`/favpolls/${favpoll.id}/edit`}
        onChanged={() => router.refresh()}
      />
    </div>
  )

  const charities = (
    <CharityRows
      favpollId={favpoll.id}
      charities={favpoll.charities}
      pickerCharities={pickerCharities}
      amountEach={perCharity}
      lockReason={favpoll.charityLockReason}
      readOnly={isClosed}
      consentGatingActive={consentGatingActive}
      eventCategory={
        (favpoll.category ?? null) as
          | "celebration"
          | "memorial"
          | "fundraiser"
          | null
      }
      onChanged={() => router.refresh()}
    />
  )

  // SETTINGS IN THE WIZARD'S ORDER (founder, 2026-09-30: "match the
  // Wizard settings more closely"): goal, close, visibility, guest
  // additions, show donations — the Details step's list — then Delete.
  // The ledger follows under a hairline: raised, pledges, the pot are
  // status, not settings, and Money folded in here on his word.
  const settings = (
    <div className="flex flex-col gap-8">
      <SettingsGroup>
        <EditableGoalRow
          label={FIELD_LABELS.goal}
          value={favpoll.goal_amount}
          readOnly={isClosed}
          onSave={saveField("goal_amount")}
        />
        {isClosed ? (
          <SettingsRow label="Closed">{closesLabel}</SettingsRow>
        ) : (
          <EditableDateRow
            label={FIELD_LABELS.closeDate}
            description={`${Math.max(days, 0)} day${days === 1 ? "" : "s"} left. Two extensions at most.`}
            value={new Date(favpoll.closes_at)}
            onSave={saveClosesAt}
          />
        )}
        <SettingsRow
          label={FIELD_LABELS.visibility}
          description={visibilityHint(visibility)}
        >
          <SegmentedControl
            size="lg"
            label="Who can see this favpoll"
            className="w-fit"
            value={visibility}
            onChange={(v) => {
              if (!visibilityPending) handleVisibility(v as Visibility)
            }}
            options={VISIBILITY_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
          />
        </SettingsRow>
        <SettingsRow label={FIELD_LABELS.guestAdditions}>
          <SwitchLine
            checked={guestItems}
            onCheckedChange={handleToggleGuestItems}
            disabled={guestItemsPending}
          >
            {guestAdditionsSentence(guestItems)}
          </SwitchLine>
        </SettingsRow>
        <SettingsRow label={FIELD_LABELS.showDonations}>
          <SwitchLine
            checked={showGuestAmounts}
            onCheckedChange={handleToggleShowGuestAmounts}
            disabled={showGuestAmountsPending}
          >
            {showDonationsSentence(showGuestAmounts)}
          </SwitchLine>
        </SettingsRow>
        {!isClosed && (
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
        )}
      </SettingsGroup>
    </div>
  )

  const content: Record<string, React.ReactNode> = {
    dashboard,
    header,
    story,
    favourites,
    charities,
    guestbook,
    settings,
  }
  const activeDesktop = section ?? "dashboard"
  const sectionLabel = sections.find((s) => s.id === section)?.label

  return (
    <>
      {/* THE TOOLBAR IS THE HEADER (founder, 2026-09-29: "shall we move
          the header info to the toolbar?"): the back arrow, icon-only
          and labelled; the register eyebrow and the name as the title;
          the close in the middle (desktop — the phone has it on
          Settings); the outward pair and Share flush right. Every
          section then opens straight on its heading. */}
      <ToolbarBand className="flex max-w-5xl items-center gap-3">
        <TooltipProvider>
          <Tooltip content={section ? "Manage" : "Your favpolls"} side="bottom">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="-ml-2 shrink-0 md:hidden"
            >
              <Link
                href={
                  section ? `/favpolls/${favpoll.id}/manage` : "/my-favpolls"
                }
                aria-label={section ? "Back to manage" : "Your favpolls"}
              >
                <ArrowLeft aria-hidden="true" />
              </Link>
            </Button>
          </Tooltip>
          <Tooltip content="Your favpolls" side="bottom">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="-ml-2 hidden shrink-0 md:inline-flex"
            >
              <Link href="/my-favpolls" aria-label="Your favpolls">
                <ArrowLeft aria-hidden="true" />
              </Link>
            </Button>
          </Tooltip>
        </TooltipProvider>
        <div className="flex min-w-0 flex-1 items-baseline gap-x-3">
          <span className="hidden shrink-0 text-[11px] font-medium tracking-[0.08em] text-primary uppercase sm:inline">
            {eyebrow}
          </span>
          <h1 className="min-w-0 truncate text-base font-medium text-foreground">
            {name}
          </h1>
          <p className="hidden shrink-0 text-sm whitespace-nowrap text-muted-foreground md:block">
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
        <div className="flex shrink-0 items-center gap-2">
          {/* THE OUTWARD PAIR (founder, 2026-09-29): Share and the print
              artefact are one act — getting the favpoll in front of
              guests by link and QR, or by the QR on invitations and
              table signs. Once closed, the artefact is the keepsake.
              Icon-only on the phone so the toolbar keeps one row. */}
          {isClosed ? (
            <Button asChild variant="outline">
              <Link href={`/favpolls/${favpoll.id}/keepsake`}>
                <Sparkles data-icon="inline-start" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Keepsake</span>
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <a href={`/favpolls/${favpoll.id}/stationery`}>
                <Printer data-icon="inline-start" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Stationery</span>
              </a>
            </Button>
          )}
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

      {/* The favpoll sheet's width, not the console's 1320 (founder,
          2026-09-29: "page feels too wide") — a settings page reads in
          a column, and the toolbar's row narrows with it. */}
      {/* THE SHEET (founder, 2026-09-29: "page with shadow"): the favpoll
          page's own white sheet over the register wash — PageLayout's
          classes, clip-path and all — with the wizard's two columns
          inside it: the tinted rail on the left, the fields on the
          right. Below md the sheet is the page, as on the favpoll. */}
      <div className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-5xl bg-background md:drop-shadow-lg md:[clip-path:inset(-1px_-24px_-24px_-24px)]">
        <div className="md:grid md:min-h-[calc(100vh-7rem)] md:grid-cols-[220px_1fr] md:items-stretch">
          {/* The nav: the plain buttons on the wizard rail's tinted
              column (founder, 2026-09-29: not the rail's stations, but
              "the nav rail background colour from the wizard"), the
              wizard's icons where the concepts match. */}
          <aside className="hidden bg-primary/10 px-3 py-6 md:block">
            <div className="sticky top-32">
              <SectionNav
                sections={sections}
                active={activeDesktop}
                href={sectionHref}
              />
            </div>
          </aside>

          {/* The fields: the wizard's column and rhythm. */}
          <div className="px-6 pt-2 pb-10 md:px-12 md:pt-4">
            <div className="mx-auto w-full max-w-2xl">
              {section ? (
                // Keyed: a fresh tree per section, so no row is reused
                // for another field's value.
                <div key={section} className="min-w-0">
                  {/* The phone has no nav in view inside a section, so
                      the section's name stands in, in the rail's type;
                      on desktop the nav carries it and nothing repeats
                      it (founder, 2026-09-30). */}
                  <h2 className="pt-6 text-lg font-medium tracking-widest text-primary uppercase md:hidden">
                    {sectionLabel}
                  </h2>
                  {content[section]}
                </div>
              ) : (
                <>
                  <div className="mt-6 min-w-0 md:hidden">
                    <SectionList sections={sections} href={sectionHref} />
                  </div>
                  <div className="hidden min-w-0 md:block">{dashboard}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
