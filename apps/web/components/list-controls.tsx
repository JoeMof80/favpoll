"use client"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

// The shared list-page control bar: search, an optional segmented state
// filter, a sort select, and an "n of m" count. The record, the public
// favpolls page and my-favpolls all speak this grammar so organisers and
// guests only learn it once.

export type SegmentOption = { value: string; label: string }
export type SortOption = { value: string; label: string }

type Props = {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  searchLabel: string
  segments?: SegmentOption[]
  segmentValue?: string
  onSegmentChange?: (value: string) => void
  segmentsLabel?: string
  sortOptions?: SortOption[]
  sortValue?: string
  onSortChange?: (value: string) => void
  shown: number
  total: number
  className?: string
}

export function ListControls({
  search,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  segments,
  segmentValue,
  onSegmentChange,
  segmentsLabel = "Filter by status",
  sortOptions,
  sortValue,
  onSortChange,
  shown,
  total,
  className,
}: Props) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        className="max-w-xs bg-background"
        aria-label={searchLabel}
      />

      {segments && segments.length > 0 && (
        <>
          <span className="hidden text-[11px] font-medium tracking-widest text-muted-foreground uppercase md:inline">
            Filters
          </span>
          <div
            className="flex items-center rounded-lg border border-border bg-background p-0.5 shadow-xs"
            role="group"
            aria-label={segmentsLabel}
          >
            {segments.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSegmentChange?.(opt.value)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                  segmentValue === opt.value
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={segmentValue === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      {sortOptions && sortOptions.length > 0 && (
        <>
          <span className="hidden text-[11px] font-medium tracking-widest text-muted-foreground uppercase md:inline">
            Sort
          </span>
          <select
            value={sortValue}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            aria-label="Sort by"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </>
      )}

      <p className="ml-auto text-xs text-muted-foreground">
        {shown} of {total}
      </p>
    </div>
  )
}
