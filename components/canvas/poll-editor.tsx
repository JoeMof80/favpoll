"use client"

import { useState } from "react"
import { TopicPicker } from "./topic-picker"
import { CustomTopicOptions } from "./custom-topic-options"
import { TopicPriorityEditor } from "./topic-priority-editor"
import { PollHeading } from "@/components/poll-heading"
import type { Category, CanvasPoll, TopicWithMeta } from "@/types"
import type { OccasionPlaceholders } from "@/lib/occasions"
import { TOPIC_REVEAL_PLACEHOLDERS } from "@/lib/occasions"

type Props = {
  poll: CanvasPoll
  topics: TopicWithMeta[]
  categories: Category[]
  occasion: string
  placeholders: OccasionPlaceholders
  onUpdatePoll: (updates: Partial<CanvasPoll>) => void
  onSelectTopic: (topic: TopicWithMeta) => void
}

export function PollEditor({
  poll,
  topics,
  categories,
  occasion,
  placeholders,
  onUpdatePoll,
  onSelectTopic,
}: Props) {
  const [topicCategory, setTopicCategory] = useState<string | null>(null)
  const [topicFinite, setTopicFinite] = useState<"finite" | "infinite" | "custom" | null>(
    null
  )
  const [topicSearch, setTopicSearch] = useState("")

  const topic = topics.find((t) => t.id === poll.topicId)
  const isInfinite = topic && !topic.is_finite
  const isCustomSaved = topic?.is_active === false
  const topicTitle = poll.topicIsCustom
    ? poll.customTopicTitle
    : (topic?.title ?? "")
  const canonicalItems = isCustomSaved
    ? (topic?.topic_items ?? [])
    : topic ? topic.topic_items.filter((i) => i.is_canonical) : []

  const topicPlaceholders = topic?.placeholders
  const personFirstName = placeholders.name.split(" ")[0]
  const substituteNames = (s: string) => s.replace(/\{name\}/g, personFirstName)
  const topicReveal = TOPIC_REVEAL_PLACEHOLDERS[topicTitle]
  const topicRevealSubstituted = topicReveal
    ? { reveal: substituteNames(topicReveal.reveal) }
    : null
  const occasionFallback = { reveal: placeholders.reveal }
  const pollPlaceholders = topicPlaceholders
    ? (topicPlaceholders[occasion] ?? topicPlaceholders["default"] ?? topicRevealSubstituted ?? occasionFallback)
    : (topicRevealSubstituted ?? occasionFallback)

  return (
    <div className="space-y-4">
      {!poll.pickingTopic && (
        <div>
          <PollHeading
            mode="edit"
            topicTitle={topicTitle}
            hasTopicSelected={!!(poll.topicId || poll.topicIsCustom)}
            topicIsCustom={poll.topicIsCustom}
            reveal={poll.reveal}
            placeholders={pollPlaceholders}
            onRevealChange={(v) => onUpdatePoll({ reveal: v })}
            onTopicTitleChange={(v) => onUpdatePoll({ customTopicTitle: v })}
            onChangeTopic={() =>
              onUpdatePoll({
                topicId: "",
                topicIsCustom: false,
                prioritizedItemIds: [],
                prioritizedCustomLabels: [],
                curatedCustomLabels: [],
                pickingTopic: true,
              })
            }
          />
        </div>
      )}

      {poll.pickingTopic && (
        <TopicPicker
          poll={poll}
          topics={topics}
          categories={categories}
          topicCategory={topicCategory}
          topicFinite={topicFinite}
          topicSearch={topicSearch}
          onSelectTopic={(t) => {
            onSelectTopic(t)
            setTopicSearch("")
          }}
          onSetCustom={() =>
            onUpdatePoll({ topicIsCustom: true, topicId: "", pickingTopic: false })
          }
          onCancel={() => onUpdatePoll({ pickingTopic: false })}
          onTopicCategoryChange={(cat) => {
            setTopicFinite(null)
            setTopicCategory(cat)
          }}
          onTopicFiniteChange={(val) => {
            setTopicCategory(null)
            setTopicFinite(val)
          }}
          onTopicSearchChange={setTopicSearch}
        />
      )}

      {poll.topicIsCustom && !poll.pickingTopic && (
        <CustomTopicOptions
          items={poll.customTopicItems}
          onAdd={(label) =>
            onUpdatePoll({
              customTopicItems: [...poll.customTopicItems, label],
            })
          }
          onRemove={(index) =>
            onUpdatePoll({
              customTopicItems: poll.customTopicItems.filter(
                (_, j) => j !== index
              ),
            })
          }
        />
      )}

      {!poll.topicIsCustom && isInfinite && topic && !poll.pickingTopic && (
        <TopicPriorityEditor
          poll={poll}
          canonicalItems={canonicalItems}
          onUpdatePoll={onUpdatePoll}
        />
      )}
    </div>
  )
}
