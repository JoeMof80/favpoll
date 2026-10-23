"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Search } from "lucide-react"
import type { LibraryEntry, LibrarySection } from "@/lib/library"

type Row = LibraryEntry & { href: string }

// AN INDEX IS FOR SCANNING (founder, 2026-10-23: "its slightly hard to read
// organised like it is"). Three things were fighting it, and the registry's
// own numbers say so: 39 entries, summaries running to 108 characters median
// and 215 at the longest, and 35 of the 39 the same kind.
//
// - THE KIND LABEL IS GONE. It said "Note" thirty-five times out of
//   thirty-nine and distinguished nothing. What matters is only whether a
//   row LEAVES this page, so the four that do carry an arrow after the
//   title — the web's own convention — and the rest carry nothing. That
//   also removed a leading icon from every row, which was indenting the
//   titles away from the eye for no information.
// - THE SUMMARY IS CLAMPED TO ONE LINE. At 108 characters in a full-width
//   row it wrapped to two or three, so the page was a wall of grey prose
//   with the titles buried in it. Nothing is lost: /library/[slug] prints
//   the summary in full above the document, which is where you are going.
// - TWO COLUMNS from lg. The sections run 13 / 10 / 11 / 5, so one column
//   put a heading every twelve rows; paired up they read as landmarks.
//
// A table was considered and refused: this is browsed, not queried, and a
// sortable grid of filenames stops being a library.

export function LibraryIndex({
  sections,
}: {
  sections: { section: LibrarySection; entries: Row[] }[]
}) {
  const [q, setQ] = useState("")
  const needle = q.trim().toLowerCase()
  const matches = (e: Row) =>
    !needle ||
    e.title.toLowerCase().includes(needle) ||
    e.summary.toLowerCase().includes(needle) ||
    e.source.toLowerCase().includes(needle)

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
          placeholder="Search titles and summaries"
          aria-label="Search the library"
          className="w-full rounded-md border border-border bg-background py-2 pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>

      {sections.map(({ section, entries }) => {
        const shown = entries.filter(matches)
        if (shown.length === 0) return null
        return (
          <section key={section} aria-labelledby={`lib-${section}`}>
            <h2
              id={`lib-${section}`}
              className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase"
            >
              {section}
            </h2>
            {/* border-t on every item rather than an outer card: in two
                columns a bordered box leaves a stray cell when the count is
                odd, and a divide-y does not cross the gutter. */}
            <ul className="grid gap-x-10 lg:grid-cols-2">
              {shown.map((e) => {
                const external = e.kind !== "reference"
                const inner = (
                  <>
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
                    <span className="mt-0.5 shrink-0 text-xs text-muted-foreground tabular-nums">
                      {e.date}
                    </span>
                  </>
                )
                const cls =
                  "flex items-start gap-4 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/60"
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

      {needle &&
        sections.every((s) => s.entries.filter(matches).length === 0) && (
          <p className="text-sm text-muted-foreground">
            Nothing in the library matches “{q}”.
          </p>
        )}
    </div>
  )
}
