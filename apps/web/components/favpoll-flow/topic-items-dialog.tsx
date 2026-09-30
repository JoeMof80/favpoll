"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { InputGroupButton } from "@/components/ui/input-group"
import { hasFinePointer } from "@/lib/pointer"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  topicTitle: string
  existingItems: { id: string; label: string }[]
  addedItems: string[]
  onAdd: (label: string) => void
  onRemove: (label: string) => void
  isNewTopic?: boolean
  /** The manage page (2026-09-30): an existing item's × HIDES it from
   *  the poll (the record keeps it with its pledges) — absent in the
   *  wizard, where existing items are the catalogue's and read-only. */
  onHide?: (id: string) => void
  /** Items hidden from the poll, each with a way back. */
  hiddenItems?: { id: string; label: string }[]
  onRestore?: (id: string) => void
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
  onHide,
  hiddenItems = [],
  onRestore,
}: Props) {
  const [search, setSearch] = useState("")
  const trimmed = search.trim()
  const lower = trimmed.toLowerCase()

  // The topic-as-question, matching the guest display (PollHeading) and the
  // landing demo — never the raw prop, which was showing "Select Items".
  const heading = `Favourite ${topicTitle}`

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
      title={heading}
      header={
        <div className="space-y-2">
          {/* Block-start EYEBROW carrying the ask (founder, 2026-09-17)
              — consistent with the dialog grammar everywhere else; the
              overlay title stays sr-only. */}
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {heading}
          </p>
          <div className="flex items-center gap-2">
            {/* Field-not-subtitle treatment (2026-09-16), shared across
                the picker overlays */}
            <Search
              className="size-4 shrink-0 text-muted-foreground/50"
              aria-hidden="true"
            />
            <input
              type="text"
              autoFocus={hasFinePointer()}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  if (showAddRow) handleAdd()
                }
              }}
              placeholder={
                isNewTopic
                  ? `Add ${topicTitle.toLowerCase()} items…`
                  : `Search or add ${topicTitle.toLowerCase()} items…`
              }
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/50"
            />
            {showAddRow && (
              <InputGroupButton variant="secondary" onClick={handleAdd}>
                Add
              </InputGroupButton>
            )}
          </div>
        </div>
      }
      hideCloseButton
      bodyClassName="p-0"
      fullscreenOnMobile
      mobileSave={{ label: "Done", onClick: handleClose }}
      footer={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-11 flex-1 md:text-base"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 md:text-base"
            onClick={handleClose}
          >
            Done
          </Button>
        </div>
      }
    >
      <div>
        <div className="space-y-4 px-5 pt-1 pb-4">
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
                  Existing items
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(trimmed ? filteredExisting : existingItems).map((item) =>
                    onHide ? (
                      <Chip
                        key={item.id}
                        size="lg"
                        onRemove={() => onHide(item.id)}
                        removeLabel={`Hide ${item.label} from the poll`}
                      >
                        {item.label}
                      </Chip>
                    ) : (
                      <Chip key={item.id} size="lg" readOnly>
                        {item.label}
                      </Chip>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Hidden from the poll — the manage page only */}
          {hiddenItems.length > 0 && !trimmed && (
            <div>
              <p className="mb-2 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
                Hidden from the poll
              </p>
              <div className="flex flex-wrap gap-1.5">
                {hiddenItems.map((item) => (
                  <Chip
                    key={item.id}
                    size="lg"
                    onClick={onRestore ? () => onRestore(item.id) : undefined}
                    className="opacity-60"
                    aria-label={`Put ${item.label} back in the poll`}
                  >
                    ↺ {item.label}
                  </Chip>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Kept on the record with their pledges. Tap one to put it back.
              </p>
            </div>
          )}

          {/* Empty state */}
          {!showAddRow &&
            addedItems.length === 0 &&
            existingItems.length === 0 &&
            (isNewTopic ? (
              <p className="py-2 text-sm text-muted-foreground">
                Start typing to add items.
              </p>
            ) : (
              <p className="py-2 text-sm text-muted-foreground">
                No items available for this topic.
              </p>
            ))}
        </div>
      </div>
    </ResponsiveOverlay>
  )
}
