"use client"

import { useRef, useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { OCCASION_LIST } from "@/lib/occasions"
import { cn } from "@/lib/utils"
import {
  CHIP_IN_INPUT,
  CHIP_IN_INPUT_SIZE,
  CHIP_IN_INPUT_TEXT,
  type PickerSize,
} from "./constants"

const SORTED_OCCASIONS = [...OCCASION_LIST].sort((a, b) =>
  a.label.localeCompare(b.label)
)

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
  const anchorRef = useRef<HTMLDivElement>(null)
  const wasOpenRef = useRef(false)

  const selectedLabel =
    OCCASION_LIST.find((o) => o.value === value)?.label ?? null

  function openDropdown() {
    if (anchorRef.current)
      setPopoverWidth(anchorRef.current.getBoundingClientRect().width)
    setOpen(true)
  }

  function handleSelect(v: string) {
    onChange(v)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className={cn(
            CHIP_IN_INPUT,
            CHIP_IN_INPUT_SIZE[size],
            "cursor-pointer select-none"
          )}
          onMouseDown={() => {
            wasOpenRef.current = open
          }}
          onClick={() => {
            if (!wasOpenRef.current) openDropdown()
          }}
        >
          {selectedLabel ? (
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
          ) : (
            <span
              className={cn(
                "min-w-0 flex-1 text-muted-foreground/50",
                CHIP_IN_INPUT_TEXT[size]
              )}
            >
              Select occasion
            </span>
          )}
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
          <div className="flex flex-wrap gap-1.5">
            {SORTED_OCCASIONS.map((o) => (
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
        </div>
      </PopoverContent>
    </Popover>
  )
}
