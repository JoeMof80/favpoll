"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FlowShell } from "@/components/event-flow/flow-shell"
import { LoveStep } from "@/components/event-flow/love-step"
import type { Category, TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "@/components/event-form-v2/schema"

type InitialParams = {
  occasionType: string
  isPlural: boolean
  topicId: string
  topicIsCustom: boolean
  topicTitle: string
}

type Props = {
  topics: TopicWithMeta[]
  categories: Category[]
  initialParams: InitialParams
}

export function LoveFlowPage({ topics, categories, initialParams }: Props) {
  const router = useRouter()

  function buildInitialTopics(): EventFormValues["topics"] {
    if (initialParams.topicIsCustom && initialParams.topicTitle) {
      return [
        {
          topicId: "",
          title: initialParams.topicTitle,
          isCustom: true,
          items: [],
          customLabels: [],
        },
      ]
    }
    if (initialParams.topicId) {
      const t = topics.find((t) => t.id === initialParams.topicId)
      if (t) {
        return [
          {
            topicId: t.id,
            title: t.title,
            isCustom: false,
            items: t.topic_items.map((i) => ({ id: i.id, label: i.label })),
            customLabels: [],
          },
        ]
      }
    }
    return []
  }

  const [selectedTopics, setSelectedTopics] =
    useState<EventFormValues["topics"]>(buildInitialTopics)

  const honouredParams = new URLSearchParams({
    occasionType: initialParams.occasionType,
    isPlural: String(initialParams.isPlural),
  })

  function handleNext() {
    const topic = selectedTopics[0]
    if (!topic) return

    const params = new URLSearchParams({
      occasionType: initialParams.occasionType,
      isPlural: String(initialParams.isPlural),
    })
    if (topic.isCustom) {
      params.set("topicIsCustom", "true")
      params.set("topicTitle", topic.title)
    } else {
      params.set("topicId", topic.topicId)
      params.set("topicTitle", topic.title)
    }
    router.push(`/events/new/charity?${params}`)
  }

  return (
    <FlowShell
      step={2}
      title="Choose a favpoll"
      backHref={`/events/new/honour?${honouredParams}`}
      nextDisabled={selectedTopics.length === 0}
      onNext={handleNext}
    >
      <LoveStep
        topics={topics}
        categories={categories}
        value={selectedTopics}
        onChange={setSelectedTopics}
      />
    </FlowShell>
  )
}
