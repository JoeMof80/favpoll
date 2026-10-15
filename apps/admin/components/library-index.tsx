"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, BookOpen, Search, Link2 } from "lucide-react";
import type { LibraryEntry, LibrarySection } from "@/lib/library";

type Row = LibraryEntry & { href: string };

const KIND_LABEL: Record<LibraryEntry["kind"], string> = {
  reference: "Note",
  artifact: "Claude artifact",
  doc: "Claude doc",
  external: "Link",
};

const KIND_ICON = {
  reference: FileText,
  artifact: ExternalLink,
  doc: BookOpen,
  external: Link2,
} as const;

export function LibraryIndex({
  sections,
}: {
  sections: { section: LibrarySection; entries: Row[] }[];
}) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const matches = (e: Row) =>
    !needle ||
    e.title.toLowerCase().includes(needle) ||
    e.summary.toLowerCase().includes(needle) ||
    e.source.toLowerCase().includes(needle);

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
        const shown = entries.filter(matches);
        if (shown.length === 0) return null;
        return (
          <section key={section} aria-labelledby={`lib-${section}`}>
            <h2
              id={`lib-${section}`}
              className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase"
            >
              {section}
            </h2>
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {shown.map((e) => {
                const Icon = KIND_ICON[e.kind];
                const external = e.kind !== "reference";
                const inner = (
                  <>
                    <Icon
                      size={16}
                      className="mt-0.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{e.title}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {e.summary}
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                      <span className="block">{KIND_LABEL[e.kind]}</span>
                      <span className="block">{e.date}</span>
                    </span>
                  </>
                );
                const cls =
                  "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/60";
                return (
                  <li key={e.source}>
                    {external ? (
                      <a
                        href={e.href}
                        target="_blank"
                        rel="noreferrer"
                        className={cls}
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link href={e.href} className={cls}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {needle &&
        sections.every((s) => s.entries.filter(matches).length === 0) && (
          <p className="text-sm text-muted-foreground">
            Nothing in the library matches “{q}”.
          </p>
        )}
    </div>
  );
}
