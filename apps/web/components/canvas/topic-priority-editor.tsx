"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { InlineOptionInput } from "./inline-option-input"
import { RemovablePill } from "./removable-pill"
import type { CanvasPoll, TopicItem } from "@favpoll/types"

type Props = {
  poll: CanvasPoll
  canonicalItems: TopicItem[]
  onUpdatePoll: (updates: Partial<CanvasPoll>) => void
}

export function TopicPriorityEditor({
  poll,
  canonicalItems,
  onUpdatePoll,
}: Props) {
  const [addingCustom, setAddingCustom] = useState(false)
  const [customDraft, setCustomDraft] = useState("")
  const [customError, setCustomError] = useState("")

  const sortedCanonical = [...canonicalItems].sort((a, b) =>
    a.label.localeCompare(b.label)
  )

  function saveCustom() {
    const label = customDraft.trim()
    if (!label) {
      setCustomDraft("")
      setAddingCustom(false)
      return
    }
    const lowerLabel = label.toLowerCase()
    const isDuplicate =
      canonicalItems.some((i) => i.label.toLowerCase() === lowerLabel) ||
      poll.curatedCustomLabels.some((l) => l.toLowerCase() === lowerLabel)
    if (isDuplicate) {
      setCustomError("This option already exists")
      return
    }
    onUpdatePoll({ curatedCustomLabels: [...poll.curatedCustomLabels, label] })
    setCustomDraft("")
    setCustomError("")
    setAddingCustom(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* Canonical items — unselectable preview pills */}
        {sortedCanonical.map((item) => (
          <Chip key={item.id}>{item.label}</Chip>
        ))}

        {/* Custom labels added by the organiser */}
        {poll.curatedCustomLabels.map((label, i) => (
          <RemovablePill
            key={`custom-${i}`}
            label={label}
            onRemove={() =>
              onUpdatePoll({
                curatedCustomLabels: poll.curatedCustomLabels.filter(
                  (_, j) => j !== i
                ),
              })
            }
          />
        ))}

        {/* Add custom option */}
        {addingCustom ? (
          <div className="flex flex-col gap-1">
            <InlineOptionInput
              value={customDraft}
              onChange={(v) => {
                setCustomDraft(v)
                setCustomError("")
              }}
              onConfirm={saveCustom}
              onCancel={() => {
                setCustomDraft("")
                setCustomError("")
                setAddingCustom(false)
              }}
            />
            {customError && (
              <p className="pl-3 text-xs text-destructive">{customError}</p>
            )}
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddingCustom(true)}
            className="h-auto rounded-full border-dashed px-3 py-1.5 text-xs text-muted-foreground"
          >
            Add custom option
          </Button>
        )}
      </div>

      {poll.curatedCustomLabels.length > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-500">
          Custom options will appear in this poll but must be included before
          they can contribute to the record.
        </p>
      )}
    </div>
  )
}
