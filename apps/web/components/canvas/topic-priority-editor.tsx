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

type UnprioritizedEntry =
  | { type: "canonical"; id: string; label: string }
  | { type: "custom"; index: number; label: string }

export function TopicPriorityEditor({
  poll,
  canonicalItems,
  onUpdatePoll,
}: Props) {
  const [addingCustom, setAddingCustom] = useState(false)
  const [customDraft, setCustomDraft] = useState("")
  const [customError, setCustomError] = useState("")

  const unprioritizedEntries: UnprioritizedEntry[] = [
    ...canonicalItems
      .filter((i) => !poll.prioritizedItemIds.includes(i.id))
      .map((i) => ({ type: "canonical" as const, id: i.id, label: i.label })),
    ...poll.curatedCustomLabels
      .filter((l) => !poll.prioritizedCustomLabels.includes(l))
      .map((label) => ({
        type: "custom" as const,
        index: poll.curatedCustomLabels.indexOf(label),
        label,
      })),
  ].sort((a, b) => a.label.localeCompare(b.label))

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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Click an option to prioritise it — prioritised options appear first.
          All options are always shown to guests.
        </p>
        {(poll.prioritizedItemIds.length > 0 ||
          poll.prioritizedCustomLabels.length > 0) && (
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() =>
              onUpdatePoll({
                prioritizedItemIds: [],
                prioritizedCustomLabels: [],
              })
            }
            className="h-auto shrink-0 p-0 text-xs text-muted-foreground"
          >
            Deprioritise all
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Prioritised canonical items */}
        {poll.prioritizedItemIds.map((id, i) => {
          const item = canonicalItems.find((m) => m.id === id)
          if (!item) return null
          return (
            <Chip
              key={item.id}
              selected
              onClick={() =>
                onUpdatePoll({
                  prioritizedItemIds: poll.prioritizedItemIds.filter(
                    (pid) => pid !== id
                  ),
                })
              }
            >
              <span className="mr-0.5 opacity-60">{i + 1}</span>
              {item.label}
            </Chip>
          )
        })}

        {/* Prioritised custom labels */}
        {poll.prioritizedCustomLabels.map((label, i) => (
          <RemovablePill
            key={`prio-custom-${i}`}
            label={label}
            onClick={() =>
              onUpdatePoll({
                prioritizedCustomLabels: poll.prioritizedCustomLabels.filter(
                  (l) => l !== label
                ),
              })
            }
            onRemove={() =>
              onUpdatePoll({
                curatedCustomLabels: poll.curatedCustomLabels.filter(
                  (l) => l !== label
                ),
                prioritizedCustomLabels: poll.prioritizedCustomLabels.filter(
                  (l) => l !== label
                ),
              })
            }
            selected
          />
        ))}

        {/* Unprioritised entries */}
        {unprioritizedEntries.map((entry) =>
          entry.type === "canonical" ? (
            <Chip
              key={entry.id}
              onClick={() =>
                onUpdatePoll({
                  prioritizedItemIds: [...poll.prioritizedItemIds, entry.id],
                })
              }
            >
              {entry.label}
            </Chip>
          ) : (
            <RemovablePill
              key={`custom-${entry.index}`}
              label={entry.label}
              onClick={() =>
                onUpdatePoll({
                  prioritizedCustomLabels: [
                    ...poll.prioritizedCustomLabels,
                    entry.label,
                  ],
                })
              }
              onRemove={() =>
                onUpdatePoll({
                  curatedCustomLabels: poll.curatedCustomLabels.filter(
                    (_, j) => j !== entry.index
                  ),
                  prioritizedCustomLabels: poll.prioritizedCustomLabels.filter(
                    (l) => l !== entry.label
                  ),
                })
              }
            />
          )
        )}

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
