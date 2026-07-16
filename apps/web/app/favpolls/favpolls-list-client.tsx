"use client"

import { useState } from "react"
import type { ComponentProps } from "react"
import { FavpollListCard } from "@/components/favpoll-list-card"
import { FavpollListCardEmpty } from "@/components/favpoll-list-card-empty"
import { ListControls } from "@/components/list-controls"
import type { CardResultItem } from "@/components/favpoll-list-card/use-favpoll-list-card-pledge"
import {
  type PublicStatusFilter,
  type PublicSortKey,
  filterAndSortPublic,
} from "./list-utils"

type CardFavpoll = ComponentProps<typeof FavpollListCard>["favpoll"]

const STATUS_OPTIONS: { value: PublicStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "closed", label: "Closed" },
]

const SORT_OPTIONS: { value: PublicSortKey; label: string }[] = [
  { value: "closing_soonest", label: "Closing soonest" },
  { value: "recently_created", label: "Recently created" },
  { value: "highest_raised", label: "Highest raised" },
]

type Props = {
  favpolls: CardFavpoll[]
  clerkUserId: string | null
  /** Pre-fetched rankings for polls the signed-in user already pledged on */
  initialResultsByPollId: Record<string, CardResultItem[]>
  initialStatus: PublicStatusFilter
}

export function FavpollsListClient({
  favpolls,
  clerkUserId,
  initialResultsByPollId,
  initialStatus,
}: Props) {
  const [status, setStatus] = useState<PublicStatusFilter>(initialStatus)
  const [sort, setSort] = useState<PublicSortKey>("closing_soonest")
  const [search, setSearch] = useState("")

  const displayed = filterAndSortPublic(favpolls, status, sort, search)

  return (
    <>
      <ListControls
        className="mb-6"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, topic or charity…"
        searchLabel="Search favpolls"
        segments={STATUS_OPTIONS}
        segmentValue={status}
        onSegmentChange={(v) => setStatus(v as PublicStatusFilter)}
        sortOptions={SORT_OPTIONS}
        sortValue={sort}
        onSortChange={(v) => setSort(v as PublicSortKey)}
        shown={displayed.length}
        total={favpolls.length}
      />

      {favpolls.length === 0 ? (
        <FavpollListCardEmpty />
      ) : displayed.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">
          No favpolls match this filter.
        </p>
      ) : (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          role="list"
        >
          {displayed.map((fp) => (
            <FavpollListCard
              key={fp.id}
              favpoll={fp}
              clerkUserId={clerkUserId}
              initialResults={
                fp.poll ? initialResultsByPollId[fp.poll.id] : undefined
              }
            />
          ))}
        </ul>
      )}
    </>
  )
}
