"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { OrganizerCard } from "@/components/organizer-card"
import {
  type OrganizerCardFavpoll,
  type StatusFilter,
  type SortKey,
  filterAndSort,
} from "@/components/organizer-card/utils"

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
  favpolls: OrganizerCardFavpoll[]
}

export function OrganizerPageClient({ favpolls }: Props) {
  const [status, setStatus] = useState<StatusFilter>("all")
  const [sort, setSort] = useState<SortKey>("closing_soonest")

  const displayed = filterAndSort(favpolls, status, sort)

  return (
    <>
      {/* Filter + sort bar */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
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
      </div>

      {/* Grid */}
      {displayed.length > 0 ? (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {displayed.map((fp) => (
            <li key={fp.id} className="list-none">
              <OrganizerCard favpoll={fp} />
            </li>
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
