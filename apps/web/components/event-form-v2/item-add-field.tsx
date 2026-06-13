"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import {
  CHIP_IN_INPUT,
  CHIP_IN_INPUT_SIZE,
  CHIP_IN_INPUT_TEXT,
  type PickerSize,
} from "./constants"

export function ItemAddField({
  canonicalItems,
  customLabels,
  topicTitle,
  isFinite = false,
  disabled = false,
  onAdd,
  onRemove,
  size = "md",
}: {
  canonicalItems: { id: string; label: string }[]
  customLabels: string[]
  topicTitle: string
  isFinite?: boolean
  disabled?: boolean
  onAdd: (label: string) => void
  onRemove: (label: string) => void
  size?: PickerSize
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const trimmed = search.trim()
  const lowerTrimmed = trimmed.toLowerCase()

  // Merge custom labels + canonical items, sorted alphabetically
  const allItems = [
    ...canonicalItems.map((i) => ({ ...i, isCustom: false as const })),
    ...customLabels.map((label) => ({
      id: `__custom__${label}`,
      label,
      isCustom: true as const,
    })),
  ].sort((a, b) => a.label.localeCompare(b.label))

  const filteredItems = trimmed
    ? allItems.filter((i) => i.label.toLowerCase().includes(lowerTrimmed))
    : allItems

  const showCreate =
    !isFinite && trimmed.length > 0 && filteredItems.length === 0
  const showEmpty = allItems.length === 0 && !trimmed

  const placeholder = isFinite
    ? `View items for ${topicTitle}…`
    : `Add ${topicTitle} items…`

  function handleCreate() {
    if (!trimmed) return
    onAdd(trimmed)
    setSearch("")
  }

  if (disabled) {
    return (
      <div
        className={cn(
          CHIP_IN_INPUT,
          CHIP_IN_INPUT_SIZE[size],
          "pointer-events-none bg-background/50"
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 text-muted-foreground/50",
            CHIP_IN_INPUT_TEXT[size]
          )}
        >
          Select a topic first…
        </span>
      </div>
    )
  }

  return (
    <div>
      {/* Trigger */}
      <div
        className={cn(
          CHIP_IN_INPUT,
          CHIP_IN_INPUT_SIZE[size],
          "cursor-pointer"
        )}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span
          className={cn(
            "min-w-0 flex-1 text-muted-foreground/50",
            CHIP_IN_INPUT_TEXT[size]
          )}
        >
          {placeholder}
        </span>
      </div>

      {/* Overlay */}
      <ResponsiveOverlay
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) setSearch("")
        }}
        title={isFinite ? `Items for ${topicTitle}` : `Add ${topicTitle} items`}
        footer={
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              setOpen(false)
              setSearch("")
            }}
          >
            Done
          </Button>
        }
      >
        <div className="space-y-3">
          {/* Search / add input — only shown for infinite topics */}
          {!isFinite && (
            <InputGroup className="h-auto rounded-md">
              <InputGroupInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleCreate()
                  }
                }}
                placeholder={`Add ${topicTitle} items…`}
                autoFocus
                className="h-auto px-3 py-2 md:text-base"
              />
              {showCreate && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton onClick={handleCreate}>
                    Add
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          )}

          {/* Items */}
          {showEmpty ? (
            <p className="py-3 text-center text-sm text-muted-foreground">
              {isFinite
                ? "No items."
                : "No items yet — start typing to add one."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {filteredItems.map((item) =>
                !isFinite && item.isCustom ? (
                  <Chip key={item.id} size="lg" className="gap-1">
                    {item.label}
                    <span
                      role="button"
                      tabIndex={-1}
                      onClick={() => onRemove(item.label)}
                      className="hover:text-white/70"
                      aria-label={`Remove ${item.label}`}
                    >
                      <X className="h-2 w-2" />
                    </span>
                  </Chip>
                ) : (
                  <Chip key={item.id} size="lg" readOnly>
                    {item.label}
                  </Chip>
                )
              )}
            </div>
          )}
        </div>
      </ResponsiveOverlay>
    </div>
  )
}
