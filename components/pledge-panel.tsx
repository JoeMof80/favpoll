'use client'

import { useEffect, useState } from 'react'
import type { TopicItem } from '@/types'

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

function computeAllocations(selectedIds: string[], allItems: TopicItem[]): Allocation[] {
  if (selectedIds.length === 0) {
    return allItems.map((item) => ({ topicItemId: item.id, percentage: 0 }))
  }
  const equal = Math.floor(100 / selectedIds.length)
  const remainder = 100 - equal * selectedIds.length
  return allItems.map((item) => {
    const idx = selectedIds.indexOf(item.id)
    if (idx === -1) return { topicItemId: item.id, percentage: 0 }
    return { topicItemId: item.id, percentage: idx === 0 ? equal + remainder : equal }
  })
}

export function PledgePanel({ items, totalAmount, onSelectionsChange, isInfinite, onAddItem }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
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
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const lowerSearch = search.toLowerCase().trim()

  const visibleItems = isInfinite && lowerSearch
    ? items.filter((item) => item.label.toLowerCase().includes(lowerSearch))
    : items

  const exactMatch = lowerSearch
    ? items.some((item) => item.label.toLowerCase() === lowerSearch)
    : false

  const showAddOption = isInfinite && onAddItem && lowerSearch.length > 0 && !exactMatch

  async function handleAdd() {
    if (!onAddItem || !search.trim()) return
    setAddingItem(true)
    setAddError(null)
    try {
      await onAddItem(search.trim())
      setSearch('')
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add')
    } finally {
      setAddingItem(false)
    }
  }

  return (
    <fieldset>
      <legend className="mb-3 text-sm text-foreground">Choose your favourites</legend>

      {isInfinite && (
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setAddError(null) }}
          placeholder="Search options…"
          className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}

      <ul className="space-y-2" role="list">
        {visibleItems.map((item) => {
          const alloc = allocations.find((a) => a.topicItemId === item.id)
          const pct = alloc?.percentage ?? 0
          const isSelected = selectedIds.includes(item.id)
          const itemAmount =
            isAmountValid && pct > 0
              ? new Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: 'GBP',
                }).format(Math.round(((amount * pct) / 100) * 100) / 100)
              : null

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                  isSelected
                    ? 'border-primary/40 bg-secondary text-foreground'
                    : 'border-border bg-card text-foreground hover:bg-muted/50'
                }`}
                aria-pressed={isSelected}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-xs transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && '✓'}
                </span>
                <span className="flex-1 text-sm">{item.label}</span>
                {pct > 0 && (
                  <span className="text-sm tabular-nums text-muted-foreground">{pct}%</span>
                )}
                {itemAmount && (
                  <span className="text-sm tabular-nums text-primary">{itemAmount}</span>
                )}
              </button>
            </li>
          )
        })}

        {isInfinite && lowerSearch && visibleItems.length === 0 && (
          <li>
            <p className="py-2 text-sm text-muted-foreground">
              No matches for &ldquo;{search}&rdquo;
            </p>
          </li>
        )}
      </ul>

      {showAddOption && (
        <div className="mt-3 space-y-1.5">
          <button
            type="button"
            onClick={handleAdd}
            disabled={addingItem}
            className="flex w-full items-center gap-3 rounded-md border border-dashed border-border px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary/30 hover:text-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <span className="font-medium text-primary">+</span>
            {addingItem ? 'Adding…' : <>Add &ldquo;{search}&rdquo;</>}
          </button>
          {addError && <p className="text-xs text-destructive">{addError}</p>}
        </div>
      )}
    </fieldset>
  )
}

export function computePledgeAllocations(selectedIds: string[], allItems: TopicItem[], amount: number) {
  return computeAllocations(selectedIds, allItems)
    .filter((a) => a.percentage > 0)
    .map((a) => ({
      topicItemId: a.topicItemId,
      amount: Math.round(((amount * a.percentage) / 100) * 100) / 100,
    }))
}
