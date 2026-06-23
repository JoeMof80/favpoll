"use client"

import { Chip } from "@/components/ui/chip"
import { InputGroupButton } from "@/components/ui/input-group"
import type { Favourite } from "@favpoll/types"

export type Allocation = {
  favouriteId: string
  percentage: number
}

type Props = {
  search: string
  onSearchChange: (v: string) => void
  onAdd: () => void
  selectedIds: string[]
  items: Favourite[]
  allocations: Allocation[]
  amount: number
  isAmountValid: boolean
  onDeselect: (id: string) => void
  topicTitle?: string
  showCreate: boolean
  addingItem: boolean
}

export function PledgePanelPickerHeader({
  search,
  onSearchChange,
  onAdd,
  selectedIds,
  items,
  allocations,
  amount,
  isAmountValid,
  onDeselect,
  topicTitle,
  showCreate,
  addingItem,
}: Props) {
  const placeholder = topicTitle
    ? `Search for your favourite ${topicTitle.toLowerCase()}…`
    : "Search options…"
  const hasSelections = selectedIds.length > 0
  return (
    <div className="flex flex-wrap items-center gap-2">
      {selectedIds.map((id) => {
        const item = items.find((i) => i.id === id)
        if (!item) return null
        const alloc = allocations.find((a) => a.favouriteId === id)
        const pct = alloc?.percentage ?? 0
        const itemAmount =
          isAmountValid && pct > 0
            ? new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: "GBP",
              }).format(Math.round(((amount * pct) / 100) * 100) / 100)
            : null
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
            {pct > 0 && (
              <span className="ml-1.5 tabular-nums opacity-80">
                {pct}%{itemAmount ? ` · ${itemAmount}` : ""}
              </span>
            )}
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
            selectedIds.length > 0
          ) {
            e.preventDefault()
            onDeselect(selectedIds[selectedIds.length - 1])
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
