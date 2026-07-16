"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { OrganizerRow } from "@/components/organizer-row"
import {
  type OrganizerFavpoll,
  type StatusFilter,
  type SortKey,
  filterAndSort,
} from "@/components/organizer-row/utils"

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "closing_soonest", label: "Closing soonest" },
  { value: "recently_created", label: "Recently created" },
  { value: "highest_raised", label: "Highest raised" },
]

type Props = {
  favpolls: OrganizerFavpoll[]
}

export function OrganizerPageClient({ favpolls }: Props) {
  const [status, setStatus] = useState<StatusFilter>("all")
  const [sort, setSort] = useState<SortKey>("closing_soonest")
  const [search, setSearch] = useState("")

  const displayed = filterAndSort(favpolls, status, sort, search)

  return (
    <>
      {/* Search + filter + sort bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or topic…"
          className="max-w-xs"
          aria-label="Search your favpolls"
        />
        <div
          className="flex items-center rounded-lg border border-border bg-background p-0.5"
          role="group"
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                status === opt.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={status === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <p className="ml-auto text-xs text-muted-foreground">
          {displayed.length} of {favpolls.length}
        </p>
      </div>

      {/* Row list */}
      {displayed.length > 0 ? (
        <ul
          className="divide-y divide-border rounded-xl border border-border bg-background"
          role="list"
        >
          {displayed.map((fp) => (
            <OrganizerRow key={fp.id} favpoll={fp} />
          ))}
        </ul>
      ) : (
        <p className="mt-16 text-center text-sm text-muted-foreground">
          No favpolls match this filter.
        </p>
      )}
    </>
  )
}
