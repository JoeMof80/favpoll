"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"

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
      footer={
        <div className="space-y-2">
          {isNewTopic && addedItems.length < 2 && (
            <p className="text-center text-xs text-muted-foreground">
              {addedItems.length === 0
                ? "Add at least two options."
                : "Add at least one more option."}
            </p>
          )}
          <Button type="button" className="w-full" onClick={handleClose}>
            Done
          </Button>
        </div>
      }
    >
      <div>
        {/* Sticky search + add input */}
        <div className="sticky top-0 z-10 border-b border-border bg-background px-5 py-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                if (showAddRow) handleAdd()
              }
            }}
            placeholder={`Search or add ${topicTitle.toLowerCase()} options…`}
            autoFocus
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-4 px-5 py-4">
          {/* Add row — shown when search text matches nothing */}
          {showAddRow && (
            <button
              type="button"
              onClick={handleAdd}
              className="flex w-full items-center gap-1.5 rounded px-2.5 py-1.5 text-sm hover:bg-muted"
            >
              <span className="text-muted-foreground">Add</span>
              <span className="rounded-full bg-muted px-3 py-0.5 font-medium text-muted-foreground">
                {trimmed}
              </span>
            </button>
          )}

          {/* Added by you */}
          {(trimmed ? filteredAdded : addedItems).length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-[#534AB7]">
                Added by you
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(trimmed ? filteredAdded : addedItems).map((label) => (
                  <Chip key={label} size="sm" className="gap-1">
                    {label}
                    <button
                      type="button"
                      onClick={() => onRemove(label)}
                      className="hover:text-white/70"
                      aria-label={`Remove ${label}`}
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Existing items — canonical topics only */}
          {!isNewTopic && (trimmed ? filteredExisting : existingItems).length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Existing options
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(trimmed ? filteredExisting : existingItems).map((item) => (
                  <Chip key={item.id} size="sm" readOnly>
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
