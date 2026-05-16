"use client"

import { useState } from "react"
import { TopicPicker } from "./topic-picker"
import { CustomTopicOptions } from "./custom-topic-options"
import { TopicPriorityEditor } from "./topic-priority-editor"
import { PollHeading } from "@/components/poll-heading"
import type { Category, CanvasPoll, TopicWithMeta } from "@/types"
import type { OccasionPlaceholders } from "@/lib/occasions"

type Props = {
  poll: CanvasPoll
  topics: TopicWithMeta[]
  categories: Category[]
  occasion: string
  placeholders: OccasionPlaceholders
  onUpdatePoll: (updates: Partial<CanvasPoll>) => void
  onSelectTopic: (topic: TopicWithMeta) => void
  onRemoveCustomPoll?: (topicId: string) => void
}

export function PollEditor({
  poll,
  topics,
  categories,
  occasion,
  placeholders,
  onUpdatePoll,
  onSelectTopic,
  onRemoveCustomPoll,
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
  const masterItems = isCustomSaved
    ? (topic?.topic_items ?? [])
    : topic ? topic.topic_items.filter((i) => i.is_master) : []

  const topicPlaceholders = topic?.placeholders
  const pollPlaceholders = topicPlaceholders
    ? (topicPlaceholders[occasion] ?? topicPlaceholders["default"] ?? { framing: placeholders.framing, quote: placeholders.quote })
    : { framing: placeholders.framing, quote: placeholders.quote }

  return (
    <div className="space-y-4">
      {!poll.pickingTopic && (
        <div>
          <PollHeading
            mode="edit"
            topicTitle={topicTitle}
            hasTopicSelected={!!(poll.topicId || poll.topicIsCustom)}
            topicIsCustom={poll.topicIsCustom}
            framing={poll.framing}
            quote={poll.quote}
            placeholders={pollPlaceholders}
            onFramingChange={(v) => onUpdatePoll({ framing: v })}
            onQuoteChange={(v) => onUpdatePoll({ quote: v })}
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
          onRemoveCustomPoll={onRemoveCustomPoll}
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
          masterItems={masterItems}
          onUpdatePoll={onUpdatePoll}
        />
      )}
    </div>
  )
}
