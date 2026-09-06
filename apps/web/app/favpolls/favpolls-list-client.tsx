"use client"

import { useLayoutEffect, useState } from "react"
import { ToolbarBand } from "@/components/ui/toolbar-band"
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
  // TEMPORARY instrumentation v2 (founder's phone): PERSISTENT log in
  // sessionStorage so the story survives reloads. Arm once with
  // /favpolls?debug=return; sticky for the session.
  const [, forceRender] = useState(0)
  const debugOn =
    typeof window !== "undefined" &&
    (() => {
      try {
        if (window.location.search.includes("debug=return")) {
          sessionStorage.setItem("favpolls:debug", "1")
        }
        return sessionStorage.getItem("favpolls:debug") === "1"
      } catch {
        return false
      }
    })()
  function readLog(): string[] {
    try {
      return JSON.parse(sessionStorage.getItem("favpolls:debug-log") ?? "[]")
    } catch {
      return []
    }
  }

  // Restore-once, ELEMENT-anchored (founder, 2026-09-06; v3): the
  // favpoll page arms "favpolls:return" with its own href on mount
  // (FavpollSubheader) — no fragile outbound click detection. On the
  // list's next mount, scroll that card into view after two animation
  // frames — past the App Router's scroll reset, immune to layout
  // shifts. The key is consumed once; fresh arrivals keep the top.
  useLayoutEffect(() => {
    const dbg = (line: string) => {
      try {
        const log = JSON.parse(
          sessionStorage.getItem("favpolls:debug-log") ?? "[]"
        )
        log.push(`${new Date().toISOString().slice(11, 19)} LIST ${line}`)
        sessionStorage.setItem(
          "favpolls:debug-log",
          JSON.stringify(log.slice(-25))
        )
      } catch {}
      forceRender((n) => n + 1)
    }
    let href: string | null = null
    try {
      href = sessionStorage.getItem("favpolls:return")
      if (href) sessionStorage.removeItem("favpolls:return")
    } catch {
      // sessionStorage unavailable — the natural top is fine
    }
    dbg(`mount key=${href ?? "NONE"} y=${Math.round(window.scrollY)}`)
    if (!href) return
    let interrupted = false
    let listenersOn = false
    const stop = (e: Event) => {
      interrupted = true
      dbg(`interrupt ${e.type}`)
    }
    const opts = { passive: true } as const
    // Attach only AFTER the first centring attempt: a synthetic touch
    // during Safari's reload restoration must not pre-empt the scroll.
    const attach = () => {
      if (listenersOn) return
      listenersOn = true
      window.addEventListener("touchstart", stop, opts)
      window.addEventListener("wheel", stop, opts)
      window.addEventListener("keydown", stop)
    }
    const centre = () => {
      if (interrupted) return
      const li = document
        .querySelector(`a[href="${CSS.escape(href!)}"]`)
        ?.closest("li")
      if (!li) {
        dbg("li NOT FOUND")
        attach()
        return
      }
      const r = li.getBoundingClientRect()
      const target =
        window.scrollY + r.top - (window.innerHeight - r.height) / 2
      const before = Math.round(window.scrollY)
      if (Math.abs(window.scrollY - target) > 8) {
        window.scrollTo(0, Math.max(0, target))
        dbg(
          `centre y=${before}->${Math.round(target)} top=${Math.round(r.top)}`
        )
      } else {
        dbg(`ok y=${before} top=${Math.round(r.top)}`)
      }
      attach()
    }
    const raf = requestAnimationFrame(() => requestAnimationFrame(centre))
    const timers = [300, 800, 1500, 2500].map((ms) => setTimeout(centre, ms))
    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      window.removeEventListener("touchstart", stop)
      window.removeEventListener("wheel", stop)
      window.removeEventListener("keydown", stop)
    }
  }, [])

  const displayed = filterAndSortPublic(favpolls, status, sort, search)
  const groups = groupPublic(displayed, sort)

  return (
    <>
      {debugOn && (
        <div className="fixed bottom-2 left-2 z-50 max-w-[95vw] rounded bg-black/85 p-2 font-mono text-[10px] leading-tight text-green-300">
          {readLog().map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
      {/* One sticky band: occasion rail + list controls */}
      <ToolbarBand below={rail}>
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
      </ToolbarBand>

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
