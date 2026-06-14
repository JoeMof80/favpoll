"use client"

import { useState } from "react"
import { X } from "lucide-react"
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
      footer={
        <Button type="button" className="w-full" onClick={handleClose}>
          Done
        </Button>
      }
    >
      <div>
        <div className="space-y-4 px-5 py-4">
          {/* Added by you */}
          {(trimmed ? filteredAdded : addedItems).length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-medium tracking-widest text-[#534AB7] uppercase">
                Added by you
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(trimmed ? filteredAdded : addedItems).map((label) => (
                  <div
                    key={label}
                    className="inline-flex h-7 items-center gap-1 rounded-full border border-[#534AB7] bg-[#534AB7] px-4 text-sm font-medium text-white"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => onRemove(label)}
                      className="hover:text-white/70"
                      aria-label={`Remove ${label}`}
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </div>
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
            (isNewTopic || existingItems.length === 0) && (
              <p className="py-2 text-sm text-muted-foreground">
                Start typing to add options.
              </p>
            )}
        </div>
      </div>
    </ResponsiveOverlay>
  )
}
