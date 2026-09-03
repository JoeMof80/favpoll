"use client"

import { useState } from "react"
import { ToolbarBand } from "@/components/ui/toolbar-band"
import { ListControls } from "@/components/list-controls"
// Candidate A (2026-09-02): the console row replaced the accordion;
// the old OrganizerRow was deleted 2026-09-03 once the manage hub
// shipped as the one door
// and one git checkout away for comparison.
import { ConsoleRow } from "@/components/organizer-row/console-row"
import {
  type OrganizerFavpoll,
  type StatusFilter,
  type SortKey,
  filterAndSort,
} from "@/components/organizer-row/utils"

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Live" },
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
      {/* The list-page sticky band — controls only; no rail here */}
      <ToolbarBand>
        <ListControls
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name or topic…"
          searchLabel="Search your favpolls"
          segments={STATUS_OPTIONS}
          segmentValue={status}
          onSegmentChange={(v) => setStatus(v as StatusFilter)}
          sortOptions={SORT_OPTIONS}
          sortValue={sort}
          onSortChange={(v) => setSort(v as SortKey)}
          shown={displayed.length}
          total={favpolls.length}
        />
      </ToolbarBand>

      <div className="mx-auto max-w-330 px-4 pt-8 pb-16">
        {/* Row list */}
        {displayed.length > 0 ? (
          <ul
            // overflow-hidden: the row-header hover fill would otherwise poke
            // square corners past the rounded frame on the first/last rows
            className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background"
            role="list"
          >
            {displayed.map((fp) => (
              <ConsoleRow key={fp.id} favpoll={fp} />
            ))}
          </ul>
        ) : (
          <p className="mt-16 text-center text-sm text-muted-foreground">
            No favpolls match this filter.
          </p>
        )}
      </div>
    </>
  )
}
