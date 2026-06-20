"use client"

import { Chip } from "@/components/ui/chip"
import { InputGroupButton } from "@/components/ui/input-group"
import type { Favourite } from "@favpoll/types"

type PickerHeaderProps = {
  search: string
  onSearchChange: (v: string) => void
  onAdd: () => void
  draftIds: string[]
  items: Favourite[]
  onDeselect: (id: string) => void
  topicTitle?: string
  showCreate: boolean
  addingItem: boolean
}

export function PickerHeader({
  search,
  onSearchChange,
  onAdd,
  draftIds,
  items,
  onDeselect,
  topicTitle,
  showCreate,
  addingItem,
}: PickerHeaderProps) {
  const placeholder = topicTitle
    ? `Search for your favourite ${topicTitle.toLowerCase()}…`
    : "Search options…"
  const hasSelections = draftIds.length > 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      {draftIds.map((id) => {
        const item = items.find((i) => i.id === id)
        if (!item) return null
        return (
          <Chip
            key={id}
            size="lg"
            selected
            onMouseDown={(e) => {
              e.preventDefault()
              onDeselect(id)
            }}
          >
            {item.label}
          </Chip>
        )
      })}
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            onAdd()
          }
          if (
            (e.key === "Backspace" || e.key === "Delete") &&
            search === "" &&
            draftIds.length > 0
          ) {
            e.preventDefault()
            onDeselect(draftIds[draftIds.length - 1])
          }
        }}
        autoFocus
        placeholder={hasSelections ? "" : placeholder}
        className={
          hasSelections
            ? "w-0 overflow-hidden bg-transparent text-base outline-none"
            : "min-w-30 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/50"
        }
      />
      {showCreate && (
        <InputGroupButton
          onMouseDown={(e) => {
            e.preventDefault()
            onAdd()
          }}
          disabled={addingItem}
          className="shrink-0"
        >
          Add
        </InputGroupButton>
      )}
    </div>
  )
}

type PickerItemsProps = {
  filteredItems: Favourite[]
  draftIds: string[]
  showCreate: boolean
  search: string
  isInfinite?: boolean
  hasAddItem: boolean
  onToggle: (id: string) => void
  addError: string | null
}

export function PickerItems({
  filteredItems,
  draftIds,
  showCreate,
  search,
  isInfinite,
  hasAddItem,
  onToggle,
  addError,
}: PickerItemsProps) {
  if (showCreate) {
    return addError ? (
      <p className="text-xs text-destructive">{addError}</p>
    ) : null
  }
  if (filteredItems.length === 0 && !search.toLowerCase().trim()) {
    return (
      <p className="py-3 text-center text-sm text-muted-foreground">
        {isInfinite && hasAddItem
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
            selected={draftIds.includes(item.id)}
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
