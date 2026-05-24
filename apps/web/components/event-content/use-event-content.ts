import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { addGuestItem } from "@/app/events/[id]/actions"
import type { EventWithDetails, EventPollWithItems } from "@favpoll/types"

type UseEventContentOptions = {
  event: EventWithDetails
  pollWithItems: EventPollWithItems | null
  isClosed: boolean
  clerkUserId: string | null
}

export function useEventContent({
  event,
  pollWithItems,
  isClosed,
  clerkUserId,
}: UseEventContentOptions) {
  const router = useRouter()
  const [pledgeAmount, setPledgeAmount] = useState("")
  const [pollSelections, setPollSelections] = useState<Record<string, string[]>>({})
  const [pledgeConfirmed, setPledgeConfirmed] = useState(false)

  const handleSelectionsChange = useCallback(
    (pollId: string, selectedIds: string[]) =>
      setPollSelections((prev) => ({ ...prev, [pollId]: selectedIds })),
    []
  )

  const handlePledgeSuccess = useCallback(() => {
    setPledgeConfirmed(true)
    router.refresh()
  }, [router])

  // Returns an addItem handler for infinite, open polls — undefined otherwise
  function addItemHandler(poll: EventPollWithItems) {
    if (poll.topics.is_finite || isClosed || !clerkUserId) return undefined
    return async (label: string) => {
      await addGuestItem(poll.id, poll.topic_id, label)
      router.refresh()
    }
  }

  const showPledgeCard = !isClosed && !!pollWithItems

  return {
    pledgeAmount,
    setPledgeAmount,
    pollSelections,
    handleSelectionsChange,
    handlePledgeSuccess,
    pledgeConfirmed,
    addItemHandler,
    showPledgeCard,
  }
}
