"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { GuestWallEntry } from "@/components/guest-wall"

// Live guest wall: starts from the server-rendered entries and refetches the
// wall endpoint whenever a pledge lands (same realtime trigger the display's
// raised-total and the ranking rows already use). Label gating is enforced by
// the endpoint, not here. Debounced so a burst of pledges causes one fetch.
export function useLiveWall(
  favpollId: string,
  initialEntries: GuestWallEntry[],
  options: { display?: boolean } = {}
): GuestWallEntry[] {
  const [entries, setEntries] = useState(initialEntries)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { display = false } = options

  // Server refresh (router.refresh) may stream fresher entries — adopt them.
  useEffect(() => {
    setEntries(initialEntries)
  }, [initialEntries])

  useEffect(() => {
    const supabase = createClient()

    const refetch = () => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/favpolls/${encodeURIComponent(favpollId)}/wall${
              display ? "?display=1" : ""
            }`
          )
          if (!res.ok) return
          const body = (await res.json()) as { entries?: GuestWallEntry[] }
          if (body.entries) setEntries(body.entries)
        } catch {
          // best effort — the wall catches up on the next event or refresh
        }
      }, 400)
    }

    const channel = supabase
      .channel(`wall-${favpollId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pledges" },
        refetch
      )
      .subscribe()

    return () => {
      if (timer.current) clearTimeout(timer.current)
      supabase.removeChannel(channel)
    }
  }, [favpollId, display])

  return entries
}
