"use client"

import { useEffect, useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Button } from "./ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import type { TopicItem } from "@favpoll/types"
import type { FavpollCardSize } from "@/components/favpoll-card/types"

type Allocation = {
  topicItemId: string
  percentage: number
}

type Props = {
  items: TopicItem[]
  totalAmount: string
  onSelectionsChange: (selectedIds: string[]) => void
  isInfinite?: boolean
  onAddItem?: (label: string) => Promise<void>
  topicTitle?: string
  size?: FavpollCardSize
}

function computeAllocations(
  selectedIds: string[],
  allItems: TopicItem[]
): Allocation[] {
  if (selectedIds.length === 0) {
    return allItems.map((item) => ({ topicItemId: item.id, percentage: 0 }))
  }
  const equal = Math.floor(100 / selectedIds.length)
  const remainder = 100 - equal * selectedIds.length
  return allItems.map((item) => {
    const idx = selectedIds.indexOf(item.id)
    if (idx === -1) return { topicItemId: item.id, percentage: 0 }
    return {
      topicItemId: item.id,
      percentage: idx === 0 ? equal + remainder : equal,
    }
  })
}

function PickerHeader({
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
}: {
  search: string
  onSearchChange: (v: string) => void
  onAdd: () => void
  selectedIds: string[]
  items: TopicItem[]
  allocations: Allocation[]
  amount: number
  isAmountValid: boolean
  onDeselect: (id: string) => void
  topicTitle?: string
}) {
  const placeholder = topicTitle
    ? `Search for your favourite ${topicTitle.toLowerCase()}…`
    : "Search options…"
  const hasSelections = selectedIds.length > 0
  return (
    <div className="flex flex-wrap items-center gap-2">
      {selectedIds.map((id) => {
        const item = items.find((i) => i.id === id)
        if (!item) return null
        const alloc = allocations.find((a) => a.topicItemId === id)
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
    </div>
  )
}

function PickerItems({
  filteredItems,
  selectedIds,
  showCreate,
  search,
  addingItem,
  isInfinite,
  onAddItem,
  onToggle,
  onAdd,
  addError,
}: {
  filteredItems: TopicItem[]
  selectedIds: string[]
  showCreate: boolean
  search: string
  addingItem: boolean
  isInfinite?: boolean
  onAddItem?: (label: string) => Promise<void>
  onToggle: (id: string) => void
  onAdd: () => void
  addError: string | null
}) {
  if (showCreate) {
    return (
      <>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            onAdd()
          }}
          disabled={addingItem}
          className="flex w-full items-center gap-1.5 rounded px-2.5 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
        >
          <span className="text-muted-foreground">Add</span>
          <span className="rounded-full bg-muted px-3 py-0.5 font-medium text-muted-foreground">
            {search.trim()}
          </span>
        </button>
        {addError && (
          <p className="mt-2 text-xs text-destructive">{addError}</p>
        )}
      </>
    )
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

export function PledgePanel({
  items,
  totalAmount,
  onSelectionsChange,
  isInfinite,
  onAddItem,
  topicTitle,
  size = "lg",
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [draftIds, setDraftIds] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [addingItem, setAddingItem] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const allocations = computeAllocations(selectedIds, items)
  const draftAllocations = computeAllocations(draftIds, items)
  const amount = parseFloat(totalAmount)
  const isAmountValid = !isNaN(amount) && amount > 0

  useEffect(() => {
    onSelectionsChange(selectedIds)
  }, [selectedIds, onSelectionsChange])

  const lowerSearch = search.toLowerCase().trim()
  const sortedItems = [...items].sort((a, b) => a.label.localeCompare(b.label))
  const filteredItems = lowerSearch
    ? sortedItems.filter((item) =>
        item.label.toLowerCase().includes(lowerSearch)
      )
    : sortedItems

  const showCreate = !!(
    isInfinite &&
    onAddItem &&
    lowerSearch &&
    filteredItems.length === 0
  )

  function toggleDraft(id: string) {
    setDraftIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleOpen() {
    setDraftIds(selectedIds)
  }

  function handleDone() {
    setSelectedIds(draftIds)
  }

  async function handleAdd() {
    if (!onAddItem || !search.trim()) return
    setAddingItem(true)
    setAddError(null)
    try {
      await onAddItem(search.trim())
      setSearch("")
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add")
    } finally {
      setAddingItem(false)
    }
  }

  function handleClose() {
    setSearch("")
    setAddError(null)
  }

  function renderTrigger(className: string) {
    const buttonSize = size === "lg" ? "default" : "sm"
    if (selectedIds.length === 0) {
      return (
        <Button
          type="button"
          size={buttonSize}
          onClick={() => {
            handleOpen()
            setOpen(true)
          }}
          className={`w-full ${size === "lg" ? "text-base" : ""} ${className}`}
        >
          Select favourites
        </Button>
      )
    }
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          handleOpen()
          setOpen(true)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleOpen()
            setOpen(true)
          }
        }}
        className={`flex w-full flex-wrap gap-1.5 ${className}`}
      >
        {selectedIds.map((id) => {
          const item = items.find((i) => i.id === id)
          if (!item) return null
          const alloc = allocations.find((a) => a.topicItemId === id)
          const pct = alloc?.percentage ?? 0
          const itemAmount =
            isAmountValid && pct > 0
              ? new Intl.NumberFormat("en-GB", {
                  style: "currency",
                  currency: "GBP",
                }).format(Math.round(((amount * pct) / 100) * 100) / 100)
              : null
          return (
            <Chip key={id} size="lg" selected className="max-w-full">
              <span className="truncate">{item.label}</span>
              {pct > 0 && (
                <span className="ml-1.5 shrink-0 tabular-nums opacity-80">
                  {pct}%{itemAmount ? ` · ${itemAmount}` : ""}
                </span>
              )}
            </Chip>
          )
        })}
      </div>
    )
  }

  const pickerHeaderProps = {
    search,
    onSearchChange: (v: string) => {
      setSearch(v)
      setAddError(null)
    },
    onAdd: handleAdd,
    selectedIds: draftIds,
    items,
    allocations: draftAllocations,
    amount,
    isAmountValid,
    onDeselect: toggleDraft,
    topicTitle,
  }

  const pickerItemsProps = {
    filteredItems,
    selectedIds: draftIds,
    showCreate,
    search,
    addingItem,
    isInfinite,
    onAddItem,
    onToggle: toggleDraft,
    onAdd: handleAdd,
    addError,
  }

  return (
    <fieldset>
      <legend className="sr-only">Choose your favourites</legend>
      {renderTrigger("md:hidden")}
      {renderTrigger("hidden md:flex")}
      <ResponsiveOverlay
        open={open}
        onOpenChange={(o) => {
          if (o) handleOpen()
          setOpen(o)
          if (!o) handleClose()
        }}
        title="Choose your favourites"
        header={<PickerHeader {...pickerHeaderProps} />}
        footer={
          <Button
            type="button"
            className="h-11 w-full text-base"
            onClick={() => {
              handleDone()
              setOpen(false)
            }}
          >
            Done
          </Button>
        }
        dialogContentClassName="flex-1 overflow-y-auto p-4"
      >
        <PickerItems {...pickerItemsProps} />
      </ResponsiveOverlay>
    </fieldset>
  )
}

export function computePledgeAllocations(
  selectedIds: string[],
  allItems: TopicItem[],
  amount: number
) {
  return computeAllocations(selectedIds, allItems)
    .filter((a) => a.percentage > 0)
    .map((a) => ({
      topicItemId: a.topicItemId,
      amount: Math.round(((amount * a.percentage) / 100) * 100) / 100,
    }))
}
