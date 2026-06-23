"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import type { Favourite } from "@favpoll/types"
import type { FavpollCardSize } from "@/components/favpoll-card/types"
import { Chip } from "@/components/ui/chip"
import { PledgePanelPickerHeader } from "./pledge-panel-picker-header"
import type { Allocation } from "./pledge-panel-picker-header"
import { PledgePanelPickerItems } from "./pledge-panel-picker-items"

type Props = {
  items: Favourite[]
  totalAmount: string
  onSelectionsChange: (selectedIds: string[]) => void
  isInfinite?: boolean
  onAddItem?: (label: string) => Promise<void>
  topicTitle?: string
  size?: FavpollCardSize
}

function computeAllocations(
  selectedIds: string[],
  allItems: Favourite[]
): Allocation[] {
  if (selectedIds.length === 0) {
    return allItems.map((item) => ({ favouriteId: item.id, percentage: 0 }))
  }
  const equal = Math.floor(100 / selectedIds.length)
  const remainder = 100 - equal * selectedIds.length
  return allItems.map((item) => {
    const idx = selectedIds.indexOf(item.id)
    if (idx === -1) return { favouriteId: item.id, percentage: 0 }
    return {
      favouriteId: item.id,
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
          variant="secondary"
          onClick={() => {
            handleOpen()
            setOpen(true)
          }}
          className={`w-full ${size === "lg" ? "text-base" : ""} ${className}`}
        >
          Pick favourites
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
    showCreate,
    addingItem,
  }

  const pickerItemsProps = {
    filteredItems,
    selectedIds: draftIds,
    showCreate,
    search,
    isInfinite,
    onAddItem,
    onToggle: toggleDraft,
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
        header={<PledgePanelPickerHeader {...pickerHeaderProps} />}
        footer={
          <Button
            type="button"
            className="w-full text-base"
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
        <PledgePanelPickerItems {...pickerItemsProps} />
      </ResponsiveOverlay>
    </fieldset>
  )
}

export function computePledgeAllocations(
  selectedIds: string[],
  allItems: Favourite[],
  amount: number
) {
  return computeAllocations(selectedIds, allItems)
    .filter((a) => a.percentage > 0)
    .map((a) => ({
      favouriteId: a.favouriteId,
      amount: Math.round(((amount * a.percentage) / 100) * 100) / 100,
    }))
}
