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
import type { LibraryEntry, LibrarySection } from "@/lib/library"

type Row = LibraryEntry & { href: string }

// THE LIBRARY IS A RECORD, SO IT READS NEWEST FIRST (founder, 2026-10-23:
// "i feel like they should be organised by date and colour code to
// categorise"). The page used to group by section and carry a "Most recent:"
// line above it — which was the design admitting that recency was the thing
// it could not show. Search already answers "where is the thing about X",
// which was most of what the sections were for.
//
// GROUPED BY MONTH, not a flat list: 39 rows in date order is the same
// undifferentiated scroll in a different sequence. The months run 21 / 9 /
// 2 / 6 / 1, so the headings land where the work actually happened.
//
// THE SECTION SURVIVES AS A MARK, because sorting by date loses it
// otherwise. Each row's icon wears its section's colour (tokens in
// globals.css, the admin's only departure from its single hue) and the
// section is printed as a word beside it. Colour is never the only signal:
// the shapes differ and the word is there, so nothing is lost to a
// colour-blind reader, and no legend is needed.
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

const MONTH = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

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
  const months = new Map<string, Row[]>()
  for (const e of shown) {
    const key = e.date.slice(0, 7)
    months.set(key, [...(months.get(key) ?? []), e])
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

      {[...months].map(([key, rows]) => {
        const heading = MONTH.format(new Date(`${key}-01T00:00:00Z`))
        return (
          <section key={key} aria-labelledby={`lib-${key}`}>
            <h2
              id={`lib-${key}`}
              className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase"
            >
              {heading}
            </h2>
            {/* border-t per item rather than an outer card: in two columns a
                card leaves a stray cell on an odd count, and a divide-y does
                not cross the gutter. */}
            <ul className="grid gap-x-10 lg:grid-cols-2">
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
                      <span className="mt-1 block text-[11px] tracking-wide text-muted-foreground uppercase">
                        {e.section}
                      </span>
                    </span>
                    {/* The month is the heading, so the row needs only the
                        day. */}
                    <span className="mt-1 shrink-0 text-xs text-muted-foreground tabular-nums">
                      {Number(e.date.slice(8, 10))}
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
