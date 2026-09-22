"use client"

import { useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
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

// --- Initial circle ---
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
      <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted">
        <User className="size-4 text-muted-foreground" aria-hidden="true" />
      </span>
    )
  }
  const initial = name.charAt(0).toUpperCase()
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded text-xs font-medium ${nameColour(name)}`}
    >
      {initial}
    </span>
  )
}

// --- Guest book row ---
// Row layout (founder, 2026-09-22):
// Line 1: name (left) + time (right)
// Line 2: pick (left) + amount (right, when present)
// Neither truncates — each line only has two short items.
function GuestBookRow({ entry }: { entry: WallEntry }) {
  const pick = entry.labels.length > 0 ? entry.labels[0] : null
  const extra = entry.labels.length - 1
  const isSharedPot = !pick
  const amount =
    entry.amount != null && entry.amount > 0
      ? formatPoundsExact(entry.amount)
      : null
  return (
    <div className="flex gap-3">
      <InitialCircle name={entry.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {entry.name ?? "Someone"}
          </p>
          <RelativeTime iso={entry.created_at} />
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={[
              "truncate text-xs text-muted-foreground",
              isSharedPot && "italic",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {pick ? (
              <>
                {pick}
                {extra > 0 && ` +${extra}`}
              </>
            ) : (
              "Shared pot"
            )}
          </p>
          {amount && (
            <span className="shrink-0 text-xs font-medium text-emerald-600">
              {amount}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Full row for the expanded dialog — same layout, larger text + message.
function GuestBookRowFull({ entry }: { entry: WallEntry }) {
  const pick = entry.labels.length > 0 ? entry.labels[0] : null
  const extra = entry.labels.length - 1
  const isSharedPot = !pick
  const amount =
    entry.amount != null && entry.amount > 0
      ? formatPoundsExact(entry.amount)
      : null
  return (
    <div>
      <div className="flex gap-3">
        <InitialCircle name={entry.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-base font-medium text-foreground">
              {entry.name ?? "Someone"}
            </p>
            <span className="shrink-0 text-sm text-muted-foreground">
              <RelativeTime iso={entry.created_at} />
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <p
              className={[
                "truncate text-sm text-muted-foreground",
                isSharedPot && "italic",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {pick ? (
                <>
                  {pick}
                  {extra > 0 && ` +${extra}`}
                </>
              ) : (
                "Shared pot"
              )}
            </p>
            {amount && (
              <span className="shrink-0 text-sm font-medium text-emerald-600">
                {amount}
              </span>
            )}
          </div>
        </div>
      </div>
      {entry.message && (
        <p className="mt-1.5 ml-11 border-l-2 border-border pl-3 text-base text-muted-foreground italic">
          {entry.message}
        </p>
      )}
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
  variant = "card",
}: {
  entries: WallEntry[]
  teaseBacked?: boolean
  animate?: boolean
  maxEntries?: number
  /**
   * Hold space for this many rows, whether or not they have arrived.
   * Rows are ~3.25rem tall with gap-4 between.
   */
  reserveRows?: number
  expandable?: boolean
  /** "card" = bordered card (favpoll page, manage); "border" = left
   *  border only (live display). */
  variant?: "card" | "border"
}) {
  const reduced = useReducedMotion()
  const [allOpen, setAllOpen] = useState(false)
  const shown = maxEntries ? entries.slice(0, maxEntries) : entries
  const reserved = reserveRows
    ? {
        minHeight: `calc(${reserveRows} * 3.25rem + ${Math.max(0, reserveRows - 1)} * 1rem)`,
      }
    : undefined
  const animated = animate && !reduced

  const countLabel =
    entries.length > 0
      ? ` · ${entries.length} ${entries.length === 1 ? "pledge" : "pledges"}`
      : ""

  const isCard = variant === "card"
  // Card variant with entries becomes a single tap target (like the pot
  // card) — tapping anywhere opens the expand dialog.
  const Wrapper = isCard && expandable && entries.length > 0 ? "button" : "div"
  const wrapperProps =
    Wrapper === "button"
      ? {
          type: "button" as const,
          onClick: () => setAllOpen(true),
          "aria-label": "Expand guest book",
        }
      : {}

  return (
    <>
      <Wrapper
        {...wrapperProps}
        className={
          variant === "border"
            ? "border-l-2 border-border pl-5"
            : [
                "w-full rounded-lg border border-border bg-card py-4 text-left",
                Wrapper === "button" && "transition-colors hover:bg-muted/50",
              ]
                .filter(Boolean)
                .join(" ")
        }
      >
        <div className="flex items-start justify-between gap-2 px-5">
          <SectionEyebrow variant="muted" className="font-semibold">
            Guest book
            {countLabel && (
              <span className="font-normal opacity-70">{countLabel}</span>
            )}
          </SectionEyebrow>
          {expandable && entries.length > 0 && (
            <Maximize2
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>
        {shown.length === 0 ? (
          <p
            className="mt-2 px-5 text-sm text-muted-foreground"
            style={reserved}
          >
            Names appear here as people pledge.
          </p>
        ) : (
          <>
            <ul
              className={
                expandable
                  ? "mt-3 max-h-80 space-y-4 overflow-y-auto px-5"
                  : "mt-3 space-y-4 px-5"
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
                    <GuestBookRow entry={entry} />
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
      </Wrapper>
      {/* Portal-rendered overlay lives OUTSIDE the button wrapper —
        otherwise closing the overlay fires inside the button,
        which re-opens it immediately. */}
      {expandable && (
        <ResponsiveOverlay
          open={allOpen}
          onOpenChange={setAllOpen}
          title="Guest book"
          dialogContentClassName="flex-1 overflow-y-auto px-5 pb-5"
        >
          <ul className="space-y-5" aria-label="All pledges">
            {entries.map((entry) => (
              <li key={entry.id}>
                <GuestBookRowFull entry={entry} />
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
    </>
  )
}
