"use client"

import { Chip } from "@/components/ui/chip"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import type { Favourite } from "@favpoll/types"
import { hasFinePointer } from "@/lib/pointer"

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
  /** Adding is possible at all — open topic, and the organiser allows it. */
  canAdd: boolean
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
  canAdd,
}: PickerHeaderProps) {
  const placeholder = topicTitle
    ? `Search for your favourite ${topicTitle.toLowerCase()}…`
    : "Search options…"
  const hasSelections = draftIds.length > 0

  return (
    <InputGroup className="h-auto rounded-none border-0 has-[[data-slot=input-group-control]:focus-visible]:ring-0">
      <InputGroupAddon align="block-start" className="px-5 pt-4 pb-0">
        <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Your favourite
        </span>
      </InputGroupAddon>

      <div className="flex w-full flex-wrap items-center gap-2 px-5 py-3">
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
          autoFocus={hasFinePointer()}
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

      {/* A PERSISTENT hint, not one that waits to be discovered (2026-08-13).
          The Add button only appears once a search matches nothing, so the
          only people who found out they could add were the ones who already
          suspected it. A guest who scans the chips, does not see theirs and
          picks a near-miss never learns — which is exactly the guest the
          feature exists for.
          Suppressed when adding is impossible: a finite topic, or an
          organiser who has turned it off. Never advertise what cannot be
          done. */}
      {canAdd && !showCreate && (
        <InputGroupAddon align="block-end" className="px-5 pt-0 pb-3">
          <span className="text-xs text-muted-foreground">
            Is yours missing? Type it and click Add
          </span>
        </InputGroupAddon>
      )}
    </InputGroup>
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
          ? "No options yet — start typing to add one."
          : "No options available for this topic."}
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
