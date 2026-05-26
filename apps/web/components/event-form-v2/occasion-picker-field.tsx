"use client"

import { useRef, useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { OCCASION_LIST } from "@/lib/occasions"
import { cn } from "@/lib/utils"
import { CHIP_IN_INPUT, CHIP_IN_INPUT_SIZE, CHIP_IN_INPUT_TEXT, type PickerSize } from "./constants"

export function OccasionPickerField({
  value,
  onChange,
  onClear,
  size = "md",
}: {
  value: string
  onChange: (v: string) => void
  onClear: () => void
  size?: PickerSize
}) {
  const [open, setOpen] = useState(false)
  const [popoverWidth, setPopoverWidth] = useState(0)
  const [search, setSearch] = useState("")
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedLabel =
    OCCASION_LIST.find((o) => o.value === value)?.label ?? null

  const visible = OCCASION_LIST.filter(
    (o) => !search || o.label.toLowerCase().includes(search.toLowerCase())
  )

  function openDropdown() {
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

  function handleSelect(v: string) {
    onChange(v)
    setSearch("")
    setOpen(false)
    inputRef.current?.blur()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className={cn(CHIP_IN_INPUT, CHIP_IN_INPUT_SIZE[size])}
          onClick={() => inputRef.current?.focus()}
        >
          {selectedLabel && (
            <Chip
              selected
              size={size}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClear()
              }}
              aria-label={`Clear ${selectedLabel}`}
            >
              {selectedLabel}
            </Chip>
          )}
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              openDropdown()
            }}
            onFocus={openDropdown}
            onBlur={handleBlur}
            placeholder={selectedLabel ? "" : "Select an occasion…"}
            className={cn("min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/50", CHIP_IN_INPUT_TEXT[size])}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        style={{ width: popoverWidth || undefined }}
        className="p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-60 overflow-y-auto p-2" onMouseDown={(e) => e.preventDefault()}>
          {visible.length === 0 ? (
            <p className="py-3 text-center text-sm text-muted-foreground">
              No results.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {visible.map((o) => (
                <Chip
                  key={o.value}
                  selected={o.value === value}
                  size={size}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(o.value)
                  }}
                >
                  {o.label}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
