"use client"

import { useRef, useState } from "react"
import { Check } from "lucide-react"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Chip } from "@/components/ui/chip"

export type PickerItem = {
  id: string
  label: string
  disabled?: boolean
}

type Props = {
  items: PickerItem[]
  selectedIds: string[]
  onToggle: (id: string) => void
  placeholder?: string
  /**
   * Read-only display value shown in the input when not searching.
   * If omitted, the input is used as a search field (value = searchValue).
   */
  displayValue?: string | null
  /** Provide to make the input a live search filter. */
  searchValue?: string
  onSearchChange?: (v: string) => void
  /** Close popover immediately after a selection. Default: false. */
  closeOnSelect?: boolean
  popoverLabel?: string
  inputClassName?: string
  disabled?: boolean
}

export function PickerField({
  items,
  selectedIds,
  onToggle,
  placeholder = "Select…",
  displayValue,
  searchValue,
  onSearchChange,
  closeOnSelect = false,
  popoverLabel,
  inputClassName,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [popoverWidth, setPopoverWidth] = useState(0)
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isSearchable = onSearchChange !== undefined

  const visibleItems =
    isSearchable && searchValue
      ? items.filter((i) =>
          i.label.toLowerCase().includes(searchValue.toLowerCase())
        )
      : items

  function openDropdown() {
    if (anchorRef.current) {
      setPopoverWidth(anchorRef.current.getBoundingClientRect().width)
    }
    setOpen(true)
  }

  function handleBlur() {
    // Delay so onMouseDown inside the popover fires before blur closes it
    setTimeout(() => {
      setOpen(false)
      if (isSearchable) onSearchChange?.("")
    }, 150)
  }

  function handleToggle(id: string) {
    onToggle(id)
    if (isSearchable) onSearchChange?.("")
    if (closeOnSelect) {
      setOpen(false)
      inputRef.current?.blur()
    } else {
      inputRef.current?.focus()
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div ref={anchorRef}>
          <input
            ref={inputRef}
            type="text"
            readOnly={!isSearchable}
            value={isSearchable ? (searchValue ?? "") : (displayValue ?? "")}
            placeholder={placeholder}
            disabled={disabled}
            onChange={
              isSearchable
                ? (e) => {
                    onSearchChange?.(e.target.value)
                    openDropdown()
                  }
                : undefined
            }
            onFocus={openDropdown}
            onBlur={handleBlur}
            className={
              inputClassName ??
              "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            }
          />
        </div>
      </PopoverAnchor>

      <PopoverContent
        style={{ width: popoverWidth || undefined }}
        className="p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-60 overflow-y-auto p-2">
          {visibleItems.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No results.
            </p>
          ) : (
            <div
              role="radiogroup"
              aria-label={popoverLabel}
              className="flex flex-wrap gap-1.5"
            >
              {visibleItems.map((item) => {
                const isSelected = selectedIds.includes(item.id)
                return (
                  <Chip
                    key={item.id}
                    selected={isSelected}
                    disabled={item.disabled}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleToggle(item.id)
                    }}
                  >
                    {isSelected && !closeOnSelect && (
                      <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
                    )}
                    {item.label}
                  </Chip>
                )
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
