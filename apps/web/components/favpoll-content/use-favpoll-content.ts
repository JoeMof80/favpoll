import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { addGuestItem, addOrganizerItem } from "@/app/favpolls/[id]/actions"
import type {
  FavpollWithDetails,
  FavpollPollWithItems,
  Favourite,
} from "@favpoll/types"

type UseFavpollContentOptions = {
  favpoll: FavpollWithDetails
  pollWithItems: FavpollPollWithItems | null
  isClosed: boolean
  clerkUserId: string | null
  entitled: boolean
}

export function useFavpollContent({
  favpoll,
  pollWithItems,
  isClosed,
  clerkUserId,
  entitled,
}: UseFavpollContentOptions) {
  const router = useRouter()
  const [pledgeConfirmed, setPledgeConfirmed] = useState(false)
  const [localEntitled, setLocalEntitled] = useState(entitled)
  // undefined = fall back to server value; null/string = guest override
  const [localReveal, setLocalReveal] = useState<string | null | undefined>(
    undefined
  )
  const [localItems, setLocalItems] = useState<Favourite[] | undefined>(
    undefined
  )

  // Sync when server refresh brings entitled=true (signed-in users post-pledge)
  useEffect(() => {
    if (entitled && !localEntitled) setLocalEntitled(true)
  }, [entitled, localEntitled])

  const handlePledgeSuccess = useCallback(
    async (guestToken?: string) => {
      setPledgeConfirmed(true)
      if (clerkUserId) {
        // Signed-in: server refresh re-runs page with hasPledged=true → real data
        router.refresh()
      } else if (guestToken && pollWithItems?.id) {
        // Guest: fetch real reveal + items from gated endpoint
        try {
          const res = await fetch(
            `/api/polls/${encodeURIComponent(pollWithItems.id)}/reveal?guest_token=${encodeURIComponent(guestToken)}`
          )
          if (res.ok) {
            const data = await res.json()
            setLocalReveal(data.personal_reveal ?? null)
            setLocalItems(data.items ?? [])
          }
        } catch {
          // best effort — they've pledged, mark entitled regardless
        } finally {
          setLocalEntitled(true)
        }
      } else {
        setLocalEntitled(true)
      }
    },
    [router, clerkUserId, pollWithItems?.id]
  )

  function addItemHandler(poll: FavpollPollWithItems) {
    if (poll.topics.is_finite || isClosed || !clerkUserId) return undefined
    const isOrganiser = clerkUserId === favpoll.created_by
    if (isOrganiser) {
      return async (label: string) => {
        await addOrganizerItem(favpoll.id, label)
        router.refresh()
      }
    }
    return async (label: string) => {
      await addGuestItem(poll.id, poll.topic_id, label)
      router.refresh()
    }
  }

  const showPledgeCard =
    !isClosed && !!pollWithItems && !pledgeConfirmed && !localEntitled

  // Must be stable (useCallback + [] deps) — usePollSection's effects include
  // onViewChange in their deps and have cleanup that cancels timeouts; an
  // unstable reference causes re-fires that cancel the showRankings timer.
  const handleViewChange = useCallback((view: "pledge" | "results") => {
    if (view === "pledge") setPledgeConfirmed(false)
  }, [])

  // Effective reveal: guest override takes precedence; signed-in gets it from pollWithItems after refresh
  const effectiveReveal =
    localReveal !== undefined
      ? localReveal
      : (pollWithItems?.personal_reveal ?? null)

  // Effective items: guest override takes precedence; signed-in gets real values after refresh
  const effectiveItems =
    localItems !== undefined
      ? localItems
      : (pollWithItems?.topics.favourites ?? [])

  return {
    handlePledgeSuccess,
    pledgeConfirmed,
    addItemHandler,
    showPledgeCard,
    handleViewChange,
    localEntitled,
    effectiveReveal,
    effectiveItems,
  }
}
