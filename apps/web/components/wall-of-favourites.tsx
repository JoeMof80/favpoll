"use client"

import { useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { Button } from "@/components/ui/button"
import { Maximize2 } from "lucide-react"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"

// The wall of favourites: presence, not size. Names (or "Someone") and what they
// backed — never amounts (anonymity model, decided 2026-07-05). Anonymous
// pledges appear as "Someone" but count fully everywhere.
export type WallEntry = {
  id: string
  /** null = anonymous or no name given → rendered as "Someone" */
  name: string | null
  /** Favourite labels this pledge backed */
  labels: string[]
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
  // useSyncExternalStore serves the server snapshot through hydration and
  // re-renders once with the client snapshot — the sanctioned form of the
  // old setMounted-in-effect hack (react-hooks/set-state-in-effect).
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

function backedLine(labels: string[]): string {
  if (labels.length === 0) return "pledged"
  if (labels.length === 1) return `backed ${labels[0]}`
  if (labels.length === 2) return `backed ${labels[0]} and ${labels[1]}`
  return `backed ${labels[0]} and ${labels.length - 1} more`
}

function WallRow({ entry }: { entry: WallEntry }) {
  return (
    <>
      <span className="min-w-0 truncate">
        <span className="font-medium text-foreground">
          {entry.name ?? "Someone"}
        </span>{" "}
        <span className="text-muted-foreground">
          {backedLine(entry.labels)}
        </span>
      </span>
      <RelativeTime iso={entry.created_at} />
    </>
  )
}

export function WallOfFavourites({
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
   * Rows are text-sm (1.25rem of line box) with space-y-1.5 (0.375rem)
   * between, so the reservation is derived from the same values the list is
   * laid out with rather than a measured constant that would go stale.
   */
  reserveRows?: number
  /** Collapse long walls behind a "See all" dialog (guest page). */
  expandable?: boolean
}) {
  const reduced = useReducedMotion()
  const [allOpen, setAllOpen] = useState(false)
  const shown = maxEntries ? entries.slice(0, maxEntries) : entries
  const reserved = reserveRows
    ? {
        minHeight: `calc(${reserveRows} * 1.25rem + ${Math.max(0, reserveRows - 1)} * 0.375rem)`,
      }
    : undefined
  const animated = animate && !reduced

  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="flex items-start justify-between gap-2">
        <SectionEyebrow variant="muted" className="font-semibold">
          Wall of favourites
        </SectionEyebrow>
        {/* Expand to a dialog (founder, 2026-08-02) — the card itself
            scrolls within a max height below */}
        {expandable && entries.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Expand wall of favourites"
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
                ? "mt-2 max-h-72 space-y-1.5 overflow-y-auto pr-1"
                : "mt-2 space-y-1.5"
            }
            aria-label="Recent pledges"
            style={reserved}
          >
            <AnimatePresence initial={false}>
              {shown.map((entry) => (
                <motion.li
                  key={entry.id}
                  layout={animated}
                  initial={animated ? { opacity: 0, y: -8 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="flex items-baseline justify-between gap-2 text-sm"
                >
                  <WallRow entry={entry} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {teaseBacked && (
            <p className="mt-2.5 text-xs text-muted-foreground">
              Pledge to see what everyone backed.
            </p>
          )}
        </>
      )}
      {expandable && (
        <ResponsiveOverlay
          open={allOpen}
          onOpenChange={setAllOpen}
          title="Wall of favourites"
          dialogContentClassName="flex-1 overflow-y-auto px-5 pb-5"
        >
          <ul className="space-y-2" aria-label="All pledges">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-baseline justify-between gap-2 text-sm"
              >
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
