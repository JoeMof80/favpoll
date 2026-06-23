"use client"

import { Chip } from "@/components/ui/chip"
import type { Favourite } from "@favpoll/types"

type Props = {
  filteredItems: Favourite[]
  selectedIds: string[]
  showCreate: boolean
  search: string
  isInfinite?: boolean
  onAddItem?: (label: string) => Promise<void>
  onToggle: (id: string) => void
  addError: string | null
}

export function PledgePanelPickerItems({
  filteredItems,
  selectedIds,
  showCreate,
  search,
  isInfinite,
  onAddItem,
  onToggle,
  addError,
}: Props) {
  if (showCreate) {
    return addError ? (
      <p className="text-xs text-destructive">{addError}</p>
    ) : null
  }
  if (filteredItems.length === 0 && !search.toLowerCase().trim()) {
    return (
      <p className="py-3 text-center text-sm text-muted-foreground">
        {isInfinite && onAddItem
          ? "No items yet — start typing to add one."
          : "No items."}
      </p>
    )
  }
  if (filteredItems.length === 0) {
    return (
      <p className="py-3 text-center text-sm text-muted-foreground">
        No options found.
      </p>
    )
  }
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {filteredItems.map((item) => (
          <Chip
            key={item.id}
            size="lg"
            selected={selectedIds.includes(item.id)}
            onMouseDown={(e) => {
              e.preventDefault()
              onToggle(item.id)
            }}
          >
            {item.label}
          </Chip>
        ))}
      </div>
      {addError && <p className="mt-2 text-xs text-destructive">{addError}</p>}
    </>
  )
}
