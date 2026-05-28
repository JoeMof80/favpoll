"use client"

import { useEffect, useRef, useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import type { TopicItem } from "@favpoll/types"

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

export function PledgePanel({
  items,
  totalAmount,
  onSelectionsChange,
  isInfinite,
  onAddItem,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [popoverWidth, setPopoverWidth] = useState(0)
  const [search, setSearch] = useState("")
  const [addingItem, setAddingItem] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const allocations = computeAllocations(selectedIds, items)
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

  function openPopover() {
    if (anchorRef.current)
      setPopoverWidth(anchorRef.current.getBoundingClientRect().width)
    setOpen(true)
  }

  function toggleItem(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
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

  return (
    <fieldset>
      <legend className="sr-only">Choose your favourites</legend>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div
            ref={anchorRef}
            className="flex min-h-9 w-full cursor-text flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring"
            onClick={() => inputRef.current?.focus()}
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
                <Chip
                  key={id}
                  selected
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleItem(id)
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
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setAddError(null)
              }}
              onFocus={openPopover}
              onBlur={() =>
                setTimeout(() => {
                  setOpen(false)
                  setSearch("")
                }, 150)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              placeholder={selectedIds.length === 0 ? "Search options…" : ""}
              className="min-w-32 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          style={{ width: popoverWidth || undefined }}
          className="p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (anchorRef.current?.contains(e.target as Node)) {
              e.preventDefault()
            }
          }}
        >
          <div
            className="max-h-60 overflow-y-auto p-2"
            onMouseDown={(e) => e.preventDefault()}
          >
            {showCreate ? (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleAdd()
                }}
                disabled={addingItem}
                className="flex w-full items-center gap-1.5 rounded px-2.5 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
              >
                <span className="text-muted-foreground">Add</span>
                <span className="rounded-full bg-muted px-3 py-0.5 font-medium text-muted-foreground">
                  {search.trim()}
                </span>
              </button>
            ) : filteredItems.length === 0 ? (
              <p className="py-3 text-center text-sm text-muted-foreground">
                No options found.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {filteredItems.map((item) => (
                  <Chip
                    key={item.id}
                    selected={selectedIds.includes(item.id)}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      toggleItem(item.id)
                    }}
                  >
                    {item.label}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {addError && <p className="mt-1 text-xs text-destructive">{addError}</p>}
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
