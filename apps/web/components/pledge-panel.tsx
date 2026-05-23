"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
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
  const [search, setSearch] = useState("")
  const [addingItem, setAddingItem] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const allocations = computeAllocations(selectedIds, items)
  const amount = parseFloat(totalAmount)
  const isAmountValid = !isNaN(amount) && amount > 0

  useEffect(() => {
    onSelectionsChange(selectedIds)
  }, [selectedIds, onSelectionsChange])

  function toggleItem(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const lowerSearch = search.toLowerCase().trim()

  const visibleItems =
    isInfinite && lowerSearch
      ? items.filter((item) => item.label.toLowerCase().includes(lowerSearch))
      : items

  const exactMatch = lowerSearch
    ? items.some((item) => item.label.toLowerCase() === lowerSearch)
    : false

  const showAddOption =
    isInfinite && onAddItem && lowerSearch.length > 0 && !exactMatch

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

      {isInfinite && (
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setAddError(null)
          }}
          placeholder="Search options…"
          className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
        />
      )}

      <div className="flex flex-wrap gap-2">
        {visibleItems.map((item) => {
          const alloc = allocations.find((a) => a.topicItemId === item.id)
          const pct = alloc?.percentage ?? 0
          const isSelected = selectedIds.includes(item.id)
          const itemAmount =
            isAmountValid && pct > 0
              ? new Intl.NumberFormat("en-GB", {
                  style: "currency",
                  currency: "GBP",
                }).format(Math.round(((amount * pct) / 100) * 100) / 100)
              : null

          return (
            <Button
              key={item.id}
              type="button"
              size="sm"
              onClick={() => toggleItem(item.id)}
              aria-pressed={isSelected}
              className={`rounded-full px-3 py-1.5 text-xs ${
                isSelected
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
              {isSelected && pct > 0 && (
                <span className="ml-1.5 tabular-nums opacity-80">
                  {pct}%{itemAmount ? ` · ${itemAmount}` : ""}
                </span>
              )}
            </Button>
          )
        })}
      </div>

      {isInfinite && lowerSearch && visibleItems.length === 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          No matches for &ldquo;{search}&rdquo;
        </p>
      )}

      {showAddOption && (
        <div className="mt-3 space-y-1.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleAdd}
            disabled={addingItem}
            className="h-auto w-full justify-start gap-3 rounded-md border-dashed px-4 py-3 text-xs text-muted-foreground hover:border-primary/40 hover:bg-secondary/30 hover:text-foreground"
          >
            <span className="font-medium text-primary">+</span>
            {addingItem ? "Adding…" : <>Add &ldquo;{search}&rdquo;</>}
          </Button>
          {addError && <p className="text-xs text-destructive">{addError}</p>}
        </div>
      )}
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
