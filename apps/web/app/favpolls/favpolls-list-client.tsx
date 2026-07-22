"use client"

import { useState } from "react"
import type { ComponentProps, ReactNode } from "react"
import { FavpollListCard } from "@/components/favpoll-list-card"
import { FavpollListCardEmpty } from "@/components/favpoll-list-card-empty"
import { ListControls } from "@/components/list-controls"
import type { CardResultItem } from "@/components/favpoll-list-card/use-favpoll-list-card-pledge"
import {
  type PublicStatusFilter,
  type PublicSortKey,
  filterAndSortPublic,
  groupPublic,
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
  /** Server-rendered occasion rail, mounted inside the sticky band */
  rail?: ReactNode
  favpolls: CardFavpoll[]
  clerkUserId: string | null
  /** Pre-fetched rankings for polls the signed-in user already pledged on */
  initialResultsByPollId: Record<string, CardResultItem[]>
  initialStatus: PublicStatusFilter
}

export function FavpollsListClient({
  rail,
  favpolls,
  clerkUserId,
  initialResultsByPollId,
  initialStatus,
}: Props) {
  const [status, setStatus] = useState<PublicStatusFilter>(initialStatus)
  const [sort, setSort] = useState<PublicSortKey>("closing_soonest")
  const [search, setSearch] = useState("")

  const displayed = filterAndSortPublic(favpolls, status, sort, search)
  const groups = groupPublic(displayed, sort)

  return (
    <>
      {/* One sticky band: occasion rail + list controls */}
      <div className="sticky top-14 z-30 border-b border-border bg-muted">
        <div className="mx-auto max-w-330 px-4 pt-3 pb-2.5">
          <ListControls
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
        </div>
        {rail}
      </div>

      <div className="mx-auto max-w-330 px-4 pt-8 pb-16">
        {favpolls.length === 0 ? (
          <FavpollListCardEmpty />
        ) : displayed.length === 0 ? (
          <p className="mt-16 text-center text-sm text-muted-foreground">
            No favpolls match this filter.
          </p>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group.label ?? "all"}>
                {group.label && (
                  <h2 className="mb-3 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
                    {group.label}
                  </h2>
                )}
                <ul
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                  role="list"
                  aria-label={group.label ?? undefined}
                >
                  {group.items.map((fp) => (
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
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
