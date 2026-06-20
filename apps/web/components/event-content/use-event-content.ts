import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { addGuestItem, addOrganizerItem } from "@/app/favpolls/[id]/actions"
import type { FavpollWithDetails, FavpollPollWithItems } from "@favpoll/types"

type UseEventContentOptions = {
  event: FavpollWithDetails
  pollWithItems: FavpollPollWithItems | null
  isClosed: boolean
  hasPledged: boolean
  clerkUserId: string | null
}

export function useEventContent({
  event,
  pollWithItems,
  isClosed,
  hasPledged,
  clerkUserId,
}: UseEventContentOptions) {
  const router = useRouter()
  const [pledgeConfirmed, setPledgeConfirmed] = useState(false)
  const [pollView, setPollView] = useState<"pledge" | "results">(
    hasPledged || isClosed ? "results" : "pledge"
  )

  const handlePledgeSuccess = useCallback(() => {
    setPledgeConfirmed(true)
    router.refresh()
  }, [router])

  // Returns an addItem handler for infinite, open polls.
  // Organiser path calls addOrganizerItem; guest path calls addGuestItem.
  function addItemHandler(poll: FavpollPollWithItems) {
    if (poll.topics.is_finite || isClosed || !clerkUserId) return undefined
    const isOrganiser = clerkUserId === event.created_by
    if (isOrganiser) {
      return async (label: string) => {
        await addOrganizerItem(event.id, label)
        router.refresh()
      }
    }
    return async (label: string) => {
      await addGuestItem(poll.id, poll.topic_id, label)
      router.refresh()
    }
  }

  const showPledgeCard =
    !isClosed && !!pollWithItems && !pledgeConfirmed && pollView === "pledge"

  function handleViewChange(view: "pledge" | "results") {
    if (view === "pledge") setPledgeConfirmed(false)
    setPollView(view)
  }

  return {
    handlePledgeSuccess,
    pledgeConfirmed,
    addItemHandler,
    showPledgeCard,
    handleViewChange,
  }
}
