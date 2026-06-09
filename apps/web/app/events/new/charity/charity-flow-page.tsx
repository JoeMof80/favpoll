"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FlowShell } from "@/components/event-flow/flow-shell"
import { CharityStep } from "@/components/event-flow/charity-step"
import type { Charity } from "@favpoll/types"

type InitialParams = {
  occasionType: string
  isPlural: boolean
  topicId: string
  topicIsCustom: boolean
  topicTitle: string
  charityIds: string[]
}

type Props = {
  charities: Charity[]
  initialParams: InitialParams
}

export function CharityFlowPage({ charities, initialParams }: Props) {
  const router = useRouter()
  const [charityIds, setCharityIds] = useState<string[]>(
    initialParams.charityIds
  )

  const loveParams = new URLSearchParams({
    occasionType: initialParams.occasionType,
    isPlural: String(initialParams.isPlural),
  })
  if (initialParams.topicIsCustom) {
    loveParams.set("topicIsCustom", "true")
    loveParams.set("topicTitle", initialParams.topicTitle)
  } else {
    loveParams.set("topicId", initialParams.topicId)
    loveParams.set("topicTitle", initialParams.topicTitle)
  }

  function handleNext() {
    if (charityIds.length === 0) return

    const params = new URLSearchParams({
      occasionType: initialParams.occasionType,
      isPlural: String(initialParams.isPlural),
      charityIds: charityIds.join(","),
    })
    if (initialParams.topicIsCustom) {
      params.set("topicIsCustom", "true")
      params.set("topicTitle", initialParams.topicTitle)
    } else {
      params.set("topicId", initialParams.topicId)
      params.set("topicTitle", initialParams.topicTitle)
    }
    router.push(`/events/new/create?${params}`)
  }

  const charityCount = charityIds.length
  const charityDescription =
    charityCount === 0
      ? "Choose up to 3 charities."
      : charityCount === 1
        ? "1 of 3 selected."
        : `${charityCount} of 3 selected — proceeds split equally.`

  return (
    <FlowShell
      step={3}
      title="Choose a charity"
      description={charityDescription}
      backHref={`/events/new/love?${loveParams}`}
      nextDisabled={charityIds.length === 0}
      onNext={handleNext}
    >
      <CharityStep
        charities={charities}
        value={charityIds}
        onChange={setCharityIds}
      />
    </FlowShell>
  )
}
