"use client"

import { useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { Button } from "@/components/ui/button"
import { Maximize2, User } from "lucide-react"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { formatPoundsExact } from "@/lib/i18n"

// The guest book: presence, not size. Names (or "Someone") and what they
// backed — never amounts (anonymity model, decided 2026-07-05). Anonymous
// pledges appear as "Someone" but count fully everywhere.
export type WallEntry = {
  id: string
  /** null = anonymous or no name given → rendered as "Someone" */
  name: string | null
  /** Favourite labels this pledge backed */
  labels: string[]
  /** Donation amount in pounds — shown instead of labels when the guest
   *  chose "amount" and the organiser has show_guest_amounts enabled. */
  amount?: number
  /** Short message from the pledger ("Thinking of you") */
  message?: string | null
  created_at: string
}

function relativeTime(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

// relativeTime is clock-dependent, so server-rendered text can disagree with
// the client at hydration — by hours on statically prerendered pages (the
// landing demo bakes Date.now() into its HTML at build). Keep the server's
// text through hydration, then re-render once mounted so the client's clock
// takes over.
const emptySubscribe = () => () => {}

function RelativeTime({ iso }: { iso: string }) {
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
  return (
    <span
      className="shrink-0 text-xs text-muted-foreground"
      suppressHydrationWarning
    >
      {relativeTime(iso)}
    </span>
  )
}

// --- Initial circle (redesign, 2026-09-21) ---
// Deterministic colour from the name so each person gets a consistent dot.
// Eight soft hues that read well on both light card and projector surfaces.
const INITIAL_COLOURS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
]

function nameColour(name: string | null): string {
  if (!name) return "bg-muted text-muted-foreground"
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return INITIAL_COLOURS[Math.abs(hash) % INITIAL_COLOURS.length]
}

function InitialCircle({ name }: { name: string | null }) {
  if (!name) {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
        <User className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </span>
    )
  }
  const initial = name.charAt(0).toUpperCase()
  return (
    <span
      className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${nameColour(name)}`}
    >
      {initial}
    </span>
  )
}

// --- Favourite pills ---
function BackedPills({ labels }: { labels: string[] }) {
  if (labels.length === 0) {
    return <span className="text-xs text-muted-foreground">pledged</span>
  }
  return (
    <span className="flex flex-wrap gap-1">
      {labels.slice(0, 2).map((label) => (
        <span
          key={label}
          className="inline-flex items-center rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[11px] leading-tight text-secondary-foreground"
        >
          {label}
        </span>
      ))}
      {labels.length > 2 && (
        <span className="text-[11px] leading-tight text-muted-foreground">
          +{labels.length - 2} more
        </span>
      )}
    </span>
  )
}

// --- Two-line row (redesign, 2026-09-21) ---
// Line 1: initial circle + name (bold) + time (right-aligned)
// Line 2: backed favourites as pills, or "pledged" if stripped/none
function WallRow({ entry }: { entry: WallEntry }) {
  return (
    <div className="flex gap-2.5">
      <InitialCircle name={entry.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {entry.name ?? "Someone"}
          </span>
          <RelativeTime iso={entry.created_at} />
        </div>
        <div className="mt-0.5">
          {entry.amount != null && entry.labels.length === 0 ? (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] leading-tight font-medium text-emerald-700">
              {formatPoundsExact(entry.amount)}
            </span>
          ) : (
            <BackedPills labels={entry.labels} />
          )}
        </div>
        {entry.message && (
          <p className="mt-0.5 text-xs text-muted-foreground italic">
            {entry.message}
          </p>
        )}
      </div>
    </div>
  )
}

export function GuestBook({
  entries,
  teaseBacked = false,
  animate = false,
  maxEntries,
  reserveRows,
  expandable = false,
}: {
  entries: WallEntry[]
  /**
   * True for un-entitled viewers, whose entries arrive with the backed
   * favourites stripped — adds a line telling them pledging shows more.
   */
  teaseBacked?: boolean
  /** Animate new rows in as they arrive (live wall surfaces). */
  animate?: boolean
  /** Cap the rows shown (e.g. the live display). */
  maxEntries?: number
  /**
   * Hold space for this many rows, whether or not they have arrived.
   *
   * The live display needs it: names land one at a time through an event, and
   * a card that grows with them moved everything beneath it on every pledge —
   * including, since 2026-08-21, the QR people are meant to be scanning. A
   * scan target that walks down the screen during the busiest hour is the one
   * thing this card must not do.
   *
   * TWO-LINE ROWS (redesign, 2026-09-21): each row is ~2.75rem tall
   * (size-7 circle = 1.75rem + mt-0.5 pills line + gap-3 between rows).
   * The reservation uses 2.75rem per row + 0.75rem gap.
   */
  reserveRows?: number
  /** Collapse long walls behind a "See all" dialog (guest page). */
  expandable?: boolean
}) {
  const reduced = useReducedMotion()
  const [allOpen, setAllOpen] = useState(false)
  const shown = maxEntries ? entries.slice(0, maxEntries) : entries
  // Two-line rows: ~2.75rem per row, 0.75rem gap (space-y-3)
  const reserved = reserveRows
    ? {
        minHeight: `calc(${reserveRows} * 2.75rem + ${Math.max(0, reserveRows - 1)} * 0.75rem)`,
      }
    : undefined
  const animated = animate && !reduced

  // Count in the eyebrow (redesign, 2026-09-21): the number grows live,
  // which is its own social proof — "Guest book · 14 pledges" tells the
  // room the event is happening before you read any names.
  const countLabel =
    entries.length > 0
      ? ` · ${entries.length} ${entries.length === 1 ? "pledge" : "pledges"}`
      : ""

  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="flex items-start justify-between gap-2">
        <SectionEyebrow variant="muted" className="font-semibold">
          Guest book
          {countLabel && (
            <span className="font-normal opacity-70">{countLabel}</span>
          )}
        </SectionEyebrow>
        {/* Expand to a dialog (founder, 2026-08-02) — the card itself
            scrolls within a max height below */}
        {expandable && entries.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Expand guest book"
            onClick={() => setAllOpen(true)}
          >
            <Maximize2 aria-hidden="true" />
          </Button>
        )}
      </div>
      {shown.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground" style={reserved}>
          Names appear here as people pledge.
        </p>
      ) : (
        <>
          <ul
            className={
              expandable
                ? "mt-3 max-h-80 space-y-3 overflow-y-auto pr-1"
                : "mt-3 space-y-3"
            }
            aria-label="Recent pledges"
            style={reserved}
          >
            <AnimatePresence initial={false}>
              {shown.map((entry) => (
                <motion.li
                  key={entry.id}
                  layout={animated}
                  initial={
                    animated ? { opacity: 0, x: -12, scale: 0.97 } : false
                  }
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <WallRow entry={entry} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {teaseBacked && (
            <p className="mt-3 text-xs text-muted-foreground">
              Pledge to see what everyone backed.
            </p>
          )}
        </>
      )}
      {expandable && (
        <ResponsiveOverlay
          open={allOpen}
          onOpenChange={setAllOpen}
          title="Guest book"
          dialogContentClassName="flex-1 overflow-y-auto px-5 pb-5"
        >
          <ul className="space-y-3" aria-label="All pledges">
            {entries.map((entry) => (
              <li key={entry.id}>
                <WallRow entry={entry} />
              </li>
            ))}
          </ul>
          {teaseBacked && (
            <p className="mt-3 text-xs text-muted-foreground">
              Pledge to see what everyone backed.
            </p>
          )}
        </ResponsiveOverlay>
      )}
    </div>
  )
}
