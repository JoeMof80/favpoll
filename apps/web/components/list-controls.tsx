"use client"

import { cn } from "@/lib/utils"
import {
  SegmentedControl,
  ToolbarLabel,
} from "@/components/ui/segmented-control"
import { ChevronDown } from "lucide-react"
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
          <ToolbarLabel>Status</ToolbarLabel>
          <SegmentedControl
            options={segments}
            value={segmentValue ?? segments[0].value}
            onChange={(v) => onSegmentChange?.(v)}
            label={segmentsLabel}
          />
        </>
      )}

      {sortOptions && sortOptions.length > 0 && (
        <>
          <ToolbarLabel>Sort</ToolbarLabel>
          <span className="relative inline-flex items-center">
            <select
              value={sortValue}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="appearance-none rounded-lg border border-border bg-background py-1.5 pr-8 pl-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              aria-label="Sort by"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </span>
        </>
      )}

      <p className="ml-auto text-xs text-muted-foreground">
        {shown} of {total}
      </p>
    </div>
  )
}
