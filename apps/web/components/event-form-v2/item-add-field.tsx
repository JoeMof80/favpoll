"use client"

import { useRef, useState } from "react"
import { X } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
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
  const [popoverWidth, setPopoverWidth] = useState(0)
  const [search, setSearch] = useState("")
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
    ? `View ${topicTitle.toLowerCase()}…`
    : `Type to add a missing ${topicTitle.toLowerCase()}…`

  function openPopover() {
    if (anchorRef.current)
      setPopoverWidth(anchorRef.current.getBoundingClientRect().width)
    setOpen(true)
  }

  function handleBlur() {
    setTimeout(() => {
      setOpen(false)
      setSearch("")
    }, 150)
  }

  function handleCreate() {
    if (!trimmed) return
    onAdd(trimmed)
    setSearch("")
  }

  if (disabled) {
    return (
      <div className={cn(CHIP_IN_INPUT, CHIP_IN_INPUT_SIZE[size], "pointer-events-none opacity-40")}>
        <span className={cn("min-w-0 flex-1 text-muted-foreground/50", CHIP_IN_INPUT_TEXT[size])}>
          Select a topic first…
        </span>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className={cn(CHIP_IN_INPUT, CHIP_IN_INPUT_SIZE[size])}
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleCreate()
              }
            }}
            onFocus={openPopover}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              "min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/50",
              CHIP_IN_INPUT_TEXT[size]
            )}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        style={{ width: popoverWidth || undefined }}
        className="p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
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
                handleCreate()
              }}
              className="flex w-full items-center gap-1.5 rounded px-2.5 py-1.5 text-sm hover:bg-muted"
            >
              <span className="text-muted-foreground">Add</span>
              <span className="gap-1 rounded-full bg-muted px-3 py-0.5 font-medium text-muted-foreground">
                {trimmed}
              </span>
            </button>
          ) : showEmpty ? (
            <p className="py-3 text-center text-sm text-muted-foreground">
              {isFinite
                ? "No items."
                : "No items yet — start typing to add one."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {filteredItems.map((item) =>
                !isFinite && item.isCustom ? (
                  <Chip key={item.id} selected size={size} className="gap-1">
                    {item.label}
                    <span
                      role="button"
                      tabIndex={-1}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        onRemove(item.label)
                      }}
                      className="hover:text-white/70"
                      aria-label={`Remove ${item.label}`}
                    >
                      <X className="h-2 w-2" />
                    </span>
                  </Chip>
                ) : (
                  <Chip key={item.id} size={size} readOnly>
                    {item.label}
                  </Chip>
                )
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
