"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Building2,
  FlaskConical,
  Megaphone,
  Scale,
  Search,
} from "lucide-react"
import { SECTIONS } from "@/lib/library"
import type { LibraryEntry, LibrarySection } from "@/lib/library"

type Row = LibraryEntry & { href: string }

// THE LIBRARY IS A RECORD, SO IT READS NEWEST FIRST (founder, 2026-10-23:
// "i feel like they should be organised by date and colour code to
// categorise"). The page used to group by section and carry a "Most recent:"
// line above it — which was the design admitting that recency was the thing
// it could not show. Search already answers "where is the thing about X",
// which was most of what the sections were for.
//
// GROUPED BY WEEK (founder, 2026-10-23: "month isn't granular enough").
// Measured across all three: by DAY is 23 groups for 39 entries and 16 of
// them hold one row, so the headings become the noise; by MONTH is 5 groups
// and one of them is 21 rows, which is the undifferentiated scroll again. By
// week is 12 groups averaging 3.3 — 4 / 14 / 4 / 2 / 2 / 2 / 2 / 2 / 1 / 2 /
// 3 / 1. The fourteen is the week PPGF reopened and Joe Metcalfe replied; a
// real week of work, not a layout failure.
//
// ONE COLUMN (founder, 2026-10-23: "single column again please"). Two were
// tried on this branch and taken out: with the months grouped, a second
// column reads top-to-bottom per column, so the eye has to run down and
// back up to stay in date order — which is the one thing this layout is
// for. The small months left half a row empty too.
//
// THE SECTION SURVIVES AS A MARK, because sorting by date loses it
// otherwise. Each row's icon wears its section's colour (tokens in
// globals.css, the admin's only departure from its single hue) and the
// section is printed as a word beside it. Colour is never the only signal:
// the shapes differ and the word is there, so nothing is lost to a
// colour-blind reader.
//
// THE LEGEND (founder, 2026-10-23: "we need a legend somewhere on the
// page"). I had argued one was unnecessary because every row spells its
// section out — wrong twice over: the label is hidden below sm, and even
// with it, you learn the mapping only by reading rows one at a time. The
// legend teaches all four at once, which is what makes the colours worth
// having peripherally.
//
// Kept from the density pass: no kind label (it said "Note" 35 times in 39),
// the summary clamped to one line (/library/[slug] prints it in full above
// the document, which is where the click was going), and two columns from lg.

const SECTION_MARK: Record<
  LibrarySection,
  { Icon: typeof Scale; className: string }
> = {
  "The rail & the law": { Icon: Scale, className: "text-library-rail" },
  "Product & research": {
    Icon: FlaskConical,
    className: "text-library-product",
  },
  "Channels & outreach": {
    Icon: Megaphone,
    className: "text-library-channel",
  },
  "Running the company": {
    Icon: Building2,
    className: "text-library-company",
  },
}

const WEEK_OF = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})
/** Within a week the day alone is ambiguous across a month boundary — the
 *  week of 28 September holds the 1st of October. */
const DAY = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

/** The Monday of an entry's week, as YYYY-MM-DD. */
function weekStart(date: string): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}

export function LibraryIndex({ entries }: { entries: Row[] }) {
  const [q, setQ] = useState("")
  const needle = q.trim().toLowerCase()
  const matches = (e: Row) =>
    !needle ||
    e.title.toLowerCase().includes(needle) ||
    e.summary.toLowerCase().includes(needle) ||
    e.source.toLowerCase().includes(needle) ||
    e.section.toLowerCase().includes(needle)

  const shown = entries
    .filter(matches)
    .sort((a, b) => b.date.localeCompare(a.date))

  // Insertion order is already newest-first, so the map preserves it.
  const weeks = new Map<string, Row[]>()
  for (const e of shown) {
    const key = weekStart(e.date)
    weeks.set(key, [...(weeks.get(key) ?? []), e])
  }

  return (
    <div className="space-y-10">
      <label className="relative block max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search titles, summaries and sections"
          aria-label="Search the library"
          className="w-full rounded-md border border-border bg-background py-2 pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>

      {/* Sits under the search and above the first week: read once, and
          thereafter the icons carry the section on their own. */}
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {SECTIONS.map((section) => {
          const { Icon, className } = SECTION_MARK[section]
          return (
            <li
              key={section}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Icon
                size={14}
                className={`shrink-0 ${className}`}
                aria-hidden="true"
              />
              {section}
            </li>
          )
        })}
      </ul>

      {[...weeks].map(([key, rows]) => {
        const heading = `Week of ${WEEK_OF.format(new Date(`${key}T00:00:00Z`))}`
        return (
          <section key={key} aria-labelledby={`lib-${key}`}>
            <h2
              id={`lib-${key}`}
              className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase"
            >
              {heading}
            </h2>
            {/* border-t per item rather than an outer card, so a month with
                one entry does not render as a lone box. */}
            <ul>
              {rows.map((e) => {
                const { Icon, className } = SECTION_MARK[e.section]
                const external = e.kind !== "reference"
                const inner = (
                  <>
                    <Icon
                      size={15}
                      className={`mt-1 shrink-0 ${className}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">
                        {e.title}
                        {external && (
                          <ArrowUpRight
                            size={13}
                            className="mb-0.5 ml-1 inline-block text-muted-foreground"
                            aria-label="opens on claude.ai"
                          />
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                        {e.summary}
                      </span>
                    </span>
                    {/* The section rides the right rail rather than sitting
                        under the summary: at full width a third line per row
                        made 39 of them tall for nothing. Hidden on a narrow
                        screen, where the icon's colour carries it alone. */}
                    <span className="mt-0.5 shrink-0 text-right text-xs text-muted-foreground">
                      <span className="hidden text-[11px] tracking-wide uppercase sm:block">
                        {e.section}
                      </span>
                      <span className="block tabular-nums">
                        {DAY.format(new Date(`${e.date}T00:00:00Z`))}
                      </span>
                    </span>
                  </>
                )
                const cls =
                  "flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/60"
                return (
                  <li key={e.source} className="border-t border-border">
                    {external ? (
                      <a
                        href={e.href}
                        target="_blank"
                        rel="noreferrer"
                        className={cls}
                        title={e.summary}
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link href={e.href} className={cls} title={e.summary}>
                        {inner}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      {needle && shown.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nothing in the library matches “{q}”.
        </p>
      )}
    </div>
  )
}
