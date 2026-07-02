"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { InputGroupButton } from "@/components/ui/input-group"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  topicTitle: string
  existingItems: { id: string; label: string }[]
  addedItems: string[]
  onAdd: (label: string) => void
  onRemove: (label: string) => void
  isNewTopic?: boolean
}

export function TopicItemsDialog({
  open,
  onOpenChange,
  topicTitle,
  existingItems,
  addedItems,
  onAdd,
  onRemove,
  isNewTopic = false,
}: Props) {
  const [search, setSearch] = useState("")
  const trimmed = search.trim()
  const lower = trimmed.toLowerCase()

  const filteredExisting = trimmed
    ? existingItems.filter((i) => i.label.toLowerCase().includes(lower))
    : existingItems
  const filteredAdded = trimmed
    ? addedItems.filter((l) => l.toLowerCase().includes(lower))
    : addedItems

  const showAddRow =
    trimmed.length > 0 &&
    filteredExisting.length === 0 &&
    filteredAdded.length === 0

  function handleAdd() {
    if (!trimmed) return
    onAdd(trimmed)
    setSearch("")
  }

  function handleClose() {
    onOpenChange(false)
    setSearch("")
  }

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={(v) => {
        if (!v) setSearch("")
        onOpenChange(v)
      }}
      title={topicTitle}
      header={
        <div className="flex items-center gap-2">
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                if (showAddRow) handleAdd()
              }
            }}
            placeholder={`Search or add ${topicTitle.toLowerCase()} options…`}
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/50"
          />
          {showAddRow && (
            <InputGroupButton onClick={handleAdd}>Add</InputGroupButton>
          )}
        </div>
      }
      hideCloseButton
      footer={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button type="button" className="flex-1" onClick={handleClose}>
            Done
          </Button>
        </div>
      }
    >
      <div>
        <div className="space-y-4 px-5 py-4">
          {/* Added by you */}
          {(trimmed ? filteredAdded : addedItems).length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-medium tracking-widest text-primary uppercase">
                Added by you
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(trimmed ? filteredAdded : addedItems).map((label) => (
                  <Chip
                    key={label}
                    size="lg"
                    onRemove={() => onRemove(label)}
                    removeLabel={`Remove ${label}`}
                  >
                    {label}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Existing items — canonical topics only */}
          {!isNewTopic &&
            (trimmed ? filteredExisting : existingItems).length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
                  Existing options
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(trimmed ? filteredExisting : existingItems).map((item) => (
                    <Chip key={item.id} size="lg" readOnly>
                      {item.label}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

          {/* Empty state */}
          {!showAddRow &&
            addedItems.length === 0 &&
            existingItems.length === 0 &&
            (isNewTopic ? (
              <p className="py-2 text-sm text-muted-foreground">
                Start typing to add options.
              </p>
            ) : (
              <p className="py-2 text-sm text-muted-foreground">
                No options available for this topic.
              </p>
            ))}
        </div>
      </div>
    </ResponsiveOverlay>
  )
}
