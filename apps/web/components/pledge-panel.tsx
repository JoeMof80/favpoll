"use client"

import { useEffect, useState } from "react"
import { Chip } from "@/components/ui/chip"
import { InlineOptionInput } from "@/components/canvas/inline-option-input"
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
  const [addingCustom, setAddingCustom] = useState(false)
  const [customDraft, setCustomDraft] = useState("")
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

  const sortedItems = [...items].sort((a, b) => a.label.localeCompare(b.label))

  const visibleItems =
    isInfinite && lowerSearch
      ? sortedItems.filter((item) =>
          item.label.toLowerCase().includes(lowerSearch)
        )
      : sortedItems

  async function handleAdd() {
    if (!onAddItem || !customDraft.trim()) return
    setAddingItem(true)
    setAddError(null)
    try {
      await onAddItem(customDraft.trim())
      setCustomDraft("")
      setAddingCustom(false)
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
            <Chip
              key={item.id}
              selected={isSelected}
              onClick={() => toggleItem(item.id)}
            >
              {item.label}
              {isSelected && pct > 0 && (
                <span className="ml-1.5 tabular-nums opacity-80">
                  {pct}%{itemAmount ? ` · ${itemAmount}` : ""}
                </span>
              )}
            </Chip>
          )
        })}

        {isInfinite &&
          onAddItem &&
          (addingCustom ? (
            <div className="flex flex-col gap-1">
              <InlineOptionInput
                value={customDraft}
                onChange={(v) => {
                  setCustomDraft(v)
                  setAddError(null)
                }}
                onConfirm={handleAdd}
                onCancel={() => {
                  setCustomDraft("")
                  setAddError(null)
                  setAddingCustom(false)
                }}
              />
              {addError && (
                <p className="pl-3 text-xs text-destructive">{addError}</p>
              )}
            </div>
          ) : (
            <Chip
              onClick={() => setAddingCustom(true)}
              className="border-dashed"
            >
              Add custom option
            </Chip>
          ))}
      </div>

      {isInfinite && lowerSearch && visibleItems.length === 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          No matches for &ldquo;{search}&rdquo;
        </p>
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
